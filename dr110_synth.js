/*
hihat = new HiHat(context); hihat.setup(context); hihat.shortToGround(context);
*/

/*
import/export scratch
exportSeq = btoa(JSON.stringify(sequences)) // Export sequences
importSeq = atob(JSON.parse(sj)) ; // Import into sequences

var a = document.body.appendChild(
            document.createElement("a")
    );
    a.download = "export.txt";
    a.href = "data:text/plain;base64," + exportSeq;

exportSeq = JSON.stringify(sequences) // Export sequences
importSeq = JSON.parse(sj) ; // Import into sequences
*/

hh1 = [880, 1160, 3280, 2250]; //Cymbal frequencies?
hh2 = [870, 1220, 3150, 2150];
hh3 = [465, 317, 820, 1150];

// 1150hz + 820hz = hihat?
// 465hz = cy ping?
// 317hz = cy body?

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
8 900ms   6v    (CY) Metal tail
9 1.4s    2.7v  (CY) Noise Tail
11 140ms   5v   (HC)
12 700ms   5v   (HC)
13 100ms   5.7v (SD)
14 120ms   5.7v (AC)

Handclap Retrigger Time:
10 10ms x3
*/

// Based on values from schemes, needs to be compared to samples
var context = new AudioContext();

var clapTriggerTime = 0.01;
var snareDecay = 0.1;
var kickDecay = 0.5; // 0.1?
var mute = 0.00001;

