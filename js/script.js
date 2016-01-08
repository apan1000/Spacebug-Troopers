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
var redsoldier;
var greensoldier;
var bluesoldier;
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
// New variables


function preload() {
    //Cessmap background. Each square is 100px.
    game.load.image('chessmap', 'assets/chessmap.png');
    game.load.image('star', 'assets/star.png');
    //game.load.spritesheet('voxobot', 'assets/voxobot.png', 64, 96);
    game.load.spritesheet('redsoldier', 'assets/redsoldier_spritesheet.png', 100, 100);
    game.load.spritesheet('greensoldier', 'assets/greensoldier_spritesheet.png', 100, 100);
    game.load.spritesheet('bluesoldier', 'assets/bluesoldier_spritesheet.png', 100, 100);
    game.load.spritesheet('monster', 'assets/monster_spritesheet.png', 100, 100);

    // New preloads
    game.load.image('healthBar', 'assets/health.png');
    game.load.spritesheet('explosion', 'assets/explosion.png', 32,32);
    game.load.audio('sfx', 'assets/SFX/Explosion.wav');
    // New preloads
}


// Get frames for a row from a spritesheet.
function row(number, col){
    if (col == 4) {
        var pos = number*4;
        return [pos, 1+pos, 2+pos, 3+pos];
    } else if (col == 3) {
        var pos = number*3;
        return [pos, 1+pos, 2+pos];
    }
}

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
    var contains = function(word){
      var result = speechInput.indexOf(word) > -1;
      if(result){ match = word;}
      return speechInput.indexOf(word) > -1;
    }


    if(animationRunning === false) {

        // SELECTION COMMANDS
        if (contains('red')|contains('green')|contains('blue')) {
            player = soldiers.iterate('key', match+'soldier', Phaser.Group.RETURN_CHILD);
            selectedPlayerText.text = match;
            selectedPlayerText.style.fill = match;
        }

        // MOVEMENT COMMANDS
        if (contains('left')) {
            //Move left
            walk(player, -100, 0, 'walk_left', 10);
            player.scale.setTo(1,1); //Mirror character

            monsterAction();

        } else if (contains('right')) {

            //Move right
            walk(player, 100, 0, 'walk_left', 10);
            player.scale.setTo(-1,1); //Unmirror character

            monsterAction();

        } else if (contains('down')) {

            //Move down
            walk(player, 0, 100, 'walk_down', 10);
            player.scale.setTo(1,1); //Unmirror character

            monsterAction();

        } else if (contains('up')) {

            //Move up
            walk(player, 0, -100, 'walk_up', 10);
            player.scale.setTo(1,1); //Unmirror character

            monsterAction();
        }
    }
        // New update functions
        aKey.onDown.add(attackEnemy, this);
        if (contains('attack')){
             attackEnemy();
        }
        eKey.onDown.add(createExplosion, this);
        // New update functions

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
    selectedPlayerText = game.add.text(150, 30, 'ALL', { font: 'bold 32px VT323', fill: '#FFF' }); //"All" not implemented just jet...

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
}

function createSoldiers() {

    //Create soldier group
    soldiers = game.add.group();
    soldiers.enableBody = true;

    //Add soldiers to group. Set anchor to middle so that character can be flipped without movement.
    var greensoldier = soldiers.create(250, 650, 'greensoldier');
    greensoldier.anchor.setTo(.5, .5);

    var redsoldier = soldiers.create(350, 650, 'redsoldier');
    redsoldier.anchor.setTo(.5, .5);

    var bluesoldier = soldiers.create(450, 650, 'bluesoldier');
    bluesoldier.anchor.setTo(.5, .5);

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
    var x = 0;
    for (var i = 0; i < 3; i++) {
        var monster = monsters.create(250 + x, 50, 'monster');
        monster.anchor.setTo(.5, .5);
        x = x + 100;
    }

    //Add animations to group. Play animation continously.
    monsters.callAll('animations.add', 'animations', 'walk_down', row(0, 3), 10, true);
    monsters.callAll('play', null, 'walk_down');
}

function walk (character, destinationX, destinationY, animation, animationVal) {

    console.log("Character: ", character.key);

    //Calculate new position
    var newX = character.x + destinationX;
    var newY = character.y + destinationY;

    //Create a transition to the new location
    if(newX < game.world.width && newX > 0 && newY < game.world.height && newY > 0) {
        character.animations.play(animation, animationVal, true);
        animationRunning = true;
        console.log(character.key+' is moving')
        tween = this.game.add.tween(character).to({x:newX, y:newY}, 800, null, true);
        tween.onComplete.addOnce(stopWalking, this);
    } else {
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
            walk(randomMon, 0, 100, 'walk_down', 10);
        } else {
            walk(randomMon, 0, -100, 'walk_up', 10);
        }
    } else if (Math.abs(playerXPos - monsterXPos) > Math.abs(playerYPos - monsterYPos)
        || Math.abs(playerXPos - monsterXPos) == Math.abs(playerYPos - monsterYPos)) {
        if (playerXPos > monsterXPos) {
            walk(randomMon, 100, 0, 'walk_right', 10);
        } else {
            walk(randomMon, -100, 0, 'walk_left', 10);
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
