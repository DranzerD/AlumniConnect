import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import Logo from "@/components/Logo";
import styles from "./landing.module.css";

export const dynamic = "force-dynamic";

const FEATURES = [
  ["Directory", "Search everyone from your college by name, company, skill, department or graduation year."],
  ["Connections and messages", "Send a connection request, then message privately once it's accepted."],
  ["Jobs", "Alumni and faculty post openings at their companies; students filter by type and location."],
  ["Events", "Meetups, workshops and webinars with RSVPs and attendance limits."],
  ["Mentorship", "Alumni and faculty opt in as mentors; students send a request describing what they need."],
  ["College admin", "Admins manage members, change roles and deactivate accounts for their college only."],
];

export default async function Home() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}><Logo /></Link>
        <nav className="row">
          <Link href="/login" className="btn btn-ghost">Sign in</Link>
          <Link href="/register" className="btn btn-primary">Create account</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.intro}>
          <h1 className={styles.title}>The alumni network for your college</h1>
          <p className={styles.lede}>
            AlumniConnect is a private space for a college&apos;s students, alumni and faculty. Sign up with your
            institutional email to find people, get referrals and ask for mentorship.
          </p>
          <div className="row">
            <Link href="/register" className="btn btn-primary">Create account</Link>
            <Link href="/login" className="btn">Sign in with a demo account</Link>
          </div>
        </section>

        <section aria-labelledby="features">
          <h2 id="features" className="section-title">What&apos;s included</h2>
          <dl className={styles.features}>
            {FEATURES.map(([term, desc]) => (
              <div key={term} className={styles.feature}>
                <dt>{term}</dt>
                <dd>{desc}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>AlumniConnect</span>
        <span>MIT License</span>
      </footer>
    </div>
  );
}
