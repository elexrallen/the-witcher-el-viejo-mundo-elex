/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WitcherIcon } from './WitcherIcon';
import { ChallengeCard } from '../types';
import { GENERIC_CHALLENGE_CARDS } from '../data/cards';

interface DicePokerProps {
  challengeDeck: ChallengeCard[];
  onDrawChallenge: () => ChallengeCard | null;
}

export default function DicePoker({ challengeDeck, onDrawChallenge }: DicePokerProps) {
  const [dice, setDice] = useState<number[]>([1, 1, 1, 1, 1]);
  const [keptIndices, setKeptIndices] = useState<boolean[]>([false, false, false, false, false]);
  const [pokerStep, setPokerStep] = useState<'idle' | 'rolled_first' | 'card_drawn' | 'rolled_second'>('idle');
  const [drawnCard, setDrawnCard] = useState<ChallengeCard | null>(null);
  const [pokerPatternExplanation, setPokerPatternExplanation] = useState<string>('');

  const rollDice = () => {
    const newDice = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1);
    setDice(newDice);
    setKeptIndices([false, false, false, false, false]);
    setPokerStep('rolled_first');
    setDrawnCard(null);
    setPokerPatternExplanation('');
  };

  const handleDrawDecisionCard = () => {
    // Draw a card from challenge deck, or get a random generic one if none available
    let card = onDrawChallenge();
    if (!card) {
      // fallback
      const randomIndex = Math.floor(Math.random() * GENERIC_CHALLENGE_CARDS.length);
      card = GENERIC_CHALLENGE_CARDS[randomIndex];
    }

    setDrawnCard(card);
    setPokerStep('card_drawn');

    // Automatically analyze the dice according to the card's poker pattern
    const pattern = card.pokerPattern.toLowerCase();
    const counts = Array(7).fill(0);
    dice.forEach(d => counts[d]++);

    const newKept = [false, false, false, false, false];
    let explanation = '';

    if (pattern.includes('parejas') || pattern.includes('pareja')) {
      // Keep any pairs or multiple pairs
      explanation = 'La IA mantiene parejas o valores duplicados.';
      const pairs: number[] = [];
      for (let i = 1; i <= 6; i++) {
        if (counts[i] >= 2) {
          pairs.push(i);
        }
      }
      dice.forEach((val, index) => {
        if (pairs.includes(val)) {
          newKept[index] = true;
        }
      });
    } else if (pattern.includes('valores altos') || pattern.includes('4+')) {
      // Keep dice >= 4
      explanation = 'La IA mantiene dados con valores altos (4, 5 o 6).';
      dice.forEach((val, index) => {
        if (val >= 4) {
          newKept[index] = true;
        }
      });
    } else if (pattern.includes('tríos') || pattern.includes('trío')) {
      // Keep trio or double pair
      explanation = 'La IA mantiene tríos, o la pareja más alta si no hay trío.';
      let bestValue = -1;
      let hasTrioOrBetter = false;

      // check trios first
      for (let i = 6; i >= 1; i--) {
        if (counts[i] >= 3) {
          bestValue = i;
          hasTrioOrBetter = true;
          break;
        }
      }

      if (!hasTrioOrBetter) {
        // fall back to highest pair
        for (let i = 6; i >= 1; i--) {
          if (counts[i] >= 2) {
            bestValue = i;
            break;
          }
        }
      }

      if (bestValue !== -1) {
        dice.forEach((val, index) => {
          if (val === bestValue) {
            newKept[index] = true;
          }
        });
      }
    } else if (pattern.includes('consecutivos') || pattern.includes('escalera')) {
      // Keep unique consecutive values (to build street)
      explanation = 'La IA mantiene valores consecutivos únicos para intentar Escalera.';
      const seen = new Set<number>();
      dice.forEach((val, index) => {
        if (!seen.has(val)) {
          seen.add(val);
          newKept[index] = true;
        }
      });
    } else {
      // Relanzar todo excepto el valor más alto
      explanation = 'La IA relanza todo excepto el dado con el valor más alto.';
      const maxVal = Math.max(...dice);
      let markedMax = false;
      dice.forEach((val, index) => {
        if (val === maxVal && !markedMax) {
          newKept[index] = true;
          markedMax = true;
        }
      });
    }

    setKeptIndices(newKept);
    setPokerPatternExplanation(explanation);
  };

  const handleSecondRoll = () => {
    const finalDice = [...dice];
    for (let i = 0; i < 5; i++) {
      if (!keptIndices[i]) {
        finalDice[i] = Math.floor(Math.random() * 6) + 1;
      }
    }
    setDice(finalDice);
    setPokerStep('rolled_second');
  };

  const renderDiceFace = (val: number, index: number, isKept: boolean) => {
    const dots: { [key: number]: number[][] } = {
      1: [[50, 50]],
      2: [[25, 25], [75, 75]],
      3: [[25, 25], [50, 50], [75, 75]],
      4: [[25, 25], [25, 75], [75, 25], [75, 75]],
      5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
      6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]],
    };

    const currentDots = dots[val] || [];

    return (
      <div
        key={index}
        onClick={() => {
          if (pokerStep === 'card_drawn') {
            const copy = [...keptIndices];
            copy[index] = !copy[index];
            setKeptIndices(copy);
          }
        }}
        className={`w-14 h-14 rounded-xl border-2 flex flex-col justify-between p-1.5 cursor-pointer relative transition-all duration-200 select-none ${
          isKept
            ? 'bg-amber-950 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)] text-amber-300 transform scale-105'
            : 'bg-neutral-900 border-neutral-750 hover:border-neutral-500 text-neutral-300'
        }`}
        id={`die-${index}`}
        title={pokerStep === 'card_drawn' ? "Haz clic para cambiar si se conserva o se relanza" : ""}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          {currentDots.map(([cx, cy], dotIdx) => (
            <circle key={dotIdx} cx={cx} cy={cy} r="8" />
          ))}
        </svg>
        {isKept && (
          <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-neutral-950 rounded-full p-0.5" style={{ fontSize: '7px' }}>
            <WitcherIcon name="check" size={12} className="text-neutral-950" />
          </div>
        )}
      </div>
    );
  };

  // Evaluate the hand name
  const evaluateHand = (values: number[]) => {
    const counts = Array(7).fill(0);
    values.forEach(v => counts[v]++);
    
    let pairs = 0;
    let trios = 0;
    let poker = false;
    let repoker = false;
    let straightSmall = false; // 1-2-3-4-5
    let straightBig = false;   // 2-3-4-5-6

    for (let i = 1; i <= 6; i++) {
      if (counts[i] === 5) repoker = true;
      if (counts[i] === 4) poker = true;
      if (counts[i] === 3) trios++;
      if (counts[i] === 2) pairs++;
    }

    if (counts[1] === 1 && counts[2] === 1 && counts[3] === 1 && counts[4] === 1 && counts[5] === 1) {
      straightSmall = true;
    }
    if (counts[2] === 1 && counts[3] === 1 && counts[4] === 1 && counts[5] === 1 && counts[6] === 1) {
      straightBig = true;
    }

    if (repoker) return { name: "Repóker (5 iguales)", score: 8 };
    if (poker) return { name: "Póker (4 iguales)", score: 7 };
    if (trios === 1 && pairs === 1) return { name: "Full House (Trío + Pareja)", score: 6 };
    if (straightBig) return { name: "Escalera Mayor (2-3-4-5-6)", score: 5 };
    if (straightSmall) return { name: "Escalera Menor (1-2-3-4-5)", score: 4 };
    if (trios === 1) return { name: "Trío (3 iguales)", score: 3 };
    if (pairs === 2) return { name: "Doble Pareja", score: 2 };
    if (pairs === 1) return { name: "Pareja", score: 1 };
    
    const maxVal = Math.max(...values);
    return { name: `Dado Alto (${maxVal})`, score: 0 };
  };

  const currentHand = evaluateHand(dice);

  return (
    <div className="bg-[#15121a] border border-purple-900/20 rounded-2xl p-5 text-neutral-200 shadow-2xl relative overflow-hidden" id="dice-poker-container">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-indigo-500"></div>
      <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-3">
        <h3 className="font-display text-base font-bold text-purple-400 flex items-center gap-2">
          <span>Póker de Dados de Taberna (Automa)</span>
        </h3>
        <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 border border-purple-900/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Póker de Dados</span>
      </div>

      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col items-center justify-center min-h-[140px] relative">
        <div className="flex gap-3 mb-4">
          {dice.map((val, idx) => renderDiceFace(val, idx, keptIndices[idx]))}
        </div>

        <div className="text-center font-sans">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Puntuación actual del Automa:</span>
          <div className="text-base font-display font-black text-purple-300 mt-1">{currentHand.name}</div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {pokerStep === 'idle' && (
          <button
            type="button"
            onClick={rollDice}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm font-display tracking-wide shadow-lg shadow-purple-900/20"
            id="roll-first-btn"
          >
            <WitcherIcon name="play" size={16} />
            Lanzar Primer Tiro (5 Dados)
          </button>
        )}

        {pokerStep === 'rolled_first' && (
          <button
            type="button"
            onClick={handleDrawDecisionCard}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm font-display tracking-wide shadow-lg shadow-amber-900/20"
            id="draw-poker-card-btn"
          >
            <WitcherIcon name="refresh" size={16} />
            Robar Carta de Decisión para Relanzar
          </button>
        )}

        {pokerStep === 'card_drawn' && drawnCard && (
          <div className="bg-purple-950/20 border border-purple-900/40 p-3.5 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-purple-200 font-bold uppercase tracking-tight font-display text-xs">
              <WitcherIcon name="info" size={16} className="text-purple-400" />
              <span>Instrucción del Mazo: "{drawnCard.pokerPattern}"</span>
            </div>
            <p className="text-zinc-300 leading-normal">{pokerPatternExplanation}</p>
            <p className="text-zinc-500 text-[10px] leading-relaxed">
              *Los dados marcados con el icono de check dorado se mantendrán. Puedes hacer clic en los dados para cambiar manualmente esta decisión si las reglas físicas del tablero indican otra preferencia.
            </p>
            <button
              type="button"
              onClick={handleSecondRoll}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 mt-2 transition-colors cursor-pointer text-sm font-display tracking-wide"
              id="roll-second-btn"
            >
              <WitcherIcon name="refresh" size={16} className="witcher-icon--spin" />
              Relanzar Dados Libres (Tirada Final)
            </button>
          </div>
        )}

        {pokerStep === 'rolled_second' && (
          <div className="space-y-2">
            <div className="bg-purple-950/20 border border-purple-900/40 p-3 rounded-xl text-center text-xs text-purple-200">
              ¡Tirada Final completada! El Automa ha obtenido un <strong>{currentHand.name}</strong>. Compara este resultado con tu propia tirada para decidir quién gana la apuesta de oro.
            </div>
            <button
              type="button"
              onClick={rollDice}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-250 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
              id="reset-poker-btn"
            >
              <WitcherIcon name="refresh" size={14} />
              Nueva Partida de Dados
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
