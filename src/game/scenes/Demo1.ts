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
        this.load.spritesheet('player', 'assets/player.png',{ frameWidth: 64, frameHeight: 64 });
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

        // Set default standing frame (down-facing)
        this.player.setFrame(16);

        // Create basic directional walk animations (8 frames per row)
        // Sprite sheet layout: row 0 = up, row 1 = left, row 2 = down, row 3 = right
        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('player', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('player', { start: 26, end: 33 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('player', { start: 39, end: 46 }),
            frameRate: 10,
            repeat: -1
        });

        // Create cursor keys and WASD keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    update()
    {
        const isLeft = this.cursors.left.isDown || this.aKey.isDown;
        const isRight = this.cursors.right.isDown || this.dKey.isDown;
        const isUp = this.cursors.up.isDown || this.wKey.isDown;
        const isDown = this.cursors.down.isDown || this.sKey.isDown;

        // Handle movement
        if (isLeft)
        {
            this.player.setVelocityX(-160);
            this.player.anims.play('walk-left', true);
        }
        else if (isRight)
        {
            this.player.setVelocityX(160);
            this.player.anims.play('walk-right', true);
        }
        else
        {
            this.player.setVelocityX(0);
        }

        if (isUp)
        {
            this.player.setVelocityY(-160);
            this.player.anims.play('walk-up', true);
        }
        else if (isDown)
        {
            this.player.setVelocityY(160);
            this.player.anims.play('walk-down', true);
        }
        else
        {
            this.player.setVelocityY(0);
        }

        // If no direction keys are pressed, stop animation but keep last frame
        if (!isLeft && !isRight && !isUp && !isDown)
        {
            this.player.anims.stop();
        }
    }
}
