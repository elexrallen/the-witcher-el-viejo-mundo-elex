import { useEffect, useState } from "react";
import { ACTION_CARDS, CHALLENGE_CARDS } from "./data/cards";
import { WITCHER_SCHOOLS } from "./data/schools";
import {
  WitcherSchoolId,
  ActionCard,
  ChallengeCard,
  AutomaState,
  CombatState,
} from "./types";
import { shuffleArray } from "./utils/shuffle";
import { buildDecksFromCatalog } from "./utils/deckBuilder";
import { getMaxShieldLevel } from "./utils/combat";
import { getCardMutagens, formatMutagenList } from "./utils/mutagens";
import { formatMovementGuide, formatDestination } from "./utils/actionCard";
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
  const [useBombs, setUseBombs] = useState(initialSnapshot.useBombs ?? false);
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
        useBombs,
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
    useBombs,
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
    if (ACTION_CARDS.length === 0 || CHALLENGE_CARDS.length === 0) {
      addLog("No hay cartas catalogadas suficientes para iniciar partida.");
      return;
    }

    const { actionDeck: finalActions, challengeDeck: finalChallenges, level3Reserve: reserve } =
      buildDecksFromCatalog();

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
      bombs: useBombs ? 1 : 0,
      trails: { red: 0, blue: 0, green: 0, yellow: 0 },
      location: startLocation,
      currentTerrain: "yellow",
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
    addLog(
      `Partida iniciada — ${selectedSchoolObj.name} (${difficulty}). Catálogo: ${ACTION_CARDS.length} acción, ${CHALLENGE_CARDS.length} desafío.`
    );
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
    addLog(`Fase I: Carta robada. Destino: ${formatDestination(nextCard)}, ${formatMovementGuide(nextCard.movement)}.`);
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
    else if (bonus === "attack_special") { handleUpdateAttribute("attack", 1); handleUpdateAttribute("special", 1); }
    else if (bonus === "defense_special_any") { handleUpdateAttribute("defense", 1); handleUpdateAttribute("special", 1); handleAutoImproveAttribute("lowest"); }
    else if (bonus === "highest") handleAutoImproveAttribute("highest");
    else if (bonus === "lowest") handleAutoImproveAttribute("lowest");
    else if (bonus === "lowest_defense") {
      handleAutoImproveAttribute("lowest");
      handleUpdateAttribute("defense", 1);
      if (activeActionCard.defenseBonusRaisesShield) {
        addLog(`Defensa +1 (nivel ${Math.min(5, automa.attributes.defense + 1)}): el escudo en combate suma el nivel de Defensa del tablero.`);
      }
    }
    else if (bonus === "lowest_alchemy") {
      handleAutoImproveAttribute("lowest");
      handleUpdateAttribute("alchemy", 1);
    }
    else if (bonus === "highest_special") { handleAutoImproveAttribute("highest"); handleUpdateAttribute("special", 1); }
    else if (bonus === "alchemy_any") { handleUpdateAttribute("alchemy", 1); handleAutoImproveAttribute("lowest"); }

    if (activeActionCard.potionBonus) {
      const count = activeActionCard.potionBonusCount ?? 1;
      setAutoma((p) => ({ ...p, potions: Math.min(4, p.potions + count) }));
      if (count > 1) addLog(`+${count} pociones (máx. 4).`);
    }
    const grantBomb =
      activeActionCard.bombBonus &&
      (!activeActionCard.bombRequiresModule || useBombs);
    if (grantBomb) {
      setAutoma((p) => ({ ...p, bombs: Math.min(4, p.bombs + 1) }));
      addLog("Bomba añadida (máx. 4).");
    } else if (activeActionCard.bombBonus && activeActionCard.bombRequiresModule && !useBombs) {
      addLog("Bono de bomba ignorado: módulo de bombas desactivado.");
    }
    if (activeActionCard.trailBonus) {
      const trailType = activeActionCard.trailType ?? "random";
      if (trailType === "terrain") {
        const color = automa.currentTerrain;
        setAutoma((p) => ({
          ...p,
          trails: { ...p.trails, [color]: p.trails[color] + 1 },
        }));
        addLog(`Rastro de terreno actual (+1 ${color}).`);
      } else {
        const colors: ("red" | "blue" | "green" | "yellow")[] = ["red", "blue", "green", "yellow"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setAutoma((p) => ({ ...p, trails: { ...p.trails, [randomColor]: p.trails[randomColor] + 1 } }));
        addLog(`Rastro aleatorio (+1 ${randomColor}).`);
      }
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

  const resolveAutomaAttack = (
    deck: ChallengeCard[],
    discard: ChallengeCard[],
    card: ChallengeCard,
    consumables: { potions: number; bombs: number }
  ): {
    deck: ChallengeCard[];
    discard: ChallengeCard[];
    totalDamage: number;
    totalShield: number;
    fightLogs: string[];
    extraCombo: boolean;
  } => {
    let workingDeck = deck;
    const fightLogs: string[] = [];
    const extraDiscard: ChallengeCard[] = [];

    if (card.attackDiscardTopCard && workingDeck.length > 0) {
      const discardedTop = workingDeck[0];
      workingDeck = workingDeck.slice(1);
      extraDiscard.push(discardedTop);
      fightLogs.push(`Efecto de ataque (${card.id}): descarta ${discardedTop.id} sin barajar.`);
    }

    let baseDamage = card.damage;
    let baseShield = card.shields;
    let schoolDamageBonus = 0;
    let schoolShieldBonus = 0;

    if (card.attackBombDiscardTopDamage && useBombs && consumables.bombs > 0) {
      consumables.bombs -= 1;
      if (workingDeck.length > 0) {
        const discardedTop = workingDeck[0];
        workingDeck = workingDeck.slice(1);
        extraDiscard.push(discardedTop);
        fightLogs.push(`Bomba: descarta ${discardedTop.id} sin barajar.`);
      }
      baseDamage += card.attackBombDiscardTopDamage;
      fightLogs.push(`Bomba consumida: +${card.attackBombDiscardTopDamage} daño.`);
    }

    if (card.attackPotionShuffleDiscardTop && consumables.potions > 0) {
      consumables.potions -= 1;
      if (discard.length > 0) {
        const topDiscard = discard[discard.length - 1];
        workingDeck = shuffleArray([...workingDeck, topDiscard]);
        discard = discard.slice(0, -1);
        fightLogs.push(`Poción consumida: ${topDiscard.id} barajada al mazo de combate.`);
      } else {
        fightLogs.push("Poción consumida: descarte vacío, sin carta que barajar.");
      }
    }

    if (card.id === "cha-25" && activeSchoolObj.specialCard) {
      baseDamage = activeSchoolObj.specialCard.special1.damage;
      baseShield = activeSchoolObj.specialCard.special1.shields;
    } else if (card.id === "cha-26" && activeSchoolObj.specialCard) {
      baseDamage = activeSchoolObj.specialCard.special2.damage;
      baseShield = activeSchoolObj.specialCard.special2.shields;
    } else if (card.id === "cha-27" && activeSchoolObj.specialCard) {
      baseDamage = activeSchoolObj.specialCard.special3.damage;
      baseShield = activeSchoolObj.specialCard.special3.shields;
      if (automa.schoolId === "manticore" && consumables.potions > 0) {
        consumables.potions -= 1;
        baseDamage = 6;
        fightLogs.push("Mantícora: poción consumida, 6 daño.");
      }
    }

    if (card.schoolSymbol) {
      schoolDamageBonus = activeSchoolObj.combatBonus.damage;
      schoolShieldBonus = activeSchoolObj.combatBonus.shields;
    }

    if (card.attackPotionForDamage && consumables.potions > 0) {
      consumables.potions -= 1;
      baseDamage += card.attackPotionForDamage;
      fightLogs.push(`Poción consumida en ataque: +${card.attackPotionForDamage} daño.`);
    }

    if (card.consumableSlot) {
      if (consumables.potions > 0) {
        consumables.potions -= 1;
        const potionBonus =
          card.potionDamageBonus ??
          (automa.schoolId === "manticore" ? 4 : 2);
        baseDamage += potionBonus;
        fightLogs.push(`Poción consumida: +${potionBonus} daño.`);
      } else if (useBombs && consumables.bombs > 0) {
        consumables.bombs -= 1;
        baseDamage += 2;
      }
    }

    const cardMutagens = getCardMutagens(card);
    if (useMutagens && cardMutagens.length > 0) {
      const active = cardMutagens.filter((m) => automa.mutagens.includes(m));
      if (active.length > 0) {
        fightLogs.push(`Mutágeno(s) activo(s): ${formatMutagenList(active)}.`);
      } else {
        fightLogs.push(`Carta con mutágeno(s) ${formatMutagenList(cardMutagens)} (sin adquirir aún).`);
      }
    }

    const defenseShieldBonus = automa.attributes.defense;
    const cardShieldAllowed = card.shieldRequiresDefense
      ? automa.attributes.defense > 0
      : true;
    const effectiveCardShield = cardShieldAllowed ? baseShield : 0;
    if (card.shieldRequiresDefense) {
      fightLogs.push(cardShieldAllowed
        ? `Escudo condicional: Defensa (${automa.attributes.defense}) > 0, +${baseShield} escudo aplicado.`
        : `Escudo condicional: Defensa en 0, escudo de carta no aplicado.`
      );
    }

    const totalDamage = baseDamage + schoolDamageBonus;
    const totalShield = effectiveCardShield + schoolShieldBonus + defenseShieldBonus;

    if (defenseShieldBonus > 0) {
      fightLogs.push(`Bono de Defensa (nivel ${defenseShieldBonus}): +${defenseShieldBonus} escudo.`);
    }

    const extraCombo =
      Boolean(card.attackBombExtraCombo && useBombs && consumables.bombs > 0);

    if (extraCombo) {
      consumables.bombs -= 1;
      fightLogs.push("Bomba consumida: juega otro combo inmediatamente.");
    }

    return {
      deck: workingDeck,
      discard: [...discard, ...extraDiscard, card],
      totalDamage,
      totalShield,
      fightLogs,
      extraCombo,
    };
  };

  const handleAutomaAttackTurn = () => {
    if (combat.combatDeck.length === 0) {
      addLog("Automa derrotado — sin cartas.");
      return;
    }

    let deck = [...combat.combatDeck];
    let discard = [...combat.combatDiscard];
    const consumables = { potions: automa.potions, bombs: automa.bombs };
    const allFightLogs: string[] = [];
    let lastDamage = 0;
    let lastShield = 0;
    let lastCard: ChallengeCard | null = null;

    const runAttack = () => {
      if (deck.length === 0) return false;
      const card = deck[0];
      deck = deck.slice(1);
      const result = resolveAutomaAttack(deck, discard, card, consumables);
      deck = result.deck;
      discard = result.discard;
      lastDamage = result.totalDamage;
      lastShield = result.totalShield;
      lastCard = card;
      allFightLogs.push(
        `Ataque (${card.id}): ${result.totalDamage} daño, ${result.totalShield} escudo. Restan ${deck.length}.`,
        ...result.fightLogs
      );
      if (result.extraCombo && deck.length > 0) {
        allFightLogs.push("--- Combo adicional ---");
        return true;
      }
      return false;
    };

    let continueCombo = runAttack();
    while (continueCombo) {
      continueCombo = runAttack();
    }

    if (!lastCard) return;

    setAutoma((p) => ({
      ...p,
      potions: consumables.potions,
      bombs: consumables.bombs,
    }));

    setCombat((prev) => ({
      ...prev,
      combatDeck: deck,
      combatDiscard: discard,
      revealedCard: lastCard,
      damageInflictedThisTurn: lastDamage,
      shieldsActiveThisTurn: lastShield,
      fightLog: [...allFightLogs, ...prev.fightLog],
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
    let shieldsAfterHit = effectiveDamage === 0 ? Math.max(0, combat.shieldsActiveThisTurn - rawDamage) : 0;
    const reactionLogs: string[] = [];
    let lastReaction: CombatState["lastReactionTriggered"] = null;

    while (remainingDamageToDiscard > 0 && tempDeck.length > 0) {
      const discardedCard = tempDeck[0];
      tempDeck = tempDeck.slice(1);
      tempDiscard.push(discardedCard);
      remainingDamageToDiscard--;

      const reaction = discardedCard.reaction;
      if (!reaction) continue;

      if (reaction.raiseShieldToMax) {
        const maxShield = getMaxShieldLevel(automa.attributes.defense);
        shieldsAfterHit = maxShield;
        remainingDamageToDiscard = 0;
        const msg = `⚡ Reacción (${discardedCard.id}): escudo al máximo (Defensa ${maxShield}).`;
        reactionLogs.push(msg);
        lastReaction = { card: discardedCard, effectDescription: reaction.description };
      } else if (reaction.type === "shield" || reaction.type === "shield_damage") {
        const absorbed = Math.min(reaction.value, remainingDamageToDiscard);
        remainingDamageToDiscard -= absorbed;
        if (absorbed > 0) {
          const msg = `⚡ Reacción (${discardedCard.id}): cancela ${absorbed} de daño restante.`;
          reactionLogs.push(msg);
          lastReaction = { card: discardedCard, effectDescription: reaction.description };
        }
      } else if (reaction.type === "damage" && reaction.value > 0) {
        const msg = `⚡ Reacción (${discardedCard.id}): ${reaction.value} daño de contraataque.`;
        reactionLogs.push(msg);
        lastReaction = { card: discardedCard, effectDescription: reaction.description };
      }
    }

    setCombat((prev) => ({
      ...prev,
      combatDeck: tempDeck,
      combatDiscard: tempDiscard,
      shieldsActiveThisTurn: shieldsAfterHit,
      lastReactionTriggered: lastReaction ?? prev.lastReactionTriggered,
      fightLog: [
        `Daño ${rawDamage} (neto ${effectiveDamage}). Mazo: ${tempDeck.length}.`,
        ...reactionLogs,
        ...prev.fightLog,
      ],
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
            useBombs={useBombs}
            onBombsChange={setUseBombs}
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
            useBombs={useBombs}
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
