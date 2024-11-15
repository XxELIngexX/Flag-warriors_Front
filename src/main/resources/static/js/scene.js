
class game extends Phaser.Scene {
    
    constructor() {
        super("gameMap");
        this.cursors = null;
        this.playerId = null;
        this.bandera1 = null;
        this.bandera2 = null;
        this.playersList = null
        this.oponentes =[];
        this.sceneWs=null;
        this.col=null;
        this.contador = 0;
        this.baseA;
        this.baseB
        this.connectToWebSocket()
        
    }
    
    preload() {

        this.load.image("textura", "../map/Textures-16.png");
        this.load.tilemapTiledJSON("mapa", "../map/mapa.json");
        this.load.image("banderaAzul", "../images/banderaAzul.png");
        this.load.image("banderaNaranja", "../images/banderaNaranja.png");

    }
     initializeGame() {
     

            this.loadPlayersTextures();  
            this.load.start(); // Cargar texturas de todos los jugadores
            this.load.on('complete', () => { // Espera a que todas las texturas terminen de cargarse
                this.renderPlayers(); 
               
            });
            this.load.start();  // Iniciar la carga

        
    }
    loadPlayersTextures() {
        this.playersList.forEach(player => {
            if (player.id == this.currentPlayer.id) {

                this.load.spritesheet("avatar", player.path, { frameWidth: 128, frameHeight: 128 });
                //this.avatar = this.physics.add.sprite(this.currentPlayer.x,this.currentPlayer.y,"avatar");

            } else {
                this.load.spritesheet(`opponentPlayer_${player.id}`, player.path, { frameWidth: 128, frameHeight: 128 });
                
            }
        });
    }

