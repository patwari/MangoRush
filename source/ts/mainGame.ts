/// <reference path="../../lib/phaser.d.ts" />

namespace monoloco.core {
    let config: Phaser.IGameConfig = {
        renderer: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        canvasId: "mainCanvas",
        state: {
            preload: preload,
            create: create,
            update: update
        }
    }

    let game = new Phaser.Game(config);

    let mangoSprite: Phaser.Sprite;

    function preload(): void {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        game.load.image("Mango", "../../res/images/Mango.png");
        game.load.image("Tree", "../../res/images/Tree.png");
    }
    function create(): void {
        mangoSprite = game.add.sprite(10, 10, "Mango");
    }
    function update(): void {
        // TODO
    }
}
