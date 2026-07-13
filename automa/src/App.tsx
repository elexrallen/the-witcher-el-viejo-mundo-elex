import { useEffect, useState } from "react";
import {
  GENERIC_ACTION_CARDS,
  LEVEL_1_ACTION_CARDS,
  LEVEL_2_ACTION_CARDS,
  LEVEL_3_ACTION_CARDS,
  GENERIC_CHALLENGE_CARDS,
  LEVEL_1_CHALLENGE_CARDS,
  LEVEL_2_CHALLENGE_CARDS,
  LEVEL_3_CHALLENGE_CARDS,
} from "./data/cards";
import { WITCHER_SCHOOLS } from "./data/schools";
import {
  WitcherSchoolId,
  ActionCard,
  ChallengeCard,
  AutomaState,
  CombatState,
} from "./types";
import { shuffleArray, sampleCards } from "./utils/shuffle";
import { formatMovementGuide, MOVEMENT_UNLIMITED } from "./utils/actionCard";
import AppHeader from "./components/AppHeader";
import SetupWizard from "./components/SetupWizard";
import GameBoard, { GameTab } from "./components/GameBoard";
import CombatView from "./components/CombatView";
import BottomNav from "./components/BottomNav";
import {
  buildAutomaSnapshot,
  loadAutomaSnapshot,
  saveAutomaSnapshot,
  type AutomaSnapshot,
} from "./gameSnapshot";

const initialSnapshot = loadAutomaSnapshot();

