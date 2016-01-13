
////////////////////////////////////////////////////////////////////////////////
// VARIABLES
////////////////////////////////////////////////////////////////////////////////

// WEBSPEECH API VARIABLES
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var recognition = new SpeechRecognition();

//webspeech setup
recognition.continuous = true;
recognition.lang = 'en_US';
recognition.interimResults = true;
recognition.onresult = OnVoiceRecognition;
recognition.onend = function() {console.log("Starting recognition again!"); recognition.start();}

function resetVoiceRecognition() {
	recognition.stop();
    recognition.start();
}

// GAME VARIABLES
var game = new Phaser.Game(700, 700, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render });

var player;
var monsters = [];
var platforms;
var cursors;
var animationRunning = false;
var freezeStone;
var monsterFreezeCount = 0;

var steps = 0;
// var selectedPlayerText;
var winText;

var qKey;

var explosion;
var boom_sfx;
var bonk_sfx;
var yes_commander;
var music;

var SCALE = 3;

var colors = ['red', 'green', 'blue'];
var monsterColors = [0x404040, 0xf0f000, 0xf050a0]; // Used for tinting
var monsterNames = ['black', 'yellow', 'orange'];

// High score
var highScore = [100, 101, 102];

window.onload = function() {
    if(localStorage.hs) {
        loadHighScore();
    } else {
        localStorage.hs = JSON.stringify(highScore);
        loadHighScore();
    }
}

function loadHighScore() {
    highScore = JSON.parse(localStorage.hs);
    console.log('highScore:', highScore);

    var highScoreList = document.getElementById('high-score');
    for(var score of highScore) {
        var newLi = document.createElement('li');
        newLi.innerHTML = score;
        highScoreList.appendChild(newLi);
    }
}

function saveHighScore() {
    if(localStorage.hs) {
        for(var i = 0; i < highScore.length; i++) {
            if(steps < highScore[i]) {
                highScore.splice(i, 0, steps);
                console.log('highScore changed',highScore);
                highScore.pop();
                localStorage.hs = JSON.stringify(highScore);
                break;
            }
            console.log(steps,'<',highScore[i]);
        }
    } else {
        console.log('highScore not saved');
        // Do nothing
    }

    var highScoreList = document.getElementById('high-score');
    highScoreList.innerHTML = ''
    for(var score of highScore) {
        var newLi = document.createElement('li');
        newLi.innerHTML = score;
        highScoreList.appendChild(newLi);
    }
}


////////////////////////////////////////////////////////////////////////////////
// Initialization
////////////////////////////////////////////////////////////////////////////////

function preload() {

    game.time.advancedTiming = true;

    // Disable smoothing
    game.stage.smoothed = false;
    //Cessmap background. Each square is 100px.
    game.load.image('chessmap', 'assets/chessmap.png');

    // Create soldiers
    for(var color of colors) {
    	game.load.spritesheet(
    		color+'soldier', //Name
    		'assets/'+color+'soldier_spritesheet_ORG.png', // Image file
    		28, 28 // The size of each frame
    	);
    }

    game.load.spritesheet('monster', 'assets/monster_ORG.png', 28, 28);

    // New preloads
    game.load.image('healthBar', 'assets/health.png');
    game.load.image('freezeStone', 'assets/diamond.png');
    game.load.spritesheet('explosion', 'assets/explosion.png', 32,32);
    game.load.audio('boom_sfx', 'assets/SFX/Explosion.wav');
    game.load.audio('bonk_sfx', 'assets/SFX/Bonk.wav');
    game.load.audio('space_music', ['assets/SFX/Space.mp3', 'assets/SFX/Space.ogg']);
    game.load.audio('yes_commander', ['assets/SFX/yes_commander.mp3', 'assets/SFX/yes_commander.ogg']);
}


