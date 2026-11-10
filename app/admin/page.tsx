import Link from "next/link";
import { Nunito } from "next/font/google";
import { AccountAccessor } from "@/lib/accessors/AcountAccessor";
import { getSession } from "@/lib/auth/session";
import { logoutAction } from "@/lib/actions/auth";

const nunito = Nunito({ subsets: ["latin", "latin-ext"], weight: ["400", "600", "700", "800"] });

export const dynamic = "force-dynamic";

export default async function AdminHome() {
    const session = await getSession();
    const name = session ? await AccountAccessor.getName("ADMIN", session.id) : null;

    return (
        <div className={`dashPage ${nunito.className}`}>
            <div className="dashContainer">
                <div className="dashTop">
                    <div>
                        <h1 className="dashHello">Panou veterinar</h1>
                        <p className="dashRole">{name ? `Cont activ: Dr. ${name}` : "Administrare cabinet"}</p>
                    </div>
                    <form action={logoutAction}>
                        <button className="dashLogout">Deconectare</button>
                    </form>
                </div>

                <div className="dashGrid">
                    <Link href="/admin/plans" className="dashTile">
                        <span className="dashTileIcon">⭐</span>
                        <h2 className="dashTileTitle">Planuri</h2>
                        <p className="dashTileText">Abonamente: adaugă, editează, șterge</p>
                    </Link>
                    <Link href="/admin/appointments" className="dashTile">
                        <span className="dashTileIcon">📅</span>
                        <h2 className="dashTileTitle">Programări</h2>
                        <p className="dashTileText">Vezi agenda și creează programări</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}