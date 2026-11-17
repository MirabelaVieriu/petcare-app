import { prisma } from "@/lib/prisma";
import { OwnerAccessor } from "@/lib/accessors/OwnerAccessor";
import { PetAccessor } from "@/lib/accessors/PetAccessor";
import { parsePet } from "@/lib/pets/PetForm";
import { fail, jsonToFormData, validId, type ApiResponse } from "@/lib/api/http";

const noClient = () => fail(404, { id: "Client inexistent sau fără acces." });
const noPet = () => fail(404, { id: "Animal inexistent sau fără acces." });

export const ClientsApiController = {
    async getAll(adminId: number): Promise<ApiResponse> {
        return { status: 200, body: await OwnerAccessor.getByVet(adminId) };
    },

    async getById(adminId: number, id: number): Promise<ApiResponse> {
        const c = validId(id) ? await OwnerAccessor.getDetail(adminId, id) : null;
        return c ? { status: 200, body: c } : noClient();
    },

    async remove(adminId: number, id: number): Promise<ApiResponse> {
        if (!validId(id) || !(await OwnerAccessor.getDetail(adminId, id))) return noClient();
        await prisma.user.delete({ where: { id } });
        return { status: 204, body: null };
    },

    async addPet(adminId: number, clientId: number, body: unknown): Promise<ApiResponse> {
        if (!validId(clientId) || !(await OwnerAccessor.getDetail(adminId, clientId))) return noClient();
        const parsed = parsePet(jsonToFormData(body));
        if ("error" in parsed) return fail(400, { form: parsed.error });
        const pet = await PetAccessor.create({ userId: clientId, ...parsed.data });
        return { status: 201, body: pet };
    },

    async removePet(adminId: number, petId: number): Promise<ApiResponse> {
        if (!validId(petId)) return noPet();
        const pet = await prisma.pet.findFirst({
            where: { id: petId, user: { vetId: adminId } },
            select: { id: true },
        });
        if (!pet) return noPet();
        await prisma.pet.delete({ where: { id: pet.id } });
        return { status: 204, body: null };
    },
};
