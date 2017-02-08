
// ----------------------------------------------------------------------------------------------
// Evaluation procedure

var objectList = new Array();
var task_nb_circles = 0;

function createTest() {
   var NB_CIRCLES = 100;
   var colors = ['red', 'green', 'blue', 'yellow', 'cyan', 'brown', 'black', 'purple', 'pink'];

   for(var i = 0 ; i < NB_CIRCLES ; ++i) {
      var x = Math.floor(Math.random() * ((c.width-40) / 46)+1);
      var y = Math.floor(Math.random() * ((c.height-40) / 46)+1);
      var selc = Math.floor(Math.random() * 9);

      while(placeTaken(x, y)) {
         x = Math.floor(Math.random() * (c.width/46)+1);
         y = Math.floor(Math.random() * (c.height/46)+1);
      }

      if(selc == 0) task_nb_circles++;

      objectList.push(new Circle(7, colors[selc], colors[selc]));
      objectList[objectList.length-1].setPos(x*46, y*46);      

      
   }

}

function placeTaken(x, y) {
   for(var j = 0 ; j < objectList.length ; ++j) {
      if( objectList[j].posX/46 == x && objectList[j].posY/46 == y)
         return true;
   }
   return false;
}


var nbClicked = 0;

function startEvaluationTest() {
//    showInstructions();
}


function showInstructions() {
    ctx.font = "18px Arial";
    ctx.fillText("Please click on all the red circles! ", (c.width-250)/2, 200);

    loopThreadID = setInterval( startMainLoopEval, 4000 );
}

function startMainLoopEval() {    
    clearInterval(loopThreadID);
    c.width = c.width;
    createTest();
    loopThreadID = setInterval( evaluationLoop, ONE_FRAME_TIME );
    drawBoard();
}


function evaluationLoop() {
    for(var i = 0 ; i < objectList.length ; ++i) {
        if(objectList[i].isClicked()) {
	    console.log('clicked')
            objectList[i].log();
            objectList[i].clear();
            nbClicked++;
            clicX = -1; clicY = -1;
        }
    }

    if(nbClicked == task_nb_circles)
        evaluationOver();
	
}


function evaluationOver() {
    clearInterval(loopThreadID);
    c.width = 0;
    c.height = 0;

    progressBar.style.visibility = "visible";
    progressBar.style.height = "40px";
    progressBar.style.width = "400px";

    // what I should do!
    hangup();

    // for debug:
    //controlButtonGroup.style.visibility = "visible";
    //controlButtonGroup.style.height = "auto";   
    //controlButtonGroup.style.width = "400px";     

}


// ----------------------------------------------------------------------------------------------
// setup board


function drawBoard() {
    for(var i = 0 ; i < objectList.length ; ++i) {
        objectList[i].draw();
    }	
}




function Circle(radius, color, name) {
        this.posX;
        this.posY;
        this.radius;
        this.color;
        this.name;
        this.clicked;

        if ( typeof Circle.initialized == "undefined" ) {

        Circle.prototype.init = function(radius, color, name) {
                this.radius = radius;
                this.color = color;
                this.name = name;
                this.clicked = 0;
        }

        Circle.prototype.setPos = function(x, y) {
                this.posX = x;
                this.posY = y;
        }

        Circle.prototype.log = function() {
                logClick = logClick + "\t\t<object name=\"" + this.name + "\" x=\"" + (Math.floor(this.posX*100))/100 + "\" y=\"" + (Math.floor(this.posY*100))/100 + "\" />\n";
        }

        Circle.prototype.draw = function() {
                ctx.beginPath();
                ctx.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.stroke();
        }

        Circle.prototype.isClicked = function() {
                if(this.clicked == 1) return false;

                if(clicX >= this.posX-this.radius && clicX <= this.posX+this.radius && clicY >= this.posY-this.radius && clicY <= this.posY+this.radius) {
                        this.clicked = 1;
                        return true;
                } else {
                        return false;
                }
        }

        Circle.prototype.clear = function() {
                ctx.clearRect(this.posX-this.radius-2, this.posY-this.radius-2, 2*this.radius+4, 2*this.radius+4);
        }
    }

    this.init(radius, color, name);
}


// --------------------------------------------------------------------
// end of test


function releaseToken() {
    location.href = location.protocol + "//imtdienste.rz.tu-ilmenau.de/campaign/post_session_assessments/new";
    link_next.style.visibility = "visible";
}



