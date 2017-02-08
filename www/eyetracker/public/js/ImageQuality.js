
// --------------------------------------------------------------
// Interface to Character 
function QualityMetric(blockSize) {
	this.blockSize = 16;
	
	if ( typeof QualityMetric.initialized == "undefined" ) {

	QualityMetric.prototype.init = function(blockSize) {
		this.blockSize = blockSize;
	}

	
    // S. S. Agaian, K. P. Lentz, and A. M. Grigoryan, "A new measure of image enhancement," 
    // in IASTED International Conference on Signal Processing & Communication, 2000, pp. 19-22
	QualityMetric.prototype.evalImage = function(pix, width, height) {	

            var metric = 0;
            // divide the picture into blocks
            for(var ii = 0 ; ii < height/this.blockSize-1 ; ++ii) {
                for(var jj = 0 ; jj < width/this.blockSize-1 ; ++jj) {
                    var mn = 256;
                    var mx = 0;

                    // per-block, find the max/min luminance value
                    for(var i = ii*this.blockSize ; i < this.blockSize*ii+this.blockSize ; ++i) {
                        for(var j = jj*this.blockSize ; j < this.blockSize*jj+this.blockSize ; ++j) {
                            var idx = (i*width+j)*4;
                            var y = this.rgb2ycbcr(pix[idx], pix[idx+1], pix[idx+2]);
                            if(y < mn) { mn = y; };
                            if(y > mx) { mx = y; };
                        }
                    }
                    mx /= 256;
                    mn /= 256;
                    metric +=  ((mx+0.01)/(mn+0.01))*Math.log((mx+0.01)/(mn+0.01)); 
                }
            }

            metric /= (height/this.blockSize * width/this.blockSize);

            return metric; 	
        }

        // convert RGB to YCbCr
        QualityMetric.prototype.rgb2ycbcr = function(r, g, b) {
            var y  = ( 0.299   * r + 0.587   * g + 0.114   * b);
            //var cb = (-0.16874 * r - 0.33126 * g + 0.50000 * b);
            //var cr = ( 0.50000 * r - 0.41869 * g - 0.08131 * b);

            return y;
        }

        QualityMetric.prototype.histogram = function(pix) {
            var hR = [];
            var hG = [];
            var hB = [];

            for (var i = 0; i < 256; i++) {
                hR[i] = 0; hG[i] = 0; hB[i] = 0;
            }

            for (var i = 0, n = pix.length; i < n; i += 4) {
                hR[pix[i]]++;  // red
                hG[pix[i+1]]++;  // green
                hB[pix[i+2]]++;  // blue
            }
        }


        QualityMetric.prototype.max_hist = function(hB) {
           var mx = 0; 
           var mx_idx = 0;
           for (var i = 0; i < 256; i++) {
               if(hB[i] > mx) {
                  mx = hB[i]; mx_idx = i;
                }
            }
            return mx_idx;
        }


        }
	this.init(blockSize);

}


