import { Scene } from 'phaser';

interface TileCollisionObject {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface TileCollisionData {
    objectgroup?: {
        objects?: TileCollisionObject[];
    };
}

export class Demo2 extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    msg_text: Phaser.GameObjects.Text;
    debug_text: Phaser.GameObjects.Text;
    exit_text: Phaser.GameObjects.Text;
    map: Phaser.Tilemaps.Tilemap;
    layerGround: Phaser.Tilemaps.TilemapLayer | null;
    layerDecoration: Phaser.Tilemaps.TilemapLayer | null;
    layerObstacles: Phaser.Tilemaps.TilemapLayer | null;
    player!: Phaser.Physics.Arcade.Sprite;
    wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
    private obstacleBodies!: Phaser.Physics.Arcade.StaticGroup;
    private obstacleSprites: Phaser.GameObjects.Image[] = [];

    constructor() {
        super('Demo2');
    }

    preload() {
        this.load.spritesheet('player-walk', 'assets/player-walk-orig.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('tilemap9', 'assets/tilemap9.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('rocks', 'assets/rocks.png', { frameWidth: 64, frameHeight: 64 });

    }

    create() {
        this.camera = this.cameras.main;
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Create tilemap
        this.map = this.make.tilemap({ width: 10, height: 10, tileWidth: 64, tileHeight: 64 });
        const tileset = this.map.addTilesetImage('tilemap9', 'tilemap9', 64, 64, 0, 0);
        if (!tileset) {
            console.error('Failed to load tileset');
            return;
        }
        this.layerGround = this.map.createBlankLayer('layerGround', tileset);
        if (!this.layerGround) {
            console.error('Failed to create layer');
            return;
        }

        const debugGraphics = this.add.graphics().setAlpha(0.75);
        // We'll render debug visuals after we place tiles + set up collision.

        // Create rocks layer (decoration and obstacles)
        const rocksTileset = this.map.addTilesetImage('rocks', 'rocks', 64, 64, 0, 0);
        if (!rocksTileset) {
            console.error('Failed to load rocks tileset');
            return;
        }
        const rocksTileData = (rocksTileset.tileData || {}) as Record<number, TileCollisionData>;
        // Define custom rectangles for any tile index you want
        rocksTileData[0] = {  // another rock / tree trunk
            objectgroup: {
                objects: [{
                    x: 15,
                    y: 15,
                    width: 40,
                    height: 40
                }]
            }
        };
        rocksTileset.tileData = rocksTileData;


        this.layerDecoration = this.map.createBlankLayer('layerDecoration', rocksTileset);//7,12,18-19
        if (!this.layerDecoration) {
            console.error('Failed to create decoration layer');
            return;
        }
        this.layerObstacles = this.map.createBlankLayer('layerObstacles', rocksTileset,0,0);//0-6,8-11,13-17
        
        if (!this.layerObstacles) {
            console.error('Failed to create obstacles layer');
            return;
        }

        // Set base layer depths. Obstacle visuals will be rendered as sprites with y-based depth.
        this.layerGround.setDepth(0);
        this.layerDecoration.setDepth(1);
        this.layerObstacles.setVisible(false);

        this.msg_text = this.add.text(0, 0, 'Tile Layers', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.msg_text.setOrigin(0);
        this.msg_text.setScrollFactor(0);
        this.msg_text.setDepth(10000); // Ensure it renders above everything else

        this.debug_text = this.add.text(0, centerY * 2 - 150, 'Debug Info', {
            fontFamily: 'Arial', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 2,
            align: 'left'
        });
        this.debug_text.setOrigin(0);
        this.debug_text.setScrollFactor(0);
        this.debug_text.setDepth(10000); // Ensure it renders above everything else

        this.exit_text = this.add.text(900, 700, 'Exit', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.exit_text.setOrigin(0);
        this.exit_text.setInteractive({ useHandCursor: true });
        this.exit_text.setDepth(10000); // Ensure it renders above everything else
        this.exit_text.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        //Set up animations for the player
        this.anims.create({ key: 'player-walk-up', frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'player-walk-left', frames: this.anims.generateFrameNumbers('player-walk', { start: 13, end: 20 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'player-walk-down', frames: this.anims.generateFrameNumbers('player-walk', { start: 26, end: 33 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'player-walk-right', frames: this.anims.generateFrameNumbers('player-walk', { start: 39, end: 46 }), frameRate: 14, repeat: -1 });
        this.anims.create({ key: 'player-idle-up', frames: [{ key: 'player-walk', frame: 0 }], frameRate: 10 });
        this.anims.create({ key: 'player-idle-left', frames: [{ key: 'player-walk', frame: 13 }], frameRate: 10 });
        this.anims.create({ key: 'player-idle-down', frames: [{ key: 'player-walk', frame: 26 }], frameRate: 10 });
        this.anims.create({ key: 'player-idle-right', frames: [{ key: 'player-walk', frame: 39 }], frameRate: 10 });

        this.player = this.physics.add.sprite(centerX, centerY, 'player-walk', 0);

        //this.player.setCollideWorldBounds(true);
        this.player.anims.play('player-idle-down');

        
        // Input (Q + WASD)
        this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as any;

        // Place tiles programmatically (for testing)
        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                this.placeTile(x, y);

            }
        }

        this.createObstacleSprites();
        
        this.createObstacleBodiesFromTileData(rocksTileset, debugGraphics);

        // Enable collision with generated per-object hitboxes
        this.physics.add.collider(this.player, this.obstacleBodies);

        // Enable Arcade Physics debug rendering for the player body.
        // Note: Phaser.Sprite does not have `renderDebug`; the debug visuals come from Arcade Physics.
        this.physics.world.createDebugGraphic();
        this.physics.world.drawDebug = false;
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setSize(body.width * 0.5, body.height * 0.7, true);
        body.setOffset(body.offset.x, body.offset.y + 10);
        this.player.setDepth(body.bottom);
        body.debugBodyColor = 0xff0000;
        body.debugShowBody = true;

    }

    private createObstacleBodiesFromTileData(tileset: Phaser.Tilemaps.Tileset, debugGraphics: Phaser.GameObjects.Graphics): void {
        if (!this.layerObstacles) {
            return;
        }

        this.obstacleBodies = this.physics.add.staticGroup();
        debugGraphics.clear();
        debugGraphics.lineStyle(2, 0xf38630, 1);

        const tileData = (tileset.tileData || {}) as Record<number, TileCollisionData>;
        const obstacleTiles = this.layerObstacles.filterTiles((tile: Phaser.Tilemaps.Tile) => tile.index !== -1);

        obstacleTiles.forEach((tile) => {
            const localIndex = tile.index - tileset.firstgid;
            const collisionData = tileData[tile.index] || tileData[localIndex];
            const objects = collisionData?.objectgroup?.objects;

            if (!objects || objects.length === 0) {
                return;
            }

            objects.forEach((obj) => {
                if (obj.width <= 0 || obj.height <= 0) {
                    return;
                }

                const worldX = this.layerObstacles!.x + tile.pixelX + obj.x + obj.width / 2;
                const worldY = this.layerObstacles!.y + tile.pixelY + obj.y + obj.height / 2;

                const zone = this.add.zone(worldX, worldY, obj.width, obj.height);
                this.physics.add.existing(zone, true);
                this.obstacleBodies.add(zone);

                debugGraphics.strokeRect(worldX - obj.width / 2, worldY - obj.height / 2, obj.width, obj.height);
            });
        });
    }

    private createObstacleSprites(): void {
        if (!this.layerObstacles) {
            return;
        }

        this.obstacleSprites.forEach((sprite) => sprite.destroy());
        this.obstacleSprites = [];

        const obstacleTiles = this.layerObstacles.filterTiles((tile: Phaser.Tilemaps.Tile) => tile.index !== -1);

        obstacleTiles.forEach((tile) => {
            const worldX = this.layerObstacles!.x + tile.pixelX;
            const worldY = this.layerObstacles!.y + tile.pixelY;
            const sprite = this.add.image(worldX, worldY, 'rocks', tile.index).setOrigin(0, 0);
            sprite.setDepth(worldY + tile.height);
            this.obstacleSprites.push(sprite);
        });
    }

    public placeTile(x: number, y: number): void {
        const tileGroundIndex = Phaser.Math.Between(0, 8);
        const tileDecorationIndex = Phaser.Math.Between(0, 10);
        const tileObstacleIndex = Phaser.Math.Between(0, 10);


        this.layerGround!.putTileAt(tileGroundIndex, x, y);
        if (tileDecorationIndex === 0) this.layerDecoration!.putTileAt(7, x, y);
        else if (tileDecorationIndex === 1) this.layerDecoration!.putTileAt(12, x, y);
        else if (tileDecorationIndex === 2) this.layerDecoration!.putTileAt(18, x, y);
        else if (tileDecorationIndex === 3) this.layerDecoration!.putTileAt(19, x, y);
        if(tileObstacleIndex===0){
            this.layerObstacles!.putTileAt(0, x, y);
        }



    }

    update() {

        //Player movement with WASD and animations
        this.player.setVelocity(0, 0);
        if (this.wasd.A.isDown) this.player.setVelocityX(-100);
        if (this.wasd.D.isDown) this.player.setVelocityX(100);
        if (this.wasd.W.isDown) this.player.setVelocityY(-100);
        if (this.wasd.S.isDown) this.player.setVelocityY(100);
        this.player.body!.velocity.normalize().scale(200);
        if (this.wasd.A.isDown) this.player.anims.play("player-walk-left", true);
        else if (this.wasd.D.isDown) this.player.anims.play("player-walk-right", true);
        else if (this.wasd.W.isDown) this.player.anims.play("player-walk-up", true);
        else if (this.wasd.S.isDown) this.player.anims.play("player-walk-down", true);
        else this.player.anims.stop();

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        this.player.setDepth(body.bottom);
    }
}
