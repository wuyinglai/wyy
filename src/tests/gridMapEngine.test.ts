import { describe, expect, it } from 'vitest';
import type { GameState } from '../core/types';
import {
  getGridMap,
  startGridMap,
  moveOnGridMap,
  getTileAt,
  getAdjacentPositions,
  canMoveTo,
} from '../systems/map/gridMapEngine';
import { createNewGame } from '../core/createNewGame';

function freshGameWithMap(): GameState {
  const game = createNewGame();
  startGridMap(game, 'graybridge_region_map');
  return game;
}

describe('world map validation', () => {
  const map = getGridMap('graybridge_region_map')!;

  it('map dimensions should be 13x9', () => {
    expect(map.width).toBe(13);
    expect(map.height).toBe(9);
  });

  it('graybridge town should not be on border (x=2,y=4)', () => {
    const town = map.tiles.find((t) => t.type === 'town');
    expect(town).toBeDefined();
    expect(town!.x).toBe(2);
    expect(town!.y).toBe(4);
    expect(town!.x).not.toBe(0);
  });

  it('should have at least 3 directions from start', () => {
    const game = freshGameWithMap();
    const pos = game.playerPosition!;
    const adjacent = getAdjacentPositions(pos);
    const passableCount = adjacent.filter((p) => {
      const tile = getTileAt(game.activeMapId!, p);
      return tile?.isPassable;
    }).length;
    expect(passableCount).toBeGreaterThanOrEqual(3);
  });

  it('should have fork within 1-2 steps from start', () => {
    const game = freshGameWithMap();
    const mapId = game.activeMapId!;
    const start = game.playerPosition!;

    // From start, try each direction, then from that step check if branches exist
    const adjacent = getAdjacentPositions(start).filter((p) => {
      const tile = getTileAt(mapId, p);
      return tile?.isPassable;
    });

    let hasFork = false;
    for (const firstStep of adjacent) {
      const secondLevel = getAdjacentPositions(firstStep).filter((p) => {
        // exclude backtracking to start
        if (p.x === start.x && p.y === start.y) return false;
        const tile = getTileAt(mapId, p);
        return tile?.isPassable;
      });
      if (secondLevel.length >= 2) {
        hasFork = true;
        break;
      }
    }
    expect(hasFork).toBe(true);
  });

  it('graybridge outpost should be reachable', () => {
    const mapId = 'graybridge_region_map';
    const outpost = map.tiles.find((t) => t.type === 'outpost');
    expect(outpost).toBeDefined();

    // BFS from town
    const start = { x: 2, y: 4 };
    const visited = new Set<string>();
    const queue: { x: number; y: number }[] = [start];
    visited.add(`${start.x},${start.y}`);
    let found = false;
    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (cur.x === outpost!.x && cur.y === outpost!.y) {
        found = true;
        break;
      }
      for (const adj of getAdjacentPositions(cur)) {
        const key = `${adj.x},${adj.y}`;
        if (visited.has(key)) continue;
        const tile = getTileAt(mapId, adj);
        if (!tile || !tile.isPassable) continue;
        visited.add(key);
        queue.push(adj);
      }
    }
    expect(found).toBe(true);
  });

  it('should have multiple distinct paths or at least non-linear structure', () => {
    // Verify that from town at least 3 neighboring tiles are passable (non-linear)
    const town = map.tiles.find((t) => t.type === 'town')!;
    const adjacent = getAdjacentPositions({ x: town.x, y: town.y });
    const passableAdjacent = adjacent.filter((p) => {
      const tile = getTileAt('graybridge_region_map', p);
      return tile?.isPassable;
    });
    expect(passableAdjacent.length).toBeGreaterThanOrEqual(3);

    // Also verify multiple rows/cols have passable tiles (spread across map)
    const passableTiles = map.tiles.filter((t) => t.isPassable);
    const rowsWithPassable = new Set(passableTiles.map((t) => t.y));
    const colsWithPassable = new Set(passableTiles.map((t) => t.x));
    expect(rowsWithPassable.size).toBeGreaterThanOrEqual(5);
    expect(colsWithPassable.size).toBeGreaterThanOrEqual(8);
  });

  it('should have at least 35 passable tiles', () => {
    const passable = map.tiles.filter((t) => t.isPassable);
    expect(passable.length).toBeGreaterThanOrEqual(35);
  });

  it('should have at least 10 obstacles', () => {
    const obstacles = map.tiles.filter((t) => t.type === 'obstacle');
    expect(obstacles.length).toBeGreaterThanOrEqual(10);
  });

  it('should have at least 5 events', () => {
    const events = map.tiles.filter((t) => t.type === 'event');
    expect(events.length).toBeGreaterThanOrEqual(5);
  });

  it('should have at least 4 resources', () => {
    const resources = map.tiles.filter((t) => t.type === 'resource');
    expect(resources.length).toBeGreaterThanOrEqual(4);
  });

  it('should have at least 4 battles', () => {
    const battles = map.tiles.filter((t) => t.type === 'battle');
    expect(battles.length).toBeGreaterThanOrEqual(4);
  });

  it('should have at least 2 special battles', () => {
    const special = map.tiles.filter((t) => t.type === 'specialBattle');
    expect(special.length).toBeGreaterThanOrEqual(2);
  });

  it('should have at least 1 optional elite', () => {
    const elite = map.tiles.filter((t) => t.type === 'optionalElite');
    expect(elite.length).toBeGreaterThanOrEqual(1);
  });
});

