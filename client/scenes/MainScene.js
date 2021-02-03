import "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.state = {};
  }
  preload() {
    this.load.image("officePlan", "assets/backgrounds/officePlan.png");
  }
  create() {
    const scene = this;

    //background
    this.add.image(400, 300, "officePlan").setOrigin(0);

    //
    // this.socket = io();
  }
  update() {}
}
