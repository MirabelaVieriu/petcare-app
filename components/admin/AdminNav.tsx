"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
    { href: "/admin", label: "Panou principal", icon: "🏠" },
    { href: "/admin/appointments", label: "Programări", icon: "📅" },
    { href: "/admin/users", label: "Clienți", icon: "👥" },
    { href: "/admin/pets", label: "Animale", icon: "🐾" },
    { href: "/admin/plans", label: "Planuri", icon: "📋" },
    { href: "/admin/subscriptions", label: "Abonamente", icon: "⭐" },
];

export default function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="nav">
            {NAV.map(item => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                    <Link key={item.href} href={item.href} className={`navLink ${active ? "navActive" : ""}`}>
                        <span>{item.icon}</span>
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}