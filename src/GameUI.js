/**
 * Created by ricardperez on 22/01/16.
 */
var GameUI = cc.Layer.extend({
    scoreLabel: null,
    score: 0,
    timeLeftLabel: null,

    ctor: function () {
        this._super();

        var backgroundLayer = new cc.LayerColor(new cc.Color(100, 100, 100, 255), this.getContentSize().width, 50);
        this.addChild(backgroundLayer);
        backgroundLayer.setPositionY(this.getContentSize().height - backgroundLayer.getContentSize().height);

        var me = this;
        var createAndAddLabel = function(text, position)
        {
            var label = new cc.LabelTTF(text, "Arial", 25);
            label.setColor(new cc.Color(200, 200, 200, 255));
            label.setAnchorPoint(new cc.Point(0.0, 0.5));
            label.setPosition(position);
            me.addChild(label);
            return label;
        }

        var scoreTitleLabel = createAndAddLabel("Score: ", new cc.Point(cc.winSize.width-130, cc.winSize.height - 25));
        this.scoreLabel = createAndAddLabel("0", new cc.Point(scoreTitleLabel.getPositionX() + scoreTitleLabel.getContentSize().width, scoreTitleLabel.getPositionY()));

        var timeLeftTitleLabel = createAndAddLabel("Time left: ", new cc.Point(10, cc.winSize.height - 25));
        this.timeLeftLabel = createAndAddLabel("0:00", new cc.Point(timeLeftTitleLabel.getPositionX() + timeLeftTitleLabel.getContentSize().width, timeLeftTitleLabel.getPositionY()));
    },

    updateScore: function (score) {
        if (score != this.score) {
            this.score = score;
            this.scoreLabel.setString(this.score);
        }
    },

    updateTimeLeft: function (timeLeft)
    {
        var secondsI = Math.floor(timeLeft);
        var decimalsI = Math.floor((timeLeft-secondsI) * 100);
        this.timeLeftLabel.setString(String(secondsI) + ":" + String(decimalsI));
    },

    presentOutro: function (score, finishLambda)
    {
        var layer = new cc.LayerColor(new cc.Color(50, 50, 50, 200));

        var gameFinishedLabel = new cc.LabelTTF("Game Finished", "Arial", 45);
        gameFinishedLabel.setPosition(layer.getContentSize().width * 0.5, layer.getContentSize().height * 0.75);
        layer.addChild(gameFinishedLabel);

        var scoreLabel = new cc.LabelTTF("Score: " + score, "Arial", 30);
        scoreLabel.setPosition(layer.getContentSize().width * 0.5, layer.getContentSize().height * 0.5);
        layer.addChild(scoreLabel);

        this.addChild(layer);
        layer.setScale(0.2);
        layer.setRotation(25);
        layer.runAction(new cc.Sequence(
            new cc.Spawn(
                new cc.RotateBy(1, 695),
                new cc.ScaleTo(1, 1.25)
            ),
            new cc.DelayTime(0.2),
            new cc.Spawn(
                new cc.RotateTo(0.1, 0),
                new cc.ScaleTo(0.1, 1)
            )
        ));


        var button = new ccui.Button(GameResources.names.button_purple);
        button.setPosition(layer.getContentSize().width*0.5, layer.getContentSize().height * 0.2);
        layer.addChild(button);

        var buttonLabel = new cc.LabelTTF("Back", "Arial", 25);
        button.addChild(buttonLabel);
        buttonLabel.setPosition(button.getContentSize().width*0.5, button.getContentSize().height*0.5);

        layer.onTouchEvent = function(sender, type)
        {
            switch (type)
            {
                case ccui.Widget.TOUCH_ENDED:
                    finishLambda();
                    break;
                default:
                    break;
            }
        };
        button.addTouchEventListener(layer.onTouchEvent, layer);
    }
});