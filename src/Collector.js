/**
 * Created by ricardperez on 21/01/16.
 */

var CollectorBranch = function (physics, pivot, vector) {
    this.sprite = null;
    this.body = null;
    this.physics = physics;
    this.pivot = pivot;

    var length = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));

    this.sprite = new cc.Sprite(GameResources.names.CollectorBranch)
    this.sprite.setScaleX(length);

    this.angle = Math.atan2(vector.y, vector.x);
    var degrees = this.angle * (180 / Math.PI);
    this.sprite.setPosition(pivot);
    this.sprite.setAnchorPoint(new cc.Point(0, 0.5));
    this.sprite.setRotation(-degrees);

    this.body = physics.createEdge(new cc.Point(0, 0), new cc.Point(length, 0));
    this.body.SetPosition(physics.screenToPhysics(pivot));
    this.body.SetAngle(this.angle);
};

CollectorBranch.prototype.updatePivot = function (pivot, angle) {
    this.body.SetPosition(this.physics.screenToPhysics(pivot));
    this.sprite.setPosition(pivot);

    var degrees = (this.angle + angle) * (180 / Math.PI);
    this.sprite.setRotation(-degrees);
    this.body.SetAngle(this.angle + angle);
};

var TouchingActionEnum = {
    NONE: 0,
    ROTATING: 1,
    MOVNG: 2
};

var Collector = function (physics, pivotPoint) {
    this.mainNode = new cc.Node();
    this.branches = [];
    this.pivot = pivotPoint;
    this.futurePivot = pivotPoint;
    this.angle = 0;
    this.futureAngle = 0;
    this.physics = physics;

    this.touchingAction = TouchingActionEnum.NONE;

    var branch1 = new CollectorBranch(physics, pivotPoint, new cc.Point(-200, 200));
    this.mainNode.addChild(branch1.sprite);
    this.branches.push(branch1);

    var branch2 = new CollectorBranch(physics, pivotPoint, new cc.Point(200, 200));
    this.mainNode.addChild(branch2.sprite);
    this.branches.push(branch2);

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

var pointsDistanceSq = function(point1, point2)
{
    var diffX = (point2.x - point1.x);
    var diffY = (point2.y - point1.y);
    return (diffX*diffX + diffY*diffY);
};

Collector.prototype.onTouchBegan = function (touch, event) {
    var location = touch.getLocation();

    if (pointsDistanceSq(location, this.pivot) < 25*25)
    {
        var diffX = (location.x - this.pivot.x);
        var diffY = (location.y - this.pivot.y);
        var distanceSq = ((diffX * diffX) + (diffY * diffY));

        if (distanceSq < 25 * 25) {
            this.onTouchMoved(touch, event);
            this.touchingAction = TouchingActionEnum.MOVING;
            return true;
        }
    }else if (location.y < 100 || location.y < (this.pivot.y - 30))
    {
        this.touchingAction = TouchingActionEnum.ROTATING;
        return true;
    }

    this.touchingAction = TouchingActionEnum.NONE;
    return false;
};

Collector.prototype.onTouchMoved = function (touch, event) {
    var touchLocation = touch.getLocation();

    if (this.touchingAction == TouchingActionEnum.MOVING)
    {
        this.futurePivot = touchLocation;
    }
    else if (this.touchingAction == TouchingActionEnum.ROTATING)
    {
        var maxAngle = 65 * (Math.PI / 180);
        var minAngle = -maxAngle;

        this.futureAngle = (Math.atan2(touchLocation.y - this.pivot.y, touchLocation.x - this.pivot.x) + Math.PI * 0.5);
        if (this.futureAngle > maxAngle) {
            this.futureAngle = maxAngle;
        }
        if (this.futureAngle < minAngle) {
            this.futureAngle = minAngle;
        }
    }
};

Collector.prototype.onTouchEnded = function (touch, event) {
    this.futurePivot = this.pivot;
    this.futureAngle = this.angle;

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

    this.pivot.x = lerp(this.pivot.x, this.futurePivot.x, dt, maxMovement);
    this.pivot.y = lerp(this.pivot.y, this.futurePivot.y, dt, maxMovement);
    this.angle = lerp(this.angle, this.futureAngle, dt, maxRotation * (Math.PI / 180));

    for (var i = 0; i < this.branches.length; i++) {
        var branch = this.branches[i];
        branch.updatePivot(this.pivot, this.angle);
    }

    this.physics.applySmallImpulseToEveryMovingBody();
};

Collector.prototype.destroy = function ()
{
    cc.eventManager.removeListener(this.touchListener);
}