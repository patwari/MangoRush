"use strict";
var monoloco;
(function (monoloco) {
    var core;
    (function (core) {
        core.gameConstants = {
            INIT_MANGO_NUM: 10
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
            width: window.innerWidth,
            height: window.innerHeight,
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
            // TODO: Remove scaling later
            core.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            // Load all assets here
            core.game.load.image("Mango", "../../res/images/Mango.png");
            core.game.load.image("Tree", "../../res/images/Tree.png");
            core.game.load.image("Boy", "../../res/images/Boy.png");
            core.game.load.image("Stone", "../../res/images/Stone.png");
        }
        // Create function creates the layout 
        function create() {
            // Create a mainContainer which contains all the visible elements.
            // It makes it easy to debug
            core.mainContainer = new Phaser.Group(core.game, core.game.stage, "mainContainer", false);
            spriteArray.treeSprite = new Phaser.Sprite(core.game, 500, 100, "Tree");
            spriteArray.treeSprite.name = "Tree";
            spriteArray.treeSprite.scale.setTo(0.5);
            spriteArray.boySprite = new Phaser.Sprite(core.game, 100, 100, "Boy");
            spriteArray.boySprite.name = "Boy";
            spriteArray.boySprite.scale.setTo(0.3);
            spriteArray.stoneSprite = new Phaser.Sprite(core.game, 100, 100, "Stone");
            spriteArray.stoneSprite.name = "Stone";
            spriteArray.stoneSprite.scale.setTo(0.3);
            core.mainContainer.addChild(spriteArray.treeSprite);
            core.mainContainer.addChild(spriteArray.boySprite);
            core.mainContainer.addChild(spriteArray.stoneSprite);
            var mangoContainer = new Phaser.Group(core.game, core.mainContainer, "mangoContainer");
            for (var i = 0; i < core.gameConstants.INIT_MANGO_NUM; i++) {
                var tempMangoSprite = new Phaser.Sprite(core.game, 500 + 10 * i, 120 + 12 * i, "Mango");
                tempMangoSprite.width = 10;
                tempMangoSprite.height = 10;
                tempMangoSprite.name = "Mango_" + (i + 1);
                mangoSpriteArray.push(tempMangoSprite);
                mangoContainer.addChild(tempMangoSprite);
            }
        }
        function update() {
            // TODO
        }
    })(core = monoloco.core || (monoloco.core = {}));
})(monoloco || (monoloco = {}));
