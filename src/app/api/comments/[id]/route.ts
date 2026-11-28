import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiText } from "@/lib/api-locale";
import { deleteComment } from "@/lib/posts-db";

// Lo borra quien lo escribió o el dueño de la publicación.
export async function DELETE(
  _req: Request,
  { params }: RouteContext<"/api/comments/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }
  if (!(await deleteComment((await params).id, session.user.id))) {
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
