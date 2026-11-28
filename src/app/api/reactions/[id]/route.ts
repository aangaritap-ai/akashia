import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { apiText } from "@/lib/api-locale";
import { readyAccount } from "@/lib/account-ready";
import { findVisiblePost, setReaction } from "@/lib/posts-db";
import { REACTIONS } from "@/lib/posts";
import { allow } from "@/lib/rate-limit";

const schema = z.object({
  // Vacío para quitar la reacción.
  type: z.enum(REACTIONS.map((r) => r.type)).nullable(),
});

// Pone, cambia o quita la reacción de quien tiene la sesión.
export async function POST(
  req: Request,
  { params }: RouteContext<"/api/reactions/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }
  const userId = session.user.id;
  const me = await readyAccount(userId);
  if (!me) {
    return NextResponse.json({ error: await apiText("completeData") }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: await apiText("invalidData") }, { status: 400 });
  }
  if (!(await allow(`react:${userId}`, 60, 60))) {
    return NextResponse.json({ error: await apiText("tooManyReactions") }, { status: 429 });
  }

  const post = await findVisiblePost((await params).id, userId);
  if (!post) {
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }

  const reactions = await setReaction({
    post,
    userId,
    userName: me.name,
    type: parsed.data.type,
  });
  return NextResponse.json({ ok: true, reactions });
}
