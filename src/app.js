
var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        var helloLabel = new cc.LabelTTF("Hello World", "Arial", 38);
        // position the label on the center of the screen
        helloLabel.x = size.width / 2;
        helloLabel.y = size.height / 2 + 200;
        // add the label as a child to this layer
        this.addChild(helloLabel, 5);

        // add "HelloWorld" splash screen"
        this.sprite = new cc.Sprite(res.HelloWorld_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2
        });
        this.addChild(this.sprite, 0);

        var button = new ccui.Button(res.button_purple);
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
                cc.LoaderScene.preload(GameScene.g_resources, function () {
                    var transitionScene = new cc.TransitionSlideInR(1.0, new GameScene(), false);
                    cc.Director.sharedDirector.runScene(transitionScene);
                }, this);
                break;
            default:
                break;
        }
    }
});

var HelloWorldScene = cc.Scene.extend({
    ctor:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

