/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WitcherSchool } from '../types';
import { WitcherIcon, SchoolMedallion } from './WitcherIcon';

interface SpecialSchoolCardComponentProps {
  school: WitcherSchool;
  activeSpecialIndex?: 1 | 2 | 3 | null;
}

function ShuffleDiscardBadge({ count = 1, className = 'text-emerald-700' }: { count?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-px ${className}`} title={`Barajar descarte → mazo${count > 1 ? ` (×${count})` : ''}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="inline-flex items-center gap-px">
          <WitcherIcon name="cards" size={13} />
          <WitcherIcon name="arrow-right" size={9} />
        </span>
      ))}
    </span>
  );
}

function ExtraComboBadge({ count = 1, className = 'text-emerald-700' }: { count?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-px ${className}`} title={`${count} combo(s) extra`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="inline-flex items-center gap-px">
          <WitcherIcon name="play" size={13} />
          <WitcherIcon name="cards" size={11} />
        </span>
      ))}
    </span>
  );
}

function NextAttackBonusBadge({ bonus = 2, className = 'text-red-600' }: { bonus?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-px ${className}`} title={`Siguiente ataque +${bonus} daño`}>
      <WitcherIcon name="arrow-right" size={9} />
      {Array.from({ length: bonus }).map((_, i) => (
        <WitcherIcon key={i} name="sword" size={14} className="text-red-600 shrink-0 inline" />
      ))}
    </span>
  );
}

function IgnoreDamageBadge({ className = 'text-amber-800' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-black ${className}`} title="Ignora daño del próximo turno rival">
      <WitcherIcon name="shield" size={14} className="text-amber-700 shrink-0" />
      <span>0 dmg</span>
    </span>
  );
}

function CardDrawBadge({ className = 'text-orange-600' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-px ${className}`} title="Robar carta">
      <WitcherIcon name="play" size={13} />
      <WitcherIcon name="plus" size={9} className="-ml-0.5" />
    </span>
  );
}

function CardDiscardBadge({ count = 1, className = 'text-red-600' }: { count?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-px ${className}`} title={`Descartar ${count}`}>
      <WitcherIcon name="discard" size={13} />
      {Array.from({ length: count }).map((_, i) => (
        <WitcherIcon key={i} name="arrow-down" size={9} />
      ))}
    </span>
  );
}

function PotionBonusBadge({
  potions = 1,
  bonus = '+',
  className = 'text-cyan-600',
}: {
  potions?: number;
  bonus?: '+' | '++';
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-px ${className}`} title="Bono de poción">
      {Array.from({ length: potions }).map((_, i) => (
        <WitcherIcon key={i} name="potion" size={13} />
      ))}
      {bonus === '+' ? (
        <WitcherIcon name="plus" size={9} />
      ) : (
        <>
          <WitcherIcon name="plus" size={9} />
          <WitcherIcon name="plus" size={9} className="-ml-1" />
        </>
      )}
    </span>
  );
}

