// Boss DR-110 Emulation code
// Contact leviathant@gmail.com or visit http://github.com/leviathant/dr110 for more info.

//Todo: Accent & Balance
var clicking = false;
var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1; //Todo: Check features, not browsers.

var songs = {};
var sequences = {};
var active_sequence = {};

var banks = ["A","B","C","D"];
var circuits = ["AC","BD","SD","OH","CH","CY","HC"];
var patterns = 8;

var shiftEngaged = false;
var tempo = 120;
var maxTempo = 320;
var knobMin = 12;
var knobMax = 88;

var volume=0.8; /* 0-1 */
var accent=0.2; /* 0-1 */
var rate = 15000/tempo;

var selectedInstrument = 1;
var bank = 0;
var measure = 1;
var step = 1; // Theoretically goes up to 16
var song = 1;
var patternLength = 16;
var maxSteps = 16;
var pattern = 1;
var selectedMode = 4;

var hihatAudio = new Audio(); // Global hihat audio for supporting open/closed hihat cutoff
var DR110HEART = "";
var sharedDisplayInstrument = 0;

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

startBeat = function(){
	clearInterval(DR110HEART);
	clearTimeout(DR110HEART);
	DR110HEART = "";
	step = 1;
	rate = 15000/tempo;
	DR110HEART = setInterval("staticTempoBeat()",rate);
};

stopBeat = function(){
	clearInterval(DR110HEART);
	clearTimeout(DR110HEART);
	DR110HEART = "";
	step = 1;
};

staticTempoBeat = function(){
	nextStep();
	for(circuit=0;circuit<=6;circuit++){
		if(active_sequence[circuits[circuit]][step] == 1){
			if((circuits[circuit] == "OH") && (active_sequence["CH"][step] == 1)){
				// Don't play the open hihat if it lands on the same beat as a closed hihat.
			}
			else if((circuits[circuit] == "CH") && (active_sequence["OH"][step] == 1)){
				playFile(instruments[7],(active_sequence[step]==1)); // Play the pedal hat
			}
			else{
				playFile(instruments[q],(active_sequence[step]==1));
			}
		}
	}
};

mode = {
	1:'Song Play',
	2:'Pattern Play',
	3:'Song Write',
	4:'Step Write',
	5:'Tap Write'
};

instruments = {
	0:'Accent',
	1:'BassDrum',
	2:'SnareDrum',
	3:'OpenHihat',
	4:'ClosedHihat',
	5:'Cymbal',
	6:'HandClap',
	7:'PedalHat' //Only occurs when open and closed hats are triggered simultaneously
};


initialize = function(){
	$('#bank').html(String.fromCharCode(65+bank));
	$('#mode').html(mode[selectedMode]);
	$('#song').html((song==1)?"I":"II");
	$('#pattern').html(pattern);
	updateSequenceDisplay();
};

writeDot = function(thisInstrument,thisStep,override){
	if(((thisInstrument == selectedInstrument) || (thisInstrument === 0 && selectedInstrument == override))&& thisStep == step){
		$("#sequ" + instruments[thisInstrument]).append("<img src=\"./images/dot_blink.png\" class=\"step" + thisStep + "\">");
	}
	else{
		try{
			if(active_sequence[circuits[(override)?override:thisInstrument]][thisStep] === 0){
				$("#sequ" + instruments[thisInstrument]).append("<img src=\"./images/dot_off.png\" class=\"step" + thisStep + "\">");
			}
			else{
				$("#sequ" + instruments[thisInstrument]).append("<img src=\"./images/dot.png\" class=\"step" + thisStep + "\">");
			}
		}
		catch(err){
			//Ha!
		}
	}
};

updateSequenceDisplay = function(){
	var seqHTML = "";
	for(_inst=0;_inst<7;_inst++){
		if(_inst > 0 && _inst < 5){
			$("#sequ" + instruments[_inst]).html("");
			for(_step=1;_step<17;_step++){
				writeDot(_inst,_step,false);
			}
		}
		else{ //Shared pattern display
			if(_inst == sharedDisplayInstrument){
				switch(_inst){
					case 5:
						$("#splitDisplay").html("&nbsp;&nbsp;&nbsp;/CY/");	//hackity...
					break;
					case 6:
						$("#splitDisplay").html("&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;/CP");	//hack...
					break;
					case 0:
						$("#splitDisplay").html("AC/&nbsp;&nbsp;/");				//hack.
					break;
				}
				$("#sequ" + instruments[0]).html("");
				for(_step=1;_step<17;_step++){
					writeDot(0,_step,(sharedDisplayInstrument==selectedInstrument)?selectedInstrument:sharedDisplayInstrument);
				}
			}
		}
	}
};

