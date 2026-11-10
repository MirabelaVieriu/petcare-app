import {
    CreateUserInput, UpdateUserInput, ListUsersInput,
    CreateAdminInput, UpdateAdminInput, ListAdminsInput,
    CreatePlanInput, UpdatePlanInput, ListPlansInput,
    CreatePlanServiceInput, UpdatePlanServiceInput, ListPlanServicesInput,
    CreateSubscriptionInput, UpdateSubscriptionInput, ListSubscriptionsInput,
    CreatePetInput, UpdatePetInput, ListPetsInput,
    CreateAppointmentInput, UpdateAppointmentInput, ListAppointmentsInput,
} from "./models";
import bcrypt from "bcryptjs";
import {prisma} from "./lib/prisma";

const omitHash = {passwordHash: true} as const;
const normEmail = (e: string) => e.trim().toLowerCase();

// ─── User ────────────────────────────────────────────────
export async function addUser(input: CreateUserInput) {
    return prisma.user.create({
        data: {
            email: normEmail(input.email),
            passwordHash: await bcrypt.hash(input.password, 10),
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
        },
        omit: omitHash,
    });
}


export async function getUser(input: { id?: number; email?: string }) {
    if (!input.id && !input.email) {
        throw new Error("Provide either id or email");
    }
    const user = await prisma.user.findFirst({
        where: {
            ...(input.id && {id: input.id}),
            ...(input.email && {email: input.email}),
        },
        include: {
            pets: {select: {id: true, name: true, type: true, breed: true, age: true}},
            subscriptions: {
                where: {active: true},
                select: {id: true, startDate: true, plan: {select: {id: true, name: true}}},
            },
        },
    });
    if (!user) throw new Error("User not found");
    return user;
}

export async function updateUser(id: number, input: UpdateUserInput) {
    return prisma.user.update({
        where: {id},
        data: {
            ...(input.email !== undefined && {email: normEmail(input.email)}),
            ...(input.password && {passwordHash: await bcrypt.hash(input.password, 10)}),
            ...(input.firstName !== undefined && {firstName: input.firstName}),
            ...(input.lastName !== undefined && {lastName: input.lastName}),
            ...(input.phone !== undefined && {phone: input.phone}),
        },
        omit: omitHash,
    });
}
export async function listUsers(filters: ListUsersInput) {
    const users = await prisma.user.findMany({
        where: {
            ...(filters.email && {
                email: { contains: filters.email, mode: "insensitive" }
            }),
            ...(filters.firstName && {
                firstName: { contains: filters.firstName, mode: "insensitive" }
            }),
            ...(filters.lastName && {
                lastName: { contains: filters.lastName, mode: "insensitive" }
            }),
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            _count: {
                select: {
                    pets: true,
                    appointments: true,
                    subscriptions: true
                }
            }
        },
        orderBy: [
            { lastName: "asc" },
            { firstName: "asc" }
        ],
    });

    return {
        total: users.length,
        users
    };
}

export async function deleteUser(id: number) {
    // Pets, appointments și subscriptions se șterg în cascadă (onDelete: Cascade)
    const user = await prisma.user.delete({
        where: {id},
        select: {id: true, firstName: true, lastName: true},
    });
    return {
        message: `User ${user.firstName} ${user.lastName} was successfully deleted.`,
        user,
    };
}

// ─── Admin ───────────────────────────────────────────────
export async function addAdmin(input: CreateAdminInput) {
    return prisma.admin.create({
        data: {
            email: normEmail(input.email),
            passwordHash: await bcrypt.hash(input.password, 10),
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
        },
        omit: omitHash,
    });
}

export async function listAdmins(filters: ListAdminsInput) {
    const admins = await prisma.admin.findMany({
        where: {
            ...(filters.email !== undefined && {email: filters.email}),
            ...(filters.firstName && {firstName: {contains: filters.firstName, mode: "insensitive"}}),
            ...(filters.lastName && {lastName: {contains: filters.lastName, mode: "insensitive"}}),
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            _count: {select: {plans: true, appointments: true}},
        },
        orderBy: [{lastName: "asc"}, {firstName: "asc"}],
    });
    return {total: admins.length, admins};
}

