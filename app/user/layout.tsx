import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/guards";
import { logoutAction } from "@/lib/actions/auth";
import { nunito } from "@/lib/fonts";

export default async function UserLayout({ children }: { children: ReactNode }) {
    const user = await requireUser();

    return (
        <div className={`clientShell ${nunito.className}`}>
            <header className="topbar">
                <div className="brand">
                    <span className="brandLogo">🐾</span>
                    <div>
                        <strong>PetCare</strong>
                        <small>Zona utilizatorului</small>
                    </div>
                </div>

                <div className="topbarRight">
                    <span>{user.firstName} {user.lastName}</span>
                    <form action={logoutAction}>
                        <button type="submit" className="logoutBtn">Ieșire</button>
                    </form>
                </div>
            </header>

            <main className="clientMain">{children}</main>
        </div>
    );
}
