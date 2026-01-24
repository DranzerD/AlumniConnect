"use client";

import { useState, useEffect } from "react";
import styles from "./mentorship.module.css";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import ProfileAvatar from "@/components/ProfileAvatar";

export default function MentorshipPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);

  const sampleMentors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Chief Technology Officer",
      company: "TechVentures Inc.",
      graduationYear: 2010,
      expertise: ["Leadership", "AI/ML", "Product Strategy", "Startups"],
      bio: "15+ years of experience in tech leadership. Passionate about helping the next generation of tech leaders. Previously at Google and Amazon.",
      availability: "2-3 hours/month",
      mentees: 5,
      maxMentees: 8,
      rating: 4.9,
      reviews: 23,
      location: "San Francisco, CA",
      linkedin: "https://linkedin.com/in/sarahjohnson",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "VP of Engineering",
      company: "Google",
      graduationYear: 2008,
      expertise: ["System Design", "Career Growth", "Interviews", "Backend"],
      bio: "Building large-scale systems at Google. Love mentoring students on system design and career growth in tech.",
      availability: "4-5 hours/month",
      mentees: 3,
      maxMentees: 5,
      rating: 5.0,
      reviews: 31,
      location: "Mountain View, CA",
      linkedin: "https://linkedin.com/in/michaelchen",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Senior Product Manager",
      company: "Meta",
      graduationYear: 2014,
      expertise: [
        "Product Management",
        "UX Research",
        "Agile",
        "Communication",
      ],
      bio: "Product leader with a passion for user-centric design. Happy to help aspiring PMs navigate their career path.",
      availability: "3-4 hours/month",
      mentees: 4,
      maxMentees: 6,
      rating: 4.8,
      reviews: 18,
      location: "New York, NY",
      linkedin: "https://linkedin.com/in/emilyrodriguez",
    },
    {
      id: 4,
      name: "David Park",
      role: "Partner",
      company: "Sequoia Capital",
      graduationYear: 2005,
      expertise: [
        "Venture Capital",
        "Startups",
        "Fundraising",
        "Business Strategy",
      ],
      bio: "Investing in the next generation of great companies. Love helping founders think through their startup journey.",
      availability: "1-2 hours/month",
      mentees: 2,
      maxMentees: 3,
      rating: 4.9,
      reviews: 12,
      location: "Palo Alto, CA",
      linkedin: "https://linkedin.com/in/davidpark",
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Founder & CEO",
      company: "GreenTech Solutions",
      graduationYear: 2012,
      expertise: [
        "Entrepreneurship",
        "Clean Tech",
        "Fundraising",
        "Team Building",
      ],
      bio: "Founded a climate tech startup that raised $50M. Eager to share learnings with aspiring entrepreneurs.",
      availability: "2-3 hours/month",
      mentees: 4,
      maxMentees: 5,
      rating: 4.7,
      reviews: 15,
      location: "Boston, MA",
      linkedin: "https://linkedin.com/in/lisawang",
    },
    {
      id: 6,
      name: "James Liu",
      role: "Staff Software Engineer",
      company: "Netflix",
      graduationYear: 2015,
      expertise: ["Frontend", "React", "Performance", "Code Reviews"],
      bio: "Building streaming experiences at Netflix. Specialized in frontend architecture and performance optimization.",
      availability: "3-4 hours/month",
      mentees: 6,
      maxMentees: 8,
      rating: 4.8,
      reviews: 27,
      location: "Los Gatos, CA",
      linkedin: "https://linkedin.com/in/jamesliu",
    },
  ];

  const expertiseAreas = [
    "all",
    "Leadership",
    "AI/ML",
    "Product Management",
    "Startups",
    "Frontend",
    "Backend",
    "System Design",
  ];

  useEffect(() => {
    setTimeout(() => {
      setMentors(sampleMentors);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredMentors =
    filter === "all"
      ? mentors
      : mentors.filter((mentor) =>
          mentor.expertise.some((e) =>
            e.toLowerCase().includes(filter.toLowerCase()),
          ),
        );

  const renderStars = (rating) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= Math.floor(rating) ? styles.starFilled : styles.star
            }
          >
            ★
          </span>
        ))}
        <span className={styles.ratingText}>
          {rating} (
          {sampleMentors.find((m) => m.rating === rating)?.reviews || 0}{" "}
          reviews)
        </span>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Mentorship Program</h1>
          <p className={styles.subtitle}>
            Connect with experienced alumni mentors to accelerate your career
            growth
          </p>
        </div>
        <button className={styles.becomeMentorBtn}>Become a Mentor</button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>150+</div>
          <div className={styles.statLabel}>Active Mentors</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>500+</div>
          <div className={styles.statLabel}>Mentees Matched</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>95%</div>
          <div className={styles.statLabel}>Satisfaction Rate</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>1000+</div>
          <div className={styles.statLabel}>Sessions Completed</div>
        </div>
      </div>

      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Filter by Expertise</h3>
        <div className={styles.filterButtons}>
          {expertiseAreas.map((area) => (
            <button
              key={area}
              className={
                filter === area ? styles.filterActive : styles.filterBtn
              }
              onClick={() => setFilter(area)}
            >
              {area === "all" ? "All Areas" : area}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.mentorsGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className={styles.mentorsGrid}>
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className={styles.mentorCard}
              onClick={() => setSelectedMentor(mentor)}
            >
              <div className={styles.mentorHeader}>
                <ProfileAvatar name={mentor.name} size="large" />
                <div className={styles.mentorInfo}>
                  <h3 className={styles.mentorName}>{mentor.name}</h3>
                  <p className={styles.mentorRole}>{mentor.role}</p>
                  <p className={styles.mentorCompany}>@ {mentor.company}</p>
                </div>
              </div>

              <div className={styles.mentorExpertise}>
                {mentor.expertise.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="primary" size="small">
                    {skill}
                  </Badge>
                ))}
                {mentor.expertise.length > 3 && (
                  <Badge variant="outline" size="small">
                    +{mentor.expertise.length - 3}
                  </Badge>
                )}
              </div>

              <p className={styles.mentorBio}>{mentor.bio}</p>

              <div className={styles.mentorMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>🎓</span>
                  Class of {mentor.graduationYear}
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>📍</span>
                  {mentor.location}
                </div>
              </div>

              <div className={styles.mentorFooter}>
                <div className={styles.availability}>
                  <span className={styles.availabilityDot}></span>
                  {mentor.mentees < mentor.maxMentees
                    ? `${mentor.maxMentees - mentor.mentees} spots available`
                    : "Waitlist only"}
                </div>
                {renderStars(mentor.rating)}
              </div>

              <button
                className={styles.connectBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMentor(mentor);
                  setShowRequestModal(true);
                }}
              >
                Request Mentorship
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selectedMentor && !showRequestModal}
        onClose={() => setSelectedMentor(null)}
        title="Mentor Profile"
        size="large"
      >
        {selectedMentor && (
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <ProfileAvatar name={selectedMentor.name} size="xlarge" />
              <div className={styles.modalInfo}>
                <h2 className={styles.modalName}>{selectedMentor.name}</h2>
                <p className={styles.modalRole}>
                  {selectedMentor.role} @ {selectedMentor.company}
                </p>
                {renderStars(selectedMentor.rating)}
              </div>
            </div>

            <div className={styles.modalSection}>
              <h4>About</h4>
              <p>{selectedMentor.bio}</p>
            </div>

            <div className={styles.modalSection}>
              <h4>Expertise</h4>
              <div className={styles.expertiseTags}>
                {selectedMentor.expertise.map((skill) => (
                  <Badge key={skill} variant="primary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className={styles.modalDetails}>
              <div className={styles.modalDetailItem}>
                <span className={styles.detailLabel}>Availability</span>
                <span className={styles.detailValue}>
                  {selectedMentor.availability}
                </span>
              </div>
              <div className={styles.modalDetailItem}>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>
                  {selectedMentor.location}
                </span>
              </div>
              <div className={styles.modalDetailItem}>
                <span className={styles.detailLabel}>Graduation Year</span>
                <span className={styles.detailValue}>
                  {selectedMentor.graduationYear}
                </span>
              </div>
              <div className={styles.modalDetailItem}>
                <span className={styles.detailLabel}>Current Mentees</span>
                <span className={styles.detailValue}>
                  {selectedMentor.mentees}/{selectedMentor.maxMentees}
                </span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <a
                href={selectedMentor.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkedinBtn}
              >
                View LinkedIn Profile
              </a>
              <button
                className={styles.requestBtn}
                onClick={() => setShowRequestModal(true)}
              >
                Request Mentorship
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setSelectedMentor(null);
        }}
        title="Request Mentorship"
        size="medium"
      >
        <form className={styles.requestForm}>
          <p className={styles.requestIntro}>
            You're requesting mentorship from{" "}
            <strong>{selectedMentor?.name}</strong>
          </p>

          <div className={styles.formGroup}>
            <label>What are your goals?</label>
            <textarea
              placeholder="Describe what you hope to achieve through this mentorship..."
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label>What areas do you need help with?</label>
            <textarea
              placeholder="List specific topics or challenges you'd like to discuss..."
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Your current role/situation</label>
            <input
              type="text"
              placeholder="e.g., Final year CS student, Junior Developer at..."
            />
          </div>

          <div className={styles.formGroup}>
            <label>Preferred meeting frequency</label>
            <select>
              <option>Once a month</option>
              <option>Twice a month</option>
              <option>Weekly</option>
              <option>As needed</option>
            </select>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Send Request
          </button>
        </form>
      </Modal>
    </div>
  );
}
