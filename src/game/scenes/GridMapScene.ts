import Phaser from 'phaser';
import type { GameState, GridDirection, GridTile, GridTileType } from '../../core/types';
import {
  getCurrentTile,
  getGridMap,
  moveOnGridMap,
} from '../../systems/map/gridMapEngine';
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

const TILE_SIZE = 76;
const TILE_GAP = 8;

const TILE_SYMBOL: Record<GridTileType, string> = {
  town: '镇',
  outpost: '驿',
  road: '路',
  calm: '·',
  event: '事',
  resource: '资',
  battle: '战',
  specialBattle: '险',
  optionalElite: '巢',
  obstacle: 'X',
};

// Colors for tile body fill by type
const TILE_COLOR: Record<GridTileType, number> = {
  town: 0x2563eb,
  outpost: 0x7c3aed,
  road: 0x92400e,
  calm: 0x374151,
  event: 0xb45309,
  resource: 0x065f46,
  battle: 0x991b1b,
  specialBattle: 0x7f1d1d,
  optionalElite: 0x4c1d95,
  obstacle: 0x111827,
};

const COLOR_VISITED_BORDER = 0xfbbf24;
const COLOR_ADJACENT_BORDER = 0x34d399;
const COLOR_PLAYER_BORDER = 0xfde047;
const COLOR_UNREVEALED_BORDER = 0x374151;
const COLOR_HOVER = 0xffffff;

export class GridMapScene extends Phaser.Scene {
  private gameState!: GameState;
  private mapDef!: ReturnType<typeof getGridMap> & { id: string; name: string; width: number; height: number };

  constructor() {
    super({ key: 'GridMapScene' });
  }

  init(data: GridMapData): void {
    this.gameState = data.gameState;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLOR_DARK_BG);

    this.mapDef = getGridMap(this.gameState.activeMapId!)!;

    const mapPixelWidth = this.mapDef.width * (TILE_SIZE + TILE_GAP) - TILE_GAP;
    const startX = (CANVAS_WIDTH - mapPixelWidth) / 2;
    const gridStartY = 120;

    // Title
    const title = this.add.text(
      CANVAS_WIDTH / 2,
      50,
      `格子地图：${this.mapDef.name}`,
      {
        fontSize: `${FONT_SIZE_TITLE}px`,
        color: '#ffd700',
        align: 'center',
      },
    );
    title.setOrigin(0.5);


    // Grid
    this.renderGrid(startX, gridStartY);

    // Info panel
    const infoY = gridStartY + this.mapDef.height * (TILE_SIZE + TILE_GAP) - TILE_GAP + 20;
    this.renderInfoPanel(infoY);

