$(document).ready(function () {
    $("#startgame").click(function () {
        $("#mainmenu").fadeOut("slow", function () { onStartGame(); });
    });

    $("#options").animate({ top: "50%" }, 1250, "linear", function () {
        onTransformMainMenu($("#mainmenu"), $(this));
    });
});

function onTransformMainMenu(menu, options) {
    menu.animate({ top: "50%", height: (options.outerHeight(true) + 20) + "px", borderRadius: "10px" }, "slow");

    var audio = new Audio("extra/intro.mp3");
    audio.play();
}

function onStartGame() {
    document.location.href = "game.html";
}