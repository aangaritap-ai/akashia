import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contactData, contactShape } from "@/lib/contact";
import { MAX_BIO, MAX_MOTTO } from "@/lib/profile";
import { isValidDay } from "@/lib/special-dates";
import { isStorageUrl } from "@/lib/uploads";
import { apiText, type ApiError } from "@/lib/api-locale";

// Texto opcional: vacío se guarda como "sin dato".
const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v));

const schema = z.object({
  ...contactShape,
  avatarUrl: z.string().url().nullable().optional(),
  coverUrl: z.string().url().refine(isStorageUrl).nullable().optional(),
  bio: text(MAX_BIO),
  motto: text(MAX_MOTTO),
  showCity: z.boolean().optional(),
  birthMonth: z.number().int().min(1).max(12).nullable().optional(),
  birthDay: z.number().int().min(1).max(31).nullable().optional(),
  shareBirthday: z.boolean().optional(),
});

const fail = async (error: ApiError) =>
  NextResponse.json({ error: await apiText(error) }, { status: 400 });

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const contact = parsed.error.issues.some(
      (issue) => String(issue.path[0]) in contactShape
    );
    return fail(contact ? "contactInvalid" : "invalidData");
  }
  const data = parsed.data;

  const current = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { avatarUrl: true, birthMonth: true, birthDay: true },
  });
  // La foto nueva debe estar en nuestro almacenamiento.
  if (
    data.avatarUrl &&
    data.avatarUrl !== current.avatarUrl &&
    !isStorageUrl(data.avatarUrl)
  ) {
    return fail("invalidData");
  }

  // El cumpleaños son dos datos que van juntos: ambos, ninguno o sin cambios.
  let birthday = {};
  if (data.birthMonth !== undefined || data.birthDay !== undefined) {
    const month = data.birthMonth ?? null;
    const day = data.birthDay ?? null;
    if (month === null && day === null) {
      birthday = {
        birthMonth: null,
        birthDay: null,
        shareBirthday: false,
        birthdayRemindedYear: null,
      };
    } else if (month === null || day === null || !isValidDay(month, day)) {
      return fail("checkBirthday");
    } else {
      const moved =
        month !== current.birthMonth || day !== current.birthDay;
      birthday = {
        birthMonth: month,
        birthDay: day,
        shareBirthday: data.shareBirthday,
        ...(moved ? { birthdayRemindedYear: null } : {}),
      };
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...contactData(data),
      avatarUrl: data.avatarUrl,
      coverUrl: data.coverUrl,
      bio: data.bio,
      motto: data.motto,
      showCity: data.showCity,
      ...birthday,
    },
    select: { id: true, name: true, avatarUrl: true },
  });

  return NextResponse.json({ ok: true, user });
}
