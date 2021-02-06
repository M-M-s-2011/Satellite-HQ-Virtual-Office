import "phaser";
import connect from "../socket";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.state = {};
  }
  preload() {
    this.load.image("officePlan", "assets/backgrounds/officePlan.png");
    this.load.image("banner", "assets/backgrounds/banner.png");
    this.load.image("sprite", "assets/spritesheets/sprite.png");
    this.load.image("bear", "assets/spritesheets/sprite2.png");
    this.load.image("star", "assets/spritesheets/star.png");
  }

  create() {
    const scene = this;

    this.socket = io();
    //connect front-end socket listeners
    connect(scene);

    //background
    this.add.image(400, 300, "officePlan");
    const banner = this.add.image(400, 50, "banner");
    banner.setScale(0.4);
    // CREATE OTHER PLAYERS GROUP
    this.otherPlayers = this.physics.add.group();

    this.bears = this.physics.add.group({
      key: "bear",
      repeat: 3,
      setXY: { x: 100, y: 300, stepX: 70 },
    });

    // Join the game room with roomKey 'office'
    this.socket.emit("joinRoom", "office");

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

      // emit player movement
      let x = this.sprite.x;
      let y = this.sprite.y;
      if (
        this.sprite.oldPosition &&
        (x !== this.sprite.oldPosition.x || y !== this.sprite.oldPosition.y)
      ) {
        this.moving = true;
        this.socket.emit("playerMovement", {
          x: this.sprite.x,
          y: this.sprite.y,
          roomKey: scene.state.roomKey,
        });
      }
      // save old position data
      this.sprite.oldPosition = {
        x: this.sprite.x,
        y: this.sprite.y,
        rotation: this.sprite.rotation,
      };
      //overlap
      //iterates over children and add overlap
      //look into otherPlayers.children.iterate()
      for (let otherPlayer of this.otherPlayers.children.entries) {
        otherPlayer.collider = this.physics.add.overlap(
          otherPlayer,
          this.sprite,
          function (otherPlayer, sprite) {
            console.log("otherPlayers & sprites");
          },
          null,
          this
        );
      }
    }
  }

  //need to change sprite location to dynamic
  addPlayer(scene, playerInfo) {
    scene.joined = true;
    scene.sprite = scene.physics.add
      .sprite(playerInfo.x, playerInfo.y, "sprite")
      .setScale(0.7)
      .setCircle(35)
      .setVisible(true)
      .setCollideWorldBounds(true);
  }
  addOtherPlayers(scene, playerInfo) {
    const otherPlayer = scene.physics.add
      .sprite(playerInfo.x + 40, playerInfo.y + 40, "star")
      .setScale(0.7)
      .setCircle(35)
      .setVisible(true)
      .setCollideWorldBounds(true);
    otherPlayer.playerId = playerInfo.playerId;
    scene.otherPlayers.add(otherPlayer);
  }
  //callback for overlap
  playerOverlap(player, otherPlayer) {
    console.log("player Overlap:", player.playerId, otherPlayer.playerId);
  }
}
