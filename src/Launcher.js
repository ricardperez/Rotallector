/**
 * Created by ricardperez on 21/01/16.
 */
var Launcher = function (physics) {
    this.physics = physics;
    this.sprite = new cc.Sprite(GameScene.resources.Launcher);
    this.speedX = 100.0;

    this.update = function (dt) {
        this.sprite.setPositionX(this.sprite.getPositionX() + this.speedX * dt);
        var rightLimit = (cc.winSize.width - this.sprite.getContentSize().width * 0.5);
        var leftLimit = (this.sprite.getContentSize().width * 0.5);
        if ((this.speedX > 0) && (this.sprite.getPositionX() > rightLimit)) {
            this.sprite.setPositionX(rightLimit);
            this.speedX = -this.speedX;
        } else if ((this.speedX < 0) && (this.sprite.getPositionX() < leftLimit)) {
            this.sprite.setPositionX(leftLimit);
            this.speedX = -this.speedX;
        }
    };

    this.launchBall = function (color) {
        var position = this.sprite.getPosition();
        position.y -= (this.sprite.getContentSize().height - 25.0);
        var ball = new Ball(color, position, this.physics);

        ball.body.SetLinearVelocity(this.physics.screenToPhysics(new cc.Point(this.speedX, -250)));
        return ball;
    };
};