// Demo data for local development. All colleges, people and messages are fictional.
// Every demo account uses the password below.
const bcrypt = require("bcryptjs");

const DEMO_PASSWORD = "Password123!";

// SQLite's datetime('now') format (UTC), shifted back by the given days/hours.
function ago(days, hours = 0) {
  const d = new Date(Date.now() - (days * 24 + hours) * 3600 * 1000);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

// ISO timestamp `days` from now at the given UTC hour (used for event start times).
function inDays(days, hourUtc) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hourUtc, 0, 0, 0);
  return d.toISOString();
}

function seed(db) {
  const year = new Date().getFullYear();
  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  const insertCollege = db.prepare(
    "INSERT INTO colleges (name, domain) VALUES (?, ?)",
  );
  const insertUser = db.prepare(
    `INSERT INTO users (college_id, email, password_hash, role, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  );
  const insertProfile = db.prepare(
    `INSERT INTO profiles (user_id, full_name, headline, graduation_year, degree, department,
       current_company, current_role, location, bio, skills, linkedin_url, open_to_mentor)
     VALUES (@user_id, @full_name, @headline, @graduation_year, @degree, @department,
       @current_company, @current_role, @location, @bio, @skills, @linkedin_url, @open_to_mentor)`,
  );

  const run = db.transaction(() => {
    const northwood = insertCollege.run("Northwood University", "northwood.edu").lastInsertRowid;
    const lakeside = insertCollege.run("Lakeside Institute of Technology", "lakeside.edu").lastInsertRowid;

    const people = [
      // Northwood University
      { key: "admin", college: northwood, email: "admin@northwood.edu", role: "admin", full_name: "Anita Rao", headline: "Alumni Relations Office", current_company: "Northwood University", current_role: "Alumni Relations Manager", location: "Boston, MA", department: "Administration" },
      { key: "iyer", college: northwood, email: "meera.iyer@northwood.edu", role: "faculty", full_name: "Dr. Meera Iyer", headline: "Associate Professor, Distributed Systems", degree: "Ph.D. Computer Science", department: "Computer Science", current_company: "Northwood University", current_role: "Associate Professor", location: "Boston, MA", bio: "I teach operating systems and distributed systems, and run the Systems Lab. Always happy to talk research with curious students.", skills: "Distributed Systems, Operating Systems, Research", mentor: 1 },
      { key: "sarah", college: northwood, email: "sarah.johnson@northwood.edu", role: "alumni", full_name: "Sarah Johnson", headline: "Senior Software Engineer at Google", graduation_year: 2019, degree: "B.Tech Computer Science", department: "Computer Science", current_company: "Google", current_role: "Senior Software Engineer", location: "San Francisco, CA", bio: "Full-stack engineer working on Google Cloud infrastructure. I enjoy mentoring students on interviews and system design.", skills: "Go, Kubernetes, System Design, React", mentor: 1 },
      { key: "michael", college: northwood, email: "michael.chen@northwood.edu", role: "alumni", full_name: "Michael Chen", headline: "ML Engineer at Meta", graduation_year: 2018, degree: "M.Tech Data Science", department: "Computer Science", current_company: "Meta", current_role: "Machine Learning Engineer", location: "Menlo Park, CA", bio: "Recommendation systems and NLP. Happy to chat about getting into ML engineering.", skills: "Python, PyTorch, Recommender Systems, NLP", mentor: 1 },
      { key: "priya", college: northwood, email: "priya.patel@northwood.edu", role: "alumni", full_name: "Priya Patel", headline: "Product Manager at Microsoft", graduation_year: 2020, degree: "B.Tech Computer Science", department: "Computer Science", current_company: "Microsoft", current_role: "Product Manager", location: "Seattle, WA", bio: "Former SWE turned PM. Ask me about moving from engineering to product.", skills: "Product Strategy, SQL, Roadmapping", mentor: 1 },
      { key: "james", college: northwood, email: "james.williams@northwood.edu", role: "alumni", full_name: "James Williams", headline: "Research Scientist", graduation_year: 2017, degree: "Ph.D. Computer Science", department: "Computer Science", current_company: "OpenAI", current_role: "Research Scientist", location: "San Francisco, CA", bio: "Working on large language models and evaluation.", skills: "Deep Learning, LLMs, Research" },
      { key: "maria", college: northwood, email: "maria.garcia@northwood.edu", role: "alumni", full_name: "Maria Garcia", headline: "Backend Engineer at Stripe", graduation_year: 2021, degree: "B.Tech Computer Science", department: "Computer Science", current_company: "Stripe", current_role: "Software Engineer", location: "Bengaluru, India", bio: "Payments infrastructure and distributed systems. Glad to share interview prep tips.", skills: "Java, Distributed Systems, PostgreSQL", mentor: 1 },
      { key: "david", college: northwood, email: "david.kim@northwood.edu", role: "alumni", full_name: "David Kim", headline: "Staff Engineer at Netflix", graduation_year: 2016, degree: "M.Tech Computer Science", department: "Computer Science", current_company: "Netflix", current_role: "Staff Engineer", location: "Los Gatos, CA", bio: "Video encoding and CDN optimisation.", skills: "C++, Video, Networking" },
      { key: "lisa", college: northwood, email: "lisa.zhang@northwood.edu", role: "alumni", full_name: "Lisa Zhang", headline: "Senior Engineer at Airbnb", graduation_year: 2019, degree: "B.Tech Information Technology", department: "Information Technology", current_company: "Airbnb", current_role: "Senior Software Engineer", location: "Remote", bio: "Search and discovery. Previously built real-time systems at Uber.", skills: "TypeScript, React, GraphQL", mentor: 1 },
      { key: "robert", college: northwood, email: "robert.anderson@northwood.edu", role: "alumni", full_name: "Robert Anderson", headline: "Engineering Manager at Apple", graduation_year: 2015, degree: "B.Tech Electronics", department: "Electronics", current_company: "Apple", current_role: "Engineering Manager", location: "Cupertino, CA", bio: "Leading iOS platform teams.", skills: "Swift, iOS, Leadership" },
      { key: "amanda", college: northwood, email: "amanda.taylor@northwood.edu", role: "alumni", full_name: "Amanda Taylor", headline: "Product Designer at Notion", graduation_year: 2020, degree: "B.Des Interaction Design", department: "Design", current_company: "Notion", current_role: "Senior Product Designer", location: "New York, NY", bio: "Designer who codes. Happy to review portfolios.", skills: "Figma, Design Systems, Accessibility", mentor: 1 },
      { key: "kevin", college: northwood, email: "kevin.nguyen@northwood.edu", role: "alumni", full_name: "Kevin Nguyen", headline: "Solutions Architect at Databricks", graduation_year: 2018, degree: "B.Tech Computer Science", department: "Computer Science", current_company: "Databricks", current_role: "Senior Solutions Architect", location: "Hyderabad, India", bio: "Data platforms, Spark and MLOps.", skills: "Spark, Scala, Data Engineering" },
      { key: "emily", college: northwood, email: "emily.davis@northwood.edu", role: "student", full_name: "Emily Davis", headline: "Final-year CS student", graduation_year: year + 1, degree: "B.Tech Computer Science", department: "Computer Science", current_role: "Student", location: "Boston, MA", bio: "Interested in backend engineering and ML. Looking for full-time roles and mentorship.", skills: "Java, Python, SQL, React" },
      { key: "alex", college: northwood, email: "alex.martinez@northwood.edu", role: "student", full_name: "Alex Martinez", headline: "Third-year CS student", graduation_year: year + 2, degree: "B.Tech Computer Science", department: "Computer Science", current_role: "Student", location: "Boston, MA", bio: "Systems programming and edtech side projects.", skills: "C, Rust, Linux" },
      { key: "sophia", college: northwood, email: "sophia.lee@northwood.edu", role: "student", full_name: "Sophia Lee", headline: "Data Science student", graduation_year: year + 1, degree: "B.Tech Data Science", department: "Data Science", current_role: "Student", location: "Boston, MA", bio: "ML for social good. Research assistant in the NLP lab.", skills: "Python, Pandas, NLP" },
      { key: "ryan", college: northwood, email: "ryan.thomas@northwood.edu", role: "student", full_name: "Ryan Thomas", headline: "Second-year IT student", graduation_year: year + 3, degree: "B.Tech Information Technology", department: "Information Technology", current_role: "Student", location: "Boston, MA", bio: "Mobile development and design.", skills: "Swift, Flutter, Figma" },
      // Lakeside Institute of Technology
      { key: "ladmin", college: lakeside, email: "admin@lakeside.edu", role: "admin", full_name: "Rahul Mehta", headline: "Alumni Office", current_company: "Lakeside Institute of Technology", current_role: "Alumni Office Coordinator", location: "Chicago, IL", department: "Administration" },
      { key: "alice", college: lakeside, email: "alice.chen@lakeside.edu", role: "alumni", full_name: "Alice Chen", headline: "Hardware Engineer at Tesla", graduation_year: 2019, degree: "B.Tech Electrical Engineering", department: "Electrical Engineering", current_company: "Tesla", current_role: "Senior Hardware Engineer", location: "Austin, TX", bio: "Battery systems for EVs.", skills: "Power Electronics, MATLAB", mentor: 1 },
      { key: "brian", college: lakeside, email: "brian.oconnor@lakeside.edu", role: "alumni", full_name: "Brian O'Connor", headline: "Principal Engineer at AWS", graduation_year: 2017, degree: "M.Tech Computer Science", department: "Computer Science", current_company: "Amazon Web Services", current_role: "Principal Engineer", location: "Seattle, WA", bio: "Serverless and edge services.", skills: "AWS, Java, Distributed Systems" },
      { key: "daniel", college: lakeside, email: "daniel.brown@lakeside.edu", role: "student", full_name: "Daniel Brown", headline: "Robotics student", graduation_year: year + 1, degree: "B.Tech Mechatronics", department: "Mechatronics", current_role: "Student", location: "Chicago, IL", bio: "Robotics and computer vision.", skills: "ROS, OpenCV, Python" },
    ];

    const id = {};
    people.forEach((p, i) => {
      const userId = insertUser.run(p.college, p.email, hash, p.role, ago(120 - i * 3)).lastInsertRowid;
      id[p.key] = userId;
      insertProfile.run({
        user_id: userId,
        full_name: p.full_name,
        headline: p.headline ?? null,
        graduation_year: p.graduation_year ?? null,
        degree: p.degree ?? null,
        department: p.department ?? null,
        current_company: p.current_company ?? null,
        current_role: p.current_role ?? null,
        location: p.location ?? null,
        bio: p.bio ?? null,
        skills: p.skills ?? null,
        linkedin_url: p.role === "admin" ? null : `https://www.linkedin.com/in/${p.email.split("@")[0].replace(".", "-")}`,
        open_to_mentor: p.mentor ? 1 : 0,
      });
    });

    // Connections
    const insertConnection = db.prepare(
      `INSERT INTO connections (requester_id, addressee_id, status, created_at, responded_at)
       VALUES (?, ?, ?, ?, ?)`,
    );
    [
      ["emily", "sarah", "accepted", 20],
      ["emily", "michael", "accepted", 15],
      ["sophia", "emily", "accepted", 30],
      ["sarah", "michael", "accepted", 60],
      ["sarah", "maria", "accepted", 45],
      ["alex", "sarah", "accepted", 10],
      ["priya", "emily", "pending", 1],
      ["alex", "emily", "pending", 2],
      ["ryan", "sarah", "pending", 1],
      ["alice", "daniel", "accepted", 12],
    ].forEach(([a, b, status, days]) =>
      insertConnection.run(id[a], id[b], status, ago(days), status === "accepted" ? ago(days - 1) : null),
    );

    // Messages
    const insertMessage = db.prepare(
      "INSERT INTO messages (sender_id, recipient_id, body, created_at, read_at) VALUES (?, ?, ?, ?, ?)",
    );
    [
      ["emily", "sarah", "Hi Sarah! Thanks for accepting my request. Could I ask a few questions about the Google interview process?", 5, 3, true],
      ["sarah", "emily", "Of course! Happy to help. Are you applying for new-grad SWE roles?", 5, 1, true],
      ["emily", "sarah", "Yes, backend-focused. I'm mostly worried about the system design round.", 4, 20, true],
      ["sarah", "emily", "For new grads it's usually lighter. Practise designing a URL shortener and a rate limiter end to end, and talk through trade-offs out loud.", 4, 18, true],
      ["sarah", "emily", "Also, I posted a referral-friendly role on the Jobs board. Take a look!", 1, 2, false],
      ["michael", "emily", "Hey Emily, saw you're into ML. We're hiring interns next cycle, I'll share details when the posting is live.", 0, 5, false],
      ["sarah", "michael", "Are you coming to the alumni meetup next month?", 3, 0, true],
      ["michael", "sarah", "Planning to! Will bring a couple of folks from my team.", 2, 22, true],
    ].forEach(([from, to, body, days, hours, read]) =>
      insertMessage.run(id[from], id[to], body, ago(days, hours), read ? ago(days, hours - 1) : null),
    );

    // Jobs
    const insertJob = db.prepare(
      `INSERT INTO jobs (college_id, posted_by, company_name, title, job_type, location, is_remote, description, apply_url, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    [
      [northwood, "sarah", "Google", "Software Engineer, New Grad", "full-time", "Bengaluru, India", 0, "Join a Google Cloud team building internal developer platforms. You will design, build and operate services used by thousands of engineers. Happy to refer strong Northwood candidates.", "https://careers.google.com/", "open", 1],
      [northwood, "michael", "Meta", "Machine Learning Engineer Intern", "internship", "Menlo Park, CA", 0, "Work on ranking models for feed recommendations: training pipelines, offline evaluation and online A/B tests. Strong Python and ML fundamentals expected.", "https://www.metacareers.com/", "open", 3],
      [northwood, "priya", "Microsoft", "Product Manager Intern", "internship", "Hyderabad, India", 0, "Own a feature area for Microsoft 365: write specs, analyse usage data and work with engineering to ship. Technical background preferred.", "https://careers.microsoft.com/", "open", 4],
      [northwood, "maria", "Stripe", "Backend Engineer", "full-time", "Bengaluru, India", 0, "Build reliable payments APIs and the distributed systems behind them. Experience with Java or Go and relational databases is a plus.", "https://stripe.com/jobs", "open", 6],
      [northwood, "lisa", "Airbnb", "Frontend Engineer Intern", "internship", "Remote", 1, "Build user-facing search features in React and TypeScript. We care about performance, accessibility and clean component design.", "https://careers.airbnb.com/", "open", 8],
      [northwood, "kevin", "Databricks", "Data Engineer", "full-time", "Hyderabad, India", 0, "Help customers build lakehouse data platforms with Spark and Delta Lake. Solid SQL and Python required.", "https://www.databricks.com/company/careers", "open", 10],
      [northwood, "amanda", "Notion", "Product Design Intern", "internship", "New York, NY", 0, "Own end-to-end design for a feature, from research to polished UI. Portfolio required.", "https://www.notion.so/careers", "open", 12],
      [northwood, "david", "Netflix", "Senior Software Engineer, Encoding", "full-time", "Los Gatos, CA", 0, "Improve video encoding pipelines at scale. 5+ years of experience.", "https://jobs.netflix.com/", "closed", 40],
      [lakeside, "alice", "Tesla", "Battery Systems Intern", "internship", "Austin, TX", 0, "Test and characterise battery modules; strong circuits fundamentals needed.", "https://www.tesla.com/careers", "open", 2],
      [lakeside, "brian", "Amazon Web Services", "Cloud Support Engineer", "full-time", "Seattle, WA", 0, "Help customers architect and troubleshoot workloads on AWS.", "https://www.amazon.jobs/", "open", 5],
    ].forEach(([college, by, company, title, type, location, remote, desc, url, status, days]) =>
      insertJob.run(college, id[by], company, title, type, location, remote, desc, url, status, ago(days)),
    );

    // Events
    const insertEvent = db.prepare(
      `INSERT INTO events (college_id, organizer_id, title, description, event_type, starts_at, location, is_virtual, capacity, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const events = [
      [northwood, "admin", "Annual Alumni Meetup", "Our biggest gathering of the year: talks from alumni founders, networking and dinner on campus.", "reunion", inDays(21, 13), "Main Auditorium, Northwood Campus", 0, 150],
      [northwood, "sarah", "System Design Interview Workshop", "A hands-on session on approaching system design interviews, with mock problems and live feedback.", "workshop", inDays(6, 14), "Online (Google Meet)", 1, 40],
      [northwood, "iyer", "Research Careers Panel", "Alumni in research labs discuss PhDs, research engineering roles and how to get started as an undergrad.", "webinar", inDays(12, 15), "Online (Zoom)", 1, null],
      [northwood, "admin", "Campus Career Fair", "Meet recruiters from alumni-led companies. Bring printed resumes.", "career-fair", inDays(35, 10), "Sports Complex, Northwood Campus", 0, 3],
      [northwood, "michael", "Intro to ML in Production", "What changes when a model leaves the notebook: data pipelines, monitoring and A/B testing.", "workshop", inDays(-10, 14), "Online (Zoom)", 1, 60],
      [lakeside, "ladmin", "Lakeside Founders Night", "Alumni founders share their startup journeys.", "networking", inDays(9, 18), "Innovation Hub, Lakeside", 0, 80],
    ];
    const eventIds = events.map((e) =>
      insertEvent.run(e[0], id[e[1]], e[2], e[3], e[4], e[5], e[6], e[7], e[8], ago(15)).lastInsertRowid,
    );
    const insertRsvp = db.prepare("INSERT INTO event_rsvps (event_id, user_id) VALUES (?, ?)");
    [
      [0, ["sarah", "michael", "priya", "maria", "sophia", "alex"]],
      [1, ["emily", "sophia", "alex", "ryan"]],
      [2, ["sophia", "james"]],
      [3, ["alex", "ryan", "sophia"]], // career fair is full (capacity 3)
      [4, ["emily", "sophia", "kevin"]],
      [5, ["alice", "daniel"]],
    ].forEach(([idx, keys]) => keys.forEach((k) => insertRsvp.run(eventIds[idx], id[k])));

    // Mentorship
    const insertMentorship = db.prepare(
      `INSERT INTO mentorship_requests (mentee_id, mentor_id, topic, message, status, created_at, responded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    [
      ["emily", "michael", "Breaking into ML engineering", "I'd love guidance on which projects would make my profile stronger for ML roles.", "accepted", 14],
      ["sophia", "sarah", "Preparing for SWE interviews", "Could you help me build a 2-month prep plan for software engineering interviews?", "pending", 2],
      ["alex", "sarah", "Choosing between systems and web roles", "I enjoy both low-level systems and web development. How did you decide?", "pending", 1],
      ["ryan", "lisa", "Frontend career advice", "Looking for feedback on my portfolio and which frontend skills to focus on.", "declined", 20],
      ["emily", "priya", "Switching from engineering to PM", "How did you make the move to product management?", "completed", 50],
    ].forEach(([mentee, mentor, topic, msg, status, days]) =>
      insertMentorship.run(id[mentee], id[mentor], topic, msg, status, ago(days), status === "pending" ? null : ago(days - 1)),
    );

    // Notifications (consistent with the activity above)
    const insertNotification = db.prepare(
      `INSERT INTO notifications (user_id, type, title, body, link, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    [
      ["emily", "connection_request", "Priya Patel wants to connect", null, "/dashboard/connections", 0, 1],
      ["emily", "connection_request", "Alex Martinez wants to connect", null, "/dashboard/connections", 0, 2],
      ["emily", "mentorship_accepted", "Michael Chen accepted your mentorship request", "Breaking into ML engineering", "/dashboard/mentorship", 1, 13],
      ["sarah", "mentorship_request", "Sophia Lee requested mentorship", "Preparing for SWE interviews", "/dashboard/mentorship", 0, 2],
      ["sarah", "mentorship_request", "Alex Martinez requested mentorship", "Choosing between systems and web roles", "/dashboard/mentorship", 0, 1],
      ["sarah", "connection_request", "Ryan Thomas wants to connect", null, "/dashboard/connections", 0, 1],
    ].forEach(([user, type, title, body, link, read, days]) =>
      insertNotification.run(id[user], type, title, body, link, read, ago(days, 1)),
    );
  });

  run();
  console.log("[db] Seeded demo data. Password for all demo accounts:", DEMO_PASSWORD);
}

module.exports = { seed, DEMO_PASSWORD };
