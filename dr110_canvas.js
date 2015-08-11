// {
  var canvas = document.getElementById('myCanvas');
  var canvasContext = canvas.getContext('2d');
  var sizeMultiplier = 1;
  var radius = 20 * sizeMultiplier;
  pixelSize = 2 * sizeMultiplier;
// }

initializeCanvas = function(){
	bossWidth = 900 * sizeMultiplier;
  bossHeight = 515 * sizeMultiplier;

  canvas.height = bossHeight;
  canvas.width = bossWidth;


  canvasContext.lineWidth = pixelSize;


  // BODY
  canvasContext.beginPath();
  canvasContext.rect(pixelSize, 5 * pixelSize, bossWidth - (2 * pixelSize), bossHeight - (6* pixelSize));
  canvasContext.fillStyle = '#B8B8BA';
  canvasContext.fill();
  canvasContext.strokeStyle = '#000000';
  canvasContext.stroke();

  // Black screen border
  canvasContext.beginPath();
  canvasContext.rect(pixelSize, 5 * pixelSize, (bossWidth - (2 * pixelSize)) / 2, (bossHeight - (6* pixelSize)) /2  );
  canvasContext.fillStyle = '#000000';
  canvasContext.fill();

  // Green screen
	canvasContext.beginPath();
  canvasContext.rect(20 * pixelSize, 25 * pixelSize, (bossWidth - (2 * pixelSize)) / 2 - 50 * pixelSize, (bossHeight - (6* pixelSize)) /2 -40 * pixelSize );
  canvasContext.fillStyle = '#909844';
  canvasContext.fill();

  // Accent lines
  accentLine(101);
  accentLine(108);
  accentLine(115);
  accentLine(122);
  accentLine(129);

  // canvasContext.lineWidth = 4 * pixelSize;
  // canvasContext.beginPath();
  // canvasContext.moveTo( 225 * pixelSize,  100 * pixelSize);
  // canvasContext.lineTo(bossWidth - 1 * pixelSize, 100 * pixelSize);
  // canvasContext.strokeStyle = '#707070';
  // canvasContext.stroke();

	console.log('so far so good');

};

accentLine = function(height){
	canvasContext.lineWidth = 3 * pixelSize;
  canvasContext.beginPath();
  canvasContext.moveTo( 225 * pixelSize,  height * pixelSize);
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

  canvasContext.drawImage(knobCanvas, centerX -  radius - pixelSize, centerY -2 * radius /2 - pixelSize );
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
  kc.strokeStyle = '#00FFFF';
  kc.stroke();
  kc.beginPath();
  kc.moveTo(centerX - 2 * radius,centerY - 2 * radius);
  kc.lineTo(centerX - 2 * radius, centerY - 2 * radius + radius);
  kc.stroke();
};

