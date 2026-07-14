/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WitcherSchool } from '../types';

export const WITCHER_SCHOOLS: WitcherSchool[] = [
  {
    id: 'wolf',
    name: 'Escuela del Lobo',
    color: 'from-slate-900 via-zinc-800 to-red-950 border-red-700 text-red-100',
    iconName: 'ShieldAlert',
    description: 'La escuela de Geralt de Rivia, famosa por su adaptabilidad y letales técnicas de esgrima con espadas de acero y plata.',
    bonusText: 'Furia de Acero: +1 de Daño en todos tus ataques en combate si la carta tiene el símbolo de Escuela.',
    combatBonus: {
      damage: 1,
      shields: 0,
      potions: 0
    },
    specialCard: {
      special1: {
        damage: 3,
        shields: 2,
        description: 'Inflige 3 de Daño y gana 2 de Escudo.',
        effectDetail: '3 ⚔️ | 2 🛡️'
      },
      special2: {
        damage: 4,
        shields: 1,
        description: 'Inflige 4 de Daño y gana 1 de Escudo.',
        effectDetail: '4 ⚔️ | 1 🛡️'
      },
      special3: {
        damage: 3,
        shields: 1,
        shuffleDiscardTop: true,
        description: 'Inflige 3 de Daño, gana 1 de Escudo y baraja la carta superior del descarte en el mazo de combate.',
        effectDetail: '3 ⚔️ | 1 🛡️ | 🔀 descarte→mazo',
      },
      mutagenBonuses: {
        blue: '+1 Daño',
        red: '+1 Escudo',
        green: 'Baraja la carta superior del descarte en el mazo de combate.',
      },
      mutagenCombat: {
        blue: { damage: 1 },
        red: { shields: 1 },
        green: { shuffleDiscardTop: true },
      },
      imagePath: '/schools/wolf-special.png',
    },
    specialCardImagePath: '/schools/wolf-special.png',
  },
  {
    id: 'cat',
    name: 'Escuela del Gato',
    color: 'from-slate-900 via-neutral-800 to-emerald-950 border-emerald-700 text-emerald-100',
    iconName: 'Zap',
    description: 'Agilidad felina, sigilo extremo y ataques rápidos que buscan los puntos vitales del adversario.',
    bonusText: 'Reflejo Felino: +1 Escudo en todos tus turnos de combate si la carta tiene el símbolo de Escuela.',
    combatBonus: {
      damage: 0,
      shields: 1,
      potions: 0
    },
    specialCard: {
      special1: {
        damage: 1,
        shields: 1,
        attackExtraComboCount: 2,
        description: 'Inflige 1 de Daño, gana 1 de Escudo y juega 2 combos adicionales inmediatamente.',
        effectDetail: '1 ⚔️ | 1 🛡️ | 🎴×2',
      },
      special2: {
        damage: 2,
        shields: 1,
        attackExtraComboCount: 1,
        description: 'Inflige 2 de Daño, gana 1 de Escudo y juega otro combo inmediatamente.',
        effectDetail: '2 ⚔️ | 1 🛡️ | 🎴+',
      },
      special3: {
        damage: 1,
        shields: 2,
        attackExtraComboCount: 1,
        description: 'Inflige 1 de Daño, gana 2 de Escudos y juega otro combo inmediatamente.',
        effectDetail: '1 ⚔️ | 2 🛡️ | 🎴+',
      },
      mutagenBonuses: {
        blue: '+2 Daño',
        red: '+1 Daño',
        green: '+1 Escudo',
      },
      mutagenCombat: {
        blue: { damage: 2 },
        red: { damage: 1 },
        green: { shields: 1 },
      },
      imagePath: '/schools/cat-special.png',
    },
    specialCardImagePath: '/schools/cat-special.png',
  },
  {
    id: 'griffin',
    name: 'Escuela del Grifo',
    color: 'from-slate-900 via-neutral-800 to-amber-950 border-amber-700 text-amber-100',
    iconName: 'Flame',
    description: 'Maestros del combate táctico y el uso defensivo-ofensivo avanzado de las Señales mágicas (Aard, Igni).',
    bonusText: 'Poder de las Señas: Obtiene +1 Daño y +1 Escudo si la carta revela el símbolo de Escuela.',
    combatBonus: {
      damage: 1,
      shields: 1,
      potions: 0
    },
    specialCard: {
      special1: {
        damage: 2,
        shields: 1,
        shuffleDiscardTopCount: 2,
        description: 'Inflige 2 de Daño, gana 1 de Escudo y baraja la carta superior del descarte en el mazo de combate (2 veces).',
        effectDetail: '2 ⚔️ | 1 🛡️ | 🔀×2',
      },
      special2: {
        damage: 3,
        shields: 0,
        shuffleDiscardTopCount: 2,
        description: 'Inflige 3 de Daño y baraja la carta superior del descarte en el mazo de combate (2 veces).',
        effectDetail: '3 ⚔️ | 🔀×2',
      },
      special3: {
        damage: 3,
        shields: 0,
        shuffleDiscardTopCount: 3,
        description: 'Inflige 3 de Daño y baraja la carta superior del descarte en el mazo de combate (3 veces).',
        effectDetail: '3 ⚔️ | 🔀×3',
      },
      mutagenBonuses: {
        blue: 'Baraja descarte → mazo de combate',
        red: '+1 Daño',
        green: 'Baraja descarte → mazo de combate',
      },
      mutagenCombat: {
        blue: { shuffleDiscardTop: true },
        red: { damage: 1 },
        green: { shuffleDiscardTop: true },
      },
      imagePath: '/schools/griffin-special.png',
    },
    specialCardImagePath: '/schools/griffin-special.png',
  },
  {
    id: 'bear',
    name: 'Escuela del Oso',
    color: 'from-slate-900 via-zinc-800 to-amber-900 border-amber-800 text-amber-50',
    iconName: 'Shield',
    description: 'Armaduras pesadas, resistencia inquebrantable y contragolpes masivos capaces de derribar colosos.',
    bonusText: 'Guardia Inquebrantable: +2 Escudo en combate si la carta tiene el símbolo de Escuela.',
    combatBonus: {
      damage: 0,
      shields: 2,
      potions: 0
    },
    specialCard: {
      special1: {
        damage: 2,
        shields: 0,
        raiseShieldToMax: true,
        description: 'Inflige 2 de Daño y aumenta tus escudos al máximo.',
        effectDetail: '2 ⚔️ | 🛡️ Máx',
      },
      special2: {
        damage: 2,
        shields: 3,
        description: 'Inflige 2 de Daño y gana 3 de Escudos.',
        effectDetail: '2 ⚔️ | 3 🛡️',
      },
      special3: {
        damage: 0,
        shields: 0,
        ignoreNextOpponentDamage: true,
        description: 'Ignora todo el daño recibido del próximo turno de combate del oponente.',
        effectDetail: '🛡️ Ignora daño rival',
      },
      mutagenBonuses: {
        blue: '+1 Escudo',
        red: '+1 Escudo',
        green: '+1 Escudo',
      },
      mutagenCombat: {
        blue: { shields: 1 },
        red: { shields: 1 },
        green: { shields: 1 },
      },
      imagePath: '/schools/bear-special.png',
    },
    specialCardImagePath: '/schools/bear-special.png',
  },
  {
    id: 'viper',
    name: 'Escuela de la Víbora',
    color: 'from-slate-900 via-neutral-800 to-purple-950 border-purple-700 text-purple-100',
    iconName: 'Skull',
    description: 'Espadas duales impregnadas en venenos mortales y tácticas de distracción imprevistas.',
    bonusText: 'Filos Venenosos: Inflige +1 Daño y reduce el escudo rival en 1 (simulado como +1 Daño y +1 Escudo) si tiene el símbolo de Escuela.',
    combatBonus: {
      damage: 1,
      shields: 1,
      potions: 0
    },
    specialCard: {
      special1: {
        damage: 2,
        shields: 0,
        nextAttackDamageBonus: 2,
        description: 'Inflige 2 de Daño y el siguiente ataque gana +2 de Daño.',
        effectDetail: '2 ⚔️ | +2 ⚔️ siguiente',
      },
      special2: {
        damage: 3,
        shields: 0,
        attackExtraComboCount: 1,
        description: 'Inflige 3 de Daño y juega otro combo inmediatamente.',
        effectDetail: '3 ⚔️ | 🎴+',
      },
      special3: {
        damage: 5,
        shields: 0,
        description: 'Inflige 5 de Daño.',
        effectDetail: '5 ⚔️',
      },
      mutagenBonuses: {
        blue: '+1 Daño',
        red: '+2 Daño',
        green: '+1 Daño',
      },
      mutagenCombat: {
        blue: { damage: 1 },
        red: { damage: 2 },
        green: { damage: 1 },
      },
      imagePath: '/schools/viper-special.png',
    },
    specialCardImagePath: '/schools/viper-special.png',
  },
  {
    id: 'manticore',
    name: 'Escuela de la Mantícora',
    color: 'from-slate-900 via-neutral-800 to-cyan-950 border-cyan-700 text-cyan-100',
    iconName: 'Droplet',
    description: 'Expertos alquimistas capaces de digerir mutágenos y pociones hiper-tóxicas sin sufrir colapso orgánico.',
    bonusText: 'Toxicidad Liberada: Consume una poción gratis cuando revela un símbolo de consumible, infligiendo +2 de Daño extra.',
    combatBonus: {
      damage: 2,
      shields: 0,
      potions: 1
    },
    specialCard: {
      special1: {
        damage: 2,
        shields: 1,
        gainPotions: 1,
        description: 'Inflige 2 de Daño, gana 1 de Escudo y gana 1 Poción.',
        effectDetail: '2 ⚔️ | 1 🛡️ | 🧪+',
      },
      special2: {
        damage: 2,
        shields: 1,
        gainPotions: 2,
        description: 'Inflige 2 de Daño, gana 1 de Escudo y gana 2 Pociones.',
        effectDetail: '2 ⚔️ | 1 🛡️ | 🧪🧪++',
      },
      special3: {
        damage: 0,
        shields: 2,
        spendPotionForDamage: 5,
        description: 'Gana 2 de Escudo, gasta 1 Poción e inflige 5 de Daño.',
        effectDetail: '2 🛡️ | Gasta 1 🧪 → 5 ⚔️',
      },
      mutagenBonuses: {
        blue: '+1 Poción',
        red: '+1 Daño',
        green: '+1 Poción',
      },
      mutagenCombat: {
        blue: { gainPotions: 1 },
        red: { damage: 1 },
        green: { gainPotions: 1 },
      },
      imagePath: '/schools/manticore-special.png',
    },
    specialCardImagePath: '/schools/manticore-special.png',
  },
];
