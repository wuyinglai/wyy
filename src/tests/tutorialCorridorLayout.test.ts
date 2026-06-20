import { describe, it, expect } from 'vitest';
import { getTutorialCorridorViewportRange } from '../game/scenes/tutorialCorridorLayout';

describe('tutorialCorridorLayout', () => {
  describe('getTutorialCorridorViewportRange', () => {
    it('currentIndex=0, total=20, visible=11 => start=0, end=11', () => {
      const result = getTutorialCorridorViewportRange(0, 20, 11);
      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBe(11);
    });

    it('currentIndex=5, total=20, visible=11 => start=0, end=11', () => {
      const result = getTutorialCorridorViewportRange(5, 20, 11);
      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBe(11);
    });

    it('currentIndex=10, total=20, visible=11 => start=5, end=16', () => {
      const result = getTutorialCorridorViewportRange(10, 20, 11);
      expect(result.startIndex).toBe(5);
      expect(result.endIndex).toBe(16);
    });

    it('currentIndex=18, total=20, visible=11 => start=9, end=20', () => {
      const result = getTutorialCorridorViewportRange(18, 20, 11);
      expect(result.startIndex).toBe(9);
      expect(result.endIndex).toBe(20);
    });

    it('currentIndex=19, total=20, visible=11 => start=9, end=20', () => {
      const result = getTutorialCorridorViewportRange(19, 20, 11);
      expect(result.startIndex).toBe(9);
      expect(result.endIndex).toBe(20);
    });

    it('total=8, visible=11 => start=0, end=8', () => {
      const result = getTutorialCorridorViewportRange(5, 8, 11);
      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBe(8);
    });

    it('startIndex 不小于 0', () => {
      const result = getTutorialCorridorViewportRange(0, 20, 11);
      expect(result.startIndex).toBeGreaterThanOrEqual(0);
    });

    it('endIndex 不大于 totalNodes', () => {
      const result = getTutorialCorridorViewportRange(19, 20, 11);
      expect(result.endIndex).toBeLessThanOrEqual(20);
    });
  });
});
