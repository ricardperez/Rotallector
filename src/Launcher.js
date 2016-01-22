/**
 * Created by ricardperez on 21/01/16.
 */
var Launcher = function (physics, speed) {
    this.physics = physics;
    this.sprite = new cc.Sprite(GameResources.images.launcher);
    this.speed = speed;

    this.update = function (dt) {
        this.sprite.setPositionX(this.sprite.getPositionX() + this.speed * dt);
        var rightLimit = (cc.winSize.width - this.sprite.getContentSize().width * 0.5);
        var leftLimit = (this.sprite.getContentSize().width * 0.5);
        if ((this.speed > 0) && (this.sprite.getPositionX() > rightLimit)) {
            this.sprite.setPositionX(rightLimit);
            this.speed = -this.speed;
        } else if ((this.speed < 0) && (this.sprite.getPositionX() < leftLimit)) {
            this.sprite.setPositionX(leftLimit);
            this.speed = -this.speed;
        }
    };

    this.launchBall = function (color) {
        var position = this.sprite.getPosition();
        position.y -= (this.sprite.getContentSize().height - 25.0);
        var ball = new Ball(color, position, this.physics);

        ball.body.SetLinearVelocity(this.physics.screenToPhysics(new cc.Point(this.speed, -250)));
        return ball;
    };
};