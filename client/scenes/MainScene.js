import "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.state = {};
  }
  preload() {
    this.load.image("officePlan", "assets/backgrounds/officePlan.png");
    // this.load.image("banner", "assets/backgrounds/banner.png");
    this.load.spritesheet("sprite", "assets/spritesheets/sprite.png", {
      frameWidth: 29,
      frameHeight: 37,
    });
  }

  create() {
    const scene = this;

    //background
    this.add.image(400, 300, "officePlan");
    // const banner = this.add.image(400, 50, "banner");
    // banner.setScale(0.4);

    // this.socket = io();

    //ADD SPRITE with world bounds
    this.sprite = scene.physics.add
      .sprite(300, 200, "sprite")
      .setSize(30, 40)
      .setVisible(true)
      .setVelocity(400, 300)
      .setCollideWorldBounds(true);

    //set movement keys to arrow keys
    this.cursors = this.input.keyboard.createCursorKeys();

    //set physics and bounds on the game world
    this.physics.world.enable(this);
    this.physics.world.setBounds(0, 0, 800, 600);
  }
  update() {
    const scene = this;
    console.log("I'm just visiting!");

    //sprite mechanics for movement
    if (this.sprite) {
      const speed = 225;
      const prevVelocity = this.sprite.body.velocity.clone();
      // Stop any previous movement from the last frame
      this.sprite.body.setVelocity(0);
      // Horizontal movement
      if (this.cursors.left.isDown) {
        this.sprite.body.setVelocityX(-speed);
      } else if (this.cursors.right.isDown) {
        this.sprite.body.setVelocityX(speed);
      }

      // Vertical movement
      if (this.cursors.up.isDown) {
        this.sprite.body.setVelocityY(-speed);
      } else if (this.cursors.down.isDown) {
        this.sprite.body.setVelocityY(speed);
      }

      // Normalize and scale the velocity so that sprite can't move faster along a diagonal
      this.sprite.body.velocity.normalize().scale(speed);
    }
  }
}
