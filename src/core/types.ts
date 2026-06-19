// Character IDs
export type CharacterId =
  | 'road_guard'
  | 'wasteland_shooter'
  | 'mechanic';

// Character state
export interface CharacterState {
  id: CharacterId;
  name: string;
  maxHp: number;
  hp: number;
  armor: number;
  shield: number;
  barrier: number;
  role: string;
  skillNames: string[];
}

// Caravan state
export interface CaravanState {
  caravanHp: number;
  caravanMaxHp: number;
}

// Main quest stages
export type MainQuestStage =
  | 'graybridge'
  | 'graybridge_to_graylamp'
  | 'graylamp'
  | 'graylamp_to_daan'
  | 'daan'
  | 'daan_exploration'
  | 'second_city_search';

// Route state
export interface RouteState {
  routeId: string;
  currentNodeId: string;
  completedNodeIds: string[];
  eventsTriggered: string[];
}

// Order state
export interface OrderState {
  orderId: string;
  targetLocationId: string;
  reward: number;
  cargoRequirement: number;
}

// Battle state
export interface BattleState {
  battleId: string;
  enemyId: string;
  currentRound: number;
  isPlayerTurn: boolean;
  isOver: boolean;
  playerWon: boolean;
}

// Event state
export interface EventState {
  eventId: string;
  isResolved: boolean;
  choices: string[];
  outcome: string | null;
}

// Location state
export interface LocationState {
  locationId: string;
  name: string;
  visited: boolean;
  reputation: number;
}

// Route node types
export type RouteNodeType =
  | 'start'
  | 'calm'
  | 'event'
  | 'resource'
  | 'battle'
  | 'specialBattle'
  | 'optionalElite'
  | 'outpost'
  | 'city'
  | 'village'
  | 'town';

// Route node
export interface RouteNode {
  id: string;
  dayIndex: number;
  name: string;
  type: RouteNodeType;
  description: string;
}

// Route definition
export interface RouteDefinition {
  id: string;
  name: string;
  startLocationId: string;
  endLocationId: string;
  totalDays: number;
  nodes: RouteNode[];
}

// Negative status types (v2.1 placeholder)
export type NegativeStatusType =
  | 'bleed'
  | 'slow'
  | 'ashCorrosion'
  | 'burning'
  | 'marked';

// Positive buff types (v2.1 placeholder)
export type PositiveBuffType =
  | 'shield'
  | 'armor'
  | 'counterBlade'
  | 'overload'
  | 'caravanGuard'
  | 'holdLine'
  | 'repairBoost';

// Special status types (v2.1 placeholder)
export type SpecialStatusType =
  | 'injured'
  | 'caravanDisabled'
  | 'cargoDamaged';

// Resource change record
export interface ResourceChange {
  gold?: number;
  food?: number;
  spareParts?: number;
  morale?: number;
  caravanHp?: number;
  emberSeeds?: number;
  ancientMemoryFragments?: number;
  ashMaterials?: number;
}

// Main game state
export interface GameState {
  // Time and resources
  day: number;
  gold: number;
  food: number;
  spareParts: number;
  morale: number;
  moraleMax: number;
  caravanHp: number;
  caravanMaxHp: number;

  // Quest and location
  mainQuestStage: MainQuestStage;
  currentLocationId: string;
  currentLocationName: string;

  // Route progress
  activeRouteId: string | null;
  currentRouteNodeId: string | null;
  completedRouteNodeIds: string[];
  resolvedRouteNodeIds: string[];
  resolvedEventNodeIds: string[];

  // Characters
  characters: CharacterState[];
  caravan: CaravanState;

  // Orders
  activeOrders: OrderState[];
  orderDeadlineById: Record<string, number>;
  currentCargoLoad: number;
  maxCargoLoad: number;

  // Battle
  battleRetryUsedById: Record<string, boolean>;

  // Intel
  secondCityClues: number;
  routeIntel: number;
  enemyIntel: number;
  daanReputation: number;

  // Favor
  villageFavorById: Record<string, number>;
  outpostFavorById: Record<string, number>;
  routeSafetyById: Record<string, number>;
  eventCooldownById: Record<string, number>;

  // Special resources
  emberSeeds: number;
  ancientMemoryFragments: number;
  ashMaterials: number;

  // v2.1 reserved fields
  moraleRestDaysAtSafeLocation: number;
  weatherId: string | null;
  weatherStrength: 'weak' | 'normal' | 'strong' | null;
  ambushRateModifier: number;
  burningStacksByTargetId: Record<string, number>;
  burningTurnsByTargetId: Record<string, number>;
  burningCanSpreadByTargetId: Record<string, boolean>;
  bleedStacksByTargetId: Record<string, number>;
  slowStacksByTargetId: Record<string, number>;
  positiveBuffsByTargetId: Record<string, PositiveBuffType[]>;
  orderOverdueById: Record<string, boolean>;
  orderRewardMultiplierById: Record<string, number>;
}
