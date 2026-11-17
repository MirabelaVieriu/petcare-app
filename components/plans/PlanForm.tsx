"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { AdminOption, PlanFormErrors, PlanFormValues } from "@/lib/models/PlanViewModel";
import styles from "@/app/admin/plans/plans.module.css";

export default function PlanForm({
                                     admins, initialValues, endpoint, method, submitLabel, cancelHref,
                                 }: {
    admins: AdminOption[];
    initialValues: PlanFormValues;
    endpoint: string;
    method: "POST" | "PUT";
    submitLabel: string;
    cancelHref: string;
}) {
    const router = useRouter();
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState<PlanFormErrors>({});
    const [pending, setPending] = useState(false);

    const text = (key: "name" | "price" | "discount" | "adminId") => ({
        value: values[key],
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setValues(v => ({ ...v, [key]: e.target.value })),
    });
    const err = (m?: string) => m && <p className="formError">{m}</p>;

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
            const data = await res.json().catch(() => null);
            if (res.ok) {
                router.push(`/admin/plans/${data.id}`);
                router.refresh();
                return;
            }
            setErrors(data?.errors ?? { form: "Nu s-a putut salva planul." });
        } catch {
            setErrors({ form: "Eroare de rețea." });
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className={styles.formCard}>
            {err(errors.form)}
            <div className={styles.grid3}>
                <label className={styles.field}>Nume
                    <input type="text" {...text("name")} className={styles.input} />
                    {err(errors.name)}
                </label>
                <label className={styles.field}>Preț
                    <input type="number" {...text("price")} className={styles.input} />
                    {err(errors.price)}
                </label>
                <label className={styles.field}>Discount
                    <input type="number" {...text("discount")} className={styles.input} />
                    {err(errors.discount)}
                </label>
            </div>

            <label className={styles.field}>Veterinar
                <select {...text("adminId")} className={styles.input}>
                    <option value="">-- Selectează un veterinar --</option>
                    {admins.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
                {err(errors.adminId)}
            </label>

            <label className={styles.checkbox}>
                <input type="checkbox" checked={values.priority}
                       onChange={e => setValues(v => ({ ...v, priority: e.target.checked }))} />
                Prioritate
            </label>

            <div className={styles.formActions}>
                <button type="submit" disabled={pending} className={styles.btnPrimary}>
                    {pending ? "Se salvează..." : submitLabel}
                </button>
                <Link href={cancelHref} className={styles.btnSecondary}>Renunță</Link>
            </div>
        </form>
    );
}