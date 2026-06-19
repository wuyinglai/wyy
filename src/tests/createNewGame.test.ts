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

  it('should have 护路人 skill names', () => {
    const roadGuard = createNewGame().characters.find(c => c.id === 'road_guard');
    expect(roadGuard).toBeDefined();
    expect(roadGuard?.skillNames).toContain('刺');
    expect(roadGuard?.skillNames).toContain('第二技能待确认');
    expect(roadGuard?.skillNames).toContain('稳住阵线');
    expect(roadGuard?.skillNames).toContain('盾反');
    expect(roadGuard?.skillNames).toContain('重击');
    expect(roadGuard?.skillNames).toContain('车队防护');
  });

  it('should have 荒野射手 skill names', () => {
    const shooter = createNewGame().characters.find(c => c.id === 'wasteland_shooter');
    expect(shooter).toBeDefined();
    expect(shooter?.skillNames).toContain('精确射击');
    expect(shooter?.skillNames).toContain('放血箭');
    expect(shooter?.skillNames).toContain('断筋箭');
    expect(shooter?.skillNames).toContain('回刃');
    expect(shooter?.skillNames).toContain('会合射击');
    expect(shooter?.skillNames).toContain('第六技能待确认');
  });

  it('should have 修补师 skill names', () => {
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
});