function create() {

    // New create stuff
    boom_sfx = game.add.audio('boom_sfx');
    boom_sfx.allowMultiple = true;
    boom_sfx.volume = .35;

    bonk_sfx = game.add.audio('bonk_sfx');
    bonk_sfx.allowMultiple = true;

    yes_commander = game.add.audio('yes_commander');

    music = game.add.audio('space_music');
    music.volume = .15;
    music.loop = true;
    music.play();

    //  A simple background for our game
    game.add.sprite(0, 0, 'chessmap');

    //  Create our controls.
    configureKeys();

    //Create sprites and animations
    createMonsters();
    createSoldiers();
    createFreezeStone();
    createExplosion();

    // Text
    winText = game.add.text(game.world.width/2, game.world.height/2, 'YOU WON!', { font: '60px "Press Start 2P"', fill: "#ff0"});
    winText.anchor.set(0.5);
    winText.visible = false;

    // Camera shake plugin
    game.plugins.cameraShake = game.plugins.add(Phaser.Plugin.CameraShake);

    // Set default selected player
    selectPlayer('red');

    // Element with amount of moves
    document.getElementById('step-number').innerHTML = steps;

    // Start speech recognition
    recognition.start();
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
      var key_ESC = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
      var key_V = game.input.keyboard.addKey(Phaser.Keyboard.V);
      var cursors = game.input.keyboard.createCursorKeys();

      qKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);
      eKey = game.input.keyboard.addKey(Phaser.Keyboard.E);

      // Add callbacks to keys
      // selection keys
      key_ONE.onDown.add(function(){selectPlayer('red')}, this );
      key_TWO.onDown.add(function(){selectPlayer('green')}, this );
      key_THREE.onDown.add(function(){selectPlayer('blue')}, this );
      // movement keys
      key_W.onDown.add(function(){playerWalk('up')}, this );
      key_A.onDown.add(function(){playerWalk('left')}, this );
      key_S.onDown.add(function(){playerWalk('down')}, this );
      key_D.onDown.add(function(){playerWalk('right')}, this );
      cursors.up.onDown.add(function(){playerWalk('up')}, this );
      cursors.left.onDown.add(function(){playerWalk('left')}, this );
      cursors.down.onDown.add(function(){playerWalk('down')}, this );
      cursors.right.onDown.add(function(){playerWalk('right')}, this );

      // reset key
      key_ESC.onDown.add(reset, this);
      // reset voice recognition
      key_V.onDown.add(resetVoiceRecognition, this);

}

////////////////////////////////////////////////////////////////////////////////
// METHODS
////////////////////////////////////////////////////////////////////////////////

// Gets frames numbers for a row from a spritesheet.
function row(row, col){return _.range(col*row, col*row+col);}

// Creates a new set of soldiers
function createSoldiers() {

    //Create soldier group
    soldiers = game.add.group();
    soldiers.enableBody = true;

    //Add soldiers to group. Set anchor to middle so that character can be flipped without movement.

    for (var i = 0; i < colors.length; i++) {
        var x = 250 + i*100;
        var y = 650;
        var soldier = soldiers.create(x, y, colors[i]+'soldier');
        soldier.anchor.setTo(.5, .5);
        soldier.scale.setTo(SCALE);
        soldier.type = 'soldier';
        soldier.newX = x;
        soldier.newY = y;
    }

    //Add animations to group
    soldiers.callAll('animations.add', 'animations', 'walk_down', row(0, 4), 10, true);
    soldiers.callAll('animations.add', 'animations', 'walk_up', row(1, 4), 10, true);
    soldiers.callAll('animations.add', 'animations', 'walk_left', row(2, 4), 10, true);
    animationRunning = false;
}

