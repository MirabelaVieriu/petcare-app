import {CallToolResult} from "@modelcontextprotocol/sdk/types.js";

import {z, ZodRawShape} from "zod";
import {
    addUser, listUsers, getUser, updateUser, deleteUser,
    addAdmin, listAdmins, getAdmin, updateAdmin, deleteAdmin,
    addPlan, listPlans, getPlan, updatePlan, deletePlan,
    addPlanService, listPlanServices, getPlanService, updatePlanService, deletePlanService,
    addSubscription, listSubscriptions, getSubscription, updateSubscription, cancelSubscription, deleteSubscription,
    addPet, listPets, getPet, updatePet, deletePet,
    addAppointment, listAppointments, getAppointment, updateAppointment, deleteAppointment,
    getUserPlanUsage,
} from "./tool-implementation";
import {
    serviceTypeValues,
    CreateUserInput, UpdateUserInput, ListUsersInput,
    CreateAdminInput, UpdateAdminInput, ListAdminsInput,
    CreatePlanInput, UpdatePlanInput, ListPlansInput,
    CreatePlanServiceInput, UpdatePlanServiceInput, ListPlanServicesInput,
    CreateSubscriptionInput, UpdateSubscriptionInput, ListSubscriptionsInput,
    CreatePetInput, UpdatePetInput, ListPetsInput,
    CreateAppointmentInput, UpdateAppointmentInput, ListAppointmentsInput,
} from "./models";

export interface McpTool {
    name: string;
    config: {
        description: string;
        inputSchema: ZodRawShape;
    };
    handler: (input: Record<string, unknown>) => Promise<CallToolResult>;
    category: string;
}

const respond = (data: unknown): CallToolResult => ({
    content: [{type: "text", text: JSON.stringify(data, null, 2)}],
});

const serviceEnum = z.enum(serviceTypeValues);
const isoDate = z.string().describe("ISO date/time, e.g. 2026-11-03T10:30:00");

// ─── User ────────────────────────────────────────────────
export const addUserTool: McpTool = {
    name: "add_user",
    config: {
        description: "Add a new user (pet owner / client)",
        inputSchema: {
            email: z.string().email(),
            firstName: z.string(),
            lastName: z.string(),
            phone: z.string(),
        },
    },
    category: "user",
    handler: async input => respond(await addUser(input as unknown as CreateUserInput)),
};

export const listUsersTool: McpTool = {
    name: "list_users",
    config: {
        description: "List users with optional filters: email, firstName, lastName",
        inputSchema: {
            email: z.string().optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
        },
    },
    category: "user",
    handler: async input => respond(await listUsers(input as unknown as ListUsersInput)),
};

export const getUserTool: McpTool = {
    name: "get_user",
    config: {
        description: "Get a user by id or email (includes pets and active subscriptions)",
        inputSchema: {
            id: z.number().optional(),
            email: z.string().optional(),
        },
    },
    category: "user",
    handler: async input => respond(await getUser({
        id: input.id as number | undefined,
        email: input.email as string | undefined,
    })),
};

export const updateUserTool: McpTool = {
    name: "update_user",
    config: {
        description: "Update a user by id",
        inputSchema: {
            id: z.number(),
            email: z.string().email().optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            phone: z.string().optional(),
        },
    },
    category: "user",
    handler: async input => {
        const {id, ...rest} = input;
        return respond(await updateUser(id as number, rest as UpdateUserInput));
    },
};

export const deleteUserTool: McpTool = {
    name: "delete_user",
    config: {
        description: "Delete a user by id (also deletes their pets, appointments and subscriptions)",
        inputSchema: {id: z.number()},
    },
    category: "user",
    handler: async input => respond(await deleteUser(input.id as number)),
};

// ─── Admin ───────────────────────────────────────────────
export const addAdminTool: McpTool = {
    name: "add_admin",
    config: {
        description: "Add a new admin (clinic staff)",
        inputSchema: {
            email: z.string().email(),
            firstName: z.string(),
            lastName: z.string(),
            phone: z.string(),
        },
    },
    category: "admin",
    handler: async input => respond(await addAdmin(input as unknown as CreateAdminInput)),
};

export const listAdminsTool: McpTool = {
    name: "list_admins",
    config: {
        description: "List admins with optional filters: email, firstName, lastName",
        inputSchema: {
            email: z.string().optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
        },
    },
    category: "admin",
    handler: async input => respond(await listAdmins(input as unknown as ListAdminsInput)),
};

