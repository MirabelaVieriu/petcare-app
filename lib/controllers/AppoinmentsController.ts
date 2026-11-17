import { AppointmentAccessor } from "@/lib/accessors/Appointmentaccessor";

export const AppointmentsController = {
    /** GET /admin/appointments */
    index() {
        return AppointmentAccessor.getEntities();
    },

    /** GET /admin/appointments/new */
    createForm() {
        return AppointmentAccessor.getFormOptions();
    },

    /** GET /admin/appointments/[id]/edit */
    getById(id: number) {
        return AppointmentAccessor.getEntity(id);
    },
};