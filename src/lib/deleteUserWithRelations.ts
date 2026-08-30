import { prisma } from "@/lib/prisma";

export async function deleteUserWithRelations(id: string) {
  try {
    await prisma.session.deleteMany({ where: { userId: id } });
    await prisma.account.deleteMany({ where: { userId: id } });
    await prisma.userProfile.deleteMany({ where: { userId: id } });
    const deletedUser = await prisma.user.delete({ where: { id } });
    return { success: true, data: deletedUser };
  } catch (error: any) {
    return { success: false, error: error.message || "Error deleting user" };
  }
}
