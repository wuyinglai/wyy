import Phaser from 'phaser';
import type { GameState } from '../../core/types';
import { initialRoutes } from '../../data/initialRoutes';
import { advanceRoute } from '../../systems/route/routeEngine';
import { drawPanel } from '../../ui/drawPanel';
import { drawTextButton } from '../../ui/drawTextButton';
import {
  CANVAS_WIDTH,
  COLOR_DARK_BG,
  FONT_SIZE_TITLE,
  FONT_SIZE_BODY,
  FONT_SIZE_SMALL,
} from '../../core/constants';

interface RouteSceneData {
  gameState: GameState;
}

const NODE_TYPE_LABELS: Record<string, string> = {
  start: '起点',
  calm: '平静',
  event: '事件',
  resource: '资源',
  battle: '战斗',
  specialBattle: '特殊战斗',
  optionalElite: '精英战（可选）',
  outpost: '驿站',
  city: '城市',
  village: '村庄',
  town: '小镇',
};

export class RouteScene extends Phaser.Scene {
  private gameState!: GameState;

  constructor() {
    super({ key: 'RouteScene' });
  }

  init(data: RouteSceneData): void {
    this.gameState = data.gameState;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLOR_DARK_BG);

    const route = initialRoutes.find(r => r.id === this.gameState.activeRouteId);
    if (!route || !this.gameState.currentRouteNodeId) {
      throw new Error('Invalid route state');
    }

    const currentNode = route.nodes.find(n => n.id === this.gameState.currentRouteNodeId);
    if (!currentNode) {
      throw new Error('Current node not found');
    }

    const centerX = CANVAS_WIDTH / 2;
    const startY = 60;

    // Title - route name
    this.add.text(centerX, startY, route.name, {
      fontSize: `${FONT_SIZE_TITLE}px`,
      color: '#ffd700',
      align: 'center',
    }).setOrigin(0.5);

    // Current day
    this.add.text(centerX, startY + 50, `第 ${currentNode.dayIndex} 天`, {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    // Node info panel
    drawPanel(this, {
      x: centerX,
      y: startY + 130,
      width: 700,
      height: 180,
    });

    // Node name
    this.add.text(centerX, startY + 90, currentNode.name, {
      fontSize: `${FONT_SIZE_BODY + 4}px`,
      color: '#ffd700',
      align: 'center',
    }).setOrigin(0.5);

    // Node type
    const typeLabel = NODE_TYPE_LABELS[currentNode.type] || currentNode.type;
    this.add.text(centerX, startY + 125, `类型: ${typeLabel}`, {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#9ca3af',
      align: 'center',
    }).setOrigin(0.5);

    // Node description
    this.add.text(centerX, startY + 155, currentNode.description, {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 650 },
    }).setOrigin(0.5);

    // Resources panel
    drawPanel(this, {
      x: centerX,
      y: startY + 350,
      width: 700,
      height: 150,
    });

    this.add.text(centerX, startY + 310, '当前资源', {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(centerX, startY + 345, this.formatResourceText(), {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#ffffff',
      align: 'left',
      lineSpacing: 8,
    }).setOrigin(0.5);

    // Progress
    this.add.text(centerX, startY + 430, `当前进度: 第 ${currentNode.dayIndex} / ${route.totalDays} 天`, {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#ffd700',
      align: 'center',
    }).setOrigin(0.5);

    // Warning messages
    let warningY = startY + 470;

    // Food warning
    if (this.gameState.food === 0) {
      this.add.text(centerX, warningY, '补给已耗尽，N3.1 教学阶段暂不死档。', {
        fontSize: `${FONT_SIZE_SMALL}px`,
        color: '#ef4444',
        align: 'center',
      }).setOrigin(0.5);
      warningY += 30;
    }

    // Event/battle/resource node warning
    const specialTypes = ['event', 'battle', 'resource', 'specialBattle', 'optionalElite'];
    if (specialTypes.includes(currentNode.type)) {
      this.add.text(centerX, warningY, '该节点将在后续阶段开放，本阶段仅记录路线推进。', {
        fontSize: `${FONT_SIZE_SMALL}px`,
        color: '#f59e0b',
        align: 'center',
      }).setOrigin(0.5);
    }

    // Advance button
    drawTextButton(this, {
      text: '继续前进',
      x: centerX,
      y: startY + 540,
      width: 200,
      height: 50,
      onClick: () => this.handleAdvance(),
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

  private handleAdvance(): void {
    advanceRoute(this.gameState);
    this.scene.restart({ gameState: this.gameState });
  }
}
