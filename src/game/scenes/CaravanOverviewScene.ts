import Phaser from 'phaser';
import type { GameState } from '../../core/types';
import type { CharacterState } from '../../core/types';
import { drawPanel } from '../../ui/drawPanel';
import { drawTextButton } from '../../ui/drawTextButton';
import { formatCharacter } from '../../ui/formatResources';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLOR_DARK_BG,
  FONT_SIZE_TITLE,
  FONT_SIZE_BODY,
  FONT_SIZE_SMALL,
} from '../../core/constants';

interface CaravanOverviewSceneData {
  gameState: GameState;
}

export class CaravanOverviewScene extends Phaser.Scene {
  private gameState!: GameState;

  constructor() {
    super({ key: 'CaravanOverviewScene' });
  }

  init(data: CaravanOverviewSceneData): void {
    this.gameState = data.gameState;
  }

  create(): void {
    // Dark background
    this.cameras.main.setBackgroundColor(COLOR_DARK_BG);

    const centerX = CANVAS_WIDTH / 2;
    const startY = 80;

    // Title
    this.add.text(centerX, startY, '商队总览', {
      fontSize: `${FONT_SIZE_TITLE}px`,
      color: '#ffd700',
      align: 'center',
    }).setOrigin(0.5);

    // Resources panel
    drawPanel(this, {
      x: centerX,
      y: startY + 80,
      width: 400,
      height: 180,
    });

    // Day and location
    this.add.text(centerX, startY + 35, `第 ${this.gameState.day} 天`, {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(centerX, startY + 60, `当前位置: ${this.gameState.currentLocationName}`, {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    // Resources
    this.add.text(centerX, startY + 100, [
      `金币: ${this.gameState.gold}`,
      `补给: ${this.gameState.food}`,
      `备用零件: ${this.gameState.spareParts}`,
      `士气: ${this.gameState.morale} / ${this.gameState.moraleMax}`,
      `货车耐久: ${this.gameState.caravanHp} / ${this.gameState.caravanMaxHp}`,
      `当前载重: ${this.gameState.currentCargoLoad} / ${this.gameState.maxCargoLoad}`,
    ].join('\n'), {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#ffffff',
      align: 'left',
      lineSpacing: 8,
    }).setOrigin(0.5);

    // Team panel
    drawPanel(this, {
      x: centerX,
      y: startY + 280,
      width: 400,
      height: 150,
    });

    this.add.text(centerX, startY + 230, '队伍', {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    // Characters
    const charStartY = startY + 265;
    this.gameState.characters.forEach((char: CharacterState, index: number) => {
      this.add.text(centerX, charStartY + index * 28, formatCharacter(char), {
        fontSize: `${FONT_SIZE_SMALL}px`,
        color: '#ffffff',
        align: 'center',
      }).setOrigin(0.5);
    });

    // Tip
    this.add.text(centerX, startY + 420, '下一步：在灰桥镇采购补给和备用零件。', {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#9ca3af',
      align: 'center',
    }).setOrigin(0.5);

    // Button placeholders
    const buttonY = startY + 470;

    drawTextButton(this, {
      text: '采购整备',
      x: centerX - 110,
      y: buttonY,
      width: 200,
      height: 45,
      onClick: () => this.scene.start('GraybridgePurchaseScene', { gameState: this.gameState }),
    });

    drawTextButton(this, {
      text: '出发 (Phase 3)',
      x: centerX + 110,
      y: buttonY,
      width: 200,
      height: 45,
      onClick: () => this.showPhaseMessage('Phase 3 开放'),
      disabled: true,
    });
  }

  private showPhaseMessage(message: string): void {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    // Draw message box
    const msgBox = drawPanel(this, {
      x: centerX,
      y: centerY,
      width: 300,
      height: 80,
    });
    msgBox.setStrokeStyle(2, 0xffd700);

    const msgText = this.add.text(centerX, centerY, message, {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#ffd700',
      align: 'center',
    }).setOrigin(0.5);

    // Auto destroy after 2 seconds
    this.time.delayedCall(2000, () => {
      msgBox.destroy();
      msgText.destroy();
    });
  }
}