    initianValues(){
        this.playersList.forEach(player => {
            if (player.id == this.playerId) {
                this.currentPlayer=player;
            }
        });


        
    }
    async connectToWebSocket(){
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        const params = new URLSearchParams(url.search);
        const id = params.get('id');
        this.playerId = id;
  
        this.sceneWs =new WebSocket(`ws://localhost:8081?sessionId=${id}`)

        this.sceneWs.onopen = async () => {
            

                this.sendStartGameMessage()

        };
        this.sceneWs.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    
        
                    switch (data.type) {

                        case 'playerMoved':
                            console.log("el oponente se movio en conection")
                            break;
                        
                       
                    }
                };



        
    }
    actualizarPuntuaciones(flag){
        if(this.currentPlayer.flag == true){
            

            const actualizarPuntos = {
                type: 'actualizarPuntos',
                
            };
            this.sceneWs.send(JSON.stringify(actualizarPuntos));

            this.currentPlayer.flag = false;
            flag.disableBody(false, false);

            setTimeout(() => {
                
                const finish = {
                    type: 'finish',
                    
                };
                this.sceneWs.send(JSON.stringify(finish));
            }, 10000);

            
        }
        
        
    }

    

    create() {
  


        this.cursors = this.input.keyboard.createCursorKeys();

        // Animaciones
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

        // Mapa
        var map = this.make.tilemap({ key: "mapa" });
        var tileset = map.addTilesetImage("muros", "textura");

        var fondo = map.createLayer("pisosDelJuego", tileset);
        fondo.setScale(2.25);
        fondo.setCollisionByProperty({ colision: true });
        this.col = fondo

        


        


        // Banderas
        this.bandera1 = this.physics.add.sprite(1280, 950, 'banderaAzul').setScale(0.3).setSize(100, 100);
        this.bandera2 = this.physics.add.sprite(180, 120, 'banderaNaranja').setScale(0.3).setSize(100, 100);

        this.baseA = this.physics.add.sprite(200, 180).setSize(80, 20);
        this.baseB = this.physics.add.sprite(1280, 900).setSize(80, 20);

        // Configurar colisiones con el avatar del jugador
        // this.physics.add.collider(this.avatar, this.baseA);
        


        
    }

    

    async sendStartGameMessage(){
        return new Promise((resolve, reject) => {
            if (this.sceneWs.readyState === WebSocket.OPEN) {
                
                const joinMessage = { type: 'startGame' };
                this.sceneWs.send(JSON.stringify(joinMessage));

                this.sceneWs.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    switch(data.type){
                        case 'startGame':
                            this.playersList = data.playersList;
                        console.log(this.playersList)

                        this.initianValues()
                        this.initializeGame();

                        resolve(data);
                        break;

                        case 'playerMoved':
                            var oponentToUpdate = this.oponentes[data.id];
                            oponentToUpdate.setPosition(data.x, data.y);


                        break;
                        case 'flagCaptured':
                            if(data.team ==="A"){
                                this.showGameMessage(`la bandera del equipo Naranja fue capturada por ${data.name}`)

                                this.bandera2.disableBody(true,true)
                            }else{
                                this.showGameMessage(`la bandera del equipo Azul fue capturada por ${data.name}`)
                                this.bandera1.disableBody(true,true)
                            }
                            

                        break;
                        case 'actualizarPuntos':
                            let puntajeElemento = null;
    
                            // Selecciona el elemento de puntaje según el equipo
                            if (data.team === "A") {
                                puntajeElemento = $('#equipoA');
                            } else {
                                puntajeElemento = $('#equipoB');
                            }
                            
                            if (puntajeElemento) {
                                // Obtener el texto actual del puntaje y extraer el número
                                let puntajeActual = parseInt(puntajeElemento.text().match(/\d+/)) || 0;
                        
                                // Incrementar el puntaje
                                puntajeActual += 1;
                        
                                // Actualizar el texto en el elemento con el nuevo puntaje
                                const equipoTexto = data.team === "A" ? "Equipo Naranja" : "Equipo Azul";
                                puntajeElemento.text(`${equipoTexto}: ${puntajeActual}`);
                                this.showGameMessage(`El ${equipoTexto} hizo un punto`)

                            }    
                        break
                        case 'finish':
                            window.location.href = '/final';
                        

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
      
        // Limpia el contenido anterior
        messageBox.innerHTML = "";
      
        // Agrega el mensaje como un elemento <p>
        const messageText = document.createElement("p");
        messageText.className = "text";
        messageText.textContent = message;
        messageBox.appendChild(messageText);
      
        // Muestra el aviso
        messageBox.style.display = "block";
        messageBox.style.opacity = "1";
      
        // Oculta el aviso después de 5 segundos
        setTimeout(() => {
          messageBox.style.opacity = "0"; // Transición suave
          setTimeout(() => {
            messageBox.style.display = "none";
          }, 500); // Tiempo para la transición
        }, 5000);
      }


     update() {
    //     if (!this.cursors) return;
    
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
        if (this.contador == 5){
            
            this.contador=0
            this.sendMovementData()
        }





        
    }

    sendMovementData() {
        const movementData = {
            type: 'updatePosition',
            id: this.currentPlayer.id, // ID del jugador
            x : this.avatar.x,
            y : this.avatar.y
        };
        this.sceneWs.send(JSON.stringify(movementData));
    }

    collectFlag(player, flag){
        this.currentPlayer.flag = true;
        flag.disableBody(true, true);

            const flagCaptureMessage = {
                type: 'flagCaptured',
                playerId: this.currentPlayer.id,
                team: this.currentPlayer.team
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
    renderPlayers() {
        // Colisiones

        

        
         
        this.playersList.forEach(player => {

            if(player.id==this.currentPlayer.id){
                //this.load.spritesheet("avatar", player.path, { frameWidth: 128, frameHeight: 128 })
                this.avatar = this.physics.add.sprite(this.currentPlayer.x,this.currentPlayer.y,"avatar");

                this.avatar.setScale(1);
                this.avatar.setCollideWorldBounds(true);
                this.avatar.setSize(30, 80);
                this.avatar.setOffset(50, 47);

                this.renderPlayer(player);

                this.physics.add.collider(this.avatar, this.col);
                

                if (this.currentPlayer.path == "../images/playerA.png") {
                    this.physics.add.overlap(this.avatar, this.bandera1, (player, flag) => this.collectFlag(player, flag), null, this);
                    this.physics.add.overlap(this.avatar, this.baseA,(flag) => this.actualizarPuntuaciones(flag), null, this);
                } else {
                    this.physics.add.overlap(this.avatar, this.bandera2,(player, flag) => this.collectFlag(player, flag), null, this);
                    this.physics.add.overlap(this.avatar, this.baseB,(flag)=> this.actualizarPuntuaciones(flag), null, this);
                }

            }else{
                
                var oponent = this.physics.add.sprite(player.x,player.y,`opponentPlayer_${player.id}`)

                oponent.setScale(1);
                oponent.setCollideWorldBounds(true);
                oponent.setSize(30, 80);
                oponent.setOffset(46, 47);

                this.oponentes[player.id]=oponent;
                this.renderPlayer(player);
            }
            
        });
    }
    
    renderPlayer(player) {


        console.log(`Renderizando jugador ${player.id}`);
        console.log(player.path)
    }

}
    