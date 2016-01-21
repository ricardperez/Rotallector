/**
 * Created by ricardperez on 20/01/16.
 */

var Physics = function () {
    this.scalePhysicsToScreen = 32;
    this.scaleScreenToPhysics = (1.0 / this.scalePhysicsToScreen);


    var gravity = new Box2D.Common.Math.b2Vec2(0, -9.8);
    var doSleep = true;
    this.world = new Box2D.Dynamics.b2World(gravity, doSleep);

    var floorVertices = [
        new cc.Point(0, cc.winSize.height),
        new cc.Point(0, 0),
        new cc.Point(cc.winSize.width, 0),
        new cc.Point(cc.winSize.width, cc.winSize.height)
    ];

    for (var i = 0; i < floorVertices.length - 1; i++) {
        var vertex1 = floorVertices[i];
        var vertex2 = floorVertices[i + 1];

        this.addEdge(vertex1, vertex2);
    }
};

Physics.prototype.screenToPhysics = function (position) {
    var x = position.x * this.scaleScreenToPhysics;
    var y = position.y * this.scaleScreenToPhysics;

    return new Box2D.Common.Math.b2Vec2(x, y);
};

Physics.prototype.physicsToScreen = function (position) {
    var x = position.x * this.scalePhysicsToScreen;
    var y = position.y * this.scalePhysicsToScreen;

    return new cc.Point(x, y);
};

Physics.prototype.createBallBody = function (radius, screenPosition) {
    var shape = new Box2D.Collision.Shapes.b2CircleShape(radius * this.scaleScreenToPhysics);

    var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
    fixtureDef.shape = shape;
    fixtureDef.density = 10.0;
    fixtureDef.restitution = 0.4;
    fixtureDef.friction = 0.0;

    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    bodyDef.position = this.screenToPhysics(screenPosition);

    var body = this.world.CreateBody(bodyDef);
    body.CreateFixture(fixtureDef);

    return body;
};

Physics.prototype.step = function () {
    var timeStep = 1.0 / 60;
    var iteration = 1;
    this.world.Step(timeStep, 10, 10);
};

Physics.prototype.addEdge = function (vertex1, vertex2) {
    var v1 = this.screenToPhysics(vertex1);
    var v2 = this.screenToPhysics(vertex2);

    var shape = new Box2D.Collision.Shapes.b2PolygonShape();
    shape.SetAsEdge(v1, v2);

    var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
    fixtureDef.shape = shape;
    fixtureDef.restitution = 0.5;

    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
    bodyDef.position = new Box2D.Common.Math.b2Vec2(0, 0);

    var body = this.world.CreateBody(bodyDef);
    body.CreateFixture(fixtureDef);

    return body;
};

var GameScene = cc.Scene.extend({

    physics: null,
    launcher: null,
    balls: [],
    timeSinceLaunch: 0,
    nextBallColor: null,
    launchDelay: 0.75,

    ctor: function () {
        this._super();

        this.physics = new Physics();
        this.launcher = new Launcher(this.physics);

        var whiteBackgroundLayer = new cc.LayerColor(new cc.Color(255, 255, 255), this.getContentSize().width, this.getContentSize().height);
        this.addChild(whiteBackgroundLayer);

        this.addChild(this.launcher.sprite);
        this.launcher.sprite.setPosition(cc.winSize.width*0.5, cc.winSize.height);
        this.launcher.sprite.setAnchorPoint(0.5, 1.0);
        this.launcher.sprite.setLocalZOrder(1);

        this.nextBallColor = Ball.Colors[Math.floor(Math.random() * Ball.Colors.length)];
        this.launcher.sprite.setColor(new cc.Color(200, 200, 200, 255));
        this.launcher.sprite.runAction(new cc.Sequence(
            new cc.DelayTime(this.launchDelay*0.8),
            new cc.TintTo(this.launchDelay*0.2, this.nextBallColor.r, this.nextBallColor.g, this.nextBallColor.b)));
    },

    onEnterTransitionDidFinish: function () {
        this._super();

        this.scheduleUpdate();
    },

    update: function (dt) {
        this._super();

        this.physics.step();

        this.launcher.update(dt);

        this.timeSinceLaunch += dt;
        if (this.timeSinceLaunch > this.launchDelay)
        {
            this.timeSinceLaunch = 0.0;
            var ball = this.launcher.launchBall(this.nextBallColor);
            this.balls.push(ball);
            this.addChild(ball.sprite);

            this.nextBallColor = Ball.Colors[Math.floor(Math.random() * Ball.Colors.length)];

            this.launcher.sprite.runAction(new cc.Sequence(
                new cc.DelayTime(this.launchDelay*0.2),
                new cc.TintTo(this.launchDelay*0.2, 200, 200, 200),
                new cc.DelayTime(this.launchDelay*0.4),
                new cc.TintTo(this.launchDelay*0.2, this.nextBallColor.r, this.nextBallColor.g, this.nextBallColor.b)));
        }

        for (var i = 0; i < this.balls.length; i++) {
            this.balls[i].update(dt);
        }
    }
});

var Ball = function (color, position, physics) {

    this.physics = physics;

    this.sprite = new cc.Sprite(GameScene.resources.Ball);
    this.sprite.setPosition(position);
    this.sprite.setColor(color);

    var radius = this.sprite.getContentSize().width * 0.5;
    this.body = this.physics.createBallBody(radius, position);

    this.update = function (dt) {
        var screenPos = this.physics.physicsToScreen(this.body.GetPosition());
        this.sprite.setPosition(screenPos);
    };
};

Ball.Colors = [
    new cc.Color(255, 0, 0, 255),
    new cc.Color(0, 255, 0, 255),
    new cc.Color(0, 0, 255, 255),
    new cc.Color(255, 255, 255, 255),
    new cc.Color(255, 255, 0, 255),
    new cc.Color(255, 0, 255, 255),
    new cc.Color(0, 255, 255, 255),
];

var Launcher = function (physics) {
    this.physics = physics;
    this.sprite = new cc.Sprite(GameScene.resources.Launcher);
    this.speedX = 100.0;

    this.update = function (dt) {
        this.sprite.setPositionX(this.sprite.getPositionX() + this.speedX * dt);
        var rightLimit = (cc.winSize.width - this.sprite.getContentSize().width * 0.5);
        var leftLimit = (this.sprite.getContentSize().width * 0.5);
        if ((this.speedX > 0) && (this.sprite.getPositionX() > rightLimit)) {
            this.sprite.setPositionX(rightLimit);
            this.speedX = -this.speedX;
        } else if ((this.speedX < 0) && (this.sprite.getPositionX() < leftLimit)) {
            this.sprite.setPositionX(leftLimit);
            this.speedX = -this.speedX;
        }
    };

    this.launchBall = function (color) {
        var position = this.sprite.getPosition();
        position.y -= (this.sprite.getContentSize().height - 25.0);
        var ball = new Ball(color, position, this.physics);

        ball.body.SetLinearVelocity(this.physics.screenToPhysics(new cc.Point(this.speedX, -250)));
        return ball;
    };
};

GameScene.resources = {
    Ball: "res/ball.png",
    BlackLine: "res/black_line.png",
    Launcher: "res/launcher.png",

};

GameScene.g_resources = [];
for (var i in GameScene.resources) {
    GameScene.g_resources.push(GameScene.resources[i]);
}

