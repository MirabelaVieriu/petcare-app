"use client";

import { useRef, useState, useTransition } from "react";
import type { FormState } from "@/lib/pets/PetForm";

const PET_TYPES = ["Câine", "Pisică", "Pasăre", "Iepure", "Rozător", "Reptilă", "Altele"];

type Props = {
    action: (prev: FormState, formData: FormData) => Promise<FormState>;
    userId?: number;
    label?: string;
};

export default function AddPetButton({ action, userId, label = "＋ Adaugă animal" }: Props) {
    const [open, setOpen] = useState(false);
    const [state, setState] = useState<FormState>(undefined);
    const [pending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const nextState = await action(state, formData);
            setState(nextState);

            if (nextState?.ok) {
                formRef.current?.reset();
                setOpen(false);
            }
        });
    }

    if (!open) {
        return (
            <button type="button" className="addPetToggle" onClick={() => { setState(undefined); setOpen(true); }}>
                {label}
            </button>
        );
    }

    return (
        <form ref={formRef} action={handleSubmit} className="addPetPanel">
            {userId !== undefined && <input type="hidden" name="userId" value={userId} />}

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

            {state?.error && <p className="formError">{state.error}</p>}

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
