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
    let line: Phaser.Graphics;
    let isStoneDragging: boolean = false;
    let isStoneReleased: boolean = false;
    let defaultStonePosX: number;
    let defaultStonePosY: number;

    // Preload of the default state. It is used to load all needed resources
    function preload(): void {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // Load all assets here
        game.load.image("Sky", "../../res/images/Sky.png");
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
        // Resize the game container as size changes
        mainContainer.scale.set(Math.min(innerWidth / core.gameConstants.GAME_WIDTH, innerHeight / core.gameConstants.GAME_HEIGHT));

        spriteArray.skySprite = new Phaser.Sprite(game, wInPerc(0), hInPerc(0), "Sky");
        spriteArray.skySprite.name = "Sky";
        spriteArray.skySprite.width = core.gameConstants.GAME_WIDTH;
        spriteArray.skySprite.alpha = 0.7;
        spriteArray.skySprite.height = core.gameConstants.GAME_HEIGHT;

        spriteArray.groundSprite = new Phaser.Sprite(game, wInPerc(0), hInPerc(80), "Ground");
        spriteArray.groundSprite.name = "Ground";
        spriteArray.groundSprite.width = core.gameConstants.GAME_WIDTH;
        spriteArray.groundSprite.height = hInPerc(20);

        spriteArray.treeSprite = new Phaser.Sprite(game, wInPerc(103), hInPerc(100), "Tree");
        spriteArray.treeSprite.name = "Tree";
        spriteArray.treeSprite.scale.setTo(1.3, 1.5);
        spriteArray.treeSprite.anchor.setTo(1, 1);

        spriteArray.boySprite = new Phaser.Sprite(game, wInPerc(8), hInPerc(95), "Boy");
        spriteArray.boySprite.name = "Boy";
        spriteArray.boySprite.scale.setTo(0.6);
        spriteArray.boySprite.anchor.setTo(0, 1);

        spriteArray.stoneSprite = new Phaser.Sprite(game, spriteArray.boySprite.left + 10, spriteArray.boySprite.top + 70, "Stone");
        spriteArray.stoneSprite.name = "Stone";
        spriteArray.stoneSprite.scale.setTo(0.3);
        spriteArray.stoneSprite.anchor.setTo(0.5);
        spriteArray.stoneSprite.inputEnabled = true;
        spriteArray.stoneSprite.input.enableDrag(true);
        defaultStonePosX = spriteArray.stoneSprite.x;
        defaultStonePosY = spriteArray.stoneSprite.y;

        mainContainer.addChild(spriteArray.skySprite);
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
            tempMangoSprite.x = Math.floor(Math.random() * spriteArray.treeSprite.width * 0.8);
            if (tempMangoSprite.x < spriteArray.treeSprite.width * 0.5) {
                tempMangoSprite.y = spriteArray.treeSprite.height * 0.5 - Math.floor(Math.random() * tempMangoSprite.x);
            }
            else {
                tempMangoSprite.y = spriteArray.treeSprite.height * 0.5 - Math.floor(Math.random() * (spriteArray.treeSprite.width - tempMangoSprite.x));
            }
            tempMangoSprite.anchor.set(0.5);
            tempMangoSprite.width = 50;
            tempMangoSprite.height = 50;
            tempMangoSprite.name = "Mango_" + (i + 1);
            mangoSpriteArray.push(tempMangoSprite);
            mangoContainer.addChild(tempMangoSprite);
        }
        mainContainer.addChild(mangoContainer);

        line = new Phaser.Graphics(game);
        line.lineStyle(10, 0xFF0000, 0.9);

        mainContainer.addChild(line);
        // Add event listener to stone
        spriteArray.stoneSprite.events.onInputDown.add(() => {
            isStoneDragging = true;
        });

        spriteArray.stoneSprite.events.onInputUp.add(() => {
            isStoneDragging = false;
            isStoneReleased = true;
        })

    }

    function update(): void {

        if (isStoneDragging) {
            line.clear();
            line.lineStyle(5, 0xFF0000, 0.9);

            line.moveTo(defaultStonePosX, defaultStonePosY);
            line.lineTo(spriteArray.stoneSprite.x, spriteArray.stoneSprite.y);
            let angle = Phaser.Point.angle(spriteArray.stoneSprite.position, new Phaser.Point(defaultStonePosX, defaultStonePosY));
            spriteArray.stoneSprite.bringToTop();
        }

        if (isStoneReleased) {

        }
    }

    function wInPerc(num: number): number {
        return (num / 100) * core.gameConstants.GAME_WIDTH;
    }
    function hInPerc(num: number): number {
        return (num / 100) * core.gameConstants.GAME_HEIGHT;
    }
}


// var game, bmd, DemoState;
// var line, graphics;

// function DemoState() { }

// DemoState.prototype.preload = function () { };

// DemoState.prototype.create = function () {
//     game.stage.setBackgroundColor(0x333333);

//     bmd = game.add.bitmapData(400, 400);
//     bmd.ctx.strokeStyle = 'rgba(0, 255, 200, 1)';
//     bmd.ctx.lineWidth = 20;
//     bmd.ctx.lineCap = "round";
//     game.add.sprite(0, 0, bmd);

//     // http://www.html5gamedevs.com/topic/30063-setting-the-color-and-width-of-a-phaser-line/#comment-172589
//     line = new Phaser.Line(0, 0, 100, 100);
//     graphics = game.add.graphics(200, 200);
//     // graphics = game.add.graphics(line.start.x, line.start.y);
//     graphics.lineStyle(10, 0xffd900, 1);
//     graphics.moveTo(line.start.x, line.start.y);
//     graphics.lineTo(line.end.x, line.end.y);
//     graphics.endFill();
// };

// DemoState.prototype.update = function () {
//     bmd.clear();
//     bmd.ctx.beginPath();
//     bmd.ctx.moveTo(200, 200);
//     bmd.ctx.lineTo(game.input.x, game.input.y);
//     bmd.ctx.stroke();
//     bmd.render();
// };

// window.onload = function () {
//     game = new Phaser.Game(400, 400, Phaser.AUTO, "phaser-demo");
//     game.state.add("demo", DemoState);
//     game.state.start("demo");
// };
