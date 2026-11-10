import { Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin", "latin-ext"], weight: ["400", "600", "700", "800"] });

export default function UserLoginLayout({ children }: { children: React.ReactNode }) {
    return <div className={nunito.className}>{children}</div>;
}