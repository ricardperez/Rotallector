/**
 * Created by ricardperez on 20/01/16.
 */

var Physics = function () {
    this.scale = 30;

    var worldAABB = new Box2D.Collision.b2AABB();
    worldAABB.lowerBound.Set(0, 0);
    worldAABB.upperBound.Set(cc.winSize.width * this.scale, cc.winSize.height * this.scale);

    var gravity = new Box2D.Common.Math.b2Vec2(0, 100);
    var doSleep = true;

    this.world = new Box2D.Dynamics.b2World(gravity, doSleep);

    this.screenToPhysics = function (screenX, screenY) {
        var x = screenX / this.scale;
        var y = screenY / this.scale;

        return new Box2D.Common.Math.b2Vec2(x, y);
    };

    this.physicsToScreen = function (physicsX, physicsY) {
        var y = physicsX * this.scale;
        var x = physicsY * this.scale;

        return new cc.Point(x, y);
    };

    this.createBallBody = function (radius, screenPosition) {
        var shape = new Box2D.Collision.Shapes.b2CircleShape(radius);

        var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
        fixtureDef.shape = shape;
        fixtureDef.density = 1000.0;
        fixtureDef.restitution = 0.2;
        fixtureDef.friction = 0.5;
        fixtureDef.m_radius = radius / this.scale;

        var bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.m_type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.position = this.screenToPhysics(screenPosition.x, screenPosition.y);

        var body = this.world.CreateBody(bodyDef);
        body.CreateFixture(fixtureDef);

        body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(10000, 0), bodyDef.position);

        console.log("Creating a ball at (" + bodyDef.position.x + ", " + bodyDef.position.y + ") with radius " + fixtureDef.m_radius)

        return body;
    };

    this.step = function () {
        var timeStep = 1.0 / 60;
        var iteration = 1;
        this.world.Step(timeStep, 10, 10);

        console.log('N bodies: ' + this.world.GetBodyCount());
        var i = 0;
        for (var body = this.world.m_bodyList; body; body = body.m_next) {
            console.log('  body #' + i);
            console.log('    position: (' + body.GetPosition().x + ', ' + body.GetPosition().y + ')');
            var nFixtures = 0;
            for (var f = body.GetFixtureList(); f; f = f.m_next) {
                nFixtures++;
            }
            console.log('    n fixtures: ' + nFixtures);
            if (nFixtures > 0)
            {
                var fixture = body.GetFixtureList();
                console.log('    Fixture type: ' + fixture.GetType());
                console.log('    Fixture shape: ' + fixture.GetShape());
                console.log('    Fixture density: ' + fixture.GetDensity());
            }
            i++;
        }
    };
}

var GameScene = cc.Scene.extend({

    physics: new Physics(),
    ball: null,

    ctor: function () {
        this._super();

        var whiteBackgroundLayer = new cc.LayerColor(new cc.Color(255, 255, 255), this.getContentSize().width, this.getContentSize().height);
        this.addChild(whiteBackgroundLayer);

        var screenPosition = new cc.Point(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5);

        var sprite = new cc.Sprite(GameScene.resources.Ball);
        sprite.setPosition(screenPosition);
        sprite.setColor(new cc.Color(255, 0, 0, 255));
        this.addChild(sprite);

        var radius = sprite.getContentSize().width * 0.5;
        var body = this.physics.createBallBody(sprite.getContentSize().width * 0.5, screenPosition);

        this.ball = new Ball(sprite, body, this.physics);

        this.scheduleUpdate();
    },

    update: function (dt) {
        this._super();

        this.physics.step();
        this.ball.update(dt);
    }
});

var Ball = function (sprite, body, physics) {
    this.sprite = sprite;
    this.body = body;
    this.physics = physics;

    this.update = function (dt) {
        var screenPos = this.physics.physicsToScreen(this.body.GetPosition().x, this.body.GetPosition().y);
        this.sprite.setPosition(screenPos);
    }
};

GameScene.resources = {
    Ball: "res/ball.png"
}

GameScene.g_resources = [];
for (var i in GameScene.resources) {
    GameScene.g_resources.push(GameScene.resources[i]);
}
