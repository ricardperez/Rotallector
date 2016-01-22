/**
 * Created by ricardperez on 22/01/16.
 */
MenuItemButton = cc.MenuItem.extend(/** @lends cc.MenuItemSprite# */{
    sprite: null,
    callback: null,

    ctor: function (spriteSrc, title, callback) {
        cc.MenuItem.prototype.ctor.call(this);

        this.callback = callback;
        this._enabled = true;

        this.sprite = new cc.Sprite(spriteSrc);
        this.sprite.setAnchorPoint(0,0);

        var label = new cc.LabelTTF(title, cc._globalFontName, cc._globalFontSize);
        this.sprite.addChild(label);
        label.setPosition(this.sprite.getContentSize().width*0.5, this.sprite.getContentSize().height*0.5);

        this.addChild(this.sprite);
        this.setContentSize(this.sprite.getContentSize());
    },

    selected: function () {
        cc.MenuItem.prototype.selected.call(this);
        this.setScale(0.9);
    },

    unselected: function () {
        cc.MenuItem.prototype.unselected.call(this);
        this.setScale(1.0);
    },

    activate: function () {
        this.callback();
    }
});

Button = cc.Node.extend({
    ctor: function (spriteSrc, title, callback) {
        this._super();

        var menuItem = new MenuItemButton(spriteSrc, title, callback);
        var menu = new cc.Menu(menuItem);
        this.addChild(menu);
        this.setContentSize(menu.getContentSize());
        this.setAnchorPoint(0.5, 0.5);
    }
});