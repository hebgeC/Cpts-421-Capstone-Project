// Slugs/URLs verified against the live trm.org WordPress REST API
// (https://www.trm.org/wp-json/wp/v2/pages?slug=...) and the site tree in
// the site analysis saved to project memory (trm_site_architecture).

const CATEGORIES = [
  { key: "about", title: "About", icon: "📘", bg: "#EAF2FD", color: "#2980B9", description: "Who we are" },
  { key: "what-we-do", title: "What We Do", icon: "🧭", bg: "#E8F8F5", color: "#27AE60", description: "Our programs" },
  { key: "get-involved", title: "Get Involved", icon: "🤝", bg: "#FEF9E7", color: "#E67E22", description: "Give, serve, join" },
  { key: "contact", title: "Contact", icon: "✉️", bg: "#FDECEA", color: "#C0392B", description: "Reach & find help" },
];

const SITE_PAGES = [
  // About
  { key: "about", category: "about", type: "page", slug: "about", title: "About Us", icon: "people-outline" },
  { key: "leadership", category: "about", type: "page", slug: "leadership", title: "Leadership", icon: "ribbon-outline" },
  { key: "partners", category: "about", type: "page", slug: "partners", title: "Partners", icon: "people-circle-outline" },
  { key: "in-the-news", category: "about", type: "page", slug: "inthenews", title: "In The News", icon: "newspaper-outline" },
  { key: "impact-report", category: "about", type: "page", slug: "report", title: "Impact Report", icon: "bar-chart-outline" },

  // What We Do
  { key: "what-we-do", category: "what-we-do", type: "page", slug: "what-we-do", title: "What We Do (Overview)", icon: "compass-outline" },
  { key: "emergency-services", category: "what-we-do", type: "page", slug: "emergency-services", title: "Emergency Services", icon: "home-outline" },
  { key: "recovery", category: "what-we-do", type: "page", slug: "recovery", title: "Recovery", icon: "medkit-outline" },
  { key: "graduation", category: "what-we-do", type: "page", slug: "graduation", title: "Graduation", icon: "school-outline" },
  { key: "climb-team", category: "what-we-do", type: "page", slug: "climbteam", title: "Climb Team", icon: "trending-up-outline" },
  { key: "employment-education", category: "what-we-do", type: "page", slug: "employment-education", title: "Employment & Education", icon: "briefcase-outline" },
  { key: "culinary-arts", category: "what-we-do", type: "page", slug: "culinaryarts", title: "Culinary Arts", icon: "restaurant-outline" },
  { key: "housing", category: "what-we-do", type: "page", slug: "housing", title: "Housing", icon: "key-outline" },
  { key: "veterans", category: "what-we-do", type: "page", slug: "veterans", title: "Veterans", icon: "star-outline" },
  { key: "youth", category: "what-we-do", type: "page", slug: "youth", title: "Youth", icon: "happy-outline" },
  { key: "street-outreach", category: "what-we-do", type: "page", slug: "streetoutreach", title: "Street Outreach", icon: "walk-outline" },
  { key: "search-rescue", category: "what-we-do", type: "page", slug: "sandr", title: "Search & Rescue", icon: "search-outline" },

  // Get Involved
  { key: "corporate", category: "get-involved", type: "page", slug: "corporate", title: "Corporate Partnerships", icon: "business-outline" },
  { key: "church", category: "get-involved", type: "page", slug: "church", title: "Church Partnerships", icon: "book-outline" },
  { key: "bridges", category: "get-involved", type: "page", slug: "bridges", title: "Bridges Prayer Team", icon: "hand-left-outline" },
  { key: "internship", category: "get-involved", type: "page", slug: "internship", title: "Internships", icon: "school-outline" },
  { key: "community-service", category: "get-involved", type: "page", slug: "communityservice", title: "Community Service", icon: "people-circle-outline" },
  { key: "in-kind-giving", category: "get-involved", type: "page", slug: "inkind", title: "In-Kind Giving", icon: "gift-outline" },
  { key: "donate", category: "get-involved", type: "external", title: "Donate Online", url: "https://support.trm.org", icon: "heart-outline" },
  { key: "careers", category: "get-involved", type: "external", title: "Careers", url: "https://recruiting.paylocity.com/Recruiting/Jobs/All/763a0f6c-e7b2-46b4-80c0-70c038675ea0/The-Rescue-Mission", icon: "briefcase-outline" },

  // Contact
  { key: "contact", category: "contact", type: "page", slug: "contact", title: "Contact Us", icon: "call-outline" },
  { key: "need-help", category: "contact", type: "page", slug: "need-help", title: "Need Help?", icon: "alert-circle-outline" },
];

export { CATEGORIES, SITE_PAGES };
