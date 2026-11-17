import { apiSession, unauthorized } from "@/lib/auth/apiGuard";
import { PlansApiController } from "@/lib/controllers/PlansApiController";
import { fail, readJson, respond } from "@/lib/api/http";

export const dynamic = "force-dynamic";

export async function GET() {
    if (!(await apiSession("ADMIN"))) return unauthorized();
    return respond(await PlansApiController.getAll());
}

export async function POST(req: Request) {
    if (!(await apiSession("ADMIN"))) return unauthorized();
    const json = await readJson(req);
    if (json === null) return respond(fail(400, { form: "JSON invalid." }));
    return respond(await PlansApiController.create(json));
}