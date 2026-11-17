/* Neutral page parts.
 * Adapted from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272,
 * web/src/features/catalog/project-parts.tsx: Facts, MessageBlock, BackToProjects, ProjectLoading,
 * ProjectProblem (unavailable branch) (standard EXTRACTION_MATRIX §5.3, N1).
 * Changes for standalone use: the project controller, i18n keys and routes are replaced by props.
 * Markup and class names are unchanged. The "not visible" branch of ProjectProblem is product
 * policy and stays in the frontend; it can be expressed with MessageBlock.
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
 * src/parts/page.tsx, unchanged.
 */
import type { ReactNode } from "react";
import { Button, Skeleton } from "../components";
import { Icon, type IconName } from "../components/icons";

/** Key/value list (source: Facts). */
export function KeyValueList({ items }: { items: { key: string; value: ReactNode }[] }) {
  return <dl className="wl-facts">{items.map(({ key, value }) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>;
}

/** Message with an icon, a heading, a lead and an optional action (source: MessageBlock). */
export function MessageBlock({ icon, title, body, action, level = 1 }: { icon: IconName; title: string; body: string; action?: ReactNode; level?: 1 | 2 | 3 }) {
  const H = `h${level}` as "h1";
  return (
    <section className="wl-message">
      <Icon name={icon} size={32} className="text-muted" />
      <H>{title}</H>
      <p className="wl-lead">{body}</p>
      {action}
    </section>
  );
}

/** Back link (source: BackToProjects): a real href, handled in-app when `onBack` is given. */
export function BackLink({ href = "./", label, onBack, id }: { href?: string; label: string; onBack?: () => void; id?: string }) {
  return (
    <a id={id} href={href} className="wl-back" onClick={(e) => { if (!onBack) return; e.preventDefault(); onBack(); }}>
      <Icon name="chevronLeft" size={18} />{label}
    </a>
  );
}

/** Loading state of a detail page (source: ProjectLoading). */
export function LoadingState({ label }: { label: string }) {
  return (
    <div className="grid gap-4">
      <p role="status" className="text-muted">{label}</p>
      <Skeleton className="h-10 w-2/3" /><Skeleton className="h-5 w-1/2" /><Skeleton className="aspect-[21/9] w-full" />
    </div>
  );
}

/** Problem state with a retry (source: ProjectProblem, unavailable branch). */
export function ProblemState({ title, body, retryLabel, onRetry }: { title: string; body: string; retryLabel: string; onRetry: () => void }) {
  return (
    <div role="alert" className="wl-state wl-state--error">
      <Icon name="offline" size={24} />
      <div className="grid gap-1"><h2 className="text-lg">{title}</h2><p>{body}</p></div>
      <Button variant="secondary" onClick={onRetry}>{retryLabel}</Button>
    </div>
  );
}
