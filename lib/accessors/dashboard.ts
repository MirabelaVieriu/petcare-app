import { prisma } from "@/lib/prisma";

export async function getAdminDashboard(adminId: number) {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const weekEnd = new Date(dayStart);
    weekEnd.setDate(weekEnd.getDate() + 8);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const appointmentSelect = {
        id: true,
        service: true,
        date: true,
        user: { select: { firstName: true, lastName: true } },
        pet: { select: { name: true, type: true } },
    } as const;

    const [
        admin,
        todayAppointments,
        upcomingAppointments,
        usersCount,
        petsCount,
        activeSubscriptions,
        serviceRows,
        plans,
    ] = await Promise.all([
        prisma.admin.findUnique({
            where: { id: adminId },
            select: { firstName: true, lastName: true },
        }),
        prisma.appointment.findMany({
            where: { date: { gte: dayStart, lt: dayEnd } },
            select: appointmentSelect,
            orderBy: { date: "asc" },
        }),
        prisma.appointment.findMany({
            where: { date: { gte: dayEnd, lt: weekEnd } },
            select: appointmentSelect,
            orderBy: { date: "asc" },
            take: 5,
        }),
        prisma.user.count(),
        prisma.pet.count(),
        prisma.subscription.count({ where: { active: true } }),
        prisma.appointment.groupBy({
            by: ["service"],
            where: { date: { gte: monthStart, lt: nextMonthStart } },
            _count: { _all: true },
        }),
        prisma.plan.findMany({
            select: {
                id: true,
                name: true,
                price: true,
                priority: true,
                _count: { select: { subscriptions: { where: { active: true } } } },
            },
            orderBy: { price: "asc" },
            take: 4,
        }),
    ]);

    return {
        admin,
        todayAppointments,
        upcomingAppointments,
        stats: {
            todayCount: todayAppointments.length,
            usersCount,
            petsCount,
            activeSubscriptions,
        },
        servicesThisMonth: serviceRows.map(r => ({
            service: r.service,
            count: r._count._all,
        })),
        plans: plans.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            priority: p.priority,
            subscribers: p._count.subscriptions,
        })),
    };
}