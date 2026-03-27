import { Scene } from 'phaser';

export function createAnimations(scene: Scene) {
    const anims = scene.anims;
    const sexes =['male','female'];
    const gears = ['nude','bare','basic','armor'];
    const weapons = ['none','dagger','staff','sword'];

    // Create basic directional walk animations (8 frames per row)
    // Sprite sheet layout: row 0 = up, row 1 = left, row 2 = down, row 3 = right  
    sexes.forEach(sex => {
        gears.forEach(gear => {
            weapons.forEach(weapon => {
                anims.create({ key: `${sex}-${gear}-${weapon}-walk-up`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
                anims.create({ key: `${sex}-${gear}-${weapon}-walk-left`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 9, end: 17}), frameRate: 10, repeat: -1 });
                anims.create({ key: `${sex}-${gear}-${weapon}-walk-down`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 18, end: 26 }), frameRate: 10, repeat: -1 });
                anims.create({ key: `${sex}-${gear}-${weapon}-walk-right`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 27, end: 35 }), frameRate: 10, repeat: -1 });    
            });
        });        
    });
     
    // Create basic directional attack animations (6 frames per row)
    // Sprite sheet layout: row 0 = up, row 1 = left, row 2 = down, row 3 = right
    sexes.forEach(sex => {
        gears.forEach(gear => {            
            const weapons = ['none','dagger','staff'];
            weapons.forEach(weapon => {
                anims.create({ key: `${sex}-${gear}-${weapon}-thrust-up`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 0, end: 7 }), frameRate: 14, repeat: 1 });
                anims.create({ key: `${sex}-${gear}-${weapon}-thrust-left`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 8, end: 15 }), frameRate: 14, repeat: 1 });
                anims.create({ key: `${sex}-${gear}-${weapon}-thrust-down`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 16, end: 23 }), frameRate: 14, repeat: 1 });
                anims.create({ key: `${sex}-${gear}-${weapon}-thrust-right`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 24, end: 31 }), frameRate: 14, repeat: 1 });    
            });
            let weapon='sword';
            anims.create({ key: `${sex}-${gear}-${weapon}-thrust-up`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 0, end: 5 }), frameRate: 14, repeat: 1 });
            anims.create({ key: `${sex}-${gear}-${weapon}-thrust-left`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 6, end: 11 }), frameRate: 14, repeat: 1 });
            anims.create({ key: `${sex}-${gear}-${weapon}-thrust-down`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 12, end: 17 }), frameRate: 14, repeat: 1 });
            anims.create({ key: `${sex}-${gear}-${weapon}-thrust-right`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 18, end: 23 }), frameRate: 14, repeat: 1 });    
        });        
    });

    // Idle = first two frames of each direction
    sexes.forEach(sex => {
        gears.forEach(gear => {
            weapons.forEach(weapon => {
                anims.create({ key: `${sex}-${gear}-${weapon}-idle-up`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-idle`, { start: 0, end: 1 }), frameRate: 4, repeat: -1 });
                anims.create({ key: `${sex}-${gear}-${weapon}-idle-left`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-idle`, { start: 2, end: 3 }), frameRate: 4, repeat: -1 });
                anims.create({ key: `${sex}-${gear}-${weapon}-idle-down`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-idle`, { start: 4, end: 5 }), frameRate: 4, repeat: -1 });
                anims.create({ key: `${sex}-${gear}-${weapon}-idle-right`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-idle`, { start: 6, end: 7 }), frameRate: 4, repeat: -1 });    
            });
        });        
    });

    // commen magic
    anims.create({ key: 'cast', frames: anims.generateFrameNumbers('music', { start: 0, end: 5 }), frameRate: 8, repeat: 0 });
}
