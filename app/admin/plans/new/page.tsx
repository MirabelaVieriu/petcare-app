import Link from "next/link";
import { PlansController } from "@/lib/controllers/PlansController";
import styles from "../plans.module.css";
import PlanForm from "@/components/plans/PlanForm";

export const dynamic = "force-dynamic";

export default async function CreatePlanView() {
    const { admins, values } = await PlansController.createGet();


    return (
        <div className={styles.page}>
            <div className={`${styles.container} ${styles.narrow}`}>
                <Link href="/admin/plans" className="admBack">← Înapoi la listă</Link>

                <div className={styles.header}>
                    <div>
                        <p className={styles.kicker}>Administrare</p>
                        <h1 className={styles.title}>Creează plan nou</h1>
                    </div>
                </div>
                <PlanForm
                    admins={admins}
                    initialValues={values}
                    endpoint="/api/plans"
                    method="POST"
                    submitLabel="Creează plan"
                    cancelHref="/admin/plans" />
            </div>
        </div>

    );
}
