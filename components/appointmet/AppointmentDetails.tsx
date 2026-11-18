"use client";

import { useEffect, useState } from "react";
import type { AppointmentDto } from "@/lib/dto/AppointmentDto";
import styles from "@/app/admin/appointments/appointments.module.css";

export default function AppointmentDetails({ id }: { id: number }) {
    const [item, setItem] = useState<AppointmentDto | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/appointments/${id}`, { cache: "no-store" })
            .then(async res => {
                if (res.status === 404) throw new Error("Programarea nu există.");
                if (!res.ok) throw new Error(`Eroare (${res.status}).`);
                setItem(await res.json());
            })
            .catch((e: Error) => setError(e.message));
    }, [id]);

    if (error) return <p className={styles.error}>{error}</p>;
    if (!item) return <p>Se încarcă...</p>;

    return (
        <dl>
            <p><strong>Data:</strong> {new Date(item.date).toLocaleString("ro-RO", { timeZone: "Europe/Bucharest" })}</p>
            <p><strong>Serviciu:</strong> {item.service.label}</p>
            <p><strong>Client:</strong> {item.client.name}</p>
            <p><strong>Animal:</strong> {item.pet ? `${item.pet.name} (${item.pet.type})` : "—"}</p>
            <p><strong>Veterinar:</strong> {item.vet?.name ?? "—"}</p>
        </dl>
    );
}