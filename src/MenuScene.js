/**
 * Created by ricardperez on 22/01/16.
 */
var MenuScene = cc.Scene.extend({
    ctor: function () {
        this._super();

        var size = cc.winSize;

        var helloLabel = new cc.LabelTTF("Hello World", "Arial", 38);
        helloLabel.x = size.width / 2;
        helloLabel.y = size.height / 2 + 200;
        this.addChild(helloLabel, 5);

        this.sprite = new cc.Sprite(GameResources.names.HelloWorld_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2
        });
        this.addChild(this.sprite, 0);

        var button = new ccui.Button(GameResources.names.button_purple);
        button.setPosition(size.width*0.5, 100);
        this.addChild(button);

        var startPlayingLabel = new cc.LabelTTF("Start Playing", "Arial", 25);
        button.addChild(startPlayingLabel);
        startPlayingLabel.setPosition(button.getContentSize().width*0.5, button.getContentSize().height*0.5);

        button.addTouchEventListener( this.onTouchEvent, this );

        return true;
    },

    onTouchEvent: function(sender, type)
    {
        switch (type)
        {
            case ccui.Widget.TOUCH_ENDED:
                var transitionScene = new cc.TransitionSlideInR(1.0, new GameScene(), false);
                cc.Director.sharedDirector.runScene(transitionScene);
                break;
            default:
                break;
        }
    }
});
