/**
 * Created by ricardperez on 20/01/16.
 */
var GameScene = cc.Scene.extend({

    physics: null,
    launcher: null,
    balls: [],
    timeSinceLaunch: 0,
    nextBallColor: null,
    launchDelay: 0.75,

    ctor: function () {
        this._super();

        var whiteBackgroundLayer = new cc.LayerColor(new cc.Color(255, 255, 255), this.getContentSize().width, this.getContentSize().height);
        this.addChild(whiteBackgroundLayer);

        this.physics = new Physics();
        this.launcher = new Launcher(this.physics);
        this.collector = new Collector(this.physics, new cc.Point(cc.winSize.width * 0.5, 100));

        this.setupWalls();
        this.setupLauncher();
        this.setupCollector();
    },

    onEnterTransitionDidFinish: function () {
        this._super();

        this.scheduleUpdate();
    },

    update: function (dt) {
        this._super();

        this.physics.step();

        this.launcher.update(dt);
        this.collector.update(dt);

        this.timeSinceLaunch += dt;
        if (this.timeSinceLaunch > this.launchDelay) {
            this.timeSinceLaunch = 0.0;
            var ball = this.launcher.launchBall(this.nextBallColor);
            this.balls.push(ball);
            this.addChild(ball.sprite);

            this.nextBallColor = Ball.Colors[Math.floor(Math.random() * Ball.Colors.length)];

            this.launcher.sprite.runAction(new cc.Sequence(
                new cc.DelayTime(this.launchDelay * 0.2),
                new cc.TintTo(this.launchDelay * 0.2, 200, 200, 200),
                new cc.DelayTime(this.launchDelay * 0.4),
                new cc.TintTo(this.launchDelay * 0.2, this.nextBallColor.r, this.nextBallColor.g, this.nextBallColor.b)));
        }

        for (var i = 0; i < this.balls.length; i++) {
            var ball = this.balls[i];
            ball.update(dt);

            var toRemove = (ball.sprite.getPosition().y < (-ball.sprite.getContentSize().height*0.5));
            if (toRemove) {
                ball.sprite.removeFromParent();
                this.physics.destroyBody(ball.body);
                ball.sprite = null;
                ball.body = null;
            }
        }

        var i = 0;
        while (i < this.balls.length)
        {
            var ball = this.balls[i];
            if (ball.sprite == null)
            {
                this.balls.splice(i, 1);
            }
            else
            {
                i++;
            }
        }
    },

    setupWalls: function () {
        var bottomLeft = new cc.Point(0, 0);
        var topLeft = new cc.Point(0, cc.winSize.height);
        var bottomRight = new cc.Point(cc.winSize.width, 0);
        var topRight = new cc.Point(cc.winSize.width, cc.winSize.height);

        this.physics.createEdge(bottomLeft, topLeft);
        this.physics.createEdge(bottomRight, topRight);
    },

    setupLauncher: function () {
        this.addChild(this.launcher.sprite);
        this.launcher.sprite.setPosition(cc.winSize.width * 0.5, cc.winSize.height);
        this.launcher.sprite.setAnchorPoint(0.5, 1.0);
        this.launcher.sprite.setLocalZOrder(1);

        this.nextBallColor = Ball.Colors[Math.floor(Math.random() * Ball.Colors.length)];
        this.launcher.sprite.setColor(new cc.Color(200, 200, 200, 255));
        this.launcher.sprite.runAction(new cc.Sequence(
            new cc.DelayTime(this.launchDelay * 0.8),
            new cc.TintTo(this.launchDelay * 0.2, this.nextBallColor.r, this.nextBallColor.g, this.nextBallColor.b)));
    },

    setupCollector: function () {
        this.addChild(this.collector.mainNode);
    }
});

GameScene.resources = {
    Ball: "res/ball.png",
    BlackLine: "res/black_line.png",
    Launcher: "res/launcher.png",
    CollectorBranch: "res/collector_branch.png",

};

GameScene.g_resources = [];
for (var i in GameScene.resources) {
    GameScene.g_resources.push(GameScene.resources[i]);
}

