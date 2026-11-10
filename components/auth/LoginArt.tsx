const FEATURES = [
    { icon: "📅", title: "Programări rapide", text: "Agenda zilei, mereu la îndemână" },
    { icon: "⭐", title: "Abonamente", text: "Planuri și consum lunar la zi" },
    { icon: "🩺", title: "Grijă completă", text: "Clienți și animale într-un singur loc" },
];

const ANIMALS = ["🐶", "🐱", "🐰", "🐹"];
const FLOATERS = ["🐾", "🐾", "🦴", "🐾", "🦴", "🐾"];

export default function LoginArt() {
    return (
        <section className="loginArt">
            {FLOATERS.map((f, i) => (
                <span key={i} className={`floater f${i + 1}`} aria-hidden>{f}</span>
            ))}

            <div className="loginBrand">
                <span className="loginLogo">🐾</span>
                <strong>PetCare</strong>
            </div>

            <div className="loginHeadline">
                <span className="loginBadge">Platformă pentru cabinete veterinare</span>
                <h1>Grijă pentru prietenii tăi <em>blănoși</em></h1>
            </div>

            <ul className="loginFeatures">
                {FEATURES.map(f => (
                    <li key={f.title}>
                        <span className="featIcon">{f.icon}</span>
                        <div>
                            <strong>{f.title}</strong>
                            <small>{f.text}</small>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="loginAnimals" aria-hidden>
                {ANIMALS.map((a, i) => (
                    <span key={a} style={{ animationDelay: `${i * 0.25}s` }}>{a}</span>
                ))}
            </div>
        </section>
    );
}