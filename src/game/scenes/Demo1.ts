import { Scene } from 'phaser';

export class Demo1 extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    exit_text: Phaser.GameObjects.Text;
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
    private lastDirection: 'up' | 'down' | 'left' | 'right' = 'down';

    constructor ()
    {
        super('Demo1');
    }

    preload()
    {
        // Load the sprite sheet for the player (https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator)
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

        // Idle = first frame of each direction
        this.anims.create({ key: 'idle-up',  frames: [{ key: 'player', frame: 0 }],  frameRate: 10 });
        this.anims.create({ key: 'idle-left',  frames: [{ key: 'player', frame: 13 }],  frameRate: 10 });
        this.anims.create({ key: 'idle-down', frames: [{ key: 'player', frame: 26 }],  frameRate: 10 });
        this.anims.create({ key: 'idle-right',    frames: [{ key: 'player', frame: 39 }], frameRate: 10 });

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        this.player = this.physics.add.sprite(centerX, centerY, 'player', 0);
        this.player.setCollideWorldBounds(true);
        this.player.anims.play('idle-down');

        // Input (arrows + WASD)
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as any;


    }

    update()
    {
        const speed = 200;                    // ← change this to make player faster/slower
        let vx = 0;
        let vy = 0;

        // === INPUT (checked every frame) ===
        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
        if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
        if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;

        // === NORMALIZE DIAGONAL MOVEMENT (so you don't go faster diagonally) ===
        if (vx !== 0 && vy !== 0) {
            const norm = speed / Math.sqrt(2);   // ≈ 0.707
            vx = vx > 0 ? norm : -norm;
            vy = vy > 0 ? norm : -norm;
        }

        this.player.setVelocity(vx, vy);

        // === ANIMATION LOGIC (the heart of 4-directional movement) ===
        if (vx === 0 && vy === 0) {
            // Stopped → play idle in the last direction the player faced
            this.player.anims.play(`idle-${this.lastDirection}`, true);
        } else {
            // Moving → decide which direction to animate
            let newDir: 'up' | 'down' | 'left' | 'right';

            if (Math.abs(vx) > Math.abs(vy)) {
                newDir = vx < 0 ? 'left' : 'right';   // horizontal wins
            } else {
                newDir = vy < 0 ? 'up' : 'down';      // vertical wins
            }

            this.lastDirection = newDir;
            this.player.anims.play(`walk-${newDir}`, true);
        }
    }
}
