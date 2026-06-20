import Phaser from 'phaser';
import { GameState } from '../../core/types';
import {
  getCurrentTutorialCorridorNode,
  getVisibleTutorialCorridorNodes,
  moveTutorialCorridor,
} from '../../systems/tutorial/tutorialCorridorEngine';

const TILE_SIZE = 60;
const TILE_GAP = 8;
const GRID_START_X = 40;
const GRID_START_Y = 120;

export class TutorialCorridorScene extends Phaser.Scene {
  private gameState!: GameState;

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

    // Render corridor
    this.renderCorridor();

    // Info panel
    this.renderInfoPanel();

    // Buttons
    this.renderButtons();
  }

  private renderCorridor(): void {
    const nodes = getVisibleTutorialCorridorNodes(this.gameState);
    const currentIndex = this.gameState.tutorialCorridorIndex;

    nodes.forEach((node, index) => {
      const x = GRID_START_X + index * (TILE_SIZE + TILE_GAP);
      const y = GRID_START_Y;

      // Tile background
      const isCurrent = index === currentIndex;
      const isVisited = this.gameState.visitedTutorialCorridorNodeIds.includes(node.id);
      const isUnknown = node.isUnknown;

      let bgColor = 0x374151; // default gray
      if (isCurrent) {
        bgColor = 0xfbbf24; // yellow for current
      } else if (isVisited) {
        bgColor = 0x10b981; // green for visited
      } else if (isUnknown) {
        bgColor = 0x1f2937; // dark for unknown
      }

      const tile = this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, bgColor);
      tile.setStrokeStyle(2, 0x6b7280);

      // Symbol or name
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

      // Make clickable
      if (isCurrent || (isVisited && !isUnknown)) {
        tile.setInteractive({ useHandCursor: true });
        tile.on('pointerdown', () => {
          this.handleNodeClick(index);
        });
      }
    });
  }

  private renderInfoPanel(): void {
    const currentNode = getCurrentTutorialCorridorNode(this.gameState);
    if (!currentNode) return;

    const panelY = GRID_START_Y + 80;

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
    const buttonY = 500;

    // Move right button
    const rightBtn = this.add.rectangle(600, buttonY, 120, 40, 0x3b82f6);
    rightBtn.setStrokeStyle(2, 0x60a5fa);
    rightBtn.setInteractive({ useHandCursor: true });
    this.add.text(600, buttonY, '向右移动', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
    rightBtn.on('pointerdown', () => {
      this.handleMove('right');
    });

    // Move left button
    const leftBtn = this.add.rectangle(450, buttonY, 120, 40, 0x3b82f6);
    leftBtn.setStrokeStyle(2, 0x60a5fa);
    leftBtn.setInteractive({ useHandCursor: true });
    this.add.text(450, buttonY, '向左移动', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
    leftBtn.on('pointerdown', () => {
      this.handleMove('left');
    });

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

  private handleNodeClick(index: number): void {
    const currentIndex = this.gameState.tutorialCorridorIndex;

    if (index === currentIndex + 1) {
      this.handleMove('right');
    } else if (index === currentIndex - 1) {
      this.handleMove('left');
    }
  }

  private handleMove(direction: 'left' | 'right'): void {
    const result = moveTutorialCorridor(this.gameState, direction);
    if (result.success) {
      this.scene.restart({ gameState: this.gameState });
    } else {
      this.showAlert(result.message);
    }
  }

  private handleResolve(): void {
    // TODO: Implement resolve logic
    this.showAlert('节点处理功能待实现');
  }

  private showAlert(message: string): void {
    const alert = this.add.text(400, 300, message, {
      fontSize: '20px',
      color: '#ef4444',
      backgroundColor: '#1f2937',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      alert.destroy();
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
