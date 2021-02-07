import "phaser";
import connect from "../socket";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.state = {};
    // Store ids of players overlapping with our sprite
    // Should we move this to a property of scene.state?
    this.nearbyPlayers = {};
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
    const background = this.add.image(350, 350, "officePlan");
    // const banner = this.add.image(400, 50, 'banner');
    background.height = game.height;
    background.width = game.width;

    // CREATE OTHER PLAYERS GROUP
    this.otherPlayers = this.physics.add.group();

    // Join the game room with roomKey 'office'
    this.socket.emit("joinRoom", "office");
    //background
    this.add.image(400, 300, "officePlan");
    const banner = this.add.image(400, 50, "banner");
    banner.setScale(0.4);
    // CREATE OTHER PLAYERS GROUP
    this.otherPlayers = this.physics.add.group();

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
      //iterates over children and add overlap
      //look into otherPlayers.children.iterate()
      //stange bug causing the callback to happen twice at each of the overlap
      this.otherPlayers.children.iterate((otherPlayer) =>
        scene.addPlayerOverlap(scene, otherPlayer)
      );
      // check the otherPlayers we were previously overlapping with
      // remove any where that's no longer the case
      this.checkOverlap(scene);
    }
  }

  //need to change sprite location to dynamic
  addPlayer(scene, playerInfo) {
    scene.joined = true;
    scene.sprite = scene.physics.add
      .sprite(playerInfo.x, playerInfo.y, "sprite")
      .setScale(0.7)
      .setVisible(true)
      .setCollideWorldBounds(true);
    scene.sprite.playerId = playerInfo.playerId;
  }
  addOtherPlayers(scene, playerInfo) {
    const otherPlayer = scene.physics.add
      .sprite(playerInfo.x + 40, playerInfo.y + 40, "star")
      .setScale(0.7)
      .setVisible(true)
      .setCollideWorldBounds(true);
    otherPlayer.playerId = playerInfo.playerId;
    scene.otherPlayers.add(otherPlayer);
  }
  // Add overlap for a pair of players
  addPlayerOverlap(scene, otherPlayer) {
    if (!otherPlayer.collider) {
      otherPlayer.collider = scene.physics.add.overlap(
        scene.sprite,
        otherPlayer,
        scene.playerOverlap,
        null,
        this
      );
    }
  }
  //callback for overlap
  playerOverlap(player, otherPlayer) {
    // this.nearbyPlayers stores the playerIds of other players
    // when overlapping
    const playerBounds = player.getBounds();
    const otherPlayerBounds = otherPlayer.getBounds();
    //fix edge case - ensuring the collider doesn't get triggered twice
    if (
      !this.nearbyPlayers[otherPlayer.playerId] &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        playerBounds,
        otherPlayerBounds
      )
    ) {
      // code inside this block runs only the first time overlap is triggered betwen player and otherPlayer
      this.nearbyPlayers[otherPlayer.playerId] = otherPlayer;
      console.log("checking Overlap:", player.playerId, otherPlayer.playerId);
    }
  }
  // Check whether there are any nearbyPlayers that we're no longer overlapping with
  checkOverlap(scene) {
    const spriteBounds = scene.sprite.getBounds();
    Object.keys(scene.nearbyPlayers).forEach((playerId) => {
      const otherPlayer = scene.nearbyPlayers[playerId];
      const otherPlayerBounds = otherPlayer.getBounds();
      if (
        !Phaser.Geom.Intersects.RectangleToRectangle(
          spriteBounds,
          otherPlayerBounds
        )
      ) {
        delete scene.nearbyPlayers[playerId];
      }
    });
  }
}