    // Back button
    const backY = infoY + 130;
    drawTextButton(this, {
      text: '返回出发准备',
      x: CANVAS_WIDTH / 2,
      y: backY,
      width: 220,
      height: 40,
      onClick: () => this.returnToPrep(),
    });

  }

  private renderGrid(startX: number, startY: number): void {
    const visited = new Set(this.gameState.visitedTileIds);
    const revealed = new Set(this.gameState.revealedTileIds);
    const px = this.gameState.playerPosition?.x ?? -1;
    const py = this.gameState.playerPosition?.y ?? -1;

    const tileByPos: Record<string, GridTile> = {};
    for (const tile of this.mapDef.tiles) {
      tileByPos[`${tile.x},${tile.y}`] = tile;
    }

    for (let y = 0; y < this.mapDef.height; y++) {
      for (let x = 0; x < this.mapDef.width; x++) {
        const tile = tileByPos[`${x},${y}`];
        if (!tile) continue;

        const bx = startX + x * (TILE_SIZE + TILE_GAP);
        const by = startY + y * (TILE_SIZE + TILE_GAP);

        const isPlayer = x === px && y === py;
        const isVisited = visited.has(tile.id);
        const isRevealed = revealed.has(tile.id);
        const isAdjacent = this.isAdjacentToPlayer(tile);
        const isClickable = !isPlayer && isRevealed && tile.isPassable && isAdjacent;

        // Body fill color
        let fillColor: number;
        if (!isRevealed) {
          fillColor = 0x1f2937;
        } else if (tile.type === 'obstacle') {
          fillColor = TILE_COLOR['obstacle'];
        } else {
          fillColor = TILE_COLOR[tile.type] ?? 0x374151;
        }

        // Border color
        let borderColor: number;
        if (isPlayer) {
          borderColor = COLOR_PLAYER_BORDER;
        } else if (isClickable) {
          borderColor = COLOR_ADJACENT_BORDER;
        } else if (isVisited) {
          borderColor = COLOR_VISITED_BORDER;
        } else if (isRevealed) {
          borderColor = COLOR_UNREVEALED_BORDER;
        } else {
          borderColor = COLOR_UNREVEALED_BORDER;
        }

        // Draw tile background
        const bg = this.add.rectangle(bx, by, TILE_SIZE, TILE_SIZE, fillColor);
        bg.setStrokeStyle(2, borderColor);

        // Draw symbol text
        const symbolText = isRevealed ? TILE_SYMBOL[tile.type] : '?';
        const symbol = this.add.text(bx, by, symbolText, {
          fontSize: `${FONT_SIZE_BODY}px`,
          color: isRevealed ? '#ffffff' : '#6b7280',
          align: 'center',
        });
        symbol.setOrigin(0.5);

        // Player marker on top of player tile
        if (isPlayer) {
          const marker = this.add.text(bx, by - TILE_SIZE / 2 + 8, '队', {
            fontSize: `${FONT_SIZE_SMALL}px`,
            color: '#ffd700',
            align: 'center',
            backgroundColor: '#1a1a2e',
          });
          marker.setOrigin(0.5, 0);
        }
        // Make adjacent clickable tiles interactive
        if (isClickable) {
          bg.setInteractive({ useHandCursor: true });
          bg.on('pointerover', () => {
            bg.setStrokeStyle(3, COLOR_HOVER);
          });
          bg.on('pointerout', () => {
            bg.setStrokeStyle(2, COLOR_ADJACENT_BORDER);
          });
          bg.on('pointerdown', () => {
            this.handleTileClick(tile);
          });
        }
      }
    }
  }

  private renderInfoPanel(infoY: number): void {
    const cx = CANVAS_WIDTH / 2;

    // Panel background
    const panel = this.add.rectangle(cx, infoY + 50, 700, 130, 0x16213e);
    panel.setStrokeStyle(2, 0x3b82f6);

    // Info text
    const tile = getCurrentTile(this.gameState);
    const pos = this.gameState.playerPosition;
    const lines: string[] = tile && pos
      ? [
          `坐标: (${pos.x}, ${pos.y})  |  当前格子: ${tile.name}  |  类型: ${tile.type}`,
          `描述: ${tile.description}`,
        ]
      : ['(未进入地图)'];

    const infoText = this.add.text(cx, infoY + 20, lines.join('\n'), {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8,
    });
    infoText.setOrigin(0.5);

    // Resource text
    const resourceText = this.add.text(
      cx,
      infoY + 80,
      [
        `Day ${this.gameState.day}  Food ${this.gameState.food}  Gold ${this.gameState.gold}  Parts ${this.gameState.spareParts}`,
        `Morale ${this.gameState.morale}/${this.gameState.moraleMax}  Caravan HP ${this.gameState.caravanHp}/${this.gameState.caravanMaxHp}`,
      ].join('\n'),
      {
        fontSize: `${FONT_SIZE_SMALL}px`,
        color: '#d1d5db',
        align: 'center',
        lineSpacing: 6,
      },
    );
    resourceText.setOrigin(0.5);

    // Message text placeholder
    this.add.text(cx, infoY + 125, '', {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#fde047',
      align: 'center',
    }).setOrigin(0.5);
  }

  private handleTileClick(tile: GridTile): void {
    const pos = this.gameState.playerPosition;
    if (!pos) return;

    if (!this.isAdjacentToPlayer(tile)) {
      this.showMessage('只能移动到相邻可通行格子', '#f87171');
      return;
    }

    const dx = tile.x - pos.x;
    const dy = tile.y - pos.y;
    let direction: GridDirection | null = null;
    if (dx === 1) direction = 'right';
    else if (dx === -1) direction = 'left';
    else if (dy === 1) direction = 'down';
    else if (dy === -1) direction = 'up';

    if (!direction) return;

    const result = moveOnGridMap(this.gameState, direction);
    this.showMessage(result.message, result.success ? '#fde047' : '#f87171');

    // Re-render by restarting the scene
    this.scene.restart({ gameState: this.gameState });
  }

  private showMessage(msg: string, color: string): void {
    // Append message as a temporary overlay text above the grid
    const msgText = this.add.text(
      CANVAS_WIDTH / 2,
      95,
      msg,
      {
        fontSize: `${FONT_SIZE_BODY}px`,
        color,
        align: 'center',
        backgroundColor: '#1a1a2e',
      },
    );
    msgText.setOrigin(0.5);
    // Fade out after 2 seconds
    this.tweens.add({
      targets: msgText,
      alpha: 0,
      duration: 2000,
      onComplete: () => msgText.destroy(),
    });
  }

  private isAdjacentToPlayer(tile: GridTile): boolean {
    const pos = this.gameState.playerPosition;
    if (!pos) return false;
    const dx = Math.abs(tile.x - pos.x);
    const dy = Math.abs(tile.y - pos.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  private returnToPrep(): void {
    this.scene.start('RoutePrepScene', { gameState: this.gameState });
  }
}
