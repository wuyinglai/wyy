import Phaser from 'phaser';
import type { GameState } from '../../core/types';
import { startGridMap } from '../../systems/map/gridMapEngine';
import { drawPanel } from '../../ui/drawPanel';
import { drawTextButton } from '../../ui/drawTextButton';
import {
  CANVAS_WIDTH,
  COLOR_DARK_BG,
  FONT_SIZE_TITLE,
  FONT_SIZE_BODY,
  FONT_SIZE_SMALL,
} from '../../core/constants';

interface RoutePrepData {
  gameState: GameState;
}

export class RoutePrepScene extends Phaser.Scene {
  private gameState!: GameState;

  constructor() {
    super({ key: 'RoutePrepScene' });
  }

  init(data: RoutePrepData): void {
    this.gameState = data.gameState;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLOR_DARK_BG);

    const centerX = CANVAS_WIDTH / 2;
    const startY = 100;

    // Title
    this.add.text(centerX, startY, '出发准备', {
      fontSize: `${FONT_SIZE_TITLE}px`,
      color: '#ffd700',
      align: 'center',
    }).setOrigin(0.5);

    // Route info
    this.add.text(centerX, startY + 70, [
      '当前位置: 灰桥镇',
      '目标: 灰灯驿站',
      '地图: 灰桥镇外荒野 (7x5 格子地图)',
    ].join('\n'), {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#ffffff',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5);

    // Current resources panel
    drawPanel(this, {
      x: centerX,
      y: startY + 310,
      width: 600,
      height: 200,
    });

    this.add.text(centerX, startY + 240, '当前资源', {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(centerX, startY + 280, this.formatResourceText(), {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#ffffff',
      align: 'left',
      lineSpacing: 8,
    }).setOrigin(0.5);

    // Hint
    this.add.text(centerX, startY + 420, '点击“开始路线”进入格子地图探索荒野。', {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#9ca3af',
      align: 'center',
    }).setOrigin(0.5);

    // Return button
    drawTextButton(this, {
      text: '返回采购界面',
      x: centerX - 120,
      y: startY + 480,
      width: 200,
      height: 45,
      onClick: () => this.returnToPurchase(),
    });

    // Start route button
    drawTextButton(this, {
      text: '开始路线',
      x: centerX + 120,
      y: startY + 480,
      width: 200,
      height: 45,
      onClick: () => this.startRoute(),
    });
  }

  private formatResourceText(): string {
    return [
      `金币: ${this.gameState.gold}`,
      `补给: ${this.gameState.food}`,
      `备用零件: ${this.gameState.spareParts}`,
      `士气: ${this.gameState.morale} / ${this.gameState.moraleMax}`,
      `货车耐久: ${this.gameState.caravanHp} / ${this.gameState.caravanMaxHp}`,
    ].join('\n');
  }

  private returnToPurchase(): void {
    this.scene.start('GraybridgePurchaseScene', { gameState: this.gameState });
  }

  private startRoute(): void {
    startGridMap(this.gameState, 'graybridge_region_map');
    this.scene.start('GridMapScene', { gameState: this.gameState });
  }
}
