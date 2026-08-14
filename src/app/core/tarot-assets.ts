/**
 * Public-domain Rider-Waite-Smith deck images (Pamela Colman Smith, 1909).
 * Sourced from github.com/mixvlad/TarotCards (Wikimedia Commons originals).
 * Files live in public/tarot/rws and are named after the canonical card IDs,
 * e.g. major-00.jpg, minor-cups-01.jpg.
 */
export function tarotCardImage(cardId: string): string {
  return `/tarot/rws/${cardId}.jpg`;
}