handle_keydown = function(e){
	var code;
	if (!e) e = window.event;
	if (e.shiftKey==1){
        $("#butShift").trigger('click');
    }
	if (e.keyCode) {
		code = e.keyCode;
	}
	else if (e.which){
		code = e.which;
	}
	if(code == 192){
		$("#butABCD").trigger('click');
	}
	var character = String.fromCharCode(code);
	switch(character){
		case '1':
			$("#but1").trigger('click');
		break;
		case '2':
			$("#but2").trigger('click');
		break;
		case '3':
			$("#but3").trigger('click');
		break;
		case '4':
			$("#but4").trigger('click');
		break;
		case '5':
			$("#but5").trigger('click');
		break;
		case '6':
			$("#but6").trigger('click');
		break;
		case '7':
			$("#but7").trigger('click');
		break;
		case '8':
			$("#but8").trigger('click');
		break;
		case '9':
			$('#butStart').trigger('click');
		break;
		case '0':
			$('#butStop').trigger('click');
		break;
		case 'Z':
			$("#butAccent").trigger('click');
		break;
		case 'X':
			$("#butBassDrum").trigger('click');
		break;
		case 'C':
			$("#butSnareDrum").trigger('click');
		break;
		case 'V':
			$("#butOhihat").trigger('click');
		break;
		case 'B':
			$("#butChihat").trigger('click');
		break;
		case 'N':
			$("#butCymbal").trigger('click');
		break;
		case 'M':
			$("#butHandClap").trigger('click');
		break;

	}
};

playFile = function(filename,withAccent){
	if(filename==instruments[3] || filename==instruments[4] || filename==instruments[7]){ // Handle hihats as best as I can
		hihatAudio.pause();
		hihatAudio = new Audio();
		if(is_chrome){
			hihatAudio.src = './audio/' + filename + '.mp3';
		}
		else{
			hihatAudio.src = './audio/' + filename + '.wav';
		}
		hihatAudio.volume=(withAccent)?volume+accent:volume;
		hihatAudio.play();
	}
	else{
		var audio = new Audio();
		if(is_chrome){
			audio.src = './audio/' +  filename + '.mp3';
		}
		else{
			audio.src = './audio/' +  filename + '.wav';
		}
		audio.volume=(withAccent)?volume+accent:volume;
		audio.play();
	}
};

numberButton = function(number){
	if(number==6){
		$('#but' + number).bind('click', function(event) {
			if(shiftEngaged){
				patternLength=(patternLength==16)?12:16;
				if(patternLength==16){
					$("#patternLength").css('left','360px');
				}
				else{
					$("#patternLength").css('left','300px');
				}

				active_sequence.pattern_length = patternLength;
			}
			else{
				sequences[banks[bank]][pattern] = active_sequence;
				pattern = number;
				active_sequence = sequences[banks[bank]][pattern];
				patternLength = active_sequence.pattern_length;
				step = 1;
			}
			initialize();
		});
	}
	else{
		$('#but' + number).bind('click', function(event) {
			if(shiftEngaged){
				$('#mode').removeClass();
				$('#mode').addClass('posA' + number);
				selectedMode = number;
			}
			else{
				sequences[banks[bank]][pattern] = active_sequence;
				pattern = number;
				active_sequence = sequences[banks[bank]][pattern];
				patternLength = active_sequence.pattern_length;
				step = 1;
			}
			initialize();
		});
	}
};

nextStep = function(){
	step++;
	if(step>patternLength){
		step = 1; //TODO: Double-check.
	}
};

