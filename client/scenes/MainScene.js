import 'phaser';
import connect from '../socket';
import { VIDEO_SETTINGS } from '../socket/RTC/constants';

const AVATARS = {
  carly: 'assets/spritesheets/carly.png',
  gracie: 'assets/spritesheets/gracie.png',
  lb: 'assets/spritesheets/lb.png',
  navya: 'assets/spritesheets/navya.png',
};

const joinBtnDiv = document.getElementById('join-button-div');
const joinButton = document.getElementById('join-button');
const leaveBtnDiv = document.getElementById('leave-button-div');
const leaveButton = document.getElementById('leave-button');
const memoInput = document.getElementById('chat');
const submitMemoBtn = document.getElementById('submit-memo-btn');

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.state = {};
    // Store ids of players overlapping with our sprite
    // Should we move this to a property of scene.state?
    this.nearbyPlayers = {};
    this.rtcPeerConnections = {};
    this.inVideoCall = false;
    leaveButton.addEventListener('click', () => this.leaveVideoCall(this));
  }
  preload() {
    this.load.image('officePlan', 'assets/backgrounds/officePlan2.png');
    Object.keys(AVATARS).forEach((avatarKey) =>
      this.load.image(avatarKey, AVATARS[avatarKey])
    );
    this.load.html('name-input', 'assets/backgrounds/name-submit.html');
  }

  create() {
    const scene = this;

    this.socket = io();
    //connect front-end socket listeners
    connect(scene);

    //chat event listeners
    submitMemoBtn.addEventListener('click', () => {
      scene.submitMemo(scene);
    });
    //background
    const background = this.add.image(400, 300, 'officePlan');
    background.height = game.height;
    background.width = game.width;

    this.inputForm = this.add
      .dom(400, 300)
      .createFromCache('name-input')
      .addListener('click');

    this.inputForm.on('click', async (e) => {
      e.preventDefault();
      if (e.target.name === 'submit') {
        const usersName = await scene.inputForm.getChildByName('name');
        scene.userTextName.setText(usersName.value);
        scene.inputForm.destroy();
        this.socket.emit('setName', this.state.gameRoomName, usersName.value);
      }
    });
    scene.userTextName = this.add.text(400, 300, '');

    // CREATE OTHER PLAYERS GROUP
    this.otherPlayers = this.physics.add.group();

    // Join the game room with gameRoomName 'office'
    this.socket.emit('joinRoom', 'office');
    //background

    // CREATE OTHER PLAYERS GROUP
    this.otherPlayers = this.physics.add.group();

    //set movement keys to arrow keys
    const keys = scene.input.keyboard.addKeys({
      up: 'up',
      down: 'down',
      left: 'left',
      right: 'right',
    }); // keys.up, keys.down, keys.left, keys.right
    this.cursors = keys;

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
        this.socket.emit('playerMovement', {
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

      scene.userTextName.x = this.sprite.body.position.x;
      scene.userTextName.y = this.sprite.body.position.y;

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
    console.log(playerInfo);
    scene.joined = true;
    //the line below adds the sprite to the game map.
    scene.sprite = scene.physics.add
      .sprite(playerInfo.x, playerInfo.y, playerInfo.avatar)
      .setScale(0.7)
      .setVisible(true)
      .setCollideWorldBounds(true);

    // console.log("I should have added text");
    scene.sprite.playerId = playerInfo.playerId;
    scene.sprite.playerName = scene.userTextName;
  }
  addOtherPlayers(scene, playerInfo) {
    const otherPlayer = scene.physics.add
      .sprite(playerInfo.x + 40, playerInfo.y + 40, playerInfo.avatar)
      .setScale(0.7)
      .setVisible(true)
      .setCollideWorldBounds(true);
    otherPlayer.playerId = playerInfo.playerId;
    otherPlayer.playerName = this.add.text(400, 300, playerInfo.playerName);
    otherPlayer.playerName.x = otherPlayer.body.position.x;
    otherPlayer.playerName.y = otherPlayer.body.position.y;
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
        // this.joinVideoCall(this, otherPlayer);
        this.showJoinButton(this, otherPlayer);
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
    //check if nearyby players using length
    //if no neighbors, can't join a call
    if (!Object.keys(scene.nearbyPlayers).length) {
      scene.hideJoinButton();
    }
  }
  // Joining video call
  async joinVideoCall(scene, otherPlayer) {
    scene.inVideoCall = true;
    // Start our webcam and store the MediaStream
    scene.userStream = await navigator.mediaDevices.getUserMedia(
      VIDEO_SETTINGS
    );
    scene.hideJoinButton();
    scene.showLeaveButton();
    //join a conference call with otherPlayer
    scene.socket.emit(
      'joinCall',
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
    const video = document.getElementById('myvideo');
    video.srcObject = null;
    // Disable webcam and remove MediaStream
    scene.userStream.getTracks().forEach((track) => track.stop());
    scene.userStream = null;
    //Stop peer videos
    const peerVideos = document.getElementById('peervideos');
    peerVideos.innerHTML = '';
    //tell the server to remove us from the call
    scene.socket.emit('leaveCall', scene.state.gameRoomName);
    // Allow ourselves to join new calls
    scene.inVideoCall = false;
    scene.hideLeaveButton();
  }
  showJoinButton(scene, otherPlayer) {
    joinBtnDiv.classList.remove('inactive');
    joinButton.disabled = false;
    joinButton.onclick = () => {
      scene.joinVideoCall(scene, otherPlayer);
    };
  }
  hideJoinButton() {
    joinBtnDiv.classList.add('inactive');
    joinButton.disabled = true;
    joinButton.onclick = undefined;
  }

  showLeaveButton() {
    leaveBtnDiv.classList.remove('inactive');
    leaveButton.disabled = false;
  }
  hideLeaveButton() {
    leaveBtnDiv.classList.add('inactive');
    leaveButton.disabled = true;
  }
  submitMemo(scene) {
    // If the message is non-empty, send it, else do nothing
    if (memoInput.value) {
      scene.socket.emit(
        'submitMemo',
        scene.state.gameRoomName,
        scene.userTextName.text || 'Anonymous',
        memoInput.value
      );
      memoInput.value = '';
    }
  }
}
