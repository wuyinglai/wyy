import { describe, it, expect } from 'vitest';
import { createNewGame } from '../core/createNewGame';
import { startRoute, advanceRoute } from '../systems/route/routeEngine';
import { initialRoutes } from '../data/initialRoutes';

describe('routeEngine', () => {
  describe('N3.1 route data', () => {
    it('N3.1 路线有 20 个节点', () => {
      const route = initialRoutes.find(r => r.id === 'graybridge_to_graylamp');
      expect(route).toBeDefined();
      expect(route!.nodes.length).toBe(20);
    });

    it('第 1 天是出城 (start)', () => {
      const route = initialRoutes.find(r => r.id === 'graybridge_to_graylamp');
      expect(route!.nodes[0].name).toBe('出城');
      expect(route!.nodes[0].type).toBe('start');
      expect(route!.nodes[0].dayIndex).toBe(1);
    });

    it('第 20 天是到达灰灯驿站 (outpost)', () => {
      const route = initialRoutes.find(r => r.id === 'graybridge_to_graylamp');
      const lastNode = route!.nodes[19];
      expect(lastNode.name).toBe('到达灰灯驿站');
      expect(lastNode.type).toBe('outpost');
      expect(lastNode.dayIndex).toBe(20);
    });
  });

  describe('startRoute', () => {
    it('startRoute 后 activeRouteId = "graybridge_to_graylamp"', () => {
      const state = createNewGame();
      startRoute(state, 'graybridge_to_graylamp');
      expect(state.activeRouteId).toBe('graybridge_to_graylamp');
    });

    it('startRoute 后 currentRouteNodeId 是第 1 天节点', () => {
      const state = createNewGame();
      startRoute(state, 'graybridge_to_graylamp');
      expect(state.currentRouteNodeId).toBe('n3_d1');
    });

    it('startRoute 不扣补给 (food 不变)', () => {
      const state = createNewGame();
      const originalFood = state.food;
      startRoute(state, 'graybridge_to_graylamp');
      expect(state.food).toBe(originalFood);
    });

    it('startRoute 设置 mainQuestStage', () => {
      const state = createNewGame();
      startRoute(state, 'graybridge_to_graylamp');
      expect(state.mainQuestStage).toBe('graybridge_to_graylamp');
    });
  });

  describe('advanceRoute', () => {
    it('advanceRoute 后 day +1', () => {
      const state = createNewGame();
      startRoute(state, 'graybridge_to_graylamp');
      const originalDay = state.day;
      advanceRoute(state);
      expect(state.day).toBe(originalDay + 1);
    });

    it('advanceRoute 后 food -1', () => {
      const state = createNewGame();
      state.food = 20;
      startRoute(state, 'graybridge_to_graylamp');
      advanceRoute(state);
      expect(state.food).toBe(19);
    });

    it('advanceRoute 后 currentRouteNodeId 变成下一节点', () => {
      const state = createNewGame();
      startRoute(state, 'graybridge_to_graylamp');
      expect(state.currentRouteNodeId).toBe('n3_d1');
      advanceRoute(state);
      expect(state.currentRouteNodeId).toBe('n3_d2');
    });

    it('advanceRoute 会把旧节点加入 completedRouteNodeIds', () => {
      const state = createNewGame();
      startRoute(state, 'graybridge_to_graylamp');
      expect(state.completedRouteNodeIds).toEqual([]);
      advanceRoute(state);
      expect(state.completedRouteNodeIds).toContain('n3_d1');
    });

    it('food = 0 时 advanceRoute 不会让 food 变成负数', () => {
      const state = createNewGame();
      state.food = 0;
      startRoute(state, 'graybridge_to_graylamp');
      advanceRoute(state);
      expect(state.food).toBe(0);
    });

    it('连续 advanceRoute 正确推进节点', () => {
      const state = createNewGame();
      state.food = 25;
      startRoute(state, 'graybridge_to_graylamp');

      // createNewGame 初始 day = 1，推进2次后 day = 3
      advanceRoute(state); // day1 -> day2
      advanceRoute(state); // day2 -> day3

      expect(state.day).toBe(3);
      expect(state.currentRouteNodeId).toBe('n3_d3');
      expect(state.food).toBe(23);
    });
  });

  describe('game state fields', () => {
    it('不存在 silver 字段', () => {
      const state = createNewGame();
      expect('silver' in state).toBe(false);
    });
  });
});
