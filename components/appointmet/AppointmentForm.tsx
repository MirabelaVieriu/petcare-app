"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
    SERVICE_OPTIONS,
    emptyAppointmentForm,
    type AppointmentFormOptions,
    type AppointmentFormErrors,
    type AppointmentFormValues,
} from "@/lib/models/Appoinmentviewmodel";
import styles from "@/app/admin/appointments/appointments.module.css";

export default function AppointmentForm({
    options,
    initialValues = emptyAppointmentForm,
    endpoint,
    method,
    submitLabel = "Creează programarea",
}: {
    options: AppointmentFormOptions;
    initialValues?: AppointmentFormValues;
    endpoint: string;
    method: "POST" | "PUT";
    submitLabel?: string;
}) {
    const router = useRouter();
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState<AppointmentFormErrors>({});
    const [pending, setPending] = useState(false);
    const set = (key: keyof AppointmentFormValues, value: string) =>
        setValues(v => ({ ...v, [key]: value }));
    const petsOfClient = options.pets.filter(p => String(p.userId) === values.userId);
    const err = (m?: string) => m && <p className={styles.error}>{m}</p>;

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setPending(true);
        setErrors({});
        try {
            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (res.ok) {
                router.push("/admin/appointments");
                router.refresh();
                return;
            }
            const data = await res.json().catch(() => null);
            setErrors(data?.errors ?? { form: "Nu s-a putut salva programarea." });
        } catch {
            setErrors({ form: "Eroare de rețea." });
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className={styles.form}>
            {err(errors.form)}

            <label className={styles.field}>Data și ora
                <input type="datetime-local" value={values.date}
                       onChange={e => set("date", e.target.value)} className={styles.input} />
                {err(errors.date)}
            </label>

            <label className={styles.field}>Serviciu
                <select value={values.service} onChange={e => set("service", e.target.value)} className={styles.input}>
                    <option value="">— alege —</option>
                    {SERVICE_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                    ))}
                </select>
                {err(errors.service)}
            </label>

            <label className={styles.field}>Client
                <select value={values.userId}
                        onChange={e => setValues(v => ({ ...v, userId: e.target.value, petId: "" }))}
                        className={styles.input}>
                    <option value="">— alege —</option>
                    {options.clients.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                {err(errors.userId)}
            </label>

            <label className={styles.field}>Animal
                <select value={values.petId} onChange={e => set("petId", e.target.value)} className={styles.input}>
                    <option value="">— niciun animal —</option>
                    {petsOfClient.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                {err(errors.petId)}
            </label>

            <label className={styles.field}>Veterinar
                <select value={values.adminId} onChange={e => set("adminId", e.target.value)} className={styles.input}>
                    <option value="">— niciun veterinar —</option>
                    {options.vets.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
                {err(errors.adminId)}
            </label>

            <button disabled={pending} className={styles.btnPrimary}>
                {pending ? "Se salvează..." : submitLabel}
            </button>
        </form>
    );
}