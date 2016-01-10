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
var game = new Phaser.Game(700, 700, Phaser.CANVAS, '', { preload: preload, create: create, update: update });
game.ScaleManager

var player;
var monsters = [];
var platforms;
var cursors;
var animationRunning = false;

var stars;
var score = 0;
var selectedPlayerText;
var selectedPlayerText;


// New variables
var qKey;
var explosion;
var playerXPos;
var playerYPos;
var SFX;

var SCALE = 3;
// New variables

var colors = ['red', 'green', 'blue'];


function preload() {

    // Disable smoothing
    game.stage.smoothed = false;
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
          selectPlayer(match[0])
        }

        // MOVEMENT COMMANDS
        if (match = speechInput.match('(up|left|right|down)')) {
          walk(player, match[0]);
          monsterAction();
        }
    }

}

function create() {

    // New create stuff
    SFX = game.add.audio('sfx');
    SFX.allowMultiple = true;


    //  A simple background for our game
    game.add.sprite(0, 0, 'chessmap');

    //  Create our controls.
    configureKeys();

    createSoldiers();
    createMonsters();

    //  Finally some stars to collect
    stars = game.add.group();
    stars.enableBody = true;

    //  The select text
    game.add.text(10, 5, 'Selected:', { font: '20px "Press Start 2P"', fill: '#000' });
    selectedPlayerText = game.add.text(200, 5, 'red', { font: '20px "Press Start 2P"'});
    // Set default selected player
    selectPlayer('red')

    // The text that counts the amount of moves
    game.add.text(10, 35, 'Score:', { font: '20px "Press Start 2P"', fill: '#000' });

    scoreText = game.add.text(140, 35, score, { font: '20px "Press Start 2P"', fill: '#FFF'});

    // Start speech recognition
    recognition.start();
}

function update() {
  // Empty right now
}
function configureKeys() {
      // Define keys
      var key_ONE = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
      var key_TWO = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
      var key_THREE = game.input.keyboard.addKey(Phaser.Keyboard.THREE);
      var key_W = game.input.keyboard.addKey(Phaser.Keyboard.W);
      var key_A = game.input.keyboard.addKey(Phaser.Keyboard.A);
      var key_S = game.input.keyboard.addKey(Phaser.Keyboard.S);
      var key_D = game.input.keyboard.addKey(Phaser.Keyboard.D);
      var cursors = game.input.keyboard.createCursorKeys();

      qKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);
      eKey = game.input.keyboard.addKey(Phaser.Keyboard.E);

      // Walking function
      var playerWalk= function(direction){
        if (!animationRunning) {
          walk(player, direction);
          monsterAction();
          updateScore();
        }
      }

      // Add callbacks to keys
      // selection keys
      key_ONE.onDown.add(function(){selectPlayer('red')}, this );
      key_TWO.onDown.add(function(){selectPlayer('blue')}, this );
      key_THREE.onDown.add(function(){selectPlayer('green')}, this );
      // movement keys
      key_W.onDown.add(function(){playerWalk('up')}, this );
      key_A.onDown.add(function(){playerWalk('left')}, this );
      key_S.onDown.add(function(){playerWalk('down')}, this );
      key_D.onDown.add(function(){playerWalk('right')}, this );
      cursors.up.onDown.add(function(){playerWalk('up')}, this );
      cursors.left.onDown.add(function(){playerWalk('left')}, this );
      cursors.down.onDown.add(function(){playerWalk('down')}, this );
      cursors.right.onDown.add(function(){playerWalk('right')}, this );

}

function createSoldiers() {

    //Create soldier group
    soldiers = game.add.group();
    soldiers.enableBody = true;

    //Add soldiers to group. Set anchor to middle so that character can be flipped without movement.

    for (var i = 0; i < colors.length; i++) {
      var soldier = soldiers.create(250 + i*100, 650, colors[i]+'soldier');
      soldier.anchor.setTo(.5, .5);
      soldier.scale.setTo(SCALE);
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
        var monster = monsters.create(250 + i*100, 350, 'monster');
        monster.anchor.setTo(.5, .5);
        monster.scale.setTo(SCALE);
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
    createExplosion();
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

function selectPlayer(color){
  player = soldiers.iterate('key', color+'soldier', Phaser.Group.RETURN_CHILD);
  selectedPlayerText.text = color;
  selectedPlayerText.style.fill = color;
}

// New Functions

function createExplosion(){
    var explosion = game.add.sprite(104, 104, 'explosion');
    explosion.scale.setTo(SCALE);
    explosion.animations.add('boom');
    explosion.play('boom', 20, false, true);
    SFX.play();
}

function updateScore(){
  score++;
  scoreText.text = score;
}

function createHealthBars(){
    playerHealthBar = game.add.sprite(0, game.world.height-healthBarHeight, 'healthBar');   /////////
    playerHealthBar.crop(new Phaser.Rectangle(0,0,healthBarWidth,healthBarHeight));
    enemyHealthBar = game.add.sprite(0, 0, 'healthBar');    /////////
    enemyHealthBar.crop(new Phaser.Rectangle(0,0,healthBarWidth,healthBarHeight));
    APText = game.add.text(10, game.world.height-(healthBarHeight*2), 'AP: ' + AP, { font: '20px "Press Start 2P"',           fill: '#000' });
}





// New functions
