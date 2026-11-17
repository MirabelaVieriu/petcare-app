import { NextResponse } from "next/server";
import { apiAdminOnly } from "@/lib/auth/apiGuard";
import { AppointmentsApiController } from "@/lib/controllers/AppointmentsApiController";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
    const denied = await apiAdminOnly();
    if (denied) return denied;

    const { id } = await params;
    const res = await AppointmentsApiController.getById(Number(id));
    return NextResponse.json(res.body, { status: res.status });
}

export async function PUT(request: Request, { params }: Ctx) {
    const denied = await apiAdminOnly();
    if (denied) return denied;

    let json: unknown;
    try {
        json = await request.json();
    } catch {
        return NextResponse.json({ errors: { form: "JSON invalid." } }, { status: 400 });
    }

    const { id } = await params;
    const res = await AppointmentsApiController.update(Number(id), json);
    return NextResponse.json(res.body, { status: res.status });
}