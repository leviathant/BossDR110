/*

OscNode/AudioBuffer > FilterNode > GainNode  > AudioDestinationNode
AudioBuffer > AudioBufferSourceNode

osc -> masterGain -> Filter -> Gain -> Destination

hihat = new HiHat(context); hihat.setup(context); hihat.shortToGround(context);
*/
hh1 = [880, 1160, 3280, 2250]; //Cymbal frequencies?
hh2 = [870, 1220, 3150, 2150];
hh3 = [465, 317, 820, 1150];
/*
HH OSC
0.88ms
1.16ms
3.28ms
2.25ms

Alt:
0.87ms
1.22ms
3.15ms
2.15ms

Envelope Times:
TestPoint   Time  Voltage   Voice(?)
5 700ms   6v    (OH)
6 80ms    6v    (CH)
7 60ms    6v    (CY) Bell
8 900ms   6v    (CY)
9 1.4s    2.7v  (CY)
11 140ms   5v   (HC)
12 700ms   5v   (HC)
13 100ms   5.7v (SD)
14 120ms   5.7v (AC)

Handclap Retrigger Time:
10 10ms x3

currentNoteStartTime = time;

while(nextNoteTime < audioContext.currentTime + scheduleAheadTime){
  scheduleNote(current16thNote, nextNoteTime);
  nextNote();
}

scheduleNote(time,nextTime){
  noteLength = time - nextTime;
  osc.start(time);
  osc.stop(time + noteLength);
}

function nextNote(){
  var secondsPerVeat = 60 / tempo;
  nextNoteTime += 0.25 * secondsPerBeat;
  currentSixteenthNote++;
  if(currentSixteenthNote == 16){
    currentSixteenthNote = 0;
  }
}
*/

/*

loopDelay = (60 / tempo) * 8; // 8 measures, presumable

setNextLoop = function(){
  nextLoop = audioContext.currentTime
  - ((audioContext.currentTime - loopStart) & loopDelay)
  + loopDelay;
};
*/

// Based on values from schemes, needs to be compared to samples
var context = new AudioContext();

var clapTriggerTime = 0.01;
var snareDecay = 0.1;
var kickDecay = 0.5; // 0.1?
var openHatDecay = 0.7;
var closedHatDecay = 0.08;
var mute = 0.00001;