whiteNoise = function() {
  var bufferSize = this.context.sampleRate;
  var sample = this.context.createBuffer(1, bufferSize, bufferSize);
  var output = sample.getChannelData(0);

  for (var i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  return sample;
};

HiHat = function(context) {
  this.context = context;
};

HiHat.prototype.setup = function(){
  /* Initialize gain stages - controllable amplifiers (CA) */
  this.noiseAmp = this.context.createGain();
  this.oscillatorSubmix = this.context.createGain();
  this.lfoAmount = this.context.createGain();
  this.amp = this.context.createGain();

  this.noise = this.context.createBufferSource();   // Allocate sample space,
  this.noise.buffer = whiteNoise();                 // sample some noise,
  this.noise.loop = true;                           // loop the noise sample,
  this.noise.connect(this.noiseAmp);                // and route the audio to CA
  this.noiseAmp.gain.value = 1;                     // and turn CA level up.
  this.noise.start();

  /* Generate four oscillators, mix them together, set combined volume */
  this.osc = [];
  for(o=0;o<=1;o++){
    this.osc[o] = this.context.createOscillator();
    this.osc[o].type = 'square';
    this.osc[o].frequency.value = hh3[o];
    this.osc[o].connect(this.oscillatorSubmix);
    this.osc[o].start();
  }
  this.oscillatorSubmix.gain.value = 1;

  /* Filter configuration */
  this.hiPass = this.context.createBiquadFilter();
  this.hiPass.type = 'highpass';
  this.hiPass.frequency.value = 7500;
  this.hiPass.gain.value = 2;
  this.hiPass.Q.value = 8;

  /* A free-running LFO modulates sound independent of tempo */
  this.lfo = this.context.createOscillator();
  this.lfo.type = 'triangle';
  this.lfo.frequency.value = 4 ;
  this.lfoAmount.gain.value = 300;

  this.lfo.connect(this.lfoAmount);
  this.lfoAmount.connect(this.hiPass.frequency);
  this.lfo.start();

  /* Pass the noise and the oscillators into the filter */
  this.noiseAmp.connect(this.amp);
  this.oscillatorSubmix.connect(this.amp);
  this.amp.connect(this.hiPass);

  /* Connect the output of the filter to the speakers */
  this.hiPass.connect(this.context.destination);

  this.amp.gain.value = mute;
  return "hihat";
};

HiHat.prototype.shortToGround = function(){
  this.amp.gain.value = 0.2;
};

HiHat.prototype.trigger = function(time, type){
  switch(type){
    case 'OpenHihat':
      this.duration = 1.7;
    break;
    case 'ClosedHihat':
      this.duration = 0.3;
    break;
    case 'PedalHat':
      this.duration = 0.2;
    break;
  }

  this.amp.gain.setValueAtTime(0.5, time);
  this.amp.gain.exponentialRampToValueAtTime(mute, time + this.duration);
};

Cymbal = function(context){
  this.context = context;
};

Cymbal.prototype.setup = function(){
this.duration = 1.5;

  this.noiseAmp = this.context.createGain();
  this.pingSubmix = this.context.createGain();
  this.bodySubmix = this.context.createGain();
  this.bellSubmix = this.context.createGain();
  this.lfoAmount = this.context.createGain();
  this.amp = this.context.createGain();

  this.noise = this.context.createBufferSource();   // Allocate sample space,
  this.noise.buffer = whiteNoise();                 // sample some noise,
  this.noise.loop = true;                           // loop the noise sample,
  this.noise.connect(this.noiseAmp);                // and route the audio to CA
  this.noiseAmp.gain.value = 1;                     // and turn CA level up.
  this.noise.start();

  this.osc = [];
  for(o=0;o<=3;o++){
    this.osc[o] = this.context.createOscillator();
    this.osc[o].type = 'square';
    this.osc[o].frequency.value = hh3[o];
    //this.osc[o].connect(this.oscillatorSubmix);
    this.osc[o].start();
  }

  this.osc[2].connect(this.bellSubmix);
  this.osc[3].connect(this.bellSubmix);

  this.osc[0].connect(this.pingSubmix);

  this.osc[1].connect(this.bodySubmix);

  this.pingSubmix.gain.value = 1;
  this.bodySubmix.gain.value = 1;
  this.bellSubmix.gain.value = 1;

  /* Filter configuration */
  this.hiPass = this.context.createBiquadFilter();
  this.hiPass.type = 'highpass';
  this.hiPass.frequency.value = 7500;
  this.hiPass.gain.value = 2;
  this.hiPass.Q.value = 8;

  /* A free-running LFO modulates sound independent of tempo */
  this.lfo = this.context.createOscillator();
  this.lfo.type = 'triangle';
  this.lfo.frequency.value = 4 ;
  this.lfoAmount.gain.value = 300;

  this.lfo.connect(this.lfoAmount);
  this.lfoAmount.connect(this.hiPass.frequency);
  this.lfo.start();

  /* Pass the noise and the oscillators into the filter */
  this.noiseAmp.connect(this.amp);
  this.pingSubmix.connect(this.amp);
  this.bellSubmix.connect(this.amp);
  this.bodySubmix.connect(this.amp);
  this.amp.connect(this.hiPass);

  /* Connect the output of the filter to the speakers */
  this.hiPass.connect(this.context.destination);

  this.amp.gain.value = mute;
  return "cymbal";

};

Cymbal.prototype.shortToGround = function(){
  this.amp.gain.value = 0.2;
};

Cymbal.prototype.trigger = function(time) {
  this.amp.gain.setValueAtTime(0.5, time);
  this.pingSubmix.gain.setValueAtTime(0.5,time);
  this.bellSubmix.gain.setValueAtTime(1,time);
  this.bodySubmix.gain.setValueAtTime(1,time);

  this.amp.gain.exponentialRampToValueAtTime(mute, time + 3);
  //this.pingSubmix.gain.exponentialRampToValueAtTime(mute, time + 6);
   this.bellSubmix.gain.exponentialRampToValueAtTime(mute, time + 1.5);
  // this.bodySubmix.gain.exponentialRampToValueAtTime(mute, time + 2);

};

Clap = function(context){
  this.context = context;
};

Clap.prototype.setup = function() {
  // White noise through a modulated bandpass filter
  this.noiseAmp = this.context.createGain();
  this.lfoAmount = this.context.createGain();
  this.amp = this.context.createGain();

  this.noise = this.context.createBufferSource();
  this.noise.buffer = whiteNoise();
  this.noise.loop = true;
  this.noise.connect(this.noiseAmp);
  this.noiseAmp.gain.value = 3;
  this.noise.connect(this.noiseAmp);
  this.noise.start();

  this.bandPass = this.context.createBiquadFilter();
  this.bandPass.type = 'bandpass';
  this.bandPass.frequency.value = 1000;
  this.bandPass.gain.value = 3;
  this.bandPass.Q.value = 4;

  this.lfo = this.context.createOscillator();
  this.lfo.type = 'triangle';
  this.lfo.frequency.value = 3;
  this.lfoAmount.gain.value = 50;

  this.lfo.connect(this.lfoAmount);
  this.lfoAmount.connect(this.bandPass.frequency);
  this.lfo.start();

  this.noiseAmp.connect(this.amp);
  this.amp.connect(this.bandPass);

  this.bandPass.connect(this.context.destination);

  this.amp.gain.value = mute;
  return "handclap";
};

Clap.prototype.shortToGround = function(){
  this.amp.gain.value = 0.2;
};

Clap.prototype.trigger = function(time){

  for(trigger = 0; trigger < 3; trigger++){
    this.amp.gain.setValueAtTime(5, time + (trigger * clapTriggerTime));
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
  var cymbal = new Cymbal(context);

  hihat.setup();
  clap.setup();
  cymbal.setup();

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
    hihat.trigger(time, 'OpenHihat');
  });

  Tone.Note.route('CH', function(time){
    hihat.trigger(time,'ClosedHihat');
  });

  Tone.Note.route('PH', function(time){
    hihat.trigger(time, 'pedaled');
  });

  Tone.Note.route("CP", function(time){
    clap.trigger(time);
  });

  Tone.Note.route("CY", function(time){
    cymbal.trigger(time);
  });

  Tone.Note.parseScore(Score);
  Tone.Transport.loop = true;
  Tone.Transport.start();
};


