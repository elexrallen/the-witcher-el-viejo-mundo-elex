import { X, LayoutDashboard } from "lucide-react";
import { AutomaState } from "../types";
import AutomaBoard from "./AutomaBoard";

type BoardDrawerProps = {
  open: boolean;
  onClose: () => void;
  automa: AutomaState;
  lockedAttributes: Record<string, boolean>;
  onUpdateAttribute: (attr: "attack" | "defense" | "alchemy" | "special", delta: number) => void;
  onAutoImprove: (type: "highest" | "lowest") => void;
  onAddTrophy: () => void;
  onAutomaChange: (updater: (prev: AutomaState) => AutomaState) => void;
  onTrophyDecrease: () => void;
};

export function BoardFab({ trophies, onClick }: { trophies: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="board-fab"
      id="board-fab"
      aria-label="Estado del Automa"
    >
      <LayoutDashboard className="w-5 h-5" />
      <span className="board-fab__label">Estado</span>
      <span className="board-fab__badge">{trophies}/4</span>
    </button>
  );
}

export default function BoardDrawer({
  open,
  onClose,
  automa,
  lockedAttributes,
  onUpdateAttribute,
  onAutoImprove,
  onAddTrophy,
  onAutomaChange,
  onTrophyDecrease,
}: BoardDrawerProps) {
  if (!open) return null;

  return (
    <div className="board-drawer" role="dialog" aria-modal="true" aria-label="Estado del Automa">
      <button type="button" className="board-drawer__backdrop" onClick={onClose} aria-label="Cerrar" />
      <div className="board-drawer__panel">
        <div className="board-drawer__header">
          <h2 className="font-display text-sm font-black text-orange-400 uppercase">Estado del Automa</h2>
          <button type="button" onClick={onClose} className="board-drawer__close automa-touch-btn" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="board-drawer__body">
          <AutomaBoard
            automa={automa}
            lockedAttributes={lockedAttributes}
            onUpdateAttribute={onUpdateAttribute}
            onAutoImprove={onAutoImprove}
            onAddTrophy={onAddTrophy}
            onAutomaChange={onAutomaChange}
            onTrophyDecrease={onTrophyDecrease}
            collapsible
          />
        </div>
      </div>
    </div>
  );
}
