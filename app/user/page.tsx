import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { petEmoji } from "@/lib/models/OwnerViewModel";
import AddPetButton from "@/components/pets/AddPetButton";
import ConfirmDeleteButton from "@/components/user/ConfirmDeleteButton";
import { createMyPet, deleteMyPet } from "./actions";

export const dynamic = "force-dynamic";

const TZ = "Europe/Bucharest";

const fmt = (d: Date) =>
    d.toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short", timeZone: TZ });
const fmtDay = (d: Date) => d.toLocaleDateString("ro-RO", { dateStyle: "medium", timeZone: TZ });

// Etichetele serviciilor, într-un singur loc. Ajustează-le după cum le folosești în aplicație.
const SERVICE_LABEL: Record<string, string> = {
    PETS: "Animale",
    CONSULT: "Consult",
    TELE: "Teleconsult",
    GROOMING: "Grooming",
    VACCINE: "Vaccinare",
    HOME_VISIT: "Vizită la domiciliu",
};
const serviceLabel = (s: string) => SERVICE_LABEL[s] ?? s.replaceAll("_", " ");

export default async function UserHomePage() {
    const user = await requireUser();
    const now = new Date();

    const [pets, appointments, upcomingCount, subscription, vet] = await Promise.all([
        prisma.pet.findMany({
            where: { userId: user.id },
            orderBy: { name: "asc" },
            select: { id: true, name: true, type: true, breed: true, age: true },
        }),
        prisma.appointment.findMany({
            where: { userId: user.id, date: { gte: now } },
            orderBy: { date: "asc" },
            take: 5,
            select: { id: true, service: true, date: true, pet: { select: { name: true } } },
        }),
        prisma.appointment.count({ where: { userId: user.id, date: { gte: now } } }),
        prisma.subscription.findFirst({
            where: { userId: user.id, active: true },
            orderBy: { startDate: "desc" },
            select: {
                startDate: true,
                plan: {
                    select: {
                        name: true,
                        price: true,
                        priority: true,
                        services: { select: { service: true, perMonth: true } },
                    },
                },
            },
        }),
        user.vetId
            ? prisma.admin.findUnique({
                where: { id: user.vetId },
                select: { firstName: true, lastName: true, phone: true },
            })
            : null,
    ]);

    const today = now.toLocaleDateString("ro-RO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: TZ,
    });

    return (
        <>
            {/* Antet */}
            <section className="hero">
                <div>
                    <p className="date">{today}</p>
                    <h1>Bună, {user.firstName}! 👋</h1>
                    <p className="heroText">
                        {pets.length === 0
                            ? "Începe prin a-ți adăuga primul animal de companie."
                            : "Iată un rezumat al animalelor, programărilor și abonamentului tău."}
                    </p>
                </div>
                <div className="heroArt" aria-hidden>
                    <span>🐶</span>
                    <span>🐱</span>
                </div>
            </section>

            {/* Statistici */}
            <div className="stats">
                <div className="statCard mint">
                    <span className="statIcon">🐾</span>
                    <div>
                        <strong>{pets.length}</strong>
                        <small>{pets.length === 1 ? "Animal" : "Animale"}</small>
                    </div>
                </div>
                <div className="statCard sky">
                    <span className="statIcon">📅</span>
                    <div>
                        <strong>{upcomingCount}</strong>
                        <small>Programări viitoare</small>
                    </div>
                </div>
                <div className="statCard peach">
                    <span className="statIcon">⭐</span>
                    <div>
                        <strong>{subscription ? subscription.plan.name : "—"}</strong>
                        <small>Abonament activ</small>
                    </div>
                </div>
            </div>

            <div className="grid">
                {/* Animale */}
                <section className="card">
                    <div className="cardHead">
                        <h2>🐾 Animalele mele</h2>
                        <span className="countPill">{pets.length}</span>
                    </div>

                    <AddPetButton action={createMyPet} />

                    {pets.length === 0 ? (
                        <div className="empty">
                            <span>🐶</span>
                            <p>Nu ai adăugat încă niciun animal.</p>
                        </div>
                    ) : (
                        <div className="clientPetsList">
                            {pets.map(p => (
                                <div key={p.id} className="clientPetItem">
                                    <div className="clientPetAvatar">{petEmoji(p.type)}</div>
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
                                        action={deleteMyPet.bind(null, p.id)}
                                        ariaLabel={`Șterge animalul ${p.name}`}
                                        title="Ștergi animalul?"
                                        description={
                                            <>
                                                <strong>{p.name}</strong> va fi eliminat din contul tău.
                                                Programările lui rămân în istoric, fără animal asociat.
                                            </>
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className="side">
                    {/* Programări */}
                    <section className="card">
                        <div className="cardHead">
                            <h2>📅 Programări viitoare</h2>
                        </div>

                        {appointments.length === 0 ? (
                            <div className="empty">
                                <span>🗓️</span>
                                <p>Nu ai programări viitoare.</p>
                            </div>
                        ) : (
                            <ul className="upcoming">
                                {appointments.map(a => (
                                    <li key={a.id}>
                                        <div>
                                            <span className={`badge svc${a.service}`}>{serviceLabel(a.service)}</span>
                                            {a.pet && <small className="apptPet"> · {a.pet.name}</small>}
                                        </div>
                                        <span className="upDate">{fmt(a.date)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Abonament */}
                    <section className="card">
                        <div className="cardHead">
                            <h2>⭐ Abonamentul meu</h2>
                        </div>

                        {subscription ? (
                            <>
                                <div className="planName">
                                    <span>{subscription.plan.name}</span>
                                    <span className="price">{subscription.plan.price} lei</span>
                                </div>
                                <p className="planNote">
                                    Activ din {fmtDay(subscription.startDate)}
                                    {subscription.plan.priority ? " · Prioritate la programări" : ""}
                                </p>
                                {subscription.plan.services.length > 0 && (
                                    <ul className="upcoming">
                                        {subscription.plan.services.map(s => (
                                            <li key={s.service}>
                                                <span className="upService">{serviceLabel(s.service)}</span>
                                                <span className="upDate">{s.perMonth} / lună</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <div className="empty">
                                <span>📋</span>
                                <p>Nu ai un abonament activ.</p>
                            </div>
                        )}
                    </section>

                    {/* Veterinar */}
                    {vet && (
                        <section className="card">
                            <div className="cardHead">
                                <h2>🩺 Veterinarul tău</h2>
                            </div>
                            <div className="vetCard">
                                <div className="vetAvatar">🩺</div>
                                <div>
                                    <strong>{vet.firstName} {vet.lastName}</strong>
                                    <small>{vet.phone}</small>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}
