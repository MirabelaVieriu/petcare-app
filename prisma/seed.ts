import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!adminPassword) throw new Error("Setează SEED_ADMIN_PASSWORD în .env");

    const adminHash = await bcrypt.hash(adminPassword, 10);
    const demoHash = await bcrypt.hash("parola123", 10); // doar pentru userii de test

    const admin = await prisma.admin.upsert({
        where: { email: "admin@petcare.ro" },
        update: { passwordHash: adminHash },
        create: {
            email: "admin@petcare.ro",
            firstName: "Ana",
            lastName: "Popescu",
            phone: "0700000001",
            passwordHash: adminHash,
        },
    });

    await prisma.plan.upsert({
        where: { name: "Basic" },
        update: {},
        create: { name: "Basic", price: 50, adminId: admin.id },
    });

    await prisma.user.upsert({
        where: { email: "ion@test.ro" },
        update: {},
        create: {
            email: "ion@test.ro",
            firstName: "Ion",
            lastName: "Ionescu",
            phone: "0700000002",
            passwordHash: demoHash,
            pets: { create: [{ name: "Rex", type: "câine", age: 3 }] },
        },
    });
    const ion = await prisma.user.findUniqueOrThrow({
        where: { email: "ion@test.ro" },
        include: { pets: true },
    });
    const petId = ion.pets[0]?.id ?? null;

    const at = (dayOffset: number, hour: number, minute = 0) => {
        const d = new Date();
        d.setDate(d.getDate() + dayOffset);
        d.setHours(hour, minute, 0, 0);
        return d;
    };

    await prisma.appointment.deleteMany({});
    await prisma.appointment.createMany({
        data: [
            { userId: ion.id, petId, adminId: admin.id, service: "CONSULT",  date: at(0, 10) },
            { userId: ion.id, petId, adminId: admin.id, service: "VACCINE",  date: at(0, 14, 30) },
            { userId: ion.id, petId, adminId: admin.id, service: "GROOMING", date: at(2, 11) },
            { userId: ion.id, petId, adminId: admin.id, service: "TELE",     date: at(-3, 9) },
        ],
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());