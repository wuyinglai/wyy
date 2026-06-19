import { describe, it, expect } from 'vitest';
import { createNewGame } from '../core/createNewGame';

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

  it('should have 3 characters', () => {
    expect(createNewGame().characters.length).toBe(3);
  });

  it('should have 护路人 with hp 42 and armor 2', () => {
    const roadGuard = createNewGame().characters.find(c => c.id === 'road_guard');
    expect(roadGuard).toBeDefined();
    expect(roadGuard?.hp).toBe(42);
    expect(roadGuard?.armor).toBe(2);
  });

  it('should have 荒野射手 with hp 32 and armor 0', () => {
    const shooter = createNewGame().characters.find(c => c.id === 'wasteland_shooter');
    expect(shooter).toBeDefined();
    expect(shooter?.hp).toBe(32);
    expect(shooter?.armor).toBe(0);
  });

  it('should have 修补师 with hp 34 and armor 0', () => {
    const mechanic = createNewGame().characters.find(c => c.id === 'mechanic');
    expect(mechanic).toBeDefined();
    expect(mechanic?.hp).toBe(34);
    expect(mechanic?.armor).toBe(0);
  });

  it('护路人技能应按 v2.1 同步', () => {
    const roadGuard = createNewGame().characters.find(c => c.id === 'road_guard');
    expect(roadGuard).toBeDefined();
    expect(roadGuard?.skillNames).toContain('回刃');
    expect(roadGuard?.skillNames).toContain('横身拦截');
    expect(roadGuard?.skillNames).toContain('稳住阵线');
    expect(roadGuard?.skillNames).toContain('盾反');
    expect(roadGuard?.skillNames).toContain('重击');
    expect(roadGuard?.skillNames).toContain('车队防护');
  });

  it('荒野射手技能应按 v2.1 同步', () => {
    const shooter = createNewGame().characters.find(c => c.id === 'wasteland_shooter');
    expect(shooter).toBeDefined();
    expect(shooter?.skillNames).toContain('标记');
    expect(shooter?.skillNames).toContain('放血箭');
    expect(shooter?.skillNames).toContain('断筋箭');
    expect(shooter?.skillNames).toContain('猎灰重箭');
    expect(shooter?.skillNames).toContain('会合射击');
    expect(shooter?.skillNames).toContain('补射');
  });

  it('荒野射手不得出现精确射击', () => {
    const shooter = createNewGame().characters.find(c => c.id === 'wasteland_shooter');
    expect(shooter).toBeDefined();
    expect(shooter?.skillNames).not.toContain('精确射击');
  });

  it('荒野射手不得出现回刃', () => {
    const shooter = createNewGame().characters.find(c => c.id === 'wasteland_shooter');
    expect(shooter).toBeDefined();
    expect(shooter?.skillNames).not.toContain('回刃');
  });

  it('修补师技能应按 v2.1 同步', () => {
    const mechanic = createNewGame().characters.find(c => c.id === 'mechanic');
    expect(mechanic).toBeDefined();
    expect(mechanic?.skillNames).toContain('简易治疗');
    expect(mechanic?.skillNames).toContain('防护加固');
    expect(mechanic?.skillNames).toContain('车体修理');
    expect(mechanic?.skillNames).toContain('拆解破甲');
    expect(mechanic?.skillNames).toContain('灰烬净化');
    expect(mechanic?.skillNames).toContain('过载');
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

  // v2.1 reserved fields
  it('should have moraleRestDaysAtSafeLocation', () => {
    expect(createNewGame().moraleRestDaysAtSafeLocation).toBe(0);
  });

  it('should have weatherId as null', () => {
    expect(createNewGame().weatherId).toBeNull();
  });

  it('should have weatherStrength as null', () => {
    expect(createNewGame().weatherStrength).toBeNull();
  });

  it('should have ambushRateModifier as 0', () => {
    expect(createNewGame().ambushRateModifier).toBe(0);
  });

  it('should have burningStacksByTargetId as empty object', () => {
    const state = createNewGame();
    expect(state.burningStacksByTargetId).toEqual({});
  });

  it('should have burningsTurnsByTargetId as empty object', () => {
    const state = createNewGame();
    expect(state.burningTurnsByTargetId).toEqual({});
  });

  it('should have burningCanSpreadByTargetId as empty object', () => {
    const state = createNewGame();
    expect(state.burningCanSpreadByTargetId).toEqual({});
  });

  it('should have bleedStacksByTargetId as empty object', () => {
    const state = createNewGame();
    expect(state.bleedStacksByTargetId).toEqual({});
  });

  it('should have slowStacksByTargetId as empty object', () => {
    const state = createNewGame();
    expect(state.slowStacksByTargetId).toEqual({});
  });

  it('should have positiveBuffsByTargetId as empty object', () => {
    const state = createNewGame();
    expect(state.positiveBuffsByTargetId).toEqual({});
  });

  it('should have orderOverdueById as empty object', () => {
    const state = createNewGame();
    expect(state.orderOverdueById).toEqual({});
  });

  it('should have orderRewardMultiplierById as empty object', () => {
    const state = createNewGame();
    expect(state.orderRewardMultiplierById).toEqual({});
  });
});
