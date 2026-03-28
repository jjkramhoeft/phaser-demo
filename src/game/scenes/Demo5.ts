import { Scene } from 'phaser';

type Direction = 'up' | 'down' | 'left' | 'right';

export class Demo5 extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    exit_text: Phaser.GameObjects.Text;
    spellSoundFx: Phaser.Sound.BaseSound;
    stepsSoundFx: Phaser.Sound.BaseSound;

    private player!: Phaser.Physics.Arcade.Sprite;
    private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
    private castKey!: Phaser.Input.Keyboard.Key;

    private readonly moveSpeed = 180;
    private readonly footstepDistance = 90;
    private footstepAccumulator = 0;

    private facingDirection: Direction = 'down';
    private isCasting = false;

    constructor ()
    {
        super('Demo5');
    }
    
    preload(){
        //Load player walk animation 4 rows of 9 frames each, total 36 frames. (1. row- walk up, 2. row- walk left, 3. row- walk down, 4. row- walk right)
        this.load.spritesheet('player-walk', 'assets/player-walk.png', { frameWidth: 64, frameHeight: 64 });

        //Load player idle animation 4 rows of 2 frames each, total 8 frames. (1. row- idle up, 2. row- idle left, 3. row- idle down, 4. row- idle right)
        this.load.spritesheet('player-idle', 'assets/player-idle.png', { frameWidth: 64, frameHeight: 64 });
        
        //Load player attack/cast spell animation 4 rows of 8 frames each, total 32 frames. (1. row- walk up, 2. row- walk left, 3. row- walk down, 4. row- walk right)
        this.load.spritesheet('player-attack', 'assets/player-attack.png', { frameWidth: 64, frameHeight: 64 });

        //Load player death animation 1 rows of 6 frames. 
        this.load.spritesheet('player-death', 'assets/player-death.png', { frameWidth: 64, frameHeight: 64 });
        
        //Load spell visual effect animation 1 row of 11 frames.
        this.load.spritesheet('spellVisualFx', 'assets/music11.png', { frameWidth: 150, frameHeight: 150 });   
        
        //Load sound for spell casting and footsteps.
        this.load.audio('spellSoundFx', 'assets/spell1.wav');
        this.load.audio('stepsSoundFx', 'assets/footsteps2.wav');

        
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);
        this.camera.setBounds(0, 0, 1024, 768);

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
            this.stopAllDemoSounds();
            this.scene.start('MainMenu');
        });

        this.createPlayerAnimations();

        this.player = this.physics.add.sprite(this.camera.centerX, this.camera.centerY, 'player-idle', 4);
        this.player.setCollideWorldBounds(true);
        this.player.play('player-idle-down');

        this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as { [key: string]: Phaser.Input.Keyboard.Key };
        this.castKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.spellSoundFx = this.sound.add('spellSoundFx', { volume: 0.8 });
        this.stepsSoundFx = this.sound.add('stepsSoundFx', { volume: 0.35 });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.stopAllDemoSounds();
        });

    }

    update(_time: number, delta: number) {
        if (!this.player) {
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.castKey) && !this.isCasting) {
            this.startCasting();
        }

        if (this.isCasting) {
            this.player.setVelocity(0, 0);
            this.updateFootsteps(0, 0, delta);
            return;
        }

        const { vx, vy } = this.getMoveVelocity();
        this.player.setVelocity(vx, vy);
        this.updateMovementAnimation(vx, vy);
        this.updateFootsteps(vx, vy, delta);

    }

    private createPlayerAnimations(): void {
        this.createAnimationIfMissing('player-walk-up', 'player-walk', 0, 8, 10, -1);
        this.createAnimationIfMissing('player-walk-left', 'player-walk', 9, 17, 10, -1);
        this.createAnimationIfMissing('player-walk-down', 'player-walk', 18, 26, 10, -1);
        this.createAnimationIfMissing('player-walk-right', 'player-walk', 27, 35, 10, -1);

        this.createAnimationIfMissing('player-idle-up', 'player-idle', 0, 1, 4, -1);
        this.createAnimationIfMissing('player-idle-left', 'player-idle', 2, 3, 4, -1);
        this.createAnimationIfMissing('player-idle-down', 'player-idle', 4, 5, 4, -1);
        this.createAnimationIfMissing('player-idle-right', 'player-idle', 6, 7, 4, -1);

        this.createAnimationIfMissing('player-attack-up', 'player-attack', 0, 7, 14, 0);
        this.createAnimationIfMissing('player-attack-left', 'player-attack', 8, 15, 14, 0);
        this.createAnimationIfMissing('player-attack-down', 'player-attack', 16, 23, 14, 0);
        this.createAnimationIfMissing('player-attack-right', 'player-attack', 24, 31, 14, 0);

        this.createAnimationIfMissing('player-death', 'player-death', 0, 5, 10, 0);
        this.createAnimationIfMissing('spell-fx', 'spellVisualFx', 0, 10, 18, 0);
    }

    private createAnimationIfMissing(
        key: string,
        texture: string,
        start: number,
        end: number,
        frameRate: number,
        repeat: number
    ): void {
        if (this.anims.exists(key)) {
            return;
        }

        this.anims.create({
            key,
            frames: this.anims.generateFrameNumbers(texture, { start, end }),
            frameRate,
            repeat
        });
    }

    private getMoveVelocity(): { vx: number; vy: number } {
        let vx = 0;
        let vy = 0;

        if (this.wasd.A.isDown) {
            vx -= this.moveSpeed;
        }
        if (this.wasd.D.isDown) {
            vx += this.moveSpeed;
        }
        if (this.wasd.W.isDown) {
            vy -= this.moveSpeed;
        }
        if (this.wasd.S.isDown) {
            vy += this.moveSpeed;
        }

        if (vx !== 0 && vy !== 0) {
            const diagonalSpeed = this.moveSpeed / Math.sqrt(2);
            vx = vx > 0 ? diagonalSpeed : -diagonalSpeed;
            vy = vy > 0 ? diagonalSpeed : -diagonalSpeed;
        }

        return { vx, vy };
    }

    private updateMovementAnimation(vx: number, vy: number): void {
        if (vx === 0 && vy === 0) {
            this.player.play(`player-idle-${this.facingDirection}`, true);
            return;
        }

        if (Math.abs(vx) > Math.abs(vy)) {
            this.facingDirection = vx < 0 ? 'left' : 'right';
        } else {
            this.facingDirection = vy < 0 ? 'up' : 'down';
        }

        this.player.play(`player-walk-${this.facingDirection}`, true);
    }

    private startCasting(): void {
        this.isCasting = true;
        this.player.setVelocity(0, 0);

        const attackAnimationKey = `player-attack-${this.facingDirection}`;
        this.player.play(attackAnimationKey, true);
        this.spawnSpellVisual();

        this.spellSoundFx.stop();
        this.spellSoundFx.play();

        this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + attackAnimationKey, () => {
            this.isCasting = false;
            this.player.play(`player-idle-${this.facingDirection}`, true);
        });
    }

    private spawnSpellVisual(): void {
        const offset = this.getDirectionVector(this.facingDirection);
        const spell = this.add.sprite(
            this.player.x + offset.x * 36,
            this.player.y + offset.y * 36,
            'spellVisualFx'
        );
        spell.setScale(0.45);
        spell.play('spell-fx');

        this.tweens.add({
            targets: spell,
            x: spell.x + offset.x * 90,
            y: spell.y + offset.y * 90,
            duration: 250,
            ease: 'Quad.easeOut',
            onComplete: () => {
                spell.destroy();
            }
        });

        spell.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            spell.destroy();
        });
    }

    private updateFootsteps(vx: number, vy: number, delta: number): void {
        if (vx === 0 && vy === 0) {
            this.footstepAccumulator = 0;
            this.stepsSoundFx.stop();
            return;
        }

        const speed = Math.sqrt(vx * vx + vy * vy);
        const distanceTraveled = speed * (delta / 1000);
        this.footstepAccumulator += distanceTraveled;

        if (this.footstepAccumulator >= this.footstepDistance) {
            if (!this.stepsSoundFx.isPlaying) {
                this.stepsSoundFx.play();
            }
            this.footstepAccumulator = 0;
        }
    }

    private getDirectionVector(direction: Direction): { x: number; y: number } {
        switch (direction) {
            case 'up':
                return { x: 0, y: -1 };
            case 'down':
                return { x: 0, y: 1 };
            case 'left':
                return { x: -1, y: 0 };
            default:
                return { x: 1, y: 0 };
        }
    }

    private stopAllDemoSounds(): void {
        if (this.spellSoundFx) {
            this.spellSoundFx.stop();
        }
        if (this.stepsSoundFx) {
            this.stepsSoundFx.stop();
        }

    }
}
