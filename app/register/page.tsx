import { redirectIfLoggedIn } from "@/lib/auth/guards";
import AuthForm from "@/components/auth/AuthForm";
import LoginArt from "@/components/auth/LoginArt";
import { nunito } from "@/lib/fonts";
import { prisma } from "@/lib/prisma";

export default async function RegisterPage() {
  await redirectIfLoggedIn();
    const admins = await prisma.admin.findMany({
        select: { id: true, firstName: true, lastName: true },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
    const vets = admins.map(a => ({ id: a.id, label: `${a.firstName} ${a.lastName}` }));

  return (
    <div className={`loginPage ${nunito.className}`}>
      <LoginArt />
      <section className="loginPanel">
        <AuthForm mode="register" role="user" vets={vets} />
      </section>
    </div>
  );
}
