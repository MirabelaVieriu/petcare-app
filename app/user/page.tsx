import { requireUser } from "@/lib/auth/guards";

export default async function UserHomePage() {
  const user = await requireUser();

  if (!user) {
    return null;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bine ai venit, {user.firstName}!</h1>
      <p>Acesta este tabloul principal al utilizatorului.</p>
    </div>
  );
}
