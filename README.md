BossDR110
=========

An HTML5 &amp; Javascript emulation of Roland's final analog drum machine

Feb 20, 2011
This simulation of a Boss DR-110 drum machine was borne out of the discussion 
on the internet about whether or not you can do everything in HTML5 that you 
can do in Flash. Most of the arguments I saw for HTML5 ignored things such as 
RTMP and Flash's audio capabilities. I felt that particularly in the area of 
audio (let alone audio processing), HTML5 and javascript were severely lacking, 
even compared to what I could do in Flash many years ago. Having not programmed 
anything audio related in Javascript, however, I didn't feel as though I could 
qualify my qualms. To that end, I began to build on an idea I'd had about a 
decade ago but never had the drive to follow-through on - emulate the 
functionality of the last analog drum machine that Roland/Boss produced. It 
seemed pretty simple, mostly becuase none of the sounds on the DR-110 were 
adjustable. It's a sequencer, doesn't even have MIDI, and only has a half dozen 
of (mostly) static sounds.

So during occasional evenings, and one or two Saturdays, I set about recreating 
a Boss DR-110. I'd searched online for other javascript-driven drum machines, 
but everything I came across was (understandably) clunky and rough. There are 
already so many fantastic tools for creating beats that go well beyond what I 
felt was capable within the browser, and you learn very quickly when making 
something like this that timing - something incredibly important to a beatbox - 
is shaky at best in contemporary browsers. There's also the issue of providing 
audio in codecs each browser supports - and with mobile platforms, good luck 
getting audio playback working at all. 

From the start, my intention was to post it publicly, which is part of why it 
took so long -- I hope that my javascript isn't total crap. Knowing that I'd
be posting this to the likes of HN and Reddit has (hopefully) kept me on my 
toes with respect to the code. That said, I encourage you to take this code 
and push it further - make it more portable, clean it up, make something bigger
and better with what you see here. Maybe move the knobs and the display into a
canvas, if you're really into that kind of thing.

Note: Song mode and the balance knob have not been implemented yet.
--Matt Dunphy
bitrotten.com
