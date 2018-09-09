"use strict";
/// <reference path="../../lib/phaser.d.ts" />
var monoloco;
(function (monoloco) {
    var core;
    (function (core) {
        var config = {
            renderer: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            canvasId: "mainCanvas",
            state: {
                preload: preload,
                create: create,
                update: update
            }
        };
        var game = new Phaser.Game(config);
        var mangoSprite;
        function preload() {
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.load.image("Mango", "../../res/images/Mango.png");
            game.load.image("Tree", "../../res/images/Tree.png");
        }
        function create() {
            mangoSprite = game.add.sprite(10, 10, "Mango");
        }
        function update() {
            mangoSprite.x += 1;
        }
    })(core = monoloco.core || (monoloco.core = {}));
})(monoloco || (monoloco = {}));
