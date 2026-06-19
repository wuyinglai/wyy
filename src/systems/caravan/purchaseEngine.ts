import type { GameState } from '../../core/types';

// Prices
export const FOOD_PRICE = 2;
export const SPARE_PARTS_PRICE = 5;

// Recommended purchase bundle
export const RECOMMENDED_FOOD = 24;
export const RECOMMENDED_SPARE_PARTS = 4;

// Departure minimums
export const MIN_FOOD_TO_DEPART = 20;
export const MIN_SPARE_PARTS_TO_DEPART = 2;
export const MIN_CARAVAN_HP_TO_DEPART = 60;
export const MIN_MORALE_TO_DEPART = 0;

export interface DepartureCheck {
  canDepart: boolean;
  reasons: string[];
}

export interface PurchaseResult {
  gameState: GameState;
  success: boolean;
  message: string;
}

export function buyFood(gameState: GameState, amount: number): PurchaseResult {
  const totalCost = amount * FOOD_PRICE;
  if (gameState.gold < totalCost) {
    return {
      gameState,
      success: false,
      message: '金币不足',
    };
  }
  return {
    gameState: {
      ...gameState,
      gold: gameState.gold - totalCost,
      food: gameState.food + amount,
    },
    success: true,
    message: '购买补给成功',
  };
}

export function buySpareParts(gameState: GameState, amount: number): PurchaseResult {
  const totalCost = amount * SPARE_PARTS_PRICE;
  if (gameState.gold < totalCost) {
    return {
      gameState,
      success: false,
      message: '金币不足',
    };
  }
  return {
    gameState: {
      ...gameState,
      gold: gameState.gold - totalCost,
      spareParts: gameState.spareParts + amount,
    },
    success: true,
    message: '购买备用零件成功',
  };
}

export function buyRecommendedSupplies(gameState: GameState): PurchaseResult {
  const totalCost = RECOMMENDED_FOOD * FOOD_PRICE + RECOMMENDED_SPARE_PARTS * SPARE_PARTS_PRICE;
  if (gameState.gold < totalCost) {
    return {
      gameState,
      success: false,
      message: '金币不足',
    };
  }
  return {
    gameState: {
      ...gameState,
      gold: gameState.gold - totalCost,
      food: gameState.food + RECOMMENDED_FOOD,
      spareParts: gameState.spareParts + RECOMMENDED_SPARE_PARTS,
    },
    success: true,
    message: '购买推荐采购包成功',
  };
}

export function canDepart(gameState: GameState): DepartureCheck {
  const reasons: string[] = [];

  if (gameState.food < MIN_FOOD_TO_DEPART) {
    reasons.push('补给不足');
  }
  if (gameState.spareParts < MIN_SPARE_PARTS_TO_DEPART) {
    reasons.push('备用零件不足');
  }
  if (gameState.caravanHp <= MIN_CARAVAN_HP_TO_DEPART) {
    reasons.push('货车耐久不足');
  }
  if (gameState.morale <= MIN_MORALE_TO_DEPART) {
    reasons.push('士气不足');
  }

  return {
    canDepart: reasons.length === 0,
    reasons,
  };
}
