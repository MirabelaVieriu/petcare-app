"use client";

import { useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";


type Props = {
    endpoint: string;
    redirectTo?: string;      
    title: string;
    description: ReactNode;
    label?: string;
    variant?: "button" | "icon";
    icon?: string;
    ariaLabel?: string;
};
export default function ConfirmDeleteButton({
                                                endpoint, redirectTo, title, description,
                                                label = "Șterge", variant = "button", icon = "⚠️", ariaLabel,
                                            }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const close = () => !pending && setOpen(false);

    const confirm = () => {
        setError(null);
        startTransition(async () => {
            try {
                const res = await fetch(endpoint, { method: "DELETE" });
                if (!res.ok) {
                    const data = await res.json().catch(() => null);
                    const first = data?.errors ? (Object.values(data.errors)[0] as string) : undefined;
                    setError(first ?? "Ștergerea a eșuat. Încearcă din nou.");
                    return;
                }
                setOpen(false);
                if (redirectTo) router.push(redirectTo);
                router.refresh();
            } catch {
                setError("Ștergerea a eșuat. Încearcă din nou.");
            }
        });
    };

    return (
        <>
            <button
                type="button"
                className={variant === "icon" ? "clientDeleteIcon" : "clientDeleteBtn"}
                title={ariaLabel ?? label}
                aria-label={ariaLabel ?? label}
                onClick={() => setOpen(true)}
            >
                {variant === "icon" ? "🗑" : `🗑 ${label}`}
            </button>

            {open &&
                createPortal(
                    <div className="modalBackdrop" onClick={close}>
                        <div className="modalBox" onClick={e => e.stopPropagation()}>
                            <div className="modalIcon">{icon}</div>
                            <h3>{title}</h3>
                            <p>{description}</p>
                            {error && <p className="formError">{error}</p>}
                            <div className="modalActions">
                                <button className="admBtnGhost" disabled={pending} onClick={close}>
                                    Anulează
                                </button>
                                <button className="modalDanger" disabled={pending} onClick={confirm}>
                                    {pending ? "Se șterge..." : "Da, șterge"}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}