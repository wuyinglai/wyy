import type { GridMapDefinition } from '../core/types';

export const initialGridMaps: GridMapDefinition[] = [
  {
    id: 'graybridge_region_map',
    name: '灰桥镇外荒野',
    width: 13,
    height: 9,
    startTileId: 'tile_graybridge_town',
    tiles: [
      // ============ y=0 ============
      { id: 'tile_obstacle_3_0', x: 3, y: 0, type: 'obstacle', name: '塌方', description: '塌方无法通行。', isPassable: false },
      { id: 'tile_elite_5_0', x: 5, y: 0, type: 'optionalElite', name: '灰烬母巢', description: '一座巨大的灰烬母巢静静盘踞，危险。', isPassable: true },
      { id: 'tile_obstacle_7_0', x: 7, y: 0, type: 'obstacle', name: '深沟', description: '深沟难以跨越。', isPassable: false },
      { id: 'tile_obstacle_9_0', x: 9, y: 0, type: 'obstacle', name: '倒塌塔楼', description: '倒塌的塔楼残骸阻挡去路。', isPassable: false },

      // ============ y=1 ============
      { id: 'tile_event_2_1', x: 2, y: 1, type: 'event', name: '断裂路面', description: '前方道路出现断裂。', isPassable: true },
      { id: 'tile_calm_3_1', x: 3, y: 1, type: 'calm', name: '荒草地', description: '一片安静的荒草地。', isPassable: true },
      { id: 'tile_resource_4_1', x: 4, y: 1, type: 'resource', name: '商队残骸', description: '废弃商队残骸中或许还有可用资源。', isPassable: true },
      { id: 'tile_battle_5_1', x: 5, y: 1, type: 'battle', name: '灰烬幼兽战', description: '一群灰烬幼兽从四周逼近。', isPassable: true },
      { id: 'tile_event_6_1', x: 6, y: 1, type: 'event', name: '驿站灯火', description: '远处似有驿站灯火闪烁。', isPassable: true },
      { id: 'tile_resource_7_1', x: 7, y: 1, type: 'resource', name: '遗弃工具箱', description: '路边被遗弃的工具箱。', isPassable: true },
      { id: 'tile_battle_8_1', x: 8, y: 1, type: 'battle', name: '裂背灰烬兽战', description: '裂背灰烬兽挡住去路。', isPassable: true },
      { id: 'tile_event_9_1', x: 9, y: 1, type: 'event', name: '旧路标', description: '一块褪色的旧路标。', isPassable: true },
      { id: 'tile_calm_10_1', x: 10, y: 1, type: 'calm', name: '碎石坡', description: '碎石坡上安静无声。', isPassable: true },

      // ============ y=2 ============
      { id: 'tile_calm_2_2', x: 2, y: 2, type: 'calm', name: '碎石坡', description: '碎石坡上安静无声。', isPassable: true },
      { id: 'tile_calm_3_2', x: 3, y: 2, type: 'calm', name: '荒草地', description: '一片安静的荒草地。', isPassable: true },
      { id: 'tile_calm_4_2', x: 4, y: 2, type: 'calm', name: '静默荒地', description: '万籁俱寂的荒地。', isPassable: true },
      { id: 'tile_calm_5_2', x: 5, y: 2, type: 'calm', name: '碎石坡', description: '碎石坡上安静无声。', isPassable: true },
      { id: 'tile_road_6_2', x: 6, y: 2, type: 'road', name: '荒草路', description: '一条荒草丛生的小路。', isPassable: true },
      { id: 'tile_calm_7_2', x: 7, y: 2, type: 'calm', name: '荒草地', description: '一片安静的荒草地。', isPassable: true },
      { id: 'tile_calm_8_2', x: 8, y: 2, type: 'calm', name: '碎石坡', description: '碎石坡上安静无声。', isPassable: true },
      { id: 'tile_calm_9_2', x: 9, y: 2, type: 'calm', name: '荒草地', description: '一片安静的荒草地。', isPassable: true },
      { id: 'tile_road_10_2', x: 10, y: 2, type: 'road', name: '旧路', description: '商队沿旧路前进。', isPassable: true },

      // ============ y=3 ============
      { id: 'tile_obstacle_1_3', x: 1, y: 3, type: 'obstacle', name: '塌方', description: '塌方无法通行。', isPassable: false },
      { id: 'tile_calm_2_3', x: 2, y: 3, type: 'calm', name: '荒草地', description: '一片安静的荒草地。', isPassable: true },
      { id: 'tile_calm_3_3', x: 3, y: 3, type: 'calm', name: '碎石坡', description: '碎石坡上安静无声。', isPassable: true },
      { id: 'tile_calm_4_3', x: 4, y: 3, type: 'calm', name: '静默荒地', description: '万籁俱寂的荒地。', isPassable: true },
      { id: 'tile_calm_5_3', x: 5, y: 3, type: 'calm', name: '荒草地', description: '一片安静的荒草地。', isPassable: true },
      { id: 'tile_calm_6_3', x: 6, y: 3, type: 'calm', name: '碎石坡', description: '碎石坡上安静无声。', isPassable: true },
      { id: 'tile_calm_7_3', x: 7, y: 3, type: 'calm', name: '荒草地', description: '一片安静的荒草地。', isPassable: true },
      { id: 'tile_calm_8_3', x: 8, y: 3, type: 'calm', name: '碎石坡', description: '碎石坡上安静无声。', isPassable: true },
      { id: 'tile_calm_9_3', x: 9, y: 3, type: 'calm', name: '荒草地', description: '一片安静的荒草地。', isPassable: true },
      { id: 'tile_graylamp_outpost', x: 10, y: 3, type: 'outpost', name: '灰灯驿站', description: '荒野中的安全驿站，完整功能后续开放。', isPassable: true },
      { id: 'tile_obstacle_11_3', x: 11, y: 3, type: 'obstacle', name: '深沟', description: '深沟难以跨越。', isPassable: false },
      { id: 'tile_obstacle_12_3', x: 12, y: 3, type: 'obstacle', name: '毒雾洼地', description: '毒雾弥漫，无法通行。', isPassable: false },

      // ============ y=4 (town row - main) ============
      { id: 'tile_calm_1_4', x: 1, y: 4, type: 'calm', name: '荒草地', description: '一片安静的荒草地。', isPassable: true },
      { id: 'tile_graybridge_town', x: 2, y: 4, type: 'town', name: '灰桥镇', description: '商队出发前的最后城镇。', isPassable: true },
      { id: 'tile_road_3_4', x: 3, y: 4, type: 'road', name: '旧商路', description: '商队沿着旧商路前进。', isPassable: true },
      { id: 'tile_event_4_4', x: 4, y: 4, type: 'event', name: '受伤旅人', description: '路边坐着受伤的旅人。', isPassable: true },
      { id: 'tile_resource_5_4', x: 5, y: 4, type: 'resource', name: '干涸水井', description: '一口干涸的水井旁散落着物资。', isPassable: true },
      { id: 'tile_event_6_4', x: 6, y: 4, type: 'event', name: '迷雾岔口', description: '迷雾中出现了岔路。', isPassable: true },
      { id: 'tile_road_7_4', x: 7, y: 4, type: 'road', name: '荒草路', description: '一条荒草丛生的小路。', isPassable: true },
      { id: 'tile_calm_8_4', x: 8, y: 4, type: 'calm', name: '静默荒地', description: '万籁俱寂的荒地。', isPassable: true },
      { id: 'tile_road_9_4', x: 9, y: 4, type: 'road', name: '旧路', description: '商队沿旧路前进。', isPassable: true },
      { id: 'tile_calm_10_4', x: 10, y: 4, type: 'calm', name: '荒草地', description: '一片安静的荒草地。', isPassable: true },

      // ============ y=5 (south route) ============
      { id: 'tile_road_2_5', x: 2, y: 5, type: 'road', name: '断裂旧道', description: '断裂的旧道勉强可走。', isPassable: true },
      { id: 'tile_specialbattle_3_5', x: 3, y: 5, type: 'specialBattle', name: '劫匪抢货战', description: '一群劫匪正准备抢货。', isPassable: true },
      { id: 'tile_resource_4_5', x: 4, y: 5, type: 'resource', name: '旧补给箱', description: '一个被遗弃的旧补给箱。', isPassable: true },
      { id: 'tile_battle_5_5', x: 5, y: 5, type: 'battle', name: '荒野劫匪', description: '几名荒野劫匪挡住去路。', isPassable: true },
      { id: 'tile_specialbattle_6_5', x: 6, y: 5, type: 'specialBattle', name: '风暴伏击点', description: '风暴中似乎有敌人潜伏。', isPassable: true },
      { id: 'tile_battle_7_5', x: 7, y: 5, type: 'battle', name: '灰烬游荡者', description: '灰烬游荡者在附近徘徊。', isPassable: true },
      { id: 'tile_event_8_5', x: 8, y: 5, type: 'event', name: '驿站灯火', description: '远处似有驿站灯火闪烁。', isPassable: true },
      { id: 'tile_calm_9_5', x: 9, y: 5, type: 'calm', name: '碎石坡', description: '碎石坡上安静无声。', isPassable: true },
      { id: 'tile_road_10_5', x: 10, y: 5, type: 'road', name: '旧路', description: '商队沿旧路前进。', isPassable: true },

      // ============ y=6 ============
      { id: 'tile_calm_2_6', x: 2, y: 6, type: 'calm', name: '荒草地', description: '一片安静的荒草地。', isPassable: true },
      { id: 'tile_calm_3_6', x: 3, y: 6, type: 'calm', name: '碎石坡', description: '碎石坡上安静无声。', isPassable: true },
      { id: 'tile_calm_4_6', x: 4, y: 6, type: 'calm', name: '静默荒地', description: '万籁俱寂的荒地。', isPassable: true },
      { id: 'tile_calm_5_6', x: 5, y: 6, type: 'calm', name: '荒草地', description: '一片安静的荒草地。', isPassable: true },
      { id: 'tile_calm_6_6', x: 6, y: 6, type: 'calm', name: '碎石坡', description: '碎石坡上安静无声。', isPassable: true },
      { id: 'tile_calm_7_6', x: 7, y: 6, type: 'calm', name: '荒草地', description: '一片安静的荒草地。', isPassable: true },
      { id: 'tile_resource_8_6', x: 8, y: 6, type: 'resource', name: '遗弃工具箱', description: '路边被遗弃的工具箱。', isPassable: true },
      { id: 'tile_calm_9_6', x: 9, y: 6, type: 'calm', name: '碎石坡', description: '碎石坡上安静无声。', isPassable: true },
      { id: 'tile_calm_10_6', x: 10, y: 6, type: 'calm', name: '荒草地', description: '一片安静的荒草地。', isPassable: true },

      // ============ y=7 ============
      { id: 'tile_obstacle_1_7', x: 1, y: 7, type: 'obstacle', name: '倒塌塔楼', description: '倒塌的塔楼残骸阻挡去路。', isPassable: false },
      { id: 'tile_obstacle_3_7', x: 3, y: 7, type: 'obstacle', name: '毒雾洼地', description: '毒雾弥漫，无法通行。', isPassable: false },
      { id: 'tile_obstacle_5_7', x: 5, y: 7, type: 'obstacle', name: '灰烬裂隙', description: '地面灰烬裂隙无法通行。', isPassable: false },
      { id: 'tile_obstacle_7_7', x: 7, y: 7, type: 'obstacle', name: '深沟', description: '深沟难以跨越。', isPassable: false },
      { id: 'tile_obstacle_9_7', x: 9, y: 7, type: 'obstacle', name: '塌方', description: '塌方无法通行。', isPassable: false },
      { id: 'tile_obstacle_11_7', x: 11, y: 7, type: 'obstacle', name: '倒塌塔楼', description: '倒塌的塔楼残骸阻挡去路。', isPassable: false },

      // ============ y=8 ============
      { id: 'tile_obstacle_2_8', x: 2, y: 8, type: 'obstacle', name: '毒雾洼地', description: '毒雾弥漫，无法通行。', isPassable: false },
      { id: 'tile_obstacle_4_8', x: 4, y: 8, type: 'obstacle', name: '灰烬裂隙', description: '地面灰烬裂隙无法通行。', isPassable: false },
      { id: 'tile_obstacle_6_8', x: 6, y: 8, type: 'obstacle', name: '深沟', description: '深沟难以跨越。', isPassable: false },
      { id: 'tile_obstacle_8_8', x: 8, y: 8, type: 'obstacle', name: '倒塌塔楼', description: '倒塌的塔楼残骸阻挡去路。', isPassable: false },
      { id: 'tile_obstacle_10_8', x: 10, y: 8, type: 'obstacle', name: '塌方', description: '塌方无法通行。', isPassable: false },
    ],
  },
];

export function getInitialGridMapById(mapId: string): GridMapDefinition | undefined {
  return initialGridMaps.find((m) => m.id === mapId);
}
