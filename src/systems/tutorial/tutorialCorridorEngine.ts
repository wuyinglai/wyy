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

  if (gameState.resolvedTutorialCorridorNodeIds.includes(currentNode.id)) {
    return { success: false, message: '该节点已处理过' };
  }

  let message = '';

  switch (currentNode.type) {
    case 'road':
      message = `${currentNode.name}：${currentNode.description}`;
      break;

    case 'event':
      if (currentNode.id === 'tutorial_10_station_light' || currentNode.id === 'tutorial_18_gate_event') {
        if (gameState.morale < 10) {
          gameState.morale += 1;
          message = `${currentNode.name}：士气恢复 +1`;
        } else {
          message = `${currentNode.name}：士气已满`;
        }
      } else {
        message = `${currentNode.name}：${currentNode.description}`;
      }
      break;

    case 'resource':
      if (currentNode.id === 'tutorial_05_caravan_wreck') {
        gameState.food += 4;
        message = `${currentNode.name}：获得补给 +4`;
      } else if (currentNode.id === 'tutorial_07_abandoned_toolbox') {
        gameState.spareParts += 1;
        message = `${currentNode.name}：获得备用零件 +1`;
      } else if (currentNode.id === 'tutorial_11_dry_well') {
        gameState.food += 2;
        message = `${currentNode.name}：获得补给 +2`;
      } else if (currentNode.id === 'tutorial_15_supply_crate') {
        gameState.food += 3;
        message = `${currentNode.name}：获得补给 +3`;
      } else {
        message = `${currentNode.name}：${currentNode.description}`;
      }
      break;

    case 'battle':
      message = `${currentNode.name}：战斗系统后续开放`;
      break;

    case 'town':
      message = `${currentNode.name}：${currentNode.description}`;
      break;

    case 'outpost':
      message = `${currentNode.name}：已到达灰灯驿站`;
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
