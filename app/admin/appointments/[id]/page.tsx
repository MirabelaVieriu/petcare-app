import Link from "next/link";
import AppointmentDetails from "@/components/appointmet/AppointmentDetails";
import styles from "@/app/admin/appointments/appointments.module.css";

export default async function AppointmentDetailsPage({
                                                         params,
                                                     }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className={styles.page}>
            <div className={`${styles.container} ${styles.narrow}`}>
                <Link href="/admin/appointments" className={styles.topLink}>← Înapoi la listă</Link>
                <div className={styles.header}>
                    <h1 className={styles.title}>🔍 Detalii programare</h1>
                </div>
                <div className={`${styles.card} ${styles.cardPad}`}>
                    <AppointmentDetails id={Number(id)} />
                </div>
            </div>
        </div>
    );
}