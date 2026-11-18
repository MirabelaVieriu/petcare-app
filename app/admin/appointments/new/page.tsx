import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { AppointmentsController } from "@/lib/controllers/AppoinmentsController";
import AppointmentForm from "@/components/appointmet/AppointmentForm";
import { emptyAppointmentForm } from "@/lib/models/Appoinmentviewmodel";
import styles from "@/app/admin/appointments/appointments.module.css";

export const dynamic = "force-dynamic";

export default async function CreateAppointment() {
    const admin = await requireAdmin();
    const options = await AppointmentsController.createForm();

    return (
        <div className={styles.page}>
            <div className={`${styles.container} ${styles.narrow}`}>
                <Link href="/admin/appointments" className={styles.topLink}>← Înapoi la listă</Link>

                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>🩺 Programare nouă</h1>
                        <p className={styles.subtitle}>Completează datele programării</p>
                    </div>
                </div>

                <div className={`${styles.card} ${styles.cardPad}`}>
                    <AppointmentForm
                        options={options}
                        initialValues={{ ...emptyAppointmentForm, adminId: String(admin.id) }}
                        endpoint="/api/appointments"
                        method="POST"
                        lockVet
                    />
                </div>
            </div>
        </div>
    );
}