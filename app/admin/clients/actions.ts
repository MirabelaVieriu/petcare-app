"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { OwnerAccessor } from "@/lib/accessors/OwnerAccessor";
import { PetAccessor } from "@/lib/accessors/PetAccessor";
import { parsePet, type FormState } from "@/lib/pets/PetForm";

export async function createPet(_prev: FormState, formData: FormData): Promise<FormState> {
    const admin = await requireAdmin();

    const userId = Number(formData.get("userId"));
    if (!Number.isInteger(userId) || userId <= 0) return { error: "Client invalid." };

    const parsed = parsePet(formData);
    if ("error" in parsed) return { error: parsed.error };

    const client = await OwnerAccessor.getDetail(admin.id, userId);
    if (!client) return { error: "Client inexistent sau fără acces." };

    await PetAccessor.create({ userId, ...parsed.data });

    revalidatePath(`/admin/clients/${userId}`);
    return { ok: true };
}

export async function deleteClient(userId: number) {
    const admin = await requireAdmin();

    const client = await OwnerAccessor.getDetail(admin.id, userId);
    if (!client) throw new Error("Client inexistent sau fără acces.");

    await prisma.user.delete({ where: { id: userId } });

    revalidatePath("/admin/clients");
    redirect("/admin/clients");
}

export async function deletePet(petId: number): Promise<{ error?: string }> {
    const admin = await requireAdmin();

    const pet = await prisma.pet.findFirst({
        where: { id: petId, user: { vetId: admin.id } },
        select: { id: true, userId: true },
    });
    if (!pet) return { error: "Animal inexistent sau fără acces." };

    await prisma.pet.delete({ where: { id: pet.id } });

    revalidatePath(`/admin/clients/${pet.userId}`);
    return {};
}
