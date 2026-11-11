import { redirectIfLoggedIn } from "@/lib/auth/guards";
import AuthForm from "@/components/auth/AuthForm";
import LoginArt from "@/components/auth/LoginArt";
import { nunito } from "@/lib/fonts";

export default async function RegisterPage() {
  await redirectIfLoggedIn();

  return (
    <div className={`loginPage ${nunito.className}`}>
      <LoginArt />
      <section className="loginPanel">
        <AuthForm mode="register" role="user" />
      </section>
    </div>
  );
}
