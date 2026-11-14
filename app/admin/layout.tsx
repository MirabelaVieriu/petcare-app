import { requireAdmin } from "@/lib/auth/guards";
import { nunito } from "@/lib/fonts";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await requireAdmin();
    return <div className={nunito.className}>{children}</div>;
}
