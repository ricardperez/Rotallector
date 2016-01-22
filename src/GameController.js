/**
 * Created by ricardperez on 22/01/16.
 */

var GameController = function(gameNode) {
    this.gameNode = gameNode;
    this.physics = null;
    this.launcher = null;
    this.balls = [];
    this.timeSinceLaunch = 0;
    this.nextBallColor = null;
    this.launchDelay = 0.75;
    this.timeLeft = 10.0;

    this.physics = new Physics();
    this.launcher = new Launcher(this.physics);
    this.collector = new Collector(this.physics, new cc.Point(cc.winSize.width * 0.5, 100));

    this.setupWalls();
    this.setupLauncher();

    this.gameNode.addChild(this.collector.mainNode);
};

GameController.prototype.update = function(dt)
{
    this.physics.step();

    if (this.timeLeft > 5.0)
    {
        this.launcher.update(dt);
        this.timeSinceLaunch += dt;
        if (this.timeSinceLaunch > this.launchDelay) {
            this.timeSinceLaunch = 0.0;
            var ball = this.launcher.launchBall(this.nextBallColor);
            this.balls.push(ball);
            this.gameNode.addChild(ball.sprite);

            this.nextBallColor = Ball.Colors[Math.floor(Math.random() * Ball.Colors.length)];

            this.launcher.sprite.runAction(new cc.Sequence(
                new cc.DelayTime(this.launchDelay * 0.2),
                new cc.TintTo(this.launchDelay * 0.2, 200, 200, 200),
                new cc.DelayTime(this.launchDelay * 0.4),
                new cc.TintTo(this.launchDelay * 0.2, this.nextBallColor.r, this.nextBallColor.g, this.nextBallColor.b)));
        }
    }

    this.collector.update(dt);

    for (var i = 0; i < this.balls.length; i++) {
        var ball = this.balls[i];
        ball.update(dt);

        var toRemove = (ball.sprite.getPosition().y < (-ball.sprite.getContentSize().height * 0.5));
        if (toRemove) {
            ball.sprite.removeFromParent();
            this.physics.destroyBody(ball.body);
            ball.sprite = null;
            ball.body = null;
        }
    }

    var i = 0;
    while (i < this.balls.length) {
        var ball = this.balls[i];
        if (ball.sprite == null) {
            this.balls.splice(i, 1);
        }
        else {
            i++;
        }
    }

    this.timeLeft -= dt;
    this.timeLeft = Math.max(0.0, this.timeLeft);
};

GameController.prototype.setupWalls = function()
{
    var bottomLeft = new cc.Point(0, 0);
    var topLeft = new cc.Point(0, cc.winSize.height);
    var bottomRight = new cc.Point(cc.winSize.width, 0);
    var topRight = new cc.Point(cc.winSize.width, cc.winSize.height);

    this.physics.createEdge(bottomLeft, topLeft);
    this.physics.createEdge(bottomRight, topRight);
};

GameController.prototype.setupLauncher = function () {
    this.gameNode.addChild(this.launcher.sprite);
    this.launcher.sprite.setPosition(cc.winSize.width * 0.5, cc.winSize.height - 50);
    this.launcher.sprite.setAnchorPoint(0.5, 1.0);
    this.launcher.sprite.setLocalZOrder(1);

    this.nextBallColor = Ball.Colors[Math.floor(Math.random() * Ball.Colors.length)];
    this.launcher.sprite.setColor(new cc.Color(200, 200, 200, 255));
    this.launcher.sprite.runAction(new cc.Sequence(
        new cc.DelayTime(this.launchDelay * 0.8),
        new cc.TintTo(this.launchDelay * 0.2, this.nextBallColor.r, this.nextBallColor.g, this.nextBallColor.b)));
};

GameController.prototype.getScore = function () {
    return this.balls.length;
};

GameController.prototype.getTimeLeft = function () {
    return this.timeLeft;
};

GameController.prototype.isFinished = function () {
    return (this.timeLeft == 0.0);
};

GameController.prototype.destroy = function () {
    this.collector.destroy();
};