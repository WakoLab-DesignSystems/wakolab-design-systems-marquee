/* Synthetic texts for the visual parity check (standard EXTRACTION_MATRIX §8 at 6dc2a7a).
 * Copied from what the review prototype of WakoLab/wakolab-front at
 * e492bec9ced8893d6940879aa8186ac75a48a272 renders in English, signed out, MVP variant, Folio:
 * web/prototype/fixtures.ts (project names, summaries, categories, access) and the English
 * catalog strings of web/src/i18n. Synthetic data only; used by examples/parity, never shipped.
 * Copied from wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
 * examples/parity/fixtures.ts; Folio adds the index groups (the prototype's Folio home groups entries
 * by top category, in this order) and its Folio-specific labels. */
export const text = {
  skip: "Skip to projects",
  brand: "WakoLab", brandName: "WakoLab, projects home",
  searchLabel: "Search projects", searchPlaceholder: "Project name or summary", clear: "Clear search",
  appearance: "Appearance", appearanceValue: "Folio", language: "Language", signIn: "Sign in",
  category: "Category", all: "All", hint: "Keys: / search · j k move · Enter open",
  title: "Projects", count: "6 projects", sectionLabel: "Projects",
  lead: "Projects published on WakoLab by people and their agents. A project's code can stay private.",
  columns: ["Name", "Category", "Code", "Access"] as [string, string, string, string],
  loading: "Loading projects…",
  unavailableTitle: "The project catalog is unavailable right now",
  unavailableBody: "WakoLab couldn't load the projects. Your account and filters are not affected.",
  retry: "Try again",
  back: "Back to projects",
  notFoundTitle: "This page doesn't exist", notFoundBody: "The link may be wrong or out of date.",
  proposeTitle: "Proposing a project isn't available yet",
  proposeBody: "Project proposals and their review will open later. Published projects stay browsable.",
  dialogTitle: "Your session has expired",
  dialogBody: "Sign in again to continue. Your current page is kept, but unsaved profile changes have been discarded.",
  dialogAction: "Sign in again", close: "Close",
};
export const filters = [{ id: "app", label: "App" }, { id: "game", label: "Video Game" }, { id: "research", label: "Research" }];
export const rows = [
  { slug: "agent-relay", name: "Agent Relay Kit — interoperable message envelopes for agent-only tools", summary: "A deliberately long title and summary to test wrapping and translated growth in every direction.", lang: "en", path: "Software Development › App › Agent-only", code: "Public code", codeIcon: "repo", access: "Open to join" },
  { slug: "bio-tires", name: "Biodegradable Tires", summary: "Une revue de littérature et un plan d’essais pour des gommes de pneus qui retournent au sol.", lang: "fr", path: "Research", code: "Public code", codeIcon: "repo", access: "Open to join" },
  { slug: "house-assault", name: "House Assault", summary: "Tactical Roblox matches for small teams, one house at a time.", lang: "en", path: "Software Development › Video Game › Desktop", code: "Private code", codeIcon: "lock", access: "Join on request" },
  { slug: "paperwars", name: "PaperWars", summary: "A paper-folk FPS in an office that never sleeps: origami movement, weapons made of office supplies.", lang: "en", path: "Software Development › Video Game › Desktop", code: "Public code", codeIcon: "repo", access: "Open to join" },
  { slug: "swarm", name: "Swarm", summary: "Open research on robotic joints inspired by spider legs.", lang: "en", path: "Research", code: "Private code", codeIcon: "lock", access: "Join on request" },
  { slug: "wakolab", name: "WakoLab", summary: "The platform where humans and agents build projects together.", lang: "en", path: "Software Development › App › Web", code: "Public code", codeIcon: "repo", access: "Join on request" },
] as const;
export const detail = {
  path: "projects / paperwars", title: "PaperWars",
  lead: "A paper-folk FPS in an office that never sleeps: origami movement, weapons made of office supplies.",
  joinTitle: "Joining", join: "Open to join", joinNote: "Joining from WakoLab isn't available yet.",
  accessTitle: "Membership and code access", access: "The code is public: anyone can read it.",
  facts: [{ key: "Category", value: "Software Development › Video Game › Desktop" }, { key: "Project language", value: "English", lang: "en" }],
  about: "About",
  body: "Paper characters fight across desks with weapons made of office supplies. Movement borrows from origami: fold to slip through gaps, unfold to glide. The team is looking for level designers and playtesters.",
  note: "Members, repositories and tools aren't published on WakoLab yet.",
};
export const groups = [
  { id: "software/app", label: "App", slugs: ["agent-relay", "wakolab"] },
  { id: "software/game", label: "Video Game", slugs: ["house-assault", "paperwars"] },
  { id: "research", label: "Research", slugs: ["bio-tires", "swarm"] },
];
export const categoryPath = "Software Development › Video Game › Desktop";
