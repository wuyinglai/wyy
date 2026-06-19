import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Boot scene - just transition to main menu
    // No asset loading for now
    this.scene.start('MainMenuScene');
  }
}
