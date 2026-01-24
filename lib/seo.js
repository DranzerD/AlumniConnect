/**
 * SEO Configuration Utility
 * Provides metadata generation for Next.js pages
 */

const DEFAULT_CONFIG = {
  siteName: "AlumniConnect",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://alumniconnect.com",
  defaultTitle: "AlumniConnect - Alumni Networking Platform",
  defaultDescription:
    "Connect with your alumni network. Find mentors, discover job opportunities, attend events, and build meaningful professional relationships.",
  defaultImage: "/images/og-default.png",
  twitterHandle: "@alumniconnect",
  locale: "en_US",
};

/**
 * Generate metadata for a page
 * @param {Object} options - Metadata options
 * @returns {Object} Next.js metadata object
 */
export function generateMetadata(options = {}) {
  const {
    title,
    description,
    image,
    url,
    type = "website",
    keywords = [],
    noIndex = false,
    noFollow = false,
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = [],
  } = options;

  const fullTitle = title
    ? `${title} | ${DEFAULT_CONFIG.siteName}`
    : DEFAULT_CONFIG.defaultTitle;

  const finalDescription = description || DEFAULT_CONFIG.defaultDescription;
  const finalImage = image || DEFAULT_CONFIG.defaultImage;
  const finalUrl = url
    ? `${DEFAULT_CONFIG.siteUrl}${url}`
    : DEFAULT_CONFIG.siteUrl;

  const metadata = {
    title: fullTitle,
    description: finalDescription,
    keywords: [
      ...keywords,
      "alumni",
      "networking",
      "mentorship",
      "jobs",
      "events",
    ].join(", "),
    authors: author ? [{ name: author }] : undefined,
    creator: DEFAULT_CONFIG.siteName,
    publisher: DEFAULT_CONFIG.siteName,

    // Robots
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Open Graph
    openGraph: {
      title: fullTitle,
      description: finalDescription,
      url: finalUrl,
      siteName: DEFAULT_CONFIG.siteName,
      images: [
        {
          url: finalImage.startsWith("http")
            ? finalImage
            : `${DEFAULT_CONFIG.siteUrl}${finalImage}`,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: DEFAULT_CONFIG.locale,
      type,
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: finalDescription,
      images: [finalImage],
      creator: DEFAULT_CONFIG.twitterHandle,
      site: DEFAULT_CONFIG.twitterHandle,
    },

    // Alternates
    alternates: {
      canonical: finalUrl,
    },

    // Verification (add your verification codes)
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      bing: process.env.BING_VERIFICATION,
    },
  };

  // Add article-specific metadata
  if (type === "article" && publishedTime) {
    metadata.openGraph.publishedTime = publishedTime;
    metadata.openGraph.modifiedTime = modifiedTime || publishedTime;
    metadata.openGraph.section = section;
    metadata.openGraph.tags = tags;
    metadata.openGraph.authors = author ? [author] : undefined;
  }

  return metadata;
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: DEFAULT_CONFIG.siteName,
    url: DEFAULT_CONFIG.siteUrl,
    logo: `${DEFAULT_CONFIG.siteUrl}/images/logo.png`,
    description: DEFAULT_CONFIG.defaultDescription,
    sameAs: [
      "https://twitter.com/alumniconnect",
      "https://linkedin.com/company/alumniconnect",
      "https://facebook.com/alumniconnect",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@alumniconnect.com",
      contactType: "customer support",
    },
  };
}

/**
 * Generate JSON-LD structured data for a person (profile)
 */
export function generatePersonSchema(person) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.currentPosition,
    worksFor: person.company
      ? {
          "@type": "Organization",
          name: person.company,
        }
      : undefined,
    alumniOf: {
      "@type": "EducationalOrganization",
      name: person.university || "University",
    },
    url: `${DEFAULT_CONFIG.siteUrl}/profile/${person.id}`,
    image: person.avatar,
    sameAs: [person.linkedIn, person.twitter, person.github].filter(Boolean),
  };
}

/**
 * Generate JSON-LD structured data for a job posting
 */
export function generateJobPostingSchema(job) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt,
    validThrough: job.expiresAt,
    employmentType: mapJobType(job.type),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
      sameAs: job.companyUrl,
      logo: job.companyLogo,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location?.city,
        addressRegion: job.location?.state,
        addressCountry: job.location?.country,
      },
    },
    baseSalary: job.salary
      ? {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: {
            "@type": "QuantitativeValue",
            value: job.salary,
            unitText: "YEAR",
          },
        }
      : undefined,
    experienceRequirements: job.experienceLevel,
    skills: job.skills?.join(", "),
  };
}

/**
 * Generate JSON-LD structured data for an event
 */
export function generateEventSchema(event) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: event.isVirtual
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: event.isVirtual
      ? {
          "@type": "VirtualLocation",
          url: event.meetingUrl,
        }
      : {
          "@type": "Place",
          name: event.venue,
          address: event.address,
        },
    organizer: {
      "@type": "Organization",
      name: DEFAULT_CONFIG.siteName,
      url: DEFAULT_CONFIG.siteUrl,
    },
    image: event.image,
    offers: event.ticketPrice
      ? {
          "@type": "Offer",
          price: event.ticketPrice,
          priceCurrency: "USD",
          availability:
            event.spotsAvailable > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/SoldOut",
          url: `${DEFAULT_CONFIG.siteUrl}/events/${event.id}`,
        }
      : undefined,
  };
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export function generateBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url ? `${DEFAULT_CONFIG.siteUrl}${item.url}` : undefined,
    })),
  };
}

/**
 * Generate JSON-LD structured data for FAQ page
 */
export function generateFAQSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Helper function to map job types
function mapJobType(type) {
  const typeMap = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    contract: "CONTRACTOR",
    internship: "INTERN",
    temporary: "TEMPORARY",
    remote: "FULL_TIME",
  };
  return typeMap[type?.toLowerCase()] || "FULL_TIME";
}

/**
 * Structured Data Component
 * Renders JSON-LD script tags
 */
export function StructuredData({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

export default {
  generateMetadata,
  generateOrganizationSchema,
  generatePersonSchema,
  generateJobPostingSchema,
  generateEventSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  StructuredData,
  DEFAULT_CONFIG,
};
