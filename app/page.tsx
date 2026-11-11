import LoginArt from "@/components/auth/LoginArt";
import LoginCard from "@/components/auth/LoginCard";
import { nunito } from "@/lib/fonts";

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
