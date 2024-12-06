let app = (function () {
    let score = 0;
    let currentPlayer = null;



    return {
        createPlayer: function () {
            let nombre = document.getElementById("nombre").value;
            let player = { name: nombre, score: 0, flag: false};
            apiclient.createPlayer(player, function (createdPlayer) {       
                currentPlayer = createdPlayer;
                console.log("Jugador creado y guardado:", currentPlayer.name, currentPlayer.id);
        
                // Ahora puedes usar el jugador con su ID como referencia
                apiclient.getAllPlayers(function(players) {
                    if (players.length > 8) { 
                        window.location.href = "/error"; 
                    } else {
                        window.location.href = `/lobby?id=${createdPlayer.id}`; 
                    }
                });
            });
        },

        captureFlag: function(id,callback){
            
            apiclient.captureFlag(id,callback);

        },
        

        capturePower: function(id,callback){
            apiclient.capturePower(id,callback);
        },

        getPlayerId: function () {
            return this.playerId;
        }
    };
})();
