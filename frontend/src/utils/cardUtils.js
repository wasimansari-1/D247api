/**
 * Universal Card Utilities for AsianExchange / D247
 * Real webp cards from /cards/
 * Contains the 13 rank cards (A, 2..10, J, Q, K) and back.webp
 */

const VALID_RANKS = new Set([
  'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'
]);

export function parseCard(card) {
  if (!card) return null;
  if (typeof card === 'object') {
    if (card.code) return parseCardString(card.code);
    let rank = String(card.rank || card.val || '').toUpperCase().trim();
    if (rank === '1') rank = 'A';
    const suit = card.suit || '♠';
    const isRed = card.isRed ?? (card.color === 'red' || suit === '♥' || suit === '♦');
    return {
      rank: VALID_RANKS.has(rank) ? rank : 'A',
      suit,
      isRed,
      code: rank,
      isHidden: !!card.isHidden
    };
  }
  return parseCardString(String(card));
}

export function parseCardString(rawStr) {
  if (!rawStr) return null;
  const str = String(rawStr).trim().toUpperCase();
  if (str === '1' || str === '?' || str === '0' || str === 'BACK') {
    return { rank: '?', suit: '♠', isRed: false, code: 'back', isHidden: true };
  }

  let suit = '♠';
  let isRed = false;
  let rank = str;

  if (str.endsWith('HH') || str.endsWith('H')) {
    suit = '♥';
    isRed = true;
    rank = str.replace(/H+$/, '');
  } else if (str.endsWith('DD') || str.endsWith('D')) {
    suit = '♦';
    isRed = true;
    rank = str.replace(/D+$/, '');
  } else if (str.endsWith('CC') || str.endsWith('C')) {
    suit = '♣';
    isRed = false;
    rank = str.replace(/C+$/, '');
  } else if (str.endsWith('SS') || str.endsWith('S')) {
    suit = '♠';
    isRed = false;
    rank = str.replace(/S+$/, '');
  }

  if (rank === '1') rank = 'A';
  if (!VALID_RANKS.has(rank)) {
    rank = 'A';
  }

  return { rank, suit, isRed, code: rank, isHidden: false };
}

export function getCardImgSrc(card, isFaceDown = false) {
  if (isFaceDown) return '/cards/back.webp';
  const parsed = parseCard(card);
  if (!parsed || parsed.isHidden || !parsed.rank || parsed.rank === '?') {
    return '/cards/back.webp';
  }
  return `/cards/${parsed.rank}.webp`;
}
