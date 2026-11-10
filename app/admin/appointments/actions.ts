"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AppointmentsController } from "@/lib/controllers/AppoinmentsController";
import type { AppointmentFormState } from "@/lib/models/Appoinmentviewmodel";

export async function createAppointment(
    _prev: AppointmentFormState,
    formData: FormData,
): Promise<AppointmentFormState> {
    const result = await AppointmentsController.create(formData);
    if (!result.ok) return { values: result.values, errors: result.errors };

    revalidatePath("/admin/appointments");
    redirect("/admin/appointments");
}

export async function updateAppointment(
    id: number,
    _prev: AppointmentFormState,
    formData: FormData,
): Promise<AppointmentFormState> {
    const result = await AppointmentsController.update(id, formData);
    if (!result.ok) return { values: result.values, errors: result.errors };

    revalidatePath("/admin/appointments");
    redirect("/admin/appointments");
}

export async function updateAppointmentById(
    id: number,
    prevState: AppointmentFormState,
    formData: FormData,
): Promise<AppointmentFormState> {
    return updateAppointment(id, prevState, formData);
}

export async function deleteAppointment(id: number) {
    await AppointmentsController.delete(id);
    revalidatePath("/admin/appointments");
}