function ShieldMaxBadge({ label = 'Máx', className = '' }: { label?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] text-sky-700 font-black ${className}`.trim()}>
      <WitcherIcon name="shield" size={14} className="text-sky-700 shrink-0" />
      {label}
    </span>
  );
}

function MutagenLabel({ color, label }: { color: 'blue' | 'red' | 'green'; label: string }) {
  const textClass = {
    blue: 'text-blue-800',
    red: 'text-red-800',
    green: 'text-emerald-800',
  }[color];
  const iconClass = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    green: 'text-emerald-600',
  }[color];

  return (
    <span className={`inline-flex items-center justify-center gap-1 text-[8px] font-mono font-bold uppercase leading-none ${textClass}`}>
      <WitcherIcon name="potion" size={12} className={iconClass} />
      {label}
    </span>
  );
}

export default function SpecialSchoolCardComponent({ school, activeSpecialIndex = null }: SpecialSchoolCardComponentProps) {
  const spec = school.specialCard;
  if (!spec) return null;

  const renderSwords = (count: number) => {
    return Array.from({ length: count }).map((_, i) => (
      <WitcherIcon key={i} name="sword" size={16} className="text-red-600 shrink-0 inline" />
    ));
  };

  const renderShields = (count: number) => {
    return Array.from({ length: count }).map((_, i) => (
      <WitcherIcon key={i} name="shield" size={16} className="text-sky-600 shrink-0 inline" />
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

      {(school.specialCardImagePath ?? spec.imagePath) && (
        <img
          src={school.specialCardImagePath ?? spec.imagePath}
          alt={`Carta de habilidades — ${school.name}`}
          className="w-full rounded-lg mb-3 border border-[#8b6e4e]/40 object-cover max-h-36 -mt-1"
        />
      )}

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
          <SchoolMedallion school={school.id} size={44} pulse={school.id === 'wolf'} />
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
                  <ExtraComboBadge count={2} />
                </>
              )}
              {school.id === 'griffin' && (
                <>
                  {renderSwords(2)}
                  <span className="mx-0.5">/</span>
                  {renderShields(1)}
                  <ShuffleDiscardBadge count={2} />
                </>
              )}
              {school.id === 'bear' && (
                <>
                  {renderSwords(2)}
                  <span className="mx-1">/</span>
                  <ShieldMaxBadge />
                </>
              )}
              {school.id === 'viper' && (
                <>
                  {renderSwords(2)}
                  <NextAttackBonusBadge bonus={2} />
                </>
              )}
              {school.id === 'manticore' && (
                <>
                  {renderSwords(2)}
                  <span className="mx-0.5">/</span>
                  {renderShields(1)}
                  <PotionBonusBadge />
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
                  <ExtraComboBadge count={1} />
                </>
              )}
              {school.id === 'griffin' && (
                <>
                  {renderSwords(3)}
                  <ShuffleDiscardBadge count={2} />
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
                  <ExtraComboBadge count={1} />
                </>
              )}
              {school.id === 'manticore' && (
                <>
                  {renderSwords(2)}
                  <span className="mx-0.5">/</span>
                  {renderShields(1)}
                  <PotionBonusBadge potions={2} bonus="++" />
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
                  <ShuffleDiscardBadge />
                </>
              )}
              {school.id === 'cat' && (
                <>
                  {renderSwords(1)}
                  <span className="mx-0.5">/</span>
                  {renderShields(2)}
                  <ExtraComboBadge count={1} />
                </>
              )}
              {school.id === 'griffin' && (
                <>
                  {renderSwords(3)}
                  <ShuffleDiscardBadge count={3} />
                </>
              )}
              {school.id === 'bear' && (
                <IgnoreDamageBadge />
              )}
              {school.id === 'viper' && (
                <>{renderSwords(5)}</>
              )}
              {school.id === 'manticore' && (
                <>
                  {renderShields(2)}
                  <span className="mx-0.5">/</span>
                  <span className="inline-flex items-center gap-0.5 text-cyan-700 font-black">
                    <WitcherIcon name="potion" size={13} className="text-cyan-700" />
                    <WitcherIcon name="arrow-down" size={9} />
                    <WitcherIcon name="arrow-right" size={9} />
                    {renderSwords(5)}
                  </span>
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
            <MutagenLabel color="blue" label="Azul" />
            <span className="text-[9px] font-sans font-semibold text-zinc-800 leading-tight block mt-1">
              {spec.mutagenBonuses.blue}
            </span>
          </div>

          {/* Red Mutagen */}
          <div className="bg-[#dfd1b8] border border-red-800/20 rounded-lg p-1.5 text-center flex flex-col justify-between">
            <MutagenLabel color="red" label="Rojo" />
            <span className="text-[9px] font-sans font-semibold text-zinc-800 leading-tight block mt-1">
              {spec.mutagenBonuses.red}
            </span>
          </div>

          {/* Green Mutagen */}
          <div className="bg-[#dfd1b8] border border-emerald-800/20 rounded-lg p-1.5 text-center flex flex-col justify-between">
            <MutagenLabel color="green" label="Verde" />
            <span className="text-[9px] font-sans font-semibold text-zinc-800 leading-tight block mt-1">
              {spec.mutagenBonuses.green}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
