import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "./session";
import type { Role } from "./session";

export async function apiAdminOnly(): Promise<NextResponse | null> {
    const s = await getSession();
    if (!s || s.role !== "ADMIN") {
        return NextResponse.json({ errors: { auth: "Neautorizat." } }, { status: 401 });
    }
    return null;
}

export const unauthorized = () =>
    NextResponse.json({ errors: { auth: "Neautorizat." } }, { status: 401 });

export async function apiSession(role: Role) {
    const s = await getSession();
    return s && s.role === role ? s : null;
}