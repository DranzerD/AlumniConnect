import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const stats = [
    { value: "50K+", label: "Alumni Network" },
    { value: "100+", label: "Colleges" },
    { value: "5K+", label: "Jobs Posted" },
    { value: "95%", label: "Success Rate" },
  ];

  const features = [
    {
      icon: "🎓",
      title: "Alumni Directory",
      description:
        "Find and connect with alumni from your college across industries and locations.",
    },
    {
      icon: "💼",
      title: "Exclusive Jobs",
      description:
        "Access job opportunities shared exclusively by alumni at top companies.",
    },
    {
      icon: "🤝",
      title: "Mentorship",
      description:
        "Get guidance from experienced professionals who've walked your path.",
    },
    {
      icon: "📅",
      title: "Events & Meetups",
      description:
        "Attend networking events, webinars, and reunions with fellow alumni.",
    },
    {
      icon: "📊",
      title: "Career Insights",
      description:
        "Track career trends and see where alumni from your college are thriving.",
    },
    {
      icon: "💬",
      title: "Community Forum",
      description:
        "Engage in discussions, seek advice, and share your experiences.",
    },
  ];

  const testimonials = [
    {
      quote:
        "AlumniConnect helped me land my dream job at Google through an alumni referral!",
      name: "Priya Sharma",
      role: "Software Engineer at Google",
      year: "Class of 2019",
    },
    {
      quote:
        "The mentorship program connected me with industry leaders who shaped my career.",
      name: "Rahul Verma",
      role: "Product Manager at Microsoft",
      year: "Class of 2018",
    },
    {
      quote:
        "Found my co-founder through this platform. Best networking platform for alumni!",
      name: "Ananya Krishnan",
      role: "Startup Founder",
      year: "Class of 2017",
    },
  ];

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <Link href="/" className={styles.logo}>
            🎓 AlumniConnect
          </Link>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#testimonials">Stories</a>
            <a href="#stats">Network</a>
          </div>
          <div className={styles.navActions}>
            <Link href="/login" className={styles.loginBtn}>
              Sign In
            </Link>
            <Link href="/register" className={styles.registerBtn}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroShape1}></div>
          <div className={styles.heroShape2}></div>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>
              🚀 Trusted by 50,000+ Alumni
            </span>
            <h1 className={styles.heroTitle}>
              Connect. Grow.
              <br />
              <span className={styles.heroGradient}>Succeed Together.</span>
            </h1>
            <p className={styles.heroDescription}>
              Join the largest alumni network connecting graduates across 100+
              colleges. Build meaningful relationships, discover opportunities,
              and accelerate your career.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/register" className={styles.primaryBtn}>
                Join the Network
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/login" className={styles.secondaryBtn}>
                Explore as Guest
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <div className={styles.cardAvatar}>👩‍💼</div>
              <div className={styles.cardInfo}>
                <span className={styles.cardName}>New Connection</span>
                <span className={styles.cardRole}>Sarah joined from MIT</span>
              </div>
            </div>
            <div className={styles.heroCard + " " + styles.card2}>
              <div className={styles.cardAvatar}>🎯</div>
              <div className={styles.cardInfo}>
                <span className={styles.cardName}>Job Opportunity</span>
                <span className={styles.cardRole}>
                  SDE at Google - Referral
                </span>
              </div>
            </div>
            <div className={styles.heroCard + " " + styles.card3}>
              <div className={styles.cardAvatar}>📈</div>
              <div className={styles.cardInfo}>
                <span className={styles.cardName}>Your Network</span>
                <span className={styles.cardRole}>+127 this month</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Features</span>
          <h2 className={styles.sectionTitle}>
            Everything you need to grow your network
          </h2>
          <p className={styles.sectionSubtitle}>
            Powerful tools designed to help you connect, learn, and advance your
            career.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={styles.testimonialsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Success Stories</span>
          <h2 className={styles.sectionTitle}>What our alumni say</h2>
          <p className={styles.sectionSubtitle}>
            Real stories from alumni who transformed their careers through our
            platform.
          </p>
        </div>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.testimonialCard}>
              <div className={styles.testimonialQuote}>
                "{testimonial.quote}"
              </div>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}>
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className={styles.testimonialInfo}>
                  <span className={styles.testimonialName}>
                    {testimonial.name}
                  </span>
                  <span className={styles.testimonialRole}>
                    {testimonial.role}
                  </span>
                  <span className={styles.testimonialYear}>
                    {testimonial.year}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to connect with your alumni network?</h2>
          <p>
            Join thousands of graduates who are building meaningful connections
            every day.
          </p>
          <Link href="/register" className={styles.ctaBtn}>
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>🎓 AlumniConnect</span>
            <p>Connecting graduates, building futures.</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>Platform</h4>
              <a href="#">Features</a>
              <a href="#">Jobs</a>
              <a href="#">Events</a>
              <a href="#">Mentorship</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Press</a>
              <a href="#">Contact</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Legal</h4>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2024 AlumniConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
