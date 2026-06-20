import Phaser from 'phaser';
import type { GameState, GridDirection, GridTile, GridTileType } from '../../core/types';
import {
  getCurrentTile,
  getGridMap,
  moveOnGridMap,
} from '../../systems/map/gridMapEngine';
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

const TILE_SIZE = 52;
const TILE_GAP = 4;

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
const COLOR_UNREVEALED_BG = 0x1f2937;

export class GridMapScene extends Phaser.Scene {
  private gameState!: GameState;

  constructor() {
    super({ key: 'GridMapScene' });
  }

  init(data: GridMapData): void {
    this.gameState = data.gameState;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLOR_DARK_BG);

    const mapDef = getGridMap(this.gameState.activeMapId!);
    const width = mapDef?.width ?? 13;
    const height = mapDef?.height ?? 9;

    // Title
    this.add.text(
      CANVAS_WIDTH / 2,
      28,
      `格子地图：${mapDef?.name ?? ''}`,
      {
        fontSize: `${FONT_SIZE_TITLE}px`,
        color: '#ffd700',
        align: 'center',
      },
    ).setOrigin(0.5);

    // Calculate grid positioning
    const mapPixelWidth = width * (TILE_SIZE + TILE_GAP) - TILE_GAP;
    const startX = (CANVAS_WIDTH - mapPixelWidth) / 2;
    const gridStartY = 60;

    // Render grid
    this.renderGrid(startX, gridStartY, mapDef!);

    // Info panel below grid
    const infoY = gridStartY + height * (TILE_SIZE + TILE_GAP) - TILE_GAP + 12;
    this.renderInfoPanel(infoY);

    // Back button
    const backBtnY = infoY + 110;
    const backBtn = this.add.rectangle(
      CANVAS_WIDTH / 2,
      backBtnY,
      200,
      40,
      0x374151,
    ).setStrokeStyle(2, 0xfde047);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      this.scene.start('RoutePrepScene', { gameState: this.gameState });
    });
    this.add.text(CANVAS_WIDTH / 2, backBtnY, '返回出发准备', {
      fontSize: `${FONT_SIZE_BODY}px`,
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);
  }

  private renderGrid(startX: number, startY: number, mapDef: { width: number; height: number; tiles: GridTile[] }): void {
    const visited = new Set(this.gameState.visitedTileIds);
    const revealed = new Set(this.gameState.revealedTileIds);
    const px = this.gameState.playerPosition?.x ?? -1;
    const py = this.gameState.playerPosition?.y ?? -1;

    const tileByPos: Record<string, GridTile> = {};
    for (const tile of mapDef.tiles) {
      tileByPos[`${tile.x},${tile.y}`] = tile;
    }

    for (let y = 0; y < mapDef.height; y++) {
      for (let x = 0; x < mapDef.width; x++) {
        const tile = tileByPos[`${x},${y}`];

        const bx = startX + x * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;
        const by = startY + y * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;

        if (!tile) {
          // No tile at this position - render empty
          const bg = this.add.rectangle(bx, by, TILE_SIZE, TILE_SIZE, 0x0a0a14);
          bg.setStrokeStyle(1, 0x1f2937);
          continue;
        }

        const isPlayer = x === px && y === py;
        const isVisited = visited.has(tile.id);
        const isRevealed = revealed.has(tile.id);
        const isAdjacent = this.isAdjacentToPlayer(tile);
        const isClickable = !isPlayer && isRevealed && tile.isPassable && isAdjacent;

        // Body fill color
        let fillColor: number;
        if (!isRevealed) {
          fillColor = COLOR_UNREVEALED_BG;
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
          borderColor = 0x4b5563;
        } else {
          borderColor = 0x1f2937;
        }

        // Draw tile background
        const bg = this.add.rectangle(bx, by, TILE_SIZE, TILE_SIZE, fillColor);
        bg.setStrokeStyle(isPlayer || isClickable ? 3 : 2, borderColor);

        // Draw symbol text
        const symbolText = isRevealed ? TILE_SYMBOL[tile.type] : '?';
        const symbol = this.add.text(bx, by, symbolText, {
          fontSize: `${FONT_SIZE_SMALL}px`,
          color: isRevealed ? '#ffffff' : '#6b7280',
          align: 'center',
        });
        symbol.setOrigin(0.5);

        // Player marker on top of player tile
        if (isPlayer) {
          const marker = this.add.text(bx, by - TILE_SIZE / 2 + 4, '队', {
            fontSize: '12px',
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
            bg.setStrokeStyle(4, 0xffffff);
          });
          bg.on('pointerout', () => {
            bg.setStrokeStyle(3, COLOR_ADJACENT_BORDER);
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
    this.add.rectangle(cx, infoY + 50, 760, 100, 0x16213e).setStrokeStyle(2, 0x3b82f6);

    // Info text
    const tile = getCurrentTile(this.gameState);
    const pos = this.gameState.playerPosition;
    const lines: string[] = tile && pos
      ? [
          `坐标: (${pos.x}, ${pos.y})  |  当前格子: ${tile.name}  |  类型: ${tile.type}`,
          `描述: ${tile.description}`,
        ]
      : ['(未进入地图)'];

    this.add.text(cx, infoY + 20, lines.join('\n'), {
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#ffffff',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    // Resource text
    this.add.text(
      cx,
      infoY + 70,
      [
        `Day ${this.gameState.day}  Food ${this.gameState.food}  Gold ${this.gameState.gold}  Parts ${this.gameState.spareParts}`,
        `Morale ${this.gameState.morale}/${this.gameState.moraleMax}  Caravan HP ${this.gameState.caravanHp}/${this.gameState.caravanMaxHp}`,
      ].join('\n'),
      {
        fontSize: `${FONT_SIZE_SMALL}px`,
        color: '#d1d5db',
        align: 'center',
        lineSpacing: 4,
      },
    ).setOrigin(0.5);
  }

  private handleTileClick(tile: GridTile): void {
    const pos = this.gameState.playerPosition;
    if (!pos) return;

    if (!this.isAdjacentToPlayer(tile)) {
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
    if (!result.success) return;

    // Re-render by restarting scene
    this.scene.restart({ gameState: this.gameState });
  }

  private isAdjacentToPlayer(tile: GridTile): boolean {
    const pos = this.gameState.playerPosition;
    if (!pos) return false;
    const dx = Math.abs(tile.x - pos.x);
    const dy = Math.abs(tile.y - pos.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }
}
