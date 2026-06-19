import { describe, it, expect } from 'vitest';
import { createNewGame } from '../core/createNewGame';
import {
  getCurrentTile,
  getGridMap,
  moveOnGridMap,
  startGridMap,
} from '../systems/map/gridMapEngine';
import type { GameState } from '../core/types';

function freshGameWithMap(): GameState {
  const game = createNewGame();
  startGridMap(game, 'graybridge_region_map');
  return game;
}

describe('gridMapEngine - startGridMap', () => {
  it('startGridMap 后 activeMapId = graybridge_region_map', () => {
    const game = freshGameWithMap();
    expect(game.activeMapId).toBe('graybridge_region_map');
  });

  it('startGridMap 后 currentTileId = tile_graybridge_town', () => {
    const game = freshGameWithMap();
    expect(game.currentTileId).toBe('tile_graybridge_town');
  });

  it('startGridMap 后 playerPosition = { x: 0, y: 2 }', () => {
    const game = freshGameWithMap();
    expect(game.playerPosition).toEqual({ x: 0, y: 2 });
  });

  it('startGridMap 不扣 food', () => {
    const game = createNewGame();
    game.food = 10;
    const beforeFood = game.food;
    startGridMap(game, 'graybridge_region_map');
    expect(game.food).toBe(beforeFood);
  });

  it('startGridMap 不增加 day', () => {
    const game = createNewGame();
    const beforeDay = game.day;
    startGridMap(game, 'graybridge_region_map');
    expect(game.day).toBe(beforeDay);
  });

  it('startGridMap 后 visitedTileIds 包含起点', () => {
    const game = freshGameWithMap();
    expect(game.visitedTileIds).toContain('tile_graybridge_town');
  });

  it('startGridMap 后 revealedTileIds 包含起点和相邻格', () => {
    const game = freshGameWithMap();
    expect(game.revealedTileIds).toContain('tile_graybridge_town');
    // 相邻格：y=1 (tile_broken_road 不是，tile_graybridge_town 上方没有 tile, 右侧是 tile_road_1_2)
    expect(game.revealedTileIds).toContain('tile_road_1_2');
  });
});

describe('gridMapEngine - moveOnGridMap', () => {
  it('向右移动一格后 day +1', () => {
    const game = freshGameWithMap();
    const before = game.day;
    moveOnGridMap(game, 'right');
    expect(game.day).toBe(before + 1);
  });

  it('向右移动一格后 food -1', () => {
    const game = freshGameWithMap();
    game.food = 10;
    const before = game.food;
    moveOnGridMap(game, 'right');
    expect(game.food).toBe(before - 1);
  });

  it('food = 0 时移动不会扣成负数', () => {
    const game = freshGameWithMap();
    game.food = 0;
    moveOnGridMap(game, 'right');
    expect(game.food).toBe(0);
  });

  it('不能走出地图边界', () => {
    const game = freshGameWithMap();
    // 起点 (0,2)，向左不能
    const result = moveOnGridMap(game, 'left');
    expect(result.success).toBe(false);
    expect(result.message).toBe('不能走出地图边界');
  });

  it('不能进入 obstacle', () => {
    const game = freshGameWithMap();
    // 先移动到 (2,2)
    moveOnGridMap(game, 'right');
    moveOnGridMap(game, 'right');
    expect(game.playerPosition).toEqual({ x: 2, y: 2 });
    // (2,0) 是 obstacle。先向上走 (2,1) 是 caravan_wreck，再向上 (2,0) obstacle
    const up1 = moveOnGridMap(game, 'up'); // (2,1)
    expect(up1.success).toBe(true);
    const up2 = moveOnGridMap(game, 'up'); // (2,0) obstacle
    expect(up2.success).toBe(false);
    expect(up2.message).toBe('前方无法通行');
  });

  it('visitedTileIds 不重复记录', () => {
    const game = freshGameWithMap();
    const startCount = game.visitedTileIds.length;
    moveOnGridMap(game, 'right');
    const oneCount = game.visitedTileIds.length;
    expect(oneCount).toBe(startCount + 1);
    moveOnGridMap(game, 'left');
    moveOnGridMap(game, 'right');
    expect(game.visitedTileIds.length).toBe(oneCount); // 回到相同格子不应新增
  });

  it('revealedTileIds 不重复记录', () => {
    const game = freshGameWithMap();
    moveOnGridMap(game, 'right');
    const oneCount = game.revealedTileIds.length;
    moveOnGridMap(game, 'left');
    moveOnGridMap(game, 'right');
    expect(game.revealedTileIds.length).toBeLessThanOrEqual(oneCount); // 回去再回来不新增
  });

  it('getCurrentTile 能返回当前 tile', () => {
    const game = freshGameWithMap();
    const tile = getCurrentTile(game);
    expect(tile).toBeDefined();
    expect(tile!.id).toBe('tile_graybridge_town');
  });
});

describe('gridMapEngine - map content', () => {
  it('当前地图包含灰桥镇', () => {
    const map = getGridMap('graybridge_region_map');
    expect(map).toBeDefined();
    const has = map!.tiles.some((t) => t.type === 'town');
    expect(has).toBe(true);
  });

  it('当前地图包含灰灯驿站', () => {
    const map = getGridMap('graybridge_region_map');
    const has = map!.tiles.some((t) => t.type === 'outpost');
    expect(has).toBe(true);
  });

  it('当前地图包含 event / resource / battle / specialBattle / optionalElite / obstacle', () => {
    const map = getGridMap('graybridge_region_map');
    const types = new Set(map!.tiles.map((t) => t.type));
    expect(types.has('event')).toBe(true);
    expect(types.has('resource')).toBe(true);
    expect(types.has('battle')).toBe(true);
    expect(types.has('specialBattle')).toBe(true);
    expect(types.has('optionalElite')).toBe(true);
    expect(types.has('obstacle')).toBe(true);
  });

  it('没有 silver 字段', () => {
    const game = createNewGame();
    // @ts-expect-error silver should not exist
    expect(game.silver).toBeUndefined();
    const map = getGridMap('graybridge_region_map');
    // @ts-expect-error silver should not exist
    expect(map!.silver).toBeUndefined();
  });
});
