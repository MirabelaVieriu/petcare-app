import "server-only";
import { NextResponse } from "next/server";
import { getSession, type Role } from "./session";

export const unauthorized = () =>
    NextResponse.json({ errors: { auth: "Neautorizat." } }, { status: 401 });

export async function apiSession(role: Role) {
    const s = await getSession();
    return s && s.role === role ? s : null;
}