export const getAdminTool: McpTool = {
    name: "get_admin",
    config: {
        description: "Get an admin by id or email",
        inputSchema: {
            id: z.number().optional(),
            email: z.string().optional(),
        },
    },
    category: "admin",
    handler: async input => respond(await getAdmin({
        id: input.id as number | undefined,
        email: input.email as string | undefined,
    })),
};

export const updateAdminTool: McpTool = {
    name: "update_admin",
    config: {
        description: "Update an admin by id",
        inputSchema: {
            id: z.number(),
            email: z.string().email().optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            phone: z.string().optional(),
        },
    },
    category: "admin",
    handler: async input => {
        const {id, ...rest} = input;
        return respond(await updateAdmin(id as number, rest as UpdateAdminInput));
    },
};

export const deleteAdminTool: McpTool = {
    name: "delete_admin",
    config: {
        description: "Delete an admin by id (fails if the admin still owns plans)",
        inputSchema: {id: z.number()},
    },
    category: "admin",
    handler: async input => respond(await deleteAdmin(input.id as number)),
};

// ─── Plan ────────────────────────────────────────────────
const planServiceItem = z.object({
    service: serviceEnum,
    perMonth: z.number().int().nonnegative(),
});

export const addPlanTool: McpTool = {
    name: "add_plan",
    config: {
        description: "Add a new subscription plan, optionally with its included services (service + perMonth)",
        inputSchema: {
            adminId: z.number(),
            name: z.string(),
            price: z.number().int().nonnegative(),
            discount: z.number().int().min(0).max(100).optional(),
            priority: z.boolean().optional(),
            services: z.array(planServiceItem).optional(),
        },
    },
    category: "plan",
    handler: async input => respond(await addPlan(input as unknown as CreatePlanInput)),
};

export const listPlansTool: McpTool = {
    name: "list_plans",
    config: {
        description: "List plans with optional filters: adminId, name, priority, maxPrice",
        inputSchema: {
            adminId: z.number().optional(),
            name: z.string().optional(),
            priority: z.boolean().optional(),
            maxPrice: z.number().optional(),
        },
    },
    category: "plan",
    handler: async input => respond(await listPlans(input as unknown as ListPlansInput)),
};

export const getPlanTool: McpTool = {
    name: "get_plan",
    config: {
        description: "Get a plan by id or name (includes services)",
        inputSchema: {
            id: z.number().optional(),
            name: z.string().optional(),
        },
    },
    category: "plan",
    handler: async input => respond(await getPlan({
        id: input.id as number | undefined,
        name: input.name as string | undefined,
    })),
};

export const updatePlanTool: McpTool = {
    name: "update_plan",
    config: {
        description: "Update a plan by id. If `services` is provided it REPLACES the plan's whole services list",
        inputSchema: {
            id: z.number(),
            adminId: z.number().optional(),
            name: z.string().optional(),
            price: z.number().int().nonnegative().optional(),
            discount: z.number().int().min(0).max(100).optional(),
            priority: z.boolean().optional(),
            services: z.array(planServiceItem).optional(),
        },
    },
    category: "plan",
    handler: async input => {
        const {id, ...rest} = input;
        return respond(await updatePlan(id as number, rest as UpdatePlanInput));
    },
};

export const deletePlanTool: McpTool = {
    name: "delete_plan",
    config: {
        description: "Delete a plan by id (fails if it has subscriptions)",
        inputSchema: {id: z.number()},
    },
    category: "plan",
    handler: async input => respond(await deletePlan(input.id as number)),
};

// ─── PlanService ─────────────────────────────────────────
export const addPlanServiceTool: McpTool = {
    name: "add_plan_service",
    config: {
        description: "Add a service allowance (perMonth) to an existing plan",
        inputSchema: {
            planId: z.number(),
            service: serviceEnum,
            perMonth: z.number().int().nonnegative(),
        },
    },
    category: "plan_service",
    handler: async input => respond(await addPlanService(input as unknown as CreatePlanServiceInput)),
};

export const listPlanServicesTool: McpTool = {
    name: "list_plan_services",
    config: {
        description: "List plan services with optional filters: planId, service",
        inputSchema: {
            planId: z.number().optional(),
            service: serviceEnum.optional(),
        },
    },
    category: "plan_service",
    handler: async input => respond(await listPlanServices(input as unknown as ListPlanServicesInput)),
};

