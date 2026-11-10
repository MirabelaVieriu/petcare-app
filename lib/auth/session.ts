import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type Role = "ADMIN" | "USER";
export type Session = { id: number; role: Role };

const COOKIE = "petcare_session";

function getKey() {
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error("Lipsește AUTH_SECRET din .env");
    return new TextEncoder().encode(secret);
}

export async function createSession(s: Session) {
    const token = await new SignJWT({ ...s })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(getKey());

    (await cookies()).set(COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });
}

export async function getSession(): Promise<Session | null> {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, getKey());
        return { id: payload.id as number, role: payload.role as Role };
    } catch {
        return null;
    }
}

export async function destroySession() {
    (await cookies()).delete(COOKIE);
}