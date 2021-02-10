# Code Review II

## Retro

#### Roses
* Mob Coding facilitates good learning (Navya + Gracie + LB)
* Getting Phaser to work (Carly)
* WebRTC lightbulbs (Gracie)
* Sockets have a cool rhythm (LB)

#### Thorns
* Working w/ new tech (WebRTC, Phaser, WebSockets), React + Phaser incompatability (Navya)
* Styling WebRTC was painful, tying in Phaser + Vanilla DOM (Carly)
* Debugging, some breaking Phaser Syntax (overlapping vs intersecting) (Gracie)
* WebSockets + WebRTC incompatability (Gracie) 
* Merge conflicts -- bundle.js was un-ignored (LB)
* WebRTC is tricky, flow-dependent (LB) 

## MVP

* Let's prioritize deploying video conferencing feature
* Chat looks promising, in general let's delay deploying features until they are completed

* Learning Moment re: CD
* Functional Programming -- state management
    * Everything is a function? `const two = () => 2`
    * More like: `f(x) = mx + b`
    * Elevating our code to be like pure, mathematical functions

* Some FP Virtues
    * Pure functions
    * Immutability
        * not changing values, writing new ones
        * const > let
        * Spread, Rest operators
        * map, filter, reduce
    * Avoid side effects
    * Smells like... Redux!

```javascript

 // Horizontal movement - MainScene.js
if (this.cursors.left.isDown) {
    this.sprite.body.setVelocityX(-speed);
} else if (this.cursors.right.isDown) {
    this.sprite.body.setVelocityX(speed);
}

// FP approach
// Readable, immutable (for time-travel debugging), avoids Race Condition
const move = (direction, sprite, speed) => {
    const newSprite = {...this.sprite};
    if(direction === down) {
        newSprint.setVelocityX(-speed)
    } else {
        newSprint.setVelocityX(speed)
    }
}

// Current Players game.js
const currentPlayers = (scene, arg) => {
  const { players, numPlayers } = arg;
  scene.state.numPlayers = numPlayers;
  Object.keys(players).forEach(function (id) {
    if (players[id].playerId === scene.socket.id) {
      scene.addPlayer(scene, players[id]);
    } else {
      scene.addOtherPlayers(scene, players[id]);
    }
  });
};

// could we replace forEach w/ a list comprehension (map, filter?)

const currentPlayers = (scene, arg) => {
    const {numPlayers, players} = arg;
    const newScene = {...scene }
    return Object.keys(players) // get arr of players from players object
            .map((idx, player) => newScene.addPlayer(player)) // map onto new scene
            .filter((player, idx) => player.id === scene.socket.id) // filter by curr socket
}

```

* Btw let's be mindful of avoiding console.logs on the main branch

 
## Product Roadmap


* More FP state management
* Bundle-related merge conflicts
* Audit WebRTC Code