export async function getAdmin(input: { id?: number; email?: string }) {
    if (!input.id && !input.email) {
        throw new Error("Provide either id or email");
    }
    const admin = await prisma.admin.findFirst({
        where: {
            ...(input.id && {id: input.id}),
            ...(input.email && {email: normEmail(input.email)}),
        },
        include: {
            plans: {select: {id: true, name: true, price: true}},
        },
        omit: omitHash,
    });
    if (!admin) throw new Error("Admin not found");
    return admin;
}

export async function updateAdmin(id: number, input: UpdateAdminInput) {
    return prisma.admin.update({
        where: {id},
        data: {
            ...(input.email !== undefined && {email: normEmail(input.email)}),
            ...(input.password && {passwordHash: await bcrypt.hash(input.password, 10)}),
            ...(input.firstName !== undefined && {firstName: input.firstName}),
            ...(input.lastName !== undefined && {lastName: input.lastName}),
            ...(input.phone !== undefined && {phone: input.phone}),
        },
        omit: omitHash,
    });
}
export async function deleteAdmin(id: number) {
    // Plan.adminId nu are cascade: dacă adminul are planuri, Prisma aruncă P2003
    const plansCount = await prisma.plan.count({where: {adminId: id}});
    if (plansCount > 0) {
        throw new Error(`Admin has ${plansCount} plan(s). Reassign or delete them first.`);
    }
    const admin = await prisma.admin.delete({
        where: {id},
        select: {id: true, firstName: true, lastName: true},
    });
    return {
        message: `Admin ${admin.firstName} ${admin.lastName} was successfully deleted.`,
        admin,
    };
}

// ─── Plan ────────────────────────────────────────────────
export async function addPlan(input: CreatePlanInput) {
    return prisma.plan.create({
        data: {
            adminId: input.adminId,
            name: input.name,
            price: input.price,
            discount: input.discount ?? 0,
            priority: input.priority ?? false,
            ...(input.services && input.services.length > 0 && {
                services: {
                    create: input.services.map(s => ({service: s.service, perMonth: s.perMonth})),
                },
            }),
        },
        include: {services: {select: {service: true, perMonth: true}}},
    });
}

export async function listPlans(filters: ListPlansInput) {
    const plans = await prisma.plan.findMany({
        where: {
            ...(filters.adminId !== undefined && {adminId: filters.adminId}),
            ...(filters.name && {name: {contains: filters.name, mode: "insensitive"}}),
            ...(filters.priority !== undefined && {priority: filters.priority}),
            ...(filters.maxPrice !== undefined && {price: {lte: filters.maxPrice}}),
        },
        select: {
            id: true,
            name: true,
            price: true,
            discount: true,
            priority: true,
            services: {select: {service: true, perMonth: true}},
            _count: {select: {subscriptions: true}},
        },
        orderBy: {price: "asc"},
    });
    return {total: plans.length, plans};
}

export async function getPlan(input: { id?: number; name?: string }) {
    if (!input.id && !input.name) {
        throw new Error("Provide either id or name");
    }
    const plan = await prisma.plan.findFirst({
        where: {
            ...(input.id && {id: input.id}),
            ...(input.name && {name: input.name}),
        },
        include: {
            admin: {select: {id: true, firstName: true, lastName: true}},
            services: {select: {id: true, service: true, perMonth: true}},
            _count: {select: {subscriptions: true}},
        },
    });
    if (!plan) throw new Error("Plan not found");
    return plan;
}

