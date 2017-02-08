(function() {
	"use strict";

	var ONE_FRAME_TIME = 1000 / 60;

	// --------------------------------------------------------------
	// Character
	class Character{
		constructor(filename, gameWidth, gameHeight, posX, posY) {
			this.texture = null;
			this.gameWidth = gameWidth;
			this.gameHeight = gameHeight;
			this.lastX = this.posX = posX;
			this.lastY = this.posY = posY;

			this.speed = 1;
			this.dx = 1;
			this.dy = 1;
			this.name = "none";
			this.starting_array = [0, 0, 0, 0, 0, 0, 0, 0, 0];
			this.loadTexture(filename);
		}

		loadTexture(filename) {
			this.texture = new Image();
			this.texture.src = filename;
			this.name = filename;
		}

		getPosition() {
			return {x: this.posX, y: this.posY}
		}

		clearSprite(ctx) {
			ctx.clearRect(Math.floor(this.lastX), Math.floor(this.lastY), this.texture.width+2 , this.texture.height+2);
		}

		// clearSprite has to be called inbetween every draw
		draw(ctx) {
			ctx.drawImage(this.texture, Math.floor(this.posX), Math.floor(this.posY));
			this.lastX = this.posX;
			this.lastY = this.posY;
		}

		intersects(x, y) {
			return (x >= this.posX && x <= this.posX + this.texture.width &&
				 			y >= this.posY && y <= this.posY + this.texture.height);
		}

		updatePosition(diff) {
			var correctedSpeed = diff ? this.speed * diff / ONE_FRAME_TIME : this.speed;
			this.posX += this.dx * correctedSpeed;
			this.posY += this.dy * correctedSpeed;

			if (this.posX >= (this.gameWidth - this.texture.width)) this.dx = -1;
			if (this.posX < 0) this.dx = 1;
			if (this.posY >= (this.gameHeight - this.texture.height)) this.dy = -1;
			if (this.posY < 0) this.dy = 1;
		}

		resetPosition() {
			var cluster = Math.floor(Math.random()*9);
			var all_Selected = false;

			// try to cover the 9 points
			if (this.starting_array[cluster] == 1 && !all_Selected) {
					all_Selected = true;
					for (var i = 0; i < this.starting_array.length; ++i) {
							if (this.starting_array[i] == 0)
									all_Selected = false;
					}
					cluster = Math.floor(Math.random()*9);

					if (all_Selected)
							for(var i = 0 ; i < this.starting_array.length ; ++i)
									this.starting_array[i] = 0;
			}

			this.starting_array[cluster] = 1;

			this.posX = (cluster % 3) * (this.gameWidth - this.texture.width)/2;
			this.posY = Math.floor(cluster / 3) * (this.gameHeight - this.texture.height)/2;

			this.dx = -this.dx;
			this.dy = -this.dy;
		}
	}

	// --------------------------------------------------------------
	// Pointcounter
	class PointCounter{
			constructor(gameWidth, gameHeight) {
			this.points = 0;
			this.lastPoints = -1;

			this.posX = 0;
			this.posY = 0;
			this.screenDiag = 1;

			this.lastCatKilledX = -1;
			this.lastCatKilledY = -1;

			this.texture = new Image();
			this.texture.src = "./images/cat-jail.jpg";

			this.setDimensions(gameWidth, gameHeight);
		}

		setDimensions(gameWidth, gameHeight) {
			this.posX = gameWidth - 200;
			this.posY = 30;
			this.screenDiag = Math.sqrt(gameWidth * gameWidth + gameHeight * gameHeight);
		}

		draw(ctx, characters, force) {
			var needsRedraw = false;

			// check for new score
			if (this.points != this.lastPoints) {
				this.lastPoints = this.points;
				needsRedraw = true;

			// check if a cat overlaps the score
			} else {
				for (var i = 0; i < characters.length; i++) {
					if (characters[i].posX > this.posX - 80 && characters[i].posY < 70)
						needsRedraw = true;
				}
			}

			if (needsRedraw || force) {
				ctx.font = "30px Arial";
				ctx.clearRect(this.posX - 10, this.posY - 10, 200, 30);
				ctx.fillText("Score: " + this.points, this.posX, this.posY+20);

				ctx.drawImage(this.texture, this.posX - 80, this.posY-30);
			}
		}

		addKill(x, y) {
			if (this.lastCatKilledX == -1 && this.lastCatKilledY == -1) {
				this.points = 1;
			} else {
				var dist = Math.sqrt((this.lastCatKilledX -x)*(this.lastCatKilledX -x)+(this.lastCatKilledY -y)*(this.lastCatKilledY -y)) / this.screenDiag;

				this.points += Math.floor(Math.max(1, Math.exp(dist)*25));
			}
			this.lastCatKilledX = x;
			this.lastCatKilledY = y;
		}
	}

	// ----------------------------------------------------------------
	// Helper function for disabling mouse wheel scrolling
	function disable_scroll() {
		var preventDefault = function(event) {
			event.preventDefault();
		}
    window.addEventListener('wheel', preventDefault);
	  window.onmousewheel = document.onmousewheel = preventDefault;
	}

	// --------------------------------------------------------------
	// Game Class
	class Game extends EventEmitter {
		constructor(canvasId, catsToKill) {
			super();

			this._intervalId = null;
			this._lastUpdate = null;
			this._catsKilled = 0;
			this.catsToKill = catsToKill || 15;

			this.handleClick = this.handleClick.bind(this);
			this.clickX = null;
			this.clickY = null;

			// Resize to window size.
			this.canvas = document.getElementById(canvasId);
			this.ctx = this.canvas.getContext("2d");
			this.canvas.width = 0;
			this.canvas.height = 0;

			this.characters = [];
			this.pointsCounter = null;
		}

		handleClick(event) {
			// console.log("handleClick", event);
			this.clickX = event.pageX;
			this.clickY = event.pageY;
			// console.log("canvas click", this.clickX, this.clickY);
			// for (var i = 0; i < this.characters.length; i++) {
				// console.log(this.characters[i].name, this.characters[i].getPosition());
			// }
		}

		// Draw initial instructions
		drawIntro(ctx) {
			ctx.font = "18px Arial";
			ctx.fillText("Click on " + this.catsToKill + " cats to win the game !!!", (this.canvas.width - 250) / 2, 200);
			ctx.fillText("Maximize distance between cats to make more points!", (this.canvas.width - 250) / 2, 240);
		}

		// Draw final message
		drawOutro(ctx) {
			for (var i = 0; i < this.characters.length; i++) {
				this.characters[i].clearSprite(ctx);
			}

			ctx.font = "30px Arial";
			ctx.fillText("Congratulations, the reign of terror of cats has now ended!", this.canvas.width/2-350, this.canvas.height/2);
		}

		// Draw game objects on the canvas
		draw(ctx) {
			for (var i = 0; i < this.characters.length; i++) {
				this.characters[i].clearSprite(ctx)
				this.characters[i].draw(ctx);
			}
			this.pointsCounter.draw(ctx, this.characters);
		}

		// Update the game Logic
		update(diff) {
			for (var i = 0; i < this.characters.length; ++i) {
				var character = this.characters[i];

				if (this.clickX && this.clickY &&
						character.intersects(this.clickX, this.clickY)) {
					var pos = character.getPosition();

					this._catsKilled++;
					this.pointsCounter.addKill(pos.x, pos.y);

					eyetrackingPlatform.xmlLog.createTag("object", {
						name: character.name,
						x: Math.floor(pos.x * 100) / 100,
						y: Math.floor(pos.y * 100) / 100
					});
					character.resetPosition();
				} else {
					character.updatePosition(diff);
				}
			}

			this.clickX = null;
			this.clickY = null;

			// End of game!
			if (this._catsKilled >= this.catsToKill)
				return true;

			return false;
		}

		// Main update loop, should be trigger by requestAnimationFrame
		mainloop(timestamp) {
			if (!timestamp)
				throw new Error("Please call Game.mainloop with requestAnimationFrame!");

			var diff = this._lastUpdate ? timestamp - this._lastUpdate : null;
			this._lastUpdate = timestamp;

			// Update Game Logic
			var isFinished = this.update(diff);

			// Finish game
			if (isFinished) {
				this.drawOutro(this.ctx);
				setTimeout(this.end.bind(this), 2000);

			// Draw and issue next iteration
			} else {
				this.draw(this.ctx);
				requestAnimationFrame(this.mainloop.bind(this));
			}
		}

		// Start or Restart the Game logic
		start() {
			// set canvas dimensions
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
			this.canvas.style.visibility = "visible";

			// prevent scrollbars and mousewheel scrolling
			document.documentElement.style.overflow = 'hidden';
			window.scrollTo(0, 0);
			disable_scroll();

			// Initialization of Game elements
			this.characters.push(new Character("./images/hello_kitty.jpg", this.canvas.width, this.canvas.height, 100, 100));
			this.characters.push(new Character("./images/Nyan_cat.png", this.canvas.width, this.canvas.height, 400, 100));
			this.pointsCounter = new PointCounter(this.canvas.width, this.canvas.height);

			this._catsKilled = 0;
			this.canvas.addEventListener("click", this.handleClick);
			this.emit("start");

			// start mainloop after 4 seconds
			this.drawIntro(this.ctx);
			setTimeout(function() {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				requestAnimationFrame(this.mainloop.bind(this));
			}.bind(this), 4000);
		}

		end() {
			// hide canvas
			// this.canvas.width = 0;
			// this.canvas.height = 0;
			// this.canvas.style.visibility = "hidden";
			this.canvas.style.display = "none";

			// cleanup references
			this.characters = [];
			this.pointsCounter = null;
			this.canvas.removeEventListener("click", this.handleClick);

			// signal game end
			this.emit("end");
		}
	}

	class GameController extends Controller {
		constructor() {
			super();
		}

		start() {
			var calibrationGame = new Game("gameCanvas", 15);
			calibrationGame.start();
			calibrationGame.once("end", this.emit.bind(this, "end"));
		}

		render() {
			return `<div>
     		<canvas id="gameCanvas"></canvas>
   		<div>`;
		}
	}

	// publish class to global scope
	window.GameController = GameController;

	// --------------------------------------------------------------
	// WallOfFame class, probably broken right now

	// class WallOfFameController extends Controller{
	// 	render() {
	// 		return `<div id="AddNewScore" class="hidden" >
	// 		  <label for="UserName">Enter your name :</label>
	// 		  <input type="text" id="UserName" />
	// 		  <button id="addName">Submit</button>
	// 		  <button id="skipAddName">Skip</button>
	// 		</div>`;
	// 	}
	// }

	// ----------------------------------------------------------------
	// Get canvas & graphic context
	// var addNameTextField = document.getElementById("UserName");
	// var skipAddNameButton = document.getElementById("skipAddName");
	// var addNameButton = document.getElementById("addName");
	// skipAddNameButton.disabled = true;
	// // skipAddNameButton.addEventListener("click", closeGame);
	//
	// addNameButton.disabled = true;
	// // addNameButton.addEventListener("click", addNewNameAndScore);
	//
	// var addNewScoreGroup = document.getElementById("AddNewScore");

	// var WallOfFame(canvas, ctx) {
	// 	var lastRankedScore = 0;
	// 	var listOfNames = new Array();
	//
	// 	canvas.height = window.innerHeight - 150;
	// 	this.draw(canvas, ctx);
	// 	pointsCounter.draw(ctx, [], true);
	// }
	//
	// WallOfFame.prototype.draw(c, ctx) {
	// 	listOfNames.length = 0;
	// 	c.width = c.width; //hack -> redraw entire canvas
	// 	c.height = c.height - 200;
	//
	// 	// enable submit buttons
	// 	skipAddNameButton.disabled = false;
	//
	// 	// call BD in AJAX to list previous scores.
	// 	var xhr_object = new XMLHttpRequest();
	// 	xhr_object.open("GET", "../getWallOfFame.php", true);
	// 	xhr_object.setRequestHeader('Content-Type', 'text/xml');
	//
	// 	ctx.font="20px Arial";
	// 	ctx.fillText("High scores!",c.width/2-50,c.height/3);
	//
	// 	xhr_object.onreadystatechange () {
	// 		if (xhr_object.readyState === 4) {
	// 			if (xhr_object.status === 200) {
	// 				var xmlDoc = xhr_object.responseXML;
	// 				var game = xmlDoc.getElementsByTagName("Game");
	//
	// 				for (i=0; i < game.length; i++) {
	// 					var player = game[i].getElementsByTagName("Player");
	// 					var score  = game[i].getElementsByTagName("Score");
	//
	// 					ctx.fillText(player[0].childNodes[0].nodeValue,		c.width/2-250,c.height/3+(i+1)*30);
	// 					ctx.fillText(score[0].childNodes[0].nodeValue,		c.width/2+250,c.height/3+(i+1)*30);
	//
	// 					lastRankedScore = parseInt(score[0].childNodes[0].nodeValue);
	// 					listOfNames.push(player[0].childNodes[0].nodeValue);
	// 				}
	//
	// 				// check if the score is good enough to be registered
	// 				if (game.length < 10 || pointsCounter.points > lastRankedScore) {
	// 					addNameButton.disabled = false;
	//
	// 					addNewScoreGroup.style.visibility = "visible";
	// 					addNewScoreGroup.style.height = "auto";
	//
	// 				} else {
	// 					setTimeout(this.game.close, 5000);
	// 				}
	//
	// 			} else {
	// 				console.error(xhr_object.statusText);
	// 			}
	// 		}
	// 	}
	//
	// 	xhr_object.send();
	// }
	//
	// WallOfFame.prototype.addNewNameAndScore() {
	// 	// check if name is already taken
	// 	var nameUsed = true;
	//   var idName = 1;
	//   var name = addNameTextField.value;
	// 	while (nameUsed) {
	//   	nameUsed = false;
	// 		for (i = 0 ; i < listOfNames.length ; ++i) {
	// 	  	if (listOfNames[i] == name) {
	// 				nameUsed = true;
	// 				break;
	// 			}
	// 		}
	//
	//     if (nameUsed)
	//   		name = addNameTextField.value + idName++;
	//   }
	//
	// 	addNameButton.disabled = true;
	// 	listOfNames.push(name);
	//
	// 	var xhr_object = new XMLHttpRequest();
	//
	// 	xhr_object.open("POST", "../saveNewNameAndScore.php?name="+name+"&score="+pointsCounter.points, true);
	// 	xhr_object.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	//
	// 	xhr_object.onreadystatechange () {
	// 		if (xhr_object.readyState === 4) {
	// 			if (xhr_object.status === 200) {
	// 				drawWallOfFame();
	// 			} else {
	// 				console.error(xhr_object.statusText);
	// 			}
	// 			setTimeout(function(){
	// 				skipAddNameButton.disabled = true;
	// 				addNameButton.disabled = true;
	// 				addNewScoreGroup.style.visibility = "hidden";
	// 				addNewScoreGroup.style.height = "0";
	//
	// 				this.game.end();
	// 			}.bind(this), 5000);
	// 		}
	// 	}
	//
	// 	xhr_object.send();
	// }
})();
