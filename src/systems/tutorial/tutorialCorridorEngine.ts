import { GameState, TutorialCorridorNode } from '../../core/types';
import { tutorialCorridorMap } from '../../data/tutorialCorridorMap';

export function startTutorialCorridor(gameState: GameState, corridorId: string): boolean {
  if (corridorId !== 'tutorial_corridor_graybridge_to_graylamp') {
    return false;
  }

  gameState.activeTutorialCorridorId = corridorId;
  gameState.tutorialCorridorIndex = 0;
  gameState.visitedTutorialCorridorNodeIds = ['tutorial_00_graybridge'];

  return true;
}

export function getCurrentTutorialCorridorNode(gameState: GameState): TutorialCorridorNode | null {
  if (!gameState.activeTutorialCorridorId) {
    return null;
  }

  const index = gameState.tutorialCorridorIndex;
  return getTutorialCorridorNodeByIndex(gameState.activeTutorialCorridorId, index);
}

export function getTutorialCorridorNodeByIndex(
  corridorId: string,
  index: number
): TutorialCorridorNode | null {
  if (corridorId !== 'tutorial_corridor_graybridge_to_graylamp') {
    return null;
  }

  if (index < 0 || index >= tutorialCorridorMap.nodes.length) {
    return null;
  }

  return tutorialCorridorMap.nodes[index];
}

// 判断节点是否需要处理
export function requiresTutorialCorridorResolution(node: TutorialCorridorNode): boolean {
  // town 和 road 不需要处理
  if (node.type === 'town' || node.type === 'road') {
    return false;
  }
  // event, resource, battle, outpost 需要处理
  return true;
}

// 判断节点是否已处理
export function isTutorialCorridorNodeResolved(gameState: GameState, nodeId: string): boolean {
  return gameState.resolvedTutorialCorridorNodeIds.includes(nodeId);
}

// 判断是否可以离开当前节点
export function canLeaveCurrentTutorialCorridorNode(gameState: GameState): {
  canLeave: boolean;
  message: string;
} {
  const currentNode = getCurrentTutorialCorridorNode(gameState);
  if (!currentNode) {
    return { canLeave: false, message: '当前节点不存在' };
  }

  // 如果节点不需要处理，可以直接离开
  if (!requiresTutorialCorridorResolution(currentNode)) {
    return { canLeave: true, message: '该节点无需处理' };
  }

  // 如果节点已处理，可以离开
  if (isTutorialCorridorNodeResolved(gameState, currentNode.id)) {
    return { canLeave: true, message: '该节点已处理' };
  }

  // 节点需要处理但未处理
  return { canLeave: false, message: '请先处理当前节点' };
}

export function moveTutorialCorridor(
  gameState: GameState,
  direction: 'left' | 'right'
): { success: boolean; message: string } {
  if (!gameState.activeTutorialCorridorId) {
    return { success: false, message: '未进入教程路线' };
  }

  const currentIndex = gameState.tutorialCorridorIndex;
  const maxIndex = tutorialCorridorMap.nodes.length - 1;

  if (direction === 'right') {
    if (currentIndex >= maxIndex) {
      return { success: false, message: '已经到达灰灯驿站' };
    }

    // 检查当前节点是否需要处理且未处理
    const canLeave = canLeaveCurrentTutorialCorridorNode(gameState);
    if (!canLeave.canLeave) {
      return { success: false, message: canLeave.message };
    }

    const newIndex = currentIndex + 1;
    const newNode = tutorialCorridorMap.nodes[newIndex];

    gameState.tutorialCorridorIndex = newIndex;
    gameState.day += 1;
    gameState.food = Math.max(0, gameState.food - 1);

    if (!gameState.visitedTutorialCorridorNodeIds.includes(newNode.id)) {
      gameState.visitedTutorialCorridorNodeIds.push(newNode.id);
    }

    return { success: true, message: `移动到 ${newNode.name}` };
  }

  if (direction === 'left') {
    if (currentIndex <= 0) {
      return { success: false, message: '已经在起点' };
    }

    const newIndex = currentIndex - 1;
    const newNode = tutorialCorridorMap.nodes[newIndex];

    gameState.tutorialCorridorIndex = newIndex;

    if (!gameState.visitedTutorialCorridorNodeIds.includes(newNode.id)) {
      gameState.visitedTutorialCorridorNodeIds.push(newNode.id);
    }

    return { success: true, message: `返回到 ${newNode.name}` };
  }

  return { success: false, message: '无效的移动方向' };
}

