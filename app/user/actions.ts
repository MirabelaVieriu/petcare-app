"use server";

import { revalidatePath } from "next/cache";
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
