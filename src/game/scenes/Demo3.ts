import { Scene } from 'phaser';
import { createDemoAnimations } from './createDemoAnimations';

interface Chunk {
    map: Phaser.Tilemaps.Tilemap;
    layer: Phaser.Tilemaps.TilemapLayer;
}
interface SavedChunk {
    chunkX: number;
    chunkY: number;
    data: number[][];        // CHUNK_SIZE x CHUNK_SIZE tile indices
}
interface SaveData {
    timestamp: number;
    chunks: SavedChunk[];
}


export class Demo3 extends Scene {
    private chunks: Map<string, Chunk> = new Map();
    private readonly CHUNK_SIZE = 64;   // tiles per chunk
    private readonly TILE_SIZE = 64;    // pixels per tile
    camera: Phaser.Cameras.Scene2D.Camera;
    title_text: Phaser.GameObjects.Text;
    debug_text: Phaser.GameObjects.Text;
    private player!: Phaser.Physics.Arcade.Sprite;
    private playerIsFaling: boolean = false;
    private playerIsCasting: boolean = false;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
    private playerFacing: 'up' | 'down' | 'left' | 'right' = 'down';
    //private keyQ!: Phaser.Input.Keyboard.Key;
    private readonly TILESET_KEY = 'tilesheet';

    constructor() {
        super('Demo3');
    }

    preload() {
        this.load.image(this.TILESET_KEY, 'assets/tilemap9.png');
        this.load.spritesheet('player-walk', 'assets/male-basic-none-walk.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('player-death', 'assets/player-death.png', { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        this.chunks.clear();

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x11dd55);

        this.title_text = this.add.text(0, 0, 'Chuncked Tilemap Demo', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.title_text.setOrigin(0);
        this.title_text.setScrollFactor(0);
        this.title_text.setDepth(2);

        this.debug_text = this.add.text(0, 600, 'Debug Info:', {
            fontFamily: 'Arial', fontSize: 20, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            align: 'left'
        });
        this.debug_text.setOrigin(0);
        this.debug_text.setScrollFactor(0);

        this.debug_text.setDepth(2);

        createDemoAnimations(this);// Create animations separately so the create() method stays concise.

        this.playerIsFaling = false;
        this.playerFacing = 'down';
        this.playerIsCasting = false;
        this.player = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'player-walk', 0);
        this.player.setCollideWorldBounds(false);
        this.player.anims.play('player-idle-down');

        // Make camera follow the player
        this.camera.startFollow(this.player, true, 0.1, 0.1);

        // Input (arrows + WASD)
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.keys = this.input.keyboard!.addKeys('W,S,A,D,Q') as any;

        // Helper function to create a nice button
        const createButton = (row: number, text: string, callback: () => void) => {
            const button = this.add.text(this.cameras.main.centerX + 440, 480 + row * 50, text, {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#ffffff',
                backgroundColor: '#2d2d2d',
                align: 'center',
                fixedWidth: 100
            })
                .setPadding(5)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            // Hover effects
            button.on('pointerover', () => button.setBackgroundColor('#555555'));
            button.on('pointerout', () => button.setBackgroundColor('#2d2d2d'));

            // Click action
            button.on('pointerdown', () => {
                button.setScale(0.95); // press feedback
                callback();
                // Reset scale after click
                this.time.delayedCall(100, () => button.setScale(1));
            });
            button.setScrollFactor(0);
            return button;
        };

        createButton(2, 'Load', () => {
            this.loadFromLocalStorage();
        });
        createButton(3, 'Save', () => {
            this.saveToLocalStorage();
        });
        createButton(4, 'Restart', () => {
            this.scene.restart();
        });
        createButton(5, 'Exit', () => {
            this.scene.start('MainMenu');
        });

        // create starting chunk and some tiles around the player
        this.placeTiles(this.player.x, this.player.y, Phaser.Math.Between(0, 8));
    }

