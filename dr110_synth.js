function Kick(context) {
  this.context = context;
}

Kick.prototype.setup = function() {
  this.osc = this.context.createOscillator();
  this.gain = this.context.createGain();
  this.osc.connect(this.gain);
  this.gain.connect(this.context.destination);
};

Kick.prototype.trigger = function(time) {
  // this.setup();

  // this.osc.frequency.setValueAtTime(150, time);
  // this.gain.gain.setValueAtTime(1, time);

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
  ]

var Score = {};

var sequence_to_tone = function(seq) {
  var kick  = new Kick(context);
  Tone.Transport.bpm.value = tempo;

  Score.Kick = [];
  for(i=1; i<=seq.pattern_length; i++){
    if(seq.BD[i]==1){
     Score.Kick.push(sixteenths[i-1]);
    }
  }

  Tone.Note.route("Kick", function(time){
    kick.trigger(time);
  });

  Tone.Note.parseScore(Score);
  Tone.Transport.loop = true;
  Tone.Transport.start();
};


