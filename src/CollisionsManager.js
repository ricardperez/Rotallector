/**
 * Created by ricardperez on 26/01/16.
 */

var BallsGroup = function () {
    this.balls = [];
};

BallsGroup.prototype.add = function (ball) {
    this.balls.push(ball);
};

BallsGroup.prototype.remove = function (ball) {
    var index = this.balls.indexOf(ball);
    if (index >= 0) {
        this.balls.splice(index, 1);
    }
};

BallsGroup.prototype.has = function (ball) {
    var index = this.balls.indexOf(ball);
    return (index >= 0);
};

BallsGroup.prototype.all = function() {
    return this.balls;
};

BallsGroup.prototype.isEmpty = function () {
    return (this.balls.length == 0);
};

var CollisionsManager = function () {
    var me = this;
    var listener = new Box2D.Dynamics.b2ContactListener();
    listener.BeginContact = function (contact) {
        var body1 = null;
        var body2 = null;

        if (contact.GetFixtureA())
        {
            body1 = contact.GetFixtureA().GetBody();
        }

        if (contact.GetFixtureB())
        {
            body2 = contact.GetFixtureB().GetBody();
        }

        me.onBeginContact(body1, body2);
    };
    listener.EndContact = function (contact) {
        var body1 = null;
        var body2 = null;

        if (contact.GetFixtureA())
        {
            body1 = contact.GetFixtureA().GetBody();
        }

        if (contact.GetFixtureB())
        {
            body2 = contact.GetFixtureB().GetBody();
        }

        me.onEndContact(body1, body2);
    };
    listener.PreSolve = function (contact, oldManifold) {
    };
    listener.PostSolve = function (contact, impulse) {
    };

    this.listener = listener;
    this.balls = [];
    this.collector = null;

    this.collectorBalls = new BallsGroup();
    this.ballsGroups = [];
};

CollisionsManager.prototype.attachToPhysicsWorld = function (b2world) {
    b2world.SetContactListener(this.listener);
};

CollisionsManager.prototype.registerBall = function (ball) {
    this.balls.push(ball);
};

CollisionsManager.prototype.unregisterBall = function (ball) {
    var group = this.findBallsGroup(ball);
    if (group != null)
    {
        group.remove(ball);
        if (group != this.collectorBalls && group.isEmpty())
        {
            var index = this.ballsGroups.indexOf(group);
            if (index >= 0) {
                this.ballsGroups.splice(index, 1);
            }
        }
    }

    var index = this.balls.indexOf(ball);
    if (index >= 0) {
        this.balls.splice(index, 1);
    }
};

CollisionsManager.prototype.registerCollector = function (collector) {
    this.collector = collector;
};

CollisionsManager.prototype.isBallTouchingCollector = function(ball) {
    return (this.collectorBalls.has(ball));
};

CollisionsManager.prototype.onBeginContact = function (body1, body2) {
    var ball1 = this.getBallWithBody(body1);
    var ball2 = this.getBallWithBody(body2);

    if (ball1 != null && body2 == this.collector.body)
    {
        this.collectorBalls.add(ball1);
    }
    else if (ball2 != null && body1 == this.collector.body)
    {
        this.collectorBalls.add(ball2);
    }
    else if (ball1 != null && ball2 != null)
    {
        var group1 = this.findBallsGroup(ball1);
        var group2 = this.findBallsGroup(ball2);
        if ((group1 != null) && (group2 != null) && (group1 != group2))
        {
            if (group2 == this.collectorBalls)
            {
                this.mergeBallsGroup(group2, group1);
            }
            else
            {
                this.mergeBallsGroup(group1, group2);
            }
        }
        else if (group1 != null)
        {
            group1.add(ball2);
        }
        else if (group2 != null)
        {
            group2.add(ball1);
        }
        else
        {
            var ballsGroup = new BallsGroup();
            ballsGroup.add(ball1);
            ballsGroup.add(ball2);
            this.ballsGroups.push(ballsGroup);
        }
    }
};

CollisionsManager.prototype.onEndContact = function (body1, body2) {
    //var ball1 = this.getBallWithBody(body1);
    //var ball2 = this.getBallWithBody(body2);
    //
    //if (ball1 != null && body2 == this.collector.body)
    //{
    //    this.collectorBalls.remove(ball1);
    //}
    //else if (ball2 != null && body1 == this.collector.body)
    //{
    //    this.collectorBalls.remove(ball2);
    //}
    //else if (ball1 != null && ball2 != null)
    //{
    //    var group1 = this.findBallsGroup(ball1);
    //    var group2 = this.findBallsGroup(ball2);
    //    if ((group1 != null) && (group2 != null))
    //    {
    //        if (group2 == this.collectorBalls)
    //        {
    //            this.mergeBallsGroup(group2, group1);
    //        }
    //        else
    //        {
    //            this.mergeBallsGroup(group1, group2);
    //        }
    //    }
    //    else if (group1 != null)
    //    {
    //        group1.add(ball2);
    //    }
    //    else if (group2 != null)
    //    {
    //        group2.add(ball1);
    //    }
    //    else
    //    {
    //        var ballsGroup = new BallsGroup();
    //        ballsGroup.add(ball1);
    //        ballsGroup.add(ball2);
    //        this.ballsGroups.push(ballsGroup);
    //    }
    //}
};

CollisionsManager.prototype.mergeBallsGroup = function (groupDestination, groupSource) {
    var balls = groupSource.all();
    for (var i=0; i<balls.length; i++)
    {
        var ball = balls[i];
        groupDestination.add(ball);
    }

    var index = this.ballsGroups.indexOf(groupSource);
    if (index >= 0) {
        this.ballsGroups.splice(index, 1);
    }
};

CollisionsManager.prototype.getBallWithBody = function(body)
{
    if (body != null)
    {
        for (var i=0; i<this.balls.length; i++)
        {
            var ball = this.balls[i];
            if (ball.body == body)
            {
                return ball;
            }
        }
    }

    return null;
};

CollisionsManager.prototype.findBallsGroup = function(ball)
{
    if (this.collectorBalls.has(ball))
    {
        return this.collectorBalls;
    }

    for (var i=0; i<this.ballsGroups.length; i++)
    {
        var group = this.ballsGroups[i];
        if (group.has(ball))
        {
            return group;
        }
    }

    return null;
}