// Creates a new set of monsters
function createMonsters() {

    //Create monster group
    monsters = game.add.group();
    monsters.enableBody = true;

    //Add monsters to group
    for (var i = 0; i < 3; i++) {
        var x = 450 + i*100;
        var y = 550;
        var monster = monsters.create(x, y, 'monster');
        monster.anchor.setTo(.5, .5);
        monster.scale.setTo(SCALE);
        monster.tint = monsterColors[i];
        monster.name = monsterNames[i];
        monster.type = 'monster';
        monster.newX = x;
        monster.newY = y;
    }

    //Add animations to group. Play animation continously.
    monsters.callAll('animations.add', 'animations', 'walk_down', row(0, 3), 10, true);
    monsters.callAll('play', null, 'walk_down');
}

function createFreezeStone() {
    //Create freeze stone
    freezeStones = game.add.group();
    freezeStones.enableBody = true;

    var x = 50 + (Math.round(Math.random()*3) + 1)*100;
    var y = 450 + (Math.round(Math.random()*3) + 1)*-100;
    console.log(x,y);
    var freezeStone = freezeStones.create(x, y, 'freezeStone');
        freezeStone.anchor.setTo(.5, .5);
}

function createExplosion() {
    explosion = game.add.sprite(0, 0, 'explosion');
    explosion.visible = false;
    explosion.anchor.setTo(.5, .5);
    explosion.scale.setTo(SCALE);
    explosion.animations.add('boom');
    explosion.events.onAnimationComplete.add(function(){explosion.visible = false;},this);
}

function walk(character, direction) {
    var x = 0;
    var y = 0;
    // var directionText = direction;

    switch(direction) {
        case 'up': y = -100; break;
        case 'down': y = 100; break;
        case 'left':x = -100; break;
        case 'right': x = 100;
        direction = 'left'; // Since mirrored, play left animation.
        break;
    }

    //Calculate new position
    var newX = character.x + x;
    var newY = character.y + y;

    //Create a transition to the new location
    if( notOutside(newX, newY) ) {
        if( !soldierCollision(newX, newY) ) {
            character.newX = newX;
            character.newY = newY;

            if(x==100) character.scale.setTo(-SCALE,SCALE); //mirror character
            character.animations.play('walk_'+direction, 10, true);
            animationRunning = true;
            // console.log(character.key+' is moving')
            tween = this.game.add.tween(character).to({x:newX, y:newY}, 800, null, true);
            tween.onComplete.addOnce(stopWalking, this);
        }
    }

}

function stopWalking(character) {
    //Stop walking animations
    character.scale.setTo(SCALE,SCALE); //Unmirror character
    player.animations.stop();
    character.frame = 0;

    if(character.type == 'soldier') {
    	var monster = monsterCollision(character);
	    if( monster != null ) {
	        monster.destroy();
	        explode(character.x, character.y);
	    }
    }
    
    animationRunning = false;
    winCheck();
    // console.log(character.key+' is idle');
}

// Special function for getting the player to walk
function playerWalk(direction){
    if(animationRunning) return; // Do nothing if an animation is still going

    var x = 0;
    var y = 0;

    // Check if colliding with wall or other player character
    switch(direction){
        case 'up': y = -100; break;
        case 'down': y = 100; break;
        case 'left':x = -100; break;
        case 'right': x = 100; break;
    }

    //Calculate new position
    var newX = player.x + x;
    var newY = player.y + y;

    var shake = false;
    //Create a transition to the new location
    if( notOutside(newX, newY) ) {
        if( !soldierCollision(newX, newY) ) {

            player.newX = newX;
            player.newY = newY;

            walk(player, direction);
            console.log(player.key, player.x, player.y);
            if (monsterFreezeCount == 0 || monsterFreezeCount > 2) {
                monsterAction();
                var i = 0;
                for (monster of monsters.children) {
                    monster.tint = monsterColors[i];
                    i++
                }
            } else if (monsterFreezeCount > 0 && monsterFreezeCount <= 2) {
                monsterFreezeCount++
            }
            if(!winText.visible){
                updateScore();
            }

        } else {
            shake = true;
            bonk_sfx.play();
        }
    } else {
        shake = true;
        bonk_sfx.play();
    }

    if(shake === true) {
        switch(direction){
            case 'up': game.plugins.cameraShake.shake(5, 0, -1, .1); break;
            case 'down': game.plugins.cameraShake.shake(5, 0, 1, .1); break;
            case 'left': game.plugins.cameraShake.shake(5, -1, 0, .1); break;
            case 'right': game.plugins.cameraShake.shake(5, 1, 0, .1); break;
        }
    }
}

