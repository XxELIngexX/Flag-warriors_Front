var apiclient = (function () {
    var apiUrl = "http://flagwarriorsbackend-fnhxgjb2beeqb6ct.northeurope-01.azurewebsites.net/api";
    //var apiUrl = "http://localhost:8080/api";

    return {

        createPlayer: function (player, callback) { 
            $.ajax({
                url: `${apiUrl}/players`,
                method: "POST",
                data: JSON.stringify(player),
                contentType: "application/json",
                success: function (response) { 
                    callback(response); // Pasa el jugador creado con el ID al callback
                },
                error: function (error) {
                    console.error("Error al crear el jugador:", error);
                }
            });
        },

        getAllPlayers: function (callback) {
            $.ajax({
                url: `${apiUrl}/players`, // URL de la API
                method: "GET", // Método HTTP
                headers:{
                    "Access-Control-Allow-Origin":"*/*",
                    "Origin": "http://localhost:3000"
                },
                success: function (data) { // Callback en caso de éxito
                    callback(data);
                },
                error: function (error) { // Manejo de errores
                    console.error("Error al obtener jugadores:", error);
                }
            });
        },
    

        createTeams: function (name,imagenPath,callback) {
            const teamData = {
                name: name,
                imagenPath: imagenPath
            };
            console.log(teamData)
            
        
            $.ajax({
                url: `${apiUrl}/teams`,
                method: "POST",
                headers:{
                    "Access-Control-Allow-Origin":"*/*",
                    "Origin": "http://localhost:3000"
                },
                data: JSON.stringify(teamData), // Envía el objeto como JSON
                contentType: "application/json",
                
                error: function (error) {
                    console.error("Error al crear el equipo:", error);
                }
            });
        },
        getTeamByName: function (name, callback) {
            $.ajax({
                url: `${apiUrl}/teams/name/${name}`,
                method: "GET",
                headers:{
                    "Access-Control-Allow-Origin":"*/*",
                    "Origin": "http://localhost:3000"
                },
                success:function(data){
                    callback(data);
                }, error: function (error) {
                    if (error.status === 404) {
                        callback(null); // Llama al callback con null si el equipo no existe
                    } else {
                        console.error("Error al obtener equipos:", error);
                    }
                }
              });
        },

        getTeamById: function(id, callback) {
            $.ajax({
                url: `${apiUrl}/teams/${id}`, // URL del endpoint
                method: "GET", // Método HTTP
                headers: {
                    "Access-Control-Allow-Origin": "*/*",
                    "Origin": "http://localhost:3000"
                },
                success: function (data) { // Callback en caso de éxito
                    if (callback) {
                        callback(data);
                    }
                },
                error: function (error) { // Manejo de errores
                    console.error("Error al obtener equipos:", error);
                }
            });
        },

        getPlayerById: function (id, callback) {
            $.ajax({
                url: `${apiUrl}/players/${id}`, // URL del endpoint
                method: "GET", // Método HTTP
                headers: {
                    "Access-Control-Allow-Origin": "*/*",
                    "Origin": "http://localhost:3000"
                },
                success: function (data) { // Callback en caso de éxito
                    if (callback) {
                        callback(data);
                    }
                },
                error: function (error) { // Manejo de errores
                    console.error("Error al obtener jugadores:", error);
                }
            });
        },

        captureFlag: function (playerId, callback) {
            $.ajax({
                url: `${apiUrl}/players/${playerId}/capture-flag`, 
                method: "POST",
                headers:{
                    "Access-Control-Allow-Origin":"*/*",
                    "Origin": "http://localhost:3000"
                },
                success: function (response) {
                    callback(response);
                },
                error: function (error) {
                    console.error("Error al capturar la bandera:", error);
                }
            });
        },

        capturePower: function (playerId, callback) {
            $.ajax({
                url: `${apiUrl}/players/${playerId}/capture-power`, 
                method: "POST",
                headers:{
                    "Access-Control-Allow-Origin":"*/*",
                    "Origin": "http://localhost:3000"
                },
                success: function (response) {
                    callback(response);
                },
                error: function (error) {
                    console.error("Error al capturar la bandera:", error);
                }
            });
        }
    };
    
})();

$(document).ready(function () {
    const currentPage = window.location.pathname;

    if (currentPage === '/') {

        apiclient.getTeamByName("EquipoA", function(teamA) {
            
                
            if (!teamA) { 
                apiclient.createTeams("EquipoA", "../images/playerA.png");
            }
        });
        
        apiclient.getTeamByName("EquipoB", function(teamB) {
            if (!teamB) { 
                apiclient.createTeams("EquipoB", "../images/playerB.png");
            }
        });
    }
});