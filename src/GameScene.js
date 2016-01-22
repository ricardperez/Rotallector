/**
 * Created by ricardperez on 20/01/16.
 */
var GameScene = cc.Scene.extend({
    ui: null,
    gameController: null,
    finished: false,

    ctor: function (levelData) {
        this._super();

        var whiteBackgroundLayer = new cc.LayerColor(new cc.Color(255, 255, 255), this.getContentSize().width, this.getContentSize().height);
        this.addChild(whiteBackgroundLayer);

        this.gameController = new GameController(this, levelData);

        this.ui = new GameUI();
        this.ui.updateTimeLeft(this.gameController.getTimeLeft());
        this.addChild(this.ui, 100);
    },

    onEnterTransitionDidFinish: function () {
        this._super();

        this.scheduleUpdate();
    },

    update: function (dt) {
        this._super();

        if (!this.gameController.isFinished())
        {
            this.gameController.update(dt);

            this.ui.updateScore(this.gameController.getScore());
            this.ui.updateTimeLeft(this.gameController.getTimeLeft());
        }
        else
        {
            if (!this.finished)
            {
                var me = this;
                this.finished = true;
                this.ui.updateScore(this.gameController.getScore());
                this.ui.presentOutro(this.gameController.getScore(), function() {
                    me.gameController.destroy();
                    var transitionScene = new cc.TransitionSlideInL(1.0, new MenuScene(), false);
                    cc.Director.sharedDirector.runScene(transitionScene);
                });
            }
        }
    }
});

