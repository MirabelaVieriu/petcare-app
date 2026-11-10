import { Nunito } from "next/font/google";
import LoginArt from "@/components/auth/LoginArt";
import AuthForm from "@/components/auth/AuthForm";
import { redirectIfLoggedIn } from "@/lib/auth/guards";

const nunito = Nunito({ subsets: ["latin", "latin-ext"], weight: ["400", "600", "700", "800"] });

export default async function UserLoginPage() {
    await redirectIfLoggedIn();

    return (
        <div className={`loginPage ${nunito.className}`}>
            <LoginArt />
            <section className="loginPanel">
                <AuthForm mode="login" role="user" />
            </section>
        </div>
    );
}