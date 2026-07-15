import { useEffect, useRef, useState } from "react";
import { ACTION_CARDS, CHALLENGE_CARDS, getCatalogStats } from "./data/cards";
import { WITCHER_SCHOOLS } from "./data/schools";
import {
  WitcherSchoolId,
  ChallengeCard,
  AutomaPlayerState,
  CombatState,
} from "./types";
import { shuffleArray } from "./utils/shuffle";
import {
  buildActionDecksForPlayers,
  buildChallengeDecksForPlayers,
  getManualDeckTotals,
  getMaxAutomaPlayers,
} from "./utils/deckBuilder";
import { createAutomaPlayerState } from "./utils/automaPlayer";
import {
  createActivePlayerSetters,
} from "./utils/automaPlayerState";
import { getMaxShieldLevel, capShieldLevel } from "./utils/combat";
import { getCardMutagens, formatMutagenList } from "./utils/mutagens";
import {
  applySchoolMutagenCombatBonuses,
  shuffleTopDiscardIntoDeck,
} from "./utils/schoolMutagens";
import { recycleActionDeckFromLevel3Discard } from "./utils/actionDeck";
import { formatMovementGuide, formatDestination } from "./utils/actionCard";
import {
  applyLegendaryMonsterLossPenalty,
  formatLegendaryLifeSummary,
  getEffectiveLegendaryMonsterLife,
  isLegendaryMonsterOpponent,
} from "./utils/legendaryHuntRules";
import { findMonsterSpecialAttack } from "./utils/monsterSpecialAttacks";
import { closeAllOpenDialogs } from "./utils/dialog";
import { applyDamageToCombatDeck } from "./utils/automaVsAutoma";
import {
  ATTRIBUTE_LABELS,
  getMeditationTrophyAttribute,
} from "./utils/meditation";
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
  const [playerCount, setPlayerCount] = useState(initialSnapshot.playerCount);
  const [setupSchoolIds, setSetupSchoolIds] = useState<WitcherSchoolId[]>(
    initialSnapshot.setupSchoolIds
  );
  const [difficulty, setDifficulty] = useState<"easy" | "intermediate" | "difficult">(initialSnapshot.difficulty);
  const [useDicePoker, setUseDicePoker] = useState(initialSnapshot.useDicePoker);
  const [useBombs, setUseBombs] = useState(initialSnapshot.useBombs ?? false);
  const [useMutagens, setUseMutagens] = useState(initialSnapshot.useMutagens);
  const [useSkellige, setUseSkellige] = useState(initialSnapshot.useSkellige);
  const [useLegendaryHunt, setUseLegendaryHunt] = useState(initialSnapshot.useLegendaryHunt);

  const [automaPlayers, setAutomaPlayers] = useState<AutomaPlayerState[]>(
    initialSnapshot.automaPlayers
  );
  const [activeAutomaIndex, setActiveAutomaIndex] = useState(
    initialSnapshot.activeAutomaIndex
  );
  const activeAutomaIndexRef = useRef(activeAutomaIndex);
  activeAutomaIndexRef.current = activeAutomaIndex;

  const [turnCount, setTurnCount] = useState(initialSnapshot.turnCount);
  const [currentTab, setCurrentTab] = useState<GameTab>(initialSnapshot.currentTab);
  const [startError, setStartError] = useState<string | null>(null);

  const activePlayer = automaPlayers[activeAutomaIndex] ?? automaPlayers[0];
  const automa = activePlayer.automa;
  const lockedAttributes = activePlayer.lockedAttributes;
  const actionDeck = activePlayer.actionDeck;
  const actionDiscard = activePlayer.actionDiscard;
  const challengeDeck = activePlayer.challengeDeck;
  const challengeDiscard = activePlayer.challengeDiscard;
  const level3ChallengeReserve = activePlayer.level3ChallengeReserve;
  const turnPhase = activePlayer.turnPhase;
  const bonusApplied = activePlayer.bonusApplied;
  const activeActionCard = activePlayer.activeActionCard;
  const combat = activePlayer.combat;
  const logs = activePlayer.logs;

  const {
    setAutoma,
    setLockedAttributes,
    setActionDeck,
    setActionDiscard,
    setChallengeDeck,
    setChallengeDiscard,
    setLevel3ChallengeReserve,
    setTurnPhase,
    setBonusApplied,
    setActiveActionCard,
    setCombat,
    setLogs,
  } = createActivePlayerSetters(
    setAutomaPlayers,
    () => activeAutomaIndexRef.current
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const snapshot: AutomaSnapshot = buildAutomaSnapshot({
        setupMode,
        playerCount,
        setupSchoolIds,
        difficulty,
        useDicePoker,
        useBombs,
        useMutagens,
        useSkellige,
        useLegendaryHunt,
        turnCount,
        currentTab,
        automaPlayers,
        activeAutomaIndex,
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
    playerCount,
    setupSchoolIds,
    difficulty,
    useDicePoker,
    useBombs,
    useMutagens,
    useSkellige,
    useLegendaryHunt,
    turnCount,
    currentTab,
    automaPlayers,
    activeAutomaIndex,
  ]);

  const activeSchoolObj = WITCHER_SCHOOLS.find((s) => s.id === automa.schoolId) || WITCHER_SCHOOLS[0];

  const addLog = (msg: string) => setLogs((prev) => [msg, ...prev.slice(0, 49)]);

  const handleDifficultyChange = (next: "easy" | "intermediate" | "difficult") => {
    setDifficulty(next);
    const maxPlayers = getMaxAutomaPlayers(next);
    if (playerCount > maxPlayers) {
      handleSetupPlayerCountChange(maxPlayers);
    }
  };

  const handleSetupPlayerCountChange = (count: number) => {
    const maxPlayers = getMaxAutomaPlayers(difficulty);
    const nextCount = Math.min(Math.max(count, 1), maxPlayers);
    setPlayerCount(nextCount);
    setSetupSchoolIds((prev) => {
      const next = [...prev];
      while (next.length < nextCount) {
        next.push(WITCHER_SCHOOLS[next.length % WITCHER_SCHOOLS.length].id);
      }
      return next.slice(0, nextCount);
    });
  };

  const handleSetupSchoolChange = (index: number, schoolId: WitcherSchoolId) => {
    setSetupSchoolIds((prev) => {
      const next = [...prev];
      next[index] = schoolId;
      return next;
    });
  };

  const handleSelectAutoma = (index: number) => {
    if (index === activeAutomaIndex) return;
    if (combat.isActive) {
      addLog("Termina el combate del Automa activo antes de cambiar.");
      return;
    }
    setActiveAutomaIndex(index);
  };

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
      const nextAttributes = { ...prev.attributes, [attr]: updated };
      const nextShieldLevel =
        attr === "defense"
          ? capShieldLevel(prev.shieldLevel, updated)
          : prev.shieldLevel;
      return {
        ...prev,
        attributes: nextAttributes,
        shieldLevel:
          attr === "defense" && delta > 0
            ? Math.max(nextShieldLevel, getMaxShieldLevel(updated))
            : nextShieldLevel,
      };
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
    setStartError(null);
    if (ACTION_CARDS.length === 0 || CHALLENGE_CARDS.length === 0) {
      const message = "No hay cartas catalogadas suficientes para iniciar partida.";
      addLog(message);
      setStartError(message);
      return;
    }

    const maxPlayers = getMaxAutomaPlayers(difficulty);
    if (playerCount > maxPlayers) {
      const message = `Con la dificultad ${difficulty} solo hay cartas Desafío para ${maxPlayers} Automa(s).`;
      setStartError(message);
      return;
    }

    const { actionDecks } = buildActionDecksForPlayers(playerCount, {
      useLegendaryHunt,
      difficulty,
    });
    const { challengeDecks, level3Reserves } = buildChallengeDecksForPlayers(
      playerCount,
      { difficulty }
    );

    const players: AutomaPlayerState[] = setupSchoolIds
      .slice(0, playerCount)
      .map((schoolId, index) => {
        const player = createAutomaPlayerState(
          index,
          schoolId,
          difficulty,
          useBombs
        );
        return {
          ...player,
          actionDeck: actionDecks[index] ?? [],
          actionDiscard: [],
          challengeDeck: challengeDecks[index] ?? [],
          level3ChallengeReserve: level3Reserves[index] ?? [],
          logs: [`${player.label} entra en la partida.`],
        };
      });

    const stats = getCatalogStats();
    const manual = getManualDeckTotals(difficulty);
    const lhCount =
      useLegendaryHunt
        ? difficulty === "easy"
          ? 1
          : difficulty === "difficult"
            ? 3
            : 2
        : 0;

    const schoolSummary = players.map((player) => player.label).join(", ");
    const actionLen = actionDecks[0]?.length ?? manual.actionTotal;
    const startLog = `Partida iniciada — ${playerCount} Automa(s): ${schoolSummary} (${difficulty}). Cada Automa: Acción ${actionLen} cartas + Desafío ${manual.challengeTotal} (+ ${level3Reserves[0]?.length ?? 3} reserva trofeos)${lhCount ? ` · LH +${lhCount}/Automa` : ""} (manual ${manual.actionTotal}/${manual.challengeTotal}). Catálogo: ${stats.actionCount} acc. + ${stats.challengeCount} desaf.`;

    setAutomaPlayers(
      players.map((player, index) => ({
        ...player,
        logs:
          index === 0
            ? [startLog, ...player.logs]
            : player.logs,
      }))
    );
    setActiveAutomaIndex(0);
    setTurnCount(1);
    setSetupMode(false);
    setCurrentTab("turn");
  };

  const drawActionCard = () => {
    let deck = actionDeck;
    let discard = actionDiscard;

    if (deck.length === 0) {
      const { recycledDeck, remainingDiscard } =
        recycleActionDeckFromLevel3Discard(discard);

      if (recycledDeck.length === 0) {
        if (discard.length === 0) {
          addLog("Error: mazo de Acción vacío y sin descarte.");
        } else {
          addLog(
            "Mazo de Acción vacío — no hay cartas de nivel III en el descarte para reponer (manual: solo niv. III se reciclan)."
          );
        }
        return;
      }

      deck = recycledDeck;
      discard = remainingDiscard;
      setActionDiscard(discard);
      addLog(
        `Mazo de Acción vacío — nuevo mazo con ${deck.length} carta(s) niv. III del descarte (barajadas).`
      );
    }

    const nextCard = deck[0];
    setActionDeck(deck.slice(1));
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
    else if (bonus === "defense_highest") {
      handleUpdateAttribute("defense", 1);
      if (activeActionCard.defenseBonusRaisesShield) {
        addLog(`Defensa +1 (nivel ${Math.min(5, automa.attributes.defense + 1)}): el escudo en combate suma el nivel de Defensa del tablero.`);
      }
      handleAutoImproveAttribute("highest");
    }
    else if (bonus === "attack_highest") {
      handleUpdateAttribute("attack", 1);
      handleAutoImproveAttribute("highest");
    }
    else if (bonus === "special_highest") {
      handleUpdateAttribute("special", 1);
      handleAutoImproveAttribute("highest");
    }
    else if (bonus === "defense_attack") {
      handleUpdateAttribute("defense", 1);
      if (activeActionCard.defenseBonusRaisesShield) {
        addLog(`Defensa +1 (nivel ${Math.min(5, automa.attributes.defense + 1)}): el escudo en combate suma el nivel de Defensa del tablero.`);
      }
      handleUpdateAttribute("attack", 1);
    }
    else if (bonus === "defense_special_trail") {
      handleUpdateAttribute("defense", 1);
      if (activeActionCard.defenseBonusRaisesShield) {
        addLog(`Defensa +1 (nivel ${Math.min(5, automa.attributes.defense + 1)}): el escudo en combate suma el nivel de Defensa del tablero.`);
      }
      handleUpdateAttribute("special", 1);
    }
    else if (bonus === "alchemy_attack") {
      handleUpdateAttribute("alchemy", 1);
      handleUpdateAttribute("attack", 1);
    }
    else if (bonus === "special_alchemy") {
      handleUpdateAttribute("special", 1);
      handleUpdateAttribute("alchemy", 1);
    }

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
    const trophyAttribute = getMeditationTrophyAttribute(automa);
    if (!trophyAttribute) {
      addLog("No puede meditar: necesita un atributo en nivel 5 con trofeo de meditación disponible.");
      return;
    }
    if (automa.trophies >= 4) return;

    setAutoma((p) => ({
      ...p,
      trophies: p.trophies + 1,
      meditationTrophiesClaimed: {
        ...p.meditationTrophiesClaimed,
        [trophyAttribute]: true,
      },
    }));
    addLevel3CardToChallengeDeck();
    setTurnPhase(3);
    addLog(
      `Fase II: Meditación — trofeo de ${ATTRIBUTE_LABELS[trophyAttribute]} reclamado (orden tablero: izq. → der.).`
    );
    if (automa.trophies + 1 >= 4) {
      addLog("¡El Automa gana la partida por meditación!");
    }
  };

  const handleExplore = () => {
    addLog("Fase II: Explorar — sin robar eventos.");
    setTurnPhase(3);
  };

  const handleAdvanceToPhase2 = () => setTurnPhase(2);

  const handleCollectDestructionToken = () => {
    if (!useLegendaryHunt) return;
    setAutoma((p) => ({ ...p, destructionTokens: p.destructionTokens + 1 }));
    addLog(
      `Cacería Legendaria: +1 ficha de Destrucción (total ${automa.destructionTokens + 1}). Al combatir el jefe: ${formatLegendaryLifeSummary({ ...automa, destructionTokens: automa.destructionTokens + 1 })}.`
    );
  };

  const handleEndTurn = () => {
    if (!activeActionCard) return;
    const card = activeActionCard;

    if (
      card.returnToDeckBottomIfLegendaryAlive &&
      useLegendaryHunt &&
      !automa.legendaryMonsterDefeated
    ) {
      setActionDeck((prev) => [...prev, card]);
      addLog(
        `Cacería Legendaria (${card.id}): al fondo del mazo de Acción — Monstruo Legendario sigue vivo.`
      );
    } else {
      setActionDiscard((prev) => [...prev, card]);
    }

    const currentIndex = activeAutomaIndex;
    setAutomaPlayers((prev) => {
      const cleared = prev.map((player, index) =>
        index === currentIndex
          ? {
              ...player,
              activeActionCard: null,
              turnPhase: 1 as const,
              bonusApplied: false,
            }
          : player
      );

      const nextIndex = currentIndex + 1;
      if (nextIndex < cleared.length) {
        return cleared.map((player, index) =>
          index === nextIndex
            ? {
                ...player,
                logs: [
                  `--- Turno de ${player.label} (ronda ${turnCount}) ---`,
                  ...player.logs,
                ],
              }
            : player
        );
      }

      return cleared.map((player, index) =>
        index === 0
          ? {
              ...player,
              logs: [
                `--- Ronda ${turnCount + 1} — turno de ${player.label} ---`,
                ...player.logs,
              ],
            }
          : player
      );
    });

    const nextIndex = activeAutomaIndex + 1;
    if (nextIndex < automaPlayers.length) {
      setActiveAutomaIndex(nextIndex);
    } else {
      setActiveAutomaIndex(0);
      setTurnCount((prev) => prev + 1);
    }
  };

  const handleStartCombat = (
    opponentType: "monster" | "witcher",
    name: string,
    options?: { opponentAutomaIndex?: number | null }
  ) => {
    closeAllOpenDialogs();
    const combinedCombatDeck = shuffleArray([...challengeDeck, ...challengeDiscard]);
    const openingShield = capShieldLevel(
      automa.shieldLevel,
      automa.attributes.defense
    );
    const rivalIndex = options?.opponentAutomaIndex ?? null;
    const rival =
      rivalIndex != null && rivalIndex >= 0 ? automaPlayers[rivalIndex] : null;
    const isAutomaVsAutoma = opponentType === "witcher" && Boolean(rival);
    const rivalCombatDeck = rival
      ? shuffleArray([...rival.challengeDeck, ...rival.challengeDiscard])
      : [];
    const rivalOpeningShield = rival
      ? capShieldLevel(rival.automa.shieldLevel, rival.automa.attributes.defense)
      : 0;
    const isLegendaryCombat =
      useLegendaryHunt && isLegendaryMonsterOpponent(name);
    const legendaryEffectiveLife = isLegendaryCombat
      ? getEffectiveLegendaryMonsterLife(
          automa.legendaryMonsterBaseLife,
          automa.destructionTokens
        )
      : undefined;
    const monsterRule =
      opponentType === "monster"
        ? findMonsterSpecialAttack(name, automa.legendaryMonsterId)
        : null;
    const needsBeforeCombat =
      monsterRule &&
      Object.values(monsterRule.parts).some(
        (effect) => effect?.type === "before_combat_suffer"
      );

    setCombat({
      isActive: true,
      opponentType,
      opponentName: name,
      combatDeck: combinedCombatDeck,
      combatDiscard: [],
      revealedCard: null,
      damageInflictedThisTurn: 0,
      shieldsActiveThisTurn: openingShield,
      isLegendaryMonsterCombat: isLegendaryCombat,
      legendaryMonsterEffectiveLife: legendaryEffectiveLife,
      opponentMonsterId: monsterRule?.id,
      beforeCombatSpecialAcknowledged: !needsBeforeCombat,
      potionsConsumedThisTurn: 0,
      bombsConsumedThisTurn: 0,
      lastReactionTriggered: null,
      pendingCounterattack: 0,
      lastDamageDiscards: [],
      isAutomaVsAutoma,
      opponentAutomaIndex: isAutomaVsAutoma ? rivalIndex : null,
      opponentCombatDeck: rivalCombatDeck,
      opponentCombatDiscard: [],
      opponentShieldsThisTurn: rivalOpeningShield,
      opponentRevealedCard: null,
      fightLog: isAutomaVsAutoma
        ? [
            `Combate Automa vs Automa: ${activePlayer.label} vs ${name}.`,
            `Mazos: tú ${combinedCombatDeck.length} · rival ${rivalCombatDeck.length}. Escudos: ${openingShield} / ${rivalOpeningShield}.`,
          ]
        : [
            `Combate vs ${name}. Mazo: ${combinedCombatDeck.length} cartas. Escudo inicial: ${openingShield}.`,
          ],
    });
    addLog(
      isAutomaVsAutoma
        ? `¡COMBATE AUTOMA vs AUTOMA contra ${name.toUpperCase()}!`
        : `¡COMBATE contra ${name.toUpperCase()}!`
    );
    if (isLegendaryCombat && legendaryEffectiveLife !== undefined) {
      addLog(
        `Monstruo Legendario — configura reserva de vida: ${formatLegendaryLifeSummary(automa)}.`
      );
      if (legendaryEffectiveLife === 0) {
        addLog("Vida efectiva 0: el jefe no añade cartas a su reserva (solo cartas base del setup).");
      }
    }
    if (monsterRule) {
      addLog(`Tabla ataque esp. (${monsterRule.name}): consulta partes en combate.`);
    }
  };

  const handleDiscardTopCombatCard = () => {
    setCombat((prev) => {
      if (prev.combatDeck.length === 0) {
        return prev;
      }
      const top = prev.combatDeck[0];
      return {
        ...prev,
        combatDeck: prev.combatDeck.slice(1),
        combatDiscard: [...prev.combatDiscard, top],
        fightLog: [
          `⚔ Monstruo esp.: descartada ${top.id} (1ª carta combate, sin barajar).`,
          ...prev.fightLog,
        ],
      };
    });
    addLog("Ataque esp. monstruo: 1ª carta del mazo de combate descartada.");
  };

  const handleAcknowledgeBeforeCombat = () => {
    setCombat((prev) => ({
      ...prev,
      beforeCombatSpecialAcknowledged: true,
      fightLog: [
        "⚔ Monstruo esp.: daño previo al combate aplicado.",
        ...prev.fightLog,
      ],
    }));
  };

  const resolveAutomaAttack = (
    deck: ChallengeCard[],
    discard: ChallengeCard[],
    card: ChallengeCard,
    consumables: { potions: number; bombs: number },
    combatEffects: {
      pendingAttackDamageBonus: number;
      ignoreNextOpponentDamage: boolean;
    }
  ): {
    deck: ChallengeCard[];
    discard: ChallengeCard[];
    totalDamage: number;
    totalShield: number;
    fightLogs: string[];
    extraComboAttacks: number;
    bonusOpponentDamage: number;
  } => {
    let workingDeck = deck;
    const fightLogs: string[] = [];
    const extraDiscard: ChallengeCard[] = [];
    let raiseShieldToMax = false;
    let schoolExtraCombos = 0;

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

    if (combatEffects.pendingAttackDamageBonus > 0) {
      baseDamage += combatEffects.pendingAttackDamageBonus;
      fightLogs.push(
        `Bono de ataque anterior: +${combatEffects.pendingAttackDamageBonus} daño.`
      );
      combatEffects.pendingAttackDamageBonus = 0;
    }

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

    if (card.attackShuffleDiscardTopCount && card.attackShuffleDiscardTopCount > 0) {
      for (let i = 0; i < card.attackShuffleDiscardTopCount; i++) {
        if (discard.length > 0) {
          const topDiscard = discard[discard.length - 1];
          workingDeck = shuffleArray([...workingDeck, topDiscard]);
          discard = discard.slice(0, -1);
          fightLogs.push(`Efecto (${card.id}): ${topDiscard.id} barajada al mazo (${i + 1}/${card.attackShuffleDiscardTopCount}).`);
        } else {
          fightLogs.push(`Efecto (${card.id}): descarte vacío en barajada ${i + 1}/${card.attackShuffleDiscardTopCount}.`);
          break;
        }
      }
    }

    if (card.schoolSpecialEffect && activeSchoolObj.specialCard) {
      const spec =
        card.schoolSpecialEffect === 1
          ? activeSchoolObj.specialCard.special1
          : card.schoolSpecialEffect === 2
            ? activeSchoolObj.specialCard.special2
            : activeSchoolObj.specialCard.special3;
      baseDamage = spec.damage;
      baseShield = spec.shields;
      fightLogs.push(
        `Especial ${card.schoolSpecialEffect} (${activeSchoolObj.name}): ${spec.description}`
      );
      if (spec.raiseShieldToMax) {
        raiseShieldToMax = true;
        baseShield = getMaxShieldLevel(automa.attributes.defense);
        fightLogs.push(
          `Escudo al máximo (Defensa ${automa.attributes.defense}): ${baseShield}.`
        );
      }
      if (spec.nextAttackDamageBonus) {
        combatEffects.pendingAttackDamageBonus = spec.nextAttackDamageBonus;
        fightLogs.push(
          `Próximo ataque: +${spec.nextAttackDamageBonus} daño.`
        );
      }
      if (spec.ignoreNextOpponentDamage) {
        combatEffects.ignoreNextOpponentDamage = true;
        fightLogs.push(
          "Ignorará todo el daño del próximo turno de combate del oponente."
        );
      }
      if (spec.attackExtraComboCount) {
        schoolExtraCombos = spec.attackExtraComboCount;
        fightLogs.push(
          `Especial: juega ${spec.attackExtraComboCount} combo(s) adicional(es) inmediatamente.`
        );
      }
      const shuffleCount =
        spec.shuffleDiscardTopCount ?? (spec.shuffleDiscardTop ? 1 : 0);
      if (shuffleCount > 0) {
        const shuffleCtx = { deck: workingDeck, discard, fightLogs };
        for (let i = 0; i < shuffleCount; i++) {
          shuffleTopDiscardIntoDeck(
            shuffleCtx,
            shuffleCount > 1
              ? `Especial ${card.schoolSpecialEffect} (${i + 1}/${shuffleCount})`
              : `Especial ${card.schoolSpecialEffect}`
          );
        }
        workingDeck = shuffleCtx.deck;
        discard = shuffleCtx.discard;
      }
      if (spec.gainPotions) {
        consumables.potions = Math.min(4, consumables.potions + spec.gainPotions);
        fightLogs.push(`Gana ${spec.gainPotions} poción(es).`);
      }
      if (spec.spendPotionForDamage) {
        if (consumables.potions > 0) {
          consumables.potions -= 1;
          baseDamage += spec.spendPotionForDamage;
          fightLogs.push(
            `Poción consumida: ${spec.spendPotionForDamage} daño.`
          );
        } else {
          fightLogs.push("Sin pociones: no se aplica el daño de poción.");
        }
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
        if (activeSchoolObj.specialCard?.mutagenCombat) {
          const mutagenCtx = { deck: workingDeck, discard, fightLogs };
          const updated = applySchoolMutagenCombatBonuses(
            activeSchoolObj,
            active,
            mutagenCtx,
            { damage: baseDamage, shields: baseShield },
            consumables
          );
          baseDamage = updated.damage;
          baseShield = updated.shields;
          workingDeck = mutagenCtx.deck;
          discard = mutagenCtx.discard;
        }
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
    let totalShield = raiseShieldToMax
      ? baseShield + schoolShieldBonus
      : effectiveCardShield + schoolShieldBonus + defenseShieldBonus;
    const maxShield = getMaxShieldLevel(automa.attributes.defense);
    if (totalShield > maxShield) {
      fightLogs.push(
        `Escudo limitado por Defensa (máx. ${maxShield}): ${totalShield} → ${maxShield}.`
      );
      totalShield = capShieldLevel(totalShield, automa.attributes.defense);
    }

    if (defenseShieldBonus > 0 && !raiseShieldToMax) {
      fightLogs.push(`Bono de Defensa (nivel ${defenseShieldBonus}): +${defenseShieldBonus} escudo.`);
    }

    let bonusOpponentDamage = 0;
    if (card.attackPotionOpponentShieldDamage && consumables.potions > 0) {
      consumables.potions -= 1;
      bonusOpponentDamage = totalShield;
      fightLogs.push(`Poción consumida: oponente sufre ${bonusOpponentDamage} daños (escudos actuales del Automa).`);
    }

    const bombExtraCombo =
      Boolean(card.attackBombExtraCombo && useBombs && consumables.bombs > 0);
    let extraComboAttacks = schoolExtraCombos;

    if (bombExtraCombo) {
      consumables.bombs -= 1;
      extraComboAttacks += 1;
      fightLogs.push("Bomba consumida: juega otro combo inmediatamente.");
    } else if (card.attackExtraCombo) {
      extraComboAttacks += 1;
      fightLogs.push("Tras resolver: juega otro combo inmediatamente.");
    }

    return {
      deck: workingDeck,
      discard: [...discard, ...extraDiscard, card],
      totalDamage,
      totalShield,
      fightLogs,
      extraComboAttacks,
      bonusOpponentDamage,
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
    let lastBonusOpponentDamage = 0;
    let lastCard: ChallengeCard | null = null;

    const combatEffects = {
      pendingAttackDamageBonus: combat.pendingAttackDamageBonus ?? 0,
      ignoreNextOpponentDamage: combat.ignoreNextOpponentDamage ?? false,
    };
    let chainRemaining = 0;

    const runAttack = () => {
      if (deck.length === 0) return;
      const card = deck[0];
      deck = deck.slice(1);
      const result = resolveAutomaAttack(deck, discard, card, consumables, combatEffects);
      deck = result.deck;
      discard = result.discard;
      lastDamage = result.totalDamage;
      lastShield = result.totalShield;
      lastBonusOpponentDamage += result.bonusOpponentDamage;
      lastCard = card;
      allFightLogs.push(
        `Ataque (${card.id}): ${result.totalDamage} daño, ${result.totalShield} escudo. Restan ${deck.length}.`,
        ...result.fightLogs
      );
      if (chainRemaining > 0) {
        chainRemaining -= 1;
      } else if (result.extraComboAttacks > 0) {
        chainRemaining = result.extraComboAttacks;
      }
    };

    runAttack();
    while (chainRemaining > 0 && deck.length > 0) {
      allFightLogs.push("--- Combo adicional ---");
      runAttack();
    }

    if (!lastCard) return;

    setAutoma((p) => ({
      ...p,
      potions: consumables.potions,
      bombs: consumables.bombs,
    }));

    const totalVsRival = lastDamage + lastBonusOpponentDamage;

    setCombat((prev) => {
      let fightLog = [...allFightLogs, ...prev.fightLog];
      let opponentCombatDeck = prev.opponentCombatDeck ?? [];
      let opponentCombatDiscard = prev.opponentCombatDiscard ?? [];
      let opponentShieldsThisTurn = prev.opponentShieldsThisTurn ?? 0;
      let pendingCounterattack = prev.pendingCounterattack ?? 0;

      let nextDeck = deck;
      let nextDiscard = discard;
      let nextShields = lastShield;

      if (prev.isAutomaVsAutoma && totalVsRival > 0) {
        const rivalIdx = prev.opponentAutomaIndex;
        const rivalDef =
          rivalIdx != null && automaPlayers[rivalIdx]
            ? automaPlayers[rivalIdx].automa.attributes.defense
            : 1;
        const hit = applyDamageToCombatDeck(
          opponentCombatDeck,
          opponentCombatDiscard,
          opponentShieldsThisTurn,
          totalVsRival,
          rivalDef,
          "Rival Automa"
        );
        opponentCombatDeck = hit.deck;
        opponentCombatDiscard = hit.discard;
        opponentShieldsThisTurn = hit.shieldsAfterHit;
        fightLog = [...hit.logs, ...fightLog];
        if (hit.defeated) {
          fightLog = [
            "Rival Automa sin cartas — puedes declarar victoria.",
            ...fightLog,
          ];
        }
        // Reacciones del rival al recibir daño → contraatacan al Automa activo.
        if (hit.pendingCounterattack > 0) {
          const counter = applyDamageToCombatDeck(
            nextDeck,
            nextDiscard,
            nextShields,
            hit.pendingCounterattack,
            automa.attributes.defense,
            "Contraataque rival"
          );
          nextDeck = counter.deck;
          nextDiscard = counter.discard;
          nextShields = counter.shieldsAfterHit;
          fightLog = [...counter.logs, ...fightLog];
        }
      }

      return {
        ...prev,
        combatDeck: nextDeck,
        combatDiscard: nextDiscard,
        revealedCard: lastCard,
        damageInflictedThisTurn: lastDamage,
        shieldsActiveThisTurn: nextShields,
        bonusOpponentDamageThisTurn: lastBonusOpponentDamage,
        pendingAttackDamageBonus: combatEffects.pendingAttackDamageBonus,
        ignoreNextOpponentDamage: combatEffects.ignoreNextOpponentDamage,
        opponentCombatDeck,
        opponentCombatDiscard,
        opponentShieldsThisTurn,
        pendingCounterattack,
        fightLog,
      };
    });
  };

  /** Turno de ataque del Automa rival (brujo): revela carta Desafío y aplica daño al activo. */
  const handleRivalAutomaAttack = () => {
    if (!combat.isAutomaVsAutoma) return;
    const rivalDeck = [...(combat.opponentCombatDeck ?? [])];
    if (rivalDeck.length === 0) {
      addLog("Rival Automa derrotado — sin cartas.");
      return;
    }

    const card = rivalDeck[0];
    const restDeck = rivalDeck.slice(1);
    const rivalDiscard = [...(combat.opponentCombatDiscard ?? []), card];
    let damage = card.damage;
    let shields = card.shields;

    if (card.schoolSpecialEffect) {
      const rivalIdx = combat.opponentAutomaIndex;
      const rivalPlayer =
        rivalIdx != null ? automaPlayers[rivalIdx] : null;
      const rivalSchool = rivalPlayer
        ? WITCHER_SCHOOLS.find((s) => s.id === rivalPlayer.schoolId)
        : null;
      if (rivalSchool?.specialCard) {
        const spec =
          card.schoolSpecialEffect === 1
            ? rivalSchool.specialCard.special1
            : card.schoolSpecialEffect === 2
              ? rivalSchool.specialCard.special2
              : rivalSchool.specialCard.special3;
        damage = spec.damage;
        shields = spec.shields;
      }
    }

    if (combat.ignoreNextOpponentDamage) {
      setCombat((prev) => ({
        ...prev,
        opponentCombatDeck: restDeck,
        opponentCombatDiscard: rivalDiscard,
        opponentRevealedCard: card,
        opponentShieldsThisTurn: Math.max(prev.opponentShieldsThisTurn ?? 0, shields),
        ignoreNextOpponentDamage: false,
        fightLog: [
          `Ataque rival (${card.id}): ${damage} daño ignorado (Oso Especial 3).`,
          ...prev.fightLog,
        ],
      }));
      addLog(`Rival Automa atacó ${damage} — ignorado (Oso Especial 3).`);
      return;
    }

    const hit = applyDamageToCombatDeck(
      combat.combatDeck,
      combat.combatDiscard,
      combat.shieldsActiveThisTurn,
      damage,
      automa.attributes.defense,
      "Automa activo"
    );

    setCombat((prev) => ({
      ...prev,
      opponentCombatDeck: restDeck,
      opponentCombatDiscard: rivalDiscard,
      opponentRevealedCard: card,
      opponentShieldsThisTurn: Math.max(prev.opponentShieldsThisTurn ?? 0, shields),
      combatDeck: hit.deck,
      combatDiscard: hit.discard,
      shieldsActiveThisTurn: hit.shieldsAfterHit,
      pendingCounterattack: (prev.pendingCounterattack ?? 0) + hit.pendingCounterattack,
      fightLog: [
        `Ataque rival (${card.id}): ${damage} daño, ${shields} escudo. Restan ${restDeck.length}.`,
        ...hit.logs,
        ...prev.fightLog,
      ],
    }));
    addLog(`Rival Automa atacó con ${card.id}: ${damage} daño.`);
    if (hit.defeated) {
      addLog("Automa activo sin cartas — puedes declarar derrota.");
    }
  };

  const handleReceiveDamage = (damageInput: number) => {
    const rawDamage = Math.max(0, damageInput);
    if (rawDamage === 0) return;

    if (combat.ignoreNextOpponentDamage) {
      setCombat((prev) => ({
        ...prev,
        ignoreNextOpponentDamage: false,
        fightLog: [
          `🛡️ Oso Especial 3: daño ignorado (${rawDamage} bloqueado).`,
          ...prev.fightLog,
        ],
      }));
      addLog(`Oponente atacó ${rawDamage} — ignorado (Oso Especial 3).`);
      return;
    }

    const shieldReduction = combat.shieldsActiveThisTurn;
    const effectiveDamage = Math.max(0, rawDamage - shieldReduction);
    let remainingDamageToDiscard = effectiveDamage;
    let tempDeck = [...combat.combatDeck];
    let tempDiscard = [...combat.combatDiscard];
    let shieldsAfterHit = effectiveDamage === 0 ? Math.max(0, combat.shieldsActiveThisTurn - rawDamage) : 0;
    const reactionLogs: string[] = [];
    let lastReaction: CombatState["lastReactionTriggered"] = null;
    let pendingCounterattack = combat.pendingCounterattack ?? 0;
    const lastDamageDiscards: NonNullable<CombatState["lastDamageDiscards"]> = [];

    while (remainingDamageToDiscard > 0 && tempDeck.length > 0) {
      const discardedCard = tempDeck[0];
      tempDeck = tempDeck.slice(1);
      tempDiscard.push(discardedCard);
      remainingDamageToDiscard--;

      const reaction = discardedCard.reaction;
      let reactionTriggered = false;

      if (!reaction) {
        lastDamageDiscards.push({ card: discardedCard, reactionTriggered: false });
        continue;
      }

      if (reaction.raiseShieldToMax) {
        const maxShield = getMaxShieldLevel(automa.attributes.defense);
        shieldsAfterHit = maxShield;
        remainingDamageToDiscard = 0;
        reactionTriggered = true;
        const msg = `⚡ Reacción (${discardedCard.id}): escudo al máximo (Defensa ${maxShield}).`;
        reactionLogs.push(msg);
        lastReaction = { card: discardedCard, effectDescription: reaction.description };
      } else if (reaction.type === "shield" || reaction.type === "shield_damage") {
        const absorbed = Math.min(reaction.value, remainingDamageToDiscard);
        remainingDamageToDiscard -= absorbed;
        if (absorbed > 0 || reaction.value > 0) {
          reactionTriggered = true;
          const msg = `⚡ Reacción (${discardedCard.id}): cancela ${absorbed} de daño restante.`;
          reactionLogs.push(msg);
          lastReaction = { card: discardedCard, effectDescription: reaction.description };
        }
      } else if (reaction.type === "damage" && reaction.value > 0) {
        pendingCounterattack += reaction.value;
        reactionTriggered = true;
        const msg = `⚡ Reacción (${discardedCard.id}): ${reaction.value} daño de contraataque (aplicar en mesa).`;
        reactionLogs.push(msg);
        lastReaction = { card: discardedCard, effectDescription: reaction.description };
      }

      lastDamageDiscards.push({ card: discardedCard, reactionTriggered });
    }

    setCombat((prev) => ({
      ...prev,
      combatDeck: tempDeck,
      combatDiscard: tempDiscard,
      shieldsActiveThisTurn: shieldsAfterHit,
      lastReactionTriggered: lastReaction ?? prev.lastReactionTriggered,
      pendingCounterattack,
      lastDamageDiscards,
      fightLog: [
        `Daño ${rawDamage} (neto ${effectiveDamage}). Mazo: ${tempDeck.length}.`,
        ...reactionLogs,
        ...prev.fightLog,
      ],
    }));
    if (tempDeck.length === 0) addLog("Automa derrotado en combate.");
    if (pendingCounterattack > (combat.pendingCounterattack ?? 0)) {
      addLog(`Contraataque pendiente: ${pendingCounterattack} daño al oponente.`);
    }
  };

  const handleAcknowledgeCounterattack = () => {
    setCombat((prev) => {
      const amount = prev.pendingCounterattack ?? 0;
      if (amount <= 0) return prev;

      if (prev.isAutomaVsAutoma) {
        const rivalIdx = prev.opponentAutomaIndex;
        const rivalDef =
          rivalIdx != null && automaPlayers[rivalIdx]
            ? automaPlayers[rivalIdx].automa.attributes.defense
            : 1;
        const hit = applyDamageToCombatDeck(
          prev.opponentCombatDeck ?? [],
          prev.opponentCombatDiscard ?? [],
          prev.opponentShieldsThisTurn ?? 0,
          amount,
          rivalDef,
          "Contraataque → rival"
        );
        return {
          ...prev,
          pendingCounterattack: 0,
          opponentCombatDeck: hit.deck,
          opponentCombatDiscard: hit.discard,
          opponentShieldsThisTurn: hit.shieldsAfterHit,
          fightLog: [
            `✓ Contraataque ${amount} aplicado al Automa rival.`,
            ...hit.logs,
            ...prev.fightLog,
          ],
        };
      }

      return {
        ...prev,
        pendingCounterattack: 0,
        fightLog: [
          `✓ Confirmado en mesa: monstruo recibe ${amount} de daño por reacción.`,
          ...prev.fightLog,
        ],
      };
    });
    addLog(
      combat.isAutomaVsAutoma
        ? "Contraataque aplicado al Automa rival."
        : "Daño de reacción aplicado al oponente en mesa."
    );
  };

  const handleEndCombat = (automaWon: boolean) => {
    const combined = [...combat.combatDeck, ...combat.combatDiscard];
    const restoredDeck = combined.length > 0 ? shuffleArray(combined) : [];
    const rivalIndex = combat.opponentAutomaIndex;
    const isDual = Boolean(combat.isAutomaVsAutoma && rivalIndex != null);

    const rivalCombined = [
      ...(combat.opponentCombatDeck ?? []),
      ...(combat.opponentCombatDiscard ?? []),
    ];
    const rivalRestored =
      rivalCombined.length > 0 ? shuffleArray(rivalCombined) : [];

    setChallengeDeck(restoredDeck);
    setChallengeDiscard([]);

    const resetShield = getMaxShieldLevel(automa.attributes.defense);
    setAutoma((p) => ({ ...p, shieldLevel: resetShield }));

    if (isDual && rivalIndex != null) {
      setAutomaPlayers((prev) =>
        prev.map((player, index) => {
          if (index !== rivalIndex) return player;
          const rivalShield = getMaxShieldLevel(player.automa.attributes.defense);
          const rivalWon = !automaWon;
          return {
            ...player,
            challengeDeck: rivalRestored,
            challengeDiscard: [],
            automa: {
              ...player.automa,
              shieldLevel: rivalShield,
              trophies: rivalWon
                ? Math.min(4, player.automa.trophies + 1)
                : player.automa.trophies,
            },
            logs: [
              rivalWon
                ? `Combate vs ${activePlayer.label}: victoria (+1 trofeo).`
                : `Combate vs ${activePlayer.label}: derrota.`,
              ...player.logs,
            ],
          };
        })
      );
    }

    setCombat((prev) => ({ ...prev, isActive: false }));
    addLog(
      `Fin de combate — mazo Desafío ${restoredDeck.length} carta(s) (barajado). Escudo restaurado a ${resetShield}.`
    );
    if (isDual) {
      addLog(
        `Rival Automa: mazo Desafío restaurado (${rivalRestored.length} carta(s)).`
      );
    }

    if (automaWon) {
      handleAddTrophy();
      addLog(
        isDual
          ? "Combate ganado: Automa activo obtiene trofeo; el rival no."
          : "Combate ganado por el Automa."
      );
      if (combat.isLegendaryMonsterCombat) {
        setAutoma((p) => ({ ...p, legendaryMonsterDefeated: true }));
        addLog("Monstruo Legendario derrotado — las cartas LH irán al descarte.");
      }
    } else {
      if (isDual) {
        addLog("Combate perdido: el Automa rival obtiene el trofeo.");
      }
      if (combat.isLegendaryMonsterCombat) {
        const { next, drewFromReserve } = applyLegendaryMonsterLossPenalty(automa);
        setAutoma(next);
        addLog(
          drewFromReserve
            ? "Derrota vs Monstruo Legendario: mantiene fichas de Destrucción y roba 1 de la reserva."
            : "Derrota vs Monstruo Legendario: mantiene fichas; reserva de Destrucción vacía en mesa."
        );
      }
      addLog(
        restoredDeck.length === 0
          ? "Combate perdido — Automa sin cartas de vida."
          : "Combate perdido por el Automa."
      );
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
          automaCount={automaPlayers.length}
          activeAutomaLabel={activePlayer.label}
          onReconfig={() => setSetupMode(true)}
        />
      </div>

      <div className="automa-content flex flex-col flex-1 gap-6">
        {setupMode ? (
          <SetupWizard
            playerCount={playerCount}
            maxPlayerCount={getMaxAutomaPlayers(difficulty)}
            setupSchoolIds={setupSchoolIds}
            onPlayerCountChange={handleSetupPlayerCountChange}
            onSchoolChange={handleSetupSchoolChange}
            difficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
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
            onStart={handleStartGame}
            startError={startError}
          />
        ) : combat.isActive ? (
          <CombatView
            combat={combat}
            automa={automa}
            activeSchool={activeSchoolObj}
            rivalSchool={
              combat.isAutomaVsAutoma && combat.opponentAutomaIndex != null
                ? WITCHER_SCHOOLS.find(
                    (school) =>
                      school.id ===
                      automaPlayers[combat.opponentAutomaIndex!]?.schoolId
                  ) ?? null
                : null
            }
            legendaryMonsterId={automa.legendaryMonsterId}
            lockedAttributes={lockedAttributes}
            useBombs={useBombs}
            onUpdateAttribute={handleUpdateAttribute}
            onAutoImprove={handleAutoImproveAttribute}
            onAddTrophy={handleAddTrophy}
            onAutomaChange={setAutoma}
            onTrophyDecrease={() => {
              if (automa.trophies > 0) setAutoma((p) => ({ ...p, trophies: p.trophies - 1 }));
            }}
            onAttack={handleAutomaAttackTurn}
            onRivalAttack={handleRivalAutomaAttack}
            onReceiveDamage={handleReceiveDamage}
            onEndCombat={handleEndCombat}
            onDiscardTopCombatCard={handleDiscardTopCombatCard}
            onAcknowledgeBeforeCombat={handleAcknowledgeBeforeCombat}
            onAcknowledgeCounterattack={handleAcknowledgeCounterattack}
          />
        ) : (
          <GameBoard
            automa={automa}
            activeSchool={activeSchoolObj}
            automaPlayers={automaPlayers}
            activeAutomaIndex={activeAutomaIndex}
            onSelectAutoma={handleSelectAutoma}
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
            onCollectDestructionToken={handleCollectDestructionToken}
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
