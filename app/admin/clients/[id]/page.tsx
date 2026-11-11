
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { OwnerAccessor } from "@/lib/accessors/OwnerAccessor";
import { petEmoji } from "@/lib/models/OwnerViewModel";
import ConfirmDeleteButton from "@/components/user/ConfirmDeleteButton";
import AddPetButton from "@/components/pets/AddPetButton";
import { createPet, deleteClient, deletePet } from "../actions"
export const dynamic = "force-dynamic";

const fmt = (d: Date) =>
    d.toLocaleString("ro-RO", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/Bucharest",
    });

const getInitials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join("")
        .toUpperCase();

export default async function ClientDetailPage({
                                                   params,
                                               }: {
    params: Promise<{ id: string }>;
}) {
    const admin = await requireAdmin();
    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId)) notFound();

    const client = await OwnerAccessor.getDetail(admin.id, userId);
    if (!client) notFound();

    return (
        <div className="admPage">
            <div className="admContainer clientDetailPage">

                <Link href="/admin/clients" className="admBack">
                    ← Înapoi la clienți
                </Link>

                {/* Antet client */}
                <section className="clientProfileHeader">
                    <div className="clientProfileAvatar">
                        {getInitials(client.fullName)}
                    </div>

                    <div className="clientProfileInfo">
                        <span className="clientProfileLabel">
                            PROFIL CLIENT
                        </span>
                        <h1>{client.fullName}</h1>
                        <p>Informații despre client și activitatea acestuia</p>
                    </div>

                    <div className="clientProfileBadge">
                        <span className="clientOnlineDot" />
                        Client înregistrat
                    </div>
                <ConfirmDeleteButton
                    action={deleteClient.bind(null, userId)}
                    label="Șterge clientul"
                    title="Ștergi clientul?"
                    description={
                        <>
                            <strong>{client.fullName}</strong> va fi șters definitiv, împreună cu
                            animalele, abonamentele și programările lui. Acțiunea nu poate fi anulată.
                        </>
                    }
                />
            </section>

            {/* Date de contact */}
                <section className="clientContactCard">
                    <div className="clientSectionHeading">
                        <div className="clientSectionIcon">👤</div>
                        <div>
                            <h2>Date de contact</h2>
                            <p>Informațiile personale ale clientului</p>
                        </div>
                    </div>

                    <div className="clientContactGrid">
                        <div className="clientContactItem">
                            <span className="clientContactIcon">✉️</span>
                            <div>
                                <span className="clientFieldLabel">Adresă email</span>
                                <strong>{client.email}</strong>
                            </div>
                        </div>

                        <div className="clientContactItem">
                            <span className="clientContactIcon">📞</span>
                            <div>
                                <span className="clientFieldLabel">Telefon</span>
                                <strong>{client.phone || "Nespecificat"}</strong>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Statistici */}
                <div className="clientQuickStats">
                    <div className="clientQuickStat">
                        <span className="clientQuickStatIcon">🐾</span>
                        <div>
                            <strong>{client.pets.length}</strong>
                            <span>Animale înregistrate</span>
                        </div>
                    </div>

                    <div className="clientQuickStat">
                        <span className="clientQuickStatIcon">⭐</span>
                        <div>
                            <strong>{client.subscriptions.length}</strong>
                            <span>Abonamente</span>
                        </div>
                    </div>

                    <div className="clientQuickStat">
                        <span className="clientQuickStatIcon">📅</span>
                        <div>
                            <strong>{client.appointments.length}</strong>
                            <span>Programări</span>
                        </div>
                    </div>
                </div>

                <div className="clientDetailGrid">

                    {/* Animale */}
                    <section className="clientDetailCard">
                        <div className="clientSectionHeading">
                            <div className="clientSectionIcon">🐾</div>
                            <div>
                                <h2>Animalele clientului</h2>
                                <p>Animalele de companie înregistrate</p>
                            </div>
                            <span className="clientSectionCount">
                                {client.pets.length}
                            </span>
                        </div>
                        <AddPetButton action={createPet} userId={userId} />

                        {client.pets.length === 0 ? (
                            <div className="clientDetailEmpty">
                                <span>🐶</span>
                                <p>Nu există animale înregistrate.</p>
                            </div>
                        ) : (
                            <div className="clientPetsList">
                                {client.pets.map(p => (
                                    <div key={p.id} className="clientPetItem">
                                        <div className="clientPetAvatar">
                                            {petEmoji(p.type)}
                                        </div>
                                        <div className="clientPetInfo">
                                            <strong>{p.name}</strong>
                                            <span>
                                                {[p.type, p.breed, p.age !== null ? `${p.age} ani` : null]
                                                    .filter(Boolean)
                                                    .join(" · ")}
                                            </span>
                                        </div>
                                        <ConfirmDeleteButton
                                            variant="icon"
                                            icon="🐾"
                                            action={deletePet.bind(null, p.id)}
                                            ariaLabel={`Șterge animalul ${p.name}`}
                                            title="Ștergi animalul?"
                                            description={
                                                <>
                                                    <strong>{p.name}</strong> va fi eliminat din profilul
                                                    clientului. Programările lui rămân în istoric, fără
                                                    animal asociat.
                                                </>
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Abonamente */}
                    <section className="clientDetailCard">
                        <div className="clientSectionHeading">
                            <div className="clientSectionIcon">⭐</div>
                            <div>
                                <h2>Abonamente</h2>
                                <p>Planurile clientului</p>
                            </div>
                            <span className="clientSectionCount">
                                {client.subscriptions.length}
                            </span>
                        </div>

                        {client.subscriptions.length === 0 ? (
                            <div className="clientDetailEmpty">
                                <span>📋</span>
                                <p>Clientul nu are abonamente.</p>
                            </div>
                        ) : (
                            <div className="clientRecordsList">
                                {client.subscriptions.map(s => (
                                    <div key={s.id} className="clientSubscriptionItem">
                                        <div className="clientRecordIcon">⭐</div>
                                        <div className="clientRecordInfo">
                                            <strong>{s.planName}</strong>
                                            <span>Înregistrat din {fmt(s.since)}</span>
                                        </div>
                                        <span className={`clientStatusBadge ${s.active ? "isActive" : "isCancelled"}`}>
                                            {s.active ? "Activ" : "Anulat"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Programări */}
                    <section className="clientDetailCard clientAppointmentsCard">
                        <div className="clientSectionHeading">
                            <div className="clientSectionIcon">📅</div>
                            <div>
                                <h2>Ultimele programări</h2>
                                <p>Istoricul programărilor clientului</p>
                            </div>
                            <span className="clientSectionCount">
                                {client.appointments.length}
                            </span>
                        </div>

                        {client.appointments.length === 0 ? (
                            <div className="clientDetailEmpty">
                                <span>🗓️</span>
                                <p>Nu există programări înregistrate.</p>
                            </div>
                        ) : (
                            <div className="clientAppointmentsList">
                                {client.appointments.map(a => (
                                    <div key={a.id} className="clientAppointmentItem">
                                        <div className="clientAppointmentDate">
                                            <span>📅</span>
                                        </div>

                                        <div className="clientAppointmentInfo">
                                            <strong>
                                                {a.service.replaceAll("_", " ")}
                                            </strong>
                                            <span>
                                                {a.petName
                                                    ? `Animal: ${a.petName}`
                                                    : "Fără animal asociat"}
                                            </span>
                                        </div>

                                        <div className="clientAppointmentTime">
                                            {fmt(a.date)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
