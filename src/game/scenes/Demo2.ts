import { Scene } from 'phaser';

const COLORS = {
    buttonText: '#ffffff',
    buttonBg: '#2d2d2d',
    buttonHoverBg: '#555555',
};

export class Demo2 extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    //background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    debug_text : Phaser.GameObjects.Text;
    exit_text: Phaser.GameObjects.Text;
    map: Phaser.Tilemaps.Tilemap;
    layer: Phaser.Tilemaps.TilemapLayer | null;
    buttons: Phaser.GameObjects.Text[] = [];
    private player!: Phaser.Physics.Arcade.Sprite;
    private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
    private playerCollider!: Phaser.Physics.Arcade.Collider;
    private gameOverText!: Phaser.GameObjects.Text;
    private lastPointerX: number = 0;
    private lastPointerY: number = 0;
    private gameHasEnded: boolean = false;
    private playerIsFaling: boolean = false;
    private playerIsDead: boolean = false;
    private playerFallSpeed: number =0;

    constructor ()
    {
        super('Demo2');
    }

    preload()
    {
        // Load the sprite sheet for the player (https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator)
        this.load.spritesheet('player-walk', 'assets/male-basic-none-walk.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('player-jump', 'assets/player-jump.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('player-death', 'assets/player-death.png',{ frameWidth: 64, frameHeight: 64 });
        
    }

    create ()
    {
        this.camera = this.cameras.main;
        //this.camera.setBackgroundColor(0x00ff00);
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Reset state
        this.gameHasEnded = false;
        this.playerIsFaling = false;
        this.playerIsDead = false;
        this.playerFallSpeed = 0;

        // Create tilemap
        this.map = this.make.tilemap({ width: 100, height: 100, tileWidth: 64, tileHeight: 64 });
        const tileset = this.map.addTilesetImage('tilemap9', 'tilemap9', 64, 64, 0, 0);
        if (!tileset) {
            console.error('Failed to load tileset');
            return;
        }
        this.layer = this.map.createBlankLayer('layer1', tileset);
        if (!this.layer) {
            console.error('Failed to create layer');
            return;
        }

        // Place the first  tiles around the player starting position
        this.layer.putTileAt(1, 7, 5);
        this.layer.putTileAt(1, 7, 6);
        this.layer.putTileAt(1, 7, 7);
        this.layer.putTileAt(1, 8, 5);
        this.layer.putTileAt(1, 8, 6);
        this.layer.putTileAt(1, 8, 7);
        this.layer.putTileAt(1, 9, 5);
        this.layer.putTileAt(1, 9, 6);
        this.layer.putTileAt(1, 9, 7);

        // Add click to place tiles
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Check if clicked on any UI element
            this.lastPointerX = pointer.x;
            this.lastPointerY = pointer.y;
            if (this.exit_text.getBounds().contains(pointer.x, pointer.y) ||
                this.buttons.some(btn => btn.getBounds().contains(pointer.x, pointer.y))) {
                return;
            }
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const tileX = this.map.worldToTileX(worldPoint.x);
            const tileY = this.map.worldToTileY(worldPoint.y);
            if (tileX !== null && tileY !== null) {
                // Expand map if necessary
                let expanded = false;
                if (tileX >= this.map.width) {
                    this.map.width = tileX + 1;
                    expanded = true;
                }
                if (tileY >= this.map.height) {
                    this.map.height = tileY + 1;
                    expanded = true;
                }
                if (expanded) {
                    this.layer!.setSize(this.map.width, this.map.height);
                }

                const existingTile = this.layer!.getTileAt(tileX, tileY);
                if (!existingTile || existingTile.index === -1) {
                    const tileIndex = Phaser.Math.Between(0, 8);
                    this.layer!.putTileAt(tileIndex, tileX, tileY);
                }
            }
        });

        this.msg_text = this.add.text(0, 0, 'Demo 2', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.msg_text.setOrigin(0);
        this.msg_text.setScrollFactor(0);

        this.debug_text = this.add.text(0, centerY*2-150, 'Debug Info', {
            fontFamily: 'Arial', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 2,
            align: 'left'
        });
        this.debug_text.setOrigin(0);
        this.debug_text.setScrollFactor(0);

        // Create basic directional walk animations (8 frames per row)
        // Sprite sheet layout: row 0 = up, row 1 = left, row 2 = down, row 3 = right
        //male-armor-sword-walk
        this.anims.create({
            key: 'player-walk-up',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'player-walk-left',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'player-walk-down',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 26, end: 33 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'player-walk-right',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: -1
        });
        // Jump animation
        this.anims.create({
            key: 'player-jump',
            frames: this.anims.generateFrameNumbers('player-death', { start: 3, end: 5 }),
            frameRate: 20,
            repeat: -1
        });
        // Death animation
        this.anims.create({
            key: 'player-death',
            frames: this.anims.generateFrameNumbers('player-death', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        // Idle = first frame of each direction
        this.anims.create({ key: 'player-idle-up',  frames: [{ key: 'player-walk', frame: 0 }],  frameRate: 10 });
        this.anims.create({ key: 'player-idle-left',  frames: [{ key: 'player-walk', frame: 13 }],  frameRate: 10 });
        this.anims.create({ key: 'player-idle-down', frames: [{ key: 'player-walk', frame: 26 }],  frameRate: 10 });
        this.anims.create({ key: 'player-idle-right',    frames: [{ key: 'player-walk', frame: 39 }], frameRate: 10 });
        
        this.player = this.physics.add.sprite(centerX, centerY, 'player-walk', 0);
        //this.player.setCollideWorldBounds(true);
        this.player.anims.play('player-idle-down');

        // Enable collision with tiles
        //this.layer.setCollisionByExclusion([-1]);
        this.playerCollider = this.physics.add.collider(this.player, this.layer);

        // Game Over text
        this.gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ff0000',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setScrollFactor(0);
        this.gameOverText.setVisible(false);

        // Make camera follow the player
        this.camera.startFollow(this.player, true, 0.1, 0.1);

        // Input (arrows + WASD)
        this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as any;

        // Helper function to create a nice button
        const createButton = (y: number, x: number, text: string, callback: () => void) => {
            const button = this.add.text(centerX + 220 + x*150, 50 +  y*60, text, {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: COLORS.buttonText,
                backgroundColor: COLORS.buttonBg,
                align: 'center',
                fixedWidth: 100
            })
                .setPadding(5)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            // Hover effects
            button.on('pointerover', () => button.setBackgroundColor(COLORS.buttonHoverBg));
            button.on('pointerout', () => button.setBackgroundColor(COLORS.buttonBg));

            // Click action
            button.on('pointerdown', () => {
                button.setScale(0.95); // press feedback
                callback();
                // Reset scale after click
                this.time.delayedCall(100, () => button.setScale(1));
            });

            this.buttons.push(button);
            button.setScrollFactor(0);
            return button;
        };

        createButton(0 ,0, 'Save', () => {

            const tiles = this.layer!.getTilesWithin(0, 0, this.map.width, this.map.height).filter(tile => tile.index !== -1);

            const data = tiles.map(tile => ({ x: tile.x, y: tile.y, index: tile.index }));

            const saveData = {
                width: this.map.width,
                height: this.map.height,
                tiles: data
            };

            localStorage.setItem('demo2_tiles', JSON.stringify(saveData));

        });
        createButton(0 ,1, 'Load', () => {

            const saveData = JSON.parse(localStorage.getItem('demo2_tiles') || '{}');

            if (!saveData.tiles) return; // No data

            // Expand map to at least the saved size
            if (saveData.width > this.map.width || saveData.height > this.map.height) {
                this.map.width = Math.max(this.map.width, saveData.width);
                this.map.height = Math.max(this.map.height, saveData.height);
                this.layer!.setSize(this.map.width, this.map.height);
            }

            // Also check if any tile is beyond current size (though shouldn't happen)
            let maxX = saveData.width - 1;
            let maxY = saveData.height - 1;
            saveData.tiles.forEach((tileData: {x: number, y: number, index: number}) => {
                if (tileData.x > maxX) maxX = tileData.x;
                if (tileData.y > maxY) maxY = tileData.y;
            });

            if (maxX >= this.map.width || maxY >= this.map.height) {
                this.map.width = Math.max(this.map.width, maxX + 1);
                this.map.height = Math.max(this.map.height, maxY + 1);
                this.layer!.setSize(this.map.width, this.map.height);
            }

            this.layer!.fill(-1);

            saveData.tiles.forEach((tileData: {x: number, y: number, index: number}) => {

                this.layer!.putTileAt(tileData.index, tileData.x, tileData.y);

            });

        });
        createButton(0,-1 ,'Restart', () => {
            this.scene.restart();
        });
        
        this.exit_text = this.add.text(900, 700, 'Exit', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.exit_text.setOrigin(0);
        this.exit_text.setScrollFactor(0);
        this.exit_text.setInteractive({ useHandCursor: true });
        this.exit_text.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }

    update()
    {
        const speed = 150;
        let vx = 0;
        let vy = 0;

        if (this.gameHasEnded) {
            this.player.setVelocity(0, 0);
            return;
        }
        if(this.playerIsFaling){
            this.playerFallSpeed += 10;
            vy= this.playerFallSpeed;
            this.player.setVelocity(0, vy);
            //Test is player is fallen completely out of the screen
            if(this.player.y > this.cameras.main.height + this.player.height){
                this.gameHasEnded = true;
                this.playerIsFaling = false;
                this.playerFallSpeed = 0;
                this.gameOverText.setVisible(true);
                this.player.setVelocity(0, 0);
                this.player.anims.stop();
                this.player.setVisible(false);
            }
        }

        
        // === INPUT (checked every frame) ===
        if (this.wasd.A.isDown) vx = -speed;
        if (this.wasd.D.isDown) vx = speed;
        if (this.wasd.W.isDown) vy = -speed;
        if (this.wasd.S.isDown) vy = speed;

        // Check if player is on a tile
        const tileBelow = this.layer!.getTileAtWorldXY(this.player.x, this.player.y + this.player.height / 2);
        this.debug_text.setText(`Player Pos: (${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)})\n` +
            `Tile Below: ${tileBelow ? `(${tileBelow.x}, ${tileBelow.y}) idx:${tileBelow.index}` : 'None'}\n` +
            `Falling: ${this.playerIsFaling} Fall Speed: ${this.playerFallSpeed} GameEnded: ${this.gameHasEnded}\n` +
            `Vx: ${vx}, Vy: ${vy}\n` +            
            `last click x: ${this.lastPointerX}, y: ${this.lastPointerY}\n` +
            `Use WASD to move. Click to place tiles.`
        );
        if(!this.playerIsFaling && !this.playerIsDead)
        {
            if (tileBelow && tileBelow.index !== -1) {
                this.playerIsFaling = false;
                this.player.setVelocity(vx, vy);
            } else {
                this.playerIsFaling = true;
                this.player.setVelocity(vx/2, vy -100); // fall down
            }
        }

        // If just started falling, disable collision and show Game Over after delay
        if (this.playerIsFaling && !this.gameHasEnded && !this.playerIsDead) {
            this.playerCollider.destroy();
            this.player.setCollideWorldBounds(false);
            this.camera.stopFollow();
            this.time.delayedCall(3000, () => {
                this.gameOverText.setVisible(true);
                this.player.setVelocity(0, 0);
                this.player.anims.stop();
                this.player.setVisible(false);
            });
            this.playerIsDead = true;
        }
        
        // Animation
        if (this.playerIsFaling) {
            this.player.anims.play('player-jump', true);
        } else {
            // Moving → decide which direction to animate
            let newDir: 'up' | 'down' | 'left' | 'right';

            if (Math.abs(vx) > Math.abs(vy)) {
                newDir = vx < 0 ? 'left' : 'right';   // horizontal wins
            } else {
                newDir = vy < 0 ? 'up' : 'down';      // vertical wins
            }

            if (vx === 0 && vy === 0) {
                this.player.anims.play(`player-idle-${newDir}`, true);
            } else {
                this.player.anims.play(`player-walk-${newDir}`, true);
            }
        }
    }
}
