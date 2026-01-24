"use client";

import { useState, useEffect } from "react";
import styles from "./stories.module.css";
import Timeline from "@/components/Timeline";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [filter, setFilter] = useState("all");

  const sampleStories = [
    {
      id: 1,
      name: "Priya Sharma",
      graduationYear: 2018,
      degree: "B.Tech Computer Science",
      currentRole: "Senior Software Engineer",
      currentCompany: "Microsoft",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
      quote:
        "AlumniConnect helped me land my dream job at Microsoft. The mentorship program connected me with alumni who guided me through the interview process.",
      category: "tech",
      story: `After graduating in 2018, I was unsure about my career path. Through AlumniConnect, I found a mentor who was working at Microsoft. She helped me understand what skills I needed to develop and how to prepare for technical interviews.

The alumni network was incredibly supportive. I attended several virtual meetups where I learned about different career paths in tech. The job board on AlumniConnect is where I found the opening at Microsoft.

Today, I'm paying it forward by mentoring students from my college. It's amazing to see how this platform has grown and helped so many graduates find their path.`,
      achievements: [
        "Promoted to Senior Engineer in 2 years",
        "Led a team of 8 engineers",
        "Speaker at Microsoft Build 2024",
      ],
      timeline: [
        {
          date: "2018",
          title: "Graduated from University",
          icon: "🎓",
          color: "success",
        },
        {
          date: "2018",
          title: "Joined Amazon as SDE-1",
          icon: "💼",
          color: "primary",
        },
        {
          date: "2020",
          title: "Moved to Microsoft",
          icon: "🚀",
          color: "info",
        },
        {
          date: "2022",
          title: "Promoted to Senior SDE",
          icon: "⭐",
          color: "warning",
        },
        {
          date: "2024",
          title: "Tech Lead, Azure Team",
          icon: "👑",
          color: "primary",
        },
      ],
    },
    {
      id: 2,
      name: "Rahul Verma",
      graduationYear: 2015,
      degree: "MBA Finance",
      currentRole: "Founder & CEO",
      currentCompany: "FinTech Solutions",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
      quote:
        "The startup pitch event organized by AlumniConnect connected me with investors who believed in my vision. Today, we've raised $10M in funding.",
      category: "entrepreneur",
      story: `My entrepreneurial journey started right after my MBA. I had an idea for a fintech platform but didn't know where to start. The AlumniConnect community became my support system.

I attended a Startup Pitch Night event where I met David Park from Sequoia Capital. That connection led to our first round of funding. The alumni network provided not just investors but also early customers and advisors.

Building a startup is challenging, but having a community of alumni who've been through similar experiences made all the difference. We're now serving 50,000+ customers across India.`,
      achievements: [
        "Raised $10M in Series A funding",
        "50,000+ active customers",
        "Featured in Forbes 30 Under 30",
      ],
      timeline: [
        { date: "2015", title: "Completed MBA", icon: "🎓", color: "success" },
        {
          date: "2016",
          title: "Started FinTech Solutions",
          icon: "💡",
          color: "warning",
        },
        {
          date: "2018",
          title: "Seed Funding - $500K",
          icon: "💰",
          color: "info",
        },
        {
          date: "2021",
          title: "Series A - $10M",
          icon: "🚀",
          color: "primary",
        },
        { date: "2024", title: "50K+ Customers", icon: "🎉", color: "success" },
      ],
    },
    {
      id: 3,
      name: "Ananya Krishnan",
      graduationYear: 2019,
      degree: "B.Tech Electronics",
      currentRole: "Product Manager",
      currentCompany: "Google",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
      quote:
        "Transitioning from engineering to product management seemed daunting until I found alumni mentors who had made the same switch.",
      category: "career-change",
      story: `I always knew I wanted to work at the intersection of technology and business, but making the switch from engineering to product management wasn't straightforward.

Through AlumniConnect, I connected with three alumni who had successfully made this transition. They shared their stories, recommended courses, and even conducted mock interviews with me.

The Tech Career Workshop organized by the alumni association was particularly helpful. It gave me insights into what companies look for in PM candidates. Today, I'm a PM at Google, working on products that impact millions of users.`,
      achievements: [
        "Launched 3 major product features",
        "Google Spot Bonus recipient",
        "Mentor to 10+ aspiring PMs",
      ],
      timeline: [
        {
          date: "2019",
          title: "Graduated - Electronics Engineering",
          icon: "🎓",
          color: "success",
        },
        {
          date: "2019",
          title: "Software Engineer at Flipkart",
          icon: "💻",
          color: "primary",
        },
        {
          date: "2021",
          title: "Associate PM at Flipkart",
          icon: "📊",
          color: "info",
        },
        { date: "2022", title: "PM at Google", icon: "🚀", color: "warning" },
        {
          date: "2024",
          title: "Senior PM, Google Cloud",
          icon: "⭐",
          color: "primary",
        },
      ],
    },
    {
      id: 4,
      name: "Vikram Singh",
      graduationYear: 2012,
      degree: "B.Tech Mechanical",
      currentRole: "Director of Engineering",
      currentCompany: "Tesla",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      quote:
        "From a small town in India to leading engineering at Tesla - the alumni network opened doors I didn't even know existed.",
      category: "tech",
      story: `Coming from a mechanical engineering background, I never imagined I'd end up in Silicon Valley. But the alumni network showed me that anything is possible.

My first break came when a senior alumnus referred me for a position at a startup in Bangalore. That experience shaped my career trajectory. The global alumni network then helped me connect with professionals in the US.

Today, as Director of Engineering at Tesla, I actively participate in alumni events to give back. I've referred several talented juniors from my college and love seeing them grow.`,
      achievements: [
        "Led development of Tesla Model Y features",
        "10+ patents in automotive engineering",
        "TEDx speaker on electric vehicles",
      ],
      timeline: [
        {
          date: "2012",
          title: "Graduated - Mechanical Engineering",
          icon: "🎓",
          color: "success",
        },
        {
          date: "2012",
          title: "Engineer at Tata Motors",
          icon: "🚗",
          color: "primary",
        },
        {
          date: "2015",
          title: "Moved to Ford, USA",
          icon: "✈️",
          color: "info",
        },
        {
          date: "2018",
          title: "Senior Engineer at Tesla",
          icon: "⚡",
          color: "warning",
        },
        {
          date: "2023",
          title: "Director of Engineering",
          icon: "👑",
          color: "primary",
        },
      ],
    },
  ];

  const categories = [
    { id: "all", label: "All Stories" },
    { id: "tech", label: "Tech Careers" },
    { id: "entrepreneur", label: "Entrepreneurs" },
    { id: "career-change", label: "Career Transitions" },
  ];

  useEffect(() => {
    setStories(sampleStories);
  }, []);

  const filteredStories =
    filter === "all"
      ? stories
      : stories.filter((story) => story.category === filter);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Success Stories</h1>
        <p className={styles.subtitle}>
          Inspiring journeys of alumni who made their mark in the world
        </p>
      </div>

      <div className={styles.filterBar}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={
              filter === cat.id ? styles.filterActive : styles.filterBtn
            }
            onClick={() => setFilter(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className={styles.storiesGrid}>
        {filteredStories.map((story, index) => (
          <div
            key={story.id}
            className={`${styles.storyCard} ${index === 0 ? styles.featured : ""}`}
            onClick={() => setSelectedStory(story)}
          >
            <div className={styles.storyImage}>
              <img src={story.image} alt={story.name} />
              <div className={styles.storyOverlay}>
                <Badge variant="primary">{story.currentCompany}</Badge>
              </div>
            </div>

            <div className={styles.storyContent}>
              <div className={styles.storyMeta}>
                <Badge variant="outline" size="small">
                  Class of {story.graduationYear}
                </Badge>
                <Badge
                  variant={
                    story.category === "tech"
                      ? "info"
                      : story.category === "entrepreneur"
                        ? "warning"
                        : "success"
                  }
                  size="small"
                >
                  {story.category.replace("-", " ")}
                </Badge>
              </div>

              <h3 className={styles.storyName}>{story.name}</h3>
              <p className={styles.storyRole}>
                {story.currentRole} @ {story.currentCompany}
              </p>

              <blockquote className={styles.storyQuote}>
                "{story.quote}"
              </blockquote>

              <div className={styles.storyAchievements}>
                {story.achievements.slice(0, 2).map((achievement, idx) => (
                  <div key={idx} className={styles.achievement}>
                    <span className={styles.achievementIcon}>✓</span>
                    {achievement}
                  </div>
                ))}
              </div>

              <button className={styles.readMoreBtn}>
                Read Full Story
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedStory}
        onClose={() => setSelectedStory(null)}
        title=""
        size="large"
      >
        {selectedStory && (
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <img
                src={selectedStory.image}
                alt={selectedStory.name}
                className={styles.modalImage}
              />
              <div className={styles.modalInfo}>
                <h2 className={styles.modalName}>{selectedStory.name}</h2>
                <p className={styles.modalRole}>
                  {selectedStory.currentRole} @ {selectedStory.currentCompany}
                </p>
                <p className={styles.modalDegree}>
                  {selectedStory.degree}, Class of{" "}
                  {selectedStory.graduationYear}
                </p>
              </div>
            </div>

            <blockquote className={styles.modalQuote}>
              "{selectedStory.quote}"
            </blockquote>

            <div className={styles.modalSection}>
              <h4>The Journey</h4>
              <div className={styles.storyText}>
                {selectedStory.story.split("\n\n").map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className={styles.modalSection}>
              <h4>Career Timeline</h4>
              <Timeline items={selectedStory.timeline} />
            </div>

            <div className={styles.modalSection}>
              <h4>Key Achievements</h4>
              <div className={styles.achievementsList}>
                {selectedStory.achievements.map((achievement, idx) => (
                  <div key={idx} className={styles.achievementItem}>
                    <span className={styles.achievementBadge}>{idx + 1}</span>
                    {achievement}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.shareSection}>
              <span>Share this story:</span>
              <div className={styles.shareButtons}>
                <button className={styles.shareBtn}>LinkedIn</button>
                <button className={styles.shareBtn}>Twitter</button>
                <button className={styles.shareBtn}>Copy Link</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
