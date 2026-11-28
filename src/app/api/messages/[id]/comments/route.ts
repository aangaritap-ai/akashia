import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { apiText } from "@/lib/api-locale";
import { readyAccount } from "@/lib/account-ready";
import { addComment, findVisiblePost, listComments } from "@/lib/posts-db";
import { MAX_COMMENT } from "@/lib/posts";
import { allow } from "@/lib/rate-limit";

const schema = z.object({ text: z.string().trim().min(1).max(MAX_COMMENT) });

// Cualquiera que pueda ver la publicación puede leer sus comentarios.
export async function GET(
  _req: Request,
  { params }: RouteContext<"/api/messages/[id]/comments">
) {
  const viewerId = (await auth())?.user?.id ?? null;
  const post = await findVisiblePost((await params).id, viewerId);
  if (!post) {
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }
  return NextResponse.json({ comments: await listComments(post, viewerId) });
}

// Comentar requiere sesión.
export async function POST(
  req: Request,
  { params }: RouteContext<"/api/messages/[id]/comments">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }
  const userId = session.user.id;
  if (!(await readyAccount(userId))) {
    return NextResponse.json({ error: await apiText("completeData") }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: await apiText("commentInvalid") }, { status: 400 });
  }
  if (!(await allow(`comment:${userId}`, 20, 600))) {
    return NextResponse.json({ error: await apiText("tooManyComments") }, { status: 429 });
  }

  const post = await findVisiblePost((await params).id, userId);
  if (!post) {
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }

  const comment = await addComment({ post, userId, text: parsed.data.text });
  return NextResponse.json({ comment });
}
