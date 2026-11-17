"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const PET_TYPES = ["Câine", "Pisică", "Pasăre", "Iepure", "Rozător", "Reptilă", "Altele"];

type Props = { endpoint: string; label?: string };


export default function AddPetButton({ endpoint, label = "＋ Adaugă animal" }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            setError(null);
            try {
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(Object.fromEntries(formData)),
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => null);
                    const first = data?.errors ? (Object.values(data.errors)[0] as string) : undefined;
                    setError(first ?? "Nu s-a putut salva animalul.");
                    return;
                }
                formRef.current?.reset();
                setOpen(false);
                router.refresh();
            } catch {
                setError("Eroare de rețea.");
            }
        });
    }
    if (!open) {
        return (
            <button
                type="button"
                className="addPetToggle"
                onClick={() => { setError(null); setOpen(true); }}
            >
                {label}
            </button>
        );
    }

    return (
        <form ref={formRef} action={handleSubmit} className="addPetPanel">
            <div className="admGrid2">
                <div className="admField">
                    <label htmlFor="petName">Nume</label>
                    <input id="petName" name="name" required autoComplete="off" />
                </div>
                <div className="admField">
                    <label htmlFor="petType">Tip</label>
                    <select id="petType" name="type" required defaultValue="">
                        <option value="" disabled>Alege...</option>
                        {PET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            <div className="admGrid2">
                <div className="admField">
                    <label htmlFor="petBreed">Rasă (opțional)</label>
                    <input id="petBreed" name="breed" autoComplete="off" />
                </div>
                <div className="admField">
                    <label htmlFor="petAge">Vârstă, ani (opțional)</label>
                    <input id="petAge" name="age" type="number" min={0} max={60} step={1} />
                </div>
            </div>

            {error && <p className="formError">{error}</p>}

            <div className="admActions">
                <button type="submit" className="admBtnPrimary" disabled={pending}>
                    {pending ? "Se salvează..." : "Salvează animalul"}
                </button>
                <button type="button" className="admBtnGhost" disabled={pending} onClick={() => setOpen(false)}>
                    Anulează
                </button>
            </div>
        </form>
    );
}
