/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Zap,
  Flame,
  Shield,
  Skull,
  Droplet,
  Compass,
  Award,
  Sparkles,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Play,
  ArrowRight,
  User,
  Activity,
  Heart,
  Plus,
  Minus,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Dice5,
  Dices,
  Layers,
  Sword,
  Target,
  Anchor,
  Skull as SkeletonIcon
} from 'lucide-react';

import { WitcherSchoolId, WitcherSchool, ActionCard, ChallengeCard, AutomaState, CombatState } from './types';
import { WITCHER_SCHOOLS } from './data/schools';
import {
  GENERIC_ACTION_CARDS,
  LEVEL_1_ACTION_CARDS,
  LEVEL_2_ACTION_CARDS,
  LEVEL_3_ACTION_CARDS,
  GENERIC_CHALLENGE_CARDS,
  LEVEL_1_CHALLENGE_CARDS,
  LEVEL_2_CHALLENGE_CARDS,
  LEVEL_3_CHALLENGE_CARDS
} from './data/cards';

import WitcherCard from './components/WitcherCard';
import DicePoker from './components/DicePoker';
import RulesReference from './components/RulesReference';
import SpecialSchoolCardComponent from './components/SpecialSchoolCardComponent';
import AppHeader from './components/AppHeader';
import PlayerAssistantLinks from './components/PlayerAssistantLinks';

// Helper to shuffle arrays
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const DEFAULT_CITIES = [
  'Vizima (Temeria)',
  'Novigrad (Redania)',
  'Kaer Morhen (Lobo)',
  'Cintra',
  'Oxenfurt (Universidad)',
  'Maribor',
  'Ban Ard',
  'Kaer Seren (Grifo)',
  'Gorthur Gvaed (Víbora)',
  'Wyizima',
  'Ellander',
  'Loc Muinne',
  'Tretogor',
  'Ard Carraigh',
  'Anspress (Skellige)',
  'Spikeroog (Skellige)',
  'Undvik (Skellige)'
];

