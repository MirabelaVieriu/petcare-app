import { redirectIfLoggedIn } from "@/lib/auth/guards";
import AuthForm from "@/components/auth/AuthForm";
import { Nunito } from "next/font/google";
import LoginArt from "@/components/auth/LoginArt";

const nunito = Nunito({ subsets: ["latin", "latin-ext"], weight: ["400", "600", "700", "800"] });

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
