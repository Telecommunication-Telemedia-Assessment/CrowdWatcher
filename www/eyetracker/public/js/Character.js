// Get canvas & graphic context

// --------------------------------------------------------------
// Interface to Character 
function Character(filename, ctx, ratio) {
	this.texture;
	this.textureLoaded = false;
	this.context;
	this.ratio = 1;

	this.posX;
	this.posY;
	
	this.speed = 1;
	this.dx = 1;
	this.dy = 1;
	this.name = "none";
	
	
	if ( typeof Character.initialized == "undefined" ) {

	Character.prototype.init = function(filename, ctx, ratio) {
		this.ratio = ratio || 1;
	
		this.texture = new Image();
		this.texture.src = filename;
		this.texture.onload = function() { this.texutreLoaded = true; };
		this.name = filename;
		this.context = ctx;
	}
	
	Character.prototype.setPos = function(x, y) {	
		this.posX = x;
		this.posY = y;
	}

	Character.prototype.log = function() {	
	}
	
	Character.prototype.draw = function() {
		this.context.drawImage(	this.texture,
					this.posX,
					this.posY, 
					this.texture.width*this.ratio, 
					this.texture.height*this.ratio
		);
	}

	 Character.prototype.drawBoundingBox = function() {
                this.context.rect(	this.posX,
					this.posY, 
					this.texture.width*this.ratio, 
					this.texture.height*this.ratio);
		this.context.stroke();
        }
	
	Character.prototype.isClicked = function(x,y) {
//		console.log("x: " + x + " y: " + y + " this.posX: " + this.posX + " this.posY: " + this.posY + " width: " + this.texture.width + " height: " + this.texture.height + " --- " + c.height);
		if(x >= this.posX && x <= this.posX+this.texture.width*this.ratio && y >= this.posY && y <= this.posY+this.texture.height*this.ratio) {
			return true;
		} else {
			return false;
		}
	}
	
	Character.prototype.updatePosition = function() {
		this.context.clearRect( Math.floor(this.posX), Math.floor(this.posY), this.texture.width*this.ratio+2 , this.texture.height*this.ratio+2);
		
		this.posX += this.dx*this.speed*Math.abs(Math.cos(Date.now()));
		this.posY += this.dy*this.speed*Math.abs(Math.cos(Date.now()));
		
		if(this.posX >= (c.width-this.texture.width*this.ratio)) this.dx = -1;
		if(this.posX < 0) this.dx = 1;
		if(this.posY >= (c.height-this.texture.height*this.ratio)) this.dy = -1;
		if(this.posY < 0) this.dy = 1;
			
	}
	
	Character.prototype.resetPosition = function() {
		this.context.clearRect( Math.floor(this.posX), Math.floor(this.posY), this.texture.width*this.ratio+2 , this.texture.height*this.ratio+2);
		
		var cluster = Math.floor(Math.random()*9);
				
		
		this.posX = (cluster % 3) * (c.width-this.texture.width*this.ratio)/2;
		this.posY = Math.floor(cluster / 3) * (c.height-this.texture.height*this.ratio)/2;
		
		this.dx = -this.dx;
		this.dy = -this.dy;
	}
	
	Character.prototype.clearSprite = function() {
		this.context.clearRect( Math.floor(this.posX-6), Math.floor(this.posY-6), this.texture.width*this.ratio+12 , this.texture.height*this.ratio+12);
	}
		

	}
	
	
	
	this.init(filename, ctx, ratio);
}


