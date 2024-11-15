
export var players = [];
export var lobbyWs = null; // WebSocket globalmente accesible
export var currentPlayer;

var lobby = (function () { 
    var currentPlayer = null;
    var countdownTimer = null;



    return {
      
        async connectToWebSocket() {
            await this.getPlayer();
            lobbyWs = new WebSocket(`ws://localhost:8081?sessionId=${currentPlayer.id}`)

            return new Promise((resolve, reject) => {
                lobbyWs.onopen = async () => {
                    //console.log('Conectado al servidor de WebSocket');
                    this.joinRoom('abc123'); 
                    this.renderPlayers();
                    resolve(); // Resuelve cuando la conexión esté lista
                };

                lobbyWs.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    // Procesa el mensaje del servidor según el tipo de evento recibido
                    switch (data.type) {
                        case 'newPlayer':
                            players = data.players; // Actualiza la lista global de jugadores
                            this.renderPlayers();
                            console.log("desde jugador nuevo:")
                            console.log(players)
                            break;
                        case 'countdown':
                            this.updateCountdown(data.countdown);
                            break;
                        case 'startToPlay':
                            this.goToGame()
                        break;

                    }
                };

                lobbyWs.onclose = () => {
                    console.log('Desconectado del servidor WebSocket');
                };

                lobbyWs.onerror = (error) => {
                    console.error('Error en WebSocket:', error);
                    reject(error); // Rechaza si hay un error
                };
            });
        },
        goToGame() {
            const currentUrl = window.location.href;
            const url = new URL(currentUrl);
            const params = new URLSearchParams(url.search);
            const id = params.get('id');
            window.location.href = `/game?id=${id}`;
        },
        updateCountdown(countdown) {
            $('#countdown-display').text(`Tiempo restante: ${countdown}`); // countdown ya viene en formato "mm:ss"
        },

        // Método para unirse a una sala
        joinRoom(roomCode) {
            if (!currentPlayer) {
                console.error("Jugador no encontrado.");
                return;
            }
            const joinMessage = {
                type: 'joinRoom', 
                code: roomCode, 
                playerId: currentPlayer.id,
                name: currentPlayer.name,
                path: currentPlayer.path,
                team: (currentPlayer.path).charAt((currentPlayer.path).indexOf("player")+6),
                teamScore:  currentPlayer.score,
                flag:currentPlayer.flag,
                x: currentPlayer.x,
                y: currentPlayer.y
            };
            
            
            lobbyWs.send(JSON.stringify(joinMessage));
        },

        // Obtener datos del jugador
        async getPlayer() {
            const currentUrl = window.location.href;
            const url = new URL(currentUrl);
            const params = new URLSearchParams(url.search);
            const id = params.get('id');

            if (!id) {
                console.error("ID no encontrado en la URL");
                return;
            }

            return new Promise((resolve, reject) => {
                apiclient.getPlayerById(id, (data) => {
                    currentPlayer = data;
                    resolve();
                });
            });
        },



        // Renderizar la lista de jugadores por equipo en el lobby
        renderPlayers() {
            const playersList = $('#players-list');
            
            playersList.empty();

            // Filtrar y renderizar jugadores por equipos
            const teamA = players.filter(player => player.team === 'A');
            const teamB = players.filter(player => player.team === 'B');
            playersList.append(`<div class="teamA"id="teamA"> <div class="banderaA" id="banderaA"></div> <div class="contenidoA" id="contenidoA"></div> <div class="personajeA" id="personajeA"></div>  </div> `)
            playersList.append(`<div class="teamB"id="teamB"> <div class="banderaB" id="banderaB"></div> <div class="contenidoB" id="contenidoB"></div> <div class="personajeB" id="personajeB"></div>  </div>`)

            const playersListA = $('#contenidoA');
            const playersListB = $('#contenidoB'); 

            const banderaA = $('#banderaA');
            const banderaB = $('#banderaB');

            banderaA.append(`<img class="imagenA"src="/images/banderaNaranja.png" alt="">`)
            banderaB.append(`<img class="imagenB"src="/images/banderaAzul.png" alt="">`)


            // Renderizar Equipo A
            playersListA.append(`<h3>Equipo A</h3>`);
            if (teamA.length > 0) {
                teamA.forEach(player => {
                    playersListA.append(`<tr><td>${player.name}</td></tr>`);
                });
            } else {
                playersListA.append('<p>No hay jugadores en el Equipo A</p>');
            }

            // Renderizar Equipo B
            playersListB.append(`<h3>Equipo B</h3>`);
            if (teamB.length > 0) {
                teamB.forEach(player => {
                    playersListB.append(`<tr><td>${player.name}</td></tr>`);
                });
            } else {
                playersListB.append('<p>No hay jugadores en el Equipo B</p>');
            }
        }
    };
})();

export { lobby }; // Exporta lobby para su uso en otros módulos

$(document).ready(function () {
    const currentPage = window.location.pathname;
    if (currentPage === '/lobby') {
        lobby.connectToWebSocket();  
    }
});


