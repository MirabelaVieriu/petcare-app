import { apiSession, unauthorized } from "@/lib/auth/apiGuard";
import { fail, readJson, respond } from "@/lib/api/http";
import { AppointmentsApiController } from "@/lib/controllers/AppointmentsApiController";

export const dynamic = "force-dynamic";

export async function GET() {
    if (!(await apiSession("ADMIN"))) return unauthorized();
    return respond(await AppointmentsApiController.getAll());
}
export async function POST(request: Request) {
    if (!(await apiSession("ADMIN"))) return unauthorized();


    const json = await readJson(request);
    if (json === null) return respond(fail(400, { form: "JSON invalid." }));

    const res = await AppointmentsApiController.create(json);
    const headers: HeadersInit = {};
    if (res.status === 201) headers["Location"] = `/api/appointments/${(res.body as { id: number }).id}`;
    return respond(res,headers);
}