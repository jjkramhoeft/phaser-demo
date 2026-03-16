import { Scene } from 'phaser';

const COLORS = {
    buttonText: '#ffffff',
    buttonBg: '#2d2d2d',
    buttonHoverBg: '#555555',
};

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
    private oldvx: number = 0;
    private oldvy: number = 0;
    private playerSex = 'male';

    constructor ()
    {
        super('Demo1');
    }

    preload()
    {
        // Load the sprite sheet for the player (https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator)
        this.load.spritesheet('player-walk', 'assets/player.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('player-thrust', 'assets/thrust_oversize.png',{ frameWidth: 192, frameHeight: 192 });

        
        this.load.spritesheet('male-walk', 'assets/male-armor-sword-walk.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('male-thrust', 'assets/male-armor-sword-thrust128.png',{ frameWidth: 128, frameHeight: 128 });        
        this.load.spritesheet('female-walk', 'assets/female-basic-sword-walk.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('female-thrust', 'assets/female-basic-sword-thrust128.png',{ frameWidth: 128, frameHeight: 128 });

        // Load the spell effect sprite sheet (https://opengameart.org/content/music-magic-effect)
        this.load.spritesheet('music', 'assets/music_orig1.png',{ frameWidth: 150, frameHeight: 150 });
        //Paint your own: https://www.piskelapp.com/p/create/sprite/
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
        //dummy
        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 26, end: 33 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: -1
        });
        //male-walk
        this.anims.create({
            key: 'male-walk-up',
            frames: this.anims.generateFrameNumbers('male-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-walk-left',
            frames: this.anims.generateFrameNumbers('male-walk', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-walk-down',
            frames: this.anims.generateFrameNumbers('male-walk', { start: 26, end: 33 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-walk-right',
            frames: this.anims.generateFrameNumbers('male-walk', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: -1
        });
        //female-walk
        this.anims.create({
            key: 'female-walk-up',
            frames: this.anims.generateFrameNumbers('female-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-walk-left',
            frames: this.anims.generateFrameNumbers('female-walk', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-walk-down',
            frames: this.anims.generateFrameNumbers('female-walk', { start: 26, end: 33 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-walk-right',
            frames: this.anims.generateFrameNumbers('female-walk', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: -1
        });
        // Create basic directional attack animations (8 frames per row)
        // Sprite sheet layout: row 0 = up, row 1 = left, row 2 = down, row 3 = right
        //dummy
        this.anims.create({
            key: 'thrust-up',
            frames: this.anims.generateFrameNumbers('player-thrust', { start: 0, end: 7 }),
            frameRate: 14,
            repeat: -1
        });
        this.anims.create({
            key: 'thrust-left',
            frames: this.anims.generateFrameNumbers('player-thrust', { start: 8, end: 15 }),
            frameRate: 14,
            repeat: -1
        });
        this.anims.create({
            key: 'thrust-down',
            frames: this.anims.generateFrameNumbers('player-thrust', { start: 16, end: 23 }),
            frameRate: 14,
            repeat: -1
        });
        this.anims.create({
            key: 'thrust-right',
            frames: this.anims.generateFrameNumbers('player-thrust', { start: 24, end: 31 }),
            frameRate: 14,
            repeat: 1
        });
        //male-thrust
        this.anims.create({
            key: 'male-thrust-up',
            frames: this.anims.generateFrameNumbers('male-thrust', { start: 0, end: 5 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-thrust-left',
            frames: this.anims.generateFrameNumbers('male-thrust', { start: 6, end: 11 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-thrust-down',
            frames: this.anims.generateFrameNumbers('male-thrust', { start: 12, end: 17 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-thrust-right',
            frames: this.anims.generateFrameNumbers('male-thrust', { start: 18, end: 23 }),
            frameRate: 14,
            repeat: 1
        });
        //female-thrust
        this.anims.create({
            key: 'female-thrust-up',
            frames: this.anims.generateFrameNumbers('female-thrust', { start: 0, end: 5 }),
            frameRate: 14,
            repeat: -1
        });
        this.anims.create({
            key: 'female-thrust-left',
            frames: this.anims.generateFrameNumbers('female-thrust', { start: 6, end: 11 }),
            frameRate: 14,
            repeat: -1
        });
        this.anims.create({
            key: 'female-thrust-down',
            frames: this.anims.generateFrameNumbers('female-thrust', { start: 12, end: 17 }),
            frameRate: 14,
            repeat: -1
        });
        this.anims.create({
            key: 'female-thrust-right',
            frames: this.anims.generateFrameNumbers('female-thrust', { start: 18, end: 23 }),
            frameRate: 14,
            repeat: -1
        });
        // commen magic
        this.anims.create({
            key: 'cast',                    // e.g. swirling musical notes
            frames: this.anims.generateFrameNumbers('music', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: 0                       // play once
        });

        // Idle = first frame of each direction
        //dummy
        this.anims.create({ key: 'idle-up',  frames: [{ key: 'player-walk', frame: 0 }],  frameRate: 10 });
        this.anims.create({ key: 'idle-left',  frames: [{ key: 'player-walk', frame: 13 }],  frameRate: 10 });
        this.anims.create({ key: 'idle-down', frames: [{ key: 'player-walk', frame: 26 }],  frameRate: 10 });
        this.anims.create({ key: 'idle-right',    frames: [{ key: 'player-walk', frame: 39 }], frameRate: 10 });
        //male
        this.anims.create({ key: 'male-idle-up',  frames: [{ key: 'male-walk', frame: 0 }],  frameRate: 10 });
        this.anims.create({ key: 'male-idle-left',  frames: [{ key: 'male-walk', frame: 13 }],  frameRate: 10 });
        this.anims.create({ key: 'male-idle-down', frames: [{ key: 'male-walk', frame: 26 }],  frameRate: 10 });
        this.anims.create({ key: 'male-idle-right',    frames: [{ key: 'male-walk', frame: 39 }], frameRate: 10 });
        //female
        this.anims.create({ key: 'female-idle-up',  frames: [{ key: 'female-walk', frame: 0 }],  frameRate: 10 });
        this.anims.create({ key: 'female-idle-left',  frames: [{ key: 'female-walk', frame: 13 }],  frameRate: 10 });
        this.anims.create({ key: 'female-idle-down', frames: [{ key: 'female-walk', frame: 26 }],  frameRate: 10 });
        this.anims.create({ key: 'female-idle-right',    frames: [{ key: 'female-walk', frame: 39 }], frameRate: 10 });

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        this.player = this.physics.add.sprite(centerX, centerY, `${this.playerSex}-walk`, 0);
        this.player.setCollideWorldBounds(true);
        this.player.anims.play(`${this.playerSex}-down`);

        // Input (arrows + WASD)
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = this.input.keyboard!.addKeys('W,S,A,D,Q') as any;

        // Helper function to create a nice button
        const createButton = (y: number, x: number, text: string, callback: () => void) => {
            const button = this.add.text(centerX + 220 + x*150, 50 +  y*100, text, {
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

            return button;
        };

        createButton(0 ,0, 'Male', () => {
            this.playerSex='male';
        });
        createButton(0 ,1, 'Female', () => {
            this.playerSex='female';
        });

    }

    update()
    {
        const speed = 200;
        let vx = 0;
        let vy = 0;
        let isThrusting = false;

        // === INPUT (checked every frame) ===
        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
        if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
        if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
        if(vx !== 0 || vy !== 0){
            this.oldvx = vx;
            this.oldvy = vy;
        }

        // === NORMALIZE DIAGONAL MOVEMENT (so you don't go faster diagonally) ===
        if (vx !== 0 && vy !== 0) {
            const norm = speed / Math.sqrt(2);   // ≈ 0.707
            vx = vx > 0 ? norm : -norm;
            vy = vy > 0 ? norm : -norm;
        }

        if(this.wasd.Q.isDown){
            isThrusting= true;
            this.player.setVelocity(0, 0);
        }
        else{
            isThrusting= false;
            this.player.setVelocity(vx, vy);
        }        

        // === ANIMATION LOGIC (the heart of 4-directional movement) ===
        if (vx === 0 && vy === 0) {
            if(isThrusting){
                // Stopped → play thrust in the last direction the player faced
                this.player.anims.play(`${this.playerSex}-thrust-${this.lastDirection}`, true);
                
                const spell = this.add.sprite( this.player.x + this.oldvx/10,  this.player.y +this.oldvy/10, 'magicEffect').setScale(0.5).setOrigin(0.5, 0.5);;
                spell.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
                spell.play('cast');
                this.tweens.add({
                    targets: spell,
                    x: spell.x + this.oldvx/3,              // ← change 120 to any distance you want
                                                // +120 = right
                                                // -120 = left
                    y: spell.y + this.oldvy/3,               // optional upward drift (feels more "magical")
                    duration: 600,                 // time in ms (0.6 seconds)
                    ease: 'Sine.easeOut',          // smooth acceleration
                    onComplete: () => spell.destroy()   // clean up when finished
                });
                spell.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    spell.destroy();
                });
                
            }else{
                // Stopped → play idle in the last direction the player faced
                this.player.anims.play(`${this.playerSex}-idle-${this.lastDirection}`, true);
            }
        } else {
            // Moving → decide which direction to animate
            let newDir: 'up' | 'down' | 'left' | 'right';

            if (Math.abs(vx) > Math.abs(vy)) {
                newDir = vx < 0 ? 'left' : 'right';   // horizontal wins
            } else {
                newDir = vy < 0 ? 'up' : 'down';      // vertical wins
            }

            this.lastDirection = newDir;
            this.player.anims.play(`${this.playerSex}-walk-${newDir}`, true);
        }
    }
}
