import { Scene } from 'phaser';

const COLORS = {
    uiText: '#ffffff',
    uiTextBorder: '#000000',
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
    private playerGear = 'basic';
    private playerWeapon = 'staff';
    private isAttacking = false;

    constructor ()
    {
        super('Demo1');
    }

    preload()
    {
        // Load the sprite sheet for the player (https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator)
        this.load.spritesheet('male-basic-sword-walk', 'assets/male-basic-sword-walk.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('male-basic-sword-thrust', 'assets/male-basic-sword-thrust128.png',{ frameWidth: 128, frameHeight: 128 });     
        this.load.spritesheet('male-basic-staff-walk', 'assets/male-basic-staff-walk.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('male-basic-staff-thrust', 'assets/male-basic-staff-thrust.png',{ frameWidth: 64, frameHeight: 64 });      
        this.load.spritesheet('male-armor-sword-walk', 'assets/male-armor-sword-walk.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('male-armor-sword-thrust', 'assets/male-armor-sword-thrust128.png',{ frameWidth: 128, frameHeight: 128 });     
        this.load.spritesheet('male-armor-staff-walk', 'assets/male-armor-staff-walk.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('male-armor-staff-thrust', 'assets/male-armor-staff-thrust.png',{ frameWidth: 64, frameHeight: 64 });        
        this.load.spritesheet('female-basic-sword-walk', 'assets/female-basic-sword-walk.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('female-basic-sword-thrust', 'assets/female-basic-sword-thrust128.png',{ frameWidth: 128, frameHeight: 128 });    
        this.load.spritesheet('female-basic-staff-walk', 'assets/female-basic-staff-walk.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('female-basic-staff-thrust', 'assets/female-basic-staff-thrust.png',{ frameWidth: 64, frameHeight: 64 });    
        this.load.spritesheet('female-armor-sword-walk', 'assets/female-armor-sword-walk.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('female-armor-sword-thrust', 'assets/female-armor-sword-thrust128.png',{ frameWidth: 128, frameHeight: 128 });    
        this.load.spritesheet('female-armor-staff-walk', 'assets/female-armor-staff-walk.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('female-armor-staff-thrust', 'assets/female-armor-staff-thrust.png',{ frameWidth: 64, frameHeight: 64 });

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
        this.createAnimations();

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

            return button;
        };

        createButton(0 ,0, 'Male', () => {
            this.playerSex='male';
        });
        createButton(0 ,1, 'Female', () => {
            this.playerSex='female';
        });
        createButton(1 ,0, 'Basic', () => {
            this.playerGear='basic';
        });
        createButton(1 ,1, 'Armor', () => {
            this.playerGear='armor';
        });
        createButton(2 ,0, 'Staff', () => {
            this.playerWeapon='staff';
        });
        createButton(2 ,1, 'Sword', () => {
            this.playerWeapon='sword';
        });

    }

    private createAnimations()
    {
        // Create basic directional walk animations (8 frames per row)
        // Sprite sheet layout: row 0 = up, row 1 = left, row 2 = down, row 3 = right
        //male-armor-sword-walk
        this.anims.create({
            key: 'male-armor-sword-walk-up',
            frames: this.anims.generateFrameNumbers('male-armor-sword-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-armor-sword-walk-left',
            frames: this.anims.generateFrameNumbers('male-armor-sword-walk', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-armor-sword-walk-down',
            frames: this.anims.generateFrameNumbers('male-armor-sword-walk', { start: 26, end: 33 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-armor-sword-walk-right',
            frames: this.anims.generateFrameNumbers('male-armor-sword-walk', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: -1
        });
        //female-basic-sword-walk
        this.anims.create({
            key: 'female-basic-sword-walk-up',
            frames: this.anims.generateFrameNumbers('female-basic-sword-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-basic-sword-walk-left',
            frames: this.anims.generateFrameNumbers('female-basic-sword-walk', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-basic-sword-walk-down',
            frames: this.anims.generateFrameNumbers('female-basic-sword-walk', { start: 26, end: 33 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-basic-sword-walk-right',
            frames: this.anims.generateFrameNumbers('female-basic-sword-walk', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: -1
        });
        //male-basic-sword-walk
        this.anims.create({
            key: 'male-basic-sword-walk-up',
            frames: this.anims.generateFrameNumbers('male-basic-sword-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-basic-sword-walk-left',
            frames: this.anims.generateFrameNumbers('male-basic-sword-walk', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-basic-sword-walk-down',
            frames: this.anims.generateFrameNumbers('male-basic-sword-walk', { start: 26, end: 33 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-basic-sword-walk-right',
            frames: this.anims.generateFrameNumbers('male-basic-sword-walk', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: -1
        });
        //male-basic-staff-walk
        this.anims.create({
            key: 'male-basic-staff-walk-up',
            frames: this.anims.generateFrameNumbers('male-basic-staff-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-basic-staff-walk-left',
            frames: this.anims.generateFrameNumbers('male-basic-staff-walk', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-basic-staff-walk-down',
            frames: this.anims.generateFrameNumbers('male-basic-staff-walk', { start: 26, end: 33 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-basic-staff-walk-right',
            frames: this.anims.generateFrameNumbers('male-basic-staff-walk', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: -1
        });
        //male-armor-staff-walk
        this.anims.create({
            key: 'male-armor-staff-walk-up',
            frames: this.anims.generateFrameNumbers('male-armor-staff-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-armor-staff-walk-left',
            frames: this.anims.generateFrameNumbers('male-armor-staff-walk', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-armor-staff-walk-down',
            frames: this.anims.generateFrameNumbers('male-armor-staff-walk', { start: 26, end: 33 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'male-armor-staff-walk-right',
            frames: this.anims.generateFrameNumbers('male-armor-staff-walk', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: -1
        });
        //female-basic-staff-walk
        this.anims.create({
            key: 'female-basic-staff-walk-up',
            frames: this.anims.generateFrameNumbers('female-basic-staff-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-basic-staff-walk-left',
            frames: this.anims.generateFrameNumbers('female-basic-staff-walk', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-basic-staff-walk-down',
            frames: this.anims.generateFrameNumbers('female-basic-staff-walk', { start: 26, end: 33 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-basic-staff-walk-right',
            frames: this.anims.generateFrameNumbers('female-basic-staff-walk', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: -1
        });
        //female-armor-sword-walk
        this.anims.create({
            key: 'female-armor-sword-walk-up',
            frames: this.anims.generateFrameNumbers('female-armor-sword-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-armor-sword-walk-left',
            frames: this.anims.generateFrameNumbers('female-armor-sword-walk', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-armor-sword-walk-down',
            frames: this.anims.generateFrameNumbers('female-armor-sword-walk', { start: 26, end: 33 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-armor-sword-walk-right',
            frames: this.anims.generateFrameNumbers('female-armor-sword-walk', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: -1
        });
        //female-armor-staff-walk
        this.anims.create({
            key: 'female-armor-staff-walk-up',
            frames: this.anims.generateFrameNumbers('female-armor-staff-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-armor-staff-walk-left',
            frames: this.anims.generateFrameNumbers('female-armor-staff-walk', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-armor-staff-walk-down',
            frames: this.anims.generateFrameNumbers('female-armor-staff-walk', { start: 26, end: 33 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'female-armor-staff-walk-right',
            frames: this.anims.generateFrameNumbers('female-armor-staff-walk', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: -1
        });
        // Create basic directional attack animations (8 frames per row)
        // Sprite sheet layout: row 0 = up, row 1 = left, row 2 = down, row 3 = right
        //male-armor-sword-thrust
        this.anims.create({
            key: 'male-armor-sword-thrust-up',
            frames: this.anims.generateFrameNumbers('male-armor-sword-thrust', { start: 0, end: 5 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-armor-sword-thrust-left',
            frames: this.anims.generateFrameNumbers('male-armor-sword-thrust', { start: 6, end: 11 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-armor-sword-thrust-down',
            frames: this.anims.generateFrameNumbers('male-armor-sword-thrust', { start: 12, end: 17 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-armor-sword-thrust-right',
            frames: this.anims.generateFrameNumbers('male-armor-sword-thrust', { start: 18, end: 23 }),
            frameRate: 14,
            repeat: 1
        });        
        //male-armor-staff-thrust
        this.anims.create({
            key: 'male-armor-staff-thrust-up',
            frames: this.anims.generateFrameNumbers('male-armor-staff-thrust', { start: 0, end: 7 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-armor-staff-thrust-left',
            frames: this.anims.generateFrameNumbers('male-armor-staff-thrust', { start: 13, end: 20 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-armor-staff-thrust-down',
            frames: this.anims.generateFrameNumbers('male-armor-staff-thrust', { start: 26, end: 33 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-armor-staff-thrust-right',
            frames: this.anims.generateFrameNumbers('male-armor-staff-thrust', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: 1
        });
        //female-basic-sword-thrust
        this.anims.create({
            key: 'female-basic-sword-thrust-up',
            frames: this.anims.generateFrameNumbers('female-basic-sword-thrust', { start: 0, end: 5 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'female-basic-sword-thrust-left',
            frames: this.anims.generateFrameNumbers('female-basic-sword-thrust', { start: 6, end: 11 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'female-basic-sword-thrust-down',
            frames: this.anims.generateFrameNumbers('female-basic-sword-thrust', { start: 12, end: 17 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'female-basic-sword-thrust-right',
            frames: this.anims.generateFrameNumbers('female-basic-sword-thrust', { start: 18, end: 23 }),
            frameRate: 14,
            repeat: 1
        });
        //female-basic-staff-thrust
        this.anims.create({
            key: 'female-basic-staff-thrust-up',
            frames: this.anims.generateFrameNumbers('female-basic-staff-thrust', { start: 0, end: 7 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'female-basic-staff-thrust-left',
            frames: this.anims.generateFrameNumbers('female-basic-staff-thrust', { start: 13, end: 20 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'female-basic-staff-thrust-down',
            frames: this.anims.generateFrameNumbers('female-basic-staff-thrust', { start: 26, end: 33 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'female-basic-staff-thrust-right',
            frames: this.anims.generateFrameNumbers('female-basic-staff-thrust', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: 1
        });
        //male-basic-sword-thrust
        this.anims.create({
            key: 'male-basic-sword-thrust-up',
            frames: this.anims.generateFrameNumbers('male-basic-sword-thrust', { start: 0, end: 5 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-basic-sword-thrust-left',
            frames: this.anims.generateFrameNumbers('male-basic-sword-thrust', { start: 6, end: 11 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-basic-sword-thrust-down',
            frames: this.anims.generateFrameNumbers('male-basic-sword-thrust', { start: 12, end: 17 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-basic-sword-thrust-right',
            frames: this.anims.generateFrameNumbers('male-basic-sword-thrust', { start: 18, end: 23 }),
            frameRate: 14,
            repeat: 1
        });
        //male-basic-staff-thrust
        this.anims.create({
            key: 'male-basic-staff-thrust-up',
            frames: this.anims.generateFrameNumbers('male-basic-staff-thrust', { start: 0, end: 7 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-basic-staff-thrust-left',
            frames: this.anims.generateFrameNumbers('male-basic-staff-thrust', { start: 13, end: 20 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-basic-staff-thrust-down',
            frames: this.anims.generateFrameNumbers('male-basic-staff-thrust', { start: 26, end: 33 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'male-basic-staff-thrust-right',
            frames: this.anims.generateFrameNumbers('male-basic-staff-thrust', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: 1
        });
        //female-armor-sword-thrust
        this.anims.create({
            key: 'female-armor-sword-thrust-up',
            frames: this.anims.generateFrameNumbers('female-armor-sword-thrust', { start: 0, end: 5 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'female-armor-sword-thrust-left',
            frames: this.anims.generateFrameNumbers('female-armor-sword-thrust', { start: 6, end: 11 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'female-armor-sword-thrust-down',
            frames: this.anims.generateFrameNumbers('female-armor-sword-thrust', { start: 12, end: 17 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'female-armor-sword-thrust-right',
            frames: this.anims.generateFrameNumbers('female-armor-sword-thrust', { start: 18, end: 23 }),
            frameRate: 14,
            repeat: 1
        });
        //female-armor-staff-thrust
        this.anims.create({
            key: 'female-armor-staff-thrust-up',
            frames: this.anims.generateFrameNumbers('female-armor-staff-thrust', { start: 0, end: 7 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'female-armor-staff-thrust-left',
            frames: this.anims.generateFrameNumbers('female-armor-staff-thrust', { start: 13, end: 20 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'female-armor-staff-thrust-down',
            frames: this.anims.generateFrameNumbers('female-armor-staff-thrust', { start: 26, end: 33 }),
            frameRate: 14,
            repeat: 1
        });
        this.anims.create({
            key: 'female-armor-staff-thrust-right',
            frames: this.anims.generateFrameNumbers('female-armor-staff-thrust', { start: 39, end: 46 }),
            frameRate: 14,
            repeat: 1
        });
        // commen magic
        this.anims.create({
            key: 'cast',                    // e.g. swirling musical notes
            frames: this.anims.generateFrameNumbers('music', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: 0                       // play once
        });

        // Idle = first frame of each direction
        //male
        this.anims.create({ key: 'male-armor-sword-idle-up',  frames: [{ key: 'male-armor-sword-walk', frame: 0 }],  frameRate: 10 });
        this.anims.create({ key: 'male-armor-sword-idle-left',  frames: [{ key: 'male-armor-sword-walk', frame: 13 }],  frameRate: 10 });
        this.anims.create({ key: 'male-armor-sword-idle-down', frames: [{ key: 'male-armor-sword-walk', frame: 26 }],  frameRate: 10 });
        this.anims.create({ key: 'male-armor-sword-idle-right',    frames: [{ key: 'male-armor-sword-walk', frame: 39 }], frameRate: 10 });
        this.anims.create({ key: 'male-armor-staff-idle-up',  frames: [{ key: 'male-armor-staff-walk', frame: 0 }],  frameRate: 10 });
        this.anims.create({ key: 'male-armor-staff-idle-left',  frames: [{ key: 'male-armor-staff-walk', frame: 13 }],  frameRate: 10 });
        this.anims.create({ key: 'male-armor-staff-idle-down', frames: [{ key: 'male-armor-staff-walk', frame: 26 }],  frameRate: 10 });
        this.anims.create({ key: 'male-armor-staff-idle-right',    frames: [{ key: 'male-armor-staff-walk', frame: 39 }], frameRate: 10 });
        this.anims.create({ key: 'male-basic-sword-idle-up',  frames: [{ key: 'male-basic-sword-walk', frame: 0 }],  frameRate: 10 });
        this.anims.create({ key: 'male-basic-sword-idle-left',  frames: [{ key: 'male-basic-sword-walk', frame: 13 }],  frameRate: 10 });
        this.anims.create({ key: 'male-basic-sword-idle-down', frames: [{ key: 'male-basic-sword-walk', frame: 26 }],  frameRate: 10 });
        this.anims.create({ key: 'male-basic-sword-idle-right',    frames: [{ key: 'male-basic-sword-walk', frame: 39 }], frameRate: 10 });
        this.anims.create({ key: 'male-basic-staff-idle-up',  frames: [{ key: 'male-basic-staff-walk', frame: 0 }],  frameRate: 10 });
        this.anims.create({ key: 'male-basic-staff-idle-left',  frames: [{ key: 'male-basic-staff-walk', frame: 13 }],  frameRate: 10 });
        this.anims.create({ key: 'male-basic-staff-idle-down', frames: [{ key: 'male-basic-staff-walk', frame: 26 }],  frameRate: 10 });
        this.anims.create({ key: 'male-basic-staff-idle-right',    frames: [{ key: 'male-basic-staff-walk', frame: 39 }], frameRate: 10 });
        //female
        this.anims.create({ key: 'female-armor-sword-idle-up',  frames: [{ key: 'female-armor-sword-walk', frame: 0 }],  frameRate: 10 });
        this.anims.create({ key: 'female-armor-sword-idle-left',  frames: [{ key: 'female-armor-sword-walk', frame: 13 }],  frameRate: 10 });
        this.anims.create({ key: 'female-armor-sword-idle-down', frames: [{ key: 'female-armor-sword-walk', frame: 26 }],  frameRate: 10 });
        this.anims.create({ key: 'female-armor-sword-idle-right',    frames: [{ key: 'female-armor-sword-walk', frame: 39 }], frameRate: 10 });
        this.anims.create({ key: 'female-armor-staff-idle-up',  frames: [{ key: 'female-armor-staff-walk', frame: 0 }],  frameRate: 10 });
        this.anims.create({ key: 'female-armor-staff-idle-left',  frames: [{ key: 'female-armor-staff-walk', frame: 13 }],  frameRate: 10 });
        this.anims.create({ key: 'female-armor-staff-idle-down', frames: [{ key: 'female-armor-staff-walk', frame: 26 }],  frameRate: 10 });
        this.anims.create({ key: 'female-armor-staff-idle-right',    frames: [{ key: 'female-armor-staff-walk', frame: 39 }], frameRate: 10 });
        this.anims.create({ key: 'female-basic-sword-idle-up',  frames: [{ key: 'female-basic-sword-walk', frame: 0 }],  frameRate: 10 });
        this.anims.create({ key: 'female-basic-sword-idle-left',  frames: [{ key: 'female-basic-sword-walk', frame: 13 }],  frameRate: 10 });
        this.anims.create({ key: 'female-basic-sword-idle-down', frames: [{ key: 'female-basic-sword-walk', frame: 26 }],  frameRate: 10 });
        this.anims.create({ key: 'female-basic-sword-idle-right',    frames: [{ key: 'female-basic-sword-walk', frame: 39 }], frameRate: 10 });
        this.anims.create({ key: 'female-basic-staff-idle-up',  frames: [{ key: 'female-basic-staff-walk', frame: 0 }],  frameRate: 10 });
        this.anims.create({ key: 'female-basic-staff-idle-left',  frames: [{ key: 'female-basic-staff-walk', frame: 13 }],  frameRate: 10 });
        this.anims.create({ key: 'female-basic-staff-idle-down', frames: [{ key: 'female-basic-staff-walk', frame: 26 }],  frameRate: 10 });
        this.anims.create({ key: 'female-basic-staff-idle-right',    frames: [{ key: 'female-basic-staff-walk', frame: 39 }], frameRate: 10 });
    }

    update()
    {
        const speed = 200;
        let vx = 0;
        let vy = 0;

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

        // === ATTACK INPUT ===
        if (Phaser.Input.Keyboard.JustDown(this.wasd.Q) && !this.isAttacking) {
            this.isAttacking = true;
            this.player.setVelocity(0, 0);
            
            // Play thrust animation
            this.player.anims.play(`${this.playerSex}-${this.playerGear}-${this.playerWeapon}-thrust-${this.lastDirection}`, true);
            
            // Create spell effect
            const spell = this.add.sprite(this.player.x + this.oldvx/10, this.player.y + this.oldvy/10, 'music').setScale(0.5).setOrigin(0.5, 0.5);
            spell.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            spell.play('cast');
            this.tweens.add({
                targets: spell,
                x: spell.x + this.oldvx/3,
                y: spell.y + this.oldvy/3,
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
