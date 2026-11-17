/* Synthetic, neutral texts for the parity fixture (form, components, registration frame).
 * Original content, except where noted. */
export const form = {
  title: "Request access", lead: "Fill in the form to request access to the shared workspace. Fields marked optional can stay empty.",
  name: "Display name", nameHint: "Shown to other members.", email: "Email address", emailError: "Enter an email address such as name@example.com.",
  team: "Team", teams: ["Research", "Design", "Operations"], role: "Role", roleHint: "Optional.",
  about: "About you", aboutHint: "Optional. Up to 500 characters.", aboutValue: "I maintain the sample datasets and would like to review changes.",
  access: "Access", accessOptions: [{ value: "read", label: "Read only" }, { value: "write", label: "Read and write" }],
  terms: "I agree to keep shared data inside the workspace.",
  submit: "Send request", cancel: "Cancel", notice: "Requests are reviewed within two working days.",
};
export const components = {
  buttons: "Buttons", primary: "Primary", secondary: "Secondary", ghost: "Ghost", destructive: "Delete", small: "Small", large: "Large", busy: "Saving", disabled: "Disabled", iconButton: "Close",
  fields: "Fields", text: "Project name", textValue: "Field Lab", hint: "Letters, digits and spaces.", invalid: "Short code", invalidError: "Use 3 to 8 characters.", code: "Verification code", codeValue: "482913",
  select: "Visibility", selectOptions: ["Public", "Members", "Private"], choice: "Notify me", choices: [{ value: "all", label: "Every change" }, { value: "weekly", label: "Weekly summary" }, { value: "none", label: "Never" }],
  check: "Show archived items", search: "Search items", searchValue: "sensor", clear: "Clear search",
  chips: "Chips", chipA: "Open", chipB: "Closed", chipNote: "3",
  feedback: "Feedback", info: "The next sync runs at 18:00.", success: "Settings saved.", warning: "Two items need review.", error: "The file could not be read.",
  badge: "Beta", card: "A card groups related content on a raised surface.",
  steps: ["Account", "Details", "Review"], connection: "Storage", connectionStatus: "Connected", connectionDescription: "Files sync every hour.",
  tabs: "Sections", tabA: "Overview", tabB: "History", tabContent: "Overview content of the selected section.",
  empty: "Nothing here yet", emptyBody: "Items you add appear in this list.", emptyAction: "Add item",
  confirmTitle: "Delete this item?", confirmBody: "The item and its history are removed. This cannot be undone.", confirm: "Delete", cancel: "Cancel", close: "Close",
};
/* The registration frame keys mirror the frontend's RegistrationShell slots (they are passed to its
 * translation function by the baseline adapter). */
export const registration = {
  community: "Open community", page: "Join the workspace", pageSub: "One account for people and their tools. You can leave at any time.",
  hero: "Build things together, in the open.", heroSub: "Share datasets, review changes and keep a clear record of who did what.", humans: "People and tools work side by side.",
  step1: "Email", step2: "Code", emailTitle: "Start with your email", emailDescription: "We send a one-time code to this address.",
  email: "Email address", continue: "Continue", safe: "We never share your address.",
  theme: "Theme", mode: "Appearance", language: "Language", // the frontend's English labels of these selects
};
/* Overlay states (review R4-C on #5): an open popover and a visible toast. */
export const overlays = {
  lead: "Items are sorted by the date they were last changed.", sort: "Sort", sortMenu: "Sort items",
  sortLabel: "Sort by", options: ["Last changed", "Name", "Size"], toast: "Settings saved.",
};
