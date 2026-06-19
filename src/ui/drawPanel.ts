import Phaser from 'phaser';
import { COLOR_PANEL_BG } from '../core/constants';

export interface PanelConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor?: number;
  strokeColor?: number;
  strokeWidth?: number;
}

export function drawPanel(
  scene: Phaser.Scene,
  config: PanelConfig
): Phaser.GameObjects.Rectangle {
  const {
    x,
    y,
    width,
    height,
    fillColor = COLOR_PANEL_BG,
    strokeColor = 0x4b5563,
    strokeWidth = 2,
  } = config;

  const panel = scene.add.rectangle(x, y, width, height, fillColor);
  panel.setStrokeStyle(strokeWidth, strokeColor);

  return panel;
}
