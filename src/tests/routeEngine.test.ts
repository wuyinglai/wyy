import { describe, it, expect } from 'vitest';
import { createNewGame } from '../core/createNewGame';
import {
  startRoute,
  advanceRoute,
  isAtRouteEnd,
  getCurrentRoute,
  getCurrentRouteNode,
} from '../systems/route/routeEngine';
import { resolveRouteNode } from '../systems/route/routeNodeResolver';
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

      advanceRoute(state);
      advanceRoute(state);

      expect(state.day).toBe(3);
      expect(state.currentRouteNodeId).toBe('n3_d3');
      expect(state.food).toBe(23);
    });
  });

  describe('isAtRouteEnd', () => {
    it('第 1 天 isAtRouteEnd 返回 false', () => {
      const state = createNewGame();
      startRoute(state, 'graybridge_to_graylamp');
      expect(isAtRouteEnd(state)).toBe(false);
    });

    it('推进到第 20 天后，isAtRouteEnd 返回 true', () => {
      const state = createNewGame();
      state.food = 100;
      startRoute(state, 'graybridge_to_graylamp');

      // Advance 19 times to reach day 20
      for (let i = 0; i < 19; i++) {
        advanceRoute(state);
      }

      expect(state.currentRouteNodeId).toBe('n3_d20');
      expect(isAtRouteEnd(state)).toBe(true);
    });
  });

  describe('getCurrentRoute / getCurrentRouteNode', () => {
    it('startRoute 后 getCurrentRoute 返回有效路线', () => {
      const state = createNewGame();
      startRoute(state, 'graybridge_to_graylamp');
      const route = getCurrentRoute(state);
      expect(route).not.toBeNull();
      expect(route!.id).toBe('graybridge_to_graylamp');
    });

    it('未开始路线时 getCurrentRoute 返回 null', () => {
      const state = createNewGame();
      expect(getCurrentRoute(state)).toBeNull();
    });

    it('getCurrentRouteNode 返回当前节点', () => {
      const state = createNewGame();
      startRoute(state, 'graybridge_to_graylamp');
      const node = getCurrentRouteNode(state);
      expect(node).not.toBeNull();
      expect(node!.id).toBe('n3_d1');
    });
  });

  describe('resolveRouteNode', () => {
    it('结算 n3_d9 后 food +4', () => {
      const state = createNewGame();
      state.food = 10;
      const message = resolveRouteNode(state, 'n3_d9');
      expect(state.food).toBe(14);
      expect(message).toBe('发现商队残骸，获得补给 +4');
      expect(state.resolvedRouteNodeIds).toContain('n3_d9');
    });

    it('结算 n3_d14 后 spareParts +1', () => {
      const state = createNewGame();
      state.spareParts = 0;
      const message = resolveRouteNode(state, 'n3_d14');
      expect(state.spareParts).toBe(1);
      expect(message).toBe('发现遗弃工具箱，获得备用零件 +1');
      expect(state.resolvedRouteNodeIds).toContain('n3_d14');
    });

    it('同一资源节点重复结算，不会重复加资源', () => {
      const state = createNewGame();
      state.food = 10;
      resolveRouteNode(state, 'n3_d9');
      expect(state.food).toBe(14);

      const secondMessage = resolveRouteNode(state, 'n3_d9');
      expect(state.food).toBe(14);
      expect(secondMessage).toBe('该节点已结算，无法重复领取。');
    });

    it('未开放节点返回暂未开放消息', () => {
      const state = createNewGame();
      const message = resolveRouteNode(state, 'n3_d5');
      expect(message).toBe('该节点暂未开放');
    });
  });

  describe('game state fields', () => {
    it('createNewGame().resolvedRouteNodeIds 初始为空数组', () => {
      const state = createNewGame();
      expect(state.resolvedRouteNodeIds).toEqual([]);
    });

    it('不存在 silver 字段', () => {
      const state = createNewGame();
      expect('silver' in state).toBe(false);
    });
  });
});
