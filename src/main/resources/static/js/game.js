
var avatar;

    const gameScene = new game();

    var config = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT, // escala automáticamente
            autoCenter: Phaser.Scale.CENTER_BOTH, // centra automáticamente
            width: 1440, 
            height: 1080, 
        },
        physics: {
            default: "arcade", // tipo de física
            arcade: {
                gravity: { y: 0 }, // la gravedad
                debug: false // para depurar
            }
        },
        scene: [gameScene]
    }
    var juego = new Phaser.Game(config);

    





const EquipoA = 1; // Define el nombre del equipo azul
const EquipoB = 2; // Define el nombre del equipo naranja

// Llama a esta función cuando necesites actualizar las puntuaciones
function actualizarPuntuaciones() {
    // Obtén las puntuaciones de los equipos usando el método de apiclient
    const puntuacionA = apiclient.getTeamById().getScore();
    const puntuacionB = apiclient.getTeamById().getScore();

    // Actualiza el contenido de los párrafos
    document.getElementById('equipoA').textContent = `Equipo Azul: ${puntuacionA}`;
    document.getElementById('equipoB').textContent = `Equipo Naranja: ${puntuacionB}`;
}
