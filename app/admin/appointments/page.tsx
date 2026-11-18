import Link from "next/link";
import AppointmentsList from "@/components/appointmet/AppointmentsList";
import styles from "./appointments.module.css";


export const dynamic = "force-dynamic";

export default async function AppointmentsIndex() {
    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Link href="/admin" className={styles.topLink}>← Dashboard</Link>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>📅 Programări</h1>
                        <p className={styles.subtitle}>Date încărcate prin API (GET /api/appointments)</p>
                    </div>
                    <Link href="/admin/appointments/new" className={styles.btnPrimary}>
                        + Programare nouă
                    </Link>
                </div>

                <div className={styles.card}>
                    <AppointmentsList />
                </div>
            </div>
        </div>
    );
}