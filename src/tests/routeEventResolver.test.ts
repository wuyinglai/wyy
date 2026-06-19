import { describe, it, expect } from 'vitest';
import { createNewGame } from '../core/createNewGame';
import { resolveRouteEventChoice } from '../systems/route/routeEventResolver';
import type { GameState } from '../core/types';

// =============== 断裂路面 n3_d3 ===============
describe('断裂路面 (n3_d3)', () => {
  it('使用备用零件成功后 spareParts -1', () => {
    const state = createNewGame();
    state.spareParts = 3;
    const result = resolveRouteEventChoice(state, 'n3_d3', 'use_spare_part');
    expect(result.success).toBe(true);
    expect(result.gameState.spareParts).toBe(2);
    expect(result.message).toBe('使用备用零件修好路面，商队安全通过。');
    expect(result.gameState.resolvedEventNodeIds).toContain('n3_d3');
  });

  it('备用零件不足时失败，资源不变', () => {
    const state = createNewGame();
    state.spareParts = 0;
    const result = resolveRouteEventChoice(state, 'n3_d3', 'use_spare_part');
    expect(result.success).toBe(false);
    expect(result.message).toBe('备用零件不足');
    expect(result.gameState.spareParts).toBe(0);
    expect(result.gameState.resolvedEventNodeIds).not.toContain('n3_d3');
  });

  it('绕路后 day +2，food -2', () => {
    const state = createNewGame();
    state.food = 10;
    const originalDay = state.day;
    const result = resolveRouteEventChoice(state, 'n3_d3', 'detour');
    expect(result.success).toBe(true);
    expect(result.gameState.day).toBe(originalDay + 2);
    expect(result.gameState.food).toBe(8);
    expect(result.message).toBe('商队绕过断裂路面，额外消耗 2 天和 2 补给。');
  });

  it('绕路时 food 不低于 0', () => {
    const state = createNewGame();
    state.food = 1;
    const result = resolveRouteEventChoice(state, 'n3_d3', 'detour');
    expect(result.success).toBe(true);
    expect(result.gameState.food).toBe(0);
  });

  it('强行通过后 caravanHp -6', () => {
    const state = createNewGame();
    state.caravanHp = 20;
    const result = resolveRouteEventChoice(state, 'n3_d3', 'force_cross');
    expect(result.success).toBe(true);
    expect(result.gameState.caravanHp).toBe(14);
    expect(result.message).toBe('货车强行通过断裂路面，货车耐久 -6。');
  });

  it('强行通过时 caravanHp 不低于 1', () => {
    const state = createNewGame();
    state.caravanHp = 3;
    const result = resolveRouteEventChoice(state, 'n3_d3', 'force_cross');
    expect(result.success).toBe(true);
    expect(result.gameState.caravanHp).toBe(1);
  });
});

// =============== 受伤旅人 n3_d8 ===============
describe('受伤旅人 (n3_d8)', () => {
  it('给补给后 food -1，morale +1', () => {
    const state = createNewGame();
    state.food = 5;
    const originalMorale = state.morale;
    const result = resolveRouteEventChoice(state, 'n3_d8', 'give_food');
    expect(result.success).toBe(true);
    expect(result.gameState.food).toBe(4);
    expect(result.gameState.morale).toBe(originalMorale + 1);
    expect(result.message).toBe('你们分给旅人一些补给，士气 +1。');
    expect(result.gameState.resolvedEventNodeIds).toContain('n3_d8');
  });

  it('food 不足时失败', () => {
    const state = createNewGame();
    state.food = 0;
    const result = resolveRouteEventChoice(state, 'n3_d8', 'give_food');
    expect(result.success).toBe(false);
    expect(result.message).toBe('补给不足');
    expect(result.gameState.food).toBe(0);
  });

  it('给 5 金币后 gold -5，enemyIntel +1', () => {
    const state = createNewGame();
    state.gold = 10;
    const originalEnemyIntel = state.enemyIntel;
    const result = resolveRouteEventChoice(state, 'n3_d8', 'give_gold');
    expect(result.success).toBe(true);
    expect(result.gameState.gold).toBe(5);
    expect(result.gameState.enemyIntel).toBe(originalEnemyIntel + 1);
    expect(result.message).toBe('旅人提供了灰兽和劫匪活动线索，敌情 +1。');
  });

  it('gold 不足时失败', () => {
    const state = createNewGame();
    state.gold = 3;
    const result = resolveRouteEventChoice(state, 'n3_d8', 'give_gold');
    expect(result.success).toBe(false);
    expect(result.message).toBe('金币不足');
    expect(result.gameState.gold).toBe(3);
  });

  it('不管时资源不变，事件标记为已结算', () => {
    const state = createNewGame();
    state.gold = 160;
    state.food = 10;
    state.spareParts = 2;
    const snapshot: GameState = JSON.parse(JSON.stringify(state));
    const result = resolveRouteEventChoice(state, 'n3_d8', 'ignore');
    expect(result.success).toBe(true);
    expect(result.gameState.gold).toBe(snapshot.gold);
    expect(result.gameState.food).toBe(snapshot.food);
    expect(result.gameState.spareParts).toBe(snapshot.spareParts);
    expect(result.gameState.caravanHp).toBe(snapshot.caravanHp);
    expect(result.gameState.morale).toBe(snapshot.morale);
    expect(result.gameState.resolvedEventNodeIds).toContain('n3_d8');
  });
});

// =============== 驿站灯火 n3_d18 ===============
describe('驿站灯火 (n3_d18)', () => {
  it('士气 +1', () => {
    const state = createNewGame();
    state.morale = 6;
    const result = resolveRouteEventChoice(state, 'n3_d18', 'auto');
    expect(result.success).toBe(true);
    expect(result.gameState.morale).toBe(7);
  });

  it('士气不超过 moraleMax', () => {
    const state = createNewGame();
    state.morale = state.moraleMax;
    const result = resolveRouteEventChoice(state, 'n3_d18', 'auto');
    expect(result.success).toBe(true);
    expect(result.gameState.morale).toBe(state.moraleMax);
  });

  it('重复结算不会重复加士气', () => {
    const state = createNewGame();
    state.morale = 6;
    resolveRouteEventChoice(state, 'n3_d18', 'auto');
    expect(state.morale).toBe(7);
    const result = resolveRouteEventChoice(state, 'n3_d18', 'auto');
    expect(state.morale).toBe(7);
    expect(result.success).toBe(false);
    expect(result.message).toBe('该事件已结算');
  });
});

// =============== 通用检查 ===============
describe('通用检查', () => {
  it('createNewGame().resolvedEventNodeIds 初始为空数组', () => {
    const state = createNewGame();
    expect(state.resolvedEventNodeIds).toEqual([]);
  });

  it('没有 silver 字段', () => {
    const state = createNewGame();
    expect('silver' in state).toBe(false);
  });

  it('同一事件重复结算不会重复加资源', () => {
    const state = createNewGame();
    state.spareParts = 3;
    resolveRouteEventChoice(state, 'n3_d3', 'use_spare_part');
    expect(state.spareParts).toBe(2);
    resolveRouteEventChoice(state, 'n3_d3', 'use_spare_part');
    expect(state.spareParts).toBe(2);
  });
});
