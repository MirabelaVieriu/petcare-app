import Link from "next/link";
import { PlansController } from "@/lib/controllers/PlansController";
import styles from "../plans.module.css";

export const dynamic = "force-dynamic";

export default async function PlanDetailsView({
                                                  params,
                                              }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const { plan } = await PlansController.details(Number(id));

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Link href="/admin/plans" className={styles.topLink}>← Înapoi la listă</Link>

                <div className={styles.header}>
                    <div>
                        <p className={styles.kicker}>Administrare</p>
                        <h1 className={styles.title}>Detalii plan</h1>
                    </div>
                </div>

                <div className={styles.formCard}>
                    <div className={styles.detailsGrid}>
                        <div className={styles.metric}>
                            <p className={styles.metricLabel}>Nume</p>
                            <p className={styles.metricValue}>{plan.name}</p>
                        </div>

                        <div className={styles.metric}>
                            <p className={styles.metricLabel}>Preț</p>
                            <p className={styles.metricValue}>{plan.price} lei</p>
                        </div>

                        <div className={styles.metric}>
                            <p className={styles.metricLabel}>Discount</p>
                            <p className={styles.metricValue}>{plan.discount}%</p>
                        </div>

                        <div className={styles.metric}>
                            <p className={styles.metricLabel}>Prioritate</p>
                            <p className={styles.metricValue}>{plan.priority ? "Da" : "Nu"}</p>
                        </div>
                    </div>

                    <div className={styles.detailsGrid}>
                        <div className={styles.metric}>
                            <p className={styles.metricLabel}>Veterinar</p>
                            <p className={styles.metricValue}>{plan.adminName}</p>
                        </div>

                        <div className={styles.metric}>
                            <p className={styles.metricLabel}>Abonați activi</p>
                            <p className={styles.metricValue}>{plan.activeSubscribers}</p>
                        </div>
                    </div>

                    <div>
                        <h3>Servicii</h3>
                        <ul className={styles.serviceList}>
                            {plan.services.map((service) => (
                                <li key={`${plan.id}-${service.service}`}>
                                    <strong>{service.service}</strong>: {service.perMonth} lei/lună
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.formActions}>
                        <Link href={`/admin/plans/${plan.id}/edit`} className={styles.btnPrimary}>Editează</Link>
                        <Link href="/admin/plans" className={styles.btnSecondary}>Înapoi la listă</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
