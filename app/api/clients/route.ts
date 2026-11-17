import { apiSession, unauthorized } from "@/lib/auth/apiGuard";
import { ClientsApiController } from "@/lib/controllers/ClientsApiController";
import { respond } from "@/lib/api/http";

export const dynamic = "force-dynamic";

export async function GET() {
    const s = await apiSession("ADMIN");
    if (!s) return unauthorized();
    return respond(await ClientsApiController.getAll(s.id));
}