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

gameScene.init().then(() => {
    new Phaser.Game(config);
});

const EquipoA = 1;
const EquipoB = 2;

function actualizarPuntuaciones() {
    const puntuacionA = apiclient.getTeamById().getScore();
    const puntuacionB = apiclient.getTeamById().getScore();
    document.getElementById('equipoA').textContent = `Equipo Azul: ${puntuacionA}`;
    document.getElementById('equipoB').textContent = `Equipo Naranja: ${puntuacionB}`;
}