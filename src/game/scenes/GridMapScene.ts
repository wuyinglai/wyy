import Phaser from 'phaser';
import type { GameState } from '../../core/types';
import {
  getCurrentTile,
  getGridMap,
  moveOnGridMap,
} from '../../systems/map/gridMapEngine';
import { drawPanel } from '../../ui/drawPanel';
import { drawTextButton } from '../../ui/drawTextButton';
import {
  CANVAS_WIDTH,
  COLOR_DARK_BG,
  FONT_SIZE_TITLE,
  FONT_SIZE_BODY,
  FONT_SIZE_SMALL,
} from '../../core/constants';

interface GridMapData {
  gameState: GameState;
}

export class GridMapScene extends Phaser.Scene {
  private gameState!: GameState;
  private infoText!: Phaser.GameObjects.Text;
  private resourceText!: Phaser.GameObjects.Text;
  private mapText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GridMapScene' });
  }

  init(data: GridMapData): void {
    this.gameState = data.gameState;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLOR_DARK_BG);

    const centerX = CANVAS_WIDTH / 2;
    const startY = 50;

    // Title
    const map = this.gameState.activeMapId ? getGridMap(this.gameState.activeMapId) : undefined;
    this.add.text(centerX, startY, `格子地图${map ? '：' + map.name : ''}`, {
      fontSize: `${FONT_SIZE_TITLE}px`,
      color: '#ffd700',
      align: 'center',
    }).setOrigin(0.5);

    // Map display panel
    drawPanel(this, {
      x: centerX,
      y: startY + 130,
      width: 560,
      height: 180,
    });

    this.mapText = this.add.text(centerX, startY + 130, '', {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#ffffff',
      align: 'center',
      lineSpacing: 6,
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Current tile info panel
    drawPanel(this, {
      x: centerX,
      y: startY + 290,
      width: 560,
      height: 110,
    });

    this.infoText = this.add.text(centerX, startY + 290, '', {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#ffffff',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);

    // Resource panel
    drawPanel(this, {
      x: centerX,
      y: startY + 400,
      width: 560,
      height: 90,
    });

    this.resourceText = this.add.text(centerX, startY + 400, '', {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#ffffff',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);

    // Message
    this.messageText = this.add.text(centerX, startY + 480, '', {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#fde047',
      align: 'center',
    }).setOrigin(0.5);

    // Direction buttons
    const btnY = startY + 530;
    drawTextButton(this, {
      text: '上',
      x: centerX,
      y: btnY - 50,
      width: 100,
      height: 40,
      onClick: () => this.handleMove('up'),
    });
    drawTextButton(this, {
      text: '下',
      x: centerX,
      y: btnY + 50,
      width: 100,
      height: 40,
      onClick: () => this.handleMove('down'),
    });
    drawTextButton(this, {
      text: '左',
      x: centerX - 120,
      y: btnY,
      width: 100,
      height: 40,
      onClick: () => this.handleMove('left'),
    });
    drawTextButton(this, {
      text: '右',
      x: centerX + 120,
      y: btnY,
      width: 100,
      height: 40,
      onClick: () => this.handleMove('right'),
    });

    // Return button
    drawTextButton(this, {
      text: '返回出发准备',
      x: centerX,
      y: btnY + 110,
      width: 220,
      height: 40,
      onClick: () => this.returnToPrep(),
    });

    this.updateMapDisplay();
    this.updateInfoDisplay();
    this.updateResourceDisplay();
    this.messageText.setText('');
  }

  private handleMove(direction: 'up' | 'down' | 'left' | 'right'): void {
    const result = moveOnGridMap(this.gameState, direction);
    if (result.success) {
      this.updateMapDisplay();
      this.updateInfoDisplay();
      this.updateResourceDisplay();
      this.messageText.setColor('#fde047');
    } else {
      this.messageText.setColor('#f87171');
    }
    this.messageText.setText(result.message);
  }

  private returnToPrep(): void {
    this.scene.start('RoutePrepScene', { gameState: this.gameState });
  }

  private updateMapDisplay(): void {
    if (!this.gameState.activeMapId) {
      this.mapText.setText('(未进入地图)');
      return;
    }
    const map = getGridMap(this.gameState.activeMapId);
    if (!map) {
      this.mapText.setText('(地图不存在)');
      return;
    }
    const tileByPos: Record<string, string> = {};
    for (const tile of map.tiles) {
      tileByPos[`${tile.x},${tile.y}`] = tile.id;
    }
    const revealed = new Set(this.gameState.revealedTileIds);
    const visited = new Set(this.gameState.visitedTileIds);
    const playerX = this.gameState.playerPosition?.x ?? -1;
    const playerY = this.gameState.playerPosition?.y ?? -1;

    const lines: string[] = [];
    for (let y = 0; y < map.height; y++) {
      const cells: string[] = [];
      for (let x = 0; x < map.width; x++) {
        if (x === playerX && y === playerY) {
          cells.push('[P]');
          continue;
        }
        const tileId = tileByPos[`${x},${y}`];
        if (!tileId) {
          cells.push('[ ]');
          continue;
        }
        if (visited.has(tileId)) {
          cells.push('[v]');
        } else if (revealed.has(tileId)) {
          cells.push('[?]');
        } else {
          cells.push('[ ]');
        }
      }
      lines.push(cells.join(' '));
    }
    this.mapText.setText(lines.join('\n'));
  }

  private updateInfoDisplay(): void {
    const tile = getCurrentTile(this.gameState);
    const pos = this.gameState.playerPosition;
    if (!tile || !pos) {
      this.infoText.setText('(未进入地图)');
      return;
    }
    this.infoText.setText([
      `坐标: (${pos.x}, ${pos.y})`,
      `当前格子: ${tile.name}`,
      `类型: ${tile.type}`,
      `描述: ${tile.description}`,
    ].join('\n'));
  }

  private updateResourceDisplay(): void {
    this.resourceText.setText([
      `Day: ${this.gameState.day}  Food: ${this.gameState.food}  Gold: ${this.gameState.gold}`,
      `Parts: ${this.gameState.spareParts}  Morale: ${this.gameState.morale}/${this.gameState.moraleMax}  Hp: ${this.gameState.caravanHp}/${this.gameState.caravanMaxHp}`,
    ].join('\n'));
  }
}