export default function App() {
  const [setupMode, setSetupMode] = useState(initialSnapshot.setupMode);
  const [selectedSchoolId, setSelectedSchoolId] = useState<WitcherSchoolId>(initialSnapshot.selectedSchoolId);
  const [difficulty, setDifficulty] = useState<"easy" | "intermediate" | "difficult">(initialSnapshot.difficulty);
  const [useDicePoker, setUseDicePoker] = useState(initialSnapshot.useDicePoker);
  const [useMutagens, setUseMutagens] = useState(initialSnapshot.useMutagens);
  const [useSkellige, setUseSkellige] = useState(initialSnapshot.useSkellige);
  const [useLegendaryHunt, setUseLegendaryHunt] = useState(initialSnapshot.useLegendaryHunt);

  const [automa, setAutoma] = useState<AutomaState>(initialSnapshot.automa);

  const [lockedAttributes, setLockedAttributes] = useState<Record<string, boolean>>(initialSnapshot.lockedAttributes);

  const [turnCount, setTurnCount] = useState(initialSnapshot.turnCount);
  const [currentTab, setCurrentTab] = useState<GameTab>(initialSnapshot.currentTab);
  const [actionDeck, setActionDeck] = useState<ActionCard[]>(initialSnapshot.actionDeck);
  const [actionDiscard, setActionDiscard] = useState<ActionCard[]>(initialSnapshot.actionDiscard);
  const [activeActionCard, setActiveActionCard] = useState<ActionCard | null>(initialSnapshot.activeActionCard);
  const [challengeDeck, setChallengeDeck] = useState<ChallengeCard[]>(initialSnapshot.challengeDeck);
  const [challengeDiscard, setChallengeDiscard] = useState<ChallengeCard[]>(initialSnapshot.challengeDiscard);
  const [level3ChallengeReserve, setLevel3ChallengeReserve] = useState<ChallengeCard[]>(initialSnapshot.level3ChallengeReserve);
  const [turnPhase, setTurnPhase] = useState<1 | 2 | 3>(initialSnapshot.turnPhase);
  const [bonusApplied, setBonusApplied] = useState(initialSnapshot.bonusApplied);
  const [combat, setCombat] = useState<CombatState>(initialSnapshot.combat);
  const [logs, setLogs] = useState<string[]>(initialSnapshot.logs);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const snapshot: AutomaSnapshot = buildAutomaSnapshot({
        setupMode,
        selectedSchoolId,
        difficulty,
        useDicePoker,
        useMutagens,
        useSkellige,
        useLegendaryHunt,
        automa,
        lockedAttributes,
        turnCount,
        currentTab,
        actionDeck,
        actionDiscard,
        activeActionCard,
        challengeDeck,
        challengeDiscard,
        level3ChallengeReserve,
        turnPhase,
        bonusApplied,
        combat,
        logs,
      });
      saveAutomaSnapshot(snapshot);
      import("@app/saved-games.js").then(({ setLastMode, syncActiveGame }) => {
        setLastMode("automa");
        syncActiveGame();
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [
    setupMode,
    selectedSchoolId,
    difficulty,
    useDicePoker,
    useMutagens,
    useSkellige,
    useLegendaryHunt,
    automa,
    lockedAttributes,
    turnCount,
    currentTab,
    actionDeck,
    actionDiscard,
    activeActionCard,
    challengeDeck,
    challengeDiscard,
    level3ChallengeReserve,
    turnPhase,
    bonusApplied,
    combat,
    logs,
  ]);

  const activeSchoolObj = WITCHER_SCHOOLS.find((s) => s.id === automa.schoolId) || WITCHER_SCHOOLS[0];
  const selectedSchoolObj = WITCHER_SCHOOLS.find((s) => s.id === selectedSchoolId) || WITCHER_SCHOOLS[0];

  const addLog = (msg: string) => setLogs((prev) => [msg, ...prev.slice(0, 49)]);

  const handleUpdateAttribute = (attr: "attack" | "defense" | "alchemy" | "special", delta: number) => {
    setAutoma((prev) => {
      const current = prev.attributes[attr];
      let updated = current + delta;
      if (updated > 5) updated = 5;
      if (updated < 1) updated = 1;
      if (lockedAttributes[attr] && delta < 0) {
        addLog(`Bono bloqueado: ${attr.toUpperCase()} está al nivel 5.`);
        return prev;
      }
      if (updated === 5 && !lockedAttributes[attr]) {
        setTimeout(() => {
          setLockedAttributes((locks) => ({ ...locks, [attr]: true }));
          addLog(`¡ATRIBUTO BLOQUEADO! ${attr.toUpperCase()} llegó a nivel 5.`);
        }, 100);
      }
      return { ...prev, attributes: { ...prev.attributes, [attr]: updated } };
    });
  };

  const handleAutoImproveAttribute = (type: "highest" | "lowest") => {
    const attrs: ("attack" | "defense" | "alchemy" | "special")[] = ["attack", "defense", "alchemy", "special"];
    const eligible = attrs.filter((a) => automa.attributes[a] < 5);
    if (eligible.length === 0) return;
    const values = eligible.map((a) => automa.attributes[a]);
    const targetValue = type === "lowest" ? Math.min(...values) : Math.max(...values);
    const candidates = eligible.filter((a) => automa.attributes[a] === targetValue);
    const bestMatch = attrs.find((a) => candidates.includes(a));
    if (bestMatch) {
      handleUpdateAttribute(bestMatch, 1);
      addLog(`[Auto-Mejora] ${bestMatch.toUpperCase()} (${type === "lowest" ? "menor" : "mayor"}).`);
    }
  };

  const handleStartGame = () => {
    let finalActions: ActionCard[] = [];
    let finalChallenges: ChallengeCard[] = [];

    const genericActionLvl1 = [...GENERIC_ACTION_CARDS, ...LEVEL_1_ACTION_CARDS.filter((c) => c.movement !== MOVEMENT_UNLIMITED)];
    const specificActionLvl1 = LEVEL_1_ACTION_CARDS.filter((c) => c.movement === MOVEMENT_UNLIMITED);
    const genericActionLvl2 = LEVEL_2_ACTION_CARDS.filter((c) => c.movement !== MOVEMENT_UNLIMITED);
    const specificActionLvl2 = LEVEL_2_ACTION_CARDS.filter((c) => c.movement === MOVEMENT_UNLIMITED);
    const genericActionLvl3 = LEVEL_3_ACTION_CARDS.filter((c) => c.movement !== MOVEMENT_UNLIMITED);
    const specificActionLvl3 = LEVEL_3_ACTION_CARDS.filter((c) => c.movement === MOVEMENT_UNLIMITED);

    const genericChallengeLvl1 = [...GENERIC_CHALLENGE_CARDS, ...LEVEL_1_CHALLENGE_CARDS.filter((c) => !["cha-19", "cha-20", "cha-21"].includes(c.id))];
    const specificChallengeLvl1 = LEVEL_1_CHALLENGE_CARDS.filter((c) => ["cha-19", "cha-20", "cha-21"].includes(c.id));
    const genericChallengeLvl2 = LEVEL_2_CHALLENGE_CARDS.filter((c) => !["cha-22", "cha-23", "cha-24"].includes(c.id));
    const specificChallengeLvl2 = LEVEL_2_CHALLENGE_CARDS.filter((c) => ["cha-22", "cha-23", "cha-24"].includes(c.id));
    const genericChallengeLvl3 = LEVEL_3_CHALLENGE_CARDS.filter((c) => !["cha-25", "cha-26", "cha-27"].includes(c.id));
    const specificChallengeLvl3 = LEVEL_3_CHALLENGE_CARDS.filter((c) => ["cha-25", "cha-26", "cha-27"].includes(c.id));

    if (difficulty === "easy") {
      finalActions = [
        ...shuffleArray([...sampleCards(genericActionLvl1, 4), ...sampleCards(specificActionLvl1, 1)]),
        ...shuffleArray([...sampleCards(genericActionLvl2, 4), ...sampleCards(specificActionLvl2, 1)]),
        ...shuffleArray([...sampleCards(genericActionLvl3, 2), ...sampleCards(specificActionLvl3, 1)]),
      ];
      finalChallenges = shuffleArray([
        ...sampleCards(genericChallengeLvl1, 2), ...sampleCards(specificChallengeLvl1, 2),
        ...sampleCards(genericChallengeLvl2, 2), ...sampleCards(specificChallengeLvl2, 2),
        ...sampleCards(genericChallengeLvl3, 1), ...sampleCards(specificChallengeLvl3, 2),
      ]);
    } else if (difficulty === "intermediate") {
      finalActions = [
        ...shuffleArray([...sampleCards(genericActionLvl1, 3), ...sampleCards(specificActionLvl1, 1)]),
        ...shuffleArray([...sampleCards(genericActionLvl2, 3), ...sampleCards(specificActionLvl2, 1)]),
        ...shuffleArray([...sampleCards(genericActionLvl3, 3), ...sampleCards(specificActionLvl3, 1)]),
      ];
      finalChallenges = shuffleArray([
        ...sampleCards(genericChallengeLvl1, 3), ...sampleCards(specificChallengeLvl1, 2),
        ...sampleCards(genericChallengeLvl2, 3), ...sampleCards(specificChallengeLvl2, 2),
        ...sampleCards(genericChallengeLvl3, 0), ...sampleCards(specificChallengeLvl3, 2),
      ]);
    } else {
      finalActions = [
        ...shuffleArray([...sampleCards(genericActionLvl1, 2), ...sampleCards(specificActionLvl1, 1)]),
        ...shuffleArray([...sampleCards(genericActionLvl2, 2), ...sampleCards(specificActionLvl2, 1)]),
        ...shuffleArray([...sampleCards(genericActionLvl3, 2), ...sampleCards(specificActionLvl3, 1)]),
      ];
      finalChallenges = shuffleArray([
        ...sampleCards(genericChallengeLvl1, 3), ...sampleCards(specificChallengeLvl1, 2),
        ...sampleCards(genericChallengeLvl2, 3), ...sampleCards(specificChallengeLvl2, 2),
        ...sampleCards(genericChallengeLvl3, 0), ...sampleCards(specificChallengeLvl3, 2),
      ]);
    }

    const activeChallengeIds = new Set(finalChallenges.map((c) => c.id));
    let reserve = LEVEL_3_CHALLENGE_CARDS.filter((c) => !activeChallengeIds.has(c.id));
    if (reserve.length < 3) {
      reserve = [...reserve, ...sampleCards(LEVEL_3_CHALLENGE_CARDS, 4 - reserve.length)];
    }

    const startLocation =
      selectedSchoolId === "wolf" ? "Kaer Morhen (Lobo)"
      : selectedSchoolId === "griffin" ? "Kaer Seren (Grifo)"
      : selectedSchoolId === "viper" ? "Gorthur Gvaed (Víbora)"
      : "Vizima (Temeria)";

    setAutoma({
      schoolId: selectedSchoolId,
      difficulty,
      attributes: { attack: 1, defense: 1, alchemy: 1, special: 1 },
      trophies: 0,
      potions: 1,
      bombs: 1,
      trails: { red: 0, blue: 0, green: 0, yellow: 0 },
      location: startLocation,
      mutagens: [],
      weaknesses: 0,
      destructionTokens: 0,
      dagonTrack: 0,
    });
    setLockedAttributes({ attack: false, defense: false, alchemy: false, special: false });
    setActionDeck(finalActions);
    setActionDiscard([]);
    setActiveActionCard(null);
    setChallengeDeck(finalChallenges);
    setChallengeDiscard([]);
    setLevel3ChallengeReserve(reserve);
    setTurnCount(1);
    setTurnPhase(1);
    setBonusApplied(false);
    setSetupMode(false);
    setCurrentTab("turn");
    setCombat((prev) => ({ ...prev, isActive: false }));
    addLog(`Partida iniciada — ${selectedSchoolObj.name} (${difficulty}).`);
  };

  const drawActionCard = () => {
    if (actionDeck.length === 0) {
      if (actionDiscard.length === 0) {
        addLog("Error: mazo de acción vacío.");
        return;
      }
      setActionDeck(shuffleArray(actionDiscard));
      setActionDiscard([]);
      addLog("Mazo de Acción vacío — barajando descarte.");
      return;
    }
    const nextCard = actionDeck[0];
    setActionDeck((prev) => prev.slice(1));
    setActiveActionCard(nextCard);
    setBonusApplied(false);
    addLog(`Fase I: Carta robada. Destino: ${nextCard.destination}, ${formatMovementGuide(nextCard.movement)}.`);
  };

  const applyActionCardBonuses = () => {
    if (!activeActionCard || bonusApplied) return;
    const bonus = activeActionCard.attributeBonus;
    if (bonus === "attack") handleUpdateAttribute("attack", 1);
    else if (bonus === "defense") handleUpdateAttribute("defense", 1);
    else if (bonus === "alchemy") handleUpdateAttribute("alchemy", 1);
    else if (bonus === "special") handleUpdateAttribute("special", 1);
    else if (bonus === "attack_defense") { handleUpdateAttribute("attack", 1); handleUpdateAttribute("defense", 1); }
    else if (bonus === "attack_alchemy") { handleUpdateAttribute("attack", 1); handleUpdateAttribute("alchemy", 1); }
    else if (bonus === "defense_special_any") { handleUpdateAttribute("defense", 1); handleUpdateAttribute("special", 1); handleAutoImproveAttribute("lowest"); }
    else if (bonus === "highest") handleAutoImproveAttribute("highest");
    else if (bonus === "lowest") handleAutoImproveAttribute("lowest");
    else if (bonus === "highest_special") { handleAutoImproveAttribute("highest"); handleUpdateAttribute("special", 1); }
    else if (bonus === "alchemy_any") { handleUpdateAttribute("alchemy", 1); handleAutoImproveAttribute("lowest"); }

    if (activeActionCard.potionBonus) setAutoma((p) => ({ ...p, potions: Math.min(4, p.potions + 1) }));
    if (activeActionCard.bombBonus) setAutoma((p) => ({ ...p, bombs: Math.min(4, p.bombs + 1) }));
    if (activeActionCard.trailBonus) {
      const colors: ("red" | "blue" | "green" | "yellow")[] = ["red", "blue", "green", "yellow"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setAutoma((p) => ({ ...p, trails: { ...p.trails, [randomColor]: p.trails[randomColor] + 1 } }));
    }
    setBonusApplied(true);
    addLog("Acciones de Fase I aplicadas.");
  };

  const addLevel3CardToChallengeDeck = () => {
    if (level3ChallengeReserve.length === 0) return;
    const cardToAdd = level3ChallengeReserve[0];
    setLevel3ChallengeReserve((prev) => prev.slice(1));
    setChallengeDeck((prev) => shuffleArray([...prev, cardToAdd]));
    addLog("Carta Lvl3 añadida al mazo Desafío.");
  };

  const handleAddTrophy = () => {
    if (automa.trophies >= 4) return;
    setAutoma((p) => ({ ...p, trophies: p.trophies + 1 }));
    addLevel3CardToChallengeDeck();
    addLog("¡Automa gana un trofeo!");
  };

  const handleMeditate = () => {
    if (!Object.values(automa.attributes).some((v) => v === 5)) {
      addLog("No puede meditar: necesita un atributo en nivel 5.");
      return;
    }
    if (automa.trophies >= 4) return;
    handleAddTrophy();
    setTurnPhase(3);
    addLog("Fase II: Meditación — trofeo reclamado.");
  };

  const handleExplore = () => {
    addLog("Fase II: Explorar — sin robar eventos.");
    setTurnPhase(3);
  };

  const handleAdvanceToPhase2 = () => setTurnPhase(2);

  const handleEndTurn = () => {
    if (!activeActionCard) return;
    setActionDiscard((prev) => [...prev, activeActionCard]);
    setActiveActionCard(null);
    setTurnCount((prev) => prev + 1);
    setTurnPhase(1);
    setBonusApplied(false);
    addLog(`--- Turno ${turnCount + 1} ---`);
  };

  const handleStartCombat = (opponentType: "monster" | "witcher", name: string) => {
    const combinedCombatDeck = shuffleArray([...challengeDeck, ...challengeDiscard]);
    setCombat({
      isActive: true,
      opponentType,
      opponentName: name,
      combatDeck: combinedCombatDeck,
      combatDiscard: [],
      revealedCard: null,
      damageInflictedThisTurn: 0,
      shieldsActiveThisTurn: 0,
      potionsConsumedThisTurn: 0,
      bombsConsumedThisTurn: 0,
      lastReactionTriggered: null,
      fightLog: [`Combate vs ${name}. Mazo: ${combinedCombatDeck.length} cartas.`],
    });
    addLog(`¡COMBATE contra ${name.toUpperCase()}!`);
  };

  const handleAutomaAttackTurn = () => {
    if (combat.combatDeck.length === 0) {
      addLog("Automa derrotado — sin cartas.");
      return;
    }
    const card = combat.combatDeck[0];
    const remainingDeck = combat.combatDeck.slice(1);
    let baseDamage = card.damage;
    let baseShield = card.shields;
    let schoolDamageBonus = 0;
    let schoolShieldBonus = 0;
    const fightLogs: string[] = [];

    if (card.id === "cha-25" && activeSchoolObj.specialCard) {
      baseDamage = activeSchoolObj.specialCard.special1.damage;
      baseShield = activeSchoolObj.specialCard.special1.shields;
    } else if (card.id === "cha-26" && activeSchoolObj.specialCard) {
      baseDamage = activeSchoolObj.specialCard.special2.damage;
      baseShield = activeSchoolObj.specialCard.special2.shields;
    } else if (card.id === "cha-27" && activeSchoolObj.specialCard) {
      baseDamage = activeSchoolObj.specialCard.special3.damage;
      baseShield = activeSchoolObj.specialCard.special3.shields;
      if (automa.schoolId === "manticore" && automa.potions > 0) {
        setAutoma((p) => ({ ...p, potions: p.potions - 1 }));
        baseDamage = 6;
        fightLogs.push("Mantícora: poción consumida, 6 daño.");
      }
    }

    if (card.schoolSymbol) {
      schoolDamageBonus = activeSchoolObj.combatBonus.damage;
      schoolShieldBonus = activeSchoolObj.combatBonus.shields;
    }

    if (card.consumableSlot) {
      if (automa.potions > 0) {
        setAutoma((p) => ({ ...p, potions: p.potions - 1 }));
        baseDamage += automa.schoolId === "manticore" ? 4 : 2;
      } else if (automa.bombs > 0) {
        setAutoma((p) => ({ ...p, bombs: p.bombs - 1 }));
        baseDamage += 2;
      }
    }

    const totalDamage = baseDamage + schoolDamageBonus;
    const totalShield = baseShield + schoolShieldBonus;

    setCombat((prev) => ({
      ...prev,
      combatDeck: remainingDeck,
      combatDiscard: [...prev.combatDiscard, card],
      revealedCard: card,
      damageInflictedThisTurn: totalDamage,
      shieldsActiveThisTurn: totalShield,
      fightLog: [`Ataque: ${totalDamage} daño, ${totalShield} escudo. Restan ${remainingDeck.length}.`, ...fightLogs, ...prev.fightLog],
    }));
  };

  const handleReceiveDamage = (damageInput: number) => {
    const rawDamage = Math.max(0, damageInput);
    if (rawDamage === 0) return;
    const shieldReduction = combat.shieldsActiveThisTurn;
    const effectiveDamage = Math.max(0, rawDamage - shieldReduction);
    let remainingDamageToDiscard = effectiveDamage;
    let tempDeck = [...combat.combatDeck];
    let tempDiscard = [...combat.combatDiscard];

    while (remainingDamageToDiscard > 0 && tempDeck.length > 0) {
      const discardedCard = tempDeck[0];
      tempDeck = tempDeck.slice(1);
      tempDiscard.push(discardedCard);
      remainingDamageToDiscard--;
      if (discardedCard.reaction?.type === "shield" || discardedCard.reaction?.type === "shield_damage") {
        remainingDamageToDiscard -= Math.min(discardedCard.reaction.value, remainingDamageToDiscard);
      }
    }

    setCombat((prev) => ({
      ...prev,
      combatDeck: tempDeck,
      combatDiscard: tempDiscard,
      shieldsActiveThisTurn: effectiveDamage === 0 ? Math.max(0, prev.shieldsActiveThisTurn - rawDamage) : 0,
      fightLog: [`Daño ${rawDamage} (neto ${effectiveDamage}). Mazo: ${tempDeck.length}.`, ...prev.fightLog],
    }));
    if (tempDeck.length === 0) addLog("Automa derrotado en combate.");
  };

  const handleEndCombat = (automaWon: boolean) => {
    setChallengeDeck([...combat.combatDeck, ...combat.combatDiscard]);
    setChallengeDiscard([]);
    setCombat((prev) => ({ ...prev, isActive: false }));
    if (automaWon) {
      handleAddTrophy();
      addLog("Combate ganado por el Automa.");
    } else {
      addLog("Combate perdido por el Automa.");
    }
    setTurnPhase(3);
  };

  const handleDrawPokerCard = (): ChallengeCard | null => {
    if (challengeDeck.length === 0) return null;
    const card = challengeDeck[0];
    setChallengeDeck((prev) => [...prev.slice(1), card]);
    return card;
  };

  return (
    <div className="min-h-dvh flex flex-col" id="app-root">
      <div className="app app--automa">
        <AppHeader
          setupMode={setupMode}
          schoolName={activeSchoolObj.name}
          difficulty={automa.difficulty}
          turnCount={turnCount}
          trophies={automa.trophies}
          onReconfig={() => setSetupMode(true)}
        />
      </div>

      <div className="automa-content flex flex-col flex-1 gap-6">
        {setupMode ? (
          <SetupWizard
            selectedSchoolId={selectedSchoolId}
            onSchoolChange={setSelectedSchoolId}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            useDicePoker={useDicePoker}
            onDicePokerChange={setUseDicePoker}
            useMutagens={useMutagens}
            onMutagensChange={setUseMutagens}
            useSkellige={useSkellige}
            onSkelligeChange={setUseSkellige}
            useLegendaryHunt={useLegendaryHunt}
            onLegendaryHuntChange={setUseLegendaryHunt}
            selectedSchool={selectedSchoolObj}
            onStart={handleStartGame}
          />
        ) : combat.isActive ? (
          <CombatView
            combat={combat}
            activeSchool={activeSchoolObj}
            onAttack={handleAutomaAttackTurn}
            onReceiveDamage={handleReceiveDamage}
            onEndCombat={handleEndCombat}
          />
        ) : (
          <GameBoard
            automa={automa}
            activeSchool={activeSchoolObj}
            lockedAttributes={lockedAttributes}
            turnPhase={turnPhase}
            turnCount={turnCount}
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            actionDeckLength={actionDeck.length}
            challengeDeckLength={challengeDeck.length}
            challengeDeck={challengeDeck}
            activeActionCard={activeActionCard}
            bonusApplied={bonusApplied}
            logs={logs}
            useDicePoker={useDicePoker}
            useMutagens={useMutagens}
            useSkellige={useSkellige}
            useLegendaryHunt={useLegendaryHunt}
            onUpdateAttribute={handleUpdateAttribute}
            onAutoImprove={handleAutoImproveAttribute}
            onAddTrophy={handleAddTrophy}
            onAutomaChange={setAutoma}
            onTrophyDecrease={() => {
              if (automa.trophies > 0) setAutoma((p) => ({ ...p, trophies: p.trophies - 1 }));
            }}
            onDrawCard={drawActionCard}
            onApplyBonuses={applyActionCardBonuses}
            onMeditate={handleMeditate}
            onExplore={handleExplore}
            onStartCombat={handleStartCombat}
            onEndTurn={handleEndTurn}
            onClearLogs={() => setLogs(["Bitácora reiniciada."])}
            onAdvanceToPhase2={handleAdvanceToPhase2}
            onDrawPokerCard={handleDrawPokerCard}
          />
        )}

        <footer className="automa-footer" id="game-footer-element">
          Automa V1.4 — reglamento no oficial de la comunidad
        </footer>
      </div>

      <BottomNav />
    </div>
  );
}
