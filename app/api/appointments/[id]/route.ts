import { AppointmentsApiController } from "@/lib/controllers/AppointmentsApiController";
import { apiSession, unauthorized } from "@/lib/auth/apiGuard";
import { fail,readJson,respond } from "@/lib/api/http";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
    if (!(await apiSession("ADMIN"))) return unauthorized();
    return respond(await AppointmentsApiController.getById(Number((await params).id)));
}

export async function PUT(request: Request, { params }: Ctx) {
    const s = await apiSession("ADMIN");
    if (!s) return unauthorized();

    const json = await readJson(request);
    if (json === null) return respond(fail(400, { form: "JSON invalid." }));

    return respond(await AppointmentsApiController.update(Number((await params).id), json,s.id));
}
export async function DELETE(_req: Request, { params }: Ctx) {
    if (!(await apiSession("ADMIN"))) return unauthorized();
    return respond(await AppointmentsApiController.remove(Number((await params).id)));
}