function walkToward(character, targetColor) {

    if(character.type == 'monster') {
        var target = player;
    } else {
        if(animationRunning) return; // Do nothing if an animation is still going
        var target = monsters.iterate('name', targetColor, Phaser.Group.RETURN_CHILD);
    }

    // If no target found: return
    if(!target) {
        return;
    }

    var characterXPos = character.position.x;
    var characterYPos = character.position.y;

    var targetXPos = target.position.x;
    var targetYPos = target.position.y;

    if ( Math.abs(targetXPos - characterXPos) <= Math.abs(targetYPos - characterYPos) ) {
        if (targetYPos > characterYPos) {
            if(character.type == 'soldier') playerWalk('down');
            else walk(character, 'down');
        } else {
            if(character.type == 'soldier') playerWalk('up');
            else walk(character, 'up');
        }
    } else if ( Math.abs(targetXPos - characterXPos) > Math.abs(targetYPos - characterYPos) ) {
        if (targetXPos > characterXPos) {
            if(character.type == 'soldier') playerWalk('right');
            else walk(character, 'right');
        } else {
            if(character.type == 'soldier') playerWalk('left');
            else walk(character, 'left');
        }
    }
}

function monsterAction() {
    // dx + dy
    // var calcDist = function(x1, y1, x2, y2) {
    //     return Math.abs(x2-x1) + Math.abs(y2-y1);
    // }

    // Linear distance
    var calcDist = function(x1, y1, x2, y2) {
      return Math.sqrt(
        Math.pow((x2-x1),2) +
        Math.pow((y2-y1),2)
      );
    }

    for (var monster of monsters.children) {
        // Determine the position of the closest soldier
        var x, y;
        var minDistance = 999;

        for (var soldier of soldiers.children) {
            var distance = calcDist(monster.x, monster.y, soldier.newX, soldier.newY);
            if(distance < minDistance) {
                minDistance = distance;
                // console.log('minDistance', minDistance);
                x = soldier.newX;
                y = soldier.newY;
            }
        }
        // console.log("Closest soldier is at "+ x +"," + y);

        // There is a maximum of 4 directions a monster can move.
        // Determine which one maximizes distance.
        var moves = [
            [100, 0, 'right'],
            [-100, 0, 'left'],
            [0, 100, 'down'],
            [0, -100, 'up']
        ];
        var index = 0;
        var maxDistance = 0;
        for (var i = 0; i < moves.length; i++) {

            newX = monster.x + moves[i][0];
            newY = monster.y + moves[i][1];
            // console.log(monster.name, i);
            if( notOutside(newX, newY) && !monsterIsAt(newX, newY) ) {

                var distance = calcDist(x, y, newX, newY);
                if(distance > maxDistance) {
                    maxDistance = distance;
                    index = i;
                }

            }

        }
        // console.log('monster move direction:',moves[index][2]);
        walk(monster, moves[index][2]);
    }

    // var randomMon = monsters.getRandom();
    // console.log(randomMon);
    // walkToward(randomMon, player);
}

function notOutside(x, y) {
    return (x < game.world.width && x > 0 && y < game.world.height && y > 0);
}

function soldierCollision(newX, newY) {
    for (soldier of soldiers.children) {
        if(soldier.x == newX && soldier.y == newY) return true;
    }
    //If here then there is no collision
    return false;
}

function monsterCollision(character) {
    for (monster of monsters.children) {
        if(monster.newX == character.x && monster.newY == character.y) {
            return monster;
        }
    }
    //If here then there is no collision
    return null;
}

