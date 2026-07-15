import { useState } from "react";
import { CombatState } from "../types";
import { WitcherIcon } from "./WitcherIcon";

type CombatReactionBannerProps = {
  combat: CombatState;
  onAcknowledgeCounterattack: () => void;
};

export default function CombatReactionBanner({
  combat,
  onAcknowledgeCounterattack,
}: CombatReactionBannerProps) {
  const [expanded, setExpanded] = useState(false);

  const pending = combat.pendingCounterattack ?? 0;
  const lastReaction = combat.lastReactionTriggered;
  const discards = combat.lastDamageDiscards ?? [];
  const reactionDiscards = discards.filter((entry) => entry.reactionTriggered);

  if (pending <= 0 && !lastReaction && reactionDiscards.length === 0) {
    return null;
  }

  return (
    <section className="combat-reaction-banner" aria-live="polite">
      <div className="combat-reaction-banner__header">
        <WitcherIcon name="alert" size={16} className="text-amber-400 shrink-0" />
        <div className="combat-reaction-banner__summary">
          {lastReaction && (
            <p className="combat-reaction-banner__title">
              Reacción: <strong>{lastReaction.card.id}</strong>
            </p>
          )}
          <p className="combat-reaction-banner__text">
            {lastReaction?.effectDescription ?? "Carta descartada por daño."}
          </p>
        </div>
        {(reactionDiscards.length > 1 || (lastReaction?.effectDescription?.length ?? 0) > 72) && (
          <button
            type="button"
            className="combat-reaction-banner__expand automa-touch-btn"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? "−" : "+"}
          </button>
        )}
      </div>

      {expanded && reactionDiscards.length > 0 && (
        <ul className="combat-reaction-banner__list">
          {discards.map(({ card, reactionTriggered }) => (
            <li key={card.id} className={reactionTriggered ? "combat-reaction-banner__item--active" : ""}>
              {card.id}
              {reactionTriggered ? " ⚡" : ""}
            </li>
          ))}
        </ul>
      )}

      {pending > 0 && (
        <button
          type="button"
          className="combat-reaction-banner__confirm btn btn--secondary w-full min-h-[var(--touch-min)]"
          onClick={onAcknowledgeCounterattack}
        >
          Monstruo recibe {pending} daño — Confirmar en mesa
        </button>
      )}
    </section>
  );
}