    public placeTiles(worldX: number, worldY: number, tileIndex: number): void {
        this.placeTile(worldX - this.TILE_SIZE / 2, worldY - this.TILE_SIZE / 2, tileIndex);// top-left
        this.placeTile(worldX + this.TILE_SIZE / 2, worldY - this.TILE_SIZE / 2, tileIndex);// top-right
        this.placeTile(worldX - this.TILE_SIZE / 2, worldY + this.TILE_SIZE / 2, tileIndex);// bottom-left
        this.placeTile(worldX + this.TILE_SIZE / 2, worldY + this.TILE_SIZE / 2, tileIndex);// bottom-right
    }

    /**
     * Place a tile anywhere (supports negative coords too).
     */
    public placeTile(worldX: number, worldY: number, tileIndex: number): void {
        const chunkX = Math.floor(worldX / (this.CHUNK_SIZE * this.TILE_SIZE));
        const chunkY = Math.floor(worldY / (this.CHUNK_SIZE * this.TILE_SIZE));
        const key = `${chunkX},${chunkY}`;

        if (!this.chunks.has(key)) {
            this.createChunk(chunkX, chunkY);
        }

        const chunk = this.chunks.get(key)!;
        const localX = worldX - chunkX * this.CHUNK_SIZE * this.TILE_SIZE;
        const localY = worldY - chunkY * this.CHUNK_SIZE * this.TILE_SIZE;
        const localTileX = Math.floor(localX / this.TILE_SIZE);
        const localTileY = Math.floor(localY / this.TILE_SIZE);

        if (chunk.layer.getTileAt(localTileX, localTileY) === null) {
            chunk.layer.putTileAt(tileIndex, localTileX, localTileY);
        }
    }

    private createChunk(chunkX: number, chunkY: number): void {
        const map = this.make.tilemap({
            tileWidth: this.TILE_SIZE,
            tileHeight: this.TILE_SIZE,
            width: this.CHUNK_SIZE,
            height: this.CHUNK_SIZE,
        });
        const tileset = map.addTilesetImage(this.TILESET_KEY);
        if (!tileset) {
            console.error(`Tileset "${this.TILESET_KEY}" not found!`);
            return;
        }
        const layer = map.createBlankLayer(
            '0',
            tileset,
            chunkX * this.CHUNK_SIZE * this.TILE_SIZE,
            chunkY * this.CHUNK_SIZE * this.TILE_SIZE
        );
        if (layer === null) {
            console.error('Failed to create tilemap layer!');
            return;
        }
        layer.setCollisionByExclusion([-1]);
        this.chunks.set(`${chunkX},${chunkY}`, { map, layer });
    }

    // ==================================================================
    //  SAVE / LOAD SYSTEM
    // ==================================================================

    /** Returns the full save object (ready for JSON) */
    private getSaveData(): SaveData {
        const savedChunks: SavedChunk[] = [];

        this.chunks.forEach((chunk, key) => {
            const data = this.getChunkData(chunk.layer);
            // Optional: skip completely empty chunks (uncomment if you want)
            // if (data.every(row => row.every(tile => tile === -1))) return;

            const [chunkX, chunkY] = key.split(',').map(Number);
            savedChunks.push({ chunkX, chunkY, data });
        });

        return {
            timestamp: Date.now(),
            chunks: savedChunks
        };
    }

    /** Extracts tile indices from a layer (fast) */
    private getChunkData(layer: Phaser.Tilemaps.TilemapLayer): number[][] {
        return layer.layer.data.map(row =>
            row.map(tile => (tile && tile.index !== -1 ? tile.index : -1))
        );
    }

    /** Loads a previously saved world */
    private loadSaveData(saveData: SaveData): void {
        this.destroyAllChunks(); // clear current world

        saveData.chunks.forEach(saved => {
            this.createChunk(saved.chunkX, saved.chunkY);

            const key = `${saved.chunkX},${saved.chunkY}`;
            const chunk = this.chunks.get(key)!;

            this.populateLayer(chunk.layer, saved.data);
        });

        console.log(`✅ Loaded ${saveData.chunks.length} chunks`);
    }

