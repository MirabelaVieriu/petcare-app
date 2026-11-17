import Link from "next/link";
import { AppointmentsController } from "@/lib/controllers/AppoinmentsController";
import { serviceIcon, serviceLabel } from "@/lib/models/Appoinmentviewmodel";
import ConfirmDeleteButton from "@/components/user/ConfirmDeleteButton";
import styles from "./appointments.module.css";


export const dynamic = "force-dynamic";

export default async function AppointmentsIndex() {
    const appointments = await AppointmentsController.index();

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Link href="/admin" className={styles.topLink}>← Dashboard</Link>

                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>📅 Programări</h1>
                        <p className={styles.subtitle}>
                            {appointments.length} {appointments.length === 1 ? "programare" : "programări"}
                        </p>
                    </div>
                    <Link href="/admin/appointments/new" className={styles.btnPrimary}>
                        + Programare nouă
                    </Link>
                </div>

                <div className={styles.card}>
                    {appointments.length === 0 ? (
                        <div className={styles.empty}>
                            <span className={styles.emptyIcon}>🐾</span>
                            Nu există nicio programare încă.
                        </div>
                    ) : (
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
                                {appointments.map(a => (
                                    <tr key={a.id}>
                                        <td className={styles.date}>
                                            {a.date.toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" })}
                                        </td>
                                        <td>
                                            <span className={styles.badge}>
                                                {serviceIcon(a.service)} {serviceLabel(a.service)}
                                            </span>
                                        </td>
                                        <td>{a.clientName}</td>
                                        <td>
                                            {a.petName
                                                ? `${a.petName} (${a.petType})`
                                                : <span className={styles.muted}>—</span>}
                                        </td>
                                        <td>{a.vetName ?? <span className={styles.muted}>—</span>}</td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <Link
                                                    href={`/admin/appointments/${a.id}/edit`}
                                                    className={styles.btnSm}
                                                >
                                                    ✏️ Editează
                                                </Link>
                                                <ConfirmDeleteButton
                                                    variant="icon"
                                                    endpoint={`/api/appointments/${a.id}`}
                                                    ariaLabel="Șterge programarea"
                                                    title="Ștergi programarea?"
                                                    description="Programarea va fi ștearsă definitiv."
                                                />                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}