var game = new Phaser.Game(700, 700, Phaser.AUTO, '', { preload: preload, create: create, update: update });
game.ScaleManager

function preload() {
    //Cessmap background. Each square is 100px.
    game.load.image('chessmap', 'assets/chessmap.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('baddie', 'assets/baddie.png', 32, 48);

}

var language = 'en';

var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.lang = language;
recognition.interimResults = true;
var speechInput = '';
var final_transcript = '';

var stepping = true;

var su = new SpeechSynthesisUtterance();
su.lang = language;
su.rate = 6;
su.pitch = 0.5;
su.text = 'Hello World';
speechSynthesis.speak(su);

var player;
var baddie;
var platforms;
var cursors;
var animationRunning = false;

var stars;
var score = 0;
var scoreText;

recognition.onresult = function(event) {
  // if (event.results.length > 0) {
    speechInput = '';
    // console.log(event);
    // for (var i = event.resultIndex; i < event.results.length; ++i) {
    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if(stepping) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                speechInput += event.results[i][0].transcript.toLowerCase();
            }
        } else {
            speechInput += event.results[i][0].transcript.toLowerCase();
        }

    }
    console.log("Input: ", speechInput);


    // if (event.results.length > 0) {
    //     speechInput = event.results[0][0].transcript;
    //     console.log(speechInput);
    //     su.text = speechInput;
    //     speechSynthesis.speak(su);
    // }

}

function create() {

    //  A simple background for our game
    game.add.sprite(0, 0, 'chessmap');

    createPlayer();
    createBaddie();

    //  Finally some stars to collect
    stars = game.add.group();
    stars.enableBody = true;

    //  Here we'll create some stars and place them at random squares across the board
    oddNumbers = [1,3,5,7,9,11,13];
    for (var i = 0; i < 5; i++)
    {
        randOddX = oddNumbers[Math.floor(Math.random()*6)];
        randOddY = oddNumbers[Math.floor(Math.random()*6)];
        randPlaceX = Math.floor((Math.random() * randOddX) + 1) * 50;
        randPlaceY = Math.floor((Math.random() * randOddY) + 1) * 50;
        console.log(randPlaceX);
        console.log(randPlaceY);
        //  Create a star inside of the 'stars' group
        var star = stars.create(randPlaceX, randPlaceY, 'star');
        i = i+1;
    }

    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    // Button
    var graphics = game.add.graphics(698, -250);
    // set a fill and line style
    graphics.beginFill(0xff6cff);
    graphics.lineStyle(2, 0x77ffcc, 1);
    // draw a rectangle
    graphics.drawRect(0, 250, 100, 25);
    graphics.endFill();
    buttonText = game.add.text(704, 2, 'step. walk', { fontSize: '16px', fill: '#000' });
    // input
    graphics.inputEnabled = true;
    graphics.input.useHandCursor = true;
    graphics.events.onInputDown.add(function () {
        stepping = !stepping;
        if(stepping) {
            buttonText.setText('step. walk');
        } else {
            buttonText.setText('cont. walk');
        }
    }, this);

    // Start speech recognition
    recognition.start();
}

function update() {

    if (speechInput.indexOf('left') > -1 && animationRunning === false
        || cursors.left.isDown
        && !cursors.right.isDown && animationRunning === false
        )
    {
        //tween left
        walk(-100,0);
        player.scale.setTo(1,1);
        animationRunning = true;
        tween.onComplete.addOnce(stopWalking, this);
        player.animations.play('walk',20,true);

    } else if (speechInput.indexOf('right') > -1 && animationRunning === false
        || cursors.right.isDown
        && !cursors.left.isDown && animationRunning === false
        ) {
        //tween right
        walk(100,0);
        player.scale.setTo(-1,1);
        animationRunning = true;
        player.animations.play('walk',20,true);
        tween.onComplete.addOnce(stopWalking, this);  
    } 

    if (cursors.up.isDown
        || speechInput.indexOf('up') > -1
        ) {
        //  Move up
        walk(0,-100);
        // speechInput = '';
    }

    if (cursors.down.isDown
        || speechInput.indexOf('down') > -1) {
        //  Move down
        walk(0,100);
        // speechInput = '';
    }

}

function createPlayer() {
    // The player and its settings
    player = game.add.sprite(350, 350, 'dude');
    // Set anchor to middle so that character can be flipped without movement.
    player.anchor.setTo(.5, .5);

    // Walking animation (turned left)
    player.animations.add('walk', [0, 1, 2, 3], 10, true);
    animationRunning = false;
    
    //player starts by standing still facing camera
    player.frame = 4;
}

function createBaddie() {
    // The player and its settings
    baddie = game.add.sprite(350, 50, 'baddie');
    // Set anchor to middle so that character can be flipped without movement.
    baddie.anchor.setTo(.5, .5);

    // Walking animation (turned left)
    //baddie.animations.add('walk', [0, 1, 2, 3], 10, true);
    //animationRunning = false;
    
    //player starts by standing still facing camera
    baddie.frame = 2;
}

function walk (destinationX, destinationY) {
    tween = this.game.add.tween(this.player).to({x:this.player.x + destinationX, y:this.player.y + destinationY}, 800, null, true);
}

function stopWalking (item) {
    player.animations.stop('walk',true);
    animationRunning = false;
    player.frame = 4;
}

function collectStar (player, star) {
    // Removes the star from the screen
    console.log("Gotcha!");
    star.kill();
    if (star.group) {
       star.group.remove(star);
    } else if (star.parent) {
       star.parent.removeChild(star);
    }
    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}
