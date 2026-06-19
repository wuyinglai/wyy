import type { GameState } from '../core/types';

export function formatResources(state: GameState): string[] {
  return [
    `金币: ${state.gold}`,
    `补给: ${state.food}`,
    `备用零件: ${state.spareParts}`,
    `士气: ${state.morale} / ${state.moraleMax}`,
    `货车耐久: ${state.caravanHp} / ${state.caravanMaxHp}`,
    `当前载重: ${state.currentCargoLoad} / ${state.maxCargoLoad}`,
  ];
}

export function formatCharacter(char: {
  name: string;
  hp: number;
  maxHp: number;
  armor: number;
}): string {
  return `${char.name} HP ${char.hp} / ${char.maxHp}，护甲 ${char.armor}`;
}
