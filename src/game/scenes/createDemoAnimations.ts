import { Scene } from 'phaser';

export function createDemoAnimations(scene: Scene) {
    const anims = scene.anims;
    if(anims.exists('player-walk-up')) return; // Animations already created, skip.
    
    // Create basic directional walk animations (8 frames per row)
        // Sprite sheet layout: row 0 = up, row 1 = left, row 2 = down, row 3 = right
        //male-armor-sword-walk
        anims.create({
            key: 'player-walk-up',
            frames: anims.generateFrameNumbers('player-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        anims.create({
            key: 'player-walk-left',
            frames: anims.generateFrameNumbers('player-walk', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
        anims.create({
            key: 'player-walk-down',
            frames: anims.generateFrameNumbers('player-walk', { start: 26, end: 33 }),
            frameRate: 10,
            repeat: -1
        });
        anims.create({
            key: 'player-walk-right',
            frames: anims.generateFrameNumbers('player-walk', { start: 39, end: 46 }),
            frameRate: 10,
            repeat: -1
        });
        // Death animation
        anims.create({
            key: 'player-death',
            frames: anims.generateFrameNumbers('player-death', { start: 0, end: 5 }),
            frameRate: 14,
            repeat: -1
        });
        // Idle = first frame of each direction
        anims.create({ key: 'player-idle-up', frames: [{ key: 'player-walk', frame: 0 }], frameRate: 10 });
        anims.create({ key: 'player-idle-left', frames: [{ key: 'player-walk', frame: 13 }], frameRate: 10 });
        anims.create({
            key: 'player-idle-down',
            frames: anims.generateFrameNumbers('player-walk', { start: 26, end: 27 }),
            frameRate: 2,
            repeat: -1
        });
        anims.create({
            key: 'player-idle-right',
            frames: anims.generateFrameNumbers('player-walk', { start: 39, end: 40 }),
            frameRate: 2,
            repeat: -1
        });
}
