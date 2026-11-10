"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, type AuthState } from "@/lib/actions/auth";

type Props = { mode: "login" | "register"; role?: "admin" | "user" };

export default function AuthForm({ mode, role = "user" }: Props) {
    const action = mode === "login" ? loginAction : registerAction;
    const [state, formAction, pending] = useActionState<AuthState, FormData>(action, undefined);
    const isAdmin = role === "admin";

    const avatar = mode === "register" ? "🐾" : isAdmin ? "🩺" : "🐶";
    const title =
        mode === "register" ? "Creează cont" : isAdmin ? "Autentificare veterinar" : "Autentificare utilizator";
    const subtitle =
        mode === "register"
            ? "Alege-ți o parolă și ești gata să-ți programezi animalul."
            : "Introdu datele contului tău.";

    return (
        <div className="loginCard">
            <div className="loginAvatar">{avatar}</div>
            <h2>{title}</h2>
            <p className="loginSub">{subtitle}</p>

            <form action={formAction} className="authForm">
                {mode === "login" && <input type="hidden" name="role" value={role} />}

                {mode === "register" && (
                    <>
                        <div className="fieldRow">
                            <label className="field">
                                <span>Prenume</span>
                                <input name="firstName" required autoComplete="given-name" />
                            </label>
                            <label className="field">
                                <span>Nume</span>
                                <input name="lastName" required autoComplete="family-name" />
                            </label>
                        </div>
                        <label className="field">
                            <span>Telefon</span>
                            <input name="phone" type="tel" required autoComplete="tel" />
                        </label>
                    </>
                )}

                <label className="field">
                    <span>Email</span>
                    <input name="email" type="email" required autoComplete="email" />
                </label>

                <label className="field">
                    <span>Parolă</span>
                    <input
                        name="password"
                        type="password"
                        required
                        minLength={mode === "register" ? 8 : undefined}
                        autoComplete={mode === "register" ? "new-password" : "current-password"}
                    />
                </label>

                {mode === "register" && (
                    <label className="field">
                        <span>Confirmă parola</span>
                        <input name="confirm" type="password" required autoComplete="new-password" />
                    </label>
                )}

                {state?.error && <p className="formError" role="alert">{state.error}</p>}

                <button className="loginBtn loginBtnSubmit" disabled={pending}>
                    <span>{pending ? "Se procesează…" : mode === "register" ? "Creează cont" : "Intră în cont"}</span>
                    <span className="loginArrow">→</span>
                </button>
            </form>

            <div className="loginDivider"><span>navigare</span></div>

            <p className="loginHint">
                {mode === "login" && !isAdmin && (
                    <>Nu ai cont? <Link href="/register" className="textLink">Înregistrează-te</Link> · </>
                )}
                {mode === "register" && (
                    <>Ai deja cont? <Link href="/login/user" className="textLink">Autentifică-te</Link> · </>
                )}
                <Link href="/" className="textLink">← Înapoi</Link>
            </p>
        </div>
    );
}