/* Copied from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936 (same path), unchanged.
 * Source: web/src/components/ui/confirm.tsx
 * Changes for standalone use: none.
 */
import { Button } from "./buttons";
import { Alert, Dialog } from "./index";
/** Confirmation window for consequential actions (join, request, cancel request, submit).
 *  The confirm button names the action; Esc / close / cancel leave everything unchanged. */
export function ConfirmDialog({ open, title, body, confirmLabel, cancelLabel, closeLabel, onConfirm, onCancel, busy, destructive, error }: {
  open: boolean; title: string; body: string; confirmLabel: string; cancelLabel: string; closeLabel: string;
  onConfirm: () => void; onCancel: () => void; busy?: boolean; destructive?: boolean;
  /** Failure of the confirmed action: shown inside the window, which stays open for a retry. */
  error?: string;
}) {
  return (
    <Dialog open={open} onClose={onCancel} title={title} closeLabel={closeLabel} headerClose className="wl-dialog--confirm"
      actions={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy} data-autofocus>{cancelLabel}</Button>
          <Button variant={destructive ? "destructive" : "primary"} busy={busy} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      }>
      <p className="text-muted">{body}</p>
      {error && <div className="mt-4"><Alert tone="error" urgent>{error}</Alert></div>}
    </Dialog>
  );
}
