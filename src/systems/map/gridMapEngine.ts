import type {
  GameState,
  GridDirection,
  GridMapDefinition,
  GridMoveResult,
  GridPosition,
  GridTile,
  GridTileType,
} from '../../core/types';
import { getInitialGridMapById } from '../../data/initialGridMap';

const TILE_MESSAGE: Record<GridTileType, string> = {
  town: '你回到了城镇。',
  outpost: '你抵达了灰灯驿站，完整驿站功能后续开放。',
  calm: '商队穿过安静荒路。',
  road: '商队沿旧路前进。',
  resource: '发现资源点，具体结算后续开放。',
  event: '发现事件点，具体事件后续开放。',
  battle: '遭遇战斗点，战斗系统后续开放。',
  specialBattle: '发现特殊战斗点，后续开放。',
  optionalElite: '发现可选精英点，后续开放。',
  obstacle: '前方无法通行。',
};

export function getGridMap(mapId: string): GridMapDefinition | undefined {
  return getInitialGridMapById(mapId);
}

export function getTileById(mapId: string, tileId: string): GridTile | undefined {
  const map = getGridMap(mapId);
  if (!map) return undefined;
  return map.tiles.find((t) => t.id === tileId);
}

export function getTileAt(mapId: string, position: GridPosition): GridTile | undefined {
  const map = getGridMap(mapId);
  if (!map) return undefined;
  if (position.x < 0 || position.y < 0 || position.x >= map.width || position.y >= map.height) {
    return undefined;
  }
  return map.tiles.find((t) => t.x === position.x && t.y === position.y);
}

export function getAdjacentPositions(position: GridPosition): GridPosition[] {
  return [
    { x: position.x, y: position.y - 1 },
    { x: position.x, y: position.y + 1 },
    { x: position.x - 1, y: position.y },
    { x: position.x + 1, y: position.y },
  ];
}

export function startGridMap(gameState: GameState, mapId: string): GridMoveResult {
  const map = getGridMap(mapId);
  if (!map) {
    return { gameState, success: false, message: '地图不存在。' };
  }
  const startTile = getTileById(mapId, map.startTileId);
  if (!startTile) {
    return { gameState, success: false, message: '起点格子不存在。' };
  }

  gameState.activeMapId = mapId;
  gameState.playerPosition = { x: startTile.x, y: startTile.y };
  gameState.currentTileId = startTile.id;

  if (!gameState.visitedTileIds.includes(startTile.id)) {
    gameState.visitedTileIds.push(startTile.id);
  }
  if (!gameState.revealedTileIds.includes(startTile.id)) {
    gameState.revealedTileIds.push(startTile.id);
  }
  for (const pos of getAdjacentPositions(gameState.playerPosition)) {
    const tile = getTileAt(mapId, pos);
    if (tile && !gameState.revealedTileIds.includes(tile.id)) {
      gameState.revealedTileIds.push(tile.id);
    }
  }

  return {
    gameState,
    success: true,
    message: '进入灰桥镇外荒野',
    tile: startTile,
  };
}

export function getCurrentTile(gameState: GameState): GridTile | undefined {
  if (!gameState.activeMapId || !gameState.currentTileId) return undefined;
  return getTileById(gameState.activeMapId, gameState.currentTileId);
}

function directionToDelta(direction: GridDirection): GridPosition {
  switch (direction) {
    case 'up':
      return { x: 0, y: -1 };
    case 'down':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
  }
}

export function canMoveTo(
  gameState: GameState,
  direction: GridDirection,
): { canMove: boolean; tile?: GridTile; message: string } {
  if (!gameState.activeMapId || !gameState.playerPosition) {
    return { canMove: false, message: '尚未进入地图。' };
  }
  const map = getGridMap(gameState.activeMapId);
  if (!map) {
    return { canMove: false, message: '地图不存在。' };
  }
  const delta = directionToDelta(direction);
  const target: GridPosition = {
    x: gameState.playerPosition.x + delta.x,
    y: gameState.playerPosition.y + delta.y,
  };
  if (target.x < 0 || target.y < 0 || target.x >= map.width || target.y >= map.height) {
    return { canMove: false, message: '不能走出地图边界' };
  }
  const tile = getTileAt(gameState.activeMapId, target);
  if (!tile) {
    return { canMove: false, message: '目标位置无格子。' };
  }
  if (!tile.isPassable) {
    return { canMove: false, message: '前方无法通行' };
  }
  return { canMove: true, tile, message: TILE_MESSAGE[tile.type] };
}

export function moveOnGridMap(gameState: GameState, direction: GridDirection): GridMoveResult {
  const check = canMoveTo(gameState, direction);
  if (!check.canMove || !check.tile) {
    return { gameState, success: false, message: check.message };
  }
  const tile = check.tile;
  const mapId = gameState.activeMapId!;

  gameState.playerPosition = { x: tile.x, y: tile.y };
  gameState.currentTileId = tile.id;
  gameState.day += 1;
  gameState.food = Math.max(0, gameState.food - 1);

  if (!gameState.visitedTileIds.includes(tile.id)) {
    gameState.visitedTileIds.push(tile.id);
  }
  if (!gameState.revealedTileIds.includes(tile.id)) {
    gameState.revealedTileIds.push(tile.id);
  }
  for (const pos of getAdjacentPositions(gameState.playerPosition)) {
    const adjTile = getTileAt(mapId, pos);
    if (adjTile && !gameState.revealedTileIds.includes(adjTile.id)) {
      gameState.revealedTileIds.push(adjTile.id);
    }
  }

  return {
    gameState,
    success: true,
    message: TILE_MESSAGE[tile.type],
    tile,
  };
}
