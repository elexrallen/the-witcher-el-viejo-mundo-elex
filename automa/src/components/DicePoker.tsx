/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WitcherIcon } from './WitcherIcon';
import { ChallengeCard } from '../types';
import { CHALLENGE_CARDS } from '../data/cards';
import { applyPokerPattern } from '../utils/pokerPattern';

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
    if (!card && CHALLENGE_CARDS.length > 0) {
      const randomIndex = Math.floor(Math.random() * CHALLENGE_CARDS.length);
      card = CHALLENGE_CARDS[randomIndex];
    }

    setDrawnCard(card);
    setPokerStep('card_drawn');

    const { kept, explanation } = applyPokerPattern(dice, card);
    setKeptIndices(kept);
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
      <button
        key={index}
        type="button"
        disabled={pokerStep !== 'card_drawn'}
        onClick={() => {
          if (pokerStep === 'card_drawn') {
            const copy = [...keptIndices];
            copy[index] = !copy[index];
            setKeptIndices(copy);
          }
        }}
        className={`dice-poker__die ${isKept ? 'dice-poker__die--kept' : ''}`}
        id={`die-${index}`}
        title={pokerStep === 'card_drawn' ? 'Toca para conservar o relanzar este dado' : undefined}
        aria-pressed={pokerStep === 'card_drawn' ? isKept : undefined}
      >
        <svg viewBox="0 0 100 100" className="dice-poker__die-face" aria-hidden>
          {currentDots.map(([cx, cy], dotIdx) => (
            <circle key={dotIdx} cx={cx} cy={cy} r="8" />
          ))}
        </svg>
        {isKept && (
          <span className="dice-poker__die-check" aria-hidden>
            <WitcherIcon name="check" size={10} className="text-neutral-950" />
          </span>
        )}
      </button>
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
    <div className="dice-poker" id="dice-poker-container">
      <div className="dice-poker__accent" aria-hidden />

      <div className="dice-poker__header">
        <h3 className="dice-poker__title">
          <span className="sm:hidden">Póker de Taberna</span>
          <span className="hidden sm:inline">Póker de Dados de Taberna (Automa)</span>
        </h3>
        <span className="dice-poker__badge">Póker de Dados</span>
      </div>

      <div className="dice-poker__arena">
        <div className="dice-poker__dice-grid">
          {dice.map((val, idx) => renderDiceFace(val, idx, keptIndices[idx]))}
        </div>

        <div className="dice-poker__score">
          <span className="dice-poker__score-label">Puntuación actual del Automa</span>
          <div className="dice-poker__score-value">{currentHand.name}</div>
        </div>
      </div>

      <div className="dice-poker__actions">
        {pokerStep === 'idle' && (
          <button
            type="button"
            onClick={rollDice}
            className="dice-poker__btn dice-poker__btn--primary"
            id="roll-first-btn"
          >
            <WitcherIcon name="play" size={16} />
            <span className="sm:hidden">Primer tiro (5 dados)</span>
            <span className="hidden sm:inline">Lanzar Primer Tiro (5 Dados)</span>
          </button>
        )}

        {pokerStep === 'rolled_first' && (
          <button
            type="button"
            onClick={handleDrawDecisionCard}
            className="dice-poker__btn dice-poker__btn--amber"
            id="draw-poker-card-btn"
          >
            <WitcherIcon name="refresh" size={16} />
            <span className="sm:hidden">Robar carta de decisión</span>
            <span className="hidden sm:inline">Robar Carta de Decisión para Relanzar</span>
          </button>
        )}

        {pokerStep === 'card_drawn' && drawnCard && (
          <div className="dice-poker__card-panel">
            <div className="dice-poker__card-heading">
              <WitcherIcon name="info" size={16} className="text-purple-400 shrink-0" />
              <span>Instrucción: &ldquo;{drawnCard.pokerPattern}&rdquo;</span>
            </div>
            <p className="dice-poker__card-text">{pokerPatternExplanation}</p>
            <p className="dice-poker__card-hint">
              Los dados marcados se mantienen. Tócalos para ajustar manualmente si hace falta.
            </p>
            {drawnCard.playerMonsterAttack && (
              <p className="dice-poker__card-hint text-sky-400">
                Si el jugador combate un monstruo que ataca: <strong>{drawnCard.playerMonsterAttack}</strong>.
              </p>
            )}
            <button
              type="button"
              onClick={handleSecondRoll}
              className="dice-poker__btn dice-poker__btn--primary"
              id="roll-second-btn"
            >
              <WitcherIcon name="refresh" size={16} className="witcher-icon--spin" />
              <span className="sm:hidden">Tirada final</span>
              <span className="hidden sm:inline">Relanzar Dados Libres (Tirada Final)</span>
            </button>
          </div>
        )}

        {pokerStep === 'rolled_second' && (
          <div className="dice-poker__result">
            <div className="dice-poker__result-text">
              Tirada final: <strong>{currentHand.name}</strong>. Compara con tu tirada para la apuesta de oro.
            </div>
            <button
              type="button"
              onClick={rollDice}
              className="dice-poker__btn dice-poker__btn--ghost"
              id="reset-poker-btn"
            >
              <WitcherIcon name="refresh" size={14} />
              Nueva partida de dados
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
