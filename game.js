var currentCards = [
    ["butters", 1],
    ["cartman", 1],
    ["garrison", 1],
    ["hankey", 4],
    ["kenny", 1],
    ["kyle", 1],
    ["mackey", 1],
    ["manbearpig", 5],
    ["randy", 1],
    ["stan", 1],
    ["towelie", 3],
    ["chef", 3],
    ["ike", 2],
    ["jesus", 5],
    ["gerald", 1],
    ["sheila", 1],
    ["satan", 5],
    ["jefferson", 2]
];

var pairsDiscovered = 0;
var columns = 6;
var rows = 6;
var cards = [];
var lastAudioObject = null;
var failureCounter = 0;
var gameOver = false;

function CardObject(name, value, id) {
    var path = "cards/" + name + "/";
    this.name = name;
    this.image = path + name + ".png";
    this.sound = path + name + ".mp3";
    this.soundObject = new Audio(this.sound);
    this.value = value;
    this.id = id;
}

$(document).ready(function () {
    // create cardboard
    var id = 1;
    for (var i = 0; i < currentCards.length; i++) {
        cards.push(new CardObject(currentCards[i][0], currentCards[i][1], id++));
        cards.push(new CardObject(currentCards[i][0], currentCards[i][1], id++));
    }

    // shuffle the cards
    cards.sort(function () { return 0.5 - Math.random() });

    var cardbody = $("#gamebody");
    cardbody.empty();

    pairsDiscovered = 0;
    var x = 0;
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns; c++) {
            addCard(cardbody, cards[x], (c == 0));
            x++;
        }
    }

    // set widths + center the board part.
    cardbody.width($(".card").outerWidth(true) * columns);
    cardbody.css("margin-left", "-" + ($(".card").outerWidth(true) * columns / 2).toString() + "px");

    window.setTimeout(randomAnimation, 6000);
    window.setTimeout(elapsedTime, 1000);

    $(window).resize(function () {
        window.setTimeout(function () {
            resizeBoard();
        }, 100);
    });

    resizeBoard();
});

function resizeBoard() {
    $(".card").innerHeight(110 * (window.innerHeight / 949) + "px");
}

var secElapsed = 0;
function elapsedTime() {
    if (gameOver)
        return;

    secElapsed += 1;
    var min = Math.floor(secElapsed / 60);
    var sec = secElapsed % 60;
    $("#timeelapsed").text("TIME ELAPSED " + (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec);
    window.setTimeout(elapsedTime, 500);
}

function addCard(cardbody, cardData, doclear) {
    var newCard = $("<div></div>");
    newCard.addClass("card");
    if (doclear)
        newCard.addClass("clearleft");
    newCard.data("card", cardData);

    var frontPart = $("<div></div>");
    frontPart.addClass("cardface");
    frontPart.addClass("cardfront");
    frontPart.on("click", function () {
        var current = $(this);
        current.parent().css("transform", "rotateY(180deg)");
        window.setTimeout(function () {
            playerFlippedCard(current.parent());
        }, 550);
    });
    newCard.append(frontPart);

    var backPart = $("<div></div>");
    var backLabel = $("<p></p>");
    backPart.addClass("cardface");
    backPart.addClass("cardback");
    backPart.css("background-image", "url(" + cardData.image + ")");
    backLabel.text(cardData.name);
    backLabel.addClass("characterlabel");
    backPart.append(backLabel);
    newCard.append(backPart);

    cardbody.append(newCard);
}

var randomBusRageSounds = ["extra/bus_rage_01.mp3", "extra/bus_rage_02.mp3", "extra/bus_rage_03.mp3"];
function randomAnimation() {
    var distance = window.outerWidth + 5;
    $("#animobject").animate({ left: distance + "px" }, 3500, function () {
        $(this).css("left", "-600px");
        randomTime = Math.floor(45000 + Math.random() * 110000);
        window.setTimeout(randomAnimation, randomTime);
    });

    var busRageAudio = new Audio(randomBusRageSounds[Math.floor(Math.random() * randomBusRageSounds.length)]);
    busRageAudio.play();
}

var lastCard;
var player1Score = 0;
var player2Score = 0;
var playerTurn = false; // false = plr 1, true = plr 2.
var cardsFlipped = 0;
var faultyFlipSounds = [
    "extra/pair_fail_01.mp3",
    "extra/pair_fail_02.mp3",
    "extra/pair_fail_03.mp3",
    "extra/pair_fail_04.mp3"
];

function playerFlippedCard(card) {
    cardsFlipped++;
    $("#cardsflipped").text("Total cards flipped: " + cardsFlipped);

    if (lastCard == undefined)
        lastCard = card;
    else {
        var card1Data = lastCard.data("card");
        var card2Data = card.data("card");
        var currentPlayer = playerTurn ? "#player2" : "#player1";
        var otherPlayer = playerTurn ? "#player1" : "#player2";
        var isUnique = (card1Data.id != card2Data.id);

        if ((card1Data.name == card2Data.name) && isUnique) {

            failureCounter = 0;
            var scoreHeading = $(currentPlayer).find("h3");
            if (playerTurn) {
                player2Score += card1Data.value;
                scoreHeading.text("Score: " + player2Score);
                scoreAnimation("#scoreplr2", "+" + card1Data.value);
            }
            else {
                player1Score += card1Data.value;
                scoreHeading.text("Score: " + player1Score);
                scoreAnimation("#scoreplr1", "+" + card1Data.value);
            }

            stopLastSound();
            card1Data.soundObject.play();
            pairsDiscovered++;
            if (pairsDiscovered >= (columns * rows) / 2) {
                endGame();
            }
        }
        else {
            card.css("transform", "rotateY(0deg)");
            lastCard.css("transform", "rotateY(0deg)");

            $(currentPlayer).toggleClass("activeplayer");
            $(otherPlayer).toggleClass("activeplayer");
            playerTurn = !playerTurn;

            playFailureSound();
        }

        lastCard = undefined;
    }
}

function endGame() {
    gameOver = true;
    $("#gamebody").fadeOut("slow", function () { displayResults(); });
}

function displayResults() {
    if (player1Score == player2Score)
        $("#enddialogtext").text("IT'S A DRAW!");
    else if (player1Score > player2Score)
        $("#enddialogtext").text("PLAYER 1 WON!");
    else
        $("#enddialogtext").text("PLAYER 2 WON!");

    $("#enddialog").fadeIn("slow");
}

function scoreAnimation(object, text) {
    $(object).text(text);
    $(object).fadeIn("fast");
    $(object).animate({ top: "65px" }, 700, function () {
        $(this).fadeOut("slow", function () {
            $(this).css("display", "none");
            $(this).css("top", "150px");
        });
    });
}

function stopLastSound() {
    if (lastAudioObject != null) {
        lastAudioObject.pause();
        lastAudioObject.currentTime = 0;
    }
}

function playFailureSound() {
    failureCounter++;

    if (failureCounter > 4) {
        failureCounter = 0;
        stopLastSound();
        lastAudioObject = new Audio(faultyFlipSounds[Math.floor(Math.random() * faultyFlipSounds.length)]);
        lastAudioObject.play();
    }
}

function onRetry() {
    $("#enddialog").fadeOut("slow", "linear", function () { location.reload(); });
}