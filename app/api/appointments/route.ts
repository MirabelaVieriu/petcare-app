import { NextResponse } from "next/server";
import { apiAdminOnly } from "@/lib/auth/apiGuard";
import { AppointmentsApiController } from "@/lib/controllers/AppointmentsApiController";

export const dynamic = "force-dynamic";

export async function GET() {
    const denied = await apiAdminOnly();
    if (denied) return denied;

    const res = await AppointmentsApiController.getAll();
    return NextResponse.json(res.body, { status: res.status });
}

export async function POST(request: Request) {
    const denied = await apiAdminOnly();
    if (denied) return denied;

    let json: unknown;
    try {
        json = await request.json();
    } catch {
        return NextResponse.json({ errors: { form: "JSON invalid." } }, { status: 400 });
    }

    const res = await AppointmentsApiController.create(json);
    const headers: HeadersInit = {};
    if (res.status === 201) headers["Location"] = `/api/appointments/${(res.body as { id: number }).id}`;
    return NextResponse.json(res.body, { status: res.status, headers });
}