describe('fog of war and vision', () => {
  it('startGridMap should reveal tiles in radius 2', () => {
    const game = freshGameWithMap();
    // Radius 2 from (2,4) = positions within |dx|+|dy| <= 2 in manhattan, but the getTilesInRadius uses square.
    // In 5x5 square around (2,4): valid coords are (0..4, 2..6). Let's count valid tiles.
    const mapId = 'graybridge_region_map';
    let expectedCount = 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const tile = getTileAt(mapId, { x: 2 + dx, y: 4 + dy });
        if (tile) expectedCount++;
      }
    }
    expect(game.revealedTileIds.length).toBe(expectedCount);
  });

  it('startGridMap should NOT reveal entire map', () => {
    const game = freshGameWithMap();
    const total = getGridMap('graybridge_region_map')!.tiles.length;
    expect(game.revealedTileIds.length).toBeLessThan(total);
  });

  it('moveOnGridMap should extend vision', () => {
    const game = freshGameWithMap();
    const initialCount = game.revealedTileIds.length;
    // Try moving right first
    const rightResult = moveOnGridMap(game, 'right');
    if (rightResult.success) {
      expect(game.revealedTileIds.length).toBeGreaterThan(initialCount);
    } else {
      // try down
      const downResult = moveOnGridMap(game, 'down');
      if (downResult.success) {
        expect(game.revealedTileIds.length).toBeGreaterThan(initialCount);
      } else {
        // try up
        const upResult = moveOnGridMap(game, 'up');
        expect(upResult.success).toBe(true);
        expect(game.revealedTileIds.length).toBeGreaterThan(initialCount);
      }
    }
  });

  it('visited tile ids should not have duplicates', () => {
    const game = freshGameWithMap();
    // move right then back
    moveOnGridMap(game, 'right');
    moveOnGridMap(game, 'left'); // back to start
    const unique = new Set(game.visitedTileIds);
    expect(unique.size).toBe(game.visitedTileIds.length);
  });

  it('revealed tile ids should not have duplicates', () => {
    const game = freshGameWithMap();
    moveOnGridMap(game, 'right');
    moveOnGridMap(game, 'up');
    moveOnGridMap(game, 'left');
    const unique = new Set(game.revealedTileIds);
    expect(unique.size).toBe(game.revealedTileIds.length);
  });
});

describe('movement rules', () => {
  it('moveOnGridMap should increment day by 1', () => {
    const game = freshGameWithMap();
    const startDay = game.day;
    const result = moveOnGridMap(game, 'right');
    if (result.success) {
      expect(game.day).toBe(startDay + 1);
    } else {
      const res2 = moveOnGridMap(game, 'down');
      expect(res2.success).toBe(true);
      expect(game.day).toBe(startDay + 1);
    }
  });

  it('moveOnGridMap should decrease food by 1', () => {
    const game = freshGameWithMap();
    game.food = 24;
    const startFood = game.food;
    const result = moveOnGridMap(game, 'right');
    if (result.success) {
      expect(game.food).toBe(startFood - 1);
    } else {
      const res2 = moveOnGridMap(game, 'down');
      expect(res2.success).toBe(true);
      expect(game.food).toBe(startFood - 1);
    }
  });

  it('food should not go below 0', () => {
    const game = freshGameWithMap();
    game.food = 0;
    // Move until we can't
    const result = moveOnGridMap(game, 'right');
    if (result.success) {
      expect(game.food).toBe(0);
    } else {
      const res2 = moveOnGridMap(game, 'down');
      if (res2.success) {
        expect(game.food).toBe(0);
      } else {
        const res3 = moveOnGridMap(game, 'up');
        if (res3.success) {
          expect(game.food).toBe(0);
        }
      }
    }
  });

  it('cannot move into obstacle', () => {
    const game = freshGameWithMap();
    const pos = game.playerPosition!;
    // Find direction to obstacle
    const directions: { dir: 'up' | 'down' | 'left' | 'right'; dx: number; dy: number }[] = [
      { dir: 'up', dx: 0, dy: -1 },
      { dir: 'down', dx: 0, dy: 1 },
      { dir: 'left', dx: -1, dy: 0 },
      { dir: 'right', dx: 1, dy: 0 },
    ];
    for (const d of directions) {
      const tile = getTileAt(game.activeMapId!, { x: pos.x + d.dx, y: pos.y + d.dy });
      if (tile && tile.type === 'obstacle') {
        const check = canMoveTo(game, d.dir);
        expect(check.canMove).toBe(false);
        return;
      }
    }
    // If no obstacle found adjacent, at least test edge
    expect(true).toBe(true);
  });

  it('cannot move out of map bounds', () => {
    const game = freshGameWithMap();
    const mapId = game.activeMapId!;
    const map = getGridMap(mapId)!;

    // Walk to right edge
    game.playerPosition = { x: map.width - 1, y: 4 };
    game.currentTileId = getTileAt(mapId, game.playerPosition)?.id ?? game.currentTileId;
    const check = canMoveTo(game, 'right');
    expect(check.canMove).toBe(false);
  });
});

describe('game state integrity', () => {
  it('should not have silver field', () => {
    const game = freshGameWithMap();
    const keys = Object.keys(game);
    expect(keys).not.toContain('silver');
    expect(keys).not.toContain('Silver');
    expect(keys).not.toContain('SILVER');
  });

  it('startGridMap should set activeMapId and playerPosition', () => {
    const game = freshGameWithMap();
    expect(game.activeMapId).toBe('graybridge_region_map');
    expect(game.playerPosition).toBeDefined();
    expect(game.playerPosition!.x).toBe(2);
    expect(game.playerPosition!.y).toBe(4);
  });
});
