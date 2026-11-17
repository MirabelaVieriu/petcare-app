import Link from "next/link";
import { PlansController } from "@/lib/controllers/PlansController";
import styles from "../../plans.module.css";
import PlanForm from "@/components/plans/PlanForm";
import ConfirmDeleteButton from "@/components/user/ConfirmDeleteButton";

export const dynamic = "force-dynamic";

export default async function EditPlanView({
                                               params,
                                           }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const planId = Number(id);
    const { admins, values } = await PlansController.editGet(planId);

    return (
        <div className={styles.page}>
            <div className={`${styles.container} ${styles.narrow}`}>
                <Link href="/admin/plans" className="admBack">← Înapoi la listă</Link>

                <div className={styles.header}>
                    <div>
                        <p className={styles.kicker}>Administrare</p>
                        <h1 className={styles.title}>Editează plan</h1>
                    </div>
                </div>

                <PlanForm
                    admins={admins}
                    initialValues={values}
                    endpoint={`/api/plans/${planId}`}
                    method="PUT"
                    submitLabel="Salvează modificările"
                    cancelHref="/admin/plans"
                />

                <div className={styles.deleteForm}>
                    <ConfirmDeleteButton
                        endpoint={`/api/plans/${planId}`}
                        redirectTo="/admin/plans"
                        label="Șterge plan"
                        title="Ștergi planul?"
                        description="Planul va fi șters definitiv. Nu poate fi șters dacă are abonamente active."
                    />
                </div>
            </div>
        </div>
    );
}