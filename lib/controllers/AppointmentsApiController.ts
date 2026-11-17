import { AppointmentAccessor } from "@/lib/accessors/Appointmentaccessor";
import { toAppointmentDto, toAppointmentDtos, type AppointmentDto } from "@/lib/dto/AppointmentDto";
import { readAppointmentJson, validateAppointmentForm } from "@/lib/models/Appoinmentviewmodel";

type ApiResult<T> =
    | { status: 200 | 201; body: T }
    | { status: 400 | 404; body: { errors: Record<string, string> } };

async function validate(body: unknown) {
    const values = readAppointmentJson(body);
    const { errors, data } = validateAppointmentForm(values);
    if (!data) return { errors };

    if (data.petId !== null && !(await AppointmentAccessor.petBelongsToUser(data.petId, data.userId))) {
        return { errors: { petId: "Animalul nu aparține clientului ales." } };
    }
    return { data };
}

export const AppointmentsApiController = {
    /** GET /api/appointments */
    async getAll(): Promise<ApiResult<AppointmentDto[]>> {
        const rows = await AppointmentAccessor.getAllForApi();
        return { status: 200, body: toAppointmentDtos(rows) };
    },

    /** GET /api/appointments/{id} */
    async getById(id: number): Promise<ApiResult<AppointmentDto>> {
        const row = Number.isInteger(id) && id > 0 ? await AppointmentAccessor.getByIdForApi(id) : null;
        if (!row) return { status: 404, body: { errors: { id: "Programarea nu există." } } };
        return { status: 200, body: toAppointmentDto(row) };
    },

    /** POST /api/appointments */
    async create(body: unknown): Promise<ApiResult<AppointmentDto>> {
        const v = await validate(body);
        if (!v.data) return { status: 400, body: { errors: v.errors! } };

        try {
            const id = await AppointmentAccessor.addEntity(v.data);
            const row = await AppointmentAccessor.getByIdForApi(id);
            return { status: 201, body: toAppointmentDto(row!) };
        } catch {
            return { status: 400, body: { errors: { form: "Client sau veterinar inexistent." } } };
        }
    },

    /** PUT /api/appointments/{id} */
    async update(id: number, body: unknown): Promise<ApiResult<AppointmentDto>> {
        if (!Number.isInteger(id) || id <= 0 || !(await AppointmentAccessor.getEntity(id))) {
            return { status: 404, body: { errors: { id: "Programarea nu există." } } };
        }

        const v = await validate(body);
        if (!v.data) return { status: 400, body: { errors: v.errors! } };

        try {
            await AppointmentAccessor.updateEntity(id, v.data);
            const row = await AppointmentAccessor.getByIdForApi(id);
            return { status: 200, body: toAppointmentDto(row!) };
        } catch {
            return { status: 400, body: { errors: { form: "Client sau veterinar inexistent." } } };
        }
    },
};