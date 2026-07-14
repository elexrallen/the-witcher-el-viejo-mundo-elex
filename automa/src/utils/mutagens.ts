import { ChallengeCard } from "../types";

export function getCardMutagens(card: ChallengeCard): ("red" | "blue" | "green")[] {
  if (card.mutagens && card.mutagens.length > 0) {
    return card.mutagens;
  }
  const list: ("red" | "blue" | "green")[] = [];
  if (card.redMutagen) list.push("red");
  if (card.greenMutagen) list.push("green");
  return list;
}

export function formatMutagenList(mutagens: ("red" | "blue" | "green")[]): string {
  const labels: Record<string, string> = { red: "rojo", blue: "azul", green: "verde" };
  return mutagens.map((m) => labels[m]).join(", ");
}
