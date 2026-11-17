import { apiSession, unauthorized } from "@/lib/auth/apiGuard";
import { PlansApiController } from "@/lib/controllers/PlansApiController";
import { fail, readJson, respond } from "@/lib/api/http";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
    if (!(await apiSession("ADMIN"))) return unauthorized();
    return respond(await PlansApiController.getById(Number((await params).id)));
}

export async function PUT(req: Request, { params }: Ctx) {
    if (!(await apiSession("ADMIN"))) return unauthorized();
    const json = await readJson(req);
    if (json === null) return respond(fail(400, { form: "JSON invalid." }));
    return respond(await PlansApiController.update(Number((await params).id), json));
}

export async function DELETE(_req: Request, { params }: Ctx) {
    if (!(await apiSession("ADMIN"))) return unauthorized();
    return respond(await PlansApiController.remove(Number((await params).id)));
}