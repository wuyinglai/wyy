import { describe, it, expect } from 'vitest';
import { createNewGame } from '../core/createNewGame';
import {
  buyFood,
  buySpareParts,
  buyRecommendedSupplies,
  canDepart,
} from '../systems/caravan/purchaseEngine';
import { getLocationPrices } from '../data/locationPrices';

describe('purchaseEngine', () => {
  it('town 下 foodPrice = 2, sparePartPrice = 8', () => {
    const prices = getLocationPrices('town');
    expect(prices.foodPrice).toBe(2);
    expect(prices.sparePartPrice).toBe(8);
  });

  it('outpost 下 foodPrice = 4, sparePartPrice = 12', () => {
    const prices = getLocationPrices('outpost');
    expect(prices.foodPrice).toBe(4);
    expect(prices.sparePartPrice).toBe(12);
  });

  it('smallTown 下 foodPrice = 5, sparePartPrice = 14', () => {
    const prices = getLocationPrices('smallTown');
    expect(prices.foodPrice).toBe(5);
    expect(prices.sparePartPrice).toBe(14);
  });

  it('village 下 foodPrice = 6', () => {
    const prices = getLocationPrices('village');
    expect(prices.foodPrice).toBe(6);
  });

  it('village 不能买备用零件', () => {
    const state = createNewGame();
    const result = buySpareParts(state, 'village', 1);
    expect(result.success).toBe(false);
    expect(result.message).toBe('此地不售卖备用零件');
    expect(result.gameState.spareParts).toBe(0);
    expect(result.gameState.gold).toBe(160);
  });

  it('village 不能买推荐采购包', () => {
    const state = createNewGame();
    const result = buyRecommendedSupplies(state, 'village');
    expect(result.success).toBe(false);
    expect(result.message).toBe('此地无法购买推荐采购包');
    expect(result.gameState.food).toBe(0);
    expect(result.gameState.spareParts).toBe(0);
    expect(result.gameState.gold).toBe(160);
  });

  it('town 下 buyFood 1 个花费 2 金币', () => {
    const state = createNewGame();
    const result = buyFood(state, 'town', 1);
    expect(result.success).toBe(true);
    expect(result.message).toBe('购买补给成功');
    expect(result.gameState.gold).toBe(158);
    expect(result.gameState.food).toBe(1);
  });

  it('town 下 buySpareParts 1 个花费 8 金币', () => {
    const state = createNewGame();
    const result = buySpareParts(state, 'town', 1);
    expect(result.success).toBe(true);
    expect(result.message).toBe('购买备用零件成功');
    expect(result.gameState.gold).toBe(152);
    expect(result.gameState.spareParts).toBe(1);
  });

  it('town 下购买推荐采购包后 gold = 80, food = 24, spareParts = 4', () => {
    const state = createNewGame();
    const result = buyRecommendedSupplies(state, 'town');
    expect(result.success).toBe(true);
    expect(result.message).toBe('购买推荐采购包成功');
    expect(result.gameState.gold).toBe(80);
    expect(result.gameState.food).toBe(24);
    expect(result.gameState.spareParts).toBe(4);
  });

  it('buyFood 金币不足时 success = false, 资源不变', () => {
    const state = createNewGame();
    state.gold = 1;
    const result = buyFood(state, 'town', 1);
    expect(result.success).toBe(false);
    expect(result.message).toBe('金币不足');
    expect(result.gameState.gold).toBe(1);
    expect(result.gameState.food).toBe(0);
  });

  it('canDepart 初始状态不能出发', () => {
    const state = createNewGame();
    const result = canDepart(state);
    expect(result.canDepart).toBe(false);
  });

  it('canDepart 推荐采购包后可以出发', () => {
    const state = createNewGame();
    const purchase = buyRecommendedSupplies(state, 'town');
    const result = canDepart(purchase.gameState);
    expect(result.canDepart).toBe(true);
  });

  it('不存在 silver 字段', () => {
    const state = createNewGame();
    expect('silver' in state).toBe(false);
  });

  it('不再出现 sparePartPrice = 5 的旧逻辑', () => {
    // Ensure no location uses the old wrong price
    for (const key of ['city', 'town', 'outpost', 'smallTown', 'village'] as const) {
      const prices = getLocationPrices(key);
      expect(prices.sparePartPrice).not.toBe(5);
    }
  });
});