createKnob = function(knobType){
	$("#" + knobType + "Control").mousedown( function( eventObj ) {
		clicking = true;
		$("#" + knobType + "Control").height("300px");
		$("#" + knobType + "Control").css('top',$("#knob" + knobType.capitalize()).offset().top - 190 + "px");
	});
	$("#" + knobType + "Control").mouseup(function( eventObj ) {
		clicking = false;
		$("#" + knobType + "Control").height("60px");
		$("#" + knobType + "Control").css('top',$("#knob" + knobType.capitalize()).offset().top - 83 + "px");
		$('#device').focus(); //Trying to fix knob drag issue.
	});
};

assignKnob = function(knobType,knobFunction){
	$("#" + knobType + "Control").mousemove(function(eventObj){
		if(clicking === false) return;
		var minValue = $("#" + knobType + "Control").offset().top;
		var maxValue = $("#" + knobType + "Control").height() + $("#" + knobType + "Control").offset().top - minValue;
		var currentValue = eventObj.pageY - minValue;
		var pct = currentValue/maxValue * 100;
		var rot = 360 * currentValue/maxValue;
		if(pct > knobMin && currentValue/maxValue * 100 < knobMax){
			eval(knobFunction + '(' + pct + ')');
			$("#knob" + knobType.capitalize()).css('-moz-transform','rotate(-' + rot +'deg)');
			$("#knob" + knobType.capitalize()).css('-webkit-transform','rotate(-' + rot +'deg)');
		}
	});
};

tempoFunction = function(pct){
	tempo = Math.round((1-pct/100) * maxTempo);
	$("#tempo").text(tempo + " bpm" );
};

volumeFunction = function(pct){
	volume = 0.88 - (pct/100);
	$("#volume").text(Math.round(volume * 100));
};

accentFunction = function(pct){
	accent = 0.22-(pct/100) * 0.22;
	$("#accent").text(Math.round(accent * 100));
};

