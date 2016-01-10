// WEBSPEECH API VARIABLES

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.lang = 'en_US';
recognition.interimResults = true;
recognition.onend = function() {recognition.start();}


var speechInput = '';
var final_transcript = '';

// GAME VARIABLES
var game = new Phaser.Game(700, 700, Phaser.AUTO, '', { preload: preload, create: create, update: update });
game.ScaleManager

var player;
var monsters = [];
var platforms;
var cursors;
var animationRunning = false;

var stars;
var score = 0;
var selectedPlayerText;


// New variables
var playerHealth;
var enemyHealth;
var healthBarWidth = 300;
var healthBarHeight = 30;
var AP = 10;
var APText;
var aKey;
var explosion;
var playerXPos;
var playerYPos;
var SFX;

var SCALE = 1;
// New variables

var colors = ['red', 'green', 'blue'];


function preload() {
    //Cessmap background. Each square is 100px.
    game.load.image('chessmap', 'assets/chessmap.png');

    // Create soldiers
    for(var color of colors){
    game.load.spritesheet(
      color+'soldier', //Name
      'assets/'+color+'soldier_spritesheet.png', // Image file
       100, 100); // The size of each frame
    }

    game.load.spritesheet('monster', 'assets/monster_spritesheet.png', 100, 100);

    // New preloads
    game.load.image('healthBar', 'assets/health.png');
    game.load.spritesheet('explosion', 'assets/explosion.png', 32,32);
    game.load.audio('sfx', 'assets/SFX/Explosion.wav');
    // New preloads
}


// Get frames numbers for a row from a spritesheet.
function row(row, col){return _.range(col*row, col*row+col);}

recognition.onresult = function(event) {

    var speechInput = '';

    // Put all results into a single string
    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
        } else {
            speechInput += event.results[i][0].transcript.toLowerCase();
        }
    }

    game.debug.text(speechInput, game.world.height/2-20, game.world.width/2-30, "#000000");

    // A simple function to check if a word has been heard.
    var match = '';
    if(animationRunning === false) {

        // SELECTION COMMANDS
        if (match  = speechInput.match('(red|green|blue)')) {
            player = soldiers.iterate('key', match[0]+'soldier', Phaser.Group.RETURN_CHILD);
            selectedPlayerText.text = match[0];
            selectedPlayerText.style.fill = match[0];
        }

        // MOVEMENT COMMANDS
        if (match = speechInput.match('(up|left|right|down)')) {
          walk(player, match[0]);
          monsterAction();
        }
    }
        // // New update functions
        // aKey.onDown.add(attackEnemy, this);
        // if (speechInput.indexOf('attack') > -1){
        //      attackEnemy();
        // }
        // eKey.onDown.add(createExplosion, this);
        // // New update functions

}

