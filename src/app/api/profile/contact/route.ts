import { NextResponse } from "next/server";
import { needsAgeCheck } from "@/lib/age";
import { ageGate } from "@/lib/age-gate";
import { auth } from "@/lib/auth";
import { apiText } from "@/lib/api-locale";
import { contactData, contactSchema } from "@/lib/contact";
import { prisma } from "@/lib/prisma";

// Guarda los datos obligatorios de la propia cuenta.
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: await apiText("notAuthenticated") },
      { status: 401 }
    );
  }
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: await apiText("contactInvalid") },
      { status: 400 }
    );
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { createdAt: true, ageConfirmedAt: true },
  });
  if (!user) {
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }

  let ageConfirmedAt: Date | undefined;
  if (needsAgeCheck(user)) {
    const age = await ageGate(body);
    if (age !== "adult") {
      return NextResponse.json(
        { error: await apiText(age === "underage" ? "underage" : "birthInvalid") },
        { status: age === "underage" ? 403 : 400 }
      );
    }
    ageConfirmedAt = new Date();
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { ...contactData(parsed.data), ageConfirmedAt },
  });
  return NextResponse.json({ ok: true });
}
