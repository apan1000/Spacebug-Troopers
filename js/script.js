var game = new Phaser.Game(1000, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
game.ScaleManager

function preload() {
    game.load.image('sky', 'assets/desert.png');
    game.load.image('ground', 'assets/floor.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);

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
var platforms;
var cursors;

var stars;
var score = 0;
var scoreText;
var isFacingLeft = true;

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
    console.log(speechInput);
    // console.log(final_transcript);


    // if (event.results.length > 0) {
    //     speechInput = event.results[0][0].transcript;
    //     console.log(speechInput);
    //     su.text = speechInput;
    //     speechSynthesis.speak(su);
    // }

}

function create() {

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(-game.world.width/4, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 100x100 in size)
    ground.scale.setTo(1, 1);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.scale.setTo(.35, .5);
    ledge.body.immovable = true;

    ledge = platforms.create(50, 250, 'ground');
    ledge.scale.setTo(.2, .5);
    ledge.body.immovable = true;

    ledge = platforms.create(200, 100, 'ground');
    ledge.scale.setTo(.3, .5);
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');
    // Set anchor to middle so that character can be flipped without movement.
    player.anchor.setTo(.5, .5);

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    // player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');
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

    if (cursors.left.isDown
        || speechInput.indexOf('left') > -1
        && !cursors.right.isDown
        )
    {
        //  Move to the left
        player.x  -= 4;
        if(!isFacingLeft){
          isFacingLeft = true;
          player.scale.x *= -1; // Flip character.
        }
        player.animations.play('left');
    } else if (cursors.right.isDown
        || speechInput.indexOf('right') > -1
        && !cursors.left.isDown
        ) {
        //  Move to the right
        player.x  += 4;
        if (isFacingLeft) {
          isFacingLeft = false;
          player.scale.x *= -1; // Flip character.
        }
        player.animations.play('left');
    } else {
        //  Stand still
        player.animations.stop();
        player.frame = 4;
    }

    if (cursors.up.isDown
        || speechInput.indexOf('up') > -1
        ) {
        //  Move up
        player.y  -= 4;
        // speechInput = '';
    }

    if (cursors.down.isDown
        || speechInput.indexOf('down') > -1) {
        //  Move down
        player.y  += 4;
        // speechInput = '';
    }

}

function collectStar (player, star) {
    // Removes the star from the screen
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
