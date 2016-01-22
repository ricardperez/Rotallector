/**
 * Created by ricardperez on 22/01/16.
 */
var MenuScene = cc.Scene.extend({
    ctor: function () {
        this._super();

        var me = this;
        var createMenuItem = function (title, identifier) {
            var menuItem = new MenuItemButton(GameResources.images.button_purple, title, function () {
                me.onMenuItemClicked(identifier)
            });
            return menuItem;
        };

        var levelsJson = cc.loader.getRes(GameResources.json.levels_list);
        this.levelsList = levelsJson["data"];
        var menuItems = [];

        for (var i = 0; i < this.levelsList.length; i++) {
            var level = this.levelsList[i];
            menuItems.push(createMenuItem(level["level"], i));
        }

        var menu = new cc.Menu(menuItems);
        menu.alignItemsVertically();
        menu.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
        this.addChild(menu);

        return true;
    },

    onMenuItemClicked: function (identifier) {
        var transitionScene = new cc.TransitionSlideInR(1.0, new GameScene(this.levelsList[identifier]), false);
        cc.Director.sharedDirector.runScene(transitionScene);
    },
});
