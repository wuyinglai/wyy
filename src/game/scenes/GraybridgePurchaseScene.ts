import Phaser from 'phaser';
import type { GameState } from '../../core/types';
import { drawPanel } from '../../ui/drawPanel';
import { drawTextButton } from '../../ui/drawTextButton';
import {
  buyFood,
  buySpareParts,
  buyRecommendedSupplies,
  canDepart,
} from '../../systems/caravan/purchaseEngine';
import {
  CANVAS_WIDTH,
  COLOR_DARK_BG,
  FONT_SIZE_TITLE,
  FONT_SIZE_BODY,
  FONT_SIZE_SMALL,
} from '../../core/constants';

interface PurchaseSceneData {
  gameState: GameState;
}

export class GraybridgePurchaseScene extends Phaser.Scene {
  private gameState!: GameState;
  private resourceText!: Phaser.GameObjects.Text;
  private departureText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GraybridgePurchaseScene' });
  }

  init(data: PurchaseSceneData): void {
    this.gameState = data.gameState;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLOR_DARK_BG);

    const centerX = CANVAS_WIDTH / 2;
    const startY = 80;

    // Title
    this.add.text(centerX, startY, '灰桥镇 · 采购', {
      fontSize: `${FONT_SIZE_TITLE}px`,
      color: '#ffd700',
      align: 'center',
    }).setOrigin(0.5);

    // Resources panel (left)
    drawPanel(this, {
      x: centerX - 300,
      y: startY + 180,
      width: 360,
      height: 240,
    });

    this.add.text(centerX - 300, startY + 75, '当前资源', {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    this.resourceText = this.add.text(
      centerX - 300,
      startY + 115,
      this.formatResourceText(),
      {
        fontSize: `${FONT_SIZE_SMALL}px`,
        color: '#ffffff',
        align: 'left',
        lineSpacing: 10,
      },
    ).setOrigin(0.5);

    // Price & purchase panel (right)
    drawPanel(this, {
      x: centerX + 300,
      y: startY + 180,
      width: 360,
      height: 240,
    });

    this.add.text(centerX + 300, startY + 75, '价格', {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(centerX + 300, startY + 105, [
      '1 补给 = 2 金币',
      '1 备用零件 = 5 金币',
      '推荐采购包: 24 补给 + 4 备用零件 (68 金币)',
    ].join('\n'), {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#9ca3af',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);

    // Buy buttons (right panel)
    const buyButtonY = startY + 200;

    drawTextButton(this, {
      text: '购买 1 补给',
      x: centerX + 225,
      y: buyButtonY,
      width: 140,
      height: 35,
      onClick: () => this.handleBuyFood(1),
    });

    drawTextButton(this, {
      text: '购买 5 补给',
      x: centerX + 375,
      y: buyButtonY,
      width: 140,
      height: 35,
      onClick: () => this.handleBuyFood(5),
    });

    drawTextButton(this, {
      text: '购买 1 备用零件',
      x: centerX + 225,
      y: buyButtonY + 45,
      width: 140,
      height: 35,
      onClick: () => this.handleBuySpareParts(1),
    });

    drawTextButton(this, {
      text: '购买推荐采购包',
      x: centerX + 375,
      y: buyButtonY + 45,
      width: 140,
      height: 35,
      onClick: () => this.handleBuyRecommended(),
    });

    // Feedback text
    this.feedbackText = this.add.text(centerX, startY + 260, '', {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#4ade80',
      align: 'center',
    }).setOrigin(0.5);

    // Departure check panel
    drawPanel(this, {
      x: centerX,
      y: startY + 380,
      width: 700,
      height: 100,
    });

    this.add.text(centerX, startY + 325, '出发检查', {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    this.departureText = this.add.text(
      centerX,
      startY + 365,
      this.formatDepartureText(),
      {
        fontSize: `${FONT_SIZE_SMALL}px`,
        color: '#ffffff',
        align: 'left',
        lineSpacing: 6,
      },
    ).setOrigin(0.5);

    this.add.text(centerX, startY + 420, '出发功能 Phase 3 开放', {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#9ca3af',
      align: 'center',
    }).setOrigin(0.5);

    // Bottom buttons
    const buttonY = startY + 470;

    drawTextButton(this, {
      text: '返回商队总览',
      x: centerX - 200,
      y: buttonY,
      width: 200,
      height: 45,
      onClick: () => this.returnToOverview(),
    });

    drawTextButton(this, {
      text: '出发',
      x: centerX + 200,
      y: buttonY,
      width: 200,
      height: 45,
      onClick: () => this.handleDepart(),
    });
  }

  private handleBuyFood(amount: number): void {
    const result = buyFood(this.gameState, amount);
    this.gameState = result.gameState;
    this.updateUI();
    this.feedbackText.setText(result.message);
    if (result.success) {
      this.feedbackText.setColor('#4ade80');
    } else {
      this.feedbackText.setColor('#f87171');
    }
  }

  private handleBuySpareParts(amount: number): void {
    const result = buySpareParts(this.gameState, amount);
    this.gameState = result.gameState;
    this.updateUI();
    this.feedbackText.setText(result.message);
    if (result.success) {
      this.feedbackText.setColor('#4ade80');
    } else {
      this.feedbackText.setColor('#f87171');
    }
  }

  private handleBuyRecommended(): void {
    const result = buyRecommendedSupplies(this.gameState);
    this.gameState = result.gameState;
    this.updateUI();
    this.feedbackText.setText(result.message);
    if (result.success) {
      this.feedbackText.setColor('#4ade80');
    } else {
      this.feedbackText.setColor('#f87171');
    }
  }

  private handleDepart(): void {
    const check = canDepart(this.gameState);
    if (!check.canDepart) {
      this.feedbackText.setText(check.reasons.join('，'));
      this.feedbackText.setColor('#f87171');
      return;
    }
    // Enter route preparation scene
    this.scene.start('RoutePrepScene', { gameState: this.gameState });
  }

  private updateUI(): void {
    if (this.resourceText) {
      this.resourceText.setText(this.formatResourceText());
    }
    if (this.departureText) {
      this.departureText.setText(this.formatDepartureText());
    }
  }

  private formatResourceText(): string {
    return [
      `当前地点: ${this.gameState.currentLocationName}`,
      `金币: ${this.gameState.gold}`,
      `补给: ${this.gameState.food}`,
      `备用零件: ${this.gameState.spareParts}`,
      `士气: ${this.gameState.morale} / ${this.gameState.moraleMax}`,
      `货车耐久: ${this.gameState.caravanHp} / ${this.gameState.caravanMaxHp}`,
      `当前载重: ${this.gameState.currentCargoLoad} / ${this.gameState.maxCargoLoad}`,
    ].join('\n');
  }

  private formatDepartureText(): string {
    const check = canDepart(this.gameState);
    if (check.canDepart) {
      return '可以出发';
    }
    return check.reasons.join('  ');
  }

  private returnToOverview(): void {
    this.scene.start('CaravanOverviewScene', { gameState: this.gameState });
  }
}
