import Phaser from 'phaser';
import { createNewGame } from '../../core/createNewGame';
import { drawTextButton } from '../../ui/drawTextButton';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLOR_DARK_BG,
  FONT_SIZE_TITLE,
  FONT_SIZE_SUBTITLE,
} from '../../core/constants';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    // Dark background
    this.cameras.main.setBackgroundColor(COLOR_DARK_BG);

    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    // Title
    this.add.text(centerX, centerY - 120, '《余烬商队》', {
      fontSize: `${FONT_SIZE_TITLE}px`,
      color: '#ffd700',
      align: 'center',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, centerY - 50, '商队远行 / 卡牌战斗 / 跑商经营 / 城市重建', {
      fontSize: `${FONT_SIZE_SUBTITLE}px`,
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    // Start button
    drawTextButton(this, {
      text: '开始新游戏',
      x: centerX,
      y: centerY + 40,
      width: 200,
      height: 50,
      onClick: () => this.startNewGame(),
    });
  }

  private startNewGame(): void {
    // Create new game state
    const gameState = createNewGame();

    // Transition to caravan overview
    this.scene.start('CaravanOverviewScene', { gameState });
  }
}
