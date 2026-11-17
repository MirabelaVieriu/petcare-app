import { apiSession, unauthorized } from "@/lib/auth/apiGuard";
import { ClientsApiController } from "@/lib/controllers/ClientsApiController";
import { fail, readJson, respond } from "@/lib/api/http";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
    const s = await apiSession("ADMIN");
    if (!s) return unauthorized();
    const json = await readJson(req);
    if (json === null) return respond(fail(400, { form: "JSON invalid." }));
    return respond(await ClientsApiController.addPet(s.id, Number((await params).id), json));
}