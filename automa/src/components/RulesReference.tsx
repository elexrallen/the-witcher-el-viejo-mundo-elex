/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WitcherIcon } from './WitcherIcon';

interface RuleSection {
  title: string;
  category: string;
  content: string[];
  tips?: string;
}

export default function RulesReference() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const sections: RuleSection[] = [
    {
      title: "1. Preparación y Niveles de Dificultad",
      category: "Preparación",
      content: [
        "El juego se despliega siguiendo las reglas normales de 2 jugadores.",
        "Tablero de Brujo: Elige una Escuela para el Automa, coloca sus marcadores de Atributo (Ataque, Defensa, Alquimia y Especial) en el nivel 1. Coloca su miniatura en el mapa.",
        "Distribución de Monstruos: Coloca los monstruos aleatoriamente por el mapa de forma habitual.",
        "Cartas del Automa: El Automa utiliza dos mazos propios: Mazo de Acción y Mazo de Desafío.",
        "Catálogo en la app: cartas verificadas desde las físicas. Al iniciar partida se aplican las tablas de dificultad del manual (Fácil / Medio / Difícil): selección aleatoria por nivel y apilado Acción (III abajo, II, I arriba).",
        "Mazo de Acción al iniciar: baraja niv. III, encima niv. II barajadas, encima niv. I barajadas. El Automa roba desde arriba (niv. I primero).",
        "Mazo de Acción vacío: forma un nuevo mazo solo con las cartas de niv. III del descarte y barájalo; las de niv. I y II permanecen en el descarte.",
        "Mazo de Desafío: todas las cartas barajadas juntas al inicio. Tres cartas genéricas niv. III apartadas para trofeos.",
        "Varios Automas: cada uno tiene mazo de Acción y Desafío propios. Si comparten localización, Fase II detecta brujo presente y puedes combatir Automa vs Automa (ambos mazos Desafío; el ganador obtiene trofeo). Los turnos se alternan: cada Automa completa su fase I–III antes de pasar al siguiente.",
      ],
      tips: "Recuerda que las cartas sobrantes de nivel 3 que queden fuera se colocan cerca; las ganarás cuando el Automa medite o consiga trofeos."
    },
    {
      title: "2. Reglas Básicas Simplificadas",
      category: "Reglas Generales",
      content: [
        "Gestión de Oro: El Automa no gana, gasta ni almacena monedas de oro. Cualquier ganancia o pérdida de oro se ignora.",
        "Desarrollo de Atributos: Al subir un atributo, avanza el marcador en su tablero de Escuela. El Automa nunca roba cartas por subir atributos.",
        "Límite y Bloqueo: Cuando un atributo llega a nivel 5 (máximo), queda bloqueado. Ningún efecto perjudicial puede volver a bajar ese atributo de 5.",
        "Ganancia de Trofeos y Meditación: Al ganar un trofeo de combate, no sufre descarte ni fatiga; añade una carta Desafío niv. III de la reserva. Meditar: atributo en nivel 5 + trofeo de meditación de ese atributo libre; si hay varios, elige el primero de izquierda a derecha (Ataque → Defensa → Alquimia → Especial).",
        "Rastros de Monstruos: Puede obtener fichas de rastro de monstruo mediante los iconos de sus cartas de Acción de forma inmediata."
      ],
      tips: "El bloqueo en nivel 5 es un cambio clave. Te obliga a enfrentarte a un Automa muy fuerte al final de la partida."
    },
    {
      title: "3. Estructura Detallada del Turno",
      category: "Turno",
      content: [
        "FASE I: Movimiento y Acciones. Roba la carta superior de Acción. Se desplaza hacia el destino indicado (si no indica ninguno, va hacia el monstruo de nivel más bajo en el mapa). Usa la ruta más corta. Al llegar, ejecuta los iconos de bonificación: Subir atributo, coger poción o bomba, o rastro de monstruo.",
        "FASE II: Fase Principal. Elige SOLO una opción en estricto orden de prioridad:",
        "  - Opción A (Meditar): Si tiene un atributo en nivel 5 y el trofeo de meditación de ese atributo está libre, medita (orden tablero izq. → der.). Gana un trofeo y añade carta Desafío niv. III.",
        "  - Opción B (Combatir): Opciones excluyentes ( / ): intenta la izquierda primero. Prioridad brujo → monstruo si no hay brujo y cumple trofeos.",
        "  - Opción C (Explorar): Si no medita ni combate, explora de forma pasiva. No ocurre nada (no roba cartas de evento) y pasa a Fase III.",
        "FASE III: Mantenimiento del Mercado. Retira las cartas del mercado de acción correspondientes a las posiciones numéricas impresas en la carta de Acción del Automa (contando de izquierda a derecha, baratas a caras, 1 a 6). Desplaza el resto y repón."
      ],
      tips: "Prioridad de combate: Si hay un monstruo y un brujo en la misma casilla, prioriza el monstruo si tiene su rastro. Si no lo tiene, prioriza luchar contra ti."
    },
    {
      title: "4. Sistema de Combate y Reacciones",
      category: "Combate",
      content: [
        "Vida del Automa: Su mazo completo de Desafío (junto a sus descartes de Desafío barajados) representa sus puntos de vida. Si el mazo se vacía, cae derrotado.",
        "Escudo: no puede superar el nivel de Defensa. Al terminar combate, baraja descarte + mazo combate → mazo Desafío y restaura escudo al máximo permitido por Defensa.",
        "Ataques especiales de monstruos: consulta tablas p. 14 (legendarios) y p. 15 (regulares). Anuncia Mordisco/Embestida, revela la carta del monstruo y aplica cada parte. «Ignora habilidad» = descarta 1ª carta del mazo de combate del Automa. «Ignora Nª parte» = no apliques esa parte del ataque.",
        "Turno de Ataque: Revela la carta superior del mazo. Suma su daño base y añade los escudos indicados.",
        "Bonos: Si revela el símbolo de Escuela, activa su habilidad especial (ej: Wolf da daño extra, Bear da escudos). Si tiene pociones o bombas y la carta muestra el icono de consumible, consume una para potenciar el daño.",
        "Recibir Daño y Reacciones: Cuando tú o un monstruo infligís daño al Automa, reduce el daño con sus escudos activos. Descarta cartas del mazo de Combate igual al daño restante. Revisa boca arriba CADA carta descartada:",
        "Si una carta descartada por daño tiene un efecto de REACCIÓN (escudo o contraataque), actívalo de inmediato en mitad de tu ataque. Puede cancelar parte del daño entrante restante o devolverte daño directo de inmediato."
      ],
      tips: "Las cartas de Reacción son el núcleo del Automa. Pueden arruinar un combo espectacular si revelas un escudo potente o un contraataque letal. ¡Ataca con precaución!"
    },
    {
      title: "5. Póker de Dados del Automa",
      category: "Expansión",
      content: [
        "Lanza los 5 dados iniciales del Automa con normalidad.",
        "Para determinar qué dados conserva y cuáles relanza (reroll), roba la carta superior de su mazo de Desafío.",
        "La carta mostrará un patrón claro (ej: 'Mantener parejas, volver a lanzar el resto').",
        "Separa los dados recomendados y vuelve a lanzar los dados no seleccionados para obtener su tirada final."
      ],
      tips: "Este módulo automatiza totalmente la IA en las tabernas sin necesidad de tomar decisiones arbitrarias por él."
    },
    {
      title: "6. Módulos y Expansiones Adicionales",
      category: "Expansión",
      content: [
        "Mutágenos: Si juegas con mutágenos, el Automa los adquiere mediante cartas avanzadas. En combate, si revela una carta del color de su mutágeno, activa bonificadores adicionales.",
        "Fichas de Debilidad: Los rastros de monstruo se convierten en fichas de debilidad al combatir. Al iniciar pelea, descarta estas fichas para reducir el tamaño del mazo de vida del monstruo de forma permanente antes de empezar.",
        "Skellige: Las cartas de Acción le indican viajar a las tres islas. Se moverá al puerto más cercano y tomará un barco. Avanza el marcador de Dagon si la carta muestra el icono de ancla/peligro.",
        "Legendary Hunt (Cacería Legendaria): Tras Fase I en casilla destruida, recoge ficha de Destrucción (sin beneficio del reverso). Cada ficha reduce 1 carta de la reserva de vida del Monstruo Legendario. Tabla de ataques especiales de legendarios en p. 14.",
      ],
      tips: "Todos estos módulos son compatibles simultáneamente. ¡Usa los selectores en la barra superior para activar sus interfaces dedicadas!"
    }
  ];

  const filteredSections = sections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.some((line) => line.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 text-neutral-200 shadow-xl" id="rules-container">
      <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <WitcherIcon name="book" size={20} className="text-amber-500" />
          <h2 className="font-sans text-lg font-medium text-amber-500 tracking-tight">Manual del Automa V1.4</h2>
        </div>
        <span className="text-xs font-mono text-neutral-500 uppercase">Referencia Completa</span>
      </div>

      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
          <WitcherIcon name="search" size={16} className="text-neutral-500" />
        </span>
        <input
          id="rules-search-input"
          type="text"
          placeholder="Buscar regla (ej. meditar, reacción, dados)..."
          className="w-full bg-neutral-950 text-sm border border-neutral-850 rounded px-3 py-2 pl-9 text-neutral-200 focus:outline-none focus:border-amber-700 font-sans"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1" id="rules-accordion">
        {filteredSections.length > 0 ? (
          filteredSections.map((section, idx) => {
            const isExpanded = expandedSection === idx;
            return (
              <div key={idx} className="border border-neutral-850 rounded bg-neutral-950/50 overflow-hidden" id={`rule-section-${idx}`}>
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-neutral-850/50 transition-colors"
                  onClick={() => setExpandedSection(isExpanded ? null : idx)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded font-mono bg-neutral-800 text-amber-400">
                      {section.category}
                    </span>
                    <span className="font-sans text-sm font-medium text-neutral-200 hover:text-amber-400 transition-colors">
                      {section.title}
                    </span>
                  </div>
                  {isExpanded ? (
                    <WitcherIcon name="chevron-up" size={16} className="text-neutral-400" />
                  ) : (
                    <WitcherIcon name="chevron-down" size={16} className="text-neutral-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-neutral-950 border-t border-neutral-850 text-sm space-y-2 leading-relaxed">
                    {section.content.map((p, pIdx) => (
                      <p key={pIdx} className="text-neutral-300 font-sans">
                        {p}
                      </p>
                    ))}
                    {section.tips && (
                      <div className="mt-3 p-3 bg-amber-950/20 border border-amber-900/30 rounded text-xs text-amber-300 flex gap-2 items-start">
                        <WitcherIcon name="alert" size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <span className="font-sans italic"><strong>Consejo de juego:</strong> {section.tips}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-neutral-500 text-sm font-sans">
            No se encontraron reglas con ese término de búsqueda.
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-neutral-950 rounded border border-neutral-850 text-xs text-neutral-400 flex items-center gap-2" id="rules-footer">
        <WitcherIcon name="help" size={16} className="text-amber-500" />
        <span className="font-sans">Este simulador automatiza el mazo de juego del Automa. Usa las fases del turno para jugar paso a paso.</span>
      </div>
    </div>
  );
}
