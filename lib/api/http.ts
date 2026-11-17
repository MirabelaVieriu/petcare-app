import { NextResponse } from "next/server";

export type ApiResponse = { status: number; body: unknown };

export const fail = (status: number, errors: Record<string, string>): ApiResponse => ({
    status,
    body: { errors },
});

export function respond(res: ApiResponse, headers?: HeadersInit) {
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    return NextResponse.json(res.body, { status: res.status, headers });
}

/** null = JSON invalid */
export async function readJson(req: Request): Promise<unknown | null> {
    try {
        return await req.json();
    } catch {
        return null;
    }
}

/** Permite reutilizarea parsePet (care citește FormData) pentru body JSON */
export function jsonToFormData(body: unknown): FormData {
    const fd = new FormData();
    if (body && typeof body === "object") {
        for (const [k, v] of Object.entries(body)) if (v != null) fd.append(k, String(v));
    }
    return fd;
}

export const validId = (id: number) => Number.isInteger(id) && id > 0;