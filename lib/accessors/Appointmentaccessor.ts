import { prisma } from "@/lib/prisma";
import type {
    AppointmentData,
    AppointmentFormOptions,
    AppointmentViewModel,
} from "@/lib/models/Appoinmentviewmodel";

export const AppointmentAccessor = {
    /** Index: programările, cu numele din tabelele legate (JOIN) */
    async getEntities(): Promise<AppointmentViewModel[]> {
        const rows = await prisma.appointment.findMany({
            select: {
                id: true,
                date: true,
                service: true,
                user: { select: { firstName: true, lastName: true } },
                pet: { select: { name: true, type: true } },
                admin: { select: { firstName: true, lastName: true } },
            },
            orderBy: { date: "desc" },
        });

        return rows.map(row => ({
            id: row.id,
            date: row.date,
            service: row.service,
            clientName: `${row.user.firstName} ${row.user.lastName}`,
            petName: row.pet?.name ?? null,
            petType: row.pet?.type ?? null,
            vetName: row.admin ? `Dr. ${row.admin.firstName} ${row.admin.lastName}` : null,
        }));
    },

    /** Create: datele pentru listele de selecție */
    async getFormOptions(): Promise<AppointmentFormOptions> {
        const [users, pets, admins] = await Promise.all([
            prisma.user.findMany({
                select: { id: true, firstName: true, lastName: true },
                orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
            }),
            prisma.pet.findMany({
                select: { id: true, userId: true, name: true, type: true },
                orderBy: { name: "asc" },
            }),
            prisma.admin.findMany({
                select: { id: true, firstName: true, lastName: true },
                orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
            }),
        ]);

        return {
            clients: users.map(u => ({ id: u.id, label: `${u.lastName} ${u.firstName}` })),
            pets: pets.map(p => ({ id: p.id, userId: p.userId, label: `${p.name} (${p.type})` })),
            vets: admins.map(a => ({ id: a.id, label: `Dr. ${a.firstName} ${a.lastName}` })),
        };
    },

    /** Regulă de business: animalul trebuie să fie al clientului ales */
    async petBelongsToUser(petId: number, userId: number): Promise<boolean> {
        const count = await prisma.pet.count({ where: { id: petId, userId } });
        return count > 0;
    },

    /** Create */
    async addEntity(data: AppointmentData): Promise<number> {
        const created = await prisma.appointment.create({
            data: {
                userId: data.userId,
                petId: data.petId,
                adminId: data.adminId,
                service: data.service,
                date: data.date,
            },
            select: { id: true },
        });
        return created.id;
    },

    /** Edit: o programare după id (pentru precompletarea formularului) */
    async getEntity(id: number) {
        return prisma.appointment.findUnique({
            where: { id },
            select: {
                id: true,
                userId: true,
                petId: true,
                adminId: true,
                service: true,
                date: true,
            },
        });
    },

    /** Update */
    async updateEntity(id: number, data: AppointmentData): Promise<void> {
        await prisma.appointment.update({
            where: { id },
            data: {
                userId: data.userId,
                petId: data.petId,
                adminId: data.adminId,
                service: data.service,
                date: data.date,
            },
        });
    },

    /** Delete */
    async deleteEntity(id: number): Promise<void> {
        await prisma.appointment.delete({ where: { id } });
    },
};