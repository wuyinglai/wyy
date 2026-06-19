import type { GameState } from '../../core/types';

export interface EventChoiceResult {
  gameState: GameState;
  success: boolean;
  message: string;
}

export function resolveRouteEventChoice(
  gameState: GameState,
  nodeId: string,
  choiceId: string
): EventChoiceResult {
  // 防止重复结算
  if (gameState.resolvedEventNodeIds.includes(nodeId)) {
    return {
      gameState,
      success: false,
      message: '该事件已结算',
    };
  }

  // =============== 第 3 天：断裂路面 ===============
  if (nodeId === 'n3_d3') {
    if (choiceId === 'use_spare_part') {
      if (gameState.spareParts < 1) {
        return {
          gameState,
          success: false,
          message: '备用零件不足',
        };
      }
      gameState.spareParts -= 1;
      gameState.resolvedEventNodeIds.push(nodeId);
      return {
        gameState,
        success: true,
        message: '使用备用零件修好路面，商队安全通过。',
      };
    }

    if (choiceId === 'detour') {
      gameState.day += 2;
      gameState.food = Math.max(0, gameState.food - 2);
      gameState.resolvedEventNodeIds.push(nodeId);
      return {
        gameState,
        success: true,
        message: '商队绕过断裂路面，额外消耗 2 天和 2 补给。',
      };
    }

    if (choiceId === 'force_cross') {
      gameState.caravanHp = Math.max(1, gameState.caravanHp - 6);
      gameState.resolvedEventNodeIds.push(nodeId);
      return {
        gameState,
        success: true,
        message: '货车强行通过断裂路面，货车耐久 -6。',
      };
    }

    return {
      gameState,
      success: false,
      message: '未知选项',
    };
  }

  // =============== 第 8 天：受伤旅人 ===============
  if (nodeId === 'n3_d8') {
    if (choiceId === 'give_food') {
      if (gameState.food < 1) {
        return {
          gameState,
          success: false,
          message: '补给不足',
        };
      }
      gameState.food -= 1;
      gameState.morale = Math.min(gameState.moraleMax, gameState.morale + 1);
      gameState.resolvedEventNodeIds.push(nodeId);
      return {
        gameState,
        success: true,
        message: '你们分给旅人一些补给，士气 +1。',
      };
    }

    if (choiceId === 'give_gold') {
      if (gameState.gold < 5) {
        return {
          gameState,
          success: false,
          message: '金币不足',
        };
      }
      gameState.gold -= 5;
      gameState.enemyIntel += 1;
      gameState.resolvedEventNodeIds.push(nodeId);
      return {
        gameState,
        success: true,
        message: '旅人提供了灰兽和劫匪活动线索，敌情 +1。',
      };
    }

    if (choiceId === 'ignore') {
      gameState.resolvedEventNodeIds.push(nodeId);
      return {
        gameState,
        success: true,
        message: '商队继续前进。N3.1 教学阶段暂无惩罚。',
      };
    }

    return {
      gameState,
      success: false,
      message: '未知选项',
    };
  }

  // =============== 第 18 天：驿站灯火（自动事件） ===============
  if (nodeId === 'n3_d18') {
    gameState.morale = Math.min(gameState.moraleMax, gameState.morale + 1);
    gameState.resolvedEventNodeIds.push(nodeId);
    return {
      gameState,
      success: true,
      message: '远处出现灰灯驿站的灯火，队伍士气 +1。前方灰烬母巢可绕开，也可挑战。',
    };
  }

  return {
    gameState,
    success: false,
    message: '该节点暂未开放事件。',
  };
}