function monsterIsAt(x, y) {
    for (var monster of monsters.children) {
        if(monster.newX == x && monster.newY == y) {
            // console.log(monster.name, 'monsterIsAt', x, y);
            return true;
        }
    }
    return false;
}

function selectPlayer(color){
    if(animationRunning) return; // Do nothing if an animation is still going
    player = soldiers.iterate('key', color+'soldier', Phaser.Group.RETURN_CHILD);
    // selectedPlayerText.text = color;
    // selectedPlayerText.style.fill = color;
    var selectedPlayerDiv = document.getElementById('selected-player');
    selectedPlayerDiv.className = 'selected-'+color;
    selectedPlayerDiv.innerHTML = color;
}

// New Functions

function explode(x,y){
    explosion.x = x;
    explosion.y = y;
    explosion.visible = true;
    explosion.play('boom');
    boom_sfx.play();
    game.plugins.cameraShake.shake(20, -1, 1, .6);
}

function updateScore() {
    steps++;
    console.log("updateScore",steps);
    document.getElementById('step-number').innerHTML = steps;
}

function createHealthBars() {
    playerHealthBar = game.add.sprite(0, game.world.height-healthBarHeight, 'healthBar');   /////////
    playerHealthBar.crop(new Phaser.Rectangle(0,0,healthBarWidth,healthBarHeight));
    enemyHealthBar = game.add.sprite(0, 0, 'healthBar');    /////////
    enemyHealthBar.crop(new Phaser.Rectangle(0,0,healthBarWidth,healthBarHeight));
    APText = game.add.text(10, game.world.height-(healthBarHeight*2), 'AP: ' + AP, { font: '20px "Press Start 2P"',           fill: '#000' });
}

function reset() {
    monsters.destroy();
    soldiers.destroy();
    freezeStones.destroy();
    if(winText.visible) {
        winText.visible = false;
    }

    animationRunning = false;

    steps = 0;
    document.getElementById('step-number').innerHTML = steps;

    createMonsters();
    createSoldiers();
    createFreezeStone();

    selectPlayer('red');
    resetVoiceRecognition();
}

function winCheck() {
    if(monsters.children.length == 0 && !winText.visible) {
        winText.visible = true;
        saveHighScore();
    }
}

////////////////////////////////////////////////////////////////////////////////
// CALLBACKS
////////////////////////////////////////////////////////////////////////////////

// Gets called when something is said in the microphone.
function OnVoiceRecognition(event) {

    var speechInput = '';
    var final_transcript = '';

    // Put all results into a single string
    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
        } else {
            speechInput = event.results[i][0].transcript.toLowerCase();
        }
    }
    console.log(speechInput);

    document.getElementById('command-text').innerHTML = speechInput;

    var match = '';
    if(animationRunning) return; // Do nothing if an animation is still going


    // SELECTION COMMANDS
    if ( match  = speechInput.match('(red|green|blue)') ) {
        selectPlayer(match[0]);
    }

    // MOVEMENT COMMANDS
    if ( match = speechInput.match('(up|left|right|down)') ) {
        playerWalk(match[0]);
        if(steps%4 === 0) {
            yes_commander.play();
        }
    } else if ( match = speechInput.match('(black|yellow|orange)') ) {
        walkToward(player, match[0]);
        if(steps%4 === 0) {
            yes_commander.play();
        }
    }

    if ( match = speechInput.match('(activate|freeze)') ) {
        for (freezeStone of freezeStones.children) {
            if (player.x == freezeStone.x && player.y == freezeStone.y) {
                console.log("Activated");
                freezeStone.destroy();
                monsterFreezeCount = 1;
                console.log('monsterFreezeCount; ', monsterFreezeCount);
                for (monster of monsters.children) {
                    monster.tint = 0xe5ffff;
                }
            }
        }
    }


}

//Gets called every frame
function update() {
    // Empty right now
}

function render() {
    // game.debug.text(game.time.fps || '--', 300, 300, "#f00");
}
