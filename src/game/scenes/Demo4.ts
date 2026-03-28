import { Scene } from 'phaser';

export class Demo4 extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    exit_text: Phaser.GameObjects.Text;
    bgMusic: Phaser.Sound.BaseSound;
    spell1Sound: Phaser.Sound.BaseSound;
    spell2Sound: Phaser.Sound.BaseSound;
    spell3Sound: Phaser.Sound.BaseSound;
    bgMusicVolume: number = 0.5;

    constructor ()
    {
        super('Demo4');
    }

    preload() {
    // Phaser will try to load the OGG first; if it can't, it falls back to MP3
    this.load.audio('bg_music1', ['assets/music1.ogg', 'assets/music1.mp3']);
    this.load.audio('bg_music2', ['assets/music2.ogg', 'assets/music2.mp3']);
    this.load.audio('bg_music3', ['assets/music3.ogg', 'assets/music3.mp3']);
    this.load.audio('bg_music4', ['assets/music4.ogg', 'assets/music4.mp3']);
    this.load.audio('bg_music5', ['assets/music5.ogg', 'assets/music5.mp3']);
    
    // Short magic spell effect is fine as a WAV
    this.load.audio('summon_sfx1', 'assets/spell1.wav');
    this.load.audio('summon_sfx2', 'assets/spell2.wav');
    this.load.audio('summon_sfx3', 'assets/spell3.wav');
}

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);
        const centerX = this.cameras.main.centerX;

        // Tilføj musikken til spillet
        this.bgMusic = this.sound.add('bg_music1', { 
            volume: this.bgMusicVolume, 
            loop: true 
        });

        // Start musikken med det samme
        this.bgMusic.play();

        // Gør lydeffekten klar
        this.spell1Sound = this.sound.add('summon_sfx1', { volume: 1.0 });
        this.spell2Sound = this.sound.add('summon_sfx2', { volume: 0.7 });
        this.spell3Sound = this.sound.add('summon_sfx3', { volume: 0.4 });

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.msg_text = this.add.text(0, 0, 'Demo 4', {
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
            this.bgMusic.stop(); // Stop musikken, hvis den spiller
            this.scene.start('MainMenu');
        });

        // Helper function to create a nice button
        const createButton = (y: number, x: number, text: string, callback: () => void) => {
            const button = this.add.text(centerX + 290 + x * 120, 50 + y * 45, text, {
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

        
        createButton(0,1, 'No Music', () => {
            this.switchMusic('');
        });
        createButton(1,1, 'Music 1', () => {
            this.switchMusic('bg_music1');
        });
        createButton(2,1, 'Music 2', () => {
             this.switchMusic('bg_music2');
        });
        createButton(3,1, 'Music 3', () => {
             this.switchMusic('bg_music3');
        });
        createButton(4,1, 'Music 4', () => {
             this.switchMusic('bg_music4');
        });
        createButton(5,1, 'Music 5', () => {
             this.switchMusic('bg_music5');
        });

        createButton(0,0, 'Vol. 5%', () => {
            this.bgMusicVolume = 0.05;
        });
        createButton(1,0, 'Vol. 20%', () => {
            this.bgMusicVolume = 0.20;
        });
        createButton(2,0, 'Vol. 60%', () => {
            this.bgMusicVolume = 0.6;
        });
        createButton(3,0, 'Vol.100%', () => {
            this.bgMusicVolume = 1.0;
        });

        createButton(0,-3, 'Spell 1', () => {
           this.spell1Sound.play();
        });
        createButton(1,-3, 'spell 2', () => {
            this.spell2Sound.play();
        });
        createButton(2,-3, 'Spell 3', () => {
            this.spell3Sound.play();
        });

        
    }

    private switchMusic(newKey: string) {
            // 1. Stop altid det nuværende track, hvis det findes
            if (this.bgMusic && this.bgMusic.isPlaying) {
                this.bgMusic.stop();
                //this.bgMusic.destroy(); 
            }

            // 2. Tjek om der overhovedet er et nyt nummer, der skal spilles
            if (newKey) {
                // Opret og start det nye track
                this.bgMusic = this.sound.add(newKey, { 
                    loop: true, 
                    volume: this.bgMusicVolume 
                });
                this.bgMusic.play();
            } else {
                // Hvis newKey er null eller tom, forbliver der stille
                this.bgMusic.stop();
            }
        }
}
