/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActionCard, ChallengeCard, WitcherSchool } from '../types';
import { formatMovementPM } from '../utils/actionCard';
import { WitcherIcon, SchoolIcon } from './WitcherIcon';

interface WitcherCardProps {
  card: ActionCard | ChallengeCard;
  type: 'action' | 'challenge';
  school?: WitcherSchool;
  compact?: boolean;
}

export default function WitcherCard({ card, type, school, compact = false }: WitcherCardProps) {
  const getLevelBadgeColor = (lvl: string | number) => {
    switch (lvl) {
      case 'generic': return 'bg-neutral-850 text-neutral-400 border-neutral-700';
      case 1: return 'bg-amber-900/40 text-amber-500 border-amber-850';
      case 2: return 'bg-slate-700/40 text-slate-300 border-slate-650';
      case 3: return 'bg-amber-500/20 text-amber-400 border-amber-700';
      default: return 'bg-neutral-800 text-neutral-400';
    }
  };

  const getLevelLabel = (lvl: string | number) => {
    if (lvl === 'generic') return 'Genérica';
    return `Nivel ${lvl}`;
  };

  const renderSchoolIcon = (schoolId?: string, size = 16) => {
    if (!schoolId) return <WitcherIcon name="magic" size={size} className="text-amber-500" />;
    return <SchoolIcon school={schoolId} size={size} />;
  };

  if (type === 'action') {
    const actCard = card as ActionCard;
    return (
      <div
        className={`w-full max-w-[280px] bg-[#1a1a1a] border-2 rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 ${
          actCard.level === 3 ? 'border-orange-600 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'border-zinc-800'
        }`}
        id={`action-card-${actCard.id}`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 to-amber-500"></div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getLevelBadgeColor(actCard.level)}`}>
            {getLevelLabel(actCard.level)}
          </span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Mazo Acción</span>
        </div>

        {/* Travel Destination & Movement */}
        <div className="bg-zinc-950 rounded-xl p-3 mb-3 border border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WitcherIcon name="compass" size={22} className="text-orange-500 shrink-0" />
            <div>
              <div className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Viajar hacia</div>
              <div className="text-sm font-display font-bold text-white tracking-tight">{actCard.destination}</div>
            </div>
          </div>
          <div className="bg-orange-600 text-white px-2.5 py-1 rounded-lg flex flex-col items-center justify-center shrink-0 min-w-[36px]">
            <span className="text-sm font-mono font-black leading-none">{formatMovementPM(actCard.movement)}</span>
            <span className="text-[8px] font-mono uppercase font-bold leading-none mt-0.5">PM</span>
          </div>
        </div>

        {/* Card Upgrades / Icons section */}
        <div className="space-y-2 mb-3">
          <div className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Bonos de Llegada</div>
          <div className="grid grid-cols-2 gap-1.5">
            {/* Attribute Upgrade */}
            <div className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1.5 ${
              actCard.attributeBonus 
                ? 'bg-zinc-900 border-orange-900/30 text-orange-400 font-semibold' 
                : 'bg-zinc-900/20 border-transparent text-zinc-600'
            }`}>
              <WitcherIcon name="trophy" size={14} className="shrink-0" />
              <span className="font-sans">
                {(() => {
                  if (!actCard.attributeBonus) return 'Ningún Atributo';
                  switch (actCard.attributeBonus) {
                    case 'attack': return 'Subir Ataque';
                    case 'defense': return 'Subir Defensa';
                    case 'alchemy': return 'Subir Alquimia';
                    case 'special': return 'Subir Especial';
                    case 'attack_defense': return 'Ataque y Defensa +1';
                    case 'defense_special_any': return 'Defensa, Especial y Elegir +1';
                    case 'attack_alchemy': return 'Ataque y Alquimia +1';
                    case 'highest': return 'Subir Atributo más Alto';
                    case 'lowest': return 'Subir Atributo más Bajo';
                    case 'highest_special': return 'Subir Alto y Especial +1';
                    case 'alchemy_any': return 'Alquimia y Elegir +1';
                    default: return `Subir ${actCard.attributeBonus}`;
                  }
                })()}
              </span>
            </div>

            {/* Potion Item */}
            <div className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1.5 ${
              actCard.potionBonus 
                ? 'bg-zinc-900 border-orange-900/30 text-orange-400 font-semibold' 
                : 'bg-zinc-900/20 border-transparent text-zinc-600'
            }`}>
              <WitcherIcon name="potion" size={14} className="shrink-0" />
              <span className="font-sans">{actCard.potionBonus ? 'Coger Poción' : 'Sin Poción'}</span>
            </div>

            {/* Bomb Item */}
            <div className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1.5 ${
              actCard.bombBonus 
                ? 'bg-zinc-900 border-orange-900/30 text-orange-400 font-semibold' 
                : 'bg-zinc-900/20 border-transparent text-zinc-600'
            }`}>
              <WitcherIcon name="bomb" size={14} className="shrink-0" />
              <span className="font-sans">{actCard.bombBonus ? 'Coger Bomba' : 'Sin Bomba'}</span>
            </div>

            {/* Monster Trail */}
            <div className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1.5 ${
              actCard.trailBonus 
                ? 'bg-zinc-900 border-orange-900/30 text-orange-400 font-semibold' 
                : 'bg-zinc-900/20 border-transparent text-zinc-600'
            }`}>
              <WitcherIcon name="trail" size={14} className="shrink-0" />
              <span className="font-sans">{actCard.trailBonus ? 'Obtener Rastro' : 'Sin Rastro'}</span>
            </div>
          </div>
        </div>

        {/* Phase II: Combat requirements */}
        <div className="bg-zinc-900 rounded-xl p-2.5 border border-zinc-850 mb-3 text-center">
          <div className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold mb-0.5">Fase II: Requisito de Combate</div>
          <div className="text-xs font-sans font-medium text-orange-500 flex items-center justify-center gap-1.5">
            <WitcherIcon name="alert" size={14} className="text-orange-500 shrink-0" />
            <span>{actCard.combatRequirement}</span>
          </div>
        </div>

        {/* Phase III: Market discards */}
        <div className="border-t border-zinc-800 pt-3 flex items-center justify-between text-xs mt-auto">
          <div className="flex items-center gap-1 text-zinc-400">
            <WitcherIcon name="trash" size={14} className="text-red-500" />
            <span className="font-sans text-[11px] font-bold">Descartar Mercado:</span>
          </div>
          <div className="flex gap-1">
            {actCard.marketDiscards.map((pos) => (
              <span key={pos} className="bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded font-mono text-xs font-black">
                {pos}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    const chaCard = card as ChallengeCard;
    return (
      <div
        className={`w-full max-w-[280px] bg-[#1a1a1a] border-2 rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 ${
          chaCard.level === 3 ? 'border-orange-600 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'border-zinc-800'
        }`}
        id={`challenge-card-${chaCard.id}`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500"></div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getLevelBadgeColor(chaCard.level)}`}>
            {getLevelLabel(chaCard.level)}
          </span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Carta Combate</span>
        </div>

        {/* Combat Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Damage swords */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
            <div className="text-[8px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Ataque Base</div>
            <div className="flex items-center gap-1 mt-1 font-bold text-red-400 text-sm">
              <WitcherIcon name="sword" size={18} className="text-red-500" />
              <span className="font-display">{chaCard.damage} Daño</span>
            </div>
          </div>

          {/* Shield defense */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
            <div className="text-[8px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Defensa Activa</div>
            <div className="flex items-center gap-1 mt-1 font-bold text-sky-400 text-sm">
              <WitcherIcon name="shield" size={18} className="text-sky-500" />
              <span className="font-display">+{chaCard.shields} Escudo</span>
            </div>
          </div>
        </div>

        {/* Consumable or School compatibility triggers */}
        <div className="flex gap-1.5 mb-3">
          {/* School Symbol */}
          <div className={`flex-1 p-1.5 rounded-lg border text-[10px] flex items-center justify-center gap-1.5 ${
            chaCard.schoolSymbol 
              ? 'bg-zinc-900 border-orange-900/30 text-orange-400 font-semibold' 
              : 'bg-zinc-900/20 border-transparent text-zinc-650'
          }`}>
            {school ? renderSchoolIcon(school.id, 14) : <WitcherIcon name="magic" size={14} className="text-zinc-500" />}
            <span className="font-sans">{chaCard.schoolSymbol ? 'Activa Bono' : 'Sin Bono'}</span>
          </div>

          {/* Consumables Slots */}
          <div className={`flex-1 p-1.5 rounded-lg border text-[10px] flex items-center justify-center gap-1.5 ${
            chaCard.consumableSlot 
              ? 'bg-zinc-900 border-orange-900/30 text-orange-400 font-semibold' 
              : 'bg-zinc-900/20 border-transparent text-zinc-650'
          }`}>
            <WitcherIcon name="potion" size={14} className="text-orange-400 shrink-0" />
            <span className="font-sans">{chaCard.consumableSlot ? 'Usa Poción' : 'Sin Poción'}</span>
          </div>
        </div>

        {/* Defensive Reaction / Damage Counter */}
        {chaCard.reaction ? (
          <div className="bg-red-950/25 border border-red-900/30 rounded-xl p-3 mb-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-8 h-8 opacity-10 rotate-12 shrink-0">
              <WitcherIcon name="shield" size={32} className="text-red-500 opacity-10" />
            </div>
            <div className="text-[9px] uppercase font-mono tracking-wider text-red-400 mb-1 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
              <span>Efecto de Reacción</span>
            </div>
            <div className="text-xs font-sans text-zinc-200 font-semibold leading-snug">
              {chaCard.reaction.description}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/20 border border-transparent rounded-xl p-3 mb-3 text-center text-xs font-sans text-zinc-600 italic">
            Sin Reacción al descartar.
          </div>
        )}

        {/* Poker pattern */}
        <div className="border-t border-zinc-800 pt-2.5 text-center text-[10px] mt-auto">
          <span className="text-zinc-500 font-mono block uppercase text-[8px] tracking-wider mb-0.5 font-bold">Póker de Dados</span>
          <span className="text-zinc-300 font-sans italic font-medium">"{chaCard.pokerPattern}"</span>
        </div>
      </div>
    );
  }
}
