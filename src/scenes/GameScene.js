import Phaser from 'phaser';
import stripe from '../assets/stripe.png';
import platform from '../assets/platform.png';
import codey from '../assets/codey.png';
import { gameState } from '../helpers/helpers';

let platforms;
let player;
let cursors;
let platformCount = 0;
let emitter;
let particles;
let scoreText;

const { width, height } = gameState();
// eslint-disable-next-line import/no-mutable-exports
let { score } = gameState();

function updateY(platform) {
  const delta = Math.floor(height / 2) - player.y;

  if (delta > 0) {
    platform.y += delta / 30;
  }


  if (platform.y > 640) {
    score += 1;
    platform.y = -platform.height;
    platform.x = Math.floor(Math.random() * 400) + 24;
    platformCount += 1;
  }
}

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  preload() {
    this.load.image('platform', platform);
    this.load.image('stripe', stripe);
    this.load.spritesheet('codey', codey, {
      frameWidth: 72,
      frameHeight: 90,
    });
  }

  create() {
    particles = this.add.particles('stripe');

    const graphics = this.add.graphics();

    graphics.fillGradientStyle(0xcfd9df, 0xe2ebf0,
      0xfccaff, 0xe2ebf0, 1);

    graphics.fillRect(0, 0, width, height);

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNames('codey', {
        start: 2,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.physics.world.setBounds(0, 0, 480, 640);

    platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    for (let i = 0; i < 8; i += 1) {
      const randomX = Math.floor(Math.random() * 400) + 24;
      platforms.create(randomX, i * 80, 'platform').setScale(0.5);
    }

    player = this.physics.add.sprite(100, 350, 'codey').setScale(0.5);
    player.setBounce(1);
    player.setCollideWorldBounds(true);
    player.body.checkCollision.up = false;
    player.body.checkCollision.left = false;
    player.body.checkCollision.right = false;

    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(10, 20, 'Score: 0',
      { fontSize: '15px', color: '#000' });
  }

  update() {
    if (cursors.left.isDown) {
      player.setVelocityX(-240);
      player.flipX = true;
    } else if (cursors.right.isDown) {
      player.setVelocityX(240);
      player.flipX = false;
    } else {
      player.setVelocityX(0);
    }

    if (player.body.touching.down) {
      player.setVelocityY(-500);
      this.cameras.main.shake(100, 0.001);
    }

    player.anims.play('jump', true);

    if (player.body.y < height / 2) {
      scoreText.setText(`Score: ${score}`);
      platforms.children.iterate(updateY, this);
    }

    if (platformCount > 10 && emitter) {
      emitter = particles.createEmitter({
        x: { min: 0, max: width },
        y: height + 10,
        lifespan: 2500,
        speedY: { min: -300, max: -500 },
        scale: 0.5,
        quantity: 5,
        blendMode: 'ADD',
      });
    }

    if (player.body.y > height || player.body.blocked.down) {
      this.cameras.main.shake(240, 0.004,
        false, (camera, progress) => {
          if (progress > 0.9) {
            this.scene.stop('Game');
            this.scene.start('PreEnd');
          }
        });
    }
  }
}

export { score };