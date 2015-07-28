

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
7 60ms    6v    (CY)
8 900ms   6v    (CY)
9 1.4s    2.7v  (CY)
11 140ms   5v   (HC)
12 700ms   5v   (HC)
13 100ms   5.7v (SD)
14 120ms   5.7v (AC)

Handclap Retrigger Time:
10 10ms x3
*/
var clapTriggerTime = 0.01;
var clapLength = 0.7;
var lineNoise = 0.001;

noiseBuffer = function() {
  var bufferSize = this.context.sampleRate;
  var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
  var output = buffer.getChannelData(0);

  for (var i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  return buffer;
};

function Clap(context) {
  this.context = context;
}

Clap.prototype.setup = function() {
  this.noise = this.context.createBufferSource(); // Init sample
  this.noise.buffer = noiseBuffer();              // Sample noise
  this.amp = this.context.createGain();
  this.noise.connect(this.amp);

  // var noiseFilter = this.context.createBiquadFilter();
  // noiseFilter.type = 'highpass';
  // noiseFilter.frequency.value = 1000;
  // this.noise.connect(noiseFilter);
  // noiseFilter.connect(this.noiseEnvelope);
  // ...then modulate the filter frequency
  // with a free-running LFO.

  this.amp.connect(this.context.destination);

};

Clap.prototype.trigger = function(time){
  this.setup();

  for(trigger = 0; trigger < 3; trigger++){
    this.amp.gain.setValueAtTime(1, time + (trigger * clapTriggerTime));
    this.amp.gain.exponentialRampToValueAtTime(
      lineNoise,
      time + ((trigger + 1) * clapTriggerTime)
      );
  }

  this.amp.gain.setValueAtTime(1, time + (3*clapTriggerTime));
  this.amp.gain.exponentialRampToValueAtTime(lineNoise, time + 0.68);

  this.noise.start(time);
  this.noise.stop(time + clapLength);
  console.log(clapLength);
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
  // this.setup();

  // this.osc.frequency.setValueAtTime(150, time);  // Set osc freq
  // this.gain.gain.setValueAtTime(1, time);        // Set osc volume

  // this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
  // this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

  // this.osc.start(time);

  // this.osc.stop(time + 0.5);
  var audio = new Audio();
  audio.src = './audio/BassDrum.wav';
  audio.volume = 0.8;//(withAccent) ? volume + accent : volume;
  audio.play();
};

var context = new AudioContext();

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
  Tone.Transport.bpm.value = tempo;

  for(circuit=0; circuit<=circuits.length; circuit++){
    Score[circuits[circuit]]=[];
  }
  Score["PH"] = [];

  for(i=1; i<=seq.pattern_length; i++){
    if(seq.BD[i]==1){
     Score.BD.push(sixteenths[i-1]);
    }
    if(seq.SD[i]==1){
     Score.SD.push(sixteenths[i-1]);
    }
    if(seq.CH[i]==1){
      if(seq.OH[i]==1){                 // Pedal the hat
        Score.PH.push(sixteenths[i-1]);
      }
      else{
        Score.CH.push(sixteenths[i-1]);
      }
    }
    if(seq.OH[i]==1 && seq.CH[i]===0){  //Only open if not also closed.
     Score.OH.push(sixteenths[i-1]);
    }
    if(seq.HC[i]==1){
     Score.HC.push(sixteenths[i-1]);
    }
    if(seq.CY[i]==1){
     Score.CY.push(sixteenths[i-1]);
    }
    if(seq.BD[i]==1){
     Score.BD.push(sixteenths[i-1]);
    }
  }


  Tone.Note.route("BD", function(time){
    kick.trigger(time);
  });

  Tone.Note.route("HC", function(time){
    clap.trigger(time);
  });

  Tone.Note.parseScore(Score);
  Tone.Transport.loop = true;
  Tone.Transport.start();
};


