/* Marquee public entry. Components, parts and compositions are copies or adaptations of
 * WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272 (see each file's header), with the
 * standalone mechanisms copied from WakoLab-DesignSystems/wakolab-design-systems-folio at
 * 0856c723bcf1047b61b093b9bf92d36d71f7a402 (which carry attributed copies from wakolab-design-systems-console
 * at 018fe3214e0a118162d202c2f39f1236f37b1936).
 * Import the stylesheet once: `import "wakolab-design-systems-marquee/marquee.css"`. */
export { Button, IconButton, TextField, CodeField, Select, ChoiceGroup, Checkbox, EmptyState, Skeleton, Toast,
  SearchField, ToggleChip, Popover, ConfirmDialog, Tabs, TabPanel, Alert, Badge, Card, Stepper, ConnectionRow, Dialog } from "./components";
export { Icon, IconSetProvider, iconNames, type IconName, type IconSet } from "./components/icons";
export { FilterChips, Cover, ItemLink, CollectionStatus, LoadMore, type FilterItem, type CollectionState } from "./parts/collection";
export { KeyValueList, MessageBlock, BackLink, LoadingState, ProblemState } from "./parts/page";
export { LogoSlot, ToolButton, ModeMenu } from "./parts/shell";
export { MarqueeHeader, MarqueeShell, Page, CollectionLayout, HighlightSection, Shelf, TileGrid, TileContent,
  DetailLayout, CardSection, Panel, FormPage, MessagePage, type ShellSearch } from "./compositions";
export { RegistrationFrame, EditorialPanel } from "./compositions/registration";
export { MarqueeRoot, type MarqueeRootProps } from "./root/MarqueeRoot";
export { useMarquee, type Mode, type ResolvedMode } from "./root/context";
export { normalizeConfig, resolveAsset, COLOR_ROLES, FONT_ROLES, type DesignConfig, type Diagnostic, type ColorRole, type FontRole, type FontFile, type FontSetting } from "./root/config";
export { registeredFaceSets } from "./root/fonts";
