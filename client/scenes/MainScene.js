import "phaser";
import connect from "../socket";
import uniqid from "uniqid";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.state = {};
    // Store ids of players overlapping with our sprite
    // Should we move this to a property of scene.state?
    this.nearbyPlayers = {};
    this.rtcPeerConnections = {};
    this.inVideoCall = false;
  }
  preload() {
    this.load.image("officePlan", "assets/backgrounds/officePlan2.png");
    this.load.image("sprite", "assets/spritesheets/sprite.png");
    this.load.image("star", "assets/spritesheets/star1.png");

    this.load.script(
      "webfont",
      "//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js"
    );
  }

  create() {
    const scene = this;

    this.socket = io();
    //connect front-end socket listeners
    connect(scene);

    //background
    const background = this.add.image(400, 300, "officePlan");
    background.height = game.height;
    background.width = game.width;

    // CREATE OTHER PLAYERS GROUP
    this.otherPlayers = this.physics.add.group();

    // Join the game room with gameRoomName 'office'
    this.socket.emit("joinRoom", "office");
    //background

    // CREATE OTHER PLAYERS GROUP
    this.otherPlayers = this.physics.add.group();

    //set movement keys to arrow keys
    const keys = scene.input.keyboard.addKeys({
      up: "up",
      down: "down",
      left: "left",
      right: "right",
    }); // keys.up, keys.down, keys.left, keys.right
    this.cursors = keys;

    //set physics and bounds on the game world
    this.physics.world.enable(this);
    this.physics.world.setBounds(0, 0, 800, 600);

    //safeword banana
    // let container = this.add.container(400, 300);
    // let star = this.add.sprite(0, 0, "star");
    // let text = this.add.text(0, 0, "Carly");

    // container.add(star);
    // container.add(text);
    // star.setScale(4);
    // console.log("is there a star here?");
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
          gameRoomName: scene.state.gameRoomName,
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
    // console.log("adding player");
    // const container = this.add.container(0, 0);
    const label = this.add.text(playerInfo.x, playerInfo.y, "Carly");

    // const container = this.add.container(0, 0);
    // const text = this.add.text(0, 0, "Carly");
    // const sprite = this.add.sprite(playerInfo.x, playerInfo.y, "sprite");
    // container.add(sprite);
    // container.add(text);

    scene.joined = true;
    //the line below adds the sprite to the game map.
    scene.sprite = scene.physics.add
      .sprite(playerInfo.x, playerInfo.y, "sprite")
      .setScale(0.7)
      .setVisible(true)
      .setCollideWorldBounds(true);

    // console.log("I should have added text");

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
      // If we're not already in a call, join call with otherPlayer
      if (!this.inVideoCall) {
        this.joinVideoCall(this, otherPlayer);
      }
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
  // Joining video call
  joinVideoCall(scene, otherPlayer) {
    scene.inVideoCall = true;
    //join a conference call with otherPlayer
    scene.socket.emit(
      "joinCall",
      otherPlayer.playerId,
      scene.state.gameRoomName
    );
  }

  //Leaving video call
  leaveVideoCall(scene) {
    //closing all of our RTC peer connections
    for (let peerId in scene.rtcPeerConnections) {
      let connection = scene.rtcPeerConnections[peerId];
      connection.close();
      connection.ontrack = null;
      connection.onicecandidate = null;
    }
    scene.rtcPeerConnections = {};
    //Stop our video
    const video = document.getElementById("myvideo");
    video.srcObject = null;
    //Stop peer videos
    const peerVideos = document.getElementById("peervideos");
    peerVideos.innerHTML = "";
    //tell the server to remove us from the leaveCall
    scene.socket.emit("leaveCall", scene.state.gameRoomName);
    // Allow ourselves to join new calls
    scene.inVideoCall = false;
  }
}
