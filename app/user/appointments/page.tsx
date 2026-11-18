import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { AppointmentAccessor } from "@/lib/accessors/Appointmentaccessor";
import AppointmentForm from "@/components/appointmet/AppointmentForm";
import { emptyAppointmentForm } from "@/lib/models/Appoinmentviewmodel";
import styles from "@/app/admin/appointments/appointments.module.css";

export const dynamic = "force-dynamic";

export default async function UserNewAppointmentPage() {
    const user = await requireUser();
    const options = await AppointmentAccessor.getFormOptionsForUser(user.id);

    return (
        <div className={styles.page}>
            <div className={`${styles.container} ${styles.narrow}`}>
                <Link href="/user" className={styles.topLink}>← Înapoi</Link>

                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>🩺 Programare nouă</h1>
                        <p className={styles.subtitle}>Alege animalul, serviciul și veterinarul.</p>
                    </div>
                </div>

                <div className={`${styles.card} ${styles.cardPad}`}>
                    {options.pets.length === 0 ? (
                        <p>
                            Nu ai niciun animal înregistrat. <Link href="/user">Adaugă un animal</Link> înainte
                            de a face o programare.
                        </p>
                    ) : (
                        <AppointmentForm
                            options={options}
                            initialValues={{
                                ...emptyAppointmentForm,
                                userId: String(user.id),
                                adminId: user.vetId ? String(user.vetId) : "",
                            }}
                            endpoint="/api/me/appointments"
                            method="POST"
                            hideClient
                            requirePet
                            redirectTo="/user"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}