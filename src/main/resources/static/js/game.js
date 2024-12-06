let avatar;
const gameScene = new Game();
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1440,
        height: 1080,
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [gameScene]
};

let game; // Variable global para mantener referencia
gameScene.init().then(() => {
    game = new Phaser.Game(config);
});