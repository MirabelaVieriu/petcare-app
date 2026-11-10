import Link from "next/link";
import { Nunito } from "next/font/google";
import { AppointmentsController } from "@/lib/controllers/AppoinmentsController";
import AppointmentForm from "@/components/appointmet/AppointmentForm";
import { createAppointment } from "@/app/admin/appointments/actions";
import styles from "@/app/admin/appointments/appointments.module.css";

const nunito = Nunito({ subsets: ["latin", "latin-ext"], weight: ["400", "600", "700", "800"] });
export const dynamic = "force-dynamic";

export default async function CreateAppointment() {
    const options = await AppointmentsController.createForm();

    return (
        <div className={`${styles.page} ${nunito.className}`}>
            <div className={`${styles.container} ${styles.narrow}`}>
                <Link href="/admin/appointments" className={styles.topLink}>← Înapoi la listă</Link>

                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>🩺 Programare nouă</h1>
                        <p className={styles.subtitle}>Completează datele programării</p>
                    </div>
                </div>

                <div className={`${styles.card} ${styles.cardPad}`}>
                    <AppointmentForm options={options} submitAction={createAppointment} />
                </div>
            </div>
        </div>
    );
}