function create() {

    // New create stuff
    SFX = game.add.audio('sfx');
    SFX.allowMultiple = true;

    // Define keys
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    eKey = game.input.keyboard.addKey(Phaser.Keyboard.E);
    // New create stuff

    //  A simple background for our game
    game.add.sprite(0, 0, 'chessmap');

    createSoldiers();
    createMonsters();
    // New create stuff
    createHealthBars();
    // New create stuff

    //  Finally some stars to collect
    stars = game.add.group();
    stars.enableBody = true;

    //  Here we'll create some stars and place them at random squares across the board
    // oddNumbers = [1,3,5,7,9,11,13];
    // for (var i = 0; i < 5; i++)
    // {
    //     randOddX = oddNumbers[Math.floor(Math.random()*6)];
    //     randOddY = oddNumbers[Math.floor(Math.random()*6)];
    //     randPlaceX = Math.floor((Math.random() * randOddX) + 1) * 50;
    //     randPlaceY = Math.floor((Math.random() * randOddY) + 1) * 50;
    //     console.log(randPlaceX);
    //     console.log(randPlaceY);
    //     //  Create a star inside of the 'stars' group
    //     var star = stars.create(randPlaceX, randPlaceY, 'star');
    //     i = i+1;
    // }

    //  The score
    game.add.text(16, 30, 'Selected:', { font: '32px VT323', fill: '#000' });
    selectedPlayerText = game.add.text(150, 30, 'NONE', { font: 'bold 32px VT323', fill: '#FFF' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    // // Button
    // var graphics = game.add.graphics(698, -250);
    // // set a fill and line style
    // graphics.beginFill(0xff6cff);
    // graphics.lineStyle(2, 0x77ffcc, 1);
    // // draw a rectangle
    // graphics.drawRect(0, 250, 100, 25);
    // graphics.endFill();
    // buttonText = game.add.text(704, 2, 'step. walk', { fontSize: '16px', fill: '#000' });
    // // input
    // graphics.inputEnabled = true;
    // graphics.input.useHandCursor = true;
    // graphics.events.onInputDown.add(function () {
    //     if(SOMETHING) {
    //         buttonText.setText('SOMETHING');
    //     } else {
    //         buttonText.setText('SOMETHING ELSE');
    //     }
    // }, this);

    // Start speech recognition
    recognition.start();
}

function update() { // Empty right now but should contain buttons

    if(animationRunning === false) {
        if (cursors.left.isDown) {
            walk(player, 'left');
            monsterAction();
        } else if (cursors.right.isDown) {
            walk(player, 'right');
            monsterAction();
        } else if (cursors.down.isDown) {
            walk(player, 'down');
            monsterAction();
        } else if (cursors.up.isDown) {
            walk(player, 'up');
            monsterAction();
        }

        // New update functions
        aKey.onDown.add(attackEnemy, this);
        if (speechInput.indexOf('attack') > -1){
            attackEnemy();
        }
        eKey.onDown.add(createExplosion, this);
        // New update functions
    }
}

function createSoldiers() {

    //Create soldier group
    soldiers = game.add.group();
    soldiers.enableBody = true;

    //Add soldiers to group. Set anchor to middle so that character can be flipped without movement.

    for (var i = 0; i < colors.length; i++) {
      var soldier = soldiers.create(250 + i*100, 650, colors[i]+'soldier');
      soldier.anchor.setTo(.5, .5);
    }

    //Add animations to group
    soldiers.callAll('animations.add', 'animations', 'walk_down', row(0, 4), 10, true);
    soldiers.callAll('animations.add', 'animations', 'walk_up', row(1, 4), 10, true);
    soldiers.callAll('animations.add', 'animations', 'walk_left', row(2, 4), 10, true);
    animationRunning = false;
}

function createMonsters() {

    //Create monster group
    monsters = game.add.group();
    monsters.enableBody = true;

    //Add monsters to group
    for (var i = 0; i < 3; i++) {
        var monster = monsters.create(250 + i*100, 50, 'monster');
        monster.anchor.setTo(.5, .5);
    }

    //Add animations to group. Play animation continously.
    monsters.callAll('animations.add', 'animations', 'walk_down', row(0, 3), 10, true);
    monsters.callAll('play', null, 'walk_down');
}

function walk (character, direction) {
    var x = 0;
    var y = 0;

    character.scale.setTo(SCALE,SCALE); //Unmirror character

    switch(direction){
        case 'up': y = -100; break;
        case 'down': y = 100; break;
        case 'left':x = -100; break;
        case 'right': x = 100;
        character.scale.setTo(-SCALE,SCALE); //mirror character
        direction = 'left'; // Since mirrored, play left animation.
        break;
    }

    //Calculate new position
    var newX = character.x + x;
    var newY = character.y + y;

    //Create a transition to the new location
    if(newX < game.world.width && newX > 0 && newY < game.world.height && newY > 0) {
        character.animations.play('walk_'+direction, 10, true);
        animationRunning = true;
        console.log(character.key+' is moving')
        tween = this.game.add.tween(character).to({x:newX, y:newY}, 800, null, true);
        tween.onComplete.addOnce(stopWalking, this);
    }
    else {
        stopWalking(character);
    }

}

function stopWalking (character) {
    //Stop walking animations
    player.animations.stop('walk_left',true);
    player.animations.stop('walk_up',true);
    player.animations.stop('walk_down',true);
    animationRunning = false;
    character.frame = 0;
    console.log(character.key+' is idle');
}

function monsterAction () {
    playerXPos = player.position.x;
    playerYPos = player.position.y;
    var randomMon = monsters.getRandom();
    console.log(randomMon);
    monsterXPos = randomMon.position.x;
    monsterYPos = randomMon.position.y;

    if (Math.abs(playerXPos - monsterXPos) < Math.abs(playerYPos - monsterYPos)
        || Math.abs(playerXPos - monsterXPos) == Math.abs(playerYPos - monsterYPos)) {
        if (playerYPos > monsterYPos) {
            walk(randomMon, 'down');
        } else {
            walk(randomMon, 'up');
        }
    } else if (Math.abs(playerXPos - monsterXPos) > Math.abs(playerYPos - monsterYPos)
        || Math.abs(playerXPos - monsterXPos) == Math.abs(playerYPos - monsterYPos)) {
        if (playerXPos > monsterXPos) {
            walk(randomMon, 'right');
        } else {
            walk(randomMon, 'left');
        }
    }
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
    selectedPlayerText.text = 'Score: ' + score;

}

// New Functions

function decreaseEnemyHealth(){
    enemyHealthBar.cropRect.width -= healthBarWidth*0.1;
    enemyHealthBar.updateCrop();
}

function decreaseAP(){
    AP -= 1;
    APText.text = 'AP: ' + AP;
}


function attackEnemy(){


    playerXPos = player.position.x;
    playerYPos = player.position.y;

    console.log(monster.position);
    walk(
    player,
    monster.position.x-player.position.x,
    monster.position.y-player.position.y+monster.height,
    'walk_up',
    2);

    //(character, destinationX, destinationY, animation, animationVal)

    //player.scale.setTo(-1,1); //Mirror character
    animationRunning = true;
    tween.onComplete.addOnce(createExplosion, this);
    tween.onComplete.addOnce(decreaseAP, this);

    tween.onComplete.addOnce(decreaseEnemyHealth, this);
    tween.onComplete.addOnce(stopWalking, this);
    tween.onComplete.addOnce(moveBack, this);
    player.animations.play('walk_up',20,true);

}

function moveBack(){
    walk(
    player,
    playerXPos- player.position.x,
    playerYPos- player.position.y,
    'walk_back',
    2);

    animationRunning = true;
    tween.onComplete.addOnce(stopWalking, this);
    player.animations.play('walk_down',20,true);

}

function createExplosion(){
    var explosion = this.add.sprite(monster.x, monster.y, 'explosion');
    explosion.anchor.setTo(0.5, 0.5);
    explosion.animations.add('boom');
    explosion.play('boom', 15, false, true);
    SFX.play();
}

function createHealthBars(){
    playerHealthBar = game.add.sprite(0, game.world.height-healthBarHeight, 'healthBar');   /////////
    playerHealthBar.crop(new Phaser.Rectangle(0,0,healthBarWidth,healthBarHeight));
    enemyHealthBar = game.add.sprite(0, 0, 'healthBar');    /////////
    enemyHealthBar.crop(new Phaser.Rectangle(0,0,healthBarWidth,healthBarHeight));
    APText = game.add.text(0, game.world.height-(healthBarHeight*2), 'AP: ' + AP, { font: '32px VT323',           fill: '#000' });
}





// New functions
