import { describe, it, expect } from 'vitest';
import { createNewGame } from '../core/createNewGame';
import {
  buyFood,
  buySpareParts,
  buyRecommendedSupplies,
  canDepart,
} from '../systems/caravan/purchaseEngine';

describe('purchaseEngine', () => {
  it('buyFood 成功时 success = true, message = "购买补给成功"', () => {
    const state = createNewGame();
    const result = buyFood(state, 1);
    expect(result.success).toBe(true);
    expect(result.message).toBe('购买补给成功');
    expect(result.gameState.gold).toBe(158);
    expect(result.gameState.food).toBe(1);
  });

  it('buyFood 金币不足时 success = false, message = "金币不足", 资源不变', () => {
    const state = createNewGame();
    state.gold = 1;
    const result = buyFood(state, 1);
    expect(result.success).toBe(false);
    expect(result.message).toBe('金币不足');
    expect(result.gameState.gold).toBe(1);
    expect(result.gameState.food).toBe(0);
  });

  it('buySpareParts 成功时 success = true', () => {
    const state = createNewGame();
    const result = buySpareParts(state, 1);
    expect(result.success).toBe(true);
    expect(result.message).toBe('购买备用零件成功');
    expect(result.gameState.gold).toBe(155);
    expect(result.gameState.spareParts).toBe(1);
  });

  it('buyRecommendedSupplies 成功后, gold = 92, food = 24, spareParts = 4', () => {
    const state = createNewGame();
    const result = buyRecommendedSupplies(state);
    expect(result.success).toBe(true);
    expect(result.message).toBe('购买推荐采购包成功');
    expect(result.gameState.gold).toBe(92);
    expect(result.gameState.food).toBe(24);
    expect(result.gameState.spareParts).toBe(4);
  });

  it('canDepart 初始状态不能出发', () => {
    const state = createNewGame();
    const result = canDepart(state);
    expect(result.canDepart).toBe(false);
  });

  it('canDepart 推荐采购包后可以出发', () => {
    const state = createNewGame();
    const purchase = buyRecommendedSupplies(state);
    const result = canDepart(purchase.gameState);
    expect(result.canDepart).toBe(true);
  });

  it('不存在 silver 字段', () => {
    const state = createNewGame();
    expect('silver' in state).toBe(false);
  });
});
