import { apiSession, unauthorized } from "@/lib/auth/apiGuard";
import { MeApiController } from "@/lib/controllers/MeApiController";
import { respond } from "@/lib/api/http";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const s = await apiSession("USER");
    if (!s) return unauthorized();
    return respond(await MeApiController.removePet(s.id, Number((await params).id)));
}