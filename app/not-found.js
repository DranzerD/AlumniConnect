import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="auth-page">
      <div className="auth-card stack">
        <Link href="/" className="auth-brand"><Logo /></Link>
        <p className="mono muted">404</p>
        <h1>This page doesn&apos;t exist</h1>
        <p className="secondary">The link may be broken, or the page may have been removed.</p>
        <div className="row">
          <Link href="/dashboard" className="btn btn-primary">Go to dashboard</Link>
          <Link href="/" className="btn">Home</Link>
        </div>
      </div>
    </main>
  );
}