$(document).ready(function(){
	document.onkeydown = handle_keydown;

	$(document).mouseup(function(){
		clicking = false;
	});

	createKnob("tempo");
	assignKnob("tempo","tempoFunction");

	createKnob("volume");
	assignKnob("volume","volumeFunction");

	createKnob("accent");
	assignKnob("accent","accentFunction");

	//Initialize instrument sequences
	for(circuit=0;circuit<=circuits.length;circuit++){
		numberButton(circuit+1);
		active_sequence[circuits[circuit]] = {};
		for(_step=1;_step<=maxSteps;_step++){
			active_sequence[circuits[circuit]][_step] = 0;
		}
	}

	active_sequence.pattern_length = maxSteps;

	//Initialize banks with empty sequences. TODO: Load with original Boss factory presets instead. Heh.
	for(_bank=0;_bank<banks.length;_bank++){
		sequences[banks[_bank]] = {};
		for(_pattern=1;_pattern<=patterns;_pattern++){
			sequences[banks[_bank]][_pattern] = {};
			for(circuit=0;circuit<circuits.length;circuit++){
				sequences[banks[_bank]][_pattern][circuits[circuit]] = {};
				for(step=1;step<=16;step++){
					sequences[banks[_bank]][_pattern][circuits[circuit]][step] = 0;
				}
				sequences[banks[_bank]][_pattern]["pattern_length"] = maxSteps;
			}
		}
	}

	//Write out sequencer dots.
	initialize();

	{ // Grouping buttons 7,8
		$('#but7').bind('click', function(event) {
			if(shiftEngaged){	//Clear pattern
				for(circuit=1;circuit<7;circuit++){
					for(_step=1;_step<=maxSteps;_step++){
						active_sequence[circuits[circuit]][_step] = 0;
					}
				}
				active_sequence.pattern_length = maxSteps;
				patternLength = maxSteps;
				step = 1;
			}
			else{
				pattern = 7;
			}
			initialize();
		});

		$('#but8').bind('click', function(event) {
			if(shiftEngaged){
				//TODO:Reset Measure [SONG MODE]
			}
			else{
				pattern = 8;
			}
			initialize();
		});
	}

	{ // Grouping shift, abcd, start, stop

		$('#butShift').bind('click', function(event) {
			$('#butShift').toggleClass('engaged');
			shiftEngaged=(shiftEngaged)?false:true;
		});

		$('#butABCD').bind('click', function(event){
			if(shiftEngaged){
				song=(song==1)?2:1;
				$('#song').removeClass();
				$('#song').addClass('song' + song);
			}
			else{
				$('#bank').removeClass('pos' + (bank+1));
				sequences[banks[bank][pattern]] = active_sequence;
				bank++;
				if(bank > 3){bank=0;}
				$('#bank').addClass('pos' + (bank+1));
				active_sequence = sequences[banks[bank]][pattern];
				patternLength = sequences[banks[bank]][pattern].pattern_length;
			}
			initialize();
		});

		$('#butStart').bind('click', function(event){
			switch(selectedMode){
				case 1:
					// start sequence playback
					break;
				case 2:
					startBeat();
					break;
				case 3:
					// I forget
					break;
				case 4:
					active_sequence[circuits[selectedInstrument]][step] = 1;
					nextStep();
					initialize();
					playFile(instruments[selectedInstrument],false);
					break;
				case 5:
					startBeat();
					break;
				}
		});

		$('#butStop').bind('click', function(event){
			switch(selectedMode){
				case 1:
					// stop sequence playback
					break;
				case 2:
					stopBeat();
					break;
				case 3:
					// I forget
					break;
				case 4:
					active_sequence[circuits[selectedInstrument]][step] = 0;
					nextStep();
					initialize();
					break;
				case 5:
					stopBeat();
					break;
				}
		});
	}

	{ // Grouping instrument button functions
		$('#butBassDrum').bind('click', function(event) {
			selectedInstrument = 1;
			if(selectedMode > 3){
				playFile(instruments[selectedInstrument],false);
				if(selectedMode==5){
					active_sequence[circuits[selectedInstrument]][step] = 1; //(step==1)?16:step-1 to account for lag?
				}
				else{
					step = 1;
				}
				initialize();
			}
			else{
				measure++;
				if(measure<1){
					measure = 128;
				}
				initialize();
			}
		});
		$('#butAccent').bind('click', function(event) {
			selectedInstrument=0;
			sharedDisplayInstrument=selectedInstrument;
			if(selectedMode > 3){
				if(selectedMode==5){
					active_sequence[circuits[selectedInstrument]][step] = 1;
				}
				else{
					step = 1;
				}
				initialize();
			}
		});
		$('#butSnareDrum').bind('click', function(event) {
			selectedInstrument = 2;
			if(selectedMode > 3){
				playFile(instruments[selectedInstrument],false);
				if(selectedMode==5){
					active_sequence[circuits[selectedInstrument]][step] = 1;
				}
				else{
					step = 1;
				}
				initialize();
			}
			else{
				measure++;
				if(measure>128){
					measure = 1;
				}
				initialize();
			}
		});
		$('#butOhihat').bind('click', function(event) {
			selectedInstrument=3;
			if(selectedMode > 3){
				playFile(instruments[selectedInstrument],false);
				if(selectedMode==5){
					active_sequence[circuits[selectedInstrument]][step] = 1;
				}
				else{
					step = 1;
				}
				initialize();
			}
			else{
				// Enter  [SONG MODE]
			}
		});
		$('#butChihat').bind('click', function(event) {
			selectedInstrument=4;
			if(selectedMode > 3){
				playFile(instruments[selectedInstrument],false);
				if(selectedMode==5){
					active_sequence[circuits[selectedInstrument]][step] = 1;
				}
				else{
					step = 1;
				}
				initialize();
			}
			else{
				// De capo  [SONG MODE]
			}
		});
		$('#butCymbal').bind('click', function(event) {
			selectedInstrument=5;
			sharedDisplayInstrument=selectedInstrument;
			if(selectedMode > 3){
				playFile(instruments[selectedInstrument],false);
				if(selectedMode==5){
					active_sequence[circuits[selectedInstrument]][step] = 1;
				}
				else{
					step = 1;
				}
				initialize();
			}
		});
		$('#butHandClap').bind('click', function(event) {
			selectedInstrument=6;
			sharedDisplayInstrument=selectedInstrument;
			if(selectedMode > 3){
				playFile(instruments[selectedInstrument],false);
				if(selectedMode==5){
					active_sequence[circuits[selectedInstrument]][step] = 1;
				}
				else{
					step = 1;
				}
				initialize();
			}
		});
	}

	$("#knobTempo").css('-moz-transform','rotate(-232deg)');
	$("#knobTempo").css('-webkit-transform','rotate(-232deg)');
});

