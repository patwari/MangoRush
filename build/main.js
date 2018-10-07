"use strict";
var monoloco;
(function (monoloco) {
    var core;
    (function (core) {
        core.gameConstants = {
            INIT_MANGO_NUM: 10,
            INIT_BONUS_TIMER: 10,
            GAME_WIDTH: 1920,
            GAME_HEIGHT: 1080,
            MAX_VELOCITY: 1100,
            INIT_ACCEL: 550,
            BASE_DISTANCE: 170,
            COLLISION_DISTANCE: 70,
            MANGO_DROP_VELOCITY: 500,
            INIT_STONE_COUNT: 3,
            VALUE_PER_MANGO: 10,
            BONUS_TIMER_UNIT_DURATION: 1000
        };
    })(core = monoloco.core || (monoloco.core = {}));
})(monoloco || (monoloco = {}));
/// <reference path="../../lib/phaser.d.ts" />
/// <reference path="interfaces.ts" />
/**
 * I Prefer to put modules (game code blocks) into namespaces
 */
var monoloco;
(function (monoloco) {
    var core;
    (function (core) {
        // Create the config. This contains the details of the game properties
        var config = {
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
        };
        // Create the game
        core.game = new Phaser.Game(config);
        // Create an array to store << key -> sprite >> pair
        var spriteArray = {};
        var mangoSpriteArray;
        var line;
        var mangoContainer;
        var isStoneDragging = false;
        var isStoneReleased = false;
        var defaultStonePosX;
        var defaultStonePosY;
        var scoreboardContainer;
        var score;
        var timerBonusUntilNow = 0;
        var stoneLeft;
        var timer;
        var timerCount = core.gameConstants.INIT_BONUS_TIMER;
        var intervalId = 0;
        var mangoHitCount = 0;
        var stoneLeftCount = core.gameConstants.INIT_STONE_COUNT;
        var lastCollisionStoneLeft = -1;
        // Preload of the default state. It is used to load all needed resources
        function preload() {
            core.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            // Load all assets here
            core.game.load.image("Sky", "../../res/images/Sky.png");
            core.game.load.image("Ground", "../../res/images/Ground.png");
            core.game.load.image("Mango", "../../res/images/Mango.png");
            core.game.load.image("Tree", "../../res/images/Tree.png");
            core.game.load.image("Boy", "../../res/images/Boy.png");
            core.game.load.image("Stone", "../../res/images/Stone.png");
            core.game.load.bitmapFont('desyrel', '../res/font/desyrel.png', '../res/font/desyrel.xml');
            core.game.load.spritesheet('button', '../../res/images/buttons.png', 193, 71);
        }
        // Create function creates the layout. It's called once right after preload has loaded all the resources.
        function create() {
            // game settings
            core.game.physics.startSystem(Phaser.Physics.ARCADE);
            core.game.stage.width = core.gameConstants.GAME_WIDTH;
            core.game.stage.height = core.gameConstants.GAME_HEIGHT;
            // Create a mainContainer which contains all the visible elements.
            // It makes it easy to debug. All our blocks will be added to this main container
            core.mainContainer = new Phaser.Group(core.game, core.game.stage, "mainContainer", false);
            core.mainContainer.width = core.gameConstants.GAME_WIDTH;
            core.mainContainer.height = core.gameConstants.GAME_HEIGHT;
            // Resize the game container as size changes
            core.mainContainer.scale.set(Math.min(innerWidth / core.gameConstants.GAME_WIDTH, innerHeight / core.gameConstants.GAME_HEIGHT));
            // create all needed sprites
            spriteArray.skySprite = new Phaser.Sprite(core.game, wInPerc(0), hInPerc(0), "Sky");
            spriteArray.skySprite.name = "Sky";
            spriteArray.skySprite.width = core.gameConstants.GAME_WIDTH;
            spriteArray.skySprite.alpha = 0.7;
            spriteArray.skySprite.height = core.gameConstants.GAME_HEIGHT;
            spriteArray.groundSprite = new Phaser.Sprite(core.game, wInPerc(0), hInPerc(80), "Ground");
            spriteArray.groundSprite.name = "Ground";
            spriteArray.groundSprite.width = core.gameConstants.GAME_WIDTH;
            spriteArray.groundSprite.height = hInPerc(20);
            spriteArray.treeSprite = new Phaser.Sprite(core.game, wInPerc(103), hInPerc(100), "Tree");
            spriteArray.treeSprite.name = "Tree";
            spriteArray.treeSprite.scale.setTo(1.3, 1.5);
            spriteArray.treeSprite.anchor.setTo(1, 1);
            spriteArray.boySprite = new Phaser.Sprite(core.game, wInPerc(8), hInPerc(95), "Boy");
            spriteArray.boySprite.name = "Boy";
            spriteArray.boySprite.scale.setTo(0.6);
            spriteArray.boySprite.anchor.setTo(0, 1);
            spriteArray.stoneSprite = new Phaser.Sprite(core.game, spriteArray.boySprite.left + 10, spriteArray.boySprite.top + 70, "Stone");
            spriteArray.stoneSprite.name = "Stone";
            spriteArray.stoneSprite.scale.setTo(0.3);
            spriteArray.stoneSprite.anchor.setTo(0.5);
            spriteArray.stoneSprite.inputEnabled = true;
            spriteArray.stoneSprite.input.enableDrag(true);
            defaultStonePosX = spriteArray.stoneSprite.x;
            defaultStonePosY = spriteArray.stoneSprite.y;
            // add sprites to the mainContainer
            core.mainContainer.addChild(spriteArray.skySprite);
            core.mainContainer.addChild(spriteArray.groundSprite);
            core.mainContainer.addChild(spriteArray.treeSprite);
            core.mainContainer.addChild(spriteArray.boySprite);
            core.mainContainer.addChild(spriteArray.stoneSprite);
            // enable ARCADE mode of PHYSICS for stone 
            core.game.physics.enable(spriteArray.stoneSprite, Phaser.Physics.ARCADE);
            createMangoes();
            line = new Phaser.Graphics(core.game);
            line.lineStyle(10, 0xFF0000, 0.9);
            core.mainContainer.addChild(line);
            // add scoreboard
            scoreboardContainer = core.game.add.group(core.mainContainer, "scoreboardContainer");
            scoreboardContainer.x = 80;
            scoreboardContainer.y = 50;
            var outerRect = core.game.add.graphics(0, 0, scoreboardContainer);
            outerRect.lineStyle(5, 0x555555, 0.8);
            outerRect.beginFill(0xCCCCCC);
            outerRect.drawRoundedRect(0, 0, 300, 200, 50);
            outerRect.endFill();
            var scoreLabel = new Phaser.BitmapText(core.game, 20, 20, 'desyrel', "Score: ", 60);
            scoreboardContainer.addChild(scoreLabel);
            score = new Phaser.BitmapText(core.game, 280, 20, 'desyrel', "0", 60);
            score.anchor.set(1, 0);
            scoreboardContainer.addChild(score);
            var stoneLeftLabel = new Phaser.BitmapText(core.game, 20, 120, 'desyrel', "Left: ", 60);
            scoreboardContainer.addChild(stoneLeftLabel);
            stoneLeft = new Phaser.BitmapText(core.game, 280, 120, 'desyrel', "3", 60);
            stoneLeft.anchor.set(1, 0);
            scoreboardContainer.addChild(stoneLeft);
            // add timer
            var timerContainer = core.game.add.group(core.mainContainer, "timerContainer");
            timerContainer.position.set(80, 275);
            var timerOuterRect = core.game.add.graphics(0, 0, timerContainer);
            timerOuterRect.lineStyle(5, 0x555555, 0.8);
            timerOuterRect.beginFill(0xCCCCCC);
            timerOuterRect.drawRoundedRect(0, 0, 300, 100, 25);
            timerOuterRect.endFill();
            var timerLabel = new Phaser.BitmapText(core.game, 20, 20, 'desyrel', "Time Bonus: ", 45);
            timerContainer.addChild(timerLabel);
            timer = new Phaser.BitmapText(core.game, 280, 20, 'desyrel', "0", 45);
            timer.anchor.set(1, 0);
            timerContainer.addChild(timer);
            intervalId = setInterval(function () {
                timerCount--;
                timer.setText(timerCount.toString());
            }, core.gameConstants.BONUS_TIMER_UNIT_DURATION);
            // Add event listener to stone
            spriteArray.stoneSprite.events.onInputDown.add(function () {
                isStoneDragging = true;
            });
            spriteArray.stoneSprite.events.onInputUp.add(function () {
                if (isStoneDragging) {
                    line.clear();
                    isStoneDragging = false;
                    isStoneReleased = true;
                    stoneLeftCount--;
                    stoneLeft.setText(stoneLeftCount.toString());
                    var angle = Phaser.Point.angle(spriteArray.stoneSprite.position, new Phaser.Point(defaultStonePosX, defaultStonePosY));
                    angle = angle - Math.PI;
                    var distance = Phaser.Point.distance(spriteArray.stoneSprite.position, new Phaser.Point(defaultStonePosX, defaultStonePosY));
                    distance = distance / core.gameConstants.BASE_DISTANCE;
                    var initVelocity = core.gameConstants.MAX_VELOCITY * distance;
                    // console.log("initVel: " + initVelocity);
                    spriteArray.stoneSprite.body.acceleration.y = core.gameConstants.INIT_ACCEL;
                    spriteArray.stoneSprite.body.velocity.x = initVelocity * Math.cos(angle);
                    spriteArray.stoneSprite.body.velocity.y = initVelocity * Math.sin(angle);
                }
            });
        }
        /**
         * Update function is called every frame of the game tick, ie every 16.67ms.
         * Put all work here that needs to be done at all frames
         */
        function update() {
            // if stone is being dragged, create a line between the hand (defaultStone) and the current stone position
            if (isStoneDragging) {
                line.clear();
                line.lineStyle(5, 0xFF0000, 0.9);
                line.moveTo(defaultStonePosX, defaultStonePosY);
                line.lineTo(spriteArray.stoneSprite.x, spriteArray.stoneSprite.y);
                spriteArray.stoneSprite.bringToTop();
            }
            // when the stone has been released, check for collision and proceed accordingly
            if (isStoneReleased) {
                for (var i = 0; i < core.gameConstants.INIT_MANGO_NUM; i++) {
                    if (mangoSpriteArray[i].visible === false)
                        continue;
                    var distance = Phaser.Point.distance(spriteArray.stoneSprite.position, new Phaser.Point(mangoSpriteArray[i].x + mangoContainer.x, mangoSpriteArray[i].y + mangoContainer.y));
                    if (distance < core.gameConstants.COLLISION_DISTANCE) {
                        onCollision(i);
                    }
                }
                score.setText((10 * mangoHitCount * core.gameConstants.VALUE_PER_MANGO / core.gameConstants.INIT_MANGO_NUM + timerBonusUntilNow).toString());
            }
            if (timerCount === 0 && intervalId) {
                clearInterval(intervalId);
                intervalId = 0;
            }
            checkIfStoneOut();
        }
        /**
         * This function is called when there is any collision between stone and any of the mangoes.
         * Here we hide the actual mango, and create dummy mango on the same position which falls and gets destroyed when goes out of boundary
         * Also, we keep the mangoHitCount, and display the score accordingly
         */
        function onCollision(pos) {
            mangoSpriteArray[pos].body.velocity.y = core.gameConstants.MANGO_DROP_VELOCITY;
            mangoSpriteArray[pos].visible = false;
            var tempSprite = core.game.add.sprite(mangoSpriteArray[pos].x + mangoContainer.x, mangoContainer.y + mangoSpriteArray[pos].y, "Mango", undefined, core.mainContainer);
            tempSprite.width = 50;
            tempSprite.height = 50;
            tempSprite.anchor.set(0.5);
            core.game.physics.arcade.enable(tempSprite);
            tempSprite.checkWorldBounds = true;
            tempSprite.events.onOutOfBounds.add(function () {
                tempSprite.destroy();
            });
            tempSprite.body.velocity.y = core.gameConstants.MANGO_DROP_VELOCITY;
            mangoHitCount++;
            if (lastCollisionStoneLeft != stoneLeftCount) {
                timerBonusUntilNow += timerCount;
            }
            lastCollisionStoneLeft = stoneLeftCount;
        }
        /**
         * This function is called every frame.
         * Here we check if the stone is out the the boundary. If yes, we return it back to default position
         * Also, if all the stones has been thrown, then display the final score
         */
        function checkIfStoneOut() {
            if (spriteArray.stoneSprite.x > core.gameConstants.GAME_WIDTH || spriteArray.stoneSprite.y > core.gameConstants.GAME_HEIGHT || spriteArray.stoneSprite.x < -15 || spriteArray.stoneSprite.y < -15) {
                spriteArray.stoneSprite.body.reset(defaultStonePosX, defaultStonePosY);
                spriteArray.stoneSprite.x = defaultStonePosX;
                spriteArray.stoneSprite.y = defaultStonePosY;
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = 0;
                }
                if (stoneLeftCount === 0) {
                    showFinalScoreBoard();
                }
                else {
                    timerCount = core.gameConstants.INIT_BONUS_TIMER;
                    timer.setText(timerCount.toString());
                    intervalId = setInterval(function () {
                        timerCount--;
                        timer.setText(timerCount.toString());
                    }, core.gameConstants.BONUS_TIMER_UNIT_DURATION);
                }
            }
        }
        /**
         * This function is called when the final score needs to be displayed.
         * It creates a scoreboard, which gets destoyed on exit.
         * It has a button for PLAY AGAIN, another for exit [TODO]
         */
        function showFinalScoreBoard() {
            var w = core.gameConstants.GAME_WIDTH;
            var h = core.gameConstants.GAME_HEIGHT;
            var finalScoreContainer = core.game.add.group(core.mainContainer, "finalScoreContainer");
            finalScoreContainer.pivot.set(w * 0.5, h * 0.5);
            finalScoreContainer.position.set(w * 0.5, h * 0.5);
            var finalRect = core.game.add.graphics(0, 0, finalScoreContainer);
            finalRect.lineStyle(10, 0xAAAAAA, 0.8);
            finalRect.beginFill(0xCCCCCC);
            finalRect.drawRoundedRect(0, 0, w, h, h * 0.2);
            finalRect.endFill();
            var greetMsg = new Phaser.BitmapText(core.game, w * 0.5, h * 0.25, "desyrel", "---FINAL SCORE---", 120);
            greetMsg.anchor.set(0.5);
            finalScoreContainer.addChild(greetMsg);
            var finalScore = new Phaser.BitmapText(core.game, w * 0.5, h * 0.5, "desyrel", (10 * mangoHitCount * core.gameConstants.VALUE_PER_MANGO / core.gameConstants.INIT_MANGO_NUM + timerBonusUntilNow).toString(), 350);
            finalScore.anchor.set(0.5);
            finalScoreContainer.addChild(finalScore);
            var tweenIn = core.game.add.tween(finalScoreContainer.scale);
            tweenIn.from({ x: 0, y: 0 }, 1500, undefined, true);
            var tweenOut = core.game.add.tween(finalScoreContainer.scale);
            tweenOut.to({ x: 0, y: 0 }, 1500);
            tweenOut.onComplete.add(function () {
                finalScoreContainer.destroy();
            });
            var againButton = core.game.add.button(w * 0.35, h * 0.7, 'button', function () {
                tweenOut.start();
                resetAllValues();
            }, undefined, 2, 1, 0, 1, finalScoreContainer);
            againButton.scale.set(3);
            againButton.anchor.set(0.5, 0);
        }
        /**
         * This function is called when PLAY AGAIN button is clicked right when final scoreboard has been displaued
         * It resets all the values and re-created mangoes at random positions
         */
        function resetAllValues() {
            createMangoes();
            isStoneDragging = false;
            isStoneReleased = false;
            line.clear();
            mangoHitCount = 0;
            timerBonusUntilNow = 0;
            timerCount = core.gameConstants.INIT_BONUS_TIMER;
            stoneLeftCount = core.gameConstants.INIT_STONE_COUNT;
            score.setText(mangoHitCount.toString());
            stoneLeft.setText(stoneLeftCount.toString());
            timer.setText(timerCount.toString());
        }
        /**
         * This function will be called when the exit button is pressed when the final score board is displayed.[TODO]
         * This function will exit destroy all the resources and close the game. 0
         */
        function onExitButtonClick() {
            // TODO
        }
        /**
         * This function re-creates mangoes at random places, also resets the mangoContainer, and mangoSpriteArray
         */
        function createMangoes() {
            // A container to store mangoes.
            // Convenient, so that we don't have to worry about positioning anymore
            if (mangoContainer) {
                // when replay. destroy all children of the previously created mangoContainer.
                mangoContainer.destroy(true, true);
            }
            mangoContainer = new Phaser.Group(core.game, core.mainContainer, "mangoContainer");
            mangoContainer.x = spriteArray.treeSprite.left + spriteArray.treeSprite.width * 0.1;
            mangoContainer.y = spriteArray.treeSprite.top + spriteArray.treeSprite.height * 0.1;
            mangoSpriteArray = [];
            for (var i = 0; i < core.gameConstants.INIT_MANGO_NUM; i++) {
                // mangoes will be randomly positioned
                var p = new Phaser.Point();
                var tempMangoSprite = new Phaser.Sprite(core.game, 0, 0, "Mango");
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
                var tween = core.game.add.tween(tempMangoSprite);
                tween.to({ width: 80, height: 80 }, 1000, undefined, true, 0, 1, true);
                tempMangoSprite.name = "Mango_" + (i + 1);
                core.game.physics.arcade.enable(tempMangoSprite);
                mangoSpriteArray.push(tempMangoSprite);
                mangoContainer.addChild(tempMangoSprite);
            }
        }
        /**
         * This function returns absolute position corresponding to pecentage of GAME_WIDTH
         * @param num number to convert
         */
        function wInPerc(perc) {
            return (perc / 100) * core.gameConstants.GAME_WIDTH;
        }
        /**
         * This function returns absolute position corresponding to pecentage of GAME_HEIGHT
         */
        function hInPerc(perc) {
            return (perc / 100) * core.gameConstants.GAME_HEIGHT;
        }
    })(core = monoloco.core || (monoloco.core = {}));
})(monoloco || (monoloco = {}));
var monoloco;
(function (monoloco) {
    var core;
    (function (core) {
        var utils = /** @class */ (function () {
            function utils() {
            }
            utils.degToRad = function (deg) {
                return (deg * Math.PI / 180);
            };
            utils.radToDeg = function (rad) {
                return (rad * 180 / Math.PI);
            };
            return utils;
        }());
        core.utils = utils;
    })(core = monoloco.core || (monoloco.core = {}));
})(monoloco || (monoloco = {}));