export function resolveTutorialCorridorNode(gameState: GameState): {
  success: boolean;
  message: string;
} {
  if (!gameState.activeTutorialCorridorId) {
    return { success: false, message: '未进入教程路线' };
  }

  const currentNode = getCurrentTutorialCorridorNode(gameState);
  if (!currentNode) {
    return { success: false, message: '当前节点不存在' };
  }

  // 如果节点已处理，返回提示
  if (gameState.resolvedTutorialCorridorNodeIds.includes(currentNode.id)) {
    return { success: true, message: '该节点已经处理过' };
  }

  let message = '';

  switch (currentNode.id) {
    // town
    case 'tutorial_00_graybridge':
      message = '商队已在灰桥镇整备完毕。';
      break;

    // road
    case 'tutorial_01_old_road':
    case 'tutorial_03_quiet_road':
    case 'tutorial_06_ash_beast_trace':
    case 'tutorial_09_wind_gap':
    case 'tutorial_16_gray_fog':
    case 'tutorial_17_last_slope':
      message = '商队沿旧路继续前进。';
      break;

    // resource
    case 'tutorial_05_caravan_wreck':
      gameState.food += 4;
      message = '在商队残骸中找到 4 点补给。';
      break;

    case 'tutorial_07_abandoned_toolbox':
      gameState.spareParts += 1;
      message = '找到 1 个备用零件。';
      break;

    case 'tutorial_11_dry_well':
      gameState.food += 2;
      message = '在干涸水井附近找到 2 点补给。';
      break;

    case 'tutorial_15_supply_crate':
      gameState.food += 3;
      message = '打开旧补给箱，获得 3 点补给。';
      break;

    // event
    case 'tutorial_02_broken_road':
      if (gameState.spareParts >= 1) {
        gameState.spareParts -= 1;
        message = '消耗 1 个备用零件修补车轮，通过断裂路面。';
      } else {
        gameState.caravanHp = Math.max(0, gameState.caravanHp - 5);
        message = '缺少备用零件，商队强行通过，货车耐久 -5。';
      }
      break;

    case 'tutorial_04_injured_traveler':
      if (gameState.food >= 1) {
        gameState.food -= 1;
        gameState.morale = Math.min(gameState.moraleMax, gameState.morale + 1);
        message = '分出 1 点补给救助旅人，士气 +1。';
      } else {
        message = '补给不足，只能留下简单包扎。';
      }
      break;

    case 'tutorial_10_station_light':
      gameState.morale = Math.min(gameState.moraleMax, gameState.morale + 1);
      message = '远处驿站灯火鼓舞了商队，士气 +1。';
      break;

    case 'tutorial_12_bandit_shadow':
      message = '远处黑影一闪而过，商队提高了警惕。';
      break;

    case 'tutorial_14_broken_marker':
      message = '修正旧路标方向，确认灰灯驿站就在前方。';
      break;

    case 'tutorial_18_gate_event':
      gameState.morale = Math.min(gameState.moraleMax, gameState.morale + 1);
      message = '灰灯驿站外的灯火摇晃着，商队士气 +1。';
      break;

    // battle
    case 'tutorial_08_ash_beast':
      message = '遭遇灰烬幼兽。战斗系统后续开放，本次教学暂时放行。';
      break;

    case 'tutorial_13_ambush_placeholder':
      message = '遭遇劫匪拦路。战斗系统后续开放，本次教学暂时放行。';
      break;

    // outpost
    case 'tutorial_19_graylamp_outpost':
      message = '商队抵达灰灯驿站，第一段教学路线完成。';
      break;

    default:
      message = `${currentNode.name}：${currentNode.description}`;
  }

  gameState.resolvedTutorialCorridorNodeIds.push(currentNode.id);

  return { success: true, message };
}

export function getVisibleTutorialCorridorNodes(gameState: GameState): Array<
  TutorialCorridorNode & { isUnknown?: boolean; displaySymbol?: string }
> {
  if (!gameState.activeTutorialCorridorId) {
    return [];
  }

  return tutorialCorridorMap.nodes.map((node, index) => {
    const isVisited = gameState.visitedTutorialCorridorNodeIds.includes(node.id);
    const isCurrent = index === gameState.tutorialCorridorIndex;

    if (isVisited || isCurrent) {
      return { ...node, isUnknown: false };
    }

    return {
      id: node.id,
      index: node.index,
      type: node.type,
      name: '未知区域',
      description: '尚未探索',
      isUnknown: true,
      displaySymbol: '?',
    };
  });
}