export default function App() {
  // Game Setup State
  const [setupMode, setSetupMode] = useState<boolean>(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState<WitcherSchoolId>('wolf');
  const [difficulty, setDifficulty] = useState<'easy' | 'intermediate' | 'difficult'>('intermediate');
  
  // Active Expansion Toggles
  const [useDicePoker, setUseDicePoker] = useState<boolean>(true);
  const [useMutagens, setUseMutagens] = useState<boolean>(false);
  const [useSkellige, setUseSkellige] = useState<boolean>(false);
  const [useLegendaryHunt, setUseLegendaryHunt] = useState<boolean>(false);

  // Core Game State
  const [automa, setAutoma] = useState<AutomaState>({
    schoolId: 'wolf',
    difficulty: 'intermediate',
    attributes: { attack: 1, defense: 1, alchemy: 1, special: 1 },
    trophies: 0,
    potions: 1,
    bombs: 1,
    trails: { red: 0, blue: 0, green: 0, yellow: 0 },
    location: 'Vizima (Temeria)',
    mutagens: [],
    weaknesses: 0,
    destructionTokens: 0,
    dagonTrack: 0
  });

  // Level 5 attributes locking state (locks attributes so they can never go below 5)
  const [lockedAttributes, setLockedAttributes] = useState<{ [key: string]: boolean }>({
    attack: false,
    defense: false,
    alchemy: false,
    special: false
  });

  const [turnCount, setTurnCount] = useState<number>(1);
  const [currentTab, setCurrentTab] = useState<'assistant' | 'turn' | 'poker' | 'expansions' | 'rules'>('assistant');

  // Decks & Discards
  const [actionDeck, setActionDeck] = useState<ActionCard[]>([]);
  const [actionDiscard, setActionDiscard] = useState<ActionCard[]>([]);
  const [activeActionCard, setActiveActionCard] = useState<ActionCard | null>(null);
  
  const [challengeDeck, setChallengeDeck] = useState<ChallengeCard[]>([]);
  const [challengeDiscard, setChallengeDiscard] = useState<ChallengeCard[]>([]);
  
  // Reserve of Level 3 cards for Trophies / Meditation gain
  const [level3ChallengeReserve, setLevel3ChallengeReserve] = useState<ChallengeCard[]>([]);

  // Turn Phase Tracker (1: Movement/Actions, 2: Choose Main Action, 3: Market Maintenance)
  const [turnPhase, setTurnPhase] = useState<1 | 2 | 3>(1);
  const [bonusApplied, setBonusApplied] = useState<boolean>(false);

  // Combat State
  const [combat, setCombat] = useState<CombatState>({
    isActive: false,
    opponentType: 'monster',
    opponentName: 'Slyzard',
    combatDeck: [],
    combatDiscard: [],
    revealedCard: null,
    damageInflictedThisTurn: 0,
    shieldsActiveThisTurn: 0,
    potionsConsumedThisTurn: 0,
    bombsConsumedThisTurn: 0,
    lastReactionTriggered: null,
    fightLog: []
  });

  // Custom User Notification logs
  const [logs, setLogs] = useState<string[]>(['El Brujo Automa ha desenvainado sus espadas.']);

  const activeSchoolObj = WITCHER_SCHOOLS.find(s => s.id === automa.schoolId) || WITCHER_SCHOOLS[0];
  const selectedSchoolObj = WITCHER_SCHOOLS.find(s => s.id === selectedSchoolId) || WITCHER_SCHOOLS[0];

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev.slice(0, 49)]);
  };

  // Automatic attribute improvement choice helper based on page 7/16 rules
  const handleAutoImproveAttribute = (type: 'highest' | 'lowest') => {
    const attrs: ('attack' | 'defense' | 'alchemy' | 'special')[] = ['attack', 'defense', 'alchemy', 'special'];
    
    // Filter out attributes at level 5
    const eligible = attrs.filter(a => automa.attributes[a] < 5);
    if (eligible.length === 0) {
      addLog('No hay atributos elegibles para mejorar (todos están en nivel 5).');
      return;
    }

    // Find the extreme value (min or max)
    const values = eligible.map(a => automa.attributes[a]);
    const targetValue = type === 'lowest' ? Math.min(...values) : Math.max(...values);

    // Filter to those with target value
    const candidates = eligible.filter(a => automa.attributes[a] === targetValue);

    // In case of tie, select the one most to the left of the board: 'attack' > 'defense' > 'alchemy' > 'special'
    // This order is preserved in our original `attrs` array, so the first match is the left-most!
    const bestMatch = attrs.find(a => candidates.includes(a));
    if (bestMatch) {
      handleUpdateAttribute(bestMatch, 1);
      addLog(`[Auto-Mejora] Se mejoró automáticamente ${bestMatch.toUpperCase()} (Criterio: ${type === 'lowest' ? 'Menor' : 'Mayor'} nivel).`);
    }
  };

  // Helper to sample exact N cards from a pool with replacement/cycling if pool is smaller
  const sampleCards = <T,>(pool: T[], count: number): T[] => {
    const shuffled = shuffleArray(pool);
    const result: T[] = [];
    for (let i = 0; i < count; i++) {
      result.push(shuffled[i % pool.length]);
    }
    return result;
  };

  // Initialize Game
  const handleStartGame = () => {
    // 1. Compile Decks based on exact Solo V1.4 rules (Page 4 table)
    let finalActions: ActionCard[] = [];
    let finalChallenges: ChallengeCard[] = [];
    
    // Action Pools separated precisely into Generic and Specific
    const genericActionLvl1 = [
      ...GENERIC_ACTION_CARDS,
      ...LEVEL_1_ACTION_CARDS.filter(c => c.movement !== 99)
    ];
    const specificActionLvl1 = LEVEL_1_ACTION_CARDS.filter(c => c.movement === 99);

    const genericActionLvl2 = LEVEL_2_ACTION_CARDS.filter(c => c.movement !== 99);
    const specificActionLvl2 = LEVEL_2_ACTION_CARDS.filter(c => c.movement === 99);

    const genericActionLvl3 = LEVEL_3_ACTION_CARDS.filter(c => c.movement !== 99);
    const specificActionLvl3 = LEVEL_3_ACTION_CARDS.filter(c => c.movement === 99);

    // Challenge Pools separated precisely into Generic and Specific
    const genericChallengeLvl1 = [
      ...GENERIC_CHALLENGE_CARDS,
      ...LEVEL_1_CHALLENGE_CARDS.filter(c => !['cha-19', 'cha-20', 'cha-21'].includes(c.id))
    ];
    const specificChallengeLvl1 = LEVEL_1_CHALLENGE_CARDS.filter(c => ['cha-19', 'cha-20', 'cha-21'].includes(c.id));

    const genericChallengeLvl2 = LEVEL_2_CHALLENGE_CARDS.filter(c => !['cha-22', 'cha-23', 'cha-24'].includes(c.id));
    const specificChallengeLvl2 = LEVEL_2_CHALLENGE_CARDS.filter(c => ['cha-22', 'cha-23', 'cha-24'].includes(c.id));

    const genericChallengeLvl3 = LEVEL_3_CHALLENGE_CARDS.filter(c => !['cha-25', 'cha-26', 'cha-27'].includes(c.id));
    const specificChallengeLvl3 = LEVEL_3_CHALLENGE_CARDS.filter(c => ['cha-25', 'cha-26', 'cha-27'].includes(c.id));

    if (difficulty === 'easy') {
      // FÁCIL:
      // Mazo de Acción:
      // - Nivel I: 4 genéricas + 1 específica
      // - Nivel II: 4 genéricas + 1 específica
      // - Nivel III: 2 genéricas + 1 específica
      const lvl1Actions = [
        ...sampleCards(genericActionLvl1, 4),
        ...sampleCards(specificActionLvl1, 1)
      ];
      const lvl2Actions = [
        ...sampleCards(genericActionLvl2, 4),
        ...sampleCards(specificActionLvl2, 1)
      ];
      const lvl3Actions = [
        ...sampleCards(genericActionLvl3, 2),
        ...sampleCards(specificActionLvl3, 1)
      ];
      
      // Page 4: "comienza barajando las de nivel 3, pon sobre ellas las de nivel 2 barajadas y luego las de nivel 1."
      // Since we draw from index 0 first, Level 1 goes at the start of the array, then Level 2, then Level 3.
      finalActions = [
        ...shuffleArray(lvl1Actions),
        ...shuffleArray(lvl2Actions),
        ...shuffleArray(lvl3Actions)
      ];

      // Mazo de Desafío:
      // - Nivel I: 2 genéricas + 2 específicas
      // - Nivel II: 2 genéricas + 2 específicas
      // - Nivel III: 1 genérica + 2 específicas
      const lvl1Challenges = [
        ...sampleCards(genericChallengeLvl1, 2),
        ...sampleCards(specificChallengeLvl1, 2)
      ];
      const lvl2Challenges = [
        ...sampleCards(genericChallengeLvl2, 2),
        ...sampleCards(specificChallengeLvl2, 2)
      ];
      const lvl3Challenges = [
        ...sampleCards(genericChallengeLvl3, 1),
        ...sampleCards(specificChallengeLvl3, 2)
      ];
      
      finalChallenges = shuffleArray([...lvl1Challenges, ...lvl2Challenges, ...lvl3Challenges]);
    } else if (difficulty === 'intermediate') {
      // INTERMEDIO:
      // Mazo de Acción:
      // - Nivel I: 3 genéricas + 1 específica
      // - Nivel II: 3 genéricas + 1 específica
      // - Nivel III: 3 genéricas + 1 específica
      const lvl1Actions = [
        ...sampleCards(genericActionLvl1, 3),
        ...sampleCards(specificActionLvl1, 1)
      ];
      const lvl2Actions = [
        ...sampleCards(genericActionLvl2, 3),
        ...sampleCards(specificActionLvl2, 1)
      ];
      const lvl3Actions = [
        ...sampleCards(genericActionLvl3, 3),
        ...sampleCards(specificActionLvl3, 1)
      ];
      
      finalActions = [
        ...shuffleArray(lvl1Actions),
        ...shuffleArray(lvl2Actions),
        ...shuffleArray(lvl3Actions)
      ];

      // Mazo de Desafío:
      // - Nivel I: 3 genéricas + 2 específicas
      // - Nivel II: 3 genéricas + 2 específicas
      // - Nivel III: 0 genéricas + 2 específicas
      const lvl1Challenges = [
        ...sampleCards(genericChallengeLvl1, 3),
        ...sampleCards(specificChallengeLvl1, 2)
      ];
      const lvl2Challenges = [
        ...sampleCards(genericChallengeLvl2, 3),
        ...sampleCards(specificChallengeLvl2, 2)
      ];
      const lvl3Challenges = [
        ...sampleCards(genericChallengeLvl3, 0),
        ...sampleCards(specificChallengeLvl3, 2)
      ];
      
      finalChallenges = shuffleArray([...lvl1Challenges, ...lvl2Challenges, ...lvl3Challenges]);
    } else {
      // DIFÍCIL:
      // Mazo de Acción:
      // - Nivel I: 2 genéricas + 1 específica
      // - Nivel II: 2 genéricas + 1 específica
      // - Nivel III: 2 genéricas + 1 específica
      const lvl1Actions = [
        ...sampleCards(genericActionLvl1, 2),
        ...sampleCards(specificActionLvl1, 1)
      ];
      const lvl2Actions = [
        ...sampleCards(genericActionLvl2, 2),
        ...sampleCards(specificActionLvl2, 1)
      ];
      const lvl3Actions = [
        ...sampleCards(genericActionLvl3, 2),
        ...sampleCards(specificActionLvl3, 1)
      ];
      
      finalActions = [
        ...shuffleArray(lvl1Actions),
        ...shuffleArray(lvl2Actions),
        ...shuffleArray(lvl3Actions)
      ];

      // Mazo de Desafío:
      // - Nivel I: 3 genéricas + 2 específicas
      // - Nivel II: 3 genéricas + 2 específicas
      // - Nivel III: 0 genéricas + 2 específicas
      const lvl1Challenges = [
        ...sampleCards(genericChallengeLvl1, 3),
        ...sampleCards(specificChallengeLvl1, 2)
      ];
      const lvl2Challenges = [
        ...sampleCards(genericChallengeLvl2, 3),
        ...sampleCards(specificChallengeLvl2, 2)
      ];
      const lvl3Challenges = [
        ...sampleCards(genericChallengeLvl3, 0),
        ...sampleCards(specificChallengeLvl3, 2)
      ];
      
      finalChallenges = shuffleArray([...lvl1Challenges, ...lvl2Challenges, ...lvl3Challenges]);
    }

    // 2. Compile level 3 Challenge reserve for Trophies/Meditation
    // Reserve must have at least 3 cards apart from the deck if possible
    // Let's filter remaining ones or generate some unique ones
    const activeChallengeIds = new Set(finalChallenges.map(c => c.id));
    let reserve = LEVEL_3_CHALLENGE_CARDS.filter(c => !activeChallengeIds.has(c.id));
    if (reserve.length < 3) {
      // if not enough, sample with replacement to pad to 4 cards
      reserve = [...reserve, ...sampleCards(LEVEL_3_CHALLENGE_CARDS, 4 - reserve.length)];
    }

    // 3. Set State
    setAutoma({
      schoolId: selectedSchoolId,
      difficulty: difficulty,
      attributes: { attack: 1, defense: 1, alchemy: 1, special: 1 },
      trophies: 0,
      potions: 1,
      bombs: 1,
      trails: { red: 0, blue: 0, green: 0, yellow: 0 },
      location: selectedSchoolId === 'wolf' ? 'Kaer Morhen (Lobo)' : selectedSchoolId === 'griffin' ? 'Kaer Seren (Grifo)' : selectedSchoolId === 'viper' ? 'Gorthur Gvaed (Víbora)' : 'Vizima (Temeria)',
      mutagens: [],
      weaknesses: 0,
      destructionTokens: 0,
      dagonTrack: 0
    });

    setLockedAttributes({
      attack: false,
      defense: false,
      alchemy: false,
      special: false
    });

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

    setCombat(prev => ({ ...prev, isActive: false }));

    const schoolName = WITCHER_SCHOOLS.find(s => s.id === selectedSchoolId)?.name || '';
    setLogs([`Partida Inicializada contra ${schoolName} (${difficulty.toUpperCase()}). Mazo de Acción apilado por niveles según reglamento V1.4.`]);
  };

  // Draw Action Card (Phase I)
  const drawActionCard = () => {
    if (actionDeck.length === 0) {
      if (actionDiscard.length === 0) {
        addLog('Error: No quedan cartas en el mazo ni descarte de acción.');
        return;
      }
      // Reshuffle discard
      const reshuffled = shuffleArray(actionDiscard);
      setActionDeck(reshuffled);
      setActionDiscard([]);
      addLog('¡Mazo de Acción vacío! Barajando el descarte para formar un mazo nuevo.');
      return;
    }

    const nextCard = actionDeck[0];
    setActionDeck(prev => prev.slice(1));
    setActiveActionCard(nextCard);
    setTurnPhase(2);
    setBonusApplied(false);
    addLog(`Fase I: Automa roba carta. Destino: ${nextCard.destination}, Movimiento: ${nextCard.movement} PM.`);
  };

  // Helper to safely modify attributes with lvl 5 locks
  const handleUpdateAttribute = (attr: 'attack' | 'defense' | 'alchemy' | 'special', delta: number) => {
    setAutoma(prev => {
      const current = prev.attributes[attr];
      let updated = current + delta;
      
      // Enforce bounds 1-5
      if (updated > 5) updated = 5;
      if (updated < 1) updated = 1;

      // Rule: Once an attribute reaches level 5, it gets locked and CANNOT be reduced.
      const isCurrentlyLocked = lockedAttributes[attr];
      if (isCurrentlyLocked && delta < 0) {
        addLog(`Bono bloqueado: El atributo ${attr.toUpperCase()} está al nivel 5 y no puede ser reducido.`);
        return prev;
      }

      // Check if newly reaching level 5
      let newLock = isCurrentlyLocked;
      if (updated === 5 && !isCurrentlyLocked) {
        newLock = true;
        // Trigger a locked state update alongside
        setTimeout(() => {
          setLockedAttributes(locks => ({ ...locks, [attr]: true }));
          addLog(`¡ATRIBUTO BLOQUEADO! El atributo ${attr.toUpperCase()} del Automa llegó a nivel 5. Queda inmune a penalizaciones.`);
        }, 100);
      }

      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attr]: updated
        }
      };
    });
  };

  // Apply Action Card Bonuses
  const applyActionCardBonuses = () => {
    if (!activeActionCard || bonusApplied) return;

    // Apply Attribute upgrade
    const bonus = activeActionCard.attributeBonus;
    let bonusLogStr = '';
    if (bonus) {
      if (bonus === 'attack') {
        handleUpdateAttribute('attack', 1);
        bonusLogStr = ' +1 ATAQUE';
      } else if (bonus === 'defense') {
        handleUpdateAttribute('defense', 1);
        bonusLogStr = ' +1 DEFENSA';
      } else if (bonus === 'alchemy') {
        handleUpdateAttribute('alchemy', 1);
        bonusLogStr = ' +1 ALQUIMIA';
      } else if (bonus === 'special') {
        handleUpdateAttribute('special', 1);
        bonusLogStr = ' +1 ESPECIAL';
      } else if (bonus === 'attack_defense') {
        handleUpdateAttribute('attack', 1);
        handleUpdateAttribute('defense', 1);
        bonusLogStr = ' +1 ATAQUE, +1 DEFENSA';
      } else if (bonus === 'attack_alchemy') {
        handleUpdateAttribute('attack', 1);
        handleUpdateAttribute('alchemy', 1);
        bonusLogStr = ' +1 ATAQUE, +1 ALQUIMIA';
      } else if (bonus === 'defense_special_any') {
        handleUpdateAttribute('defense', 1);
        handleUpdateAttribute('special', 1);
        handleAutoImproveAttribute('lowest');
        bonusLogStr = ' +1 DEFENSA, +1 ESPECIAL, +1 ELEGIDO (Menor)';
      } else if (bonus === 'highest') {
        handleAutoImproveAttribute('highest');
        bonusLogStr = ' +1 ATRIBUTO MÁS ALTO';
      } else if (bonus === 'lowest') {
        handleAutoImproveAttribute('lowest');
        bonusLogStr = ' +1 ATRIBUTO MÁS BAJO';
      } else if (bonus === 'highest_special') {
        handleAutoImproveAttribute('highest');
        handleUpdateAttribute('special', 1);
        bonusLogStr = ' +1 ATRIBUTO MÁS ALTO, +1 ESPECIAL';
      } else if (bonus === 'alchemy_any') {
        handleUpdateAttribute('alchemy', 1);
        handleAutoImproveAttribute('lowest');
        bonusLogStr = ' +1 ALQUIMIA, +1 ELEGIDO (Menor)';
      }
    }

    // Apply potion/bomb items
    let gotPotion = false;
    let gotBomb = false;
    if (activeActionCard.potionBonus) {
      setAutoma(prev => ({ ...prev, potions: prev.potions + 1 }));
      gotPotion = true;
    }
    if (activeActionCard.bombBonus) {
      setAutoma(prev => ({ ...prev, bombs: prev.bombs + 1 }));
      gotBomb = true;
    }

    // Apply trail
    let gotTrail = false;
    if (activeActionCard.trailBonus) {
      // Pick a random trail color based on active color
      const colors: ('red' | 'blue' | 'green' | 'yellow')[] = ['red', 'blue', 'green', 'yellow'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setAutoma(prev => ({
        ...prev,
        trails: {
          ...prev.trails,
          [randomColor]: prev.trails[randomColor] + 1
        }
      }));
      gotTrail = true;
    }

    setBonusApplied(true);
    addLog(`Bonos aplicados:${bonusLogStr}${gotPotion ? ' +1 Poción' : ''}${gotBomb ? ' +1 Bomba' : ''}${gotTrail ? ' +1 Ficha Rastro' : ''}.`);
  };

  // Add Level 3 Advanced card to the Challenge deck (simulating progression)
  const addLevel3CardToChallengeDeck = () => {
    if (level3ChallengeReserve.length === 0) {
      addLog('No quedan más cartas avanzadas de nivel 3 en la reserva.');
      return;
    }

    const cardToAdd = level3ChallengeReserve[0];
    setLevel3ChallengeReserve(prev => prev.slice(1));
    
    // Shuffle directly into the Challenge Deck
    setChallengeDeck(prev => shuffleArray([...prev, cardToAdd]));
    addLog(`¡Evolución del Automa! Se añadió una carta avanzada de Nivel 3 (${cardToAdd.reaction?.description || 'Bono de Daño Alto'}) al mazo de Desafío.`);
  };

  // Handle Trophy Addition (which triggers level 3 progression)
  const handleAddTrophy = () => {
    if (automa.trophies >= 4) return;
    setAutoma(prev => ({ ...prev, trophies: prev.trophies + 1 }));
    addLog(`¡Automa gana 1 Trofeo! Se activa progresión y entrenamiento.`);
    addLevel3CardToChallengeDeck();
  };

  // Phase II: Meditation Option
  const handleMeditate = () => {
    // Requirements: At least one attribute at level 5
    const hasLvl5 = Object.values(automa.attributes).some(v => v === 5);
    if (!hasLvl5) {
      addLog('No puedes meditar: El Automa requiere tener al menos un atributo en nivel 5.');
      return;
    }

    if (automa.trophies >= 4) {
      addLog('El Automa ya tiene el máximo de 4 trofeos.');
      return;
    }

    // Meditate takes the main action
    handleAddTrophy();
    addLog(`Fase II (Meditar): El Automa medita al tener un atributo en nivel 5. Coloca un trofeo en el tablero general y añade una carta avanzada.`);
    setTurnPhase(3);
  };

  // Phase II: Explore Option
  const handleExplore = () => {
    addLog('Fase II (Explorar): El Automa explora el terreno pasivamente. No ocurre nada narrativo en el turno del Automa.');
    setTurnPhase(3);
  };

  // Phase III: Market Maintenance and End Turn
  const handleEndTurn = () => {
    if (!activeActionCard) return;

    // Discard active card
    setActionDiscard(prev => [...prev, activeActionCard]);
    setActiveActionCard(null);

    // Advance turn
    setTurnCount(prev => prev + 1);
    setTurnPhase(1);
    setBonusApplied(false);
    addLog(`--- INICIO DEL TURNO ${turnCount + 1} ---`);
  };

  // ==========================================
  // COMBAT ENGINE LOGIC
  // ==========================================

  const handleStartCombat = (opponentType: 'monster' | 'witcher', name: string) => {
    // 1. Compile life deck (Challenge deck + discards)
    const combinedCombatDeck = shuffleArray([...challengeDeck, ...challengeDiscard]);
    
    setCombat({
      isActive: true,
      opponentType,
      opponentName: name || (opponentType === 'monster' ? 'Monstruo Salvaje' : 'Brujo Rival'),
      combatDeck: combinedCombatDeck,
      combatDiscard: [],
      revealedCard: null,
      damageInflictedThisTurn: 0,
      shieldsActiveThisTurn: 0,
      potionsConsumedThisTurn: 0,
      bombsConsumedThisTurn: 0,
      lastReactionTriggered: null,
      fightLog: [`¡El Combate comienza contra ${name}! El mazo de combate del Automa tiene ${combinedCombatDeck.length} cartas de vida.`]
    });

    addLog(`¡AUTOMA ENTRÓ EN COMBATE CONTRA ${name.toUpperCase()}!`);
  };

  // Automa Attacks Turn
  const handleAutomaAttackTurn = () => {
    if (combat.combatDeck.length === 0) {
      setCombat(prev => ({
        ...prev,
        fightLog: ['¡El Automa se ha quedado sin cartas de vida y cae DERROTADO!', ...prev.fightLog]
      }));
      addLog('El Automa ha sido derrotado en combate (sin vida).');
      return;
    }

    const card = combat.combatDeck[0];
    const remainingDeck = combat.combatDeck.slice(1);

    // Compute attack values
    let baseDamage = card.damage;
    let baseShield = card.shields;
    let schoolDamageBonus = 0;
    let schoolShieldBonus = 0;
    let potionsUsed = 0;
    let bombsUsed = 0;
    let logs: string[] = [];

    // Habilidades Especiales de Escuela (Nivel 3 / Cacería Legendaria)
    if (card.id === 'cha-25' && activeSchoolObj.specialCard) {
      baseDamage = activeSchoolObj.specialCard.special1.damage;
      baseShield = activeSchoolObj.specialCard.special1.shields;
      logs.push(`✨ ¡Habilidad ESPECIAL 1 de la ${activeSchoolObj.name} activada!: ${activeSchoolObj.specialCard.special1.description}`);
    } else if (card.id === 'cha-26' && activeSchoolObj.specialCard) {
      baseDamage = activeSchoolObj.specialCard.special2.damage;
      baseShield = activeSchoolObj.specialCard.special2.shields;
      logs.push(`✨ ¡Habilidad ESPECIAL 2 de la ${activeSchoolObj.name} activada!: ${activeSchoolObj.specialCard.special2.description}`);
    } else if (card.id === 'cha-27' && activeSchoolObj.specialCard) {
      baseDamage = activeSchoolObj.specialCard.special3.damage;
      baseShield = activeSchoolObj.specialCard.special3.shields;
      logs.push(`✨ ¡Habilidad ESPECIAL 3 de la ${activeSchoolObj.name} activada!: ${activeSchoolObj.specialCard.special3.description}`);
      
      // Regla especial de Mantícora: Si tiene poción, consume 1 para infligir 6 de daño directo
      if (automa.schoolId === 'manticore') {
        if (automa.potions > 0) {
          potionsUsed = 1;
          setAutoma(prev => ({ ...prev, potions: Math.max(0, prev.potions - 1) }));
          baseDamage = 6;
          logs.push(`🧪 Alquimia de Mantícora (Especial 3): Se consume 1 Poción para desatar un impacto masivo de 6 de Daño.`);
        } else {
          logs.push(`🧪 Alquimia de Mantícora (Especial 3): Quería consumir 1 Poción para hacer 6 de Daño, pero no le quedan pociones en su inventario.`);
        }
      }
    }

    // School Bonus Activation
    if (card.schoolSymbol) {
      schoolDamageBonus = activeSchoolObj.combatBonus.damage;
      schoolShieldBonus = activeSchoolObj.combatBonus.shields;
      logs.push(`¡Bono de Escuela ${activeSchoolObj.name} activado!: +${schoolDamageBonus} Daño, +${schoolShieldBonus} Escudo.`);
    }

    // Consumable Use Activation (potions / bombs)
    if (card.consumableSlot) {
      if (automa.potions > 0 || automa.bombs > 0) {
        // use whatever is available
        if (automa.potions > 0) {
          potionsUsed = 1;
          setAutoma(prev => ({ ...prev, potions: Math.max(0, prev.potions - 1) }));
          // Manticore has double poison bonus
          const extraDamage = automa.schoolId === 'manticore' ? 4 : 2;
          baseDamage += extraDamage;
          logs.push(`Automa consume 1 Poción: inflige +${extraDamage} Daño extra.`);
        } else if (automa.bombs > 0) {
          bombsUsed = 1;
          setAutoma(prev => ({ ...prev, bombs: Math.max(0, prev.bombs - 1) }));
          baseDamage += 2;
          logs.push(`Automa consume 1 Bomba: inflige +2 Daño extra.`);
        }
      } else {
        logs.push('La carta pedía un consumible, pero el inventario del Automa está vacío.');
      }
    }

    const totalDamage = baseDamage + schoolDamageBonus;
    const totalShield = baseShield + schoolShieldBonus;

    setCombat(prev => ({
      ...prev,
      combatDeck: remainingDeck,
      combatDiscard: [...prev.combatDiscard, card],
      revealedCard: card,
      damageInflictedThisTurn: totalDamage,
      shieldsActiveThisTurn: totalShield,
      potionsConsumedThisTurn: potionsUsed,
      bombsConsumedThisTurn: bombsUsed,
      lastReactionTriggered: null,
      fightLog: [
        `Turno Automa: Revela carta. Inflige ${totalDamage} Daño físico y gana ${totalShield} Escudos activos. (Cartas de vida restantes: ${remainingDeck.length})`,
        ...logs,
        ...prev.fightLog
      ]
    }));
  };

  // Player deals damage to Automa (triggers automatic reactions upon card discards!)
  const handleReceiveDamage = (damageInput: number) => {
    let rawDamage = Math.max(0, damageInput);
    if (rawDamage === 0) return;

    // Apply shields first
    const shieldReduction = combat.shieldsActiveThisTurn;
    const effectiveDamage = Math.max(0, rawDamage - shieldReduction);

    let fightLogs: string[] = [];
    fightLogs.push(`Recibe ataque de ${rawDamage} daño. Se reduce en ${shieldReduction} por Escudo activo. Daño neto recibido: ${effectiveDamage}.`);

    if (effectiveDamage === 0) {
      setCombat(prev => ({
        ...prev,
        shieldsActiveThisTurn: Math.max(0, prev.shieldsActiveThisTurn - rawDamage),
        fightLog: [...fightLogs, ...prev.fightLog]
      }));
      return;
    }

    // Now, we must discard cards equal to effectiveDamage.
    // However, we must review each card as it goes to the discard pile.
    // If a card contains a Reaction (shield / damage / both), it triggers immediately in real-time,
    // reducing the remaining damage (discards) or dealing damage to the opponent!
    let remainingDamageToDiscard = effectiveDamage;
    let tempDeck = [...combat.combatDeck];
    let tempDiscard = [...combat.combatDiscard];
    let triggeredReaction: { card: ChallengeCard; effectDescription: string } | null = null;
    let actualDiscardsThisBlow = 0;

    while (remainingDamageToDiscard > 0 && tempDeck.length > 0) {
      const discardedCard = tempDeck[0];
      tempDeck = tempDeck.slice(1);
      tempDiscard.push(discardedCard);
      actualDiscardsThisBlow++;
      remainingDamageToDiscard--;

      if (discardedCard.reaction) {
        const react = discardedCard.reaction;
        triggeredReaction = {
          card: discardedCard,
          effectDescription: react.description
        };

        fightLogs.push(`⚡ ¡REACCIÓN DE DESCARTE!: Se revela '${react.description}'`);

        if (react.type === 'shield' || react.type === 'shield_damage') {
          // Reduces remaining cards to discard
          const shieldValue = react.value;
          const avoided = Math.min(shieldValue, remainingDamageToDiscard);
          remainingDamageToDiscard -= avoided;
          fightLogs.push(`   -> El escudo de Reacción absorbe ${avoided} daño. Daño restante a descartar: ${remainingDamageToDiscard}`);
        }

        if (react.type === 'damage' || react.type === 'shield_damage') {
          fightLogs.push(`   -> ¡CONTRAGOLPE!: El Automa devuelve de inmediato ${react.value} daño de contraataque.`);
        }

        // Break the loop if we want to simulate reactions stopping immediate blows,
        // but typically all cards drawn sequentially. We can trigger multiple reactions too!
      }
    }

    const combatEnded = tempDeck.length === 0;

    setCombat(prev => ({
      ...prev,
      combatDeck: tempDeck,
      combatDiscard: tempDiscard,
      shieldsActiveThisTurn: 0, // shields consumed by this blow
      lastReactionTriggered: triggeredReaction,
      fightLog: [
        `Blow resolved: Descartadas ${actualDiscardsThisBlow} cartas por daño. Mazo restante: ${tempDeck.length} cartas.`,
        ...fightLogs,
        ...(combatEnded ? ['☠️ ¡Mazo de Combate agotado! El Automa ha caído K.O. en combate.'] : []),
        ...prev.fightLog
      ]
    }));

    if (combatEnded) {
      addLog('El Automa ha sido derrotado.');
    }
  };

  // Conclude Combat
  const handleEndCombat = (automaWon: boolean) => {
    // Collect combat deck back into challenge deck
    const restoredDeck = [...combat.combatDeck, ...combat.combatDiscard];
    setChallengeDeck(restoredDeck);
    setChallengeDiscard([]);

    setCombat(prev => ({ ...prev, isActive: false }));

    if (automaWon) {
      addLog(`Combate finalizado: Ganó el Automa. Se recupera su mazo de Desafío.`);
    } else {
      addLog(`Combate finalizado: Ganó el jugador humano. El Automa retrocede y se recupera.`);
    }
  };

  // Poke de Dados Card drawing helper
  const handleDrawPokerCard = (): ChallengeCard | null => {
    if (challengeDeck.length === 0) return null;
    const card = challengeDeck[0];
    // Put drawn card back to bottom or discard
    setChallengeDeck(prev => [...prev.slice(1), card]);
    return card;
  };

  return (
    <div className="min-h-screen flex flex-col" id="app-root">
      <div className="app app--automa">
        <AppHeader
          setupMode={setupMode}
          schoolName={activeSchoolObj.name}
          difficulty={automa.difficulty}
          turnCount={turnCount}
          onReconfig={() => setSetupMode(true)}
        />
      </div>

      <div className="automa-content flex flex-col flex-1 gap-6">
      {setupMode ? (
        /* SETUP MODE VIEW */
        <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col justify-center" id="setup-view">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Column: Form Settings */}
            <div className="flex-1 panel automa-panel-accent border-2 border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden w-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />
              
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight font-display uppercase">Preparación del Automa V1.4</h2>
                <p className="text-sm text-zinc-400 mt-2">
                  Configura los parámetros del Brujo Automa para iniciar tu combate en solitario.
                </p>
              </div>

              {/* School Selector */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-mono mb-3 font-bold">
                  1. Selecciona la Escuela del Automa
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WITCHER_SCHOOLS.map((school) => {
                    const isSelected = selectedSchoolId === school.id;
                    const bonusLabel = school.id === 'wolf' ? '+1 Daño' : school.id === 'cat' ? '+1 Escudo' : school.id === 'bear' ? '+2 Escudos' : '+1 Daño / +1 Escudo';
                    return (
                      <button
                        key={school.id}
                        type="button"
                        onClick={() => setSelectedSchoolId(school.id)}
                        className={`p-4 rounded-xl border-2 text-left flex flex-col justify-between h-36 transition-all cursor-pointer ${
                          isSelected
                            ? `bg-gradient-to-br from-orange-600/30 to-amber-500/20 border-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]`
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                        id={`setup-school-${school.id}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-display text-sm font-bold tracking-tight">{school.name}</span>
                          {school.id === 'wolf' && <ShieldAlert className="w-4 h-4 text-red-400" />}
                          {school.id === 'cat' && <Zap className="w-4 h-4 text-emerald-400" />}
                          {school.id === 'griffin' && <Flame className="w-4 h-4 text-amber-400" />}
                          {school.id === 'bear' && <Shield className="w-4 h-4 text-amber-600" />}
                          {school.id === 'viper' && <Skull className="w-4 h-4 text-purple-400" />}
                          {school.id === 'manticore' && <Droplet className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-snug line-clamp-2 mt-2">{school.description}</p>
                        <span className="text-[10px] font-mono mt-1 text-orange-400 font-black uppercase tracking-wider">{bonusLabel}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explicación de los Bonos de Escuela */}
                <div className="mt-3 bg-zinc-950/60 border border-zinc-850 rounded-xl p-3.5 text-xs text-zinc-400 leading-relaxed font-sans">
                  <span className="text-orange-400 font-bold block mb-1">💡 ¿Qué significan estos bonos (+1 Daño / +1 Escudo)?</span>
                  Durante el combate, cuando el Automa revela una carta de ataque que muestra el **símbolo de escuela de brujo**, recibe este beneficio de forma pasiva y permanente en su ataque del turno actual (ej. la Escuela del Lobo sumará <strong className="text-red-400">+1 Daño</strong> adicional, el Oso ganará <strong className="text-blue-400">+2 Escudos</strong>, etc.). Esto simula el entrenamiento especializado de cada fortaleza.
                </div>
              </div>

              {/* Difficulty Selector */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-mono mb-3 font-bold">
                  2. Nivel de Dificultad (Ajuste de Mazos Oficiales)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'easy', label: 'Fácil', desc: '13 Acciones / 11 Desafíos', border: 'border-emerald-900', hover: 'hover:border-emerald-700', activeBg: 'bg-emerald-950/40 text-emerald-300 border-emerald-600' },
                    { key: 'intermediate', label: 'Intermedio', desc: '12 Acciones / 12 Desafíos', border: 'border-orange-900', hover: 'hover:border-orange-700', activeBg: 'bg-orange-950/20 text-orange-400 border-orange-500' },
                    { key: 'difficult', label: 'Difícil', desc: '9 Acciones / 12 Desafíos', border: 'border-red-900', hover: 'hover:border-red-700', activeBg: 'bg-red-950/40 text-red-400 border-red-500' }
                  ].map((diffOpt) => {
                    const isSelected = difficulty === diffOpt.key;
                    return (
                      <button
                        key={diffOpt.key}
                        type="button"
                        onClick={() => setDifficulty(diffOpt.key as any)}
                        className={`p-3 rounded-xl border-2 text-center flex flex-col justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? diffOpt.activeBg
                            : `bg-zinc-950 border-zinc-800 text-zinc-400 ${diffOpt.hover}`
                        }`}
                        id={`setup-diff-${diffOpt.key}`}
                      >
                        <span className="font-display text-sm font-bold uppercase">{diffOpt.label}</span>
                        <span className="text-[10px] font-mono opacity-85 leading-normal">{diffOpt.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tabla de Distribución Dinámica del Mazo (Pág. 4 del Reglamento Oficial) */}
                <div className="mt-3 bg-zinc-950/80 border border-zinc-850 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <span className="text-zinc-300 font-bold text-xs uppercase font-display tracking-wider">Distribución de cartas según la dificultad seleccionada:</span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-black bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">Oficial Automa</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-zinc-400 leading-normal">
                    {/* Acción Deck Breakdown */}
                    <div className="space-y-1 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-850">
                      <span className="text-zinc-200 font-bold block border-b border-zinc-800 pb-1 mb-1">Mazo de ACCIÓN:</span>
                      {difficulty === 'easy' && (
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          <li>Nivel I: <strong className="text-white">4 Genéricas + 1 Específica</strong></li>
                          <li>Nivel II: <strong className="text-white">4 Genéricas + 1 Específica</strong></li>
                          <li>Nivel III: <strong className="text-white">2 Genéricas + 1 Específica</strong></li>
                          <li className="text-orange-400 font-bold pt-1">Total: 13 cartas</li>
                        </ul>
                      )}
                      {difficulty === 'intermediate' && (
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          <li>Nivel I: <strong className="text-white">3 Genéricas + 1 Específica</strong></li>
                          <li>Nivel II: <strong className="text-white">3 Genéricas + 1 Específica</strong></li>
                          <li>Nivel III: <strong className="text-white">3 Genéricas + 1 Específica</strong></li>
                          <li className="text-orange-400 font-bold pt-1">Total: 12 cartas</li>
                        </ul>
                      )}
                      {difficulty === 'difficult' && (
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          <li>Nivel I: <strong className="text-white">2 Genéricas + 1 Específica</strong></li>
                          <li>Nivel II: <strong className="text-white">2 Genéricas + 1 Específica</strong></li>
                          <li>Nivel III: <strong className="text-white">2 Genéricas + 1 Específica</strong></li>
                          <li className="text-orange-400 font-bold pt-1">Total: 9 cartas</li>
                        </ul>
                      )}
                    </div>

                    {/* Desafío Deck Breakdown */}
                    <div className="space-y-1 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-850">
                      <span className="text-zinc-200 font-bold block border-b border-zinc-800 pb-1 mb-1">Mazo de DESAFÍO:</span>
                      {difficulty === 'easy' && (
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          <li>Nivel I: <strong className="text-white">2 Genéricas + 2 Específicas</strong></li>
                          <li>Nivel II: <strong className="text-white">2 Genéricas + 2 Específicas</strong></li>
                          <li>Nivel III: <strong className="text-white">1 Genérica + 2 Específicas</strong></li>
                          <li className="text-orange-400 font-bold pt-1">Total: 11 cartas</li>
                        </ul>
                      )}
                      {difficulty === 'intermediate' && (
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          <li>Nivel I: <strong className="text-white">3 Genéricas + 2 Específicas</strong></li>
                          <li>Nivel II: <strong className="text-white">3 Genéricas + 2 Específicas</strong></li>
                          <li>Nivel III: <strong className="text-white">0 Genéricas + 2 Específicas</strong></li>
                          <li className="text-orange-400 font-bold pt-1">Total: 12 cartas</li>
                        </ul>
                      )}
                      {difficulty === 'difficult' && (
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          <li>Nivel I: <strong className="text-white">3 Genéricas + 2 Específicas</strong></li>
                          <li>Nivel II: <strong className="text-white">3 Genéricas + 2 Específicas</strong></li>
                          <li>Nivel III: <strong className="text-white">0 Genéricas + 2 Específicas</strong></li>
                          <li className="text-orange-400 font-bold pt-1">Total: 12 cartas</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expansion toggles */}
              <div className="mb-8 bg-zinc-950 p-5 rounded-xl border border-zinc-850">
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-mono mb-3 font-bold">
                  3. Habilitar Módulos y Expansiones Compatibles
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useDicePoker}
                      onChange={(e) => setUseDicePoker(e.target.checked)}
                      className="mt-1 accent-orange-500 rounded border-zinc-800"
                    />
                    <div>
                      <span className="font-display text-xs font-bold text-zinc-200 flex items-center gap-1.5 uppercase">
                        <Dices className="w-3.5 h-3.5 text-orange-500" />
                        Póker de Dados de Taberna
                      </span>
                      <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">Automatiza los rerolls en apuestas basándote en patrones de cartas.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useMutagens}
                      onChange={(e) => setUseMutagens(e.target.checked)}
                      className="mt-1 accent-orange-500 rounded border-zinc-800"
                    />
                    <div>
                      <span className="font-display text-xs font-bold text-zinc-200 flex items-center gap-1.5 uppercase">
                        <Layers className="w-3.5 h-3.5 text-emerald-500" />
                        Mutágenos y Debilidad
                      </span>
                      <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">Permite mutaciones de color y disminuye vida al monstruo rival usando rastros.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useSkellige}
                      onChange={(e) => setUseSkellige(e.target.checked)}
                      className="mt-1 accent-orange-500 rounded border-zinc-800"
                    />
                    <div>
                      <span className="font-display text-xs font-bold text-zinc-200 flex items-center gap-1.5 uppercase">
                        <Anchor className="w-3.5 h-3.5 text-sky-500" />
                        Expansión Skellige
                      </span>
                      <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">Habilita puertos en Skellige e interactúa con la pista de peligro de Dagon.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useLegendaryHunt}
                      onChange={(e) => setUseLegendaryHunt(e.target.checked)}
                      className="mt-1 accent-orange-500 rounded border-zinc-800"
                    />
                    <div>
                      <span className="font-display text-xs font-bold text-zinc-200 flex items-center gap-1.5 uppercase">
                        <SkeletonIcon className="w-3.5 h-3.5 text-red-500" />
                        La Cacería Legendaria
                      </span>
                      <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">Recolecta fichas de Destrucción para debilitar de antemano al jefe legendario.</p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartGame}
                className="w-full btn btn--primary font-display uppercase tracking-wider flex items-center justify-center gap-2"
                id="start-game-btn"
              >
                <Play className="w-5 h-5 fill-current" />
                Iniciar Misión en Solitario
              </button>
            </div>

            {/* Right Column: Special Ability Card Preview */}
            <div className="w-full lg:w-[340px] shrink-0 flex flex-col items-center bg-zinc-950/60 border border-zinc-850 p-6 rounded-2xl gap-4">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-widest text-orange-400 font-mono font-black">
                  Carta de Habilidad Especial
                </span>
                <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                  Cada escuela cuenta con su propio set de efectos "Especial 1/2/3" y bonificaciones de mutágenos.
                </p>
              </div>
              
              {selectedSchoolObj && (
                <div className="transform hover:scale-[1.02] transition-transform duration-300">
                  <SpecialSchoolCardComponent school={selectedSchoolObj} />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 w-full max-w-6xl mx-auto">
            <PlayerAssistantLinks compact />
          </div>
        </main>
      ) : combat.isActive ? (
        /* COMBAT PLAYMAT SIMULATOR VIEW */
        <main className="flex-1 bg-gradient-to-b from-[#0c0c0c] via-red-950/10 to-[#0c0c0c] p-6 flex flex-col md:flex-row gap-6 max-w-7xl w-full mx-auto" id="combat-view">
          {/* Left Column: Combat State and Actions */}
          <div className="flex-1 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-500 shrink-0" />
                    <h2 className="font-display text-lg font-black text-red-400 uppercase tracking-tight">
                      Combate contra: {combat.opponentName}
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-red-400 bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-900/50 uppercase font-bold">
                    Tipo: {combat.opponentType === 'monster' ? 'Monstruo' : 'Brujo'}
                  </span>
                </div>

                {/* Automa Life Deck Counter */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-xs text-zinc-400">
                    <span className="font-bold">Mazo de Vida del Automa (Mazo de Combate):</span>
                    <span className="font-mono text-sm font-black text-white">
                      {combat.combatDeck.length} cartas restantes
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="bg-red-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (combat.combatDeck.length / 12) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Combat Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={handleAutomaAttackTurn}
                    disabled={combat.combatDeck.length === 0}
                    className="py-3 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm font-display uppercase tracking-wider"
                    id="combat-attack-btn"
                  >
                    <Sword className="w-4 h-4 text-white" />
                    Atacar (Automa)
                  </button>

                  <div className="flex gap-2">
                    <input
                      id="damage-input"
                      type="number"
                      placeholder="Daño rival"
                      min="1"
                      className="w-full bg-zinc-950 text-sm border border-zinc-800 rounded-xl px-3 py-2 text-center font-mono text-red-400 focus:outline-none focus:border-red-700 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('damage-input') as HTMLInputElement;
                        if (input) {
                          const val = parseInt(input.value);
                          if (val > 0) {
                            handleReceiveDamage(val);
                            input.value = '';
                          }
                        }
                      }}
                      className="px-4 bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-red-900/40 rounded-xl font-bold transition-colors cursor-pointer text-xs shrink-0 uppercase tracking-wider font-display"
                      id="combat-receive-damage-btn"
                    >
                      Aplicar Daño
                    </button>
                  </div>
                </div>
              </div>

              {/* Combat Logs narrative */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 h-[250px] flex flex-col shadow-lg">
                <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold mb-2.5 block border-b border-zinc-800/80 pb-2">Bitácora de Combate</span>
                <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 font-mono text-[11px]" id="combat-logs-scroller">
                  {combat.fightLog.map((logLine, logIdx) => (
                    <div
                      key={logIdx}
                      className={`border-l-2 pl-2.5 leading-relaxed ${
                        logLine.includes('⚡') || logLine.includes('REACCIÓN')
                          ? 'border-red-500 text-red-300 bg-red-950/10 py-0.5'
                          : logLine.includes('Turno Automa')
                          ? 'border-orange-500 text-orange-300 font-semibold'
                          : 'border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {logLine}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions to conclude Combat */}
            <div className="flex gap-3 pt-4 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => handleEndCombat(true)}
                className="flex-1 py-3 bg-zinc-900 border border-emerald-950 hover:bg-emerald-950/20 text-emerald-400 font-display font-black rounded-xl text-xs transition-all cursor-pointer uppercase tracking-wider"
                id="combat-win-btn"
              >
                ¡El Automa Gana! (Finalizar)
              </button>
              <button
                type="button"
                onClick={() => handleEndCombat(false)}
                className="flex-1 py-3 bg-zinc-900 border border-red-950 hover:bg-red-950/20 text-red-400 font-display font-black rounded-xl text-xs transition-all cursor-pointer uppercase tracking-wider"
                id="combat-lose-btn"
              >
                El Automa Pierde / Se Retira
              </button>
            </div>
          </div>

          {/* Right Column: Visual Active Cards in Combat */}
          <div className="w-full md:w-[340px] shrink-0 flex flex-col items-center gap-6">
            <div className="w-full text-center">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-1 font-bold">Mesa de Combate</span>
            </div>
            {combat.revealedCard ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <WitcherCard card={combat.revealedCard} type="challenge" school={activeSchoolObj} />
                <div className="w-full max-w-[280px] bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center text-xs shadow-lg">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Valores finales en su ataque:</span>
                  <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-sm">
                    <span className="text-red-400 font-black">{combat.damageInflictedThisTurn} Daño</span>
                    <span className="text-sky-400 font-black">+{combat.shieldsActiveThisTurn} Escudo</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[280px] h-64 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col justify-center items-center p-6 text-zinc-650 text-center">
                <Layers className="w-12 h-12 mb-3 stroke-[1.5]" />
                <p className="font-sans text-sm">Haz clic en "Atacar (Automa)" para revelar su primera carta de combate.</p>
              </div>
            )}

            {/* Special Ability Card (Active School) */}
            <div className="w-full border-t border-zinc-800/80 pt-4 flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-orange-400 font-black">Tu Habilidad Especial</span>
              <SpecialSchoolCardComponent 
                school={activeSchoolObj} 
                activeSpecialIndex={
                  combat.revealedCard?.id === 'cha-25' ? 1 :
                  combat.revealedCard?.id === 'cha-26' ? 2 :
                  combat.revealedCard?.id === 'cha-27' ? 3 : null
                }
              />
            </div>
          </div>
        </main>
      ) : (
        /* STANDARD GAMEBOARD COMPANION VIEW */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="game-main">
          
          {/* LEFT COLUMN: AUTOMA STATE BOARD (lg:col-span-4) */}
          <section className="lg:col-span-4 space-y-6" id="automa-board">
            
            {/* Attributes Tracking Widget */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-2.5">
                <h3 className="font-display text-xs font-black text-orange-500 uppercase tracking-wider">Atributos del Automa</h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">MÁX. NIVEL 5 (BLOQUEO)</span>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'attack', label: 'Ataque', color: 'bg-red-500' },
                  { key: 'defense', label: 'Defensa', color: 'bg-blue-500' },
                  { key: 'alchemy', label: 'Alquimia', color: 'bg-emerald-500' },
                  { key: 'special', label: 'Especial', color: 'bg-purple-500' }
                ].map((attr) => {
                  const currentVal = automa.attributes[attr.key as any];
                  const isLocked = lockedAttributes[attr.key];

                  return (
                    <div key={attr.key} className="space-y-1.5" id={`attribute-${attr.key}`}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-sans font-bold text-zinc-300 flex items-center gap-1.5">
                          {attr.label}
                          {isLocked && <span className="text-[9px] bg-orange-500 text-neutral-950 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">Bloqueado</span>}
                        </span>
                        <span className="font-mono font-black text-white">{currentVal} / 5</span>
                      </div>
                      
                      {/* Interactive Visual Level indicators */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 flex gap-1 h-2">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`flex-1 rounded-sm ${
                                lvl <= currentVal
                                  ? isLocked
                                    ? 'bg-orange-500'
                                    : attr.color
                                  : 'bg-zinc-900/60'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Interactive Increments */}
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateAttribute(attr.key as any, -1)}
                            disabled={isLocked && currentVal <= 5}
                            className="p-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 rounded-lg text-zinc-400 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateAttribute(attr.key as any, 1)}
                            className="p-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-400 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Auto-improve Attribute Helpers */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-850/50">
                <button
                  type="button"
                  onClick={() => handleAutoImproveAttribute('lowest')}
                  className="py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-xl text-[10px] font-bold font-display uppercase tracking-wider transition-colors cursor-pointer"
                  title="Mejora el atributo de menor nivel (con desempate por orden de izquierda a derecha)"
                >
                  Subir Menor Atributo
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoImproveAttribute('highest')}
                  className="py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-xl text-[10px] font-bold font-display uppercase tracking-wider transition-colors cursor-pointer"
                  title="Mejora el atributo de mayor nivel (con desempate por orden de izquierda a derecha)"
                >
                  Subir Mayor Atributo
                </button>
              </div>
            </div>

            {/* Inventory Tracker (Items and Trophies) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-2.5">
                <h3 className="font-display text-xs font-black text-orange-500 uppercase tracking-wider">Inventario y Trofeos</h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Mantenimiento</span>
              </div>

              {/* Trophies Counter */}
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850/60 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 block font-display font-bold uppercase tracking-wider">Trofeos Ganados:</span>
                  <span className="text-sm font-black text-orange-400 font-mono tracking-tight">{automa.trophies} / 4</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (automa.trophies > 0) {
                        setAutoma(prev => ({ ...prev, trophies: prev.trophies - 1 }));
                        addLog('Trofeo reducido manualmente.');
                      }
                    }}
                    className="p-2 bg-zinc-900 hover:bg-zinc-850 rounded-lg border border-zinc-800 text-zinc-300 cursor-pointer text-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTrophy}
                    disabled={automa.trophies >= 4}
                    className="p-2 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 rounded-lg border border-orange-500 text-white font-bold cursor-pointer text-xs flex items-center gap-1 font-display uppercase tracking-wider"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Trofeo</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Potions Counter */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850/60 text-center space-y-2">
                  <div className="flex justify-center mb-0.5">
                    <Droplet className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-display font-bold uppercase tracking-wider block">Pociones</span>
                  <span className="text-base font-black font-mono text-zinc-200 block">{automa.potions}</span>
                  <div className="flex justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAutoma(prev => ({ ...prev, potions: Math.max(0, prev.potions - 1) }))}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 text-xs font-black cursor-pointer text-zinc-400"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoma(prev => ({ ...prev, potions: prev.potions + 1 }))}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 text-xs font-black cursor-pointer text-zinc-400"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Bombs Counter */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850/60 text-center space-y-2">
                  <div className="flex justify-center mb-0.5">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-display font-bold uppercase tracking-wider block">Bombas</span>
                  <span className="text-base font-black font-mono text-zinc-200 block">{automa.bombs}</span>
                  <div className="flex justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAutoma(prev => ({ ...prev, bombs: Math.max(0, prev.bombs - 1) }))}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 text-xs font-black cursor-pointer text-zinc-400"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoma(prev => ({ ...prev, bombs: prev.bombs + 1 }))}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 text-xs font-black cursor-pointer text-zinc-400"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Location and Trails Collector */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-2.5">
                <h3 className="font-display text-xs font-black text-orange-500 uppercase tracking-wider">Localización y Rastros</h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Ubicación</span>
              </div>

              {/* Location Selector */}
              <div className="space-y-2 mb-4">
                <label className="text-[10px] text-zinc-500 block font-display font-bold uppercase tracking-wider">Localización actual en el Tablero:</label>
                <select
                  value={automa.location}
                  onChange={(e) => setAutoma(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-orange-500 font-sans font-semibold cursor-pointer"
                >
                  {DEFAULT_CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Trail Grid */}
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-500 block font-display font-bold uppercase tracking-wider">Rastros de Monstruos:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'red', label: 'Rojo', color: 'border-red-950 text-red-400 bg-red-950/25' },
                    { key: 'blue', label: 'Azul', color: 'border-blue-950 text-blue-400 bg-blue-950/25' },
                    { key: 'green', label: 'Verde', color: 'border-emerald-950 text-emerald-400 bg-emerald-950/25' },
                    { key: 'yellow', label: 'Amarillo', color: 'border-amber-950 text-amber-500 bg-amber-950/15' }
                  ].map((trail) => {
                    const count = (automa.trails as any)[trail.key];
                    return (
                      <div key={trail.key} className={`border p-2 rounded-xl text-center space-y-1.5 ${trail.color}`}>
                        <span className="text-[9px] uppercase font-mono tracking-wider font-bold">{trail.label}</span>
                        <div className="text-sm font-black font-mono">{count}</div>
                        <div className="flex justify-center gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => setAutoma(prev => ({
                              ...prev,
                              trails: {
                                ...prev.trails,
                                [trail.key]: Math.max(0, count - 1)
                              }
                            }))}
                            className="px-2 py-0.5 bg-zinc-900/60 border border-zinc-800 rounded-md hover:border-zinc-700 text-[10px] font-black cursor-pointer text-zinc-300"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => setAutoma(prev => ({
                              ...prev,
                              trails: {
                                ...prev.trails,
                                [trail.key]: count + 1
                              }
                            }))}
                            className="px-2 py-0.5 bg-zinc-900/60 border border-zinc-800 rounded-md hover:border-zinc-700 text-[10px] font-black cursor-pointer text-zinc-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* MAIN INTERACTIVE AREA (lg:col-span-8) */}
          <section className="lg:col-span-8 flex flex-col gap-6" id="interaction-dashboard">
            
            {/* Interactive Module Tab Headers */}
            <div className="flex flex-wrap border-b border-zinc-850 gap-1.5" id="tab-nav">
              {[
                { id: 'assistant', label: 'Tu partida', icon: User },
                { id: 'turn', label: 'Turno del Automa', icon: Play },
                useDicePoker ? { id: 'poker', label: 'Póker de Dados', icon: Dice5 } : null,
                (useMutagens || useSkellige || useLegendaryHunt) ? { id: 'expansions', label: 'Expansiones', icon: Layers } : null,
                { id: 'rules', label: 'Reglamento V1.4', icon: BookOpen }
              ]
                .filter(Boolean)
                .map((tab) => {
                  const Icon = (tab as any).icon;
                  const isActive = currentTab === (tab as any).id;
                  return (
                    <button
                      key={(tab as any).id}
                      type="button"
                      onClick={() => setCurrentTab((tab as any).id)}
                      className={`px-4 py-2.5 font-display text-xs font-black rounded-t-2xl border-t border-x transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                        isActive
                          ? 'bg-zinc-900 border-zinc-800 text-orange-400 font-bold border-b-zinc-900'
                          : 'bg-zinc-950 border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                      id={`tab-btn-${(tab as any).id}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{(tab as any).label}</span>
                    </button>
                  );
                })}
            </div>

            {currentTab === 'assistant' && (
              <div id="assistant-tab-content">
                <PlayerAssistantLinks />
              </div>
            )}

            {/* TAB CONTENT: TURN SIMULATOR */}
            {currentTab === 'turn' && (
              <div className="space-y-6" id="turn-tab-content">
                
                {/* Active Card / Phase Play Mat */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Play Area: Decks overview and active actions */}
                    <div className="flex-1 space-y-4">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Compass className="w-5 h-5 text-orange-500 shrink-0" />
                          <h4 className="font-display text-sm font-black text-white uppercase tracking-wider">Turno del Automa: Fase {turnPhase}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">Mazo de Acción: {actionDeck.length} cartas restantes</span>
                      </div>

                      {turnPhase === 1 && (
                        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-850/60 text-center space-y-4" id="phase-1-playmat">
                          <p className="font-sans text-sm text-zinc-400 leading-relaxed">
                            El turno del Automa comienza robando su carta superior para definir su movimiento, destino, bonos y descarte de mercado.
                          </p>
                          <button
                            type="button"
                            onClick={drawActionCard}
                            className="py-3 px-6 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase rounded-xl shadow-lg flex items-center justify-center gap-2 mx-auto transition-all cursor-pointer font-display tracking-wider text-xs"
                            id="draw-action-btn"
                          >
                            <Play className="w-4 h-4 fill-current animate-pulse" />
                            Revelar Carta de Acción
                          </button>
                        </div>
                      )}

                      {turnPhase === 2 && activeActionCard && (
                        <div className="space-y-4" id="phase-2-playmat">
                          {/* Guide panel */}
                          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850/60 space-y-4">
                            <h5 className="text-[10px] uppercase font-mono tracking-wider text-orange-400 font-bold">Paso 1: Movimiento de la Carta</h5>
                            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                              Desplaza la miniatura del Automa en el tablero físico <strong className="text-white">{activeActionCard.movement} espacios</strong> hacia <strong className="text-white">{activeActionCard.destination}</strong> siguiendo la ruta más corta posible.
                            </p>

                            <h5 className="text-[10px] uppercase font-mono tracking-wider text-orange-400 font-bold pt-2 border-t border-zinc-850/50">Paso 2: Bonificaciones</h5>
                            <p className="text-xs text-zinc-300 leading-normal font-sans">
                              Sube los niveles de los atributos indicados y añade pociones/bombas/rastros a la ficha de datos del Automa.
                            </p>

                            {!bonusApplied ? (
                              <button
                                type="button"
                                onClick={applyActionCardBonuses}
                                className="w-full py-2.5 bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-colors cursor-pointer"
                                id="apply-bonus-btn"
                              >
                                Aplicar Bonificaciones Automáticamente
                              </button>
                            ) : (
                              <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 p-2.5 rounded-xl text-xs font-sans flex items-center justify-center gap-1.5 font-bold">
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                <span>Bonificaciones aplicadas con éxito en su tablero.</span>
                              </div>
                            )}

                            <h5 className="text-[10px] uppercase font-mono tracking-wider text-orange-400 font-bold pt-3 border-t border-zinc-850/50">Paso 3: Fase Principal (Elige una opción)</h5>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                              {/* Option A: Meditate */}
                              <button
                                type="button"
                                onClick={handleMeditate}
                                className="p-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 hover:border-orange-500/50 text-left space-y-1.5 transition-all cursor-pointer"
                                id="option-meditate-btn"
                              >
                                <span className="font-display text-xs font-black text-orange-400 block uppercase tracking-wider">Opción A: Meditar</span>
                                <span className="text-[10px] text-zinc-400 block leading-relaxed font-sans">Si posee un Atributo al nivel 5, gana un Trofeo y añade carta Nivel 3.</span>
                              </button>

                              {/* Option B: Combat */}
                              <button
                                type="button"
                                onClick={() => handleStartCombat('monster', 'Gryphon')}
                                className="p-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 hover:border-red-900/50 text-left space-y-1.5 transition-all cursor-pointer"
                                id="option-combat-btn"
                              >
                                <span className="font-display text-xs font-black text-red-400 block uppercase tracking-wider">Opción B: Combatir</span>
                                <span className="text-[10px] text-zinc-400 block leading-relaxed font-sans">Si hay monstruo/rival y cumple requisito: {activeActionCard.combatRequirement}.</span>
                              </button>

                              {/* Option C: Explore */}
                              <button
                                type="button"
                                onClick={handleExplore}
                                className="p-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 hover:border-sky-500/50 text-left space-y-1.5 transition-all cursor-pointer"
                                id="option-explore-btn"
                              >
                                <span className="font-display text-xs font-black text-sky-400 block uppercase tracking-wider">Opción C: Explorar</span>
                                <span className="text-[10px] text-zinc-400 block leading-relaxed font-sans">Turno pasivo. No ocurre nada narrativo. Procede a limpiar el mercado.</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {turnPhase === 3 && activeActionCard && (
                        <div className="space-y-4" id="phase-3-playmat">
                          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850/60 space-y-4">
                            <h5 className="text-[10px] uppercase font-mono tracking-wider text-red-400 font-bold flex items-center gap-1.5">
                              <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                              Mantenimiento del Mercado de Cartas
                            </h5>
                            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                              Retira obligatoriamente las cartas en el mercado de acción (tablero físico general) correspondientes a las posiciones:
                            </p>

                            <div className="flex gap-2.5 justify-center py-2">
                              {activeActionCard.marketDiscards.map((pos) => (
                                <div key={pos} className="bg-red-950/40 border-2 border-red-900/60 text-red-400 px-5 py-3 rounded-xl font-mono text-base font-black flex flex-col items-center justify-center shadow-lg">
                                  <span>Posición {pos}</span>
                                  <span className="text-[9px] font-mono uppercase text-zinc-500 mt-0.5 font-bold">Carta</span>
                                </div>
                              ))}
                            </div>

                            <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                              *Cuenta de izquierda a derecha (las más baratas cuestan 0 monedas, las más caras 2 monedas). Desplaza el resto de cartas hacia la izquierda para rellenar los huecos y repón desde el mazo normal por la derecha.
                            </p>

                            <button
                              type="button"
                              onClick={handleEndTurn}
                              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-orange-400 border border-orange-500/30 rounded-xl font-black font-display transition-all cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider mt-3 shadow-md"
                              id="end-turn-btn"
                            >
                              <span>Terminar Turno del Automa</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right column of card simulator: physical looking active card */}
                    <div className="w-full md:w-[280px] shrink-0 flex flex-col justify-center items-center bg-zinc-950/30 p-4 rounded-2xl border border-zinc-850/50 shadow-inner">
                      {activeActionCard ? (
                        <div className="space-y-2">
                          <WitcherCard card={activeActionCard} type="action" />
                          <span className="text-[9px] font-mono text-zinc-500 uppercase block text-center mt-1.5 font-bold">ID Carta: {activeActionCard.id}</span>
                        </div>
                      ) : (
                        <div className="w-full h-80 border-2 border-dashed border-zinc-850 rounded-2xl flex flex-col justify-center items-center p-6 text-zinc-600 text-center">
                          <Layers className="w-12 h-12 mb-3 stroke-[1.5]" />
                          <p className="font-sans text-sm font-semibold">No hay carta activa</p>
                          <span className="text-[10px] text-zinc-500 font-sans mt-1.5 leading-relaxed">Robar una carta de Acción para iniciar la secuencia.</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Notifications & System Logs Dashboard */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3.5 border-b border-zinc-800 pb-2.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold block">Registro de Eventos y Combate</span>
                    <button
                      type="button"
                      onClick={() => setLogs(['Bitácora reiniciada.'])}
                      className="text-[9px] font-mono uppercase text-zinc-500 hover:text-zinc-300 font-bold cursor-pointer"
                    >
                      Limpiar
                    </button>
                  </div>
                  <div className="max-h-[160px] overflow-y-auto space-y-1.5 font-mono text-[11px] text-zinc-400 pr-1">
                    {logs.map((log, idx) => (
                      <div key={idx} className="border-b border-zinc-950/40 pb-1.5 leading-relaxed flex items-start">
                        <span className="text-orange-500 shrink-0 select-none mr-2">»</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: DICE POKER */}
            {currentTab === 'poker' && useDicePoker && (
              <div id="poker-tab-content">
                <DicePoker challengeDeck={challengeDeck} onDrawChallenge={handleDrawPokerCard} />
              </div>
            )}

            {/* TAB CONTENT: EXPANSIONS MODULES */}
            {currentTab === 'expansions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="expansions-tab-content">
                
                {/* Module A: Mutagens and weaknesses */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h4 className="font-display text-xs font-black text-orange-500 uppercase tracking-wider border-b border-zinc-800/80 pb-2">
                    Módulo: Mutágenos y Debilidad (Combate)
                  </h4>

                  {/* Mutagens selection */}
                  {useMutagens ? (
                    <div className="space-y-3">
                      <span className="text-[10px] text-zinc-500 font-display font-bold uppercase tracking-wider block">Mutágenos Adquiridos por el Automa:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'red', label: 'Mutágeno Rojo', color: 'border-red-800 bg-red-950/25 text-red-400 hover:border-red-600' },
                          { key: 'blue', label: 'Mutágeno Azul', color: 'border-blue-800 bg-blue-950/25 text-blue-400 hover:border-blue-600' },
                          { key: 'green', label: 'Mutágeno Verde', color: 'border-emerald-800 bg-emerald-950/25 text-emerald-400 hover:border-emerald-600' }
                        ].map((mut) => {
                          const hasMut = automa.mutagens.includes(mut.key);
                          return (
                            <button
                              key={mut.key}
                              type="button"
                              onClick={() => {
                                setAutoma(prev => {
                                  const updated = prev.mutagens.includes(mut.key)
                                    ? prev.mutagens.filter(m => m !== mut.key)
                                    : [...prev.mutagens, mut.key];
                                  return { ...prev, mutagens: updated };
                                });
                              }}
                              className={`p-2.5 rounded-xl border text-center font-display text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                                hasMut ? `${mut.color} border-2` : 'bg-zinc-950 border-zinc-850 text-zinc-650'
                              }`}
                            >
                              {mut.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Weaknesses tracking */}
                      <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850/60 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-zinc-300 font-bold font-sans">Nivel de Debilidad del Enemigo:</span>
                          <span className="text-sm font-mono font-black text-orange-400">{automa.weaknesses} / 3</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setAutoma(prev => ({ ...prev, weaknesses: Math.max(0, prev.weaknesses - 1) }))}
                            className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold cursor-pointer text-zinc-300 hover:bg-zinc-850"
                          >
                            Reducir
                          </button>
                          <button
                            type="button"
                            onClick={() => setAutoma(prev => ({ ...prev, weaknesses: Math.min(3, prev.weaknesses + 1) }))}
                            className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold cursor-pointer text-zinc-300 hover:bg-zinc-850"
                          >
                            Aumentar
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-normal font-sans pt-1">
                          *Al empezar un combate contra un monstruo del que tengas rastros, gasta estas fichas de debilidad para **descartar cartas de vida iniciales** al mazo del monstruo (reduciendo su salud de inmediato).
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-zinc-650 font-sans text-xs italic">
                      Módulo desactivado. Actívalo en la pantalla de preparación.
                    </div>
                  )}
                </div>

                {/* Module B: Skellige & Legendary Hunt */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h4 className="font-display text-xs font-black text-orange-500 uppercase tracking-wider border-b border-zinc-800/80 pb-2">
                    Módulo: Skellige y Legendary Hunt
                  </h4>

                  {/* Skellige Islands Expansion */}
                  {useSkellige && (
                    <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850/60 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-300 font-bold font-sans flex items-center gap-1">
                          <Anchor className="w-3.5 h-3.5 text-sky-400" />
                          Rastro de Dagon (Peligro Marino):
                        </span>
                        <span className="text-sm font-mono font-black text-sky-400">{automa.dagonTrack} / 6</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAutoma(prev => ({ ...prev, dagonTrack: Math.max(0, prev.dagonTrack - 1) }))}
                          className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold cursor-pointer text-zinc-300 hover:bg-zinc-850"
                        >
                          Reducir
                        </button>
                        <button
                          type="button"
                          onClick={() => setAutoma(prev => ({ ...prev, dagonTrack: Math.min(6, prev.dagonTrack + 1) }))}
                          className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold cursor-pointer text-zinc-300 hover:bg-zinc-850"
                        >
                          Avanzar Dagon
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-normal font-sans pt-1">
                        *El Automa avanza en este track cuando se revela el icono de ancla/peligro en sus cartas de Acción de Skellige.
                      </p>
                    </div>
                  )}

                  {/* Legendary Hunt Expansion */}
                  {useLegendaryHunt && (
                    <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850/60 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-300 font-bold font-sans flex items-center gap-1">
                          <SkeletonIcon className="w-3.5 h-3.5 text-red-500" />
                          Fichas de Destrucción Recolectadas:
                        </span>
                        <span className="text-sm font-mono font-black text-red-400">{automa.destructionTokens}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAutoma(prev => ({ ...prev, destructionTokens: Math.max(0, prev.destructionTokens - 1) }))}
                          className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold cursor-pointer text-zinc-300 hover:bg-zinc-850"
                        >
                          Reducir
                        </button>
                        <button
                          type="button"
                          onClick={() => setAutoma(prev => ({ ...prev, destructionTokens: prev.destructionTokens + 1 }))}
                          className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold cursor-pointer text-zinc-300 hover:bg-zinc-850"
                        >
                          Recolectar
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-normal font-sans pt-1">
                        *Cada ficha de Destrucción recolectada resta 1 carta al mazo de vida inicial del Monstruo Legendario durante la batalla final del mapa.
                      </p>
                    </div>
                  )}

                  {!useSkellige && !useLegendaryHunt && (
                    <div className="text-center py-6 text-zinc-650 font-sans text-xs italic">
                      Módulos desactivados. Actívalos en la pantalla de preparación.
                    </div>
                  )}
                </div>

                {/* Active School Special Card Reference */}
                <div className="md:col-span-2 bg-zinc-950/40 border border-zinc-850 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 max-w-md">
                    <h4 className="font-display text-xs font-black text-orange-500 uppercase tracking-wider">
                      Carta de Habilidad Especial Activa
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      Esta es la carta especial oficial correspondiente a la <strong>{activeSchoolObj.name}</strong> seleccionada para esta partida. Consulta aquí sus habilidades "Especial 1, 2 y 3" y los mutágenos en cualquier momento del juego.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <SpecialSchoolCardComponent school={activeSchoolObj} />
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: RULES REFERENCE */}
            {currentTab === 'rules' && (
              <div id="rules-tab-content">
                <RulesReference />
              </div>
            )}

          </section>

        </main>
      )}

      <footer className="automa-footer" id="game-footer-element">
        Automa V1.4 — reglamento no oficial de la comunidad
      </footer>
      </div>
    </div>
  );
}
