"use client";

import { deleteAppointment } from "@/app/admin/appointments/actions";
import styles from "@/app/admin/appointments/appointments.module.css";

export default function DeleteAppointmentButton({ id }: { id: number }) {
    return (
        <form
            action={deleteAppointment.bind(null, id)}
            onSubmit={(e) => {
                if (!confirm("Sigur vrei să ștergi această programare?")) e.preventDefault();
            }}
        >
            <button type="submit" className={`${styles.btnSm} ${styles.btnDanger}`}>
                🗑️ Șterge
            </button>
        </form>
    );
}