/**
 * Created by ricardperez on 21/01/16.
 */
var Ball = function (color, position, physics) {

    this.physics = physics;

    this.sprite = new cc.Sprite(GameResources.images.Ball);
    this.sprite.setPosition(position);
    this.sprite.setColor(color);

    var radius = this.sprite.getContentSize().width * 0.5;
    this.body = this.physics.createBallBody(radius, position);
    this.body.SetUserData(this);
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

Ball.prototype.update = function(dt)
{
    var screenPos = this.physics.physicsToScreen(this.body.GetPosition());
    this.sprite.setPosition(screenPos);
};

Ball.prototype.destroy = function()
{
    this.sprite.removeFromParent();
    this.physics.destroyBody(this.body);

    this.physics = null;
    this.sprite = null;
    this.body = null;
};
