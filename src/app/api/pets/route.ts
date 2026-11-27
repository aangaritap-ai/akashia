import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_PETS } from "@/lib/pets";
import { parsePet, syncPetDates } from "@/lib/pets-db";
import { apiText, callerLocale } from "@/lib/api-locale";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }
  const me = session.user.id;

  const parsed = parsePet(await req.json().catch(() => null));
  if ("error" in parsed) {
    return NextResponse.json({ error: await apiText(parsed.error) }, { status: 400 });
  }

  if ((await prisma.pet.count({ where: { ownerId: me } })) >= MAX_PETS) {
    return NextResponse.json(
      { error: await apiText("maxPets") },
      { status: 429 }
    );
  }

  const locale = await callerLocale();
  const pet = await prisma.$transaction(
    async (tx) => {
      const created = await tx.pet.create({
        data: { ...parsed.data, ownerId: me },
      });
      await syncPetDates(tx, created, locale);
      return created;
    },
    { timeout: 20_000, maxWait: 10_000 }
  );
  return NextResponse.json({ ok: true, id: pet.id });
}
