/**
 * Created by ricardperez on 21/01/16.
 */
var Ball = function (color, position, physics) {

    this.physics = physics;

    this.sprite = new cc.Sprite(GameResources.names.Ball);
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
