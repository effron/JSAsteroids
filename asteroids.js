//var us = require('./underscore.js');

var WIDTH = 600;
var HEIGHT = 400;
var Asteroids = (function() {
  var MovingObject = function(xPos, yPos, radius, xVel, yVel){
    this.xPos = xPos;
    this.yPos = yPos;
    this.radius = radius;

    this.xVel = xVel;
    this.yVel = yVel;
  }

  MovingObject.prototype.update = function(){
    this.xPos += this.xVel;
    this.yPos += this.yVel;
  };
  //Returns true if MovingObject is off screen
  MovingObject.prototype.offScreen =  function(){
    return this.xPos > WIDTH + this.radius ||
           this.xPos < 0 - this.radius ||
           this.yPos > HEIGHT + this.radius ||
           this.yPos < 0 - this.radius;
  };

  var Asteroid = function(xPos, yPos, radius, xVel, yVel){
    MovingObject.call(this, xPos, yPos, radius, xVel, yVel);
  };

  var Surrogate = function() {};
  Surrogate.prototype = MovingObject.prototype;
  Asteroid.prototype = new Surrogate();
  //Creates new asteroid with random attributes
  Asteroid.randomAsteroid = function(){
    var xPos = Math.random() * WIDTH;
    var yPos = Math.random() * HEIGHT;
    var radius = 20;
    var direc = [-1,1];
    var xVel = Math.random() * direc[Math.floor(Math.random() * 2)];
    var yVel = Math.random() * direc[Math.floor(Math.random() * 2)];

    return new Asteroid(xPos, yPos, radius, xVel, yVel);
  }
  //Draws the asteroid
  Asteroid.prototype.render = function(ctx) {
    ctx.fillStyle = "green";
    ctx.beginPath();

    ctx.arc(this.xPos, this.yPos, this.radius, 0, Math.PI*2, false);
    ctx.fill();
  };

  var Ship = function() {
    MovingObject.call(this, WIDTH/2, HEIGHT/2, 10, 0, 0);
  };

  Ship.prototype = new Surrogate();
  //Updates ship position with screen-wrap
  Ship.prototype.update = function(){
    this.xPos = (this.xPos + this.xVel + WIDTH) % WIDTH;
    this.yPos = (this.yPos + this.yVel + HEIGHT) % HEIGHT;
  };
  //Controls ship movement based on key events
  Ship.prototype.power = function() {

  }
  //Draws the ship
  Ship.prototype.render = function(ctx) {
    ctx.fillStyle = "red";
    ctx.beginPath();

    ctx.arc(this.xPos, this.yPos, this.radius, 0, Math.PI*2, false);
    ctx.fill();

  }

  var Game = function(canvasEl) {
    this.ctx = canvasEl.getContext("2d");

    this.asteroids = [];
    this.ship = new Ship();

    var that = this;
    _.times(6, function(){
      that.asteroids.push(Asteroid.randomAsteroid());
    });
  };
  //Calls object specific drawing methods for entire game
  Game.prototype.render = function() {
    that = this;
    that.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    _.each(that.asteroids, function(asteroid) {
      asteroid.render(that.ctx);
    });
    this.ship.render(this.ctx);
  };
  //Creates new asteroids during game play
  Game.prototype.addAsteroid = function(){
    this.asteroids.push(Asteroid.randomAsteroid());
  }
  //Calls object specific position update methods for entire game
  Game.prototype.update = function(){
    that = this;
    deadAsteroids = [];
    _.each(that.asteroids, function(asteroid){
      asteroid.update();
      if (asteroid.offScreen()){
        deadAsteroids.push(asteroid)
      }
    });

    that.asteroids = _.difference(that.asteroids, deadAsteroids);

    that.ship.update();
  };
  //Runs the Asteroids game
  Game.prototype.start = function() {
    var that = this;
    window.setInterval(function () {
      that.update();
      that.render();
    }, 18);
    window.setInterval(function(){
      that.addAsteroid();
    }, 5000)
    console.log(that.ship.update)
  };

  return {
    Game: Game
  }
})();


