import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentsController } from "@/lib/controllers/AppoinmentsController";
import AppointmentForm from "@/components/appointmet/AppointmentForm";
import type { AppointmentFormValues } from "@/lib/models/Appoinmentviewmodel";
import styles from "@/app/admin/appointments/appointments.module.css";

export const dynamic = "force-dynamic";

function toDateTimeLocalValue(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditAppointmentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const appointmentId = Number(id);
    const [appointment, options] = await Promise.all([
        AppointmentsController.getById(appointmentId),
        AppointmentsController.createForm(),
    ]);

    if (!appointment) {
        notFound();
    }

    const initialValues: AppointmentFormValues = {
        userId: String(appointment.userId),
        petId: appointment.petId ? String(appointment.petId) : "",
        adminId: appointment.adminId ? String(appointment.adminId) : "",
        service: appointment.service,
        date: toDateTimeLocalValue(appointment.date),
    };

    return (
        <div className={styles.page}>
            <div className={`${styles.container} ${styles.narrow}`}>
                <Link href="/admin/appointments" className={styles.topLink}>← Înapoi la listă</Link>

                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>🩺 Editează programarea</h1>
                        <p className={styles.subtitle}>Actualizează detaliile programării.</p>
                    </div>
                </div>

                <div className={`${styles.card} ${styles.cardPad}`}>
                    <AppointmentForm
                        options={options}
                        initialValues={initialValues}
                        endpoint={`/api/appointments/${appointmentId}`}
                        method="PUT"
                        submitLabel="Salvează modificările"
                    />
                </div>
            </div>
        </div>
    );
}
