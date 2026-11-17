import { apiSession, unauthorized } from "@/lib/auth/apiGuard";
import { MeApiController } from "@/lib/controllers/MeApiController";
import { fail, readJson, respond } from "@/lib/api/http";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const s = await apiSession("USER");
    if (!s) return unauthorized();
    const json = await readJson(req);
    if (json === null) return respond(fail(400, { form: "JSON invalid." }));
    return respond(await MeApiController.addPet(s.id, json));
}