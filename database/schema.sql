-- ============================================
-- AlumniConnect Database Schema
-- A comprehensive alumni networking platform
-- ============================================

-- Colleges Table
CREATE TABLE colleges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  description TEXT,
  location VARCHAR(255),
  established_year INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  college_id INTEGER NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'alumni', 'faculty', 'admin')),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  must_reset_password BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(college_id, email)
);

CREATE INDEX idx_users_college_id ON users(college_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Profiles Table
CREATE TABLE profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  graduation_year INTEGER,
  degree VARCHAR(255),
  department VARCHAR(255),
  current_company VARCHAR(255),
  current_role VARCHAR(255),
  location VARCHAR(255),
  phone VARCHAR(20),
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  twitter_url VARCHAR(500),
  website_url VARCHAR(500),
  bio TEXT,
  skills TEXT, -- JSON array of skills
  interests TEXT, -- JSON array of interests
  achievements TEXT, -- JSON array of achievements
  profile_visibility BOOLEAN DEFAULT true,
  available_for_mentorship BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_graduation_year ON profiles(graduation_year);
CREATE INDEX idx_profiles_company ON profiles(current_company);
CREATE INDEX idx_profiles_department ON profiles(department);
CREATE INDEX idx_profiles_location ON profiles(location);

-- Jobs Table
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  college_id INTEGER NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  posted_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  company_logo VARCHAR(500),
  role_title VARCHAR(255) NOT NULL,
  job_type VARCHAR(20) NOT NULL CHECK (job_type IN ('internship', 'full-time', 'part-time', 'contract', 'remote')),
  experience_level VARCHAR(20) CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  location VARCHAR(255),
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR(10) DEFAULT 'USD',
  description TEXT NOT NULL,
  requirements TEXT, -- JSON array
  benefits TEXT, -- JSON array
  apply_link VARCHAR(500) NOT NULL,
  application_deadline DATE,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled', 'expired')),
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_college_id ON jobs(college_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_company ON jobs(company_name);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- Events Table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  college_id INTEGER NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  organizer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) CHECK (type IN ('networking', 'workshop', 'seminar', 'webinar', 'reunion', 'career-fair', 'social', 'other')),
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  timezone VARCHAR(50) DEFAULT 'UTC',
  location VARCHAR(500),
  virtual_link VARCHAR(500),
  image_url VARCHAR(500),
  max_attendees INTEGER,
  registration_deadline TIMESTAMP,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_college_id ON events(college_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_type ON events(type);

-- Event Attendees Table
CREATE TABLE event_attendees (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('registered', 'confirmed', 'attended', 'cancelled', 'waitlist')),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checked_in_at TIMESTAMP,
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id);

-- Conversations Table (for messaging)
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);

-- Messages Table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Mentors Table
CREATE TABLE mentors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expertise TEXT, -- JSON array of expertise areas
  bio TEXT,
  max_mentees INTEGER DEFAULT 5,
  is_available BOOLEAN DEFAULT true,
  years_of_experience INTEGER,
  industries TEXT, -- JSON array
  preferred_communication VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mentors_user ON mentors(user_id);
CREATE INDEX idx_mentors_available ON mentors(is_available);

-- Mentorship Connections Table
CREATE TABLE mentorship_connections (
  id SERIAL PRIMARY KEY,
  mentor_id INTEGER NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  mentee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  goals TEXT,
  preferred_frequency VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'declined', 'cancelled')),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mentor_id, mentee_id)
);

CREATE INDEX idx_mentorship_mentor ON mentorship_connections(mentor_id);
CREATE INDEX idx_mentorship_mentee ON mentorship_connections(mentee_id);
CREATE INDEX idx_mentorship_status ON mentorship_connections(status);

-- Mentorship Reviews Table
CREATE TABLE mentorship_reviews (
  id SERIAL PRIMARY KEY,
  mentor_id INTEGER NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  mentee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mentor_id, mentee_id)
);

CREATE INDEX idx_reviews_mentor ON mentorship_reviews(mentor_id);

