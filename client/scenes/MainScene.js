import "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.state = {};
  }
  preload() {
    this.load.image("officePlan", "assets/backgrounds/officePlan.png");
    this.load.image("banner", "assets/backgrounds/banner.png");
  }
  create() {
    const scene = this;

    //background
    this.add.image(400, 300, "officePlan");
    const banner = this.add.image(400, 50, "banner");

    banner.setScale(0.4);
    //
    // this.socket = io();
  }
  update() {}
}
