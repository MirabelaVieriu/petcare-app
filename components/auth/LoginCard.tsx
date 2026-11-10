"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthState } from "@/lib/actions/auth";

type Role = "admin" | "user";

const ROLES: Record<Role, { label: string; icon: string; title: string; sub: string }> = {
    admin: {
        label: "Veterinar",
        icon: "🩺",
        title: "Bine ai venit, doctore!",
        sub: "Intră în panoul tău de veterinar.",
    },
    user: {
        label: "Utilizator",
        icon: "🐶",
        title: "Bine ai revenit!",
        sub: "Vezi animalele tale, programările și abonamentul.",
    },
};

function LoginForm({ role }: { role: Role }) {
    const [state, formAction, pending] = useActionState<AuthState, FormData>(loginAction, undefined);

    return (
        <form action={formAction} className="authForm">
            <input type="hidden" name="role" value={role} />

            <label className="field">
                <span>Email</span>
                <input name="email" type="email" required autoComplete="email" />
            </label>

            <label className="field">
                <span>Parolă</span>
                <input name="password" type="password" required autoComplete="current-password" />
            </label>

            {state?.error && <p className="formError" role="alert">{state.error}</p>}

            <button className="loginBtn loginBtnSubmit" disabled={pending}>
                <span>{pending ? "Se procesează…" : "Intră în cont"}</span>
                <span className="loginArrow">→</span>
            </button>
        </form>
    );
}

export default function LoginCard() {
    const [role, setRole] = useState<Role>("admin");
    const current = ROLES[role];

    return (
        <div className="loginCard">
            <div className="roleTabs" role="tablist" aria-label="Tip logare">
                {(Object.keys(ROLES) as Role[]).map(key => (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={role === key}
                        className={`roleTab ${role === key ? "active" : ""}`}
                        onClick={() => setRole(key)}
                    >
                        <span>{ROLES[key].icon}</span> {ROLES[key].label}
                    </button>
                ))}
            </div>

            <div className="loginAvatar">{current.icon}</div>
            <h2>{current.title}</h2>
            <p className="loginSub">{current.sub}</p>

            {/* key pe formular: la schimbarea tabului, câmpurile și eroarea se golesc */}
            <LoginForm key={`form-${role}`} role={role} />

            <div className="loginDivider"><span>{current.label}</span></div>

            {role === "user" ? (
                <p className="loginHint">
                    Nu ai cont? <Link href="/register" className="textLink">Creează unul</Link>
                </p>
            ) : (
                <p className="loginHint">🐾 Fiecare animal merită o zi bună.</p>
            )}
        </div>
    );
}