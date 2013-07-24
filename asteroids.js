var WIDTH = 800;
var HEIGHT = 600;

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
    this.img = new Image();
    this.img.src = 'asteroid.png';
  };

  var Surrogate = function() {};
  Surrogate.prototype = MovingObject.prototype;
  Asteroid.prototype = new Surrogate();
  //Creates new asteroid with random attributes
  Asteroid.randomAsteroid = function(){
    var corner = [0,1];
    var xPos = WIDTH * corner[Math.floor(Math.random() * 2)];
    var yPos = HEIGHT * corner[Math.floor(Math.random() * 2)];
    var radius = 20;
    var direc = [-1,1];
    var xVel = 4 * Math.random() * direc[Math.floor(Math.random() * 2)];
    var yVel = 4 * Math.random() * direc[Math.floor(Math.random() * 2)];

    return new Asteroid(xPos, yPos, radius, xVel, yVel);
  }
  //Draws the asteroid
  Asteroid.prototype.render = function(ctx) {
    ctx.drawImage(this.img,this.xPos - this.radius,this.yPos - this.radius);
  };

  Asteroid.prototype.update = function(ctx) {
    this.xPos = (this.xPos + this.xVel + WIDTH) % WIDTH;
    this.yPos = (this.yPos + this.yVel + HEIGHT) % HEIGHT;
  }

  Asteroid.prototype.isHit = function(bullet) {
    var distance = Math.sqrt(Math.pow(this.xPos - bullet.xPos, 2) +
                             Math.pow(this.yPos - bullet.yPos, 2))
    return (distance < this.radius + bullet.radius);
  };

  var Ship = function() {
    MovingObject.call(this, WIDTH/2, HEIGHT/2, 10, 0, 0);
    this.angularDirec = 0;
    this.angularVel = 0;
    this.xAccel = 0;
    this.yAccel = 0;
    this.shootable = true;
    this.thrust = false;
  };

  Ship.prototype = new Surrogate();
  //Updates ship position with screen-wrap
  Ship.prototype.update = function(){
    this.xPos = (this.xPos + this.xVel + WIDTH) % WIDTH;
    this.yPos = (this.yPos + this.yVel + HEIGHT) % HEIGHT;
    this.angularDirec = (this.angularDirec + this.angularVel) % (Math.PI*2);
    this.xVel = this.xVel * .985;
    this.yVel = this.yVel * .985;
    if (this.thrust){
      this.xAccel = Math.sin(this.angularDirec) * .2;
      this.yAccel = -Math.cos(this.angularDirec) * .2;
    }
    else {
      this.xAccel = 0;
      this.yAccel = 0;
    }
    this.xVel = this.xVel + this.xAccel;
    this.yVel = this.yVel + this.yAccel;
  };

  Ship.prototype.isHit = function(asteroid){
    var distance = Math.sqrt(Math.pow(this.xPos - asteroid.xPos, 2) +
                             Math.pow(this.yPos - asteroid.yPos, 2))
    return (distance < this.radius + asteroid.radius);
  }
  //Defines key events
  Ship.prototype.power = function(game) {
    var that = this;

    key('left', function(){
      that.angularVel = -0.05;
    });

    key('right', function(){
      that.angularVel = 0.05;
    });

    key('up', function() {
      that.thrust = true;
    });

    key('space', function(){
      if (that.shootable){
        game.bullets.push(new Bullet(that));
        that.shootable = false;
      }
    });

    keyup('left, right', function(){
      if(key.isPressed('left')){
        that.angularVel = -0.05;
      }
      else if(key.isPressed('right')){
        that.angularVel = 0.05;
      }
      else {
        that.angularVel = 0;
      }
    });

    keyup('up', function(){
      that.thrust = false;
    });

    keyup('space', function(){
      that.shootable = true;
    });
  }

  //Draws the ship
  Ship.prototype.render = function(ctx) {
    ctx.fillStyle = "red";
    ctx.beginPath();

    ctx.arc(this.xPos, this.yPos, this.radius, Math.PI+this.angularDirec,
            Math.PI*2+this.angularDirec, false);
    ctx.fill();
  }

  var Bullet = function(ship) {
    MovingObject.call(this, ship.xPos + ship.radius*Math.sin(ship.angularDirec),
                      ship.yPos - ship.radius*Math.cos(ship.angularDirec), 1.5,
                      ship.xVel * .8 + Math.sin(ship.angularDirec)*5,
                      ship.yVel * .8 - Math.cos(ship.angularDirec)*5)
  };
  Bullet.prototype = new Surrogate();

  Bullet.prototype.render = function(ctx){
    ctx.fillStyle = "white";
    ctx.beginPath();

    ctx.arc(this.xPos, this.yPos, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
  };

  var Game = function(canvasEl) {
    this.ctx = canvasEl.getContext("2d");
    this.ship = new Ship();
    this.bullets = [];
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.img = new Image();
    this.img.src = 'space.jpg';
    this.overImg = new Image();
    this.overImg.src = 'over.jpg';
  };
  //Places asteroids by calling randomAsteroid
  Game.prototype.initializeAsteroids = function(){
    this.asteroids = [];
    var that = this;
    _.times(6, function(){
      that.asteroids.push(Asteroid.randomAsteroid());
    });
  }

  //Calls object specific drawing methods for entire game
  Game.prototype.render = function() {
    var that = this;
    that.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    that.ctx.drawImage(that.img, 0, 0);
    _.each(that.asteroids, function(asteroid) {
      asteroid.render(that.ctx);
    });

    that.ship.render(that.ctx);

    _.each(that.bullets, function(bullet){
      bullet.render(that.ctx);
    });

    that.ctx.fillStyle = "yellow";
    that.ctx.font = "12pt Arial";
    that.ctx.fillText("Lives: " + that.lives, 5, 15 );
    that.ctx.fillText("Score: " + that.score, 80, 15 );

    if (that.gameOver){
      that.ctx.drawImage(that.overImg, 0, 0);
    }
  };
  //Creates new asteroids during game play
  Game.prototype.addAsteroid = function(){
    this.asteroids.push(Asteroid.randomAsteroid());
  }
  //If ship is hit by asteroid, decrement lives and reset game.
  Game.prototype.resetAfterHit = function(){
    this.lives -= 1;
    this.initializeAsteroids();
    this.ship.xPos = WIDTH/2;
    this.ship.yPos = HEIGHT/2;
    this.ship.thrust = false;
    this.ship.angularDirec = 0;
    this.ship.angularVel = 0;
    this.ship.xVel = 0;
    this.ship.yVel = 0;
    this.bullets = [];
  }
  //Calls object specific position update methods for entire game
  Game.prototype.update = function(){
    var that = this;
    deadAsteroids = [];
    deadBullets = [];
    _.each(that.asteroids, function(asteroid){
      asteroid.update();
      if (that.ship.isHit(asteroid)){
        that.resetAfterHit();
      }
      _.each(that.bullets, function(bullet) {
        if (asteroid.isHit(bullet)){
          deadAsteroids.push(asteroid);
          deadBullets.push(bullet);
          that.score += 10;
        }
      })

    });
    that.asteroids = _.difference(that.asteroids, deadAsteroids);

    _.each(that.bullets, function(bullet){
      bullet.update();

      if (bullet.offScreen()){
        deadBullets.push(bullet)
      }
    });
    that.bullets = _.difference(that.bullets, deadBullets);

    that.ship.update();
    if (that.lives < 1) {
      this.gameOver = true;
    }
  };

  Game.prototype.resetGame = function() {
    this.score = 0;
    this.resetAfterHit();
    this.lives = 3;
    this.gameOver = false;
  }
  //Runs the Asteroids game
  Game.prototype.start = function() {
    var that = this;

    that.initializeAsteroids();
    that.ship.power(that);
    window.setInterval(function () {
      that.update();
      that.render();
    }, 18);
    window.setInterval(function(){
      that.addAsteroid();
    }, 2000)

    key('enter', function() {
      if (that.gameOver) {
        that.resetGame();
      }
    });
  };

  return {
    Game: Game
  }
})();


