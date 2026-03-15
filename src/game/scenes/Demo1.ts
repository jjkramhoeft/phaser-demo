import { Scene } from 'phaser';

export class Demo1 extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    exit_text: Phaser.GameObjects.Text;
    player: Phaser.Physics.Arcade.Sprite;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    wKey: Phaser.Input.Keyboard.Key;
    aKey: Phaser.Input.Keyboard.Key;
    sKey: Phaser.Input.Keyboard.Key;
    dKey: Phaser.Input.Keyboard.Key;

    constructor ()
    {
        super('Demo1');
    }

    preload()
    {
        // Load the sprite sheet for the player
        // Assuming you have a sprite sheet at 'assets/player.png' with frames 32x32
        // For now, using logo.png as placeholder
        this.load.image('player', 'assets/logo.png');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.msg_text = this.add.text(0, 0, 'Demo 1', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.msg_text.setOrigin(0);
        
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

        // Add player sprite
        this.player = this.physics.add.sprite(512, 384, 'player');
        this.player.setCollideWorldBounds(true);

        // Create cursor keys and WASD keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    update()
    {
        // Handle movement
        if (this.cursors.left.isDown || this.aKey.isDown)
        {
            this.player.setVelocityX(-160);
        }
        else if (this.cursors.right.isDown || this.dKey.isDown)
        {
            this.player.setVelocityX(160);
        }
        else
        {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown || this.wKey.isDown)
        {
            this.player.setVelocityY(-160);
        }
        else if (this.cursors.down.isDown || this.sKey.isDown)
        {
            this.player.setVelocityY(160);
        }
        else
        {
            this.player.setVelocityY(0);
        }
    }
}
