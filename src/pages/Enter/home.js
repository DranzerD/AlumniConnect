 import './dashboard.css'
 const Home = ({isLoggedin, username, graduationYear, email, institute})=>{
    const styles = {
        page: {
          fontFamily: "Arial, sans-serif",
          lineHeight: "1.6",
        },
        header: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 50px",
          backgroundColor: "#4a7766",
          color: "#fff",
        },
        logo: {
          fontSize: "24px",
          fontWeight: "bold",
        },
        nav: {
          display: "flex",
          gap: "20px",
        },
        navLink: {
          color: "#fff",
          textDecoration: "none",
          fontSize: "16px",
        },
        hero: {
          textAlign: "center",
          padding: "50px 20px",
          backgroundColor: "#f4f4f4",
        },
        heroTitle: {
          fontSize: "36px",
          marginBottom: "20px",
        },
        heroSubtitle: {
          fontSize: "18px",
          color: "#555",
          marginBottom: "30px",
        },
        heroButtons: {
          display: "flex",
          justifyContent: "center",
          gap: "20px",

        },
        heroButton: {
          backgroundColor: "#4a7766",
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        },
        heroButtonSecondary: {
          backgroundColor: "#ddd",
          border: "none",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        },
        section: {
          padding: "50px 20px",
        },
        sectionLight: {
          padding: "50px 20px",
          backgroundColor: "#f9f9f9",
        },
        sectionTitle: {
          fontSize: "28px",
          textAlign: "center",
          marginBottom: "20px",
        },
        footer: {
          padding: "20px",
          backgroundColor: "#4a7766",
          color: "#fff",
          textAlign: "center",
        },
        footerContent: {
          marginBottom: "10px",
        },
        storyList: {
          display: "flex",
          justifyContent: "center",
          gap: "20px",
        },
        storyCard: {
          width: "200px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        },
    }
    return(
        <>{isLoggedin ? (
            <>
            <header className="dashboard-header">
                <h1>Welcome, {username}</h1>
                <p>Your personalized dashboard for staying connected with {institute} Engineering College.</p>
            </header>

            <section className="profile-overview">
                <h2>Profile Overview</h2>
                <p><strong>Name:</strong> {username}</p>
                <p><strong>Graduation Year:</strong> {graduationYear}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><a href="#">Edit Profile</a></p>
            </section>

            <section className="personalized-recommendations">
                <h2>Recommended for You</h2>
                <div className="recommendation">
                    <h3>Job Opportunity: Senior Software Engineer</h3>
                    <p>Company: ABC Tech - Location: Bangalore</p>
                    <a href="#">View Details</a>
                </div>

                <div className="recommendation">
                    <h3>Upcoming Event: Alumni Networking Meet</h3>
                    <p>Date: December 20th, 2024 - Location: GEC Campus</p>
                    <a href="#">Register Now</a>
                </div>

            </section>

            <section className="notifications">
                <h2>Notifications</h2>
                <ul>
                    <li><strong>New message</strong> from Alumnus 1: "Looking forward to meeting you at the alumni event."</li>
                    <li><strong>Reminder</strong>: Annual Alumni Meet Registration closes soon.</li>
                </ul>
            </section>

            

            <footer className="dashboard-footer">
                <p>&copy; 2024 {institute} Engineering College Alumni Association. All rights reserved.</p>
            </footer>
            </> ) :(
            <>
            
    <div style={styles.page}>
      {/* Header Section */}
      <header style={styles.header}>
        <h1 style={styles.logo}>AlumniConnect</h1>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Connect, Inspire, and Empower</h1>
        <p style={styles.heroSubtitle}>
          Bringing our alumni closer together to network, collaborate, and support our alma mater.
        </p>
        <div style={styles.heroButtons}>
          <button style={styles.heroButton}>Get Started</button>
          <button style={styles.heroButtonSecondary}>Learn More</button>
        </div>
      </section>

      {/* Donation Portal Section */}
      <section id="donations" style={styles.sectionLight}>
        <h2 style={styles.sectionTitle}>Donation Portal</h2>
        <p>
          Contribute to college initiatives and make a difference. Secure payment gateways ensure your contributions are safe.
        </p>
        <p>See how your support impacts the community in real time!</p>
        <button style={styles.heroButton}>Donate Now</button>
      </section>

      {/* Footer Section */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <h3>Contact Us</h3>
          <p>Email: alumni@gmail.com</p>
          <p>Phone: 9922932029</p>
        </div>
        <div style={styles.footerContent}>
          <h3>Follow Us</h3>
          <p><a href = 'https://www.facebook.com'>Facebook</a> | <a href = 'https://www.twitter.com'>Twitter</a> | <a href = 'https://www.linkedin.com'>LinkedIn</a></p>
        </div>
      </footer>
    </div>
                </>
            )
        }
        </>

    )
 }
 export default Home;