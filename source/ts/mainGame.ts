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
    let mangoSpriteArray: Array<Phaser.Sprite>;
    export let mainContainer: Phaser.Group;
    let line: Phaser.Graphics;
    let mangoContainer: Phaser.Group;
    let isStoneDragging: boolean = false;
    let isStoneReleased: boolean = false;
    let defaultStonePosX: number;
    let defaultStonePosY: number;
    let scoreboardContainer: Phaser.Group;
    let score: Phaser.BitmapText;
    let stoneLeft: Phaser.BitmapText;
    let mangoHitCount: number = 0;
    let stoneLeftCount: number = gameConstants.INIT_STONE_COUNT;

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
        game.load.bitmapFont('desyrel', '../res/font/desyrel.png', '../res/font/desyrel.xml');
        game.load.spritesheet('button', '../../res/images/buttons.png', 193, 71);
    }

    // Create function creates the layout 
    function create(): void {
        // Create a mainContainer which contains all the visible elements.
        // It makes it easy to debug
        game.physics.startSystem(Phaser.Physics.ARCADE);

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

        game.physics.enable(spriteArray.stoneSprite, Phaser.Physics.ARCADE);

        // A container to store mangoes.
        // Convenient, so that we don't have to worry about positioning anymore
        createMangoes();

        line = new Phaser.Graphics(game);
        line.lineStyle(10, 0xFF0000, 0.9);

        mainContainer.addChild(line);

        // add scoreboard
        scoreboardContainer = game.add.group(mainContainer, "scoreboardContainer");
        scoreboardContainer.x = 80;
        scoreboardContainer.y = 50;
        let outerRect: Phaser.Graphics = game.add.graphics(0, 0, scoreboardContainer);
        outerRect.lineStyle(5, 0x555555, 0.8);
        outerRect.beginFill(0xCCCCCC);
        outerRect.drawRoundedRect(0, 0, 300, 200, 50);
        outerRect.endFill();
        let scoreLabel = new Phaser.BitmapText(game, 20, 20, 'desyrel', "Score: ", 60);
        scoreboardContainer.addChild(scoreLabel);
        score = new Phaser.BitmapText(game, 280, 20, 'desyrel', "0", 60);
        score.anchor.set(1, 0);
        scoreboardContainer.addChild(score);
        let stoneLeftLabel = new Phaser.BitmapText(game, 20, 120, 'desyrel', "Left: ", 60);
        scoreboardContainer.addChild(stoneLeftLabel);
        stoneLeft = new Phaser.BitmapText(game, 280, 120, 'desyrel', "3", 60);
        stoneLeft.anchor.set(1, 0);
        scoreboardContainer.addChild(stoneLeft);


        // Add event listener to stone
        spriteArray.stoneSprite.events.onInputDown.add(() => {
            isStoneDragging = true;
        });

        spriteArray.stoneSprite.events.onInputUp.add(() => {
            if (isStoneDragging) {
                line.clear();
                isStoneDragging = false;
                isStoneReleased = true;
                stoneLeftCount--;
                stoneLeft.setText(stoneLeftCount.toString());

                let angle = Phaser.Point.angle(spriteArray.stoneSprite.position, new Phaser.Point(defaultStonePosX, defaultStonePosY));
                angle = angle - Math.PI;
                let distance = Phaser.Point.distance(spriteArray.stoneSprite.position, new Phaser.Point(defaultStonePosX, defaultStonePosY));
                distance = distance / gameConstants.BASE_DISTANCE;
                let initVelocity = gameConstants.MAX_VELOCITY * distance;
                // console.log("initVel: " + initVelocity);
                spriteArray.stoneSprite.body.acceleration.y = gameConstants.INIT_ACCEL;
                spriteArray.stoneSprite.body.velocity.x = initVelocity * Math.cos(angle);
                spriteArray.stoneSprite.body.velocity.y = initVelocity * Math.sin(angle);
            }
        });

    }

    function update(): void {
        if (isStoneDragging) {
            line.clear();
            line.lineStyle(5, 0xFF0000, 0.9);
            line.moveTo(defaultStonePosX, defaultStonePosY);
            line.lineTo(spriteArray.stoneSprite.x, spriteArray.stoneSprite.y);
            spriteArray.stoneSprite.bringToTop();
        }

        if (isStoneReleased) {
            for (let i = 0; i < gameConstants.INIT_MANGO_NUM; i++) {
                if (mangoSpriteArray[i].visible === false)
                    continue;
                let distance = Phaser.Point.distance(spriteArray.stoneSprite.position, new Phaser.Point(mangoSpriteArray[i].x + mangoContainer.x, mangoSpriteArray[i].y + mangoContainer.y));
                if (distance < gameConstants.COLLISION_DISTANCE) {
                    onCollision(i);
                }
            }
        }
        checkIfStoneOut();
    }

    function onCollision(pos: number): void {
        mangoSpriteArray[pos].body.velocity.y = gameConstants.MANGO_DROP_VELOCITY;
        mangoSpriteArray[pos].visible = false;
        let tempSprite = game.add.sprite(mangoSpriteArray[pos].x + mangoContainer.x, mangoContainer.y + mangoSpriteArray[pos].y, "Mango", undefined, mainContainer);
        tempSprite.width = 50;
        tempSprite.height = 50;
        tempSprite.anchor.set(0.5);
        game.physics.arcade.enable(tempSprite);
        tempSprite.checkWorldBounds = true;
        tempSprite.events.onOutOfBounds.add(() => {
            tempSprite.destroy();
        });
        tempSprite.body.velocity.y = gameConstants.MANGO_DROP_VELOCITY;

        mangoHitCount++;
        score.setText((10 * mangoHitCount * gameConstants.VALUE_PER_MANGO / gameConstants.INIT_MANGO_NUM).toString());
    }

    function checkIfStoneOut(): void {
        if (spriteArray.stoneSprite.x > gameConstants.GAME_WIDTH || spriteArray.stoneSprite.y > gameConstants.GAME_HEIGHT || spriteArray.stoneSprite.x < 0 || spriteArray.stoneSprite.y < 0) {
            spriteArray.stoneSprite.body.reset(defaultStonePosX, defaultStonePosY);
            spriteArray.stoneSprite.x = defaultStonePosX;
            spriteArray.stoneSprite.y = defaultStonePosY;
            if (stoneLeftCount === 0) {
                showFinalScoreBoard();
            }
        }
    }

    function showFinalScoreBoard(): void {
        let w = gameConstants.GAME_WIDTH;
        let h = gameConstants.GAME_HEIGHT;
        let finalScoreContainer: Phaser.Group = game.add.group(mainContainer, "finalScoreContainer");
        finalScoreContainer.pivot.set(w * 0.5, h * 0.5);
        finalScoreContainer.position.set(w * 0.5, h * 0.5);

        let finalRect: Phaser.Graphics = game.add.graphics(0, 0, finalScoreContainer);
        finalRect.lineStyle(10, 0xAAAAAA, 0.8);
        finalRect.beginFill(0xCCCCCC);
        finalRect.drawRoundedRect(0, 0, w, h, h * 0.2);
        finalRect.endFill();

        let greetMsg = new Phaser.BitmapText(game, w * 0.5, h * 0.25, "desyrel", "---FINAL SCORE---", 120);
        greetMsg.anchor.set(0.5);
        finalScoreContainer.addChild(greetMsg);
        let finalScore = new Phaser.BitmapText(game, w * 0.5, h * 0.5, "desyrel", (10 * mangoHitCount * gameConstants.VALUE_PER_MANGO / gameConstants.INIT_MANGO_NUM).toString(), 350);
        finalScore.anchor.set(0.5);
        finalScoreContainer.addChild(finalScore);
        let tweenIn = game.add.tween(finalScoreContainer.scale);
        tweenIn.from({ x: 0, y: 0 }, 1500, undefined, true);

        let tweenOut = game.add.tween(finalScoreContainer.scale);
        tweenOut.to({ x: 0, y: 0 }, 1500);
        tweenOut.onComplete.add(() => {
            finalScoreContainer.destroy();
        });

        let againButton = game.add.button(w * 0.35, h * 0.7, 'button', () => {
            resetAllValues();
            tweenOut.start();
        }, undefined, 2, 1, 0, 1, finalScoreContainer);
        againButton.scale.set(3);
        againButton.anchor.set(0.5, 0);

    }

    function resetAllValues(): void {
        createMangoes();
        isStoneDragging = false;
        isStoneReleased = false;
        line.clear();
        mangoHitCount = 0;
        stoneLeftCount = gameConstants.INIT_STONE_COUNT;
        score.setText(mangoHitCount.toString());
        stoneLeft.setText(stoneLeftCount.toString());
    }

    function onExitButtonClick(): void {

    }

    function createMangoes(): void {
        if (mangoContainer) {
            mangoContainer.destroy(true, true);
        }
        mangoContainer = new Phaser.Group(game, mainContainer, "mangoContainer");
        mangoContainer.x = spriteArray.treeSprite.left + spriteArray.treeSprite.width * 0.1;
        mangoContainer.y = spriteArray.treeSprite.top + spriteArray.treeSprite.height * 0.1;

        mangoSpriteArray = [];

        for (let i = 0; i < gameConstants.INIT_MANGO_NUM; i++) {
            // mangoes will be randomly positioned
            let p = new Phaser.Point();
            let tempMangoSprite: Phaser.Sprite = new Phaser.Sprite(game, 0, 0, "Mango");
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
            game.physics.arcade.enable(tempMangoSprite);

            mangoSpriteArray.push(tempMangoSprite);
            mangoContainer.addChild(tempMangoSprite);
        }
    }

    function wInPerc(num: number): number {
        return (num / 100) * core.gameConstants.GAME_WIDTH;
    }
    function hInPerc(num: number): number {
        return (num / 100) * core.gameConstants.GAME_HEIGHT;
    }
}
