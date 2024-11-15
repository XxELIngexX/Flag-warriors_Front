// MovementHandler.js

export default class MovementHandler {
    constructor(scene, player, cursors, websocket) {
        this.scene = scene;
        this.player = player;
        this.cursors = cursors;
        this.websocket = websocket;
    }

    updateMovement() {
        if (!this.cursors) return;

        if (this.cursors.right.isDown) {
            this.player.setVelocityX(150);
            this.player.anims.play("caminar", true);
            this.player.flipX = false;
            this.sendMovementData(150);
        } else if (this.cursors.left.isDown) {
            this.player.setVelocityX(-150);
            this.player.anims.play("caminar", true);
            this.player.flipX = true;
            this.sendMovementData(-150);
        } else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-150);
            this.player.anims.play("caminar", true);
            this.sendMovementData(-150);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(150);
            this.player.anims.play("caminar", true);
            this.sendMovementData(150);
        } else {
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
            this.player.anims.play("quieto", true);
        }
    }

    sendMovementData(data) {
        const movementData = {
            type: 'updatePosition',
            id: this.player.id,
            velocity: data
        };
        this.websocket.send(JSON.stringify(movementData));
    }
}
