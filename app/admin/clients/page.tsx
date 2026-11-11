
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { OwnerAccessor } from "@/lib/accessors/OwnerAccessor";
import ConfirmDeleteButton from "@/components/user/ConfirmDeleteButton";
import { deleteClient } from "./actions";
export const dynamic = "force-dynamic";

const initials = (fullName: string) =>
    fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join("");

export default async function AdminClientsPage() {
    const admin = await requireAdmin();
    const owners = await OwnerAccessor.getByVet(admin.id);

    return (
        <div className="admPage">
            <div className="admContainer clientsPage">

                <Link href="/admin" className="admBack">
                    ←
                </Link>

                <div className="clientsHero">
                    <div>
                        <span className="clientsEyebrow">
                            🐾 GESTIONARE CLIENȚI
                        </span>
                        <h1 className="admTitle">Clienții mei</h1>
                        <p className="admSubtitle">
                            Gestionează informațiile clienților și
                            accesează rapid profilurile acestora.
                        </p>
                    </div>

                    <div className="clientsHeroIcon">🐶</div>
                </div>

                <div className="clientsStats">
                    <div className="clientsStatIcon">👥</div>
                    <div>
                        <span className="clientsStatNumber">
                            {owners.length}
                        </span>
                        <span className="clientsStatLabel">
                            {owners.length === 1 ? "Client asociat" : "Clienți asociați"}
                        </span>
                    </div>
                </div>

                <div className="clientsSectionHeader">
                    <div>
                        <h2>Lista clienților</h2>
                        <p>Clienții asociați contului tău.</p>
                    </div>
                    <span className="clientsCount">
                        {owners.length} în total
                    </span>
                </div>

                {owners.length === 0 ? (
                    <div className="clientsEmpty">
                        <div>🐾</div>
                        <h3>Nu ai încă clienți asociați</h3>
                        <p>
                            Clienții vor apărea aici atunci când
                            vor fi asociați contului tău.
                        </p>
                    </div>
                ) : (
                    <div className="clientsGrid">
                        {owners.map((o, index) => (
                            <div key={o.id} className="clientCard">
                                <div className="clientCardTop">
                                    <div className={`clientAvatar clientAvatar${index % 4}`}>
                                        {initials(o.fullName)}
                                    </div>
                                    <span className="clientStatus">
                                        <span />
                                        Client
                                    </span>
                                </div>

                                <div className="clientInfo">
                                    <h3>{o.fullName}</h3>
                                    <p className="clientEmail">
                                        ✉ {o.email}
                                    </p>
                                    <p className="clientPhone">
                                        ☎ {o.phone || "Telefon neprecizat"}
                                    </p>
                                </div>

                                <div className="clientCardFooter">
                                    <span>Profil client</span>
                                    <div className="clientCardActions">
                                        <ConfirmDeleteButton
                                            variant="icon"
                                            action={deleteClient.bind(null, o.id)}
                                            ariaLabel={`Șterge ${o.fullName}`}
                                            title="Ștergi clientul?"
                                            description={
                                                <>
                                                    <strong>{o.fullName}</strong> va fi șters definitiv, cu
                                                    tot cu animale, abonamente și programări.
                                                </>
                                            }
                                        />
                                    <Link
                                        href={`/admin/clients/${o.id}`}
                                        className="clientDetailsBtn"
                                    >
                                        Vezi detalii <span>→</span>
                                    </Link>
                                </div>
                            </div>
                            </div>

                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
