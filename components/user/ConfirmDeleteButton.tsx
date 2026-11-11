"use client";

import { useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Result = { error?: string } | void;

type Props = {
    action: () => Promise<Result>;   
    title: string;                   
    description: ReactNode;          
    label?: string;                  
    variant?: "button" | "icon";
    icon?: string;                   
    ariaLabel?: string;
};

export default function ConfirmDeleteButton({
                                                action,
                                                title,
                                                description,
                                                label = "Șterge",
                                                variant = "button",
                                                icon = "⚠️",
                                                ariaLabel,
                                            }: Props) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const close = () => !pending && setOpen(false);

    const confirm = () => {
        setError(null);
        startTransition(async () => {
            try {
                const res = await action();
                if (res && res.error) setError(res.error);
                else setOpen(false);
            } catch (e: unknown) {
            const digest = (e as { digest?: unknown } | null)?.digest;
            if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw e;
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
