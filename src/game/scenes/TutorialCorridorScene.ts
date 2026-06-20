import Phaser from 'phaser';
import { GameState } from '../../core/types';
import {
  getCurrentTutorialCorridorNode,
  getVisibleTutorialCorridorNodes,
  moveTutorialCorridor,
  resolveTutorialCorridorNode,
} from '../../systems/tutorial/tutorialCorridorEngine';

const TILE_SIZE = 60;
const TILE_GAP = 8;
const GRID_START_X = 40;
const GRID_START_Y = 100;

// 辅助函数：判断是否是墙格行
export function isWallCell(row: number): boolean {
  return row === 0 || row === 2;
}

// 辅助函数：判断是否可以点击该格子
export function canClickTutorialCell(
  currentIndex: number,
  targetIndex: number,
  _visitedIds: string[]
): boolean {
  // 只能点击相邻的格子
  if (Math.abs(currentIndex - targetIndex) !== 1) {
    return false;
  }

  // 右侧格子可以点击（向前推进）
  if (targetIndex === currentIndex + 1) {
    return true;
  }

  // 左侧格子只有在已访问时才能点击（向后返回）
  if (targetIndex === currentIndex - 1) {
    // 需要检查该格子是否已访问
    // 这里简化处理：只要 index <= currentIndex 就认为已访问
    return targetIndex <= currentIndex;
  }

  return false;
}

