import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFiles, filesOwnedBy } from "@/lib/own-files";
import { parsePet, syncPetDates } from "@/lib/pets-db";

// La mascota, solo si es de quien pide. Si no, responde como si no existiera.
async function ownPet(params: Promise<{ id: string }>) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      fail: NextResponse.json({ error: "No autenticado" }, { status: 401 }),
    };
  }
  const { id } = await params;
  const pet = await prisma.pet.findFirst({
    where: { id, ownerId: session.user.id },
  });
  if (!pet) {
    return {
      fail: NextResponse.json({ error: "No encontrado" }, { status: 404 }),
    };
  }
  return { pet };
}

export async function PATCH(
  req: Request,
  { params }: RouteContext<"/api/pets/[id]">
) {
  const { pet, fail } = await ownPet(params);
  if (!pet) return fail;

  const parsed = parsePet(await req.json().catch(() => null));
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  await prisma.$transaction(
    async (tx) => {
      const updated = await tx.pet.update({
        where: { id: pet.id },
        data: parsed.data,
      });
      await syncPetDates(tx, updated);
    },
    { timeout: 20_000, maxWait: 10_000 }
  );
  return NextResponse.json({ ok: true });
}

// Borra la mascota con sus mensajes y fechas (en cascada) y su foto.
export async function DELETE(
  _req: Request,
  { params }: RouteContext<"/api/pets/[id]">
) {
  const { pet, fail } = await ownPet(params);
  if (!pet) return fail;

  await prisma.pet.delete({ where: { id: pet.id } });
  await deleteFiles(filesOwnedBy(pet.ownerId, [pet.photoUrl]));
  return NextResponse.json({ ok: true });
}