export async function updatePlan(id: number, input: UpdatePlanInput) {
    return prisma.$transaction(async tx => {
        if (input.services !== undefined) {
            // înlocuiește complet lista de servicii
            await tx.planService.deleteMany({where: {planId: id}});
            if (input.services.length > 0) {
                await tx.planService.createMany({
                    data: input.services.map(s => ({planId: id, service: s.service, perMonth: s.perMonth})),
                });
            }
        }

        return tx.plan.update({
            where: {id},
            data: {
                ...(input.adminId !== undefined && {adminId: input.adminId}),
                ...(input.name !== undefined && {name: input.name}),
                ...(input.price !== undefined && {price: input.price}),
                ...(input.discount !== undefined && {discount: input.discount}),
                ...(input.priority !== undefined && {priority: input.priority}),
            },
            include: {services: {select: {service: true, perMonth: true}}},
        });
    });
}

export async function deletePlan(id: number) {
    // Subscription.planId nu are cascade: nu ștergem un plan cu abonamente
    const subs = await prisma.subscription.count({where: {planId: id}});
    if (subs > 0) {
        throw new Error(`Plan has ${subs} subscription(s) and cannot be deleted.`);
    }
    const plan = await prisma.plan.delete({
        where: {id},
        select: {id: true, name: true},
    });
    return {message: `Plan ${plan.name} was successfully deleted.`, plan};
}

// ─── PlanService ─────────────────────────────────────────
export async function addPlanService(input: CreatePlanServiceInput) {
    return prisma.planService.create({
        data: {planId: input.planId, service: input.service, perMonth: input.perMonth},
    });
}

export async function listPlanServices(filters: ListPlanServicesInput) {
    const planServices = await prisma.planService.findMany({
        where: {
            ...(filters.planId !== undefined && {planId: filters.planId}),
            ...(filters.service !== undefined && {service: filters.service}),
        },
        select: {
            id: true,
            service: true,
            perMonth: true,
            plan: {select: {id: true, name: true}},
        },
        orderBy: [{planId: "asc"}, {service: "asc"}],
    });
    return {total: planServices.length, planServices};
}

export async function getPlanService(input: { id?: number; planId?: number; service?: CreatePlanServiceInput["service"] }) {
    if (!input.id && (!input.planId || !input.service)) {
        throw new Error("Provide either id, or both planId and service");
    }
    const planService = await prisma.planService.findFirst({
        where: {
            ...(input.id && {id: input.id}),
            ...(input.planId && {planId: input.planId}),
            ...(input.service && {service: input.service}),
        },
        include: {plan: {select: {id: true, name: true}}},
    });
    if (!planService) throw new Error("PlanService not found");
    return planService;
}

export async function updatePlanService(id: number, input: UpdatePlanServiceInput) {
    return prisma.planService.update({
        where: {id},
        data: {
            ...(input.service !== undefined && {service: input.service}),
            ...(input.perMonth !== undefined && {perMonth: input.perMonth}),
        },
    });
}

export async function deletePlanService(input: { id?: number; planId?: number; service?: CreatePlanServiceInput["service"] }) {
    if (!input.id && (!input.planId || !input.service)) {
        throw new Error("Provide either id, or both planId and service");
    }
    const target = input.id
        ? {id: input.id}
        : {planId_service: {planId: input.planId!, service: input.service!}};

    const planService = await prisma.planService.delete({where: target});
    return {message: "PlanService deleted successfully", planService};
}

// ─── Subscription ────────────────────────────────────────
export async function addSubscription(input: CreateSubscriptionInput) {
    const existing = await prisma.subscription.findFirst({
        where: {userId: input.userId, planId: input.planId, active: true},
        select: {id: true},
    });
    if (existing) {
        throw new Error("User already has an active subscription to this plan.");
    }
    return prisma.subscription.create({
        data: {
            userId: input.userId,
            planId: input.planId,
            ...(input.startDate && {startDate: new Date(input.startDate)}),
        },
        include: {plan: {select: {id: true, name: true}}},
    });
}

