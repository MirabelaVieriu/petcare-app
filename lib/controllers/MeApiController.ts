import { prisma } from "@/lib/prisma";
import { PetAccessor } from "@/lib/accessors/PetAccessor";
import { parsePet } from "@/lib/pets/PetForm";
import { fail, jsonToFormData, validId, type ApiResponse } from "@/lib/api/http";
import { toAppointmentDto } from "@/lib/dto/AppointmentDto";
import { readAppointmentJson, validateAppointmentForm } from "@/lib/models/Appoinmentviewmodel";
import { AppointmentAccessor } from "@/lib/accessors/Appointmentaccessor";

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
    async addAppointment(userId: number, body: unknown): Promise<ApiResponse> {
        const values = {...readAppointmentJson(body), userId: String(userId)};
        const {errors, data} = validateAppointmentForm(values);
        if (!data) return {status: 400, body: {errors}};

        if (data.petId === null) return fail(400, {petId: "Alege animalul pe care îl programezi."});
        if (!(await AppointmentAccessor.petBelongsToUser(data.petId, userId))) {
            return fail(400, {petId: "Animalul nu îți aparține."});
        }
        if (data.adminId === null) return fail(400, {adminId: "Alege un veterinar."});

        try {
            const id = await AppointmentAccessor.addEntity(data);
            const row = await AppointmentAccessor.getByIdForApi(id);
            return {status: 201, body: toAppointmentDto(row!)};
        } catch {
            return fail(400, {adminId: "Veterinarul selectat nu există."});
        }
    },
};