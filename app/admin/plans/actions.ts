"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
export async function createPlan(formData: FormData) {
    const adminId = Number(formData.get("adminId"));
    if (!adminId) throw new Error("Selectează un veterinar.");

    await prisma.plan.create({
        data: {
            name: String(formData.get("name")),
            price: Number(formData.get("price") || 0),
            discount: Number(formData.get("discount") || 0),
            priority: formData.get("priority") === "on",
            admin: { connect: { id: adminId } },
        },
    });
    redirect("/admin/plans");
}