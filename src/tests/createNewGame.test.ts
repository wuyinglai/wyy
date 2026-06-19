import { describe, it, expect } from 'vitest';
import { createNewGame } from '../core/createNewGame';
import { initialCharacters } from '../data/characters';

describe('createNewGame', () => {
  it('should return gold as 160', () => {
    expect(createNewGame().gold).toBe(160);
  });

  it('should return food as 0', () => {
    expect(createNewGame().food).toBe(0);
  });

  it('should return spareParts as 0', () => {
    expect(createNewGame().spareParts).toBe(0);
  });

  it('should return morale as 6', () => {
    expect(createNewGame().morale).toBe(6);
  });

  it('should return moraleMax as 10', () => {
    expect(createNewGame().moraleMax).toBe(10);
  });

  it('should return caravanHp as 100', () => {
    expect(createNewGame().caravanHp).toBe(100);
  });

  it('should return caravanMaxHp as 100', () => {
    expect(createNewGame().caravanMaxHp).toBe(100);
  });

  it('should return currentLocationName as "灰桥镇"', () => {
    expect(createNewGame().currentLocationName).toBe('灰桥镇');
  });

  it('should return maxCargoLoad as 20', () => {
    expect(createNewGame().maxCargoLoad).toBe(20);
  });

  it('should have 3 characters when combined with initialCharacters', () => {
    const gameState = createNewGame();
    gameState.characters = [...initialCharacters];
    expect(gameState.characters.length).toBe(3);
  });

  it('should have 护路人 with hp 42 and armor 2', () => {
    const roadGuard = initialCharacters.find(c => c.id === 'road_guard');
    expect(roadGuard).toBeDefined();
    expect(roadGuard?.hp).toBe(42);
    expect(roadGuard?.armor).toBe(2);
  });

  it('should have 荒野射手 with hp 32 and armor 0', () => {
    const shooter = initialCharacters.find(c => c.id === 'wasteland_shooter');
    expect(shooter).toBeDefined();
    expect(shooter?.hp).toBe(32);
    expect(shooter?.armor).toBe(0);
  });

  it('should have 修补师 with hp 34 and armor 0', () => {
    const mechanic = initialCharacters.find(c => c.id === 'mechanic');
    expect(mechanic).toBeDefined();
    expect(mechanic?.hp).toBe(34);
    expect(mechanic?.armor).toBe(0);
  });

  it('should NOT have silver field', () => {
    const state = createNewGame();
    expect('silver' in state).toBe(false);
  });

  it('should NOT have money field', () => {
    const state = createNewGame();
    expect('money' in state).toBe(false);
  });

  it('should NOT have coin field', () => {
    const state = createNewGame();
    expect('coin' in state).toBe(false);
  });

  it('should NOT have supply field', () => {
    const state = createNewGame();
    expect('supply' in state).toBe(false);
  });

  it('should NOT have parts field', () => {
    const state = createNewGame();
    expect('parts' in state).toBe(false);
  });

  it('should NOT have cartHp field', () => {
    const state = createNewGame();
    expect('cartHp' in state).toBe(false);
  });
});