export class TutorialCorridorScene extends Phaser.Scene {
  private gameState!: GameState;
  private messageText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'TutorialCorridorScene' });
  }

  init(data: { gameState: GameState }): void {
    this.gameState = data.gameState;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(400, 30, '教程路线', {
      fontSize: '24px',
      color: '#ffd700',
    }).setOrigin(0.5);

    // Render corridor with walls
    this.renderCorridor();

    // Info panel
    this.renderInfoPanel();

    // Message display
    this.messageText = this.add.text(400, 300, '', {
      fontSize: '20px',
      color: '#fbbf24',
      backgroundColor: '#1f2937',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);

    // Buttons (only resolve and back)
    this.renderButtons();
  }

  private renderCorridor(): void {
    const nodes = getVisibleTutorialCorridorNodes(this.gameState);
    const currentIndex = this.gameState.tutorialCorridorIndex;

    // 绘制三行：上墙、路线、下墙
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 20; col++) {
        const x = GRID_START_X + col * (TILE_SIZE + TILE_GAP);
        const y = GRID_START_Y + row * (TILE_SIZE + TILE_GAP);

        if (isWallCell(row)) {
          // 墙格
          this.renderWallTile(x, y);
        } else {
          // 路线格
          this.renderRouteTile(x, y, col, nodes[col], currentIndex);
        }
      }
    }
  }

  private renderWallTile(x: number, y: number): void {
    const tile = this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0x374151);
    tile.setStrokeStyle(2, 0x4b5563);

    // 墙格显示"墙"
    this.add.text(x, y, '墙', {
      fontSize: '16px',
      color: '#6b7280',
    }).setOrigin(0.5);

    // 墙格可点击，但显示提示
    tile.setInteractive({ useHandCursor: true });
    tile.on('pointerdown', () => {
      this.showMessage('墙壁挡住了去路');
    });
  }

  private renderRouteTile(
    x: number,
    y: number,
    index: number,
    node: any,
    currentIndex: number
  ): void {
    const isCurrent = index === currentIndex;
    const isVisited = this.gameState.visitedTutorialCorridorNodeIds.includes(node.id);
    const isUnknown = node.isUnknown;

    // 背景色
    let bgColor = 0x374151;
    if (isCurrent) {
      bgColor = 0xfbbf24; // 黄色：当前位置
    } else if (isVisited && !isUnknown) {
      bgColor = 0x10b981; // 绿色：已访问
    } else if (isUnknown) {
      bgColor = 0x1f2937; // 深色：未探索
    }

    const tile = this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, bgColor);

    // 边框
    let borderColor = 0x6b7280;
    let borderWidth = 2;

    // 可点击的格子高亮边框
    if (canClickTutorialCell(currentIndex, index, this.gameState.visitedTutorialCorridorNodeIds)) {
      borderColor = 0x3b82f6; // 蓝色：可点击
      borderWidth = 3;
    }

    tile.setStrokeStyle(borderWidth, borderColor);

    // 显示文字
    let displayText = '?';
    if (isCurrent) {
      displayText = '队';
    } else if (isVisited && !isUnknown) {
      displayText = this.getTypeSymbol(node.type);
    }

    this.add.text(x, y, displayText, {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // 路线格可点击
    tile.setInteractive({ useHandCursor: true });
    tile.on('pointerdown', () => {
      this.handleRouteCellClick(index, currentIndex);
    });
  }

  private handleRouteCellClick(targetIndex: number, currentIndex: number): void {
    // 点击当前格
    if (targetIndex === currentIndex) {
      this.showMessage('商队已经在此处');
      return;
    }

    // 检查是否可以点击
    if (!canClickTutorialCell(currentIndex, targetIndex, this.gameState.visitedTutorialCorridorNodeIds)) {
      this.showMessage('只能移动到相邻路线格');
      return;
    }

    // 向右移动
    if (targetIndex === currentIndex + 1) {
      const result = moveTutorialCorridor(this.gameState, 'right');
      if (result.success) {
        this.scene.restart({ gameState: this.gameState });
      } else {
        this.showMessage(result.message);
      }
      return;
    }

    // 向左移动
    if (targetIndex === currentIndex - 1) {
      const result = moveTutorialCorridor(this.gameState, 'left');
      if (result.success) {
        this.scene.restart({ gameState: this.gameState });
      } else {
        this.showMessage(result.message);
      }
      return;
    }
  }

  private renderInfoPanel(): void {
    const currentNode = getCurrentTutorialCorridorNode(this.gameState);
    if (!currentNode) return;

    const panelY = GRID_START_Y + 3 * (TILE_SIZE + TILE_GAP) + 20;

    // Current node info
    this.add.text(40, panelY, `当前节点: ${currentNode.name}`, {
      fontSize: '18px',
      color: '#ffffff',
    });

    this.add.text(40, panelY + 30, `类型: ${currentNode.type}`, {
      fontSize: '16px',
      color: '#9ca3af',
    });

    this.add.text(40, panelY + 60, `描述: ${currentNode.description}`, {
      fontSize: '14px',
      color: '#d1d5db',
      wordWrap: { width: 720 },
    });

    // Resources
    const resourceY = panelY + 120;
    this.add.text(40, resourceY, `Day ${this.gameState.day}  Food ${this.gameState.food}  Gold ${this.gameState.gold}  Parts ${this.gameState.spareParts}`, {
      fontSize: '16px',
      color: '#10b981',
    });

    this.add.text(40, resourceY + 30, `Morale ${this.gameState.morale}/${this.gameState.moraleMax}  HP ${this.gameState.caravanHp}/${this.gameState.caravanMaxHp}`, {
      fontSize: '16px',
      color: '#3b82f6',
    });
  }

  private renderButtons(): void {
    const buttonY = 550;

    // Resolve button
    const resolveBtn = this.add.rectangle(300, buttonY, 120, 40, 0x10b981);
    resolveBtn.setStrokeStyle(2, 0x34d399);
    resolveBtn.setInteractive({ useHandCursor: true });
    this.add.text(300, buttonY, '处理节点', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
    resolveBtn.on('pointerdown', () => {
      this.handleResolve();
    });

    // Back button
    const backBtn = this.add.rectangle(150, buttonY, 120, 40, 0x6b7280);
    backBtn.setStrokeStyle(2, 0x9ca3af);
    backBtn.setInteractive({ useHandCursor: true });
    this.add.text(150, buttonY, '返回准备', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
    backBtn.on('pointerdown', () => {
      this.scene.start('RoutePrepScene', { gameState: this.gameState });
    });
  }

  private handleResolve(): void {
    const result = resolveTutorialCorridorNode(this.gameState);
    if (result.success) {
      this.showMessage(result.message);
      // 刷新场景以更新资源显示
      this.scene.restart({ gameState: this.gameState });
    } else {
      this.showMessage(result.message);
    }
  }

  private showMessage(message: string): void {
    this.messageText.setText(message);
    this.time.delayedCall(2000, () => {
      this.messageText.setText('');
    });
  }

  private getTypeSymbol(type: string): string {
    switch (type) {
      case 'town':
        return '镇';
      case 'road':
        return '路';
      case 'event':
        return '事';
      case 'resource':
        return '资';
      case 'battle':
        return '战';
      case 'outpost':
        return '驿';
      default:
        return '?';
    }
  }
}
