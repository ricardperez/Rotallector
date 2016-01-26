/**
 * Created by ricardperez on 21/01/16.
 */

var CollectorBranch = function (collector, point1, point2) {
    this.node = null;
    this.body = null;
    this.collector = collector;

    var vector = new cc.Point(point2.x - point1.x, point2.y - point1.y);
    var length = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));

    this.node = new cc.Sprite(GameResources.images.collector_branch)
    this.node.setScaleX(length);

    angle = Math.atan2(vector.y, vector.x);
    var degrees = angle * (180 / Math.PI);
    this.node.setPosition(point1);
    this.node.setAnchorPoint(new cc.Point(0, 0.5));
    this.node.setRotation(-degrees);

    this.body = this.collector.physics.createEdgeFixture(collector.body, point1, point2);
};

var TouchingActionEnum = {
    NONE: 0,
    MOVNG: 1
};

var AABB = function () {
    this.minX = 0;
    this.minY = 0;
    this.maxX = 0;
    this.maxY = 0;

    this.updateLimits = function (point) {
        if (point.x < this.minX) {
            this.minX = point.x;
        }
        if (point.x > this.maxX) {
            this.maxX = point.x;
        }
        if (point.y < this.minY) {
            this.minY = point.y;
        }
        if (point.y > this.maxY) {
            this.maxY = point.y;
        }
    };

    this.getWidth = function () {
        return (this.maxX - this.minX);
    };

    this.getHeight = function () {
        return (this.maxY - this.minY);
    };
};

var Collector = function (physics, pivotPoint, descriptionJson) {
    this.mainNode = new cc.Node();
    this.branches = [];
    this.pivot = pivotPoint;
    this.futurePivot = pivotPoint;
    this.physics = physics;

    this.touchingAction = TouchingActionEnum.NONE;

    this.aabb = new AABB();

    this.body = this.physics.createBody();
    this.createBranches(descriptionJson);
    this.body.SetPosition(this.physics.screenToPhysics(this.pivot));
    this.mainNode.setPosition(this.pivot);

    var me = this;
    var touchListener = cc.EventListener.create({
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: true,
        onTouchBegan: function (touch, event) {
            return me.onTouchBegan(touch, event)
        },
        onTouchMoved: function (touch, event) {
            return me.onTouchMoved(touch, event);
        },
        onTouchEnded: function (touch, event) {
            return me.onTouchEnded(touch, event);
        }
    });
    this.touchListener = cc.eventManager.addListener(touchListener, 1);
};

var pointsDistanceSq = function (point1, point2) {
    var diffX = (point2.x - point1.x);
    var diffY = (point2.y - point1.y);
    return (diffX * diffX + diffY * diffY);
};

Collector.prototype.onTouchBegan = function (touch, event) {
    var location = touch.getLocation();

    if (pointsDistanceSq(location, this.pivot) < 25 * 25) {
        var diffX = (location.x - this.pivot.x);
        var diffY = (location.y - this.pivot.y);
        var distanceSq = ((diffX * diffX) + (diffY * diffY));

        if (distanceSq < 150 * 150) {
            this.onTouchMoved(touch, event);
            this.touchingAction = TouchingActionEnum.MOVING;
            return true;
        }
    }

    this.touchingAction = TouchingActionEnum.NONE;
    return false;
};

Collector.prototype.onTouchMoved = function (touch, event) {
    var touchLocation = touch.getLocation();

    if (this.touchingAction == TouchingActionEnum.MOVING) {
        this.futurePivot = touchLocation;

        this.futurePivot.x = Math.max(this.futurePivot.x, Math.abs(this.aabb.minX));
        this.futurePivot.x = Math.min(this.futurePivot.x, cc.winSize.width-Math.abs(this.aabb.maxX));
        this.futurePivot.y = Math.max(this.futurePivot.y, Math.abs(this.aabb.minY));
        this.futurePivot.y = Math.min(this.futurePivot.y, cc.winSize.width-Math.abs(this.aabb.maxY));
    }
};

Collector.prototype.onTouchEnded = function (touch, event) {
    this.futurePivot = this.pivot;

    this.touchingAction = TouchingActionEnum.NONE;
};

var lerp = function (currentValue, desiredValue, dt, maxDiff) {
    var diff = (desiredValue - currentValue);
    var negative = (diff < 0);
    if (negative) {
        diff = -diff;
    }

    var lerpValue = Math.min(maxDiff, dt * maxDiff * diff);

    if (negative) {
        lerpValue = -lerpValue;
    }

    return (currentValue + lerpValue);
};

Collector.prototype.update = function (dt) {
    var maxMovement = 10.0;
    var maxRotation = 45;

    var oldPivotX = this.pivot.x;
    var oldPivotY = this.pivot.y;

    this.pivot.x = lerp(this.pivot.x, this.futurePivot.x, dt, maxMovement);
    this.pivot.y = lerp(this.pivot.y, this.futurePivot.y, dt, maxMovement);

    this.body.SetPosition(this.physics.screenToPhysics(this.pivot));
    this.mainNode.setPosition(this.pivot);

    var physicsAdjustMovement = this.physics.screenToPhysics(new cc.Point((this.pivot.x - oldPivotX), (this.pivot.y - oldPivotY)));
    physicsAdjustMovement.x *= 0.5;
    if (physicsAdjustMovement.y < 0.0) {
        physicsAdjustMovement.y *= 0.5;
    }

    if (physicsAdjustMovement.x != 0.0 || physicsAdjustMovement.y != 0.0) {
        var me = this;
        this.physics.applyFunctionToAllBodies(function (body) {
            if (body.GetType() == Box2D.Dynamics.b2Body.b2_dynamicBody) {
                var ball = body.GetUserData();
                if (me.physics.collisionsManager.isBallTouchingCollector(ball)) {
                    var oldPosition = body.GetPosition();
                    body.SetPosition(new Box2D.Common.Math.b2Vec2(oldPosition.x + physicsAdjustMovement.x, oldPosition.y + physicsAdjustMovement.y));
                }
            }
        });
    }
};

Collector.prototype.destroy = function () {
    cc.eventManager.removeListener(this.touchListener);
}

Collector.prototype.createBranches = function (descriptionJson) {
    var me = this;
    var createBranch = function (point1, vector) {
        var branch = new CollectorBranch(me, point1, new cc.Point(point1.x + vector.x, point1.y + vector.y));
        me.mainNode.addChild(branch.node);
        me.branches.push(branch);

        me.aabb.updateLimits(point1);
        me.aabb.updateLimits(new cc.Point(point1.x+vector.x, point1.y+vector.y));

        return branch;
    };

    var segmentsJson = descriptionJson["segments"];
    for (var i = 0; i < segmentsJson.length; i++) {
        var origin = segmentsJson[i]["origin"];
        var vector = segmentsJson[i]["vector"];
        createBranch(new cc.Point(origin[0], origin[1]), new cc.Point(vector[0], vector[1]));
    }
}