    /** Fills a layer from saved 2D data */
    private populateLayer(layer: Phaser.Tilemaps.TilemapLayer, data: number[][]): void {
        for (let y = 0; y < this.CHUNK_SIZE; y++) {
            for (let x = 0; x < this.CHUNK_SIZE; x++) {
                const index = data[y][x];
                if (index !== -1) {
                    layer.putTileAt(index, x, y);
                }
            }
        }
    }

    /** Destroys every chunk (used before loading) */
    private destroyAllChunks(): void {
        this.chunks.forEach(chunk => {
            chunk.layer.destroy();
            chunk.map.destroy();
        });
        this.chunks.clear();
    }

    // ==================================================================
    //  PUBLIC SAVE/LOAD METHODS (use these!)
    // ==================================================================

    /** Save to browser localStorage (instant) */
    public saveToLocalStorage(): void {
        const data = this.getSaveData();
        localStorage.setItem('phaserTilemapSave', JSON.stringify(data));
        console.log(`💾 Saved ${data.chunks.length} chunks to localStorage`);
    }

    /** Load from browser localStorage */
    public loadFromLocalStorage(): void {
        const json = localStorage.getItem('phaserTilemapSave');
        if (!json) {
            console.warn('No save file found in localStorage');
            return;
        }
        try {
            const saveData: SaveData = JSON.parse(json);
            this.loadSaveData(saveData);
        } catch (e) {
            console.error('Corrupted save data');
        }
    }



    update() {
        const playerSpeed = 200;
        let playerXSpeed = 0;
        let playerYSpeed = 0;

        if (Phaser.Input.Keyboard.JustDown(this.keys.Q) && !this.playerIsCasting) {
            this.playerIsCasting = true;
            this.player.setVelocity(0, 0);
            this.player.anims.play(`player-idle-${this.playerFacing}`, true);
            this.placeTiles(this.player.x, this.player.y, Phaser.Math.Between(0, 8));
            this.playerIsCasting = false;
        }

        // Handle input
        if (this.cursors.left.isDown || this.keys.A.isDown) playerXSpeed = -playerSpeed;
        if (this.cursors.right.isDown || this.keys.D.isDown) playerXSpeed = playerSpeed;
        if (this.cursors.up.isDown || this.keys.W.isDown) playerYSpeed = -playerSpeed;
        if (this.cursors.down.isDown || this.keys.S.isDown) playerYSpeed = playerSpeed;

        // Update player facing direction if moving
        if (playerXSpeed !== 0 || playerYSpeed !== 0) {
            if (Math.abs(playerXSpeed) > Math.abs(playerYSpeed)) {
                this.playerFacing = playerXSpeed > 0 ? 'right' : 'left';
            } else {
                this.playerFacing = playerYSpeed > 0 ? 'down' : 'up';
            }
        }

        // Normalize diagonal movement speed
        if (playerXSpeed !== 0 && playerYSpeed !== 0) {
            const norm = playerSpeed / Math.sqrt(2);
            playerXSpeed = playerXSpeed > 0 ? norm : -norm;
            playerYSpeed = playerYSpeed > 0 ? norm : -norm;
            this.player.anims.play(`player-walk-${this.playerFacing}`, true);
        } else {
            this.player.anims.play(`player-idle-${this.playerFacing}`, true);
        }
        this.player.setVelocity(playerXSpeed, playerYSpeed);

        // Ensure player renders behind tiles while falling, and above tiles while walking.
        this.player.setDepth(this.playerIsFaling ? -1 : 1);

        this.debug_text.setText(`Player x: (${this.player.x.toFixed(1)}, y:${this.player.y.toFixed(1)})\n Chunks: ${this.chunks.size}`);
    }
}
