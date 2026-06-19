import { describe, it, expect } from 'vitest';
import { createNewGame } from '../core/createNewGame';
import {
  buyFood,
  buySpareParts,
  buyRecommendedSupplies,
  canDepart,
} from '../systems/caravan/purchaseEngine';

describe('purchaseEngine', () => {
  it('buyFood 购买 1 补给后, gold -2, food +1', () => {
    const state = createNewGame();
    const result = buyFood(state, 1);
    expect(result.gold).toBe(158);
    expect(result.food).toBe(1);
  });

  it('buyFood 金币不足时不购买', () => {
    const state = createNewGame();
    state.gold = 1;
    const result = buyFood(state, 1);
    expect(result.gold).toBe(1);
    expect(result.food).toBe(0);
  });

  it('buySpareParts 购买 1 备用零件后, gold -5, spareParts +1', () => {
    const state = createNewGame();
    const result = buySpareParts(state, 1);
    expect(result.gold).toBe(155);
    expect(result.spareParts).toBe(1);
  });

  it('buyRecommendedSupplies 后, gold = 92, food = 24, spareParts = 4', () => {
    const state = createNewGame();
    const result = buyRecommendedSupplies(state);
    expect(result.gold).toBe(92);
    expect(result.food).toBe(24);
    expect(result.spareParts).toBe(4);
  });

  it('canDepart 初始状态不能出发', () => {
    const state = createNewGame();
    const result = canDepart(state);
    expect(result.canDepart).toBe(false);
  });

  it('canDepart 推荐采购包后可以出发', () => {
    let state = createNewGame();
    state = buyRecommendedSupplies(state);
    const result = canDepart(state);
    expect(result.canDepart).toBe(true);
  });

  it('不存在 silver 字段', () => {
    const state = createNewGame();
    expect('silver' in state).toBe(false);
  });
});
