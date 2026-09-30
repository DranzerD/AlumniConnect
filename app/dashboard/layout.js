import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import AppNav from "@/components/AppNav";
import styles from "./layout.module.css";

export default async function DashboardLayout({ children }) {
  // Middleware already checked the token; this also catches deactivated accounts.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className={styles.shell}>
      <AppNav user={user} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
