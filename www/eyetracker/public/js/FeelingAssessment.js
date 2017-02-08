

// ---------------------------------------------------------------------------------
// Display rating scales


function Feeling(file_left, file_right, label_l, label_r, ctx, scale, colors ) {
	this.posX;
	this.posY;
	this.context;
	this.scale;

	this.width = 600;
	this.height = 30;

	this.sliderVisible = false;
	this.value = -1;

	this.leftImage;
	this.labelLeft;
	this.rightImage;
	this.labelRight;


	this.nbImgLoaded = 0;
	this.colors;
	
	
	if ( typeof Feeling.initialized == "undefined" ) {

	Feeling.prototype.init = function(filename_left, filename_right, label_l, label_r, ctx, scale, colors) {	
		this.scale = scale || 1;
		this.colors = colors || new Array();
		if(this.colors.length == 0) {
			this.colors.push("red");
			this.colors.push("yellow");
			this.colors.push("green");
		}

		this.leftImage = new Character(filename_left, ctx, this.scale);
		this.rightImage = new Character(filename_right, ctx, this.scale);

		var myThis = this; // allow to call this in the function....
		this.leftImage.texture.onload = function()  {myThis.checkLoad();}
		this.rightImage.texture.onload = function() {myThis.checkLoad();}

		this.labelLeft = label_l;
		this.labelRight = label_r;
		this.context = ctx;
	}

	Feeling.prototype.checkLoad = function() {
		++this.nbImgLoaded;
		if(this.nbImgLoaded == 2) {
			//for(var i = 0 ; i < allFeelings.length ; ++i)
			//	allFeelings[i].onload();
			this.onload();
		}
	}
	
	Feeling.prototype.setPos = function(x, y) {	
		this.posX = x;
		this.posY = y;
		
		this.leftImage.setPos(x,y);
		this.rightImage.setPos(x+this.width*this.scale, y);
		
	}
		
	Feeling.prototype.draw = function() {	
		this.leftImage.draw();
		this.rightImage.draw();

		var minX = (this.posX + this.leftImage.texture.width*this.scale);
                var maxX = (this.posX +  this.width*this.scale -3 );
                var minY = ( (this.leftImage.texture.height*this.scale - this.height*this.scale)/2 + this.posY);
                var maxY = ( (this.leftImage.texture.height*this.scale + this.height*this.scale)/2 + this.posY);
		

		this.context.fillStyle="#000000";
		this.context.font = "bold 16px Arial";
		this.context.fillText(this.labelLeft, this.posX, this.posY-20*this.scale);
		this.context.fillText(this.labelRight, this.posX+this.width*this.scale, this.posY-20*this.scale);

		var grd=this.context.createLinearGradient(minX,0,maxX,0);
		for(var i = 0 ; i < this.colors.length ; ++i) {
			grd.addColorStop(i/(this.colors.length-1), this.colors[i]);
		}

		this.context.fillStyle = grd;
		this.context.fillRect(this.posX + this.leftImage.texture.width*this.scale, (this.leftImage.texture.height - this.height)*this.scale/2 + this.posY, this.width*this.scale - this.leftImage.texture.width*this.scale-3, this.height*this.scale);

		if(this.sliderVisible) {
			this.context.fillStyle="#000000";
			var pos = this.value*(maxX-minX)+minX;
			this.context.fillRect(pos-5, minY-5, 10, maxY-minY+10);
		}
	}



	Feeling.prototype.onload = function() {
		// void
		this.draw();
	}

	
	
	Feeling.prototype.isClicked = function(x, y) {	
		var minX = (this.posX + this.leftImage.texture.width*this.scale);
		var maxX = (this.posX +  this.width*this.scale -3 );
		var minY = ( (this.leftImage.texture.height*this.scale - this.height*this.scale)/2 + this.posY);
		var maxY = ( (this.leftImage.texture.height*this.scale + this.height*this.scale)/2 + this.posY);
	
		if(x > minX && x < maxX && y > minY && y < maxY) {
			
			this.sliderVisible = true;

			this.value = (x - minX) / (maxX-minX);
			
			//this.context.width = this.context.width;
			this.clearSprite();
			this.draw();

			return true;
		}
		return false;

	}
	
	Feeling.prototype.clearSprite = function() {
		var minX = (this.posX + this.leftImage.texture.width*this.scale);
                var maxX = (this.posX +  this.width*this.scale -3 );
                var minY = ( (this.leftImage.texture.height*this.scale - this.height*this.scale)/2 + this.posY);
                var maxY = ( (this.leftImage.texture.height*this.scale + this.height*this.scale)/2 + this.posY);
	
		this.context.clearRect(minX-1,minY-10, maxX-minX+2, maxY-minY+20); 
	
	}
	
	
	
	}
	
	this.init(file_left, file_right, label_l, label_r, ctx, scale, colors);
}



