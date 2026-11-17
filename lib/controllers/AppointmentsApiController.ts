import { AppointmentAccessor } from "@/lib/accessors/Appointmentaccessor";
import { toAppointmentDto, toAppointmentDtos } from "@/lib/dto/AppointmentDto";
import {
    readAppointmentJson,
    validateAppointmentForm,
    type AppointmentData,
} from "@/lib/models/Appoinmentviewmodel";
import { fail, validId, type ApiResponse } from "@/lib/api/http";

const notFound = () => fail(404, { id: "Programarea nu există." });

async function validate(
    body: unknown
): Promise<{ data: AppointmentData } | { errors: Record<string, string> }> {
    const { errors, data } = validateAppointmentForm(readAppointmentJson(body));
    if (!data) return { errors: errors as Record<string, string> };

    if (data.petId !== null && !(await AppointmentAccessor.petBelongsToUser(data.petId, data.userId))) {
        return { errors: { petId: "Animalul nu aparține clientului ales." } };
    }
    return { data };
}

export const AppointmentsApiController = {
    /** GET /api/appointments */
    async getAll(): Promise<ApiResponse> {
        return { status: 200, body: toAppointmentDtos(await AppointmentAccessor.getAllForApi()) };
    },

    /** GET /api/appointments/{id} */
    async getById(id: number): Promise<ApiResponse> {
        const row = validId(id) ? await AppointmentAccessor.getByIdForApi(id) : null;
        return row ? { status: 200, body: toAppointmentDto(row) } : notFound();
    },

    /** POST /api/appointments */
    async create(body: unknown): Promise<ApiResponse> {
        const v = await validate(body);
        if (!("data" in v)) return { status: 400, body: { errors: v.errors } };

        try {
            const id = await AppointmentAccessor.addEntity(v.data);
            const row = await AppointmentAccessor.getByIdForApi(id);
            return { status: 201, body: toAppointmentDto(row!) };
        } catch {
            return fail(400, { form: "Client sau veterinar inexistent." });
        }
    },

    /** PUT /api/appointments/{id} */
    async update(id: number, body: unknown): Promise<ApiResponse> {
        if (!validId(id) || !(await AppointmentAccessor.getEntity(id))) return notFound();

        const v = await validate(body);
        if (!("data" in v)) return { status: 400, body: { errors: v.errors } };

        try {
            await AppointmentAccessor.updateEntity(id, v.data);
            const row = await AppointmentAccessor.getByIdForApi(id);
            return { status: 200, body: toAppointmentDto(row!) };
        } catch {
            return fail(400, { form: "Client sau veterinar inexistent." });
        }
    },

    /** DELETE /api/appointments/{id} */
    async remove(id: number): Promise<ApiResponse> {
        if (!validId(id) || !(await AppointmentAccessor.getEntity(id))) return notFound();
        await AppointmentAccessor.deleteEntity(id);
        return { status: 204, body: null };
    },
};