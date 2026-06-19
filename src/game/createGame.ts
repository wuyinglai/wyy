import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { CaravanOverviewScene } from './scenes/CaravanOverviewScene';
import { GraybridgePurchaseScene } from './scenes/GraybridgePurchaseScene';
import { RoutePrepScene } from './scenes/RoutePrepScene';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants';

export function createGame(): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scene: [BootScene, MainMenuScene, CaravanOverviewScene, GraybridgePurchaseScene, RoutePrepScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  return new Phaser.Game(config);
}
