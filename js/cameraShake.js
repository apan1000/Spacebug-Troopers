'use strict';

/**
* Plugin to make screen shake FX (makes number of short camera movements).
* Modified version of https://github.com/dmaslov/phaser-screen-shake
*
*/
Phaser.Plugin.CameraShake = function(game, parent){
  Phaser.Plugin.call(this, game, parent);

  //settings by default
  this._settings = {
    shakesCount: 0,
    shakeX: 1, // positive for right
    shakeY: -1, // positive for down
    sensCoef: .5
  };
  this.game.camera.bounds = null;

  /**
  * screen shake FX.
  */
  this._moveCamera = function(){
    if(this._settings.shakesCount > 0){
      var sens = this._settings.shakesCount * this._settings.sensCoef;

      if(this._settings.shakesCount % 2){
        this.game.camera.x += this._settings.shakeX * sens;
        this.game.camera.y += this._settings.shakeY * sens;
      }
      else{
        this.game.camera.x -= this._settings.shakeX * sens;
        this.game.camera.y -= this._settings.shakeY * sens;
      }

      this._settings.shakesCount--;

      if(this._settings.shakesCount === 0){
        this.game.camera.setPosition(0, 0);
      }
    }
  };
};

Phaser.Plugin.CameraShake.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.CameraShake.prototype.constructor = Phaser.Plugin.CameraShake;


/**
* Change default settings object values with passed object value.
*
* @method Phaser.Plugin.CameraShake#setup
* @param {object} [obj] - Passed object to merge
*/
Phaser.Plugin.CameraShake.prototype.setup = function(obj){
  this._settings = Phaser.Utils.extend(false, this._settings, obj);
};


/**
* Pass value of count shakes.
*
* @method Phaser.Plugin.CameraShake#shake
* @param {number} [count] - Value of count shakes
* @param {number} [x] - Value of x (positive => shake to right)
* @param {number} [y] - Value of y (positive => shake downwards)
* @param {number} [sens] - Value of sensCoef
*/
Phaser.Plugin.CameraShake.prototype.shake = function(count,x,y,sens){
  if(this._settings.shakesCount === 0){
    this._settings.shakeX = x;
    this._settings.shakeY = y;
    this._settings.shakesCount = count;
    this._settings.sensCoef = sens;
  }
};

Phaser.Plugin.CameraShake.prototype.update = function(){
  this._moveCamera();
};
