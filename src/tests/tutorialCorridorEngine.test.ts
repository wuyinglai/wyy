import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../core/types';
import { tutorialCorridorMap } from '../data/tutorialCorridorMap';
import { createNewGame } from '../core/createNewGame';
import {
  startTutorialCorridor,
  moveTutorialCorridor,
  resolveTutorialCorridorNode,
  requiresTutorialCorridorResolution,
  getVisibleTutorialCorridorNodes,
} from '../systems/tutorial/tutorialCorridorEngine';

function createTestGameState(): GameState {
  const gameState = createNewGame();
  // Override for testing
  gameState.food = 10;
  gameState.gold = 100;
  gameState.spareParts = 2;
  gameState.morale = 5;
  gameState.caravanHp = 20;
  gameState.caravanMaxHp = 20;
  return gameState;
}

// 辅助函数：移动到指定 index，途中自动处理需要处理的节点
function moveToIndex(gameState: GameState, targetIndex: number): void {
  while (gameState.tutorialCorridorIndex < targetIndex) {
    const result = moveTutorialCorridor(gameState, 'right');
    if (!result.success) {
      // 如果移动失败，说明需要处理当前节点
      resolveTutorialCorridorNode(gameState);
    }
  }
}

describe('tutorialCorridorEngine - Phase 4C', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = createTestGameState();
    startTutorialCorridor(gameState, 'tutorial_corridor_graybridge_to_graylamp');
  });

  describe('requiresTutorialCorridorResolution', () => {
    it('road 节点不需要处理', () => {
      const roadNode = tutorialCorridorMap.nodes[1]; // tutorial_01_old_road
      expect(requiresTutorialCorridorResolution(roadNode)).toBe(false);
    });

    it('town 节点不需要处理', () => {
      const townNode = tutorialCorridorMap.nodes[0]; // tutorial_00_graybridge
      expect(requiresTutorialCorridorResolution(townNode)).toBe(false);
    });

    it('event 节点需要处理', () => {
      const eventNode = tutorialCorridorMap.nodes[2]; // tutorial_02_broken_road
      expect(requiresTutorialCorridorResolution(eventNode)).toBe(true);
    });

    it('resource 节点需要处理', () => {
      const resourceNode = tutorialCorridorMap.nodes[5]; // tutorial_05_caravan_wreck
      expect(requiresTutorialCorridorResolution(resourceNode)).toBe(true);
    });

    it('battle 节点需要处理', () => {
      const battleNode = tutorialCorridorMap.nodes[8]; // tutorial_08_ash_beast
      expect(requiresTutorialCorridorResolution(battleNode)).toBe(true);
    });
  });

  describe('moveTutorialCorridor - 节点处理检查', () => {
    it('event 节点未处理时，不能向右前进', () => {
      // 移动到 index 2 (event 节点)
      moveTutorialCorridor(gameState, 'right'); // 0 -> 1
      moveTutorialCorridor(gameState, 'right'); // 1 -> 2

      // 尝试继续向右，应该失败
      const result = moveTutorialCorridor(gameState, 'right');
      expect(result.success).toBe(false);
      expect(result.message).toBe('请先处理当前节点');
    });

    it('resource 节点未处理时，不能向右前进', () => {
      // 先处理 index 2 的 event
      moveToIndex(gameState, 2);
      resolveTutorialCorridorNode(gameState);
      // 继续移动到 index 5
      moveToIndex(gameState, 5);

      const result = moveTutorialCorridor(gameState, 'right');
      expect(result.success).toBe(false);
      expect(result.message).toBe('请先处理当前节点');
    });

    it('battle 节点未处理时，不能向右前进', () => {
      // 先处理中间所有需要处理的节点
      moveToIndex(gameState, 8);

      const result = moveTutorialCorridor(gameState, 'right');
      expect(result.success).toBe(false);
      expect(result.message).toBe('请先处理当前节点');
    });

    it('road 节点不需要处理，可以继续前进', () => {
      // 移动到 index 1 (road 节点)
      moveTutorialCorridor(gameState, 'right');

      // 应该可以继续前进
      const result = moveTutorialCorridor(gameState, 'right');
      expect(result.success).toBe(true);
    });

    it('处理 event 后，可以继续向右前进', () => {
      // 移动到 index 2 (event 节点)
      moveTutorialCorridor(gameState, 'right');
      moveTutorialCorridor(gameState, 'right');

      // 处理节点
      resolveTutorialCorridorNode(gameState);

      // 现在应该可以继续前进
      const result = moveTutorialCorridor(gameState, 'right');
      expect(result.success).toBe(true);
    });

    it('处理 resource 后，可以继续向右前进', () => {
      // 移动到 index 5
      moveToIndex(gameState, 5);

      // 处理节点
      resolveTutorialCorridorNode(gameState);

      // 现在应该可以继续前进
      const result = moveTutorialCorridor(gameState, 'right');
      expect(result.success).toBe(true);
    });

    it('处理 battle 后，可以继续向右前进', () => {
      // 移动到 index 8
      moveToIndex(gameState, 8);

      // 处理节点
      resolveTutorialCorridorNode(gameState);

      // 现在应该可以继续前进
      const result = moveTutorialCorridor(gameState, 'right');
      expect(result.success).toBe(true);
    });

    it('未处理节点阻止前进时，day 不变', () => {
      // 移动到 index 2 (event 节点)
      moveTutorialCorridor(gameState, 'right');
      moveTutorialCorridor(gameState, 'right');

      const dayBefore = gameState.day;

      // 尝试继续前进，应该失败
      moveTutorialCorridor(gameState, 'right');

      expect(gameState.day).toBe(dayBefore);
    });

    it('未处理节点阻止前进时，food 不变', () => {
      // 移动到 index 2 (event 节点)
      moveTutorialCorridor(gameState, 'right');
      moveTutorialCorridor(gameState, 'right');

      const foodBefore = gameState.food;

      // 尝试继续前进，应该失败
      moveTutorialCorridor(gameState, 'right');

      expect(gameState.food).toBe(foodBefore);
    });
  });

  describe('resolveTutorialCorridorNode - 资源节点', () => {
    it('商队残骸第一次处理 food +4', () => {
      // 移动到 index 5 (tutorial_05_caravan_wreck)
      moveToIndex(gameState, 5);

      const foodBefore = gameState.food;
      resolveTutorialCorridorNode(gameState);

      expect(gameState.food).toBe(foodBefore + 4);
    });

    it('商队残骸重复处理不再加 food', () => {
      // 移动到 index 5
      moveToIndex(gameState, 5);

      resolveTutorialCorridorNode(gameState);
      const foodAfterFirst = gameState.food;

      // 再次尝试处理
      resolveTutorialCorridorNode(gameState);

      expect(gameState.food).toBe(foodAfterFirst);
    });

    it('遗弃工具箱第一次处理 spareParts +1', () => {
      // 移动到 index 7 (tutorial_07_abandoned_toolbox)
      moveToIndex(gameState, 7);

      const partsBefore = gameState.spareParts;
      resolveTutorialCorridorNode(gameState);

      expect(gameState.spareParts).toBe(partsBefore + 1);
    });

    it('遗弃工具箱重复处理不再加 spareParts', () => {
      // 移动到 index 7
      moveToIndex(gameState, 7);

      resolveTutorialCorridorNode(gameState);
      const partsAfterFirst = gameState.spareParts;

      // 再次尝试处理
      resolveTutorialCorridorNode(gameState);

      expect(gameState.spareParts).toBe(partsAfterFirst);
    });

    it('干涸水井第一次处理 food +2', () => {
      // 移动到 index 11 (tutorial_11_dry_well)
      moveToIndex(gameState, 11);

      const foodBefore = gameState.food;
      resolveTutorialCorridorNode(gameState);

      expect(gameState.food).toBe(foodBefore + 2);
    });

    it('旧补给箱第一次处理 food +3', () => {
      // 移动到 index 15 (tutorial_15_supply_crate)
      moveToIndex(gameState, 15);

      const foodBefore = gameState.food;
      resolveTutorialCorridorNode(gameState);

      expect(gameState.food).toBe(foodBefore + 3);
    });
  });

  describe('resolveTutorialCorridorNode - 事件节点', () => {
    it('断裂路面有 spareParts 时 spareParts -1', () => {
      // 移动到 index 2 (tutorial_02_broken_road)
      moveTutorialCorridor(gameState, 'right');
      moveTutorialCorridor(gameState, 'right');

      gameState.spareParts = 2;
      const partsBefore = gameState.spareParts;

      resolveTutorialCorridorNode(gameState);

      expect(gameState.spareParts).toBe(partsBefore - 1);
    });

    it('断裂路面无 spareParts 时 caravanHp -5', () => {
      // 移动到 index 2
      moveTutorialCorridor(gameState, 'right');
      moveTutorialCorridor(gameState, 'right');

      gameState.spareParts = 0;
      const hpBefore = gameState.caravanHp;

      resolveTutorialCorridorNode(gameState);

      expect(gameState.caravanHp).toBe(hpBefore - 5);
    });

    it('受伤旅人有 food 时 food -1，morale +1', () => {
      // 先处理 index 2 的断裂路面（消耗 spareParts，不消耗 food）
      moveToIndex(gameState, 2);
      gameState.spareParts = 2; // 确保有 spareParts
      resolveTutorialCorridorNode(gameState);

      // 继续到 index 3 (road)
      moveTutorialCorridor(gameState, 'right');
      // 到 index 4 (injured_traveler)
      moveTutorialCorridor(gameState, 'right');

      gameState.food = 5;
      gameState.morale = 5;
      const foodBefore = gameState.food;
      const moraleBefore = gameState.morale;

      resolveTutorialCorridorNode(gameState);

      expect(gameState.food).toBe(foodBefore - 1);
      expect(gameState.morale).toBe(moraleBefore + 1);
    });

    it('受伤旅人无 food 时不扣 food', () => {
      // 先处理 index 2
      moveToIndex(gameState, 2);
      gameState.spareParts = 2;
      resolveTutorialCorridorNode(gameState);

      // 到 index 4
      moveTutorialCorridor(gameState, 'right');
      moveTutorialCorridor(gameState, 'right');

      gameState.food = 0;

      resolveTutorialCorridorNode(gameState);

      expect(gameState.food).toBe(0);
    });

    it('驿站灯火 morale +1 且不超过 moraleMax', () => {
      // 移动到 index 10
      moveToIndex(gameState, 10);

      gameState.morale = 9;
      resolveTutorialCorridorNode(gameState);

      expect(gameState.morale).toBe(10);
    });

    it('驿站外灯 morale +1 且不超过 moraleMax', () => {
      // 移动到 index 18
      moveToIndex(gameState, 18);

      gameState.morale = 9;
      resolveTutorialCorridorNode(gameState);

      expect(gameState.morale).toBe(10);
    });
  });

  describe('resolveTutorialCorridorNode - 战斗节点', () => {
    it('战斗节点处理后只返回占位 message，不进入正式战斗', () => {
      // 移动到 index 8
      moveToIndex(gameState, 8);

      const result = resolveTutorialCorridorNode(gameState);

      expect(result.success).toBe(true);
      expect(result.message).toContain('战斗系统后续开放');
    });

    it('劫匪拦路节点处理后只返回占位 message', () => {
      // 移动到 index 13
      moveToIndex(gameState, 13);

      const result = resolveTutorialCorridorNode(gameState);

      expect(result.success).toBe(true);
      expect(result.message).toContain('战斗系统后续开放');
    });
  });

  describe('向左返回', () => {
    it('向左返回不重复结算', () => {
      // 移动到 index 2 并处理
      moveTutorialCorridor(gameState, 'right');
      moveTutorialCorridor(gameState, 'right');

      gameState.spareParts = 2;
      resolveTutorialCorridorNode(gameState);
      const sparePartsAfterResolve = gameState.spareParts; // 应该是 1

      // 向左返回
      moveTutorialCorridor(gameState, 'left');

      // 再次向右移动到 index 2
      moveTutorialCorridor(gameState, 'right');

      // 尝试再次处理，应该返回已处理
      const result = resolveTutorialCorridorNode(gameState);
      expect(result.message).toBe('该节点已经处理过');
      expect(gameState.spareParts).toBe(sparePartsAfterResolve); // 资源不应该再变化
    });
  });

  describe('终点检查', () => {
    it('到终点后不能继续向右', () => {
      // 移动到最后一个节点，途中处理所有需要处理的节点
      moveToIndex(gameState, 19);

      // 处理终点节点
      resolveTutorialCorridorNode(gameState);

      const result = moveTutorialCorridor(gameState, 'right');
      expect(result.success).toBe(false);
      expect(result.message).toBe('已经到达灰灯驿站');
    });
  });

  describe('未访问节点保护', () => {
    it('未访问节点仍不泄露真实内容', () => {
      const visibleNodes = getVisibleTutorialCorridorNodes(gameState);

      // index 0 是当前节点，应该显示真实内容
      expect(visibleNodes[0].isUnknown).toBe(false);
      expect(visibleNodes[0].name).toBe('灰桥镇');

      // index 5 是未访问节点，应该不显示真实内容
      expect(visibleNodes[5].isUnknown).toBe(true);
      expect(visibleNodes[5].name).toBe('未知区域');
    });
  });

  describe('silver 字段检查', () => {
    it('没有 silver 字段', () => {
      expect((gameState as any).silver).toBeUndefined();
    });
  });
});
