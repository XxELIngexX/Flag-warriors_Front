const apiclient = (() => {

    const apiUrl = "https://flagwarriorsbackend-fnhxgjb2beeqb6ct.northeurope-01.azurewebsites.net/api";

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
    

        createTeams: function (name, imagenPath, callback) {
            const teamData = {
                name: name,
                imagenPath: imagenPath
            };
            
            fetch(`${apiUrl}/teams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                body: JSON.stringify(teamData)
            })
            .then(() => console.log('Petición enviada'))
            .catch(error => {
                console.error('Error:', error);
            });
        },
        getTeamByName: function (name, callback) {
            fetch(`${apiUrl}/teams/name/${name}`, {
                method: 'GET',
                
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if ( response.status === 404) {
                    apiclient.createTeams("EquipoA", "../images/playerA.png");
                    apiclient.createTeams("EquipoB", "../images/playerB.png");
                }
                return response.text();
            })
            .then(text => {
                try {
                    const data = text ? JSON.parse(text) : null;
                    callback(data);
                } catch (e) {
                    console.log('Error al procesar respuesta:', e);
                    callback(null);
                }
            })
            .catch(error => {
                console.error("Error al obtener equipos:", error);
                callback(null);
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
        let apiUrl = "https://flagwarriorsbackend-fnhxgjb2beeqb6ct.northeurope-01.azurewebsites.net/api";

        fetch(`${apiUrl}/teams`, {
            method: 'GET',
            mode: 'no-cors',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            return response.text(); // Primero obtenemos el texto
        })
        .then(text => {
            apiclient.getTeamByName("EquipoA", function(teamA) {    

        });
        

        })
        .catch(error => {
            console.error('Error en la petición:', error);
        });

        console.log("Petición enviada");
    }
});