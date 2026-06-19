import Phaser from 'phaser';
import { COLOR_BUTTON, COLOR_BUTTON_HOVER, COLOR_DISABLED, FONT_SIZE_BODY } from '../core/constants';

export interface ButtonConfig {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onClick: () => void;
  disabled?: boolean;
}

export function drawTextButton(scene: Phaser.Scene, config: ButtonConfig): Phaser.GameObjects.Container {
  const { text, x, y, width, height, onClick, disabled = false } = config;

  const bgColor = disabled ? COLOR_DISABLED : COLOR_BUTTON;

  // Background rectangle
  const bg = scene.add.rectangle(x, y, width, height, bgColor);
  bg.setStrokeStyle(2, 0xffffff);

  // Button text
  const btnText = scene.add.text(x, y, text, {
    fontSize: `${FONT_SIZE_BODY}px`,
    color: '#ffffff',
    align: 'center',
  });
  btnText.setOrigin(0.5);

  const container = scene.add.container(0);
  container.add([bg, btnText]);

  if (!disabled) {
    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => {
      bg.setFillStyle(COLOR_BUTTON_HOVER);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(COLOR_BUTTON);
    });

    bg.on('pointerdown', () => {
      onClick();
    });
  }

  return container;
}
