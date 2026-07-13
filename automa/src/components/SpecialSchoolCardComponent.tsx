/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WitcherSchool } from '../types';
import { Shield, Swords, Sparkles, AlertTriangle, Play, HelpCircle, ShieldAlert, Zap, Flame, Skull, Droplet, ArrowDown } from 'lucide-react';

interface SpecialSchoolCardComponentProps {
  school: WitcherSchool;
  activeSpecialIndex?: 1 | 2 | 3 | null; // If combat reveals an Especial card, we highlight that row!
}

export default function SpecialSchoolCardComponent({ school, activeSpecialIndex = null }: SpecialSchoolCardComponentProps) {
  const spec = school.specialCard;
  if (!spec) return null;

  // Render school emblem
  const renderMedallion = (schoolId: string, sizeClass: string = 'w-10 h-10') => {
    switch (schoolId) {
      case 'wolf':
        return (
          <div className="bg-amber-600/20 border border-amber-600 rounded-full p-1.5 shadow-[0_0_10px_rgba(217,119,6,0.3)] animate-pulse">
            <ShieldAlert className={`${sizeClass} text-red-600`} />
          </div>
        );
      case 'cat':
        return (
          <div className="bg-emerald-600/20 border border-emerald-600 rounded-full p-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <Zap className={`${sizeClass} text-emerald-600`} />
          </div>
        );
      case 'griffin':
        return (
          <div className="bg-amber-500/20 border border-amber-500 rounded-full p-1.5 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            <Flame className={`${sizeClass} text-amber-500`} />
          </div>
        );
      case 'bear':
        return (
          <div className="bg-amber-700/20 border border-amber-700 rounded-full p-1.5 shadow-[0_0_10px_rgba(180,83,9,0.3)]">
            <Shield className={`${sizeClass} text-amber-700`} />
          </div>
        );
      case 'viper':
        return (
          <div className="bg-purple-600/20 border border-purple-600 rounded-full p-1.5 shadow-[0_0_10px_rgba(147,51,234,0.3)]">
            <Skull className={`${sizeClass} text-purple-600`} />
          </div>
        );
      case 'manticore':
        return (
          <div className="bg-cyan-600/20 border border-cyan-600 rounded-full p-1.5 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            <Droplet className={`${sizeClass} text-cyan-600`} />
          </div>
        );
      default:
        return <Sparkles className={`${sizeClass} text-amber-500`} />;
    }
  };

  // Helper to render scratch damage swords
  const renderSwords = (count: number) => {
    return Array.from({ length: count }).map((_, i) => (
      <Swords key={i} className="w-4 h-4 text-red-600 shrink-0 inline" />
    ));
  };

  // Helper to render defense shields
  const renderShields = (count: number) => {
    return Array.from({ length: count }).map((_, i) => (
      <Shield key={i} className="w-4 h-4 text-sky-600 shrink-0 inline" />
    ));
  };

  return (
    <div
      className="w-full max-w-[340px] bg-[#f2e7d3] border-4 border-[#8b6e4e] text-zinc-900 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col p-5 font-sans"
      id={`special-card-${school.id}`}
      style={{
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 0 40px rgba(139,110,78,0.15)',
        borderImage: 'linear-gradient(to bottom, #a07a4a, #5c4327) 1',
        borderStyle: 'solid',
      }}
    >
      {/* Aesthetic Border Linework */}
      <div className="absolute inset-2 border border-[#8b6e4e]/20 rounded-lg pointer-events-none" />

      {/* Card Header with Medallion and School name */}
      <div className="flex justify-between items-start pb-3 border-b-2 border-[#8b6e4e]/30 z-10">
        <div>
          <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-amber-800">
            Habilidades Automa
          </span>
          <h3 className="font-display text-base font-black text-zinc-900 leading-tight uppercase tracking-tight">
            {school.name}
          </h3>
          <p className="text-[10px] text-zinc-600 italic font-medium leading-tight mt-0.5 max-w-[210px]">
            {school.bonusText}
          </p>
        </div>
        <div className="shrink-0 -mt-1 -mr-1">
          {renderMedallion(school.id)}
        </div>
      </div>

      {/* SPECIAL EFFECTS SECTION */}
      <div className="space-y-4 py-4 z-10 flex-1">
        {/* ESPECIAL 1 */}
        <div
          className={`p-2.5 rounded-xl border transition-all duration-300 relative ${
            activeSpecialIndex === 1
              ? 'bg-amber-600/10 border-amber-600 ring-2 ring-amber-500 ring-offset-2 ring-offset-[#f2e7d3]'
              : 'border-transparent hover:bg-zinc-800/5'
          }`}
        >
          {activeSpecialIndex === 1 && (
            <div className="absolute -top-2 -left-2 bg-amber-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full animate-bounce shadow">
              Revelada
            </div>
          )}
          <div className="flex justify-between items-center mb-1 border-b border-zinc-800/10 pb-1">
            <span className="font-display text-[11px] font-black tracking-wider text-amber-900 uppercase">
              ESPECIAL 1
            </span>
            <div className="flex gap-0.5 items-center bg-zinc-900/5 px-1.5 py-0.5 rounded font-bold text-[11px]">
              {school.id === 'wolf' && (
                <>
                  {renderSwords(3)}
                  <span className="mx-1">/</span>
                  {renderShields(2)}
                </>
              )}
              {school.id === 'cat' && (
                <>
                  {renderSwords(1)}
                  <span className="mx-0.5">/</span>
                  {renderShields(1)}
                  <span className="mx-0.5 text-orange-600 font-bold">🎴+</span>
                  <span className="mx-0.5 text-zinc-600 font-bold">🎴↓</span>
                </>
              )}
              {school.id === 'griffin' && (
                <>
                  {renderSwords(2)}
                  <span className="mx-0.5">/</span>
                  {renderShields(1)}
                  <span className="mx-0.5 text-red-600 font-bold">🎴↓↓</span>
                </>
              )}
              {school.id === 'bear' && (
                <>
                  {renderSwords(2)}
                  <span className="mx-1">/</span>
                  <span className="text-[9px] text-sky-700 font-black">🛡️ Máx</span>
                </>
              )}
              {school.id === 'viper' && (
                <>
                  {renderSwords(2)}
                  <span className="mx-0.5 text-red-600 font-bold">+ ⚔️⚔️</span>
                </>
              )}
              {school.id === 'manticore' && (
                <>
                  {renderSwords(2)}
                  <span className="mx-0.5">/</span>
                  {renderShields(1)}
                  <span className="mx-0.5 text-cyan-600 font-bold">🧪+</span>
                </>
              )}
            </div>
          </div>
          <p className="text-[11px] text-zinc-700 font-medium leading-relaxed">
            {spec.special1.description}
          </p>
        </div>

        {/* ESPECIAL 2 */}
        <div
          className={`p-2.5 rounded-xl border transition-all duration-300 relative ${
            activeSpecialIndex === 2
              ? 'bg-amber-600/10 border-amber-600 ring-2 ring-amber-500 ring-offset-2 ring-offset-[#f2e7d3]'
              : 'border-transparent hover:bg-zinc-800/5'
          }`}
        >
          {activeSpecialIndex === 2 && (
            <div className="absolute -top-2 -left-2 bg-amber-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full animate-bounce shadow">
              Revelada
            </div>
          )}
          <div className="flex justify-between items-center mb-1 border-b border-zinc-800/10 pb-1">
            <span className="font-display text-[11px] font-black tracking-wider text-amber-900 uppercase">
              ESPECIAL 2
            </span>
            <div className="flex gap-0.5 items-center bg-zinc-900/5 px-1.5 py-0.5 rounded font-bold text-[11px]">
              {school.id === 'wolf' && (
                <>
                  {renderSwords(4)}
                  <span className="mx-1">/</span>
                  {renderShields(1)}
                </>
              )}
              {school.id === 'cat' && (
                <>
                  {renderSwords(2)}
                  <span className="mx-0.5">/</span>
                  {renderShields(1)}
                  <span className="mx-0.5 text-orange-600 font-bold">🎴+</span>
                </>
              )}
              {school.id === 'griffin' && (
                <>
                  {renderSwords(3)}
                  <span className="mx-0.5">/</span>
                  <span className="text-red-600 font-bold">🎴↓↓</span>
                </>
              )}
              {school.id === 'bear' && (
                <>
                  {renderSwords(2)}
                  <span className="mx-1">/</span>
                  {renderShields(3)}
                </>
              )}
              {school.id === 'viper' && (
                <>
                  {renderSwords(3)}
                  <span className="mx-0.5">/</span>
                  <span className="text-orange-600 font-bold">🎴+</span>
                </>
              )}
              {school.id === 'manticore' && (
                <>
                  {renderSwords(2)}
                  <span className="mx-0.5">/</span>
                  {renderShields(1)}
                  <span className="mx-0.5 text-cyan-600 font-bold">🧪🧪++</span>
                </>
              )}
            </div>
          </div>
          <p className="text-[11px] text-zinc-700 font-medium leading-relaxed">
            {spec.special2.description}
          </p>
        </div>

        {/* ESPECIAL 3 */}
        <div
          className={`p-2.5 rounded-xl border transition-all duration-300 relative ${
            activeSpecialIndex === 3
              ? 'bg-amber-600/10 border-amber-600 ring-2 ring-amber-500 ring-offset-2 ring-offset-[#f2e7d3]'
              : 'border-transparent hover:bg-zinc-800/5'
          }`}
        >
          {activeSpecialIndex === 3 && (
            <div className="absolute -top-2 -left-2 bg-amber-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full animate-bounce shadow">
              Revelada
            </div>
          )}
          <div className="flex justify-between items-center mb-1 border-b border-zinc-800/10 pb-1">
            <span className="font-display text-[11px] font-black tracking-wider text-amber-900 uppercase">
              ESPECIAL 3
            </span>
            <div className="flex gap-0.5 items-center bg-zinc-900/5 px-1.5 py-0.5 rounded font-bold text-[11px]">
              {school.id === 'wolf' && (
                <>
                  {renderSwords(3)}
                  <span className="mx-1">/</span>
                  {renderShields(1)}
                  <span className="mx-1">/</span>
                  <span className="text-zinc-600 font-bold">🎴↓</span>
                </>
              )}
              {school.id === 'cat' && (
                <>
                  {renderSwords(1)}
                  <span className="mx-0.5">/</span>
                  {renderShields(2)}
                  <span className="mx-0.5 text-orange-600 font-bold">🎴+</span>
                </>
              )}
              {school.id === 'griffin' && (
                <>
                  {renderSwords(3)}
                  <span className="mx-1">/</span>
                  <span className="text-red-600 font-bold">🎴↓↓↓</span>
                </>
              )}
              {school.id === 'bear' && (
                <span className="text-[9px] text-red-700 font-black">🛡️ Bloquea Siguiente Turno</span>
              )}
              {school.id === 'viper' && (
                <>{renderSwords(5)}</>
              )}
              {school.id === 'manticore' && (
                <>
                  {renderShields(2)}
                  <span className="mx-0.5">/</span>
                  <span className="text-cyan-700 font-black">🧪↓ ➔ 6 ⚔️</span>
                </>
              )}
            </div>
          </div>
          <p className="text-[11px] text-zinc-700 font-medium leading-relaxed">
            {spec.special3.description}
          </p>
        </div>
      </div>

      {/* MUTAGENS SECTION (BOTTOM ROW) */}
      <div className="border-t-2 border-[#8b6e4e]/30 pt-3 mt-auto z-10">
        <span className="text-[9px] uppercase tracking-wider font-mono font-extrabold text-amber-800 block mb-1.5 text-center">
          Bonos por Mutágenos Adquiridos (Combate)
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {/* Blue Mutagen */}
          <div className="bg-[#dfd1b8] border border-blue-800/20 rounded-lg p-1.5 text-center flex flex-col justify-between">
            <span className="text-[8px] font-mono font-bold text-blue-800 uppercase block leading-none">
              🔵 Azul
            </span>
            <span className="text-[9px] font-sans font-semibold text-zinc-800 leading-tight block mt-1">
              {spec.mutagenBonuses.blue}
            </span>
          </div>

          {/* Red Mutagen */}
          <div className="bg-[#dfd1b8] border border-red-800/20 rounded-lg p-1.5 text-center flex flex-col justify-between">
            <span className="text-[8px] font-mono font-bold text-red-800 uppercase block leading-none">
              🔴 Rojo
            </span>
            <span className="text-[9px] font-sans font-semibold text-zinc-800 leading-tight block mt-1">
              {spec.mutagenBonuses.red}
            </span>
          </div>

          {/* Green Mutagen */}
          <div className="bg-[#dfd1b8] border border-emerald-800/20 rounded-lg p-1.5 text-center flex flex-col justify-between">
            <span className="text-[8px] font-mono font-bold text-emerald-800 uppercase block leading-none">
              🟢 Verde
            </span>
            <span className="text-[9px] font-sans font-semibold text-zinc-800 leading-tight block mt-1">
              {spec.mutagenBonuses.green}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
