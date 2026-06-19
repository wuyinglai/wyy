import type { GameState } from './types';

export function createNewGame(): GameState {
  return {
    // Time and resources
    day: 1,
    gold: 160,
    food: 0,
    spareParts: 0,
    morale: 6,
    moraleMax: 10,
    caravanHp: 100,
    caravanMaxHp: 100,

    // Quest and location
    mainQuestStage: 'graybridge',
    currentLocationId: 'graybridge_town',
    currentLocationName: '灰桥镇',

    // Route progress
    activeRouteId: null,
    currentRouteNodeId: null,
    completedRouteNodeIds: [],

    // Characters - will be populated from data/characters.ts
    characters: [],
    caravan: {
      caravanHp: 100,
      caravanMaxHp: 100,
    },

    // Orders
    activeOrders: [],
    orderDeadlineById: {},
    currentCargoLoad: 0,
    maxCargoLoad: 20,

    // Battle
    battleRetryUsedById: {},

    // Intel
    secondCityClues: 0,
    routeIntel: 0,
    enemyIntel: 0,
    daanReputation: 0,

    // Favor
    villageFavorById: {},
    outpostFavorById: {},
    routeSafetyById: {},
    eventCooldownById: {},

    // Special resources
    emberSeeds: 0,
    ancientMemoryFragments: 0,
    ashMaterials: 0,
  };
}
