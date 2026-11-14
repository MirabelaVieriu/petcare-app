"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PetAccessor } from "@/lib/accessors/PetAccessor";
import { parsePet, type FormState } from "@/lib/pets/PetForm";
import { requireUser } from "@/lib/auth/guards";

export async function createMyPet(_prev: FormState, formData: FormData): Promise<FormState> {
    const user = await requireUser();

    const parsed = parsePet(formData);
    if ("error" in parsed) return { error: parsed.error };

    await PetAccessor.create({ userId: user.id, ...parsed.data });

    revalidatePath("/user");
    return { ok: true };
}

export async function deleteMyPet(petId: number): Promise<{ error?: string }> {
    const user = await requireUser();

    // Se șterge doar dacă animalul aparține utilizatorului din sesiune
    const res = await prisma.pet.deleteMany({ where: { id: petId, userId: user.id } });
    if (res.count === 0) return { error: "Animal inexistent sau fără acces." };

    revalidatePath("/user");
    return {};
}