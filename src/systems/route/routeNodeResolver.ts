import type { GameState } from '../../core/types';

export function resolveRouteNode(gameState: GameState, nodeId: string): string {
  if (gameState.resolvedRouteNodeIds.includes(nodeId)) {
    return '该节点已结算，无法重复领取。';
  }

  switch (nodeId) {
    case 'n3_d9':
      gameState.food += 4;
      gameState.resolvedRouteNodeIds.push(nodeId);
      return '发现商队残骸，获得补给 +4';
    case 'n3_d14':
      gameState.spareParts += 1;
      gameState.resolvedRouteNodeIds.push(nodeId);
      return '发现遗弃工具箱，获得备用零件 +1';
    default:
      return '该节点暂未开放';
  }
}