-- Mentorship Programs Table
CREATE TABLE mentorship_programs (
  id SERIAL PRIMARY KEY,
  college_id INTEGER NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  coordinator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  max_participants INTEGER,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mentorship Program Enrollments
CREATE TABLE mentorship_program_enrollments (
  id SERIAL PRIMARY KEY,
  program_id INTEGER NOT NULL REFERENCES mentorship_programs(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('mentor', 'mentee')),
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(program_id, user_id)
);

-- Success Stories Table
CREATE TABLE success_stories (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image VARCHAR(500),
  category VARCHAR(50),
  tags TEXT, -- JSON array
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

CREATE INDEX idx_stories_author ON success_stories(author_id);
CREATE INDEX idx_stories_status ON success_stories(status);
CREATE INDEX idx_stories_slug ON success_stories(slug);
CREATE INDEX idx_stories_featured ON success_stories(is_featured);

-- Story Likes Table
CREATE TABLE story_likes (
  id SERIAL PRIMARY KEY,
  story_id INTEGER NOT NULL REFERENCES success_stories(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(story_id, user_id)
);

CREATE INDEX idx_story_likes_story ON story_likes(story_id);

-- Story Comments Table
CREATE TABLE story_comments (
  id SERIAL PRIMARY KEY,
  story_id INTEGER NOT NULL REFERENCES success_stories(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES story_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_story_comments_story ON story_comments(story_id);
CREATE INDEX idx_story_comments_user ON story_comments(user_id);

-- Notifications Table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- User Connections (Alumni Network)
CREATE TABLE user_connections (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, addressee_id)
);

CREATE INDEX idx_connections_requester ON user_connections(requester_id);
CREATE INDEX idx_connections_addressee ON user_connections(addressee_id);
CREATE INDEX idx_connections_status ON user_connections(status);

-- User Activity Log (for analytics)
CREATE TABLE user_activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  metadata TEXT, -- JSON object
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user ON user_activity_log(user_id);
CREATE INDEX idx_activity_action ON user_activity_log(action);
CREATE INDEX idx_activity_created ON user_activity_log(created_at DESC);

-- Password Reset Tokens
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);

-- Email Verification Tokens
CREATE TABLE email_verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_tokens_user ON email_verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_token ON email_verification_tokens(token);

-- User Settings Table
CREATE TABLE user_settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  newsletter_subscription BOOLEAN DEFAULT true,
  privacy_profile_visible BOOLEAN DEFAULT true,
  privacy_show_email BOOLEAN DEFAULT false,
  privacy_show_phone BOOLEAN DEFAULT false,
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Sample Data (for development)
-- ============================================

-- Insert sample college
INSERT INTO colleges (name, domain, logo_url, website_url, description, location) VALUES
  ('Demo University', 'demo.edu', '/logos/demo.png', 'https://demo.edu', 'A leading institution for higher education', 'San Francisco, CA');

-- Insert sample admin user (password: Admin@123)
INSERT INTO users (college_id, email, password_hash, role, must_reset_password, is_verified) VALUES
  (1, 'admin@demo.edu', '$2a$10$rH8qxZqKb.YGZ3Zf6Z3Zf.', 'admin', false, true);

-- Insert admin profile
INSERT INTO profiles (user_id, full_name, graduation_year, department, current_role, bio) VALUES
  (1, 'Admin User', 2020, 'Administration', 'System Administrator', 'Managing the AlumniConnect platform');

-- Insert sample alumni users
INSERT INTO users (college_id, email, password_hash, role, must_reset_password, is_verified) VALUES
  (1, 'john.doe@demo.edu', '$2a$10$rH8qxZqKb.YGZ3Zf6Z3Zf.', 'alumni', false, true),
  (1, 'jane.smith@demo.edu', '$2a$10$rH8qxZqKb.YGZ3Zf6Z3Zf.', 'alumni', false, true),
  (1, 'mike.johnson@demo.edu', '$2a$10$rH8qxZqKb.YGZ3Zf6Z3Zf.', 'alumni', false, true);

-- Insert alumni profiles
INSERT INTO profiles (user_id, full_name, graduation_year, degree, department, current_company, current_role, location, bio, available_for_mentorship) VALUES
  (2, 'John Doe', 2019, 'B.S. Computer Science', 'Computer Science', 'Google', 'Senior Software Engineer', 'Mountain View, CA', 'Passionate about building scalable systems', true),
  (3, 'Jane Smith', 2018, 'M.S. Data Science', 'Data Science', 'Meta', 'Data Science Manager', 'Menlo Park, CA', 'Leading AI/ML initiatives', true),
  (4, 'Mike Johnson', 2020, 'B.S. Electrical Engineering', 'Electrical Engineering', 'Tesla', 'Hardware Engineer', 'Fremont, CA', 'Working on next-gen electric vehicles', false);

-- Insert sample mentor
INSERT INTO mentors (user_id, expertise, bio, max_mentees, is_available, years_of_experience) VALUES
  (2, '["Software Engineering", "System Design", "Career Growth"]', 'Happy to help fellow alumni navigate their tech careers', 3, true, 5),
  (3, '["Data Science", "Machine Learning", "Leadership"]', 'Passionate about mentoring aspiring data scientists', 2, true, 7);

-- Insert sample job postings
INSERT INTO jobs (college_id, posted_by_user_id, company_name, role_title, job_type, experience_level, location, salary_min, salary_max, description, apply_link, status) VALUES
  (1, 2, 'Google', 'Software Engineer', 'full-time', 'mid', 'Mountain View, CA', 150000, 200000, 'Join our team to build innovative products', 'https://careers.google.com', 'open'),
  (1, 3, 'Meta', 'Data Scientist', 'full-time', 'senior', 'Menlo Park, CA', 180000, 250000, 'Work on cutting-edge ML projects', 'https://careers.meta.com', 'open'),
  (1, 4, 'Tesla', 'Engineering Intern', 'internship', 'entry', 'Fremont, CA', 30, 45, 'Summer internship opportunity', 'https://careers.tesla.com', 'open');

-- Insert sample events
INSERT INTO events (college_id, organizer_id, title, description, type, event_date, start_time, location, max_attendees, status) VALUES
  (1, 1, 'Annual Alumni Reunion 2026', 'Join us for our annual reunion celebration!', 'reunion', '2026-06-15', '18:00', 'Demo University Campus', 500, 'upcoming'),
  (1, 2, 'Tech Talk: Building at Scale', 'Learn about building scalable systems at Google', 'webinar', '2026-02-20', '14:00', 'Virtual', 200, 'upcoming'),
  (1, 3, 'Career Fair Spring 2026', 'Connect with top tech companies', 'career-fair', '2026-03-10', '10:00', 'Demo University Career Center', 300, 'upcoming');

-- ============================================
-- Additional Tables for Extended Features
-- ============================================

-- Discussion Forums Table
CREATE TABLE discussions (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'career', 'technical', 'networking', 'resources', 'announcements')),
  tags TEXT[], -- Array of tags
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discussions_author ON discussions(author_id);
CREATE INDEX idx_discussions_category ON discussions(category);
CREATE INDEX idx_discussions_created ON discussions(created_at DESC);

-- Discussion Replies Table
CREATE TABLE discussion_replies (
  id SERIAL PRIMARY KEY,
  discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES discussion_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_replies_discussion ON discussion_replies(discussion_id);
CREATE INDEX idx_replies_user ON discussion_replies(user_id);

-- Discussion Likes Table
CREATE TABLE discussion_likes (
  id SERIAL PRIMARY KEY,
  discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(discussion_id, user_id)
);

-- Reply Likes Table
CREATE TABLE reply_likes (
  id SERIAL PRIMARY KEY,
  reply_id INTEGER NOT NULL REFERENCES discussion_replies(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(reply_id, user_id)
);

-- Discussion Bookmarks Table
CREATE TABLE discussion_bookmarks (
  id SERIAL PRIMARY KEY,
  discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(discussion_id, user_id)
);

-- Achievements Table
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('promotion', 'award', 'achievement', 'spotlight')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(500),
  company VARCHAR(255),
  achievement_date DATE,
  is_featured BOOLEAN DEFAULT false,
  like_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(type);
CREATE INDEX idx_achievements_status ON achievements(status);

-- Achievement Likes Table
CREATE TABLE achievement_likes (
  id SERIAL PRIMARY KEY,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(achievement_id, user_id)
);

-- Resources Library Table
CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(30) NOT NULL CHECK (type IN ('document', 'video', 'link', 'template', 'course')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('career', 'technical', 'interview', 'networking', 'entrepreneurship', 'leadership', 'finance', 'wellness')),
  url VARCHAR(500) NOT NULL,
  thumbnail VARCHAR(500),
  tags TEXT[],
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'archived')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_status ON resources(status);

-- Resource Bookmarks Table
CREATE TABLE resource_bookmarks (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resource_id, user_id)
);

-- User Connections Table
CREATE TABLE user_connections (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, receiver_id)
);

CREATE INDEX idx_connections_requester ON user_connections(requester_id);
CREATE INDEX idx_connections_receiver ON user_connections(receiver_id);
CREATE INDEX idx_connections_status ON user_connections(status);

-- Notifications Table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  reference_id INTEGER,
  reference_type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- Sample Data for New Features
-- ============================================

-- Sample Discussions
INSERT INTO discussions (author_id, title, content, category, tags, is_pinned) VALUES
  (2, 'Tips for Landing Your First Tech Job', 'Here are some tips that helped me land my first role at Google...', 'career', ARRAY['career', 'tips', 'jobs'], true),
  (3, 'Best Resources for Learning Machine Learning', 'I''ve compiled a list of resources that helped me become a data scientist...', 'technical', ARRAY['ml', 'learning', 'resources'], false),
  (4, 'Negotiating Your Salary - What I Learned', 'Salary negotiation can be intimidating. Here''s what worked for me...', 'career', ARRAY['salary', 'negotiation', 'advice'], false);

-- Sample Achievements
INSERT INTO achievements (user_id, type, title, description, company, is_featured, status) VALUES
  (2, 'promotion', 'Promoted to Senior Software Engineer', 'After 3 years at Google, I''m excited to share that I''ve been promoted!', 'Google', true, 'approved'),
  (3, 'award', 'Top Data Science Leader Award', 'Honored to receive this recognition from the Data Science community.', 'Meta', true, 'approved'),
  (4, 'achievement', 'Patent Approved', 'My patent for an innovative battery technology was approved!', 'Tesla', false, 'approved');

-- Sample Resources
INSERT INTO resources (author_id, title, description, type, category, url, is_featured, status) VALUES
  (2, 'System Design Interview Guide', 'Comprehensive guide for system design interviews at FAANG companies', 'document', 'interview', 'https://example.com/system-design', true, 'published'),
  (3, 'Machine Learning Crash Course', 'Google''s free ML course for beginners', 'course', 'technical', 'https://developers.google.com/machine-learning/crash-course', true, 'published'),
  (4, 'Resume Template for Engineers', 'ATS-friendly resume template that got me interviews at top companies', 'template', 'career', 'https://example.com/resume-template', false, 'published');

-- Sample Connections
INSERT INTO user_connections (requester_id, receiver_id, status) VALUES
  (2, 3, 'accepted'),
  (2, 4, 'accepted'),
  (3, 4, 'pending');

-- Sample Notifications
INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
  (2, 'connection_accepted', 'Connection Accepted', 'Jane Smith accepted your connection request', true),
  (3, 'job_posted', 'New Job Posted', 'A new Software Engineer position was posted at Google', false),
  (4, 'event_reminder', 'Event Tomorrow', 'Reminder: Annual Alumni Reunion is tomorrow!', false);

-- ============================================
-- Mentorship Program Tables
-- ============================================

-- Enhanced Mentors Table (replaces simpler version if exists)
CREATE TABLE IF NOT EXISTS mentors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_type VARCHAR(20) NOT NULL CHECK (mentor_type IN ('mentor', 'mentee', 'both')),
  bio TEXT NOT NULL,
  expertise TEXT[] NOT NULL,
  industry VARCHAR(100),
  years_experience INTEGER DEFAULT 0,
  availability VARCHAR(20) DEFAULT 'flexible' CHECK (availability IN ('weekly', 'biweekly', 'monthly', 'flexible')),
  max_mentees INTEGER DEFAULT 3,
  preferred_topics TEXT[],
  linkedin_url VARCHAR(500),
  calendly_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE INDEX idx_mentors_user ON mentors(user_id);
CREATE INDEX idx_mentors_status ON mentors(status);
CREATE INDEX idx_mentors_type ON mentors(mentor_type);

-- Mentorship Requests Table
CREATE TABLE mentorship_requests (
  id SERIAL PRIMARY KEY,
  mentor_id INTEGER NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  mentee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  goals TEXT,
  preferred_schedule VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  feedback TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mentorship_mentor ON mentorship_requests(mentor_id);
CREATE INDEX idx_mentorship_mentee ON mentorship_requests(mentee_id);
CREATE INDEX idx_mentorship_status ON mentorship_requests(status);

-- Mentorship Sessions Table
CREATE TABLE mentorship_sessions (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES mentorship_requests(id) ON DELETE CASCADE,
  title VARCHAR(255),
  notes TEXT,
  scheduled_at TIMESTAMP,
  duration_minutes INTEGER DEFAULT 30,
  meeting_link VARCHAR(500),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mentorship Reviews Table
CREATE TABLE mentorship_reviews (
  id SERIAL PRIMARY KEY,
  mentor_id INTEGER NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  mentee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id INTEGER REFERENCES mentorship_requests(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mentee_id, request_id)
);

CREATE INDEX idx_reviews_mentor ON mentorship_reviews(mentor_id);

-- ============================================
-- Sample Mentorship Data
-- ============================================

-- Sample Mentors
INSERT INTO mentors (user_id, mentor_type, bio, expertise, industry, years_experience, availability, max_mentees, is_featured, rating, status) VALUES
  (2, 'mentor', 'Senior Software Engineer at Google with 10+ years of experience. Passionate about helping new grads navigate their tech careers.', ARRAY['Software Engineering', 'Interview Prep', 'Career Transition'], 'Technology', 10, 'biweekly', 5, true, 4.9, 'active'),
  (3, 'mentor', 'Data Science leader who has built ML teams at top tech companies. Love to share insights on breaking into DS/ML.', ARRAY['Data Science', 'Machine Learning', 'Leadership'], 'Technology', 8, 'monthly', 3, true, 4.8, 'active'),
  (4, 'both', 'Engineering Manager at Tesla. Can help with both technical skills and management transitions.', ARRAY['Engineering', 'Leadership', 'Product Management'], 'Automotive', 12, 'flexible', 4, false, 4.7, 'active');

-- Sample Mentorship Requests
INSERT INTO mentorship_requests (mentor_id, mentee_id, message, goals, status, created_at) VALUES
  (1, 5, 'Hi! I''m a new grad looking to break into tech. Would love your guidance!', 'Land a software engineering role at a top tech company', 'accepted', CURRENT_TIMESTAMP - INTERVAL '30 days'),
  (2, 5, 'Interested in transitioning from SWE to DS. Could use your advice!', 'Transition to data science within 1 year', 'pending', CURRENT_TIMESTAMP - INTERVAL '2 days');

-- Sample Reviews
INSERT INTO mentorship_reviews (mentor_id, mentee_id, rating, review) VALUES
  (1, 5, 5, 'Amazing mentor! Helped me prepare for interviews and I got offers from 3 FAANG companies!'),
  (2, 5, 5, 'Great insights on the DS field. Very responsive and helpful.');
