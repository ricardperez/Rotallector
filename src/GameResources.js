GameResources = function(){};

GameResources.names = {
    HelloWorld_png : "res/HelloWorld.png",
    button_purple : "res/button_purple.png",
    Ball: "res/ball.png",
    BlackLine: "res/black_line.png",
    Launcher: "res/launcher.png",
    CollectorBranch: "res/collector_branch.png",
};

GameResources.g_resources = [];
for (var i in GameResources.names) {
    GameResources.g_resources.push(GameResources.names[i]);
}