export async function listSubscriptions(filters: ListSubscriptionsInput) {
    const subscriptions = await prisma.subscription.findMany({
        where: {
            ...(filters.userId !== undefined && {userId: filters.userId}),
            ...(filters.planId !== undefined && {planId: filters.planId}),
            ...(filters.active !== undefined && {active: filters.active}),
        },
        select: {
            id: true,
            startDate: true,
            active: true,
            user: {select: {id: true, firstName: true, lastName: true}},
            plan: {select: {id: true, name: true, price: true}},
        },
        orderBy: {startDate: "desc"},
    });
    return {total: subscriptions.length, subscriptions};
}

export async function getSubscription(id: number) {
    const subscription = await prisma.subscription.findUnique({
        where: {id},
        include: {
            user: {select: {id: true, firstName: true, lastName: true, email: true}},
            plan: {include: {services: {select: {service: true, perMonth: true}}}},
        },
    });
    if (!subscription) throw new Error("Subscription not found");
    return subscription;
}

export async function updateSubscription(id: number, input: UpdateSubscriptionInput) {
    return prisma.subscription.update({
        where: {id},
        data: {
            ...(input.planId !== undefined && {planId: input.planId}),
            ...(input.startDate !== undefined && {startDate: new Date(input.startDate)}),
            ...(input.active !== undefined && {active: input.active}),
        },
    });
}

export async function cancelSubscription(id: number) {
    const subscription = await prisma.subscription.update({
        where: {id},
        data: {active: false},
        select: {id: true, active: true, userId: true, planId: true},
    });
    return {message: `Subscription ${subscription.id} was cancelled.`, subscription};
}

export async function deleteSubscription(id: number) {
    const subscription = await prisma.subscription.delete({where: {id}});
    return {message: "Subscription deleted successfully", subscription};
}

// ─── Pet ─────────────────────────────────────────────────
export async function addPet(input: CreatePetInput) {
    return prisma.pet.create({
        data: {
            userId: input.userId,
            name: input.name,
            type: input.type,
            age: input.age ?? null,
            breed: input.breed ?? null,
        },
    });
}

export async function listPets(filters: ListPetsInput) {
    const pets = await prisma.pet.findMany({
        where: {
            ...(filters.userId !== undefined && {userId: filters.userId}),
            ...(filters.type && {type: {equals: filters.type, mode: "insensitive"}}),
            ...(filters.name && {name: {contains: filters.name, mode: "insensitive"}}),
        },
        select: {
            id: true,
            name: true,
            type: true,
            age: true,
            breed: true,
            user: {select: {id: true, firstName: true, lastName: true}},
        },
        orderBy: {name: "asc"},
    });
    return {total: pets.length, pets};
}

export async function getPet(id: number) {
    const pet = await prisma.pet.findUnique({
        where: {id},
        include: {
            user: {select: {id: true, firstName: true, lastName: true, phone: true}},
            appointments: {
                select: {id: true, service: true, date: true},
                orderBy: {date: "desc"},
                take: 10,
            },
        },
    });
    if (!pet) throw new Error("Pet not found");
    return pet;
}

export async function updatePet(id: number, input: UpdatePetInput) {
    return prisma.pet.update({
        where: {id},
        data: {
            ...(input.userId !== undefined && {userId: input.userId}),
            ...(input.name !== undefined && {name: input.name}),
            ...(input.type !== undefined && {type: input.type}),
            ...(input.age !== undefined && {age: input.age}),
            ...(input.breed !== undefined && {breed: input.breed}),
        },
    });
}

export async function deletePet(id: number) {
    // Appointment.petId nu are cascade, dar e opțional: detașăm programările de animal
    const [, pet] = await prisma.$transaction([
        prisma.appointment.updateMany({where: {petId: id}, data: {petId: null}}),
        prisma.pet.delete({where: {id}, select: {id: true, name: true}}),
    ]);
    return {message: `Pet ${pet.name} was successfully deleted.`, pet};
}

