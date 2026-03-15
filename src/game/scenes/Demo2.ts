import { Scene } from 'phaser';

export class Demo2 extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    exit_text: Phaser.GameObjects.Text;
    map: Phaser.Tilemaps.Tilemap;
    layer: Phaser.Tilemaps.TilemapLayer | null;

    constructor ()
    {
        super('Demo2');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.msg_text = this.add.text(0, 0, 'Demo 2', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.msg_text.setOrigin(0);
        
        // Create tilemap
        this.map = this.make.tilemap({ width: 16, height: 12, tileWidth: 64, tileHeight: 64 });
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

        // Put one tile in the center
        this.layer.putTileAt(0, 8, 6);

        // Add click to place tiles
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const tileX = this.map.worldToTileX(worldPoint.x);
            const tileY = this.map.worldToTileY(worldPoint.y);
            if (tileX !== null && tileY !== null) {
                const tileIndex = Phaser.Math.Between(0, 8);
                this.layer!.putTileAt(tileIndex, tileX, tileY);
            }
        });

        this.exit_text = this.add.text(900, 700, 'Exit', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.exit_text.setOrigin(0);
        this.exit_text.setInteractive({ useHandCursor: true });
        this.exit_text.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
