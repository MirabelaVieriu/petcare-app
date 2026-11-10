"use client";

import { useActionState } from "react";
import {
    SERVICE_OPTIONS,
    emptyAppointmentForm,
    type AppointmentFormOptions,
    type AppointmentFormState,
    type AppointmentFormValues,
} from "@/lib/models/Appoinmentviewmodel";
import styles from "@/app/admin/appointments/appointments.module.css";

export default function AppointmentForm({
    options,
    initialValues = emptyAppointmentForm,
    submitAction,
    submitLabel = "Creează programarea",
}: {
    options: AppointmentFormOptions;
    initialValues?: AppointmentFormValues;
    submitAction: (prevState: AppointmentFormState, formData: FormData) => Promise<AppointmentFormState>;
    submitLabel?: string;
}) {
    const initial: AppointmentFormState = { values: initialValues, errors: {} };
    const [state, action, pending] = useActionState(submitAction, initial);
    const formValues = state.values ?? initialValues;
    const petsOfClient = options.pets.filter(p => String(p.userId) === formValues.userId);
    const err = (m?: string) => m && <p className={styles.error}>{m}</p>;

    const resetPetOnUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const petSelect = event.currentTarget.form?.querySelector('select[name="petId"]') as HTMLSelectElement | null;
        if (petSelect) {
            petSelect.value = "";
        }
    };

    return (
        <form action={action} className={styles.form}>
            {err(state.errors.form)}

            <label className={styles.field}>Data și ora
                <input
                    key={`date-${formValues.date}`}
                    type="datetime-local"
                    name="date"
                    defaultValue={formValues.date}
                    className={styles.input}
                />
                {err(state.errors.date)}
            </label>

            <label className={styles.field}>Serviciu
                <select
                    key={`service-${formValues.service}`}
                    name="service"
                    defaultValue={formValues.service}
                    className={styles.input}
                >
                    <option value="">— alege —</option>
                    {SERVICE_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                    ))}
                </select>
                {err(state.errors.service)}
            </label>

            <label className={styles.field}>Client
                <select
                    key={`user-${formValues.userId}`}
                    name="userId"
                    defaultValue={formValues.userId}
                    onChange={resetPetOnUserChange}
                    className={styles.input}
                >
                    <option value="">— alege —</option>
                    {options.clients.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                {err(state.errors.userId)}
            </label>

            <label className={styles.field}>Animal
                <select
                    key={`pet-${formValues.userId}-${formValues.petId}`}
                    name="petId"
                    defaultValue={formValues.petId}
                    className={styles.input}
                >
                    <option value="">— niciun animal —</option>
                    {petsOfClient.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                {err(state.errors.petId)}
            </label>

            <label className={styles.field}>Veterinar
                <select
                    key={`admin-${formValues.adminId}`}
                    name="adminId"
                    defaultValue={formValues.adminId}
                    className={styles.input}
                >
                    <option value="">— niciun veterinar —</option>
                    {options.vets.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
                {err(state.errors.adminId)}
            </label>

            <button disabled={pending} className={styles.btnPrimary}>
                {pending ? "Se salvează..." : submitLabel}
            </button>
        </form>
    );
}