// ─── Appointment ─────────────────────────────────────────
export async function addAppointment(input: CreateAppointmentInput) {
    if (input.petId) {
        const pet = await prisma.pet.findFirst({
            where: {id: input.petId, userId: input.userId},
            select: {id: true},
        });
        if (!pet) throw new Error("Pet not found or does not belong to this user.");
    }

    return prisma.appointment.create({
        data: {
            userId: input.userId,
            petId: input.petId ?? null,
            adminId: input.adminId ?? null,
            service: input.service,
            date: new Date(input.date),
        },
    });
}

export async function listAppointments(filters: ListAppointmentsInput) {
    const appointments = await prisma.appointment.findMany({
        where: {
            ...(filters.userId !== undefined && {userId: filters.userId}),
            ...(filters.petId !== undefined && {petId: filters.petId}),
            ...(filters.adminId !== undefined && {adminId: filters.adminId}),
            ...(filters.service !== undefined && {service: filters.service}),
            ...(filters.dateFrom !== undefined || filters.dateTo !== undefined
                ? {
                    date: {
                        ...(filters.dateFrom !== undefined && {gte: new Date(filters.dateFrom)}),
                        ...(filters.dateTo !== undefined && {lte: new Date(filters.dateTo)}),
                    },
                }
                : {}),
        },
        select: {
            id: true,
            service: true,
            date: true,
            user: {select: {id: true, firstName: true, lastName: true}},
            pet: {select: {id: true, name: true, type: true}},
            admin: {select: {id: true, firstName: true, lastName: true}},
        },
        orderBy: {date: "asc"},
    });
    return {total: appointments.length, appointments};
}

export async function getAppointment(id: number) {
    const appointment = await prisma.appointment.findUnique({
        where: {id},
        include: {
            user: {select: {id: true, firstName: true, lastName: true, email: true, phone: true}},
            pet: {select: {id: true, name: true, type: true, breed: true}},
            admin: {select: {id: true, firstName: true, lastName: true}},
        },
    });
    if (!appointment) throw new Error("Appointment not found");
    return appointment;
}

export async function updateAppointment(id: number, input: UpdateAppointmentInput) {
    return prisma.appointment.update({
        where: {id},
        data: {
            ...(input.userId !== undefined && {userId: input.userId}),
            ...(input.petId !== undefined && {petId: input.petId}),
            ...(input.adminId !== undefined && {adminId: input.adminId}),
            ...(input.service !== undefined && {service: input.service}),
            ...(input.date !== undefined && {date: new Date(input.date)}),
        },
    });
}

export async function deleteAppointment(id: number) {
    const appointment = await prisma.appointment.delete({where: {id}});
    return {message: "Appointment deleted successfully", appointment};
}

// ─── Utilitar: consum lunar din abonamente ───────────────
// Pentru fiecare abonament activ al userului, arată câte programări din fiecare serviciu
// a folosit în luna curentă față de limita `perMonth` din plan.
export async function getUserPlanUsage(userId: number) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [subscriptions, usedRows] = await Promise.all([
        prisma.subscription.findMany({
            where: {userId, active: true},
            select: {
                id: true,
                plan: {
                    select: {
                        id: true,
                        name: true,
                        priority: true,
                        discount: true,
                        services: {select: {service: true, perMonth: true}},
                    },
                },
            },
        }),
        prisma.appointment.groupBy({
            by: ["service"],
            where: {userId, date: {gte: monthStart, lt: nextMonthStart}},
            _count: {_all: true},
        }),
    ]);

    const used = new Map(usedRows.map(r => [r.service, r._count._all]));

    return {
        userId,
        month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`,
        subscriptions: subscriptions.map(sub => ({
            subscriptionId: sub.id,
            plan: {id: sub.plan.id, name: sub.plan.name, priority: sub.plan.priority, discount: sub.plan.discount},
            services: sub.plan.services.map(s => {
                const usedCount = used.get(s.service) ?? 0;
                return {
                    service: s.service,
                    perMonth: s.perMonth,
                    used: usedCount,
                    remaining: Math.max(0, s.perMonth - usedCount),
                };
            }),
        })),
    };
}