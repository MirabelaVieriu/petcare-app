"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserAccessor } from "@/lib/accessors/UserAccessor";
import { createSession, destroySession } from "@/lib/auth/session";

export type AuthState = { error?: string } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
    const email = str(formData, "email").toLowerCase();
    const password = String(formData.get("password") ?? "");
    const isAdmin = formData.get("role") === "admin";

    const account = isAdmin
        ? await prisma.admin.findUnique({ where: { email } })
        : await UserAccessor.getForLogin(email);

    if (!account || !account.passwordHash || !(await bcrypt.compare(password, account.passwordHash))) {
        return { error: "Email sau parolă incorecte." };
    }

    await createSession({ id: account.id, role: isAdmin ? "ADMIN" : "USER" });
    redirect(isAdmin ? "/admin" : "/user");
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
    const firstName = str(formData, "firstName");
    const lastName = str(formData, "lastName");
    const phone = str(formData, "phone");
    const email = str(formData, "email").toLowerCase();
    const vetRaw = str(formData, "vetId");
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (!firstName || !lastName || !phone || !email) return { error: "Completează toate câmpurile." };
    if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Email invalid." };
    if (password.length < 8) return { error: "Parola trebuie să aibă minim 8 caractere." };
    if (password !== confirm) return { error: "Parolele nu coincid." };
    let vetId: number | undefined;
    if (vetRaw) {
        const parsed = Number(vetRaw);
        const vet = Number.isInteger(parsed)
            ? await prisma.admin.findUnique({ where: { id: parsed }, select: { id: true } })
            : null;
        if (!vet) return { error: "Veterinar invalid." };
        vetId = vet.id;
    } else if ((await prisma.admin.count()) > 0) {
        return { error: "Alege veterinarul." };
    }


    const [existingUser, existingAdmin] = await Promise.all([
        UserAccessor.getByEmail(email),
        prisma.admin.findUnique({ where: { email } }),
    ]);
    if (existingUser || existingAdmin) return { error: "Există deja un cont cu acest email." };

    const user = await UserAccessor.create({
        firstName,
        lastName,
        phone,
        email,
        vetId,
        passwordHash: await bcrypt.hash(password, 10),
    });

    await createSession({ id: user.id, role: "USER" });
    redirect("/user");
}

export async function logoutAction() {
    await destroySession();
    redirect("/");
}