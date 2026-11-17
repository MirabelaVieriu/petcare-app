import { apiSession, unauthorized } from "@/lib/auth/apiGuard";
import { ClientsApiController } from "@/lib/controllers/ClientsApiController";
import { respond } from "@/lib/api/http";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
    const s = await apiSession("ADMIN");
    if (!s) return unauthorized();
    return respond(await ClientsApiController.getById(s.id, Number((await params).id)));
}

export async function DELETE(_req: Request, { params }: Ctx) {
    const s = await apiSession("ADMIN");
    if (!s) return unauthorized();
    return respond(await ClientsApiController.remove(s.id, Number((await params).id)));
}