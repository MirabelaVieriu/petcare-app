import { notFound } from "next/navigation";
import LoginArt from "@/components/auth/LoginArt";
import AuthForm from "@/components/auth/AuthForm";
import { redirectIfLoggedIn } from "@/lib/auth/guards";

type Role = "admin" | "user";
function isRole(value: string): value is Role {
    return value === "admin" || value === "user";
}

export default async function LoginByRolePage({
    params,
}: {
    params: Promise<{ role: string }>;
}) {
    await redirectIfLoggedIn();

    const { role } = await params;
    if (!isRole(role)) {
        notFound();
    }

    return (
        <div className="loginPage">
            <LoginArt />
            <section className="loginPanel">
                <AuthForm mode="login" role={role} />
            </section>
        </div>
    );
}
