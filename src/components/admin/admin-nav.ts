export const adminNavGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin" }, { label: "Analytics" }],
  },
  {
    label: "Content",
    items: [
      { label: "Blog Posts", href: "/admin/blogs" },
      { label: "Categories", href: "/admin/categories" },
      { label: "Certifications", href: "/admin/programs" },
      { label: "Research Papers", href: "/admin/research" },
      { label: "Events" },
      { label: "Facilitations" },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Q&A Moderation" },
      { label: "Forum Moderation", href: "/admin/forum" },
      { label: "Alumni", href: "/admin/alumni" },
      { label: "Researchers", href: "/admin/researchers" },
    ],
  },
  {
    label: "Users",
    items: [
      { label: "All Users", href: "/admin/users" },
      { label: "Go-Live Tools", href: "/admin/go-live" },
      { label: "Membership Tiers", href: "/admin/membership" },
      { label: "Payments", href: "/admin/payments" },
    ],
  },
]
