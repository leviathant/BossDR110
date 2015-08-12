var canvas = document.getElementById('myCanvas');
var canvasContext = canvas.getContext('2d');
var sizeMultiplier = 1;
var radius = 25 * sizeMultiplier;
pixelSize = 2 * sizeMultiplier;

initializeCanvas = function(){
	bossWidth = 900 * sizeMultiplier;
  bossHeight = 515 * sizeMultiplier;

  canvas.height = bossHeight;
  canvas.width = bossWidth;

  canvasContext.lineWidth = pixelSize;

  // BODY
  roundedRectangle(
		pixelSize,
		5 * pixelSize,
		448 * pixelSize,
		250 * pixelSize,
		10 * pixelSize,
		canvasContext,
		"#000000",
		2 * pixelSize,
		'#B8B8BA'
	);

  // Black screen border
  topRightRoundRect(
		pixelSize,
		5 * pixelSize,
		224 * pixelSize,
		125 * pixelSize,
		10 * pixelSize,
		canvasContext,
		"#000000",
		1 * pixelSize,
		'#000000'
  );

  // Green screen
	roundedRectangle(
		30 * pixelSize,
		25 * pixelSize,
		160 * pixelSize,
		85 * pixelSize,
		8 * pixelSize,
		canvasContext,
		"#000000",
		1 * pixelSize,
		'#A0A854'
	);

	// Note grid container
	roundedRectangle(
		35 * pixelSize,
		42 * pixelSize,
		150 * pixelSize,
		35 * pixelSize,
		3 * pixelSize,
		canvasContext,
		"#000000",
		1 * pixelSize,
		'none'
	);
	canvasContext.beginPath();
	canvasContext.moveTo(65 * pixelSize,  42 * pixelSize);
  canvasContext.lineTo(65 * pixelSize,  77 * pixelSize);
  canvasContext.stroke();

	// Mode indicator container
	roundedRectangle(
		135 * pixelSize,
		80 * pixelSize,
		50 * pixelSize,
		28 * pixelSize,
		3 * pixelSize,
		canvasContext,
		"#000000",
		1 * pixelSize,
		'none'
	);
	canvasContext.beginPath();
	canvasContext.moveTo(148 * pixelSize,  80 * pixelSize);
  canvasContext.lineTo(148 * pixelSize,  108 * pixelSize);
  canvasContext.stroke();

	// Song/Measure container
	roundedRectangle(
		35 * pixelSize,
		80 * pixelSize,
		62 * pixelSize,
		28 * pixelSize,
		3 * pixelSize,
		canvasContext,
		"#000000",
		1 * pixelSize,
		'none'
	);

	canvasContext.beginPath();
	canvasContext.moveTo(47 * pixelSize,  80 * pixelSize);
  canvasContext.lineTo(47 * pixelSize,  108 * pixelSize);
  canvasContext.stroke();

	// Bank/Rythm Container
	roundedRectangle(
		100 * pixelSize,
		80 * pixelSize,
		32 * pixelSize,
		28 * pixelSize,
		3 * pixelSize,
		canvasContext,
		"#000000",
		1 * pixelSize,
		'none'
	);

	canvasContext.beginPath();
	canvasContext.moveTo(113 * pixelSize,  80 * pixelSize);
  canvasContext.lineTo(113 * pixelSize,  108 * pixelSize);
  canvasContext.stroke();


  // Accent lines
  accentLine(101);
  accentLine(108);
  accentLine(115);
  accentLine(122);
  accentLine(129);

  //
	knob(30,562);
	knob(60,655);
	knob(0,752);
	knob(110,850);

	console.log('so far so good');

};

accentLine = function(height){
	canvasContext.lineWidth = 3 * pixelSize;
  canvasContext.beginPath();
  canvasContext.moveTo(225.5 * pixelSize,  height * pixelSize);
  canvasContext.lineTo(bossWidth - 1 * pixelSize, height * pixelSize);
  canvasContext.strokeStyle = '#909090';
  canvasContext.stroke();

};

knob = function(value, position){
	knobCanvas = document.createElement('canvas');
  knobCanvas.height =  2 * (2 * radius);
  knobCanvas.width = 2 * (2 * radius);
  knobContext = knobCanvas.getContext('2d');

  // Here be dragons...
  if(value > 100){
    mult=2.7;
  }
  else if(value > 70 ){
    mult=2.8;
  }
  else if( value < 20){
    mult = 2.85;
  }
  else{
    mult=3;
  }

  knobvalue = value * mult;

  tweakKnob(radius, radius, radius, radius, knobvalue, knobContext);

  centerY = 130;
  centerX = position;
  centerX = centerX * sizeMultiplier;
  centerY = centerY  * sizeMultiplier;

  canvasContext.drawImage(
		knobCanvas,
		centerX - radius - pixelSize,
		centerY - 2 * radius / 2 - pixelSize
	);
};

tweakKnob = function(x, y, width, height, degrees, kc) {
  x = x/2 + pixelSize;
  y = y/2 + pixelSize;
  centerX = 2 * radius;
  centerY = 2 * radius;
  kc.beginPath();
  kc.lineWidth = pixelSize;
  kc.translate(x + width / 2, y + height / 2);
  kc.rotate(degrees * Math.PI / 180);
  kc.arc(centerX - 2 * radius, centerY - 2 * radius, radius, 0, 360, false);
  kc.fillStyle = '#000000';
  kc.fill();
  kc.stroke();
  kc.beginPath();
  kc.moveTo(centerX - 2 * radius,centerY - 2 * radius);
  kc.strokeStyle = '#FF8800';
  kc.lineWidth = 2 * pixelSize;
  kc.lineTo(centerX - 2 * radius, centerY - 2 * radius + radius);
  kc.stroke();
};

roundedRectangle = function(x,y,w,h,radius,subCanvas,lineColor,lineSize,fillColor){
	var r = x + w;
	var b = y + h;
	subCanvas.beginPath();
	subCanvas.strokeStyle=lineColor;
	subCanvas.lineWidth=lineSize;
	subCanvas.moveTo(x+radius, y);
	subCanvas.lineTo(r-radius,y);
	subCanvas.quadraticCurveTo(r,y,r,y+radius);
	subCanvas.lineTo(r,y+h-radius);
	subCanvas.quadraticCurveTo(r,b,r-radius,b);
	subCanvas.lineTo(x+radius, b);
	subCanvas.quadraticCurveTo(x,b,x,b-radius);
	subCanvas.lineTo(x,y+radius);
	subCanvas.quadraticCurveTo(x,y,x+radius,y);
	subCanvas.stroke();
	if(fillColor != "none"){
		subCanvas.fillStyle = fillColor;
		subCanvas.fill();
  }
};

topRightRoundRect = function(
	x,y,w,h,
	radius,subCanvas,
	lineColor,lineSize,
	fillColor){
	var r = x + w;
	var b = y + h;
	subCanvas.beginPath();
	subCanvas.strokeStyle=lineColor;
	subCanvas.lineWidth=lineSize;
	subCanvas.moveTo(x+radius, y);
	subCanvas.lineTo(r,y);
	subCanvas.lineTo(r,y+h);
	subCanvas.lineTo(x, b);
	subCanvas.lineTo(x,y+radius);
	subCanvas.quadraticCurveTo(x,y,x+radius,y);
	subCanvas.stroke();
	subCanvas.fillStyle = fillColor;
  subCanvas.fill();
};


