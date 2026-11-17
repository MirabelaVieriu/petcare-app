"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
    AdminOption,
    PlanFormErrors,
    PlanFormValues,
} from "@/lib/models/PlanViewModel";

type Props = {
    admins: AdminOption[];
    initialValues: PlanFormValues;
    endpoint: string;
    method: "POST" | "PUT";
    submitLabel: string;
    cancelHref: string;
};

export default function PlanForm({
                                     admins,
                                     initialValues,
                                     endpoint,
                                     method,
                                     submitLabel,
                                     cancelHref,
                                 }: Props) {
    const router = useRouter();
    const [values, setValues] = useState<PlanFormValues>(initialValues);
    const [errors, setErrors] = useState<PlanFormErrors>({});
    const [loading, setLoading] = useState(false);

    function setField<K extends keyof PlanFormValues>(key: K, value: PlanFormValues[K]) {
        setValues((v) => ({ ...v, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                if (data?.errors) setErrors(data.errors);
                else setErrors({ form: data?.error ?? "A apărut o eroare la salvare." });
                return;
            }

            router.push(cancelHref);
            router.refresh();
        } catch {
            setErrors({ form: "Nu s-a putut contacta serverul." });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="planForm" onSubmit={handleSubmit} noValidate>
            {errors.form && <p className="formError">{errors.form}</p>}

            <label className="formField">
                <span>Nume plan</span>
                <input
                    name="name"
                    type="text"
                    value={values.name}
                    onChange={(e) => setField("name", e.target.value)}
                />
                {errors.name && <small className="formError">{errors.name}</small>}
            </label>

            <div className="formRow">
                <label className="formField">
                    <span>Preț (lei / lună)</span>
                    <input
                        name="price"
                        type="text"
                        inputMode="numeric"
                        value={values.price}
                        onChange={(e) => setField("price", e.target.value)}
                    />
                    {errors.price && <small className="formError">{errors.price}</small>}
                </label>

                <label className="formField">
                    <span>Discount (%)</span>
                    <input
                        name="discount"
                        type="text"
                        inputMode="numeric"
                        value={values.discount}
                        onChange={(e) => setField("discount", e.target.value)}
                    />
                    {errors.discount && <small className="formError">{errors.discount}</small>}
                </label>
            </div>

            <label className="formField">
                <span>Medic veterinar</span>
                <select
                    name="adminId"
                    value={values.adminId}
                    onChange={(e) => setField("adminId", e.target.value)}
                >
                    <option value="">— alege —</option>
                    {admins.map((a) => (
                        <option key={a.id} value={String(a.id)}>
                            {a.label}
                        </option>
                    ))}
                </select>
                {errors.adminId && <small className="formError">{errors.adminId}</small>}
            </label>

            <label className="formCheck">
                <input
                    name="priority"
                    type="checkbox"
                    checked={values.priority}
                    onChange={(e) => setField("priority", e.target.checked)}
                />
                <span>Prioritate la programări</span>
            </label>

            <div className="formActions">
                <Link href={cancelHref} className="btnGhost">
                    Anulează
                </Link>
                <button type="submit" className="btnPrimary" disabled={loading}>
                    {loading ? "Se salvează..." : submitLabel}
                </button>
            </div>
        </form>
    );
}