export const getPlanServiceTool: McpTool = {
    name: "get_plan_service",
    config: {
        description: "Get a plan service by id, or by planId + service",
        inputSchema: {
            id: z.number().optional(),
            planId: z.number().optional(),
            service: serviceEnum.optional(),
        },
    },
    category: "plan_service",
    handler: async input => respond(await getPlanService({
        id: input.id as number | undefined,
        planId: input.planId as number | undefined,
        service: input.service as CreatePlanServiceInput["service"] | undefined,
    })),
};

export const updatePlanServiceTool: McpTool = {
    name: "update_plan_service",
    config: {
        description: "Update a plan service by id",
        inputSchema: {
            id: z.number(),
            service: serviceEnum.optional(),
            perMonth: z.number().int().nonnegative().optional(),
        },
    },
    category: "plan_service",
    handler: async input => {
        const {id, ...rest} = input;
        return respond(await updatePlanService(id as number, rest as UpdatePlanServiceInput));
    },
};

export const deletePlanServiceTool: McpTool = {
    name: "delete_plan_service",
    config: {
        description: "Delete a plan service by id, or by planId + service",
        inputSchema: {
            id: z.number().optional(),
            planId: z.number().optional(),
            service: serviceEnum.optional(),
        },
    },
    category: "plan_service",
    handler: async input => respond(await deletePlanService({
        id: input.id as number | undefined,
        planId: input.planId as number | undefined,
        service: input.service as CreatePlanServiceInput["service"] | undefined,
    })),
};

// ─── Subscription ────────────────────────────────────────
export const addSubscriptionTool: McpTool = {
    name: "add_subscription",
    config: {
        description: "Subscribe a user to a plan",
        inputSchema: {
            userId: z.number(),
            planId: z.number(),
            startDate: isoDate.optional(),
        },
    },
    category: "subscription",
    handler: async input => respond(await addSubscription(input as unknown as CreateSubscriptionInput)),
};

export const listSubscriptionsTool: McpTool = {
    name: "list_subscriptions",
    config: {
        description: "List subscriptions with optional filters: userId, planId, active",
        inputSchema: {
            userId: z.number().optional(),
            planId: z.number().optional(),
            active: z.boolean().optional(),
        },
    },
    category: "subscription",
    handler: async input => respond(await listSubscriptions(input as unknown as ListSubscriptionsInput)),
};

export const getSubscriptionTool: McpTool = {
    name: "get_subscription",
    config: {
        description: "Get a subscription by id",
        inputSchema: {id: z.number()},
    },
    category: "subscription",
    handler: async input => respond(await getSubscription(input.id as number)),
};

export const updateSubscriptionTool: McpTool = {
    name: "update_subscription",
    config: {
        description: "Update a subscription by id (change plan, start date or active flag)",
        inputSchema: {
            id: z.number(),
            planId: z.number().optional(),
            startDate: isoDate.optional(),
            active: z.boolean().optional(),
        },
    },
    category: "subscription",
    handler: async input => {
        const {id, ...rest} = input;
        return respond(await updateSubscription(id as number, rest as UpdateSubscriptionInput));
    },
};

export const cancelSubscriptionTool: McpTool = {
    name: "cancel_subscription",
    config: {
        description: "Cancel a subscription by id (sets active = false, keeps history)",
        inputSchema: {id: z.number()},
    },
    category: "subscription",
    handler: async input => respond(await cancelSubscription(input.id as number)),
};

export const deleteSubscriptionTool: McpTool = {
    name: "delete_subscription",
    config: {
        description: "Permanently delete a subscription by id",
        inputSchema: {id: z.number()},
    },
    category: "subscription",
    handler: async input => respond(await deleteSubscription(input.id as number)),
};

export const getUserPlanUsageTool: McpTool = {
    name: "get_user_plan_usage",
    config: {
        description: "Show, for a user's active subscriptions, how many appointments per service were used this month vs the plan's perMonth limit",
        inputSchema: {userId: z.number()},
    },
    category: "subscription",
    handler: async input => respond(await getUserPlanUsage(input.userId as number)),
};

// ─── Pet ─────────────────────────────────────────────────
export const addPetTool: McpTool = {
    name: "add_pet",
    config: {
        description: "Add a new pet for a user",
        inputSchema: {
            userId: z.number(),
            name: z.string(),
            type: z.string().describe("e.g. dog, cat, bird"),
            age: z.number().int().nonnegative().nullable().optional(),
            breed: z.string().nullable().optional(),
        },
    },
    category: "pet",
    handler: async input => respond(await addPet(input as unknown as CreatePetInput)),
};

