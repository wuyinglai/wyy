import type { GameState } from '../../core/types';
import { initialRoutes } from '../../data/initialRoutes';

export function startRoute(gameState: GameState, routeId: string): void {
  const route = initialRoutes.find(r => r.id === routeId);
  if (!route) {
    throw new Error(`Route not found: ${routeId}`);
  }

  const firstNode = route.nodes[0];
  if (!firstNode) {
    throw new Error(`Route has no nodes: ${routeId}`);
  }

  gameState.activeRouteId = routeId;
  gameState.currentRouteNodeId = firstNode.id;
  gameState.mainQuestStage = 'graybridge_to_graylamp';
}

export function advanceRoute(gameState: GameState): void {
  if (!gameState.activeRouteId) {
    throw new Error('No active route');
  }

  const route = initialRoutes.find(r => r.id === gameState.activeRouteId);
  if (!route) {
    throw new Error(`Active route not found: ${gameState.activeRouteId}`);
  }

  const currentNodeId = gameState.currentRouteNodeId;
  if (!currentNodeId) {
    throw new Error('No current route node');
  }

  const currentNodeIndex = route.nodes.findIndex(n => n.id === currentNodeId);
  if (currentNodeIndex === -1) {
    throw new Error(`Current node not found: ${currentNodeId}`);
  }

  // Record completed node
  if (!gameState.completedRouteNodeIds.includes(currentNodeId)) {
    gameState.completedRouteNodeIds.push(currentNodeId);
  }

  // Find next node
  const nextNodeIndex = currentNodeIndex + 1;
  if (nextNodeIndex >= route.nodes.length) {
    throw new Error('Already at last node');
  }

  const nextNode = route.nodes[nextNodeIndex];

  // Advance day
  gameState.day += 1;

  // Consume food (minimum 0)
  gameState.food = Math.max(0, gameState.food - 1);

  // Move to next node
  gameState.currentRouteNodeId = nextNode.id;
}
