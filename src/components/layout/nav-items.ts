/**
 * Single source of truth for the workspace navigation, shared by the desktop
 * sidebar and the mobile disclosure menu. Icons are optional: the sidebar
 * shows them, the mobile menu does not need them.
 */
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/appointments", label: "Appointments", icon: "▤" },
  { href: "/clients", label: "Clients", icon: "◍" },
  { href: "/services", label: "Services", icon: "✦" },
  { href: "/team", label: "Team", icon: "◉" },
  { href: "/settings", label: "Settings", icon: "⚙" },
] as const;