export const listPetsTool: McpTool = {
    name: "list_pets",
    config: {
        description: "List pets with optional filters: userId, type, name",
        inputSchema: {
            userId: z.number().optional(),
            type: z.string().optional(),
            name: z.string().optional(),
        },
    },
    category: "pet",
    handler: async input => respond(await listPets(input as unknown as ListPetsInput)),
};

export const getPetTool: McpTool = {
    name: "get_pet",
    config: {
        description: "Get a pet by id (includes owner and last 10 appointments)",
        inputSchema: {id: z.number()},
    },
    category: "pet",
    handler: async input => respond(await getPet(input.id as number)),
};

export const updatePetTool: McpTool = {
    name: "update_pet",
    config: {
        description: "Update a pet by id",
        inputSchema: {
            id: z.number(),
            userId: z.number().optional(),
            name: z.string().optional(),
            type: z.string().optional(),
            age: z.number().int().nonnegative().nullable().optional(),
            breed: z.string().nullable().optional(),
        },
    },
    category: "pet",
    handler: async input => {
        const {id, ...rest} = input;
        return respond(await updatePet(id as number, rest as UpdatePetInput));
    },
};

export const deletePetTool: McpTool = {
    name: "delete_pet",
    config: {
        description: "Delete a pet by id (its appointments are kept, but detached from the pet)",
        inputSchema: {id: z.number()},
    },
    category: "pet",
    handler: async input => respond(await deletePet(input.id as number)),
};

// ─── Appointment ─────────────────────────────────────────
export const addAppointmentTool: McpTool = {
    name: "add_appointment",
    config: {
        description: "Create a new appointment for a user (optionally for a pet and assigned to an admin)",
        inputSchema: {
            userId: z.number(),
            petId: z.number().nullable().optional(),
            adminId: z.number().nullable().optional(),
            service: serviceEnum,
            date: isoDate,
        },
    },
    category: "appointment",
    handler: async input => respond(await addAppointment(input as unknown as CreateAppointmentInput)),
};

export const listAppointmentsTool: McpTool = {
    name: "list_appointments",
    config: {
        description: "List appointments with optional filters: userId, petId, adminId, service, dateFrom, dateTo",
        inputSchema: {
            userId: z.number().optional(),
            petId: z.number().optional(),
            adminId: z.number().optional(),
            service: serviceEnum.optional(),
            dateFrom: isoDate.optional(),
            dateTo: isoDate.optional(),
        },
    },
    category: "appointment",
    handler: async input => respond(await listAppointments(input as unknown as ListAppointmentsInput)),
};

export const getAppointmentTool: McpTool = {
    name: "get_appointment",
    config: {
        description: "Get an appointment by id",
        inputSchema: {id: z.number()},
    },
    category: "appointment",
    handler: async input => respond(await getAppointment(input.id as number)),
};

export const updateAppointmentTool: McpTool = {
    name: "update_appointment",
    config: {
        description: "Update an appointment by id",
        inputSchema: {
            id: z.number(),
            userId: z.number().optional(),
            petId: z.number().nullable().optional(),
            adminId: z.number().nullable().optional(),
            service: serviceEnum.optional(),
            date: isoDate.optional(),
        },
    },
    category: "appointment",
    handler: async input => {
        const {id, ...rest} = input;
        return respond(await updateAppointment(id as number, rest as UpdateAppointmentInput));
    },
};

export const deleteAppointmentTool: McpTool = {
    name: "delete_appointment",
    config: {
        description: "Delete an appointment by id",
        inputSchema: {id: z.number()},
    },
    category: "appointment",
    handler: async input => respond(await deleteAppointment(input.id as number)),
};

// ─── tools ───────────────────────────────────────────────
export const tools: McpTool[] = [
    addUserTool, listUsersTool, getUserTool, updateUserTool, deleteUserTool,
    addAdminTool, listAdminsTool, getAdminTool, updateAdminTool, deleteAdminTool,
    addPlanTool, listPlansTool, getPlanTool, updatePlanTool, deletePlanTool,
    addPlanServiceTool, listPlanServicesTool, getPlanServiceTool, updatePlanServiceTool, deletePlanServiceTool,
    addSubscriptionTool, listSubscriptionsTool, getSubscriptionTool, updateSubscriptionTool,
    cancelSubscriptionTool, deleteSubscriptionTool, getUserPlanUsageTool,
    addPetTool, listPetsTool, getPetTool, updatePetTool, deletePetTool,
    addAppointmentTool, listAppointmentsTool, getAppointmentTool, updateAppointmentTool, deleteAppointmentTool,
];