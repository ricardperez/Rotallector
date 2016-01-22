GameResources = function(){};

GameResources.images = {
    hello_world : "res/HelloWorld.png",
    button_purple : "res/button_purple.png",
    Ball: "res/ball.png",
    black_line: "res/black_line.png",
    launcher: "res/launcher.png",
    collector_branch: "res/collector_branch.png"
};

GameResources.json = {
    levels_list: "res/levels_list.json",
    collector_shapes: "res/collector_shapes.json",
}

GameResources.g_resources = [];
for (var i in GameResources.images) {
    GameResources.g_resources.push(GameResources.images[i]);
}
for (var i in GameResources.json) {
    GameResources.g_resources.push(GameResources.json[i]);
}
