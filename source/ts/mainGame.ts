/// <reference path="interfaces.ts" />
/**
 * Prefer to put modules into namespaces
 */
namespace monoloco.core {

    // Create the config. This contains the details of the game properties
    let config: Phaser.IGameConfig = {
        renderer: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        canvasId: "mainCanvas",
        enableDebug: true,
        state: {
            preload: preload,
            create: create,
            update: update
        }
    }

    // Create the game
    export let game = new Phaser.Game(config);

    // Create an array to store key -> sprite pair
    let spriteArray: spriteObj = {};
    let mangoSpriteArray: Array<Phaser.Sprite> = [];
    export let mainContainer: Phaser.Group;

    // Preload of the default state. It is used to load all needed resources
    function preload(): void {
        // TODO: Remove scaling later
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        // Load all assets here
        game.load.image("Mango", "../../res/images/Mango.png");
        game.load.image("Tree", "../../res/images/Tree.png");
        game.load.image("Boy", "../../res/images/Boy.png");
        game.load.image("Stone", "../../res/images/Stone.png");
    }

    // Create function creates the layout 
    function create(): void {
        // Create a mainContainer which contains all the visible elements.
        // It makes it easy to debug
        mainContainer = new Phaser.Group(game, game.stage, "mainContainer", false);

        spriteArray.treeSprite = new Phaser.Sprite(game, 500, 100, "Tree");
        spriteArray.treeSprite.name = "Tree";
        spriteArray.treeSprite.scale.setTo(0.5);
        spriteArray.boySprite = new Phaser.Sprite(game, 100, 100, "Boy");
        spriteArray.boySprite.name = "Boy";
        spriteArray.boySprite.scale.setTo(0.3);
        spriteArray.stoneSprite = new Phaser.Sprite(game, 100, 100, "Stone");
        spriteArray.stoneSprite.name = "Stone";
        spriteArray.stoneSprite.scale.setTo(0.3);
        mainContainer.addChild(spriteArray.treeSprite);
        mainContainer.addChild(spriteArray.boySprite);
        mainContainer.addChild(spriteArray.stoneSprite);

        let mangoContainer: Phaser.Group = new Phaser.Group(game, mainContainer, "mangoContainer");
        for (let i = 0; i < gameConstants.INIT_MANGO_NUM; i++) {
            let tempMangoSprite = new Phaser.Sprite(game, 500 + 10 * i, 120 + 12 * i, "Mango");
            tempMangoSprite.width = 10;
            tempMangoSprite.height = 10;
            tempMangoSprite.name = "Mango_" + (i + 1);
            mangoSpriteArray.push(tempMangoSprite);
            mangoContainer.addChild(tempMangoSprite);
        }

    }
    function update(): void {
        // TODO
    }
}
