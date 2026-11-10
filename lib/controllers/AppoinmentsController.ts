import { AppointmentAccessor } from "@/lib/accessors/Appointmentaccessor";
import {
    readAppointmentForm,
    validateAppointmentForm,
    type AppointmentFormState,
} from "@/lib/models/Appoinmentviewmodel";

export const AppointmentsController = {
    /** GET /admin/appointments */
    index() {
        return AppointmentAccessor.getEntities();
    },

    /** GET /admin/appointments/new */
    createForm() {
        return AppointmentAccessor.getFormOptions();
    },

    /** POST /admin/appointments/new */
    async create(formData: FormData): Promise<AppointmentFormState & { ok: boolean }> {
        const values = readAppointmentForm(formData);
        const { errors, data } = validateAppointmentForm(values);
        if (!data) return { values, errors, ok: false };

        if (data.petId !== null && !(await AppointmentAccessor.petBelongsToUser(data.petId, data.userId))) {
            return { values, errors: { petId: "Animalul nu aparține clientului ales." }, ok: false };
        }

        try {
            await AppointmentAccessor.addEntity(data);
        } catch {
            return { values, errors: { form: "Nu s-a putut salva programarea." }, ok: false };
        }
        return { values, errors: {}, ok: true };
    },

    /** GET /admin/appointments/[id]/edit */
    getById(id: number) {
        return AppointmentAccessor.getEntity(id);
    },

    /** POST /admin/appointments/[id]/edit */
    async update(id: number, formData: FormData): Promise<AppointmentFormState & { ok: boolean }> {
        const values = readAppointmentForm(formData);
        const { errors, data } = validateAppointmentForm(values);
        if (!data) return { values, errors, ok: false };

        if (data.petId !== null && !(await AppointmentAccessor.petBelongsToUser(data.petId, data.userId))) {
            return { values, errors: { petId: "Animalul nu aparține clientului ales." }, ok: false };
        }

        try {
            await AppointmentAccessor.updateEntity(id, data);
        } catch {
            return { values, errors: { form: "Nu s-a putut actualiza programarea." }, ok: false };
        }
        return { values, errors: {}, ok: true };
    },

    /** POST delete */
    async delete(id: number) {
        await AppointmentAccessor.deleteEntity(id);
    },
};