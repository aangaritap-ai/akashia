import { NextResponse } from "next/server";
import { issueSignedToken, list } from "@vercel/blob";
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { auth } from "@/lib/auth";
import { MAX_MEDIA_BYTES, MEDIA_QUOTA_BYTES } from "@/lib/media";
import { allow } from "@/lib/rate-limit";
import { storageConfigured } from "@/lib/uploads";
import { apiText } from "@/lib/api-locale";
import { prisma } from "@/lib/prisma";
import {
  MAX_ACTIVE_VIDEOS,
  MAX_STORY_VIDEO_BYTES,
  STORY_VIDEO_TYPES,
} from "@/lib/story-video";

// Permisos para que el navegador suba directo al almacenamiento el audio o
// video de una cápsula, o el video de una historia. Cada permiso vale solo para
// un archivo, en la carpeta de quien lo pide, con tipo y tamaño limitados.

const TYPES = ["audio/*", "video/*"];

async function usedBytes(userId: string) {
  let total = 0;
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: `capsules/${userId}/`, cursor });
    total += page.blobs.reduce((sum, blob) => sum + blob.size, 0);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return total;
}

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      fail: NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 }),
    };
  }
  if (!storageConfigured()) {
    return {
      fail: NextResponse.json(
        { error: await apiText("fileStorageOff") },
        { status: 503 }
      ),
    };
  }
  return { userId: session.user.id };
}

async function videosLeft(userId: string) {
  const active = await prisma.story.count({
    where: {
      authorId: userId,
      videoUrl: { not: null },
      expiresAt: { gt: new Date() },
    },
  });
  return Math.max(0, MAX_ACTIVE_VIDEOS - active);
}

/** Cuánto le queda a quien pregunta: espacio de cápsulas o, con
 * `?para=historia`, videos de historia. */
export async function GET(req: Request) {
  const { userId, fail } = await requireUser();
  if (!userId) return fail;
  if (new URL(req.url).searchParams.get("para") === "historia") {
    return NextResponse.json({ videosLeft: await videosLeft(userId) });
  }
  const available = Math.max(0, MEDIA_QUOTA_BYTES - (await usedBytes(userId)));
  return NextResponse.json({ available });
}

export async function POST(req: Request) {
  const { userId, fail } = await requireUser();
  if (!userId) return fail;

  if (!(await allow(`upload:${userId}`, 20, 3600))) {
    return NextResponse.json(
      { error: await apiText("tooManyUploads") },
      { status: 429 }
    );
  }

  const body = (await req.json()) as HandleUploadPresignedBody;
  try {
    const result = await handleUploadPresigned({
      body,
      request: req,
      // No usamos el aviso de "subida terminada", pero la librería exige este
      // valor.
      webhookPublicKey: process.env.BLOB_WEBHOOK_PUBLIC_KEY || "sin-aviso",
      getSignedToken: async (pathname) => {
        const story = pathname.startsWith(`stories/${userId}/`);
        const folder = `${story ? "stories" : "capsules"}/${userId}/`;
        const name = pathname.slice(folder.length);
        if (
          !pathname.startsWith(folder) ||
          !/^[A-Za-z0-9._-]{1,80}$/.test(name) ||
          (story && !/\.(mp4|webm|mov)$/.test(name))
        ) {
          throw new Error("Ruta no permitida");
        }

        let maximumSizeInBytes = MAX_STORY_VIDEO_BYTES;
        if (story) {
          if ((await videosLeft(userId)) <= 0) throw new Error("Sin cupo");
        } else {
          const available = MEDIA_QUOTA_BYTES - (await usedBytes(userId));
          if (available <= 0) throw new Error("Sin espacio");
          maximumSizeInBytes = Math.min(MAX_MEDIA_BYTES, available);
        }

        const limits = {
          allowedContentTypes: story ? Object.keys(STORY_VIDEO_TYPES) : TYPES,
          maximumSizeInBytes,
          validUntil: Date.now() + 10 * 60 * 1000,
        };
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          ...limits,
        });
        return { token, urlOptions: { ...limits, addRandomSuffix: true } };
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error(
      "[Akashia] No se autorizó la subida:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: await apiText("uploadDenied") },
      { status: 400 }
    );
  }
}
