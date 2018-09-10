"use strict";
var monoloco;
(function (monoloco) {
    var core;
    (function (core) {
        core.gameConstants = {
            INIT_MANGO_NUM: 10,
            INIT_MANGO_POS: [[]],
            GAME_WIDTH: 1920,
            GAME_HEIGHT: 1080,
        };
    })(core = monoloco.core || (monoloco.core = {}));
})(monoloco || (monoloco = {}));
/// <reference path="../../lib/phaser.d.ts" />
/// <reference path="interfaces.ts" />
/**
 * Prefer to put modules into namespaces
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
        // Create an array to store key -> sprite pair
        var spriteArray = {};
        var mangoSpriteArray = [];
        // Preload of the default state. It is used to load all needed resources
        function preload() {
            core.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            // Load all assets here
            core.game.load.image("Ground", "../../res/images/Ground.png");
            core.game.load.image("Mango", "../../res/images/Mango.png");
            core.game.load.image("Tree", "../../res/images/Tree.png");
            core.game.load.image("Boy", "../../res/images/Boy.png");
            core.game.load.image("Stone", "../../res/images/Stone.png");
        }
        // Create function creates the layout 
        function create() {
            // Create a mainContainer which contains all the visible elements.
            // It makes it easy to debug
            core.game.stage.width = core.gameConstants.GAME_WIDTH;
            core.game.stage.height = core.gameConstants.GAME_HEIGHT;
            core.mainContainer = new Phaser.Group(core.game, core.game.stage, "mainContainer", false);
            core.mainContainer.width = core.gameConstants.GAME_WIDTH;
            core.mainContainer.height = core.gameConstants.GAME_HEIGHT;
            spriteArray.groundSprite = new Phaser.Sprite(core.game, wInPerc(0), hInPerc(80), "Ground");
            spriteArray.groundSprite.name = "Ground";
            spriteArray.groundSprite.width = core.gameConstants.GAME_WIDTH;
            spriteArray.groundSprite.height = hInPerc(20);
            spriteArray.treeSprite = new Phaser.Sprite(core.game, wInPerc(100), hInPerc(100), "Tree");
            spriteArray.treeSprite.name = "Tree";
            spriteArray.treeSprite.scale.setTo(1.2);
            spriteArray.treeSprite.anchor.setTo(1, 1);
            spriteArray.boySprite = new Phaser.Sprite(core.game, wInPerc(5), hInPerc(100), "Boy");
            spriteArray.boySprite.name = "Boy";
            spriteArray.boySprite.scale.setTo(0.5);
            spriteArray.boySprite.anchor.setTo(0, 1);
            spriteArray.stoneSprite = new Phaser.Sprite(core.game, 0, 0, "Stone");
            spriteArray.stoneSprite.name = "Stone";
            spriteArray.stoneSprite.scale.setTo(0.3);
            spriteArray.stoneSprite.anchor.setTo(0.5);
            spriteArray.stoneSprite.visible = false;
            core.mainContainer.addChild(spriteArray.groundSprite);
            core.mainContainer.addChild(spriteArray.treeSprite);
            core.mainContainer.addChild(spriteArray.boySprite);
            core.mainContainer.addChild(spriteArray.stoneSprite);
            // A container to store mangoes.
            // Convenient, so that we don't have to worry about positioning anymore
            var mangoContainer = new Phaser.Group(core.game, core.mainContainer, "mangoContainer");
            mangoContainer.x = spriteArray.treeSprite.left + spriteArray.treeSprite.width * 0.1;
            mangoContainer.y = spriteArray.treeSprite.top + spriteArray.treeSprite.height * 0.1;
            for (var i = 0; i < core.gameConstants.INIT_MANGO_NUM; i++) {
                // mangoes will be randomly positioned
                var p = new Phaser.Point();
                var tempMangoSprite = new Phaser.Sprite(core.game, 0, 0, "Mango");
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
            core.mainContainer.addChild(mangoContainer);
        }
        function update() {
            // TODO
            core.mainContainer.scale.set(innerWidth / core.gameConstants.GAME_WIDTH);
        }
        function wInPerc(num) {
            return num / 100 * core.gameConstants.GAME_WIDTH;
        }
        function hInPerc(num) {
            return num / 100 * core.gameConstants.GAME_HEIGHT;
        }
    })(core = monoloco.core || (monoloco.core = {}));
})(monoloco || (monoloco = {}));
