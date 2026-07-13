import { useState } from "react";
import { Play, Dice5, Layers, BookOpen } from "lucide-react";
import { ActionCard, AutomaState, ChallengeCard, WitcherSchool } from "../types";
import AutomaBoard from "./AutomaBoard";
import BoardDrawer, { BoardFab } from "./BoardDrawer";
import TurnFlow from "./TurnFlow";
import DicePoker from "./DicePoker";
import ExpansionsPanel from "./ExpansionsPanel";
import RulesReference from "./RulesReference";
import { useIsMobile } from "../hooks/useMediaQuery";

export type GameTab = "turn" | "poker" | "expansions" | "rules";

type GameBoardProps = {
  automa: AutomaState;
  activeSchool: WitcherSchool;
  lockedAttributes: Record<string, boolean>;
  turnPhase: 1 | 2 | 3;
  turnCount: number;
  currentTab: GameTab;
  onTabChange: (tab: GameTab) => void;
  actionDeckLength: number;
  challengeDeckLength: number;
  challengeDeck: ChallengeCard[];
  activeActionCard: ActionCard | null;
  bonusApplied: boolean;
  logs: string[];
  useDicePoker: boolean;
  useMutagens: boolean;
  useSkellige: boolean;
  useLegendaryHunt: boolean;
  onUpdateAttribute: (attr: "attack" | "defense" | "alchemy" | "special", delta: number) => void;
  onAutoImprove: (type: "highest" | "lowest") => void;
  onAddTrophy: () => void;
  onAutomaChange: (updater: (prev: AutomaState) => AutomaState) => void;
  onTrophyDecrease: () => void;
  onDrawCard: () => void;
  onApplyBonuses: () => void;
  onMeditate: () => void;
  onExplore: () => void;
  onStartCombat: (opponentType: "monster" | "witcher", name: string) => void;
  onEndTurn: () => void;
  onClearLogs: () => void;
  onAdvanceToPhase2: () => void;
  onDrawPokerCard: () => ChallengeCard | null;
};

export default function GameBoard(props: GameBoardProps) {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const tabs: { id: GameTab; label: string; short: string; icon: typeof Play; show: boolean }[] = [
    { id: "turn", label: "Turno del Automa", short: "Turno", icon: Play, show: true },
    { id: "poker", label: "Póker de Dados", short: "Póker", icon: Dice5, show: props.useDicePoker },
    { id: "expansions", label: "Expansiones", short: "Exp.", icon: Layers, show: props.useMutagens || props.useSkellige || props.useLegendaryHunt },
    { id: "rules", label: "Reglamento V1.4", short: "Reglas", icon: BookOpen, show: true },
  ];

  const boardProps = {
    automa: props.automa,
    lockedAttributes: props.lockedAttributes,
    onUpdateAttribute: props.onUpdateAttribute,
    onAutoImprove: props.onAutoImprove,
    onAddTrophy: props.onAddTrophy,
    onAutomaChange: props.onAutomaChange,
    onTrophyDecrease: props.onTrophyDecrease,
  };

  return (
    <main className="game-board flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6" id="game-main">
      <div className="game-board__grid grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="game-board__main lg:col-span-8 lg:order-2 order-1 flex flex-col gap-4" id="interaction-dashboard">
          <div className="tab-nav sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-sm -mx-1 px-1 pt-1" id="tab-nav">
            <div className="flex overflow-x-auto flex-nowrap gap-1 border-b border-zinc-850 pb-0">
              {tabs
                .filter((t) => t.show)
                .map((tab) => {
                  const Icon = tab.icon;
                  const isActive = props.currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => props.onTabChange(tab.id)}
                      className={`tab-nav__btn shrink-0 px-3 sm:px-4 py-2.5 min-h-[var(--touch-min)] font-display text-xs font-black rounded-t-xl border-t border-x flex items-center gap-1.5 uppercase ${
                        isActive
                          ? "bg-zinc-900 border-zinc-800 text-orange-400 border-b-zinc-900"
                          : "bg-zinc-950 border-transparent text-zinc-500"
                      }`}
                      id={`tab-btn-${tab.id}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.short}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {props.currentTab === "turn" && (
            <TurnFlow
              turnPhase={props.turnPhase}
              turnCount={props.turnCount}
              actionDeckLength={props.actionDeckLength}
              challengeDeckLength={props.challengeDeckLength}
              automa={props.automa}
              activeActionCard={props.activeActionCard}
              bonusApplied={props.bonusApplied}
              logs={props.logs}
              onDrawCard={props.onDrawCard}
              onApplyBonuses={props.onApplyBonuses}
              onMeditate={props.onMeditate}
              onExplore={props.onExplore}
              onStartCombat={props.onStartCombat}
              onEndTurn={props.onEndTurn}
              onClearLogs={props.onClearLogs}
              onAdvanceToPhase2={props.onAdvanceToPhase2}
            />
          )}

          {props.currentTab === "poker" && props.useDicePoker && (
            <DicePoker challengeDeck={props.challengeDeck} onDrawChallenge={props.onDrawPokerCard} />
          )}

          {props.currentTab === "expansions" && (
            <ExpansionsPanel
              automa={props.automa}
              activeSchool={props.activeSchool}
              useMutagens={props.useMutagens}
              useSkellige={props.useSkellige}
              useLegendaryHunt={props.useLegendaryHunt}
              onAutomaChange={props.onAutomaChange}
            />
          )}

          {props.currentTab === "rules" && <RulesReference />}
        </section>

        {!isMobile && (
          <section className="lg:col-span-4 lg:order-1 order-2 space-y-6" id="automa-board-desktop">
            <AutomaBoard {...boardProps} />
          </section>
        )}
      </div>

      {isMobile && (
        <>
          <BoardFab trophies={props.automa.trophies} onClick={() => setDrawerOpen(true)} />
          <BoardDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} {...boardProps} />
        </>
      )}
    </main>
  );
}
