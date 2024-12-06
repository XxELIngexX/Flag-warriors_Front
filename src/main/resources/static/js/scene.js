class Game extends Phaser.Scene {
    constructor() {
        super("gameMap");
        this.apiUrl = "https://flagwarriorsbackend-fnhxgjb2beeqb6ct.northeurope-01.azurewebsites.net/api"
        this.cursors = null;
        this.playerId = null;
        this.bandera1 = null;
        this.bandera2 = null;
        this.poder = null;
        this.playersList = null;
        this.oponentes = [];
        this.sceneWs = null;
        this.col = null;
        this.contador = 0;
        this.baseA;
        this.baseB;
        this.connectToWebSocket();
    }
    

    async preload() {
        // Cargas básicas
        this.load.image("textura", "../map/Textures-16.png");
        this.load.tilemapTiledJSON("mapa", "../map/mapa.json");
        this.load.image("banderaAzul", "../images/banderaAzul.png");
        this.load.image("banderaNaranja", "../images/banderaNaranja.png");
        this.load.image("guepardex", "../images/guepardex.png");
       // Esperar que se carguen los recursos básicos
        await new Promise(resolve => this.load.once('complete', resolve));
        this.load.start();
    
        // Inicializar valores
        await this.initianValues();
    
        // Esperar que los jugadores se carguen
        await this.getPlayersList();
        
        // Cargar las texturas de los jugadores
        await this.loadPlayersTextures();
        this.load.start();
    }
        
    
    async getPlayersList() {
        
        return new Promise((resolve) => {
            apiclient.getAllPlayers((data) => {
                this.playersList = data;
                resolve();
            });
        });
    }

    async initializeGame() {
        await this.loadPlayersTextures();
        this.load.start();
        
    }
    async initianValues() {
        return new Promise((resolve) => {
            apiclient.getPlayerById(this.playerId, (data) => {
                this.currentPlayer = data;
                resolve();
            });
        });

    }


    async connectToWebSocket() {
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        const params = new URLSearchParams(url.search);
        const id = params.get('id');
        this.playerId = id;


        this.sceneWs = new WebSocket(`wss://flagwarriorswebsocket-g4deaxdrcybycffs.northeurope-01.azurewebsites.net?sessionId=${id}`)
        //this.sceneWs = new WebSocket(`ws:localhost:8081?sessionId=${id}`);
        
        this.sceneWs.onopen = async () => {
            this.sendStartGameMessage();
        };

        this.sceneWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'playerMoved':
                    console.log("el oponente se movio en conection");
                    break;
            }
        };
    }

    async create() {
        console.log("iniciando create");
        
        // Asegurarse de que currentPlayer esté disponible
        if (!this.currentPlayer) {
            console.log("Cargando current player...");
            await this.initianValues();
        }
    
        // Asegurarse de que la lista de jugadores esté disponible
        if (!this.playersList) {
            console.log("Cargando lista de jugadores...");
            await this.getPlayersList();
        }
        
        // Configuración básica
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Crear el mapa y elementos básicos primero
        this.createMap();
        this.createFlags();
    
        // Cargar texturas (ahora ya tenemos currentPlayer y playersList)
        console.log("Cargando texturas...");
        await this.loadPlayersTextures();
        
        // Esperar a que todas las texturas estén cargadas
        await new Promise(resolve => {
            if (this.load.isLoading) {
                this.load.once('complete', resolve);
            } else {
                resolve();
            }
        });
        
        // Renderizar jugadores después de que todo esté listo
        await this.renderPlayers();
    
        // Crear animaciones al final
        if (this.textures.exists('avatar')) {
            console.log("Creando animaciones con textura existente");
            this.createAnimations();
        } else {
            console.error("Error: Textura 'avatar' no encontrada después de cargar");
        }
    }
    
    createAnimations() {
        if (!this.textures.exists('avatar')) {
            console.error("Textura 'avatar' no encontrada");
            return;
        }
    
        console.log("Creando animaciones para avatar");
        try {
            this.anims.create({
                key: "caminar",
                frames: this.anims.generateFrameNumbers("avatar", { start: 1, end: 7 }),
                frameRate: 10,
                repeat: -1
            });
            
            this.anims.create({
                key: "quieto",
                frames: this.anims.generateFrameNumbers("avatar", { start: 0, end: 0 }),
                frameRate: 10,
                repeat: -1
            });
            console.log("Animaciones creadas exitosamente");
        } catch (error) {
            console.error("Error creando animaciones:", error);
        }
    }
    
    async loadPlayersTextures() {
        console.log("Cargando texturas de jugadores");
        
        if (!this.currentPlayer || !this.playersList) {
            console.error("No se pueden cargar texturas: faltan datos necesarios");
            return;
        }
    
        this.playersList.forEach(player => {
            if (player.id == this.currentPlayer.id) {
                console.log("Cargando textura de avatar:", player.path);
                this.load.spritesheet("avatar", player.path, { frameWidth: 128, frameHeight: 128 });
            } else {
                console.log("Cargando textura de oponente:", player.path);
                this.load.spritesheet(`opponentPlayer_${player.id}`, player.path, { frameWidth: 128, frameHeight: 128 });
            }
        });
    
        return new Promise((resolve) => {
            this.load.once('complete', () => {
                if (this.textures.exists('avatar')) {
                    console.log("Textura de avatar cargada exitosamente");
                    resolve();
                } else {
                    console.error("Error: La textura no se cargó correctamente");
                    resolve();
                }
            });
            this.load.start();
        });
    }
    createMap() {
        let map = this.make.tilemap({ key: "mapa" });
        let tileset = map.addTilesetImage("muros", "textura");
        let fondo = map.createLayer("pisosDelJuego", tileset);
        fondo.setScale(2.25);
        fondo.setCollisionByProperty({ colision: true });
        this.col = fondo;

    }
    createFlags(){
        this.bandera1 = this.physics.add.sprite(1280, 950, 'banderaAzul').setScale(0.3).setSize(100, 100);
        this.bandera2 = this.physics.add.sprite(180, 120, 'banderaNaranja').setScale(0.3).setSize(100, 100);

        this.baseA = this.physics.add.sprite(200, 180).setSize(80, 20);
        this.baseB = this.physics.add.sprite(1280, 900).setSize(80, 20);

        this.poder = this.physics.add.sprite(1000, 1000, 'guepardex').setScale(0.3).setSize(500, 500);
    }



    async sendStartGameMessage() {
        return new Promise((resolve, reject) => {
            if (this.sceneWs.readyState === WebSocket.OPEN) {
                const joinMessage = { type: 'startGame' };
                this.sceneWs.send(JSON.stringify(joinMessage));

                this.sceneWs.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    switch(data.type) {
                        case 'startGame':
                            this.playersList = data.playersList;


                            resolve(data);
                            break;

                        case 'playerMoved':
                            let oponentToUpdate = this.oponentes[data.id];
                            oponentToUpdate.setPosition(data.x, data.y);
                            break;

                        case 'flagCaptured':
                            if(data.team === "A") {
                                this.showGameMessage(`la bandera del equipo Naranja fue capturada por ${data.name}`);
                                this.bandera2.disableBody(true, true);
                            } else {
                                this.showGameMessage(`la bandera del equipo Azul fue capturada por ${data.name}`);
                                this.bandera1.disableBody(true, true);
                            }
                            break;

                        case 'powerCaptured':
                            this.showGameMessage(`${data.name} del equipo ${data.team === 'A' ? 'Naranja' : 'Azul'} ha recogido el poder!`);
                            
                            let powerScoreElement = data.team === "A" ? $('#equipoA') : $('#equipoB');
                            if (powerScoreElement) {
                                let currentScore = parseInt(powerScoreElement.text().match(/\d+/)) || 0;
                                currentScore += 1;
                                const teamText = data.team === "A" ? "Equipo Naranja" : "Equipo Azul";
                                powerScoreElement.text(`${teamText}: ${currentScore}`);
                                
                            }
                            
                            if (this.poder) {
                                this.poder.disableBody(true, true);
                            }

                            break;

                        case 'actualizarPuntos':
                            let puntajeElemento = null;
                            if (data.team === "A") {
                                puntajeElemento = $('#equipoA');
                            } else {
                                puntajeElemento = $('#equipoB');
                            }
                            
                            if (puntajeElemento) {
                                let puntajeActual = parseInt(puntajeElemento.text().match(/\d+/)) || 0;
                                puntajeActual += 1;
                                const equipoTexto = data.team === "A" ? "Equipo Naranja" : "Equipo Azul";
                                puntajeElemento.text(`${equipoTexto}: ${puntajeActual}`);
                                this.showGameMessage(`El ${equipoTexto} hizo un punto`);

                                if (puntajeActual >= 3) {
                                    this.showGameMessage(`¡${equipoTexto} ha ganado el juego!`);
                                    const finish = {
                                        type: 'finish'
                                    };
                                    this.sceneWs.send(JSON.stringify(finish));
                                } else {
                                    setTimeout(() => {
                                        // Si el equipo A anotó, solo reaparece la bandera azul (bandera1)
                                        if (data.team === "A") {
                                            // Desactilet cualquier bandera visible primero
                                            this.bandera1.disableBody(true, true);
                                            this.bandera2.disableBody(true, true);
                                            // Reaparecer solo la bandera azul
                                            this.bandera1.enableBody(false, 1280, 950, true, true);
                                            this.bandera1.setVisible(true);
                                        } else {
                                            // Si el equipo B anotó, solo reaparece la bandera naranja (bandera2)
                                            this.bandera1.disableBody(true, true);
                                            this.bandera2.disableBody(true, true);
                                            // Reaparecer solo la bandera naranja
                                            this.bandera2.enableBody(false, 180, 120, true, true);
                                            this.bandera2.setVisible(true);
                                        }
                                        
                                        // Resetear el estado de la bandera para el jugador actual
                                        if (this.currentPlayer.team === data.team) {
                                            this.currentPlayer.flag = false;
                                        }
                                    }, 3000);                    
                                }

                            }
                            break;

                        case 'finish':
                            window.location.href = '/final';
                            break;
                    }
                };
            } else {
                console.error("WebSocket no está abierto");
                reject("WebSocket no está abierto");
            }
        });
    }

    showGameMessage(message) {
        const messageBox = document.getElementById("game-message");
        messageBox.innerHTML = "";
        const messageText = document.createElement("p");
        messageText.className = "text";
        messageText.textContent = message;
        messageBox.appendChild(messageText);
        messageBox.style.display = "block";
        messageBox.style.opacity = "1";
        
        setTimeout(() => {
            messageBox.style.opacity = "0";
            setTimeout(() => {
                messageBox.style.display = "none";
            }, 500);
        }, 5000);
    }

    update() {
        if (this.avatar) {
            if (this.cursors.right.isDown) {
                this.avatar.setVelocityX(150);
                this.avatar.anims.play("caminar", true);
                this.avatar.flipX = false;
                this.contador++;
            } 
            else if (this.cursors.left.isDown) {
                this.avatar.setVelocityX(-150);
                this.avatar.anims.play("caminar", true);
                this.avatar.flipX = true;
                this.contador++;
            } else if (this.cursors.up.isDown) {
                this.avatar.setVelocityY(-150);
                this.avatar.anims.play("caminar", true);
                this.contador++;
            } else if (this.cursors.down.isDown) {
                this.avatar.setVelocityY(150);
                this.avatar.anims.play("caminar", true);
                this.contador++;
            } else {
                this.avatar.setVelocityX(0);
                this.avatar.setVelocityY(0);
                this.avatar.anims.play("quieto", true);
            }
        }
        if (this.contador == 5) {
            this.contador = 0;
            this.sendMovementData();
        }
    }

    sendMovementData() {
        const movementData = {
            type: 'updatePosition',
            id: this.currentPlayer.id,
            x: this.avatar.x,
            y: this.avatar.y
        };
        this.sceneWs.send(JSON.stringify(movementData));
    }

    collectFlag(player, flag) {
        // Validaciones para la captura
        if (this.currentPlayer.flag) {
            return;
        }
    
        const isTeamA = this.currentPlayer.team === "A";
        const isCorrectFlag = (isTeamA && flag === this.bandera1) || (!isTeamA && flag === this.bandera2);
        
        if (!isCorrectFlag) {
            return;
        }
    
        // Captura de la bandera
        this.currentPlayer.flag = true;
        flag.disableBody(true, true);
    
        // Mensaje al servidor
        const flagCaptureMessage = {
            type: 'flagCaptured',
            playerId: this.currentPlayer.id,
            team: this.currentPlayer.team,
        };
        this.sceneWs.send(JSON.stringify(flagCaptureMessage));
        app.captureFlag(this.playerId, function(response) {
            if (response) {
                console.log("Respuesta del servidor:", response);
            } else {
                console.error("No se recibió respuesta del servidor.");
            }
        });
    }
  



    collectPower(player, poder) {
        if (poder.active) {
            poder.disableBody(true, true);
            
            const powerCaptureMessage = {
                type: 'powerCaptured',
                playerId: this.currentPlayer.id,
                team: this.currentPlayer.team,
            };
            
            this.sceneWs.send(JSON.stringify(powerCaptureMessage));
            
            app.capturePower(this.playerId, function(response) {
                if (response) {
                    console.log("Respuesta del servidor:", response);
                } else {
                    console.error("No se recibió respuesta del servidor.");
                }
            });
        }
    }

    actualizarPuntuaciones() {
        if(this.currentPlayer.flag) {
            const actualizarPuntos = {
                type: 'actualizarPuntos'
            };
            this.sceneWs.send(JSON.stringify(actualizarPuntos));
    
            this.currentPlayer.flag = false;

            // Reaparecer la bandera según el equipo
            if (this.currentPlayer.path == "../images/playerA.png") {
                setTimeout(() => {
                    this.bandera2.enableBody(false, 180, 120, true, true);
                }, 3000);
            } else {
                setTimeout(() => {
                    this.bandera1.enableBody(false, 1280, 950, true, true);
                }, 3000);
            }
        }
    }
    

    async renderPlayers() {
        // Asegurar que tenemos la lista de jugadores
        if (!this.playersList) {
            await new Promise((resolve) => {
                apiclient.getAllPlayers((data) => {
                    this.playersList = data;
                    resolve();
                });
            });
        }
    
        // Una vez que tenemos la lista, procedemos con el renderizado
        this.playersList.forEach(player => {
            if(player.id == this.currentPlayer.id) {
                this.avatar = this.physics.add.sprite(this.currentPlayer.x, this.currentPlayer.y, "avatar");
                this.avatar.setScale(1);
                this.avatar.setCollideWorldBounds(true);
                this.avatar.setSize(30, 80);
                this.avatar.setOffset(50, 47);
    
                this.renderPlayer(player);
                this.physics.add.collider(this.avatar, this.col);

                if (this.currentPlayer.path == "../images/playerA.png") {
                    this.physics.add.overlap(this.avatar, this.bandera1, (player, flag) => this.collectFlag(player, flag), null, this);
                    this.physics.add.overlap(this.avatar, this.baseA, () => this.actualizarPuntuaciones(), null, this);
                    this.physics.add.overlap(this.avatar, this.poder, (player, poder) => this.collectPower(player, poder), null, this);
                } else {
                    this.physics.add.overlap(this.avatar, this.bandera2, (player, flag) => this.collectFlag(player, flag), null, this);
                    this.physics.add.overlap(this.avatar, this.baseB, () => this.actualizarPuntuaciones(), null, this);
                    this.physics.add.overlap(this.avatar, this.poder, (player, poder) => this.collectPower(player, poder), null, this);
                }
            } else {
                let oponent = this.physics.add.sprite(player.x, player.y, `opponentPlayer_${player.id}`);
                oponent.setScale(1);
                oponent.setCollideWorldBounds(true);
                oponent.setSize(30, 80);
                oponent.setOffset(46, 47);
                this.oponentes[player.id] = oponent;
                this.renderPlayer(player);
            }
        });
    }

    renderPlayer(player) {
        console.log(`Renderizando jugador ${player.id}`);
        console.log(player.path);
    }
}