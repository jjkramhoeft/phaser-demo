import { Scene } from 'phaser';

export class Demo5 extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    exit_text: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Demo5');
    }
    
    preload(){
        //Load player walk animation 4 rows of 9 frames each, total 36 frames. (1. row- walk up, 2. row- walk right, 3. row- walk down, 4. row- walk left)
        this.load.spritesheet('player-walk', 'assets/player-walk.png', { frameWidth: 64, frameHeight: 64 });

        //Load player idle animation 4 rows of 2 frames each, total 8 frames. (1. row- idle up, 2. row- idle right, 3. row- idle down, 4. row- idle left)
        this.load.spritesheet('player-idle', 'assets/player-idle.png', { frameWidth: 64, frameHeight: 64 });
        
        //Load player attack/cast spell animation 4 rows of 8 frames each, total 32 frames. (1. row- walk up, 2. row- walk right, 3. row- walk down, 4. row- walk left)
        this.load.spritesheet('player-attack', 'assets/player-attack.png', { frameWidth: 64, frameHeight: 64 });

        //Load player death animation 1 rows of 6 frames. 
        this.load.spritesheet('player-death', 'assets/player-death.png', { frameWidth: 64, frameHeight: 64 });
        
        //Load spell visual effect animation 1 row of 11 frames.
        this.load.spritesheet('spellVisualFx', 'assets/music11.png', { frameWidth: 150, frameHeight: 150 });   
        
        //Load sound for spell casting and footsteps.
        this.load.audio('spellSoundFx', 'assets/spell1.wav');
        this.load.audio('stepsSoundFx', 'assets/stepps2.wav');

        //Create player animations for all directions walking.
        this.anims.create({ key: 'player-walk-up', frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'player-walk-right', frames: this.anims.generateFrameNumbers('player-walk', { start: 9, end: 17 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'player-walk-down', frames: this.anims.generateFrameNumbers('player-walk', { start: 18, end: 26 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'player-walk-left', frames: this.anims.generateFrameNumbers('player-walk', { start: 27, end: 35 }), frameRate: 10, repeat: -1 });

        //Create player animations for all directions idle.
        this.anims.create({ key: 'player-idle-up', frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 1 }), frameRate: 2, repeat: -1 });
        this.anims.create({ key: 'player-idle-right', frames: this.anims.generateFrameNumbers('player-idle', { start: 2, end: 3 }), frameRate: 2, repeat: -1 });
        this.anims.create({ key: 'player-idle-down', frames: this.anims.generateFrameNumbers('player-idle', { start: 4, end: 5 }), frameRate: 2, repeat: -1 });
        this.anims.create({ key: 'player-idle-left', frames: this.anims.generateFrameNumbers('player-idle', { start: 6, end: 7 }), frameRate: 2, repeat: -1 });

        //Create player animations for all directions attack or spellcasting.
        this.anims.create({ key: 'player-attack-up', frames: this.anims.generateFrameNumbers('player-attack', { start: 0, end: 7 }), frameRate: 10, repeat: 0 });
        this.anims.create({ key: 'player-attack-right', frames: this.anims.generateFrameNumbers('player-attack', { start: 8, end: 15 }), frameRate: 10, repeat: 0 });
        this.anims.create({ key: 'player-attack-down', frames: this.anims.generateFrameNumbers('player-attack', { start: 16, end: 23 }), frameRate: 10, repeat: 0 });
        this.anims.create({ key: 'player-attack-left', frames: this.anims.generateFrameNumbers('player-attack', { start: 24, end: 31 }), frameRate: 10, repeat: 0 });

        //Create player animations for dieing.
        this.anims.create({ key: 'player-death', frames: this.anims.generateFrameNumbers('player-death', { start: 0, end: 5 }), frameRate: 10, repeat: 0 });

    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.msg_text = this.add.text(0, 0, 'Demo 5', {
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
    }

    update() {

    }
}
