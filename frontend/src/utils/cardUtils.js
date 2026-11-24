/**
 * Universal Card Utilities for AsianExchange / D247
 * Authentic Diamond Online format: ${rank}${suit}.jpg (e.g. 10DD.jpg, 9SS.jpg, KHH.jpg, ASS.jpg)
 * Card back: 1.jpg / back.jpg (authentic cyan/blue wave pattern with gold border)
 */

const VALID_RANKS = new Set([
  'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'
]);

export function parseCard(card) {
  if (!card) return null;
  if (typeof card === 'object') {
    if (card.code && typeof card.code === 'string' && card.code.length >= 2) {
      return parseCardString(card.code);
    }
    let rank = String(card.rank || card.val || '').toUpperCase().trim();
    if (rank === '1') rank = 'A';
    
    let suit = card.suit || '♠';
    let suitCode = 'SS';
    let isRed = false;

    if (suit === '♥' || suit === 'H' || suit === 'HH') {
      suit = '♥';
      suitCode = 'HH';
      isRed = true;
    } else if (suit === '♦' || suit === 'D' || suit === 'DD') {
      suit = '♦';
      suitCode = 'DD';
      isRed = true;
    } else if (suit === '♣' || suit === 'C' || suit === 'CC') {
      suit = '♣';
      suitCode = 'CC';
      isRed = false;
    } else {
      suit = '♠';
      suitCode = 'SS';
      isRed = false;
    }

    const normRank = VALID_RANKS.has(rank) ? rank : 'A';
    return {
      rank: normRank,
      suit,
      suitCode,
      code: `${normRank}${suitCode}`,
      isRed: isRed || !!card.isRed,
      isHidden: !!card.isHidden
    };
  }
  return parseCardString(String(card));
}

export function parseCardString(rawStr) {
  if (!rawStr) return null;
  const str = String(rawStr).trim().toUpperCase();
  if (str === '1' || str === '?' || str === '0' || str === 'BACK') {
    return { rank: '?', suit: '♠', suitCode: 'SS', isRed: false, code: '1', isHidden: true };
  }

  let suit = '♠';
  let suitCode = 'SS';
  let isRed = false;
  let rank = str;

  if (str.endsWith('HH')) {
    suit = '♥';
    suitCode = 'HH';
    isRed = true;
    rank = str.slice(0, -2);
  } else if (str.endsWith('H')) {
    suit = '♥';
    suitCode = 'HH';
    isRed = true;
    rank = str.slice(0, -1);
  } else if (str.endsWith('DD')) {
    suit = '♦';
    suitCode = 'DD';
    isRed = true;
    rank = str.slice(0, -2);
  } else if (str.endsWith('D')) {
    suit = '♦';
    suitCode = 'DD';
    isRed = true;
    rank = str.slice(0, -1);
  } else if (str.endsWith('CC')) {
    suit = '♣';
    suitCode = 'CC';
    isRed = false;
    rank = str.slice(0, -2);
  } else if (str.endsWith('C')) {
    suit = '♣';
    suitCode = 'CC';
    isRed = false;
    rank = str.slice(0, -1);
  } else if (str.endsWith('SS')) {
    suit = '♠';
    suitCode = 'SS';
    isRed = false;
    rank = str.slice(0, -2);
  } else if (str.endsWith('S')) {
    suit = '♠';
    suitCode = 'SS';
    isRed = false;
    rank = str.slice(0, -1);
  }

  if (rank === '1') rank = 'A';
  if (!VALID_RANKS.has(rank)) {
    if (VALID_RANKS.has(str)) {
      rank = str;
      suitCode = 'SS';
    } else {
      rank = 'A';
    }
  }

  return {
    rank,
    suit,
    suitCode,
    code: `${rank}${suitCode}`,
    isRed,
    isHidden: false
  };
}

export function getCardImgSrc(card, isFaceDown = false) {
  if (isFaceDown) return '/cards/1.jpg';
  if (!card) return '/cards/1.jpg';

  if (typeof card === 'string') {
    const s = card.trim();
    if (s === '1' || s.toLowerCase() === 'back' || s === '?' || s === '0') {
      return '/cards/1.jpg';
    }
    if (s.endsWith('.jpg') || s.endsWith('.webp')) {
      return s.startsWith('/') ? s : `/cards/${s}`;
    }
    if (s.length >= 2 && (s.endsWith('SS') || s.endsWith('HH') || s.endsWith('CC') || s.endsWith('DD'))) {
      return `/cards/${s}.jpg`;
    }
  }

  const parsed = parseCard(card);
  if (!parsed || parsed.isHidden || !parsed.code || parsed.code === '1') {
    return '/cards/1.jpg';
  }

  return `/cards/${parsed.code}.jpg`;
}
