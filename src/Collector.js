/**
 * Created by ricardperez on 21/01/16.
 */

var CollectorBranch = function (physics, pivot, vector) {
    this.sprite = null;
    this.body = null;
    this.physics = physics;
    this.pivot = pivot;

    var length = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));

    this.sprite = new cc.Sprite(GameScene.resources.CollectorBranch)
    this.sprite.setScaleX(length);

    var radians = Math.atan2(vector.y, vector.x);
    var degrees = radians * (180 / Math.PI);
    this.sprite.setPosition(pivot);
    this.sprite.setAnchorPoint(new cc.Point(0, 0.5));
    this.sprite.setRotation(-degrees);

    this.body = physics.createEdge(new cc.Point(0, 0), new cc.Point(length, 0));
    this.body.SetPosition(physics.screenToPhysics(pivot));
    this.body.SetAngle(radians);
};

CollectorBranch.prototype.updatePivot = function(pivot)
{
    this.pivot = pivot;
    this.body.SetPosition(this.physics.screenToPhysics(pivot));
    this.sprite.setPosition(pivot);
};

var Collector = function (physics, pivotPoint) {
    this.mainNode = new cc.Node();
    this.branches = [];
    this.pivot = pivotPoint;

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
    cc.eventManager.addListener(touchListener, 1);
};

Collector.prototype.onTouchBegan = function (touch, event) {
    var location = touch.getLocation();

    var diffX = (location.x - this.pivot.x);
    var diffY = (location.y - this.pivot.y);
    var distanceSq = ((diffX * diffX) + (diffY * diffY));

    if (distanceSq < 15*15)
    {
        this.onTouchMoved(touch, event);
        return true;
    }

    return false;
};

Collector.prototype.onTouchMoved = function (touch, event) {
    this.pivot = touch.getLocation();
    for (var i = 0; i < this.branches.length; i++) {
        var branch = this.branches[i];
        branch.updatePivot(this.pivot);
    }
};

Collector.prototype.onTouchEnded = function (touch, event) {
};