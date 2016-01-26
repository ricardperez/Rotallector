/**
 * Created by ricardperez on 21/01/16.
 */
var Physics = function () {
    this.scalePhysicsToScreen = 32;
    this.scaleScreenToPhysics = (1.0 / this.scalePhysicsToScreen);

    var gravity = new Box2D.Common.Math.b2Vec2(0, -20);
    var doSleep = true;
    this.world = new Box2D.Dynamics.b2World(gravity, doSleep);

    this.collisionsManager = new CollisionsManager();
    this.collisionsManager.attachToPhysicsWorld(this.world);
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
    fixtureDef.restitution = 0.1;
    fixtureDef.friction = 1.0;

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
    this.world.Step(timeStep, 1, 3);
};

Physics.prototype.createBody = function()
{
    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
    bodyDef.position = new Box2D.Common.Math.b2Vec2(0, 0);

    var body = this.world.CreateBody(bodyDef);
    return body;
};

Physics.prototype.createEdgeBody = function (vertex1, vertex2) {
    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
    bodyDef.position = new Box2D.Common.Math.b2Vec2(0, 0);

    var body = this.world.CreateBody(bodyDef);
    this.createEdgeFixture(body, vertex1, vertex2);

    return body;
};

Physics.prototype.createEdgeFixture = function(body, vertex1, vertex2)
{
    var v1 = this.screenToPhysics(vertex1);
    var v2 = this.screenToPhysics(vertex2);

    var shape = new Box2D.Collision.Shapes.b2PolygonShape();
    shape.SetAsEdge(v1, v2);

    var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
    fixtureDef.shape = shape;
    fixtureDef.restitution = 0.1;
    fixtureDef.friction = 1.0;

    body.CreateFixture(fixtureDef);
};

Physics.prototype.destroyBody = function (body) {
    this.world.DestroyBody(body);
};

Physics.prototype.applyFunctionToAllBodies = function (lambda) {
    var bodyList = this.world.GetBodyList();
    for (var b = bodyList; b != null; b = b.m_next) {
        lambda(b);
    }
};
