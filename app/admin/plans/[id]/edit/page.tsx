import Link from "next/link";
import { PlansController } from "@/lib/controllers/PlansController";
import styles from "../../plans.module.css";

export const dynamic = "force-dynamic";

export default async function EditPlanView({
                                               params,
                                           }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const planId = Number(id);
    const { admins, values } = await PlansController.editGet(planId);

    async function editPlanAction(formData: FormData) {
        "use server";
        await PlansController.editPost(planId, { values, errors: {} }, formData);
    }

    async function deletePlanAction() {
        "use server";
        await PlansController.deletePlan(planId);
    }

    return (
        <div className={styles.page}>
            <div className={`${styles.container} ${styles.narrow}`}>
                <Link href="/admin/plans" className={styles.topLink}>← Înapoi la listă</Link>

                <div className={styles.header}>
                    <div>
                        <p className={styles.kicker}>Administrare</p>
                        <h1 className={styles.title}>Editează plan</h1>
                    </div>
                </div>

                <form action={editPlanAction} className={styles.formCard}>
                    <div className={styles.grid3}>
                        <label className={styles.field}>
                            Nume
                            <input type="text" name="name" defaultValue={values.name} className={styles.input} />
                        </label>

                        <label className={styles.field}>
                            Preț
                            <input type="number" name="price" defaultValue={values.price} className={styles.input} />
                        </label>

                        <label className={styles.field}>
                            Discount
                            <input type="number" name="discount" defaultValue={values.discount} className={styles.input} />
                        </label>
                    </div>

                    <label className={styles.field}>
                        Veterinar
                        <select name="adminId" defaultValue={values.adminId} className={styles.input}>
                            <option value="">-- Selectează un veterinar --</option>
                            {admins.map((admin) => (
                                <option key={admin.id} value={admin.id}>
                                    {admin.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className={styles.checkbox}>
                        <input type="checkbox" name="priority" defaultChecked={values.priority} />
                        Prioritate
                    </label>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.btnPrimary}>Salvează modificările</button>
                        <Link href="/admin/plans" className={styles.btnSecondary}>Renunță</Link>
                    </div>
                </form>

                <form action={deletePlanAction} className={styles.deleteForm}>
                    <button type="submit" className={styles.btnDanger}>Șterge plan</button>
                </form>
            </div>
        </div>
    );
}
