import { Scene } from 'phaser';
import { createAnimations } from './createAnimations';

const COLORS = {
    uiText: '#ffffff',
    uiTextBorder: '#000000',
    buttonText: '#ffffff',
    buttonBg: '#2d2d2d',
    buttonHoverBg: '#555555',
};

export class Demo1 extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;
    exit_text: Phaser.GameObjects.Text;
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
    private lastDirection: 'up' | 'down' | 'left' | 'right' = 'down';
    private oldvx: number = 0;
    private oldvy: number = 0;
    private playerSex = 'male';
    private playerGear = 'basic';
    private playerWeapon = 'staff';
    private isAttacking = false;

    constructor() {
        super('Demo1');
    }

    preload() {
        
        // Load the sprite sheet for the player (https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator)
        const sexes =['male','female'];
        const gears = ['nude','bare','basic','armor'];
        const weapons = ['none','dagger','staff'];
        sexes.forEach(sex => {
            gears.forEach(gear => {
                weapons.forEach(weapon => {
                    this.load.spritesheet(`${sex}-${gear}-${weapon}-walk`, `assets/${sex}-${gear}-${weapon}-walk.png`, { frameWidth: 64, frameHeight: 64 });
                    this.load.spritesheet(`${sex}-${gear}-${weapon}-thrust`, `assets/${sex}-${gear}-${weapon}-thrust.png`, { frameWidth: 64, frameHeight: 64 });
                    this.load.spritesheet(`${sex}-${gear}-${weapon}-idle`, `assets/${sex}-${gear}-${weapon}-idle.png`, { frameWidth: 64, frameHeight: 64 });
                    this.load.spritesheet(`${sex}-${gear}-${weapon}-hurt`, `assets/${sex}-${gear}-${weapon}-hurt.png`, { frameWidth: 64, frameHeight: 64 });
                });
            });        
        });
        // sword
        sexes.forEach(sex => {
            gears.forEach(gear => {
               const weapon = 'sword';
                this.load.spritesheet(`${sex}-${gear}-${weapon}-walk`, `assets/${sex}-${gear}-${weapon}-walk.png`, { frameWidth: 64, frameHeight: 64 });
                this.load.spritesheet(`${sex}-${gear}-${weapon}-thrust`, `assets/${sex}-${gear}-${weapon}-thrust128.png`, { frameWidth: 128, frameHeight: 128 });
                this.load.spritesheet(`${sex}-${gear}-${weapon}-idle`, `assets/${sex}-${gear}-${weapon}-idle.png`, { frameWidth: 64, frameHeight: 64 });
                this.load.spritesheet(`${sex}-${gear}-${weapon}-hurt`, `assets/${sex}-${gear}-${weapon}-hurt.png`, { frameWidth: 64, frameHeight: 64 });               
            });        
        });
        // Load the spell effect sprite sheet (https://opengameart.org/content/music-magic-effect)
        this.load.spritesheet('music', 'assets/music_orig1.png', { frameWidth: 150, frameHeight: 150 });
        //Paint your own: https://www.piskelapp.com/p/create/sprite/
        this.load.image('colortest4', 'assets/colortest4.png');
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(300, 600, 'colortest4');

        this.msg_text = this.add.text(0, 0, 'Demo 1', {
            fontFamily: 'Arial Black', fontSize: 38, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 8,
            align: 'center'
        });
        this.msg_text.setOrigin(0);

        this.exit_text = this.add.text(900, 700, 'Exit', {
            fontFamily: 'Arial Black', fontSize: 38, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 8,
            align: 'center'
        });
        this.exit_text.setOrigin(0);
        this.exit_text.setInteractive({ useHandCursor: true });
        this.exit_text.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        // Create all animations separately so the create() method stays concise.
        createAnimations(this);

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        this.player = this.physics.add.sprite(centerX, centerY, `${this.playerSex}-${this.playerGear}-${this.playerWeapon}-walk`, 0);
        this.player.setCollideWorldBounds(true);
        this.player.anims.play(`${this.playerSex}-${this.playerGear}-${this.playerWeapon}-idle-down`);

        // Input (arrows + WASD)
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = this.input.keyboard!.addKeys('W,S,A,D,Q') as any;

        // Helper function to create a nice button
        const createButton = (y: number, x: number, text: string, callback: () => void) => {
            const button = this.add.text(centerX + 290 + x * 120, 50 + y * 45, text, {
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

        createButton(0, 0, 'Male', () => {
            this.playerSex = 'male';
        });
        createButton(0, 1, 'Female', () => {
            this.playerSex = 'female';
        });
        createButton(1, -2, 'Nude', () => {
            this.playerGear = 'nude';
        });
        createButton(1, -1, 'Bare', () => {
            this.playerGear = 'bare';
        });
        createButton(1, 0, 'Basic', () => {
            this.playerGear = 'basic';
        });
        createButton(1, 1, 'Armor', () => {
            this.playerGear = 'armor';
        });
        createButton(2, -2, 'None', () => {
            this.playerWeapon = 'none';
        });
        createButton(2, -1, 'Dagger', () => {
            this.playerWeapon = 'dagger';
        });
        createButton(2, 0, 'Staff', () => {
            this.playerWeapon = 'staff';
        });
        createButton(2, 1, 'Sword', () => {
            this.playerWeapon = 'sword';
        });

    }

    update() {
        const speed = 200;
        let vx = 0;
        let vy = 0;

        // === INPUT (checked every frame) ===
        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
        if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
        if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
        if (vx !== 0 || vy !== 0) {
            this.oldvx = vx;
            this.oldvy = vy;
        }
        //this.player.body?.velocity.normalize().scale(speed); // Normalize diagonal movement

        // === NORMALIZE DIAGONAL MOVEMENT (so you don't go faster diagonally) ===
        if (vx !== 0 && vy !== 0) {
            const norm = speed / Math.sqrt(2);   // ≈ 0.707
            vx = vx > 0 ? norm : -norm;
            vy = vy > 0 ? norm : -norm;
        }

        // === ATTACK INPUT ===
        if (Phaser.Input.Keyboard.JustDown(this.wasd.Q) && !this.isAttacking) {
            this.isAttacking = true;
            this.player.setVelocity(0, 0);

            // Play thrust animation
            this.player.anims.play(`${this.playerSex}-${this.playerGear}-${this.playerWeapon}-thrust-${this.lastDirection}`, true);

            // Create spell effect
            const spell = this.add.sprite(this.player.x + this.oldvx / 10, this.player.y + this.oldvy / 10, 'music').setScale(0.5).setOrigin(0.5, 0.5);
            spell.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            spell.play('cast');
            this.tweens.add({
                targets: spell,
                x: spell.x + this.oldvx / 3,
                y: spell.y + this.oldvy / 3,
                duration: 600,
                ease: 'Sine.easeOut',
                onComplete: () => spell.destroy()
            });
            spell.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                spell.destroy();
            });

            // Reset attacking flag when thrust animation completes
            this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.isAttacking = false;
            });
        } else if (!this.isAttacking) {
            this.player.setVelocity(vx, vy);
        }

        // === ANIMATION LOGIC (the heart of 4-directional movement) ===
        if (vx === 0 && vy === 0) {
            if (this.isAttacking) {
                // Attacking - animation already playing
            } else {
                // Stopped → play idle in the last direction the player faced
                this.player.anims.play(`${this.playerSex}-${this.playerGear}-${this.playerWeapon}-idle-${this.lastDirection}`, true);
            }
        } else {
            if (!this.isAttacking) {
                // Moving → decide which direction to animate
                let newDir: 'up' | 'down' | 'left' | 'right';

                if (Math.abs(vx) > Math.abs(vy)) {
                    newDir = vx < 0 ? 'left' : 'right';   // horizontal wins
                } else {
                    newDir = vy < 0 ? 'up' : 'down';      // vertical wins
                }

                this.lastDirection = newDir;
                this.player.anims.play(`${this.playerSex}-${this.playerGear}-${this.playerWeapon}-walk-${newDir}`, true);
            }
        }
    }
}
