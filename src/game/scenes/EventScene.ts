import Phaser from 'phaser';
import type { GameState } from '../../core/types';
import { resolveRouteEventChoice } from '../../systems/route/routeEventResolver';
import { getCurrentRouteNode } from '../../systems/route/routeEngine';
import { drawPanel } from '../../ui/drawPanel';
import { drawTextButton } from '../../ui/drawTextButton';
import {
  CANVAS_WIDTH,
  COLOR_DARK_BG,
  FONT_SIZE_TITLE,
  FONT_SIZE_BODY,
  FONT_SIZE_SMALL,
} from '../../core/constants';

interface EventSceneData {
  gameState: GameState;
  lastResult?: {
    success: boolean;
    message: string;
  };
}

interface EventChoice {
  choiceId: string;
  text: string;
}

interface EventDefinition {
  title: string;
  description: string;
  choices: EventChoice[];
  autoResolve?: boolean;
}

const EVENT_DEFINITIONS: Record<string, EventDefinition> = {
  n3_d3: {
    title: '断裂路面',
    description: '前方道路出现断裂。货车需要谨慎通过。',
    choices: [
      { choiceId: 'use_spare_part', text: '使用 1 备用零件安全通过' },
      { choiceId: 'detour', text: '绕路（+2 天，-2 补给）' },
      { choiceId: 'force_cross', text: '强行通过（货车耐久 -6）' },
    ],
  },
  n3_d8: {
    title: '受伤旅人',
    description: '路旁发现一名受伤的旅人，他看起来需要帮助。',
    choices: [
      { choiceId: 'give_food', text: '给 1 补给（士气 +1）' },
      { choiceId: 'give_gold', text: '给 5 金币（敌情 +1）' },
      { choiceId: 'ignore', text: '不管' },
    ],
  },
  n3_d18: {
    title: '驿站灯火',
    description: '远处出现灰灯驿站的灯火，队伍士气大振。',
    choices: [],
    autoResolve: true,
  },
};

export class EventScene extends Phaser.Scene {
  private gameState!: GameState;
  private lastResult?: {
    success: boolean;
    message: string;
  };

  constructor() {
    super({ key: 'EventScene' });
  }

  init(data: EventSceneData): void {
    this.gameState = data.gameState;
    this.lastResult = data.lastResult;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLOR_DARK_BG);

    const node = getCurrentRouteNode(this.gameState);
    if (!node) {
      throw new Error('No current node');
    }

    const eventDef = EVENT_DEFINITIONS[node.id];
    if (!eventDef) {
      throw new Error(`Event definition not found: ${node.id}`);
    }

    const centerX = CANVAS_WIDTH / 2;
    const startY = 60;

    // Title
    this.add.text(centerX, startY, eventDef.title, {
      fontSize: `${FONT_SIZE_TITLE}px`,
      color: '#ffd700',
      align: 'center',
    }).setOrigin(0.5);

    // Node type
    this.add.text(centerX, startY + 50, '事件节点', {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#9ca3af',
      align: 'center',
    }).setOrigin(0.5);

    // Description panel
    drawPanel(this, {
      x: centerX,
      y: startY + 130,
      width: 700,
      height: 100,
    });

    this.add.text(centerX, startY + 130, eventDef.description, {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 650 },
    }).setOrigin(0.5);

    // Resources panel
    drawPanel(this, {
      x: centerX,
      y: startY + 260,
      width: 700,
      height: 130,
    });

    this.add.text(centerX, startY + 215, '当前资源', {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(centerX, startY + 255, this.formatResourceText(), {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#ffffff',
      align: 'left',
      lineSpacing: 8,
    }).setOrigin(0.5);

    // ==== 如果是上一次选择的结果，显示结果消息 ====
    if (this.lastResult) {
      const color = this.lastResult.success ? '#10b981' : '#ef4444';
      this.add.text(centerX, startY + 370, this.lastResult.message, {
        fontSize: `${FONT_SIZE_BODY}px`,
        color,
        align: 'center',
        wordWrap: { width: 650 },
      }).setOrigin(0.5);

      drawTextButton(this, {
        text: '返回路线',
        x: centerX,
        y: startY + 460,
        width: 200,
        height: 50,
        onClick: () => this.returnToRoute(),
      });
      return;
    }

    // 检查是否已结算
    const isResolved = this.gameState.resolvedEventNodeIds.includes(node.id);

    if (isResolved) {
      // 已结算事件
      this.add.text(centerX, startY + 350, '该事件已结算', {
        fontSize: `${FONT_SIZE_BODY}px`,
        color: '#9ca3af',
        align: 'center',
      }).setOrigin(0.5);

      drawTextButton(this, {
        text: '返回路线',
        x: centerX,
        y: startY + 430,
        width: 200,
        height: 50,
        onClick: () => this.returnToRoute(),
      });
      return;
    }

    // 驿站灯火 - 自动事件
    if (eventDef.autoResolve) {
      const result = resolveRouteEventChoice(this.gameState, node.id, 'auto');

      this.add.text(centerX, startY + 350, result.message, {
        fontSize: `${FONT_SIZE_BODY}px`,
        color: '#10b981',
        align: 'center',
        wordWrap: { width: 650 },
      }).setOrigin(0.5);

      drawTextButton(this, {
        text: '返回路线',
        x: centerX,
        y: startY + 430,
        width: 200,
        height: 50,
        onClick: () => this.returnToRoute(),
      });
      return;
    }

    // 普通事件 - 显示选项按钮
    const choiceY = startY + 370;
    const spacing = 55;

    eventDef.choices.forEach((choice, index) => {
      drawTextButton(this, {
        text: choice.text,
        x: centerX,
        y: choiceY + index * spacing,
        width: 500,
        height: 45,
        onClick: () => this.handleChoice(node.id, choice.choiceId),
      });
    });

    // 返回路线
    drawTextButton(this, {
      text: '返回路线',
      x: centerX,
      y: startY + 540,
      width: 200,
      height: 45,
      onClick: () => this.returnToRoute(),
    });
  }

  private formatResourceText(): string {
    return [
      `金币: ${this.gameState.gold}`,
      `补给: ${this.gameState.food}`,
      `备用零件: ${this.gameState.spareParts}`,
      `士气: ${this.gameState.morale} / ${this.gameState.moraleMax}`,
      `货车耐久: ${this.gameState.caravanHp} / ${this.gameState.caravanMaxHp}`,
      `敌情: ${this.gameState.enemyIntel}`,
    ].join('\n');
  }

  private handleChoice(nodeId: string, choiceId: string): void {
    const result = resolveRouteEventChoice(this.gameState, nodeId, choiceId);
    this.scene.restart({
      gameState: this.gameState,
      lastResult: { success: result.success, message: result.message },
    });
  }

  private returnToRoute(): void {
    this.scene.start('RouteScene', { gameState: this.gameState });
  }
}
