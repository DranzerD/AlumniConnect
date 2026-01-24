const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.join(process.cwd(), "alumni.db");
const db = new Database(dbPath);

// Initialize schema
function initializeDatabase() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS colleges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      domain TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      college_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('student', 'alumni', 'faculty', 'admin')),
      is_active BOOLEAN DEFAULT 1,
      must_reset_password BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(college_id, email),
      FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS profiles (
      user_id INTEGER PRIMARY KEY,
      full_name TEXT NOT NULL,
      graduation_year INTEGER,
      degree TEXT,
      department TEXT,
      current_company TEXT,
      current_role TEXT,
      location TEXT,
      linkedin_url TEXT,
      github_url TEXT,
      bio TEXT,
      profile_visibility BOOLEAN DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      college_id INTEGER NOT NULL,
      posted_by_user_id INTEGER NOT NULL,
      company_name TEXT NOT NULL,
      role_title TEXT NOT NULL,
      job_type TEXT NOT NULL CHECK (job_type IN ('internship', 'full-time')),
      location TEXT,
      description TEXT NOT NULL,
      requirements TEXT,
      apply_link TEXT NOT NULL,
      status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
      FOREIGN KEY (posted_by_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_college ON users(college_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_year ON profiles(graduation_year);
    CREATE INDEX IF NOT EXISTS idx_jobs_college ON jobs(college_id);
  `);

  // Seed data
  const collegeCount = db
    .prepare("SELECT COUNT(*) as count FROM colleges")
    .get();
  if (collegeCount.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  // Create colleges
  const insertCollege = db.prepare(
    "INSERT INTO colleges (name, domain) VALUES (?, ?)"
  );
  const college1 = insertCollege.run("Stanford University", "stanford.edu");
  const college2 = insertCollege.run("MIT", "mit.edu");

  const hash = bcrypt.hashSync("Demo@123", 10);

  // Create users
  const insertUser = db.prepare(
    "INSERT INTO users (college_id, email, password_hash, role, must_reset_password) VALUES (?, ?, ?, ?, ?)"
  );

  // Stanford Users
  const admin1 = insertUser.run(
    college1.lastInsertRowid,
    "admin@stanford.edu",
    hash,
    "admin",
    0
  );

  // Stanford Alumni
  const alumni1 = insertUser.run(
    college1.lastInsertRowid,
    "sarah.johnson@stanford.edu",
    hash,
    "alumni",
    0
  );
  const alumni2 = insertUser.run(
    college1.lastInsertRowid,
    "michael.chen@stanford.edu",
    hash,
    "alumni",
    0
  );
  const alumni3 = insertUser.run(
    college1.lastInsertRowid,
    "priya.patel@stanford.edu",
    hash,
    "alumni",
    0
  );
  const alumni4 = insertUser.run(
    college1.lastInsertRowid,
    "james.williams@stanford.edu",
    hash,
    "alumni",
    0
  );
  const alumni5 = insertUser.run(
    college1.lastInsertRowid,
    "maria.garcia@stanford.edu",
    hash,
    "alumni",
    0
  );
  const alumni6 = insertUser.run(
    college1.lastInsertRowid,
    "david.kim@stanford.edu",
    hash,
    "alumni",
    0
  );
  const alumni7 = insertUser.run(
    college1.lastInsertRowid,
    "lisa.zhang@stanford.edu",
    hash,
    "alumni",
    0
  );
  const alumni8 = insertUser.run(
    college1.lastInsertRowid,
    "robert.anderson@stanford.edu",
    hash,
    "alumni",
    0
  );
  const alumni9 = insertUser.run(
    college1.lastInsertRowid,
    "amanda.taylor@stanford.edu",
    hash,
    "alumni",
    0
  );
  const alumni10 = insertUser.run(
    college1.lastInsertRowid,
    "kevin.nguyen@stanford.edu",
    hash,
    "alumni",
    0
  );

  // Stanford Students
  const student1 = insertUser.run(
    college1.lastInsertRowid,
    "emily.davis@stanford.edu",
    hash,
    "student",
    0
  );
  const student2 = insertUser.run(
    college1.lastInsertRowid,
    "alex.martinez@stanford.edu",
    hash,
    "student",
    0
  );
  const student3 = insertUser.run(
    college1.lastInsertRowid,
    "sophia.lee@stanford.edu",
    hash,
    "student",
    0
  );
  const student4 = insertUser.run(
    college1.lastInsertRowid,
    "ryan.thomas@stanford.edu",
    hash,
    "student",
    0
  );
  const student5 = insertUser.run(
    college1.lastInsertRowid,
    "olivia.white@stanford.edu",
    hash,
    "student",
    0
  );

  // Stanford Faculty
  const faculty1 = insertUser.run(
    college1.lastInsertRowid,
    "prof.johnson@stanford.edu",
    hash,
    "faculty",
    0
  );

  // MIT Users
  const admin2 = insertUser.run(
    college2.lastInsertRowid,
    "admin@mit.edu",
    hash,
    "admin",
    0
  );
  const alumni11 = insertUser.run(
    college2.lastInsertRowid,
    "alice.chen@mit.edu",
    hash,
    "alumni",
    0
  );
  const alumni12 = insertUser.run(
    college2.lastInsertRowid,
    "brian.o'connor@mit.edu",
    hash,
    "alumni",
    0
  );
  const alumni13 = insertUser.run(
    college2.lastInsertRowid,
    "jessica.rodriguez@mit.edu",
    hash,
    "alumni",
    0
  );
  const student6 = insertUser.run(
    college2.lastInsertRowid,
    "daniel.brown@mit.edu",
    hash,
    "student",
    0
  );
  const student7 = insertUser.run(
    college2.lastInsertRowid,
    "maya.patel@mit.edu",
    hash,
    "student",
    0
  );

  // Create profiles
  const insertProfile = db.prepare(`
    INSERT INTO profiles (user_id, full_name, graduation_year, degree, department, current_company, current_role, location, linkedin_url, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Stanford Alumni Profiles
  insertProfile.run(
    alumni1.lastInsertRowid,
    "Sarah Johnson",
    2019,
    "B.S. Computer Science",
    "Computer Science",
    "Google",
    "Senior Software Engineer",
    "San Francisco, CA",
    "https://linkedin.com/in/sarahjohnson",
    "Passionate full-stack engineer with 5+ years building scalable web applications. Love mentoring students and contributing to open source. Currently working on Google Cloud infrastructure."
  );

  insertProfile.run(
    alumni2.lastInsertRowid,
    "Michael Chen",
    2018,
    "M.S. Data Science",
    "Computer Science",
    "Meta",
    "Machine Learning Engineer",
    "Menlo Park, CA",
    "https://linkedin.com/in/michaelchen",
    "ML engineer specializing in recommendation systems and NLP. Built models serving 2B+ users. Always happy to chat about AI ethics and practical ML deployment at scale."
  );

  insertProfile.run(
    alumni3.lastInsertRowid,
    "Priya Patel",
    2020,
    "B.S. Computer Science",
    "Computer Science",
    "Microsoft",
    "Product Manager",
    "Seattle, WA",
    "https://linkedin.com/in/priyapatel",
    "Product leader passionate about building tools that empower developers. Previously SWE at Amazon. Love connecting with students interested in transitioning from eng to PM."
  );

  insertProfile.run(
    alumni4.lastInsertRowid,
    "James Williams",
    2017,
    "Ph.D. Computer Science",
    "Computer Science",
    "OpenAI",
    "Research Scientist",
    "San Francisco, CA",
    "https://linkedin.com/in/jameswilliams",
    "AI researcher focused on large language models and alignment. Published 20+ papers on deep learning. Excited about making AI safer and more beneficial for humanity."
  );

  insertProfile.run(
    alumni5.lastInsertRowid,
    "Maria Garcia",
    2021,
    "B.S. Computer Science",
    "Computer Science",
    "Stripe",
    "Software Engineer",
    "San Francisco, CA",
    "https://linkedin.com/in/mariagarcia",
    "Backend engineer building payment infrastructure used by millions of businesses. Love distributed systems and infrastructure. Happy to share interview prep tips!"
  );

  insertProfile.run(
    alumni6.lastInsertRowid,
    "David Kim",
    2016,
    "M.S. Computer Science",
    "Computer Science",
    "Netflix",
    "Staff Engineer",
    "Los Gatos, CA",
    "https://linkedin.com/in/davidkim",
    "Building the streaming platform that brings joy to 200M+ subscribers. Focus on video encoding and CDN optimization. Mentor at Code2040 and STEM programs."
  );

  insertProfile.run(
    alumni7.lastInsertRowid,
    "Lisa Zhang",
    2019,
    "B.S. Computer Science",
    "Computer Science",
    "Airbnb",
    "Senior Software Engineer",
    "San Francisco, CA",
    "https://linkedin.com/in/lisazhang",
    "Full-stack engineer working on search and discovery. Previously at Uber building real-time systems. Passionate about travel tech and creating inclusive products."
  );

  insertProfile.run(
    alumni8.lastInsertRowid,
    "Robert Anderson",
    2015,
    "B.S. Computer Science",
    "Computer Science",
    "Apple",
    "Engineering Manager",
    "Cupertino, CA",
    "https://linkedin.com/in/robertanderson",
    "Leading iOS platform teams at Apple. 8+ years building developer tools and frameworks. Love teaching and have given talks at WWDC. Always open to coffee chats with students."
  );

  insertProfile.run(
    alumni9.lastInsertRowid,
    "Amanda Taylor",
    2020,
    "B.S. Computer Science",
    "Computer Science",
    "Notion",
    "Senior Product Designer",
    "San Francisco, CA",
    "https://linkedin.com/in/amandataylor",
    "Designer who codes. Building delightful productivity tools. Previously at Figma. Passionate about design systems and accessibility. Happy to review portfolios!"
  );

  insertProfile.run(
    alumni10.lastInsertRowid,
    "Kevin Nguyen",
    2018,
    "B.S. Computer Science",
    "Computer Science",
    "Databricks",
    "Senior Solutions Architect",
    "San Francisco, CA",
    "https://linkedin.com/in/kevinnguyen",
    "Helping companies build modern data platforms. Expert in Spark, Delta Lake, and MLOps. Former data engineer at LinkedIn. Love teaching data engineering best practices."
  );

  // Stanford Students
  insertProfile.run(
    student1.lastInsertRowid,
    "Emily Davis",
    2025,
    "B.S. Computer Science",
    "Computer Science",
    null,
    "Student",
    "Stanford, CA",
    "https://linkedin.com/in/emilydavis",
    "CS junior interested in full-stack development and AI. Currently TA for CS106B. Looking for summer 2024 internships in web dev or ML. Love hackathons!"
  );

  insertProfile.run(
    student2.lastInsertRowid,
    "Alex Martinez",
    2026,
    "B.S. Computer Science",
    "Computer Science",
    null,
    "Student",
    "Stanford, CA",
    "https://linkedin.com/in/alexmartinez",
    "Sophomore exploring systems programming and distributed computing. Working on a startup idea in the edtech space. Seeking mentorship and internship opportunities!"
  );

  insertProfile.run(
    student3.lastInsertRowid,
    "Sophia Lee",
    2025,
    "B.S. Data Science",
    "Computer Science",
    null,
    "Student",
    "Stanford, CA",
    "https://linkedin.com/in/sophialee",
    "Data science junior passionate about using ML for social good. Research assistant in NLP lab. Looking for data science internships for summer 2024."
  );

  insertProfile.run(
    student4.lastInsertRowid,
    "Ryan Thomas",
    2026,
    "B.S. Computer Science",
    "Computer Science",
    null,
    "Student",
    "Stanford, CA",
    "https://linkedin.com/in/ryanthomas",
    "Freshman interested in mobile development and design. Built 3 iOS apps with 10k+ downloads. Eager to learn from industry professionals!"
  );

  insertProfile.run(
    student5.lastInsertRowid,
    "Olivia White",
    2024,
    "B.S. Computer Science",
    "Computer Science",
    null,
    "Student",
    "Stanford, CA",
    "https://linkedin.com/in/oliviawhite",
    "Senior graduating this year! Interned at Amazon and Salesforce. Accepted return offer from Amazon for new grad SDE role. Happy to help underclassmen with recruiting!"
  );

  // Stanford Faculty
  insertProfile.run(
    faculty1.lastInsertRowid,
    "Dr. Robert Johnson",
    null,
    "Ph.D. Computer Science",
    "Computer Science",
    "Stanford University",
    "Associate Professor",
    "Stanford, CA",
    "https://linkedin.com/in/profjohnson",
    "Teaching systems and networking courses. Research in distributed systems and cloud computing. Always looking for passionate students to join my research group!"
  );

  // MIT Alumni Profiles
  insertProfile.run(
    alumni11.lastInsertRowid,
    "Alice Chen",
    2019,
    "B.S. Electrical Engineering",
    "Electrical Engineering",
    "Tesla",
    "Senior Hardware Engineer",
    "Austin, TX",
    "https://linkedin.com/in/alicechen",
    "Designing next-gen battery systems for electric vehicles. 5+ years in automotive industry. MIT alum passionate about sustainable technology and mentoring women in STEM."
  );

  insertProfile.run(
    alumni12.lastInsertRowid,
    "Brian O'Connor",
    2017,
    "M.S. Computer Science",
    "Computer Science",
    "Amazon Web Services",
    "Principal Engineer",
    "Seattle, WA",
    "https://linkedin.com/in/brianoconnor",
    "Building cloud infrastructure at massive scale. Focus on serverless computing and edge services. Love sharing knowledge about distributed systems and cloud architecture."
  );

  insertProfile.run(
    alumni13.lastInsertRowid,
    "Jessica Rodriguez",
    2020,
    "B.S. Computer Science",
    "Computer Science",
    "Spotify",
    "Engineering Manager",
    "New York, NY",
    "https://linkedin.com/in/jessicarodriguez",
    "Leading mobile engineering teams building music discovery features. Previously at Google Play. Passionate about audio tech and creator tools. MIT grad happy to connect!"
  );

  // MIT Students
  insertProfile.run(
    student6.lastInsertRowid,
    "Daniel Brown",
    2025,
    "B.S. Computer Science",
    "Computer Science",
    null,
    "Student",
    "Cambridge, MA",
    "https://linkedin.com/in/danielbrown",
    "Junior studying robotics and computer vision. Part of MIT's autonomous vehicles lab. Looking for robotics internships and research opportunities!"
  );

  insertProfile.run(
    student7.lastInsertRowid,
    "Maya Patel",
    2026,
    "B.S. Computer Science",
    "Computer Science",
    null,
    "Student",
    "Cambridge, MA",
    "https://linkedin.com/in/mayapatel",
    "Sophomore passionate about cybersecurity and ethical hacking. CTF competitor. Interested in security engineering internships for next summer!"
  );

  // Create jobs
  const insertJob = db.prepare(`
    INSERT INTO jobs (college_id, posted_by_user_id, company_name, role_title, job_type, location, description, requirements, apply_link, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Stanford Jobs
  insertJob.run(
    college1.lastInsertRowid,
    alumni1.lastInsertRowid,
    "Google",
    "Software Engineering Intern - Summer 2024",
    "internship",
    "Mountain View, CA",
    "Join Google's engineering team to build products that impact billions of users. You'll work on real production systems, collaborate with talented engineers, and contribute to projects like Search, Ads, YouTube, or Cloud. Our interns ship code to production and present their work to leadership. This is a 12-week paid internship with full benefits, housing stipend, and relocation assistance.",
    "Currently pursuing BS/MS in Computer Science or related field • Strong coding skills in Java, Python, or C++ • Understanding of data structures and algorithms • Previous internship or project experience preferred • Excellent problem-solving and communication skills",
    "https://careers.google.com/jobs/results/123456789/",
    "open"
  );

  insertJob.run(
    college1.lastInsertRowid,
    alumni2.lastInsertRowid,
    "Meta",
    "Machine Learning Engineer Intern",
    "internship",
    "Menlo Park, CA",
    "Work on cutting-edge ML systems that power Facebook, Instagram, and WhatsApp. You'll train and deploy models at scale, optimize inference pipelines, and collaborate with researchers on novel approaches. Projects might include recommendation systems, computer vision, NLP, or content understanding. Interns have shipped models serving billions of users.",
    "Pursuing MS/PhD in CS, ML, or related field • Strong foundation in machine learning and deep learning • Experience with PyTorch or TensorFlow • Python programming expertise • Understanding of ML systems and infrastructure • Publications or ML competition experience a plus",
    "https://www.metacareers.com/jobs/ml-intern-2024",
    "open"
  );

  insertJob.run(
    college1.lastInsertRowid,
    alumni3.lastInsertRowid,
    "Microsoft",
    "Product Manager Intern",
    "internship",
    "Seattle, WA",
    "Drive product strategy for Azure cloud services or Microsoft 365. You'll define product roadmaps, work with engineering teams, analyze user data, and pitch features to executives. Our PM interns own real product areas and make decisions that impact millions of customers. Includes mentorship from senior PMs and executive exposure.",
    "Pursuing bachelor's or master's degree • Strong analytical and problem-solving skills • Technical background (CS, engineering, or equivalent experience) • Excellent communication and presentation skills • Previous internship in tech or product management preferred • Passion for technology and customer empathy",
    "https://careers.microsoft.com/us/en/job/1234567/Product-Manager-Intern",
    "open"
  );

  insertJob.run(
    college1.lastInsertRowid,
    alumni4.lastInsertRowid,
    "OpenAI",
    "Research Engineer Intern",
    "internship",
    "San Francisco, CA",
    "Contribute to frontier AI research working on large language models, reinforcement learning, or AI safety. You'll collaborate with leading researchers, run large-scale experiments, and potentially publish your work. Past intern projects have led to papers at NeurIPS, ICML, and ICLR. This role is for those passionate about pushing the boundaries of AI.",
    "Pursuing PhD or exceptional MS in CS, ML, or related field • Strong research background with publications preferred • Deep learning expertise with PyTorch • Strong mathematical foundation • Programming skills in Python • Genuine interest in AI safety and alignment",
    "https://openai.com/careers/research-engineer-intern",
    "open"
  );

  insertJob.run(
    college1.lastInsertRowid,
    alumni5.lastInsertRowid,
    "Stripe",
    "Software Engineer Intern - Backend",
    "internship",
    "San Francisco, CA",
    "Build payment infrastructure that powers millions of businesses worldwide. You'll work on distributed systems, APIs, and financial services that process billions of dollars. Projects include improving payment success rates, building fraud detection systems, or creating developer tools. Stripe interns ship production code that directly impacts revenue.",
    "Pursuing BS/MS in Computer Science • Strong programming skills in Ruby, Python, Java, or Go • Understanding of distributed systems and databases • Interest in fintech and payments • Previous backend development experience • Excellent debugging and problem-solving skills",
    "https://stripe.com/jobs/listing/software-engineer-intern/12345",
    "open"
  );

  insertJob.run(
    college1.lastInsertRowid,
    alumni6.lastInsertRowid,
    "Netflix",
    "Software Engineer Intern - Full Stack",
    "full-time",
    "Los Gatos, CA",
    "Help build the world's leading streaming service. You'll work on our web or TV applications, recommendation systems, or content delivery infrastructure. Netflix engineers have full ownership and ship features to 200M+ subscribers. We use React, Node.js, Java, and Python in a microservices architecture with AWS.",
    "BS/MS in Computer Science or equivalent • Full-stack development experience with React and Node.js • Strong CS fundamentals • Passion for creating great user experiences • Self-motivated and comfortable with ambiguity • Previous internship experience preferred",
    "https://jobs.netflix.com/jobs/123456789",
    "open"
  );

  insertJob.run(
    college1.lastInsertRowid,
    alumni7.lastInsertRowid,
    "Airbnb",
    "Software Engineer Intern - Frontend",
    "internship",
    "San Francisco, CA",
    "Build features for Airbnb's marketplace serving millions of hosts and guests. Work on search, booking, messaging, or payments using React, TypeScript, and GraphQL. Our interns ship user-facing features and participate in product decisions. Includes travel credits to experience Airbnb yourself!",
    "Pursuing BS/MS in CS or related field • Strong frontend skills with React and TypeScript • Understanding of web performance and accessibility • Design sensibility and attention to detail • Portfolio of projects demonstrating UI/UX skills • Excellent collaboration and communication",
    "https://careers.airbnb.com/positions/1234567",
    "open"
  );

  insertJob.run(
    college1.lastInsertRowid,
    alumni8.lastInsertRowid,
    "Apple",
    "iOS Software Engineer Intern",
    "internship",
    "Cupertino, CA",
    "Join Apple's iOS team to build features for iPhone used by over 1 billion people. You'll work with Swift and UIKit, collaborate with designers, and contribute to the next version of iOS. Interns work on real products and see their code in the hands of millions. Opportunity to attend WWDC sessions.",
    "Pursuing BS/MS in Computer Science • Strong Swift and iOS development skills • Deep understanding of UIKit, SwiftUI, or iOS frameworks • Computer science fundamentals • Passion for great UX and design • Personal iOS projects or published apps preferred",
    "https://jobs.apple.com/en-us/details/200123456/ios-software-engineer-intern",
    "open"
  );

  insertJob.run(
    college1.lastInsertRowid,
    alumni9.lastInsertRowid,
    "Notion",
    "Product Design Intern",
    "internship",
    "San Francisco, CA",
    "Design the future of productivity tools. You'll own end-to-end design for features used by millions, from wireframes to final UI. Work closely with engineers and PMs in a highly collaborative environment. Notion designers ship features fast and iterate based on user feedback. Portfolio review required.",
    "Pursuing degree in Design, HCI, or related field • Strong portfolio demonstrating product design work • Proficiency in Figma • Understanding of design systems • Basic HTML/CSS knowledge a plus • User research and prototyping experience • Excellent visual and interaction design skills",
    "https://www.notion.so/careers/design-intern",
    "open"
  );

  insertJob.run(
    college1.lastInsertRowid,
    alumni10.lastInsertRowid,
    "Databricks",
    "Solutions Architect Intern",
    "internship",
    "San Francisco, CA",
    "Help customers build modern data platforms using Spark and Delta Lake. You'll work with Fortune 500 companies on data engineering, ML pipelines, and analytics. This role combines technical depth with customer interaction. Learn about distributed computing, data architecture, and cloud platforms.",
    "Pursuing BS/MS in CS, Data Science, or related field • Strong programming skills in Python or Scala • Understanding of distributed systems and databases • Excellent communication and presentation skills • Interest in data engineering and analytics • Previous internship or project experience with big data technologies",
    "https://databricks.com/company/careers/university-recruiting/1234",
    "open"
  );

  // MIT Jobs
  insertJob.run(
    college2.lastInsertRowid,
    alumni11.lastInsertRowid,
    "Tesla",
    "Electrical Engineering Intern - Battery Systems",
    "internship",
    "Austin, TX",
    "Design and test next-generation battery systems for electric vehicles. You'll work on cell chemistry, thermal management, or battery management systems. Tesla interns contribute to real products and may see their designs in production vehicles. Fast-paced environment with cutting-edge technology.",
    "Pursuing BS/MS in Electrical Engineering or related field • Strong fundamentals in circuits and power electronics • Experience with CAD tools and simulation software • Python or MATLAB programming • Passion for sustainable energy • Hands-on project experience preferred",
    "https://www.tesla.com/careers/search/job/electrical-engineering-intern-123456",
    "open"
  );

  insertJob.run(
    college2.lastInsertRowid,
    alumni12.lastInsertRowid,
    "Amazon Web Services",
    "Cloud Engineer Intern",
    "internship",
    "Seattle, WA",
    "Build services that power AWS, the world's leading cloud platform. Work on EC2, S3, Lambda, or other services serving millions of customers. You'll design distributed systems, write production code, and learn from senior engineers. AWS interns tackle real technical challenges at massive scale.",
    "Pursuing BS/MS in Computer Science • Strong programming skills in Java, Python, or C++ • Understanding of distributed systems, networking, and operating systems • Problem-solving and debugging skills • Interest in cloud computing and infrastructure • Previous internship experience preferred",
    "https://amazon.jobs/en/jobs/1234567/cloud-engineer-intern",
    "open"
  );

  insertJob.run(
    college2.lastInsertRowid,
    alumni13.lastInsertRowid,
    "Spotify",
    "Mobile Engineer Intern - iOS",
    "internship",
    "New York, NY",
    "Build features for Spotify's iOS app used by 500M+ users worldwide. Work on music playback, discovery, social features, or personalization. Our mobile engineers ship code weekly and have high impact. You'll use Swift, UIKit, and our internal frameworks in a modern architecture.",
    "Pursuing BS/MS in Computer Science • iOS development experience with Swift • Understanding of mobile app architecture and best practices • Strong CS fundamentals • Passion for music and audio technology • Published apps or strong portfolio preferred",
    "https://www.spotifyjobs.com/job/mobile-engineer-intern-ios-12345",
    "open"
  );

  console.log("✅ Database seeded with realistic multi-tenant demo data");
  console.log("📊 Created 23 users across 2 colleges");
  console.log("💼 Created 13 detailed job postings");
  console.log("👥 Created complete profiles for all users");
}

initializeDatabase();

module.exports = { db };
