/**
 * Created by ricardperez on 20/01/16.
 */

var Physics = function () {
    this.scale = 1;

    var worldAABB = new Box2D.Collision.b2AABB();
    worldAABB.lowerBound.Set(0, 0);
    worldAABB.upperBound.Set(cc.winSize.width * this.scale, cc.winSize.height * this.scale);

    var gravity = new Box2D.Common.Math.b2Vec2(0, -100);
    var doSleep = true;

    this.world = new Box2D.Dynamics.b2World(gravity, doSleep);

    this.screenToPhysics = function (position) {
        var x = position.x / this.scale;
        var y = position.y / this.scale;

        return new Box2D.Common.Math.b2Vec2(x, y);
    };

    this.physicsToScreen = function (position) {
        var x = position.x * this.scale;
        var y = position.y * this.scale;

        return new cc.Point(x, y);
    };

    this.createBallBody = function (radius, screenPosition) {
        var shape = new Box2D.Collision.Shapes.b2CircleShape(radius);

        var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
        fixtureDef.shape = shape;
        fixtureDef.density = 10.0;
        fixtureDef.restitution = 0.2;
        fixtureDef.friction = 0.5;
        fixtureDef.m_radius = radius / this.scale;

        var bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.m_type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.position = this.screenToPhysics(screenPosition);

        var body = this.world.CreateBody(bodyDef);
        body.CreateFixture(fixtureDef);

        return body;
    };

    this.step = function () {
        var timeStep = 1.0 / 60;
        var iteration = 1;
        this.world.Step(timeStep, 10, 10);

        this.world.DrawDebugData();
    };
}

var GameScene = cc.Scene.extend({

    physics: new Physics(),
    balls: [],
    nBalls: 5,

    ctor: function () {
        this._super();

        var whiteBackgroundLayer = new cc.LayerColor(new cc.Color(255, 255, 255), this.getContentSize().width, this.getContentSize().height);
        this.addChild(whiteBackgroundLayer);

        for (var i = 0; i < this.nBalls; ++i) {
            var posX = this.getContentSize().width * Math.random();
            var posY = this.getContentSize().height * Math.random();
            var screenPosition = new cc.Point(posX, posY);
            var ball = new Ball(screenPosition, this.physics);
            this.balls.push(ball);
            this.addChild(ball.sprite);
        }
    },

    onEnterTransitionDidFinish: function () {
        this._super();

        this.scheduleUpdate();
    },

    update: function (dt) {
        this._super();

        this.physics.step();

        for (var i = 0; i < this.balls.length; i++) {
            this.balls[i].update(dt);
        }
    }
});

var Ball = function (position, physics) {

    this.physics = physics;

    this.sprite = new cc.Sprite(GameScene.resources.Ball);
    this.sprite.setPosition(position);
    this.sprite.setColor(Ball.Colors[Math.floor(Math.random() * Ball.Colors.length)]);

    var radius = this.sprite.getContentSize().width * 0.5;
    this.body = this.physics.createBallBody(radius, position);

    this.update = function (dt) {
        var screenPos = this.physics.physicsToScreen(this.body.GetPosition());
        this.sprite.setPosition(screenPos);

        if (this.body.GetPosition().y < 0) {
            var x = this.sprite.getPosition().x;
            var screenPosition = new cc.Point(x, cc.winSize.height);
            this.body.SetPosition(this.physics.screenToPhysics(screenPosition));
        }
    }
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

GameScene.resources = {
    Ball: "res/ball.png"
};

GameScene.g_resources = [];
for (var i in GameScene.resources) {
    GameScene.g_resources.push(GameScene.resources[i]);
}

