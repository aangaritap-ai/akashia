import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { followersOf } from "@/lib/connections";
import { firstDeliveryDate } from "@/lib/special-dates";
import NewCapsuleForm from "@/components/capsules/NewCapsuleForm";

export default async function NewCapsulePage() {
  const session = await auth();
  const userId = session!.user.id;
  const [followers, guardianCount] = await Promise.all([
    followersOf(userId),
    prisma.guardian.count({ where: { ownerId: userId } }),
  ]);

  return (
    <NewCapsuleForm
      followers={followers}
      guardianCount={guardianCount}
      minDate={firstDeliveryDate()}
    />
  );
}
