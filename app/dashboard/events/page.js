"use client";

import { useState, useEffect } from "react";
import styles from "./events.module.css";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const sampleEvents = [
    {
      id: 1,
      title: "Annual Alumni Meetup 2026",
      type: "networking",
      date: "2026-02-15",
      time: "10:00 AM - 4:00 PM",
      location: "Grand Ballroom, Downtown Convention Center",
      isVirtual: false,
      description:
        "Join us for our biggest alumni gathering of the year! Connect with fellow graduates, share experiences, and build lasting professional relationships.",
      speakers: [
        { name: "Dr. Sarah Johnson", role: "CEO, TechVentures" },
        { name: "Michael Chen", role: "VP Engineering, Google" },
      ],
      attendees: 156,
      maxAttendees: 200,
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600",
      registrationDeadline: "2026-02-10",
      tags: ["networking", "annual", "in-person"],
    },
    {
      id: 2,
      title: "Tech Career Workshop",
      type: "workshop",
      date: "2026-01-30",
      time: "2:00 PM - 5:00 PM",
      location: "Virtual (Zoom)",
      isVirtual: true,
      description:
        "Learn essential skills for landing your dream tech job. Topics include resume building, interview preparation, and negotiation strategies.",
      speakers: [
        { name: "Emily Rodriguez", role: "Senior Recruiter, Meta" },
        { name: "James Liu", role: "Career Coach" },
      ],
      attendees: 89,
      maxAttendees: 150,
      image:
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
      registrationDeadline: "2026-01-28",
      tags: ["workshop", "career", "virtual"],
    },
    {
      id: 3,
      title: "Startup Pitch Night",
      type: "networking",
      date: "2026-02-22",
      time: "6:00 PM - 9:00 PM",
      location: "Innovation Hub, Tech Park",
      isVirtual: false,
      description:
        "Alumni entrepreneurs pitch their startups to investors and fellow graduates. Great opportunity for networking and potential collaboration.",
      speakers: [
        { name: "David Park", role: "Partner, Sequoia Capital" },
        { name: "Lisa Wang", role: "Founder, GreenTech Solutions" },
      ],
      attendees: 45,
      maxAttendees: 100,
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600",
      registrationDeadline: "2026-02-20",
      tags: ["startup", "pitch", "investors"],
    },
    {
      id: 4,
      title: "AI & Machine Learning Webinar",
      type: "webinar",
      date: "2026-02-05",
      time: "11:00 AM - 12:30 PM",
      location: "Virtual (Microsoft Teams)",
      isVirtual: true,
      description:
        "Explore the latest trends in AI and Machine Learning with industry experts. Learn how these technologies are shaping the future of work.",
      speakers: [{ name: "Dr. Alex Kumar", role: "AI Research Lead, OpenAI" }],
      attendees: 234,
      maxAttendees: 500,
      image:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600",
      registrationDeadline: "2026-02-04",
      tags: ["ai", "webinar", "tech"],
    },
    {
      id: 5,
      title: "Alumni Mentorship Program Launch",
      type: "program",
      date: "2026-03-01",
      time: "3:00 PM - 5:00 PM",
      location: "Hybrid (Campus + Zoom)",
      isVirtual: false,
      description:
        "Be part of our new mentorship program! Experienced alumni can sign up as mentors, while students and recent grads can find their perfect mentor match.",
      speakers: [
        { name: "Prof. Amanda White", role: "Dean of Students" },
        { name: "Robert Taylor", role: "Alumni Association President" },
      ],
      attendees: 67,
      maxAttendees: 150,
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600",
      registrationDeadline: "2026-02-25",
      tags: ["mentorship", "program", "hybrid"],
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setEvents(sampleEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEventTypeColor = (type) => {
    const colors = {
      networking: "primary",
      workshop: "success",
      webinar: "info",
      program: "warning",
    };
    return colors[type] || "default";
  };

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const today = new Date();
    if (filter === "upcoming") return eventDate >= today;
    if (filter === "past") return eventDate < today;
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Events & Meetups</h1>
        <p className={styles.subtitle}>
          Connect with alumni through workshops, networking events, and webinars
        </p>
      </div>

      <div className={styles.filterBar}>
        <button
          className={
            filter === "upcoming" ? styles.filterActive : styles.filterBtn
          }
          onClick={() => setFilter("upcoming")}
        >
          Upcoming Events
        </button>
        <button
          className={filter === "past" ? styles.filterActive : styles.filterBtn}
          onClick={() => setFilter("past")}
        >
          Past Events
        </button>
        <button
          className={filter === "all" ? styles.filterActive : styles.filterBtn}
          onClick={() => setFilter("all")}
        >
          All Events
        </button>
      </div>

      {loading ? (
        <div className={styles.eventsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No events found"
          description="Check back later for upcoming alumni events and meetups."
        />
      ) : (
        <div className={styles.eventsGrid}>
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={styles.eventCard}
              onClick={() => setSelectedEvent(event)}
            >
              <div className={styles.eventImage}>
                <img src={event.image} alt={event.title} />
                <div className={styles.eventDate}>
                  <span className={styles.dateDay}>
                    {new Date(event.date).getDate()}
                  </span>
                  <span className={styles.dateMonth}>
                    {new Date(event.date).toLocaleString("default", {
                      month: "short",
                    })}
                  </span>
                </div>
                {event.isVirtual && (
                  <span className={styles.virtualBadge}>🌐 Virtual</span>
                )}
              </div>

              <div className={styles.eventContent}>
                <div className={styles.eventMeta}>
                  <Badge variant={getEventTypeColor(event.type)} size="small">
                    {event.type}
                  </Badge>
                  <span className={styles.eventTime}>{event.time}</span>
                </div>

                <h3 className={styles.eventTitle}>{event.title}</h3>
                <p className={styles.eventLocation}>📍 {event.location}</p>

                <div className={styles.eventFooter}>
                  <div className={styles.attendees}>
                    <div className={styles.attendeeAvatars}>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={styles.attendeeAvatar}>
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <span>
                      {event.attendees}/{event.maxAttendees} attending
                    </span>
                  </div>
                  <button className={styles.registerBtn}>Register</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title}
        size="large"
      >
        {selectedEvent && (
          <div className={styles.modalContent}>
            <img
              src={selectedEvent.image}
              alt={selectedEvent.title}
              className={styles.modalImage}
            />

            <div className={styles.modalMeta}>
              <Badge variant={getEventTypeColor(selectedEvent.type)}>
                {selectedEvent.type}
              </Badge>
              {selectedEvent.isVirtual && (
                <Badge variant="info" icon="🌐">
                  Virtual Event
                </Badge>
              )}
            </div>

            <div className={styles.modalDetails}>
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>📅</span>
                <span>{formatDate(selectedEvent.date)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>⏰</span>
                <span>{selectedEvent.time}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>📍</span>
                <span>{selectedEvent.location}</span>
              </div>
            </div>

            <div className={styles.modalSection}>
              <h4>About this event</h4>
              <p>{selectedEvent.description}</p>
            </div>

            <div className={styles.modalSection}>
              <h4>Speakers</h4>
              <div className={styles.speakersList}>
                {selectedEvent.speakers.map((speaker, idx) => (
                  <div key={idx} className={styles.speakerCard}>
                    <div className={styles.speakerAvatar}>
                      {speaker.name.charAt(0)}
                    </div>
                    <div>
                      <div className={styles.speakerName}>{speaker.name}</div>
                      <div className={styles.speakerRole}>{speaker.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalTags}>
              {selectedEvent.tags.map((tag) => (
                <Badge key={tag} variant="outline" size="small">
                  #{tag}
                </Badge>
              ))}
            </div>

            <div className={styles.modalActions}>
              <div className={styles.spotsLeft}>
                <strong>
                  {selectedEvent.maxAttendees - selectedEvent.attendees}
                </strong>{" "}
                spots remaining
              </div>
              <button className={styles.primaryBtn}>Register for Event</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
