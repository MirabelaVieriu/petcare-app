"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AppointmentDto } from "@/lib/dto/AppointmentDto";
import ConfirmDeleteButton from "@/components/user/ConfirmDeleteButton";
import styles from "@/app/admin/appointments/appointments.module.css";

export default function AppointmentsList() {
    const [items, setItems] = useState<AppointmentDto[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        fetch("/api/appointments", { cache: "no-store" })
            .then(async res => {
                if (!res.ok) throw new Error(`Eroare la încărcare (${res.status}).`);
                const data: AppointmentDto[] = await res.json();
                if (!cancelled) {
                    setItems(data);
                    setError(null);
                }
            })
            .catch((e: Error) => {
                if (!cancelled) setError(e.message || "Eroare de rețea.");
            });

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const reload = () => setReloadKey(k => k + 1);

    if (error) return <div className={styles.empty}>{error}</div>;
    if (!items) return <div className={styles.empty}>Se încarcă...</div>;
    if (items.length === 0) {
        return (
            <div className={styles.empty}>
                <span className={styles.emptyIcon}>🐾</span>
                Nu există nicio programare încă.
            </div>
        );
    }

    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Data și ora</th>
                    <th>Serviciu</th>
                    <th>Client</th>
                    <th>Animal</th>
                    <th>Veterinar</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {items.map(a => (
                    <tr key={a.id}>
                        <td className={styles.date}>
                            {new Date(a.date).toLocaleString("ro-RO", {
                                dateStyle: "medium",
                                timeStyle: "short",
                                timeZone: "Europe/Bucharest",
                            })}
                        </td>
                        <td><span className={styles.badge}>{a.service.label}</span></td>
                        <td>{a.client.name}</td>
                        <td>
                            {a.pet ? `${a.pet.name} (${a.pet.type})` : <span className={styles.muted}>—</span>}
                        </td>
                        <td>{a.vet?.name ?? <span className={styles.muted}>—</span>}</td>
                        <td>
                            <div className={styles.rowActions}>
                                <Link href={`/admin/appointments/${a.id}`} className={styles.btnSm}>
                                    🔍 Detalii
                                </Link>
                                <Link href={`/admin/appointments/${a.id}/edit`} className={styles.btnSm}>
                                    ✏️ Editează
                                </Link>
                                <ConfirmDeleteButton
                                    variant="icon"
                                    endpoint={`/api/appointments/${a.id}`}
                                    onDeletedAction={reload}
                                    ariaLabel="Șterge programarea"
                                    title="Ștergi programarea?"
                                    description="Programarea va fi ștearsă definitiv."
                                />
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}