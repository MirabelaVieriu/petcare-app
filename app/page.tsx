import { Nunito } from "next/font/google";
import LoginArt from "@/components/auth/LoginArt";
import LoginCard from "@/components/auth/LoginCard";

const nunito = Nunito({ subsets: ["latin", "latin-ext"], weight: ["400", "600", "700", "800"] });

export default function HomePage() {
    return (
        <div className={`loginPage ${nunito.className}`}>
            <LoginArt />
            <section className="loginPanel">
                <LoginCard />
            </section>
        </div>
    );
}