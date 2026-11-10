import Link from "next/link";
import { PlansController } from "@/lib/controllers/PlansController";
import styles from "./plans.module.css";

export const dynamic = "force-dynamic";

export default async function PlansIndexPage() {
    const { plans } = await PlansController.index();

    async function deletePlanAction(formData: FormData) {
        "use server";
        const planId = Number(formData.get("planId"));
        await PlansController.deletePlan(planId);
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Link href="/admin" className={styles.topLink}>← Dashboard</Link>

                <div className={styles.header}>
                    <div>
                        <p className={styles.kicker}>Administrare</p>
                        <h1 className={styles.title}>Planuri</h1>
                        <p className={styles.subtitle}>
                            {plans.length} {plans.length === 1 ? "plan disponibil" : "planuri disponibile"}
                        </p>
                    </div>

                    <Link href="/admin/plans/new" className={styles.btnPrimary}>
                        + Creează plan
                    </Link>
                </div>

                <div className={styles.card}>
                    {plans.length === 0 ? (
                        <div className={styles.empty}>Nu există planuri înregistrate.</div>
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th>Nume</th>
                                    <th>Preț</th>
                                    <th>Discount</th>
                                    <th>Prioritate</th>
                                    <th>Veterinar</th>
                                    <th>Acțiuni</th>
                                </tr>
                                </thead>
                                <tbody>
                                {plans.map((plan) => (
                                    <tr key={plan.id}>
                                        <td className={styles.cellStrong}>{plan.name}</td>
                                        <td>{plan.price} lei</td>
                                        <td>{plan.discount}%</td>
                                        <td>
                                                <span className={`${styles.badge} ${plan.priority ? styles.badgeTrue : styles.badgeFalse}`}>
                                                    {plan.priority ? "Da" : "Nu"}
                                                </span>
                                        </td>
                                        <td>{plan.adminName}</td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <Link href={`/admin/plans/${plan.id}`} className={styles.linkAction}>Detalii</Link>
                                                <Link href={`/admin/plans/${plan.id}/edit`} className={styles.linkAction}>Editează</Link>
                                                <form action={deletePlanAction}>
                                                    <input type="hidden" name="planId" value={plan.id} />
                                                    <button type="submit" className={styles.dangerInline}>Șterge</button>
                                                </form>
                                            </div>
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
