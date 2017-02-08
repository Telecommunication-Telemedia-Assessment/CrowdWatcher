// -----------------------------------------------------------------
// Get arguments from HTML page
var scripts = document.getElementsByTagName('script');
var myScript = scripts[ scripts.length - 1 ];

var queryString = myScript.src.replace(/^[^\?]+\??/,'');

function parseQuery ( query ) {
  var Params = new Object ();
  if ( ! query ) return Params; // return empty object
  var Pairs = query.split(/[;&]/);
  for ( var i = 0; i < Pairs.length; i++ ) {
    var KeyVal = Pairs[i].split('=');
    if ( ! KeyVal || KeyVal.length != 2 ) continue;
    var key = unescape( KeyVal[0] );
    var val = unescape( KeyVal[1] );
    val = val.replace(/\+/g, ' ');
    Params[key] = val;
  }
  return Params;
}

var params = parseQuery( queryString );


// ---------------------------------------------------------------------------------
// Display rating scales


function PickMood(ctx, ratio) {
	this.moodList = new Array();
	this.moodListPosX = new Array();
	this.moodListPosY = new Array();
	this.posX;
	this.posY;
	this.nbImgLoaded = 0;
	this.aspectRatioY = 1;
	this.aspectRatioX = 1;
	this.oneSelected = -1;
	this.context;
	this.value = -1;
	this.ratio;
	
	
	if ( typeof PickMood.initialized == "undefined" ) {

	PickMood.prototype.init = function(ctx, ratio) {	
		this.ratio = ratio || 1;

		this.moodList.push(new Character("../images/PickMood/" + params['gender'] + "/tense.png", ctx, this.ratio));
		this.moodList.push(new Character("../images/PickMood/" + params['gender'] + "/excited.png", ctx, this.ratio));
		this.moodList.push(new Character("../images/PickMood/" + params['gender'] + "/cheerful.png", ctx, this.ratio));
		this.moodList.push(new Character("../images/PickMood/" + params['gender'] + "/relaxed.png", ctx, this.ratio));
		this.moodList.push(new Character("../images/PickMood/" + params['gender'] + "/calm.png", ctx, this.ratio));
		this.moodList.push(new Character("../images/PickMood/" + params['gender'] + "/bored.png", ctx, this.ratio));
		this.moodList.push(new Character("../images/PickMood/" + params['gender'] + "/sad.png", ctx, this.ratio));
		this.moodList.push(new Character("../images/PickMood/" + params['gender'] + "/irritated.png", ctx, this.ratio));
		this.moodList.push(new Character("../images/PickMood/" + params['gender'] + "/neutral.png", ctx, this.ratio));
		this.moodList.push(new Character("../images/PickMood/DoNotKnow.jpg", ctx, this.ratio));
		
		this.moodListPosX.push(300*this.ratio); this.moodListPosY.push(92*this.ratio);
		this.moodListPosX.push(485*this.ratio); this.moodListPosY.push(92*this.ratio);
		this.moodListPosX.push(615*this.ratio); this.moodListPosY.push(183*this.ratio);
		this.moodListPosX.push(615*this.ratio); this.moodListPosY.push(335*this.ratio);
		this.moodListPosX.push(485*this.ratio); this.moodListPosY.push(415*this.ratio);
		this.moodListPosX.push(300*this.ratio); this.moodListPosY.push(415*this.ratio);
		this.moodListPosX.push(178*this.ratio); this.moodListPosY.push(335*this.ratio);
		this.moodListPosX.push(178*this.ratio); this.moodListPosY.push(183*this.ratio);
		this.moodListPosX.push(386*this.ratio); this.moodListPosY.push(230*this.ratio);
		this.moodListPosX.push(595*this.ratio); this.moodListPosY.push(580*this.ratio);

		this.context = ctx;

		for(var i = 0; i < this.moodList.length ; ++i)
			this.moodList[i].texture.onload = function() {pickMood.checkLoad();}
	}

	PickMood.prototype.checkLoad = function() {
		++this.nbImgLoaded;
		if(this.nbImgLoaded == this.moodList.length) {
			this.onload();
		}
	}
	
	PickMood.prototype.setPos = function(x, y) {	
		this.posX = x;
		this.posY = y;
		
		for(var i = 0; i < this.moodList.length ; ++i)
			this.moodList[i].setPos(this.posX+this.moodListPosX[i], this.posY+this.moodListPosY[i]);
		
	}
		
	PickMood.prototype.draw = function() {	
		for(var idr = 0; idr < this.moodList.length ; ++idr)
			this.moodList[idr].draw();
	}

	PickMood.prototype.onload = function() {
		// void
		this.setPos((c.width-945*this.ratio)/2,(c.height-700*this.ratio)/2);	
		this.draw();
	}

	
	
	PickMood.prototype.isClicked = function(x, y) {	
		for(var i = 0; i < this.moodList.length ; ++i)
			if(this.moodList[i].isClicked(x, y)) {
				this.moodList[i].log();
				clicX = -1;
				clicY = -1;
				if(this.oneSelected != -1) {
					c.width = c.width
					this.moodList[this.oneSelected].clearSprite();
					this.draw();
				}

				this.oneSelected = i;
				this.moodList[i].drawBoundingBox();
				this.value = i;
				return true;
			}
		return false;
	}
	
	PickMood.prototype.clearSprite = function() {	
		for(var i = 0; i < this.moodList.length ; ++i)
			this.moodList[i].clearSprite();
	}
	
	
	
	}
	
	this.init(ctx, ratio);
}



