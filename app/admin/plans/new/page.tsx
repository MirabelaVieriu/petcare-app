import Link from "next/link";
import { PlansController } from "@/lib/controllers/PlansController";
import styles from "../plans.module.css";

export const dynamic = "force-dynamic";

export default async function CreatePlanView() {
    const { admins, values } = await PlansController.createGet();

    async function createPlanAction(formData: FormData) {
        "use server";
        await PlansController.createPost({ values, errors: {} }, formData);
    }

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

                <form action={createPlanAction} className={styles.formCard}>
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
                        <button type="submit" className={styles.btnPrimary}>Creează plan</button>
                        <Link href="/admin/plans" className={styles.btnSecondary}>Renunță</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
