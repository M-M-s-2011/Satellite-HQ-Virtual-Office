import 'phaser';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.state = {};
  }
  preload() {
    this.load.image('officePlan', 'assets/backgrounds/officePlan.png');
    // this.load.image("banner", "assets/backgrounds/banner.png");
    this.load.spritesheet('sprite', 'assets/spritesheets/sprite.png', {
      frameWidth: 29,
      frameHeight: 37,
    });
    this.load.image('vendingMachine', 'assets/sprites/vendingMachine.png');
  }

  create() {
    const scene = this;

    //background
    this.add.image(400, 300, 'officePlan');
    // const banner = this.add.image(400, 50, "banner");
    // banner.setScale(0.4);

    // this.socket = io();

    // ADD VENDING MACHINE for collisions
    console.log('Adding vending machine');

    this.vendingMachine = this.physics.add
      .sprite(300, 300, 'vendingMachine')
      .setVisible(true)
      .setCollideWorldBounds(true);

    //ADD SPRITE with world bounds
    this.sprite = scene.physics.add
      .sprite(300, 200, 'sprite')
      .setSize(30, 40)
      .setVisible(true)
      .setVelocity(400, 300)
      .setCollideWorldBounds(true);

    this.overlapTriggered = false;

    this.sprite.body.setCircle(20);

    //this.collidingWithVendingMachine = false;

    // ADD COLLIDER between vending machine and sprite
    this.vendingMachineCollider = this.physics.add.overlap(
      this.sprite,
      this.vendingMachine,
      this.vendingMachineColliderCallback.bind(this)
    );

    //set movement keys to arrow keys
    this.cursors = this.input.keyboard.createCursorKeys();

    //set physics and bounds on the game world
    this.physics.world.enable(this);
    this.physics.world.setBounds(0, 0, 800, 600);
  }
  update() {
    const scene = this;

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

      // Add the vending machine collider if (1) we're not touching anything and (2) it's not currently defined
      if (this.sprite.body.touching.none && !this.vendingMachineCollider) {
        console.log('this.sprite.body.touching', this.sprite.body.touching);
        this.vendingMachineCollider = this.physics.add.overlap(
          this.sprite,
          this.vendingMachine,
          this.vendingMachineColliderCallback.bind(this)
        );
      }
    }
  }

  vendingMachineColliderCallback() {
    console.log('Inside Vending Machine Collider Callback');
    console.log(
      'this.sprite.body.touching in vendingMachineCallback',
      this.sprite.body.touching
    );
    this.physics.world.removeCollider(this.vendingMachineCollider);
    this.vendingMachineCollider = null;
  }
}
