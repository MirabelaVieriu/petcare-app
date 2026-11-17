import { prisma } from "@/lib/prisma";
import { PetAccessor } from "@/lib/accessors/PetAccessor";
import { parsePet } from "@/lib/pets/PetForm";
import { fail, jsonToFormData, validId, type ApiResponse } from "@/lib/api/http";

export const MeApiController = {
    async addPet(userId: number, body: unknown): Promise<ApiResponse> {
        const parsed = parsePet(jsonToFormData(body));
        if ("error" in parsed) return fail(400, { form: parsed.error });
        return { status: 201, body: await PetAccessor.create({ userId, ...parsed.data }) };
    },

    async removePet(userId: number, petId: number): Promise<ApiResponse> {
        if (!validId(petId)) return fail(404, { id: "Animal inexistent sau fără acces." });
        const res = await prisma.pet.deleteMany({ where: { id: petId, userId } });
        if (res.count === 0) return fail(404, { id: "Animal inexistent sau fără acces." });
        return { status: 204, body: null };
    },
};