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
        description: 'Inflige 3 de Daño, gana 1 de Escudo y obliga al oponente a descartar 1 carta de su mano.',
        effectDetail: '3 ⚔️ | 1 🛡️ | 🎴↓'
      },
      mutagenBonuses: {
        blue: '+1 Daño extra en ataques base.',
        red: '+1 Escudo activo extra.',
        green: 'El oponente descarta 1 carta de combate.'
      }
    }
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
        description: 'Inflige 1 de Daño, gana 1 de Escudo, roba 1 carta de combate y obliga al oponente a descartar 1 carta.',
        effectDetail: '1 ⚔️ | 1 🛡️ | 🎴+ | 🎴↓'
      },
      special2: {
        damage: 2,
        shields: 1,
        description: 'Inflige 2 de Daño, gana 1 de Escudo y roba 1 carta de combate.',
        effectDetail: '2 ⚔️ | 1 🛡️ | 🎴+'
      },
      special3: {
        damage: 1,
        shields: 2,
        description: 'Inflige 1 de Daño, gana 2 de Escudos y roba 1 carta de combate.',
        effectDetail: '1 ⚔️ | 2 🛡️ | 🎴+'
      },
      mutagenBonuses: {
        blue: '+2 Daño en ataques base.',
        red: '+1 Daño en ataques base.',
        green: '+1 Escudo activo extra.'
      }
    }
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
        description: 'Inflige 2 de Daño, gana 1 de Escudo y obliga al oponente a descartar 2 cartas de su mano.',
        effectDetail: '2 ⚔️ | 1 🛡️ | 🎴↓↓'
      },
      special2: {
        damage: 3,
        shields: 0,
        description: 'Inflige 3 de Daño y obliga al oponente a descartar 2 cartas de su mano.',
        effectDetail: '3 ⚔️ | 🎴↓↓'
      },
      special3: {
        damage: 3,
        shields: 0,
        description: 'Inflige 3 de Daño y obliga al oponente a descartar 3 cartas de su mano.',
        effectDetail: '3 ⚔️ | 🎴↓↓↓'
      },
      mutagenBonuses: {
        blue: 'El oponente descarta 1 carta.',
        red: '+1 Daño en ataques base.',
        green: 'El oponente descarta 1 carta de combate.'
      }
    }
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
        shields: 5, // Maximizes shields
        description: 'Inflige 2 de Daño y aumenta tus escudos al máximo permitido (5 escudos activos).',
        effectDetail: '2 ⚔️ | 🛡️ Al Máximo (5)'
      },
      special2: {
        damage: 2,
        shields: 3,
        description: 'Inflige 2 de Daño y gana 3 de Escudos activos.',
        effectDetail: '2 ⚔️ | 3 🛡️'
      },
      special3: {
        damage: 0,
        shields: 0,
        description: 'Efecto Oso Legendario: Ignora por completo todo el daño recibido en el próximo turno de combate del oponente.',
        effectDetail: '🛡️ Ignora Siguiente Daño'
      },
      mutagenBonuses: {
        blue: '+1 Escudo activo extra.',
        red: '+1 Escudo activo extra.',
        green: '+1 Escudo activo extra.'
      }
    }
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
        damage: 4, // 2 base + 2 on next (we can resolve as 4 or 2 and apply +2 to the next)
        shields: 0,
        description: 'Inflige 2 de Daño y el siguiente ataque del Automa gana +2 de Daño (Simulado como 4 de Daño directo de veneno).',
        effectDetail: '2 ⚔️ (+2 de Daño extra continuado)'
      },
      special2: {
        damage: 3,
        shields: 0,
        description: 'Inflige 3 de Daño de escaramuza y roba 1 carta de combate.',
        effectDetail: '3 ⚔️ | 🎴+'
      },
      special3: {
        damage: 5,
        shields: 0,
        description: 'Ataque Fulminante de Veneno: Inflige 5 de Daño directo masivo.',
        effectDetail: '5 ⚔️'
      },
      mutagenBonuses: {
        blue: '+1 Daño de veneno extra.',
        red: '+2 Daño de contraataque extra.',
        green: '+1 Daño continuado.'
      }
    }
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
        description: 'Inflige 2 de Daño, gana 1 de Escudo y añade 1 Poción gratis al inventario del Automa.',
        effectDetail: '2 ⚔️ | 1 🛡️ | 🧪+'
      },
      special2: {
        damage: 2,
        shields: 1,
        description: 'Inflige 2 de Daño, gana 1 de Escudo y añade 2 Pociones al inventario del Automa.',
        effectDetail: '2 ⚔️ | 1 🛡️ | 🧪🧪++'
      },
      special3: {
        damage: 6, // If consuming a potion
        shields: 2,
        description: 'Gana 2 de Escudo. Consume/descarta 1 Poción de inmediato para desatar un impacto colosal de 6 de Daño directo.',
        effectDetail: '2 🛡️ | Gasta 1 🧪 para infligir 6 ⚔️'
      },
      mutagenBonuses: {
        blue: '+1 Poción gratis al inventario.',
        red: '+1 Daño por nivel de toxicidad.',
        green: '+1 Poción gratis al inventario.'
      }
    }
  }
];
