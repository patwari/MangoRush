/// <reference path="interfaces.ts" />
/**
 * Prefer to put modules into namespaces
 */
namespace monoloco.core {

    // Create the config. This contains the details of the game properties
    let config: Phaser.IGameConfig = {
        renderer: Phaser.AUTO,
        width: innerWidth,
        height: innerHeight,
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
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // Load all assets here
        game.load.image("Ground", "../../res/images/Ground.png");
        game.load.image("Mango", "../../res/images/Mango.png");
        game.load.image("Tree", "../../res/images/Tree.png");
        game.load.image("Boy", "../../res/images/Boy.png");
        game.load.image("Stone", "../../res/images/Stone.png");
    }

    // Create function creates the layout 
    function create(): void {
        // Create a mainContainer which contains all the visible elements.
        // It makes it easy to debug
        game.stage.width = core.gameConstants.GAME_WIDTH;
        game.stage.height = core.gameConstants.GAME_HEIGHT;
        mainContainer = new Phaser.Group(game, game.stage, "mainContainer", false);
        mainContainer.width = core.gameConstants.GAME_WIDTH;
        mainContainer.height = core.gameConstants.GAME_HEIGHT;

        spriteArray.groundSprite = new Phaser.Sprite(game, wInPerc(0), hInPerc(80), "Ground");
        spriteArray.groundSprite.name = "Ground";
        spriteArray.groundSprite.width = core.gameConstants.GAME_WIDTH;
        spriteArray.groundSprite.height = hInPerc(20);

        spriteArray.treeSprite = new Phaser.Sprite(game, wInPerc(100), hInPerc(100), "Tree");
        spriteArray.treeSprite.name = "Tree";
        spriteArray.treeSprite.scale.setTo(1.2);
        spriteArray.treeSprite.anchor.setTo(1, 1);

        spriteArray.boySprite = new Phaser.Sprite(game, wInPerc(5), hInPerc(100), "Boy");
        spriteArray.boySprite.name = "Boy";
        spriteArray.boySprite.scale.setTo(0.5);
        spriteArray.boySprite.anchor.setTo(0, 1);

        spriteArray.stoneSprite = new Phaser.Sprite(game, 0, 0, "Stone");
        spriteArray.stoneSprite.name = "Stone";
        spriteArray.stoneSprite.scale.setTo(0.3);
        spriteArray.stoneSprite.anchor.setTo(0.5);
        spriteArray.stoneSprite.visible = false;

        mainContainer.addChild(spriteArray.groundSprite);
        mainContainer.addChild(spriteArray.treeSprite);
        mainContainer.addChild(spriteArray.boySprite);
        mainContainer.addChild(spriteArray.stoneSprite);

        // A container to store mangoes.
        // Convenient, so that we don't have to worry about positioning anymore
        let mangoContainer: Phaser.Group = new Phaser.Group(game, mainContainer, "mangoContainer");
        mangoContainer.x = spriteArray.treeSprite.left + spriteArray.treeSprite.width * 0.1;
        mangoContainer.y = spriteArray.treeSprite.top + spriteArray.treeSprite.height * 0.1;

        for (let i = 0; i < gameConstants.INIT_MANGO_NUM; i++) {
            // mangoes will be randomly positioned
            let p = new Phaser.Point();
            let tempMangoSprite = new Phaser.Sprite(game, 0, 0, "Mango");
            // tempMangoSprite.x = spriteArray.treeSprite.left + (spriteArray.treeSprite.width * 0.1) + Math.floor(Math.random() * spriteArray.treeSprite.width * 0.8);
            // tempMangoSprite.y = tempMangoSprite.x + Math.min(tempMangoSprite.left - spriteArray.treeSprite.left, spriteArray.treeSprite.right - tempMangoSprite.left);
            tempMangoSprite.x = Math.floor(Math.random() * spriteArray.treeSprite.width * 0.8);
            if (tempMangoSprite.x < spriteArray.treeSprite.width * 0.5) {
                tempMangoSprite.y = spriteArray.treeSprite.height * 0.5 - Math.floor(Math.random() * tempMangoSprite.x * 0.8);
            }
            else {
                tempMangoSprite.y = spriteArray.treeSprite.height * 0.5 - Math.floor(Math.random() * (spriteArray.treeSprite.width - tempMangoSprite.x) * 0.8);
            }
            tempMangoSprite.anchor.set(0.5);
            tempMangoSprite.width = 50;
            tempMangoSprite.height = 50;
            tempMangoSprite.name = "Mango_" + (i + 1);
            mangoSpriteArray.push(tempMangoSprite);
            mangoContainer.addChild(tempMangoSprite);
        }
        mainContainer.addChild(mangoContainer);

    }
    function update(): void {
        // TODO
        mainContainer.scale.set(innerWidth / core.gameConstants.GAME_WIDTH);

    }

    function wInPerc(num: number): number {
        return num / 100 * core.gameConstants.GAME_WIDTH;
    }
    function hInPerc(num: number): number {
        return num / 100 * core.gameConstants.GAME_HEIGHT;
    }
}
