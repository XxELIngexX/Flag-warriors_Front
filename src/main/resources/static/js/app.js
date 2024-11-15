var app = (function () {
    var score = 0;
    var currentPlayer = null;



    return {
        createPlayer: function () {
            var nombre = document.getElementById("nombre").value;
            var player = { name: nombre, score: 0, flag: false};
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

        getPlayerId: function () {
            return this.playerId;
        }
    };
})();