noiseBuffer = function() {
  var bufferSize = this.context.sampleRate;
  var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
  var output = buffer.getChannelData(0);

  for (var i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  return buffer;
};

HiHat = function(context) {
  this.context = context;
};

HiHat.prototype.setup = function(){
  //Four oscillators, mixed down
  //Noise, at its own volume
  //All bandpass filtered, LFO on the bandpass frequency

  this.noiseAmp = this.context.createGain();
  this.oscMixer = this.context.createGain();
  this.lfoAmount = this.context.createGain();
  this.amp = this.context.createGain();

  this.noise = this.context.createBufferSource(); // Init sample
  this.noise.buffer = noiseBuffer();              // Sample noise
  this.noise.connect(this.noiseAmp);              // Route noise source to amp
  this.noise.loop = true;

  this.noiseAmp.gain.value = 1;

  this.lfo = this.context.createOscillator();
  this.lfo.type = 'sine';
  this.lfo.frequency.value = 4 ;
  this.lfo.start();

  this.lfoAmount.gain.value = 300;

  this.osc = [];
  for(o=0;o<=3;o++){
    this.osc[o] = this.context.createOscillator();
    this.osc[o].type = 'square';
    this.osc[o].connect(this.oscMixer);
  }
  this.oscMixer.gain.value = 0.3;

  this.hiPass = this.context.createBiquadFilter();
  this.hiPass.type = 'highpass';
  this.hiPass.frequency.value = 8000;
  this.hiPass.gain.value = 2;
  this.hiPass.Q.value = 8;

  this.noiseAmp.connect(this.amp);
  this.oscMixer.connect(this.amp);
  this.amp.connect(this.hiPass);

  this.lfo.connect(this.lfoAmount);

  this.hiPass.connect(this.context.destination);// Connect amp to output

  this.lfoAmount.connect(this.hiPass.frequency);

  for(hho = 0; hho < 4; hho++){
    this.osc[hho].frequency.value = hh1[hho]; //hh2 alt frequencies
  }

  for(o=0;o<this.osc.length;o++){
    this.osc[o].start();
  }

  this.noise.start();
  this.amp.gain.value = mute;
  return "hihat";
};

HiHat.prototype.shortToGround = function(){
  this.amp.gain.value = 0.2;
};

HiHat.prototype.trigger = function(time, type){
  switch(type){
    case 'open':
      this.duration = 0.7;
    break;
    case 'closed':
      this.duration = 0.08;
    break;
    case 'pedaled':
      this.duration = 0.2;
    break;
  }

  this.amp.gain.setValueAtTime(0.5, time);
  this.amp.gain.exponentialRampToValueAtTime(mute, time + this.duration);
};

Clap = function(context){
  this.context = context;
};

Clap.prototype.setup = function() {
  // White noise through a modulated bandpass filter

  this.lfoAmount = this.context.createGain();
  this.noiseAmp = this.context.createGain();
  this.amp = this.context.createGain();

  this.noise = this.context.createBufferSource();
  this.noise.buffer = noiseBuffer();
  this.noise.connect(this.noiseAmp);
  this.noise.loop = true;

  this.lfo = this.context.createOscillator();
  this.lfo.type = 'triangle';
  this.lfo.frequency.value = 3;
  this.lfo.start();

  this.lfoAmount.gain.value = 50;

  this.bandPass = this.context.createBiquadFilter();
  this.bandPass.type = 'bandpass';
  this.bandPass.frequency.value = 1000;
  this.bandPass.gain.value = 3;
  this.bandPass.Q.value = 4;

  this.noiseAmp.connect(this.amp);

  this.amp.connect(this.bandPass);

  this.lfo.connect(this.lfoAmount);

  this.bandPass.connect(this.context.destination);

  this.lfoAmount.connect(this.bandPass.frequency);

  this.noise.start();

  this.amp.gain.value = mute;
  return "handclap";

};

Clap.prototype.trigger = function(time){

  for(trigger = 0; trigger < 3; trigger++){
    this.amp.gain.setValueAtTime(1, time + (trigger * clapTriggerTime));
    this.amp.gain.exponentialRampToValueAtTime(
      mute,
      time + ((trigger + 1) * clapTriggerTime)
      );
  }

  this.amp.gain.setValueAtTime(1, time + (3*clapTriggerTime));
  this.amp.gain.exponentialRampToValueAtTime(mute, time + 0.68);
};


function Kick(context) {
  this.context = context;
}

Kick.prototype.setup = function() {
  this.osc = this.context.createOscillator(); // Initialize noise source
  this.amp = this.context.createGain();      // Initialize amplifier
  this.osc.connect(this.amp);                // Route noise source to amp
  this.amp.connect(this.context.destination);// Connect amp to output
};

Kick.prototype.trigger = function(time) {
  this.setup();

  this.osc.frequency.setValueAtTime(150, time);  // Set osc freq
  this.amp.gain.setValueAtTime(1, time);        // Set osc volume

  this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
  this.amp.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

  this.osc.start(time);
  this.osc.stop(time + 0.5);
};

var sixteenths = [
  "0:0", "0:0:1","0:0:2","0:0:3",
  "0:1", "0:1:1","0:1:2","0:1:3",
  "0:2", "0:2:1","0:2:2","0:2:3",
  "0:3", "0:3:1","0:3:2","0:3:3"
  ];

var Score = {};

var sequence_to_tone = function(seq) {
  var kick  = new Kick(context);
  var clap = new Clap(context);
  var hihat = new HiHat(context);
  //hihat.setup();
  //clap.setup();
  circuitScores = circuits;

  Tone.Transport.bpm.value = tempo;

  circuitScores.push("PH"); //Add a track for the pedaled hat.

  for(circuit=0; circuit<=circuitScores.length; circuit++){
    Score[circuitScores[circuit]]=[];
  }


  for(i=1; i<=seq.pattern_length; i++){

    for (var key in seq){

      if(key.length == 2){
        if(key == "CH"){
          if(seq[key][i]==1 && seq["OH"][i] == 1){
            Score["PH"].push(sixteenths[i-1]);
          }
          else if(seq[key][i]==1){
            Score[key].push(sixteenths[i-1]);
          }
        }
        else{
          if(seq[key][i]==1){
            Score[key].push(sixteenths[i-1]);
          }
        }
      }
    }
  }

  Tone.Note.route('BD', function(time){
    kick.trigger(time);
  });

  Tone.Note.route('OH', function(time){
    hihat.trigger(time, 'open');
  });

  Tone.Note.route('CH', function(time){
    hihat.trigger(time,'closed');
  });

  Tone.Note.route('PH', function(time){
    hihat.trigger(time, 'pedaled');
  });

  Tone.Note.route("CP", function(time){
    clap.trigger(time);
  });

  Tone.Note.parseScore(Score);
  Tone.Transport.loop = true;
  Tone.Transport.start();
};


