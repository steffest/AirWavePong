
var Jazz = {};

// one octave whole notes
var midiNotes = [0,2,4,5,7,9,11,12];
var midiOctave = 4;

function initMidi(){
    var container = $("#midipanel");

    var html = '<object id="Jazz1" classid="CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90" class="hidden"><object id="Jazz2" type="audio/x-jazz" class="hidden"><p style="visibility:visible;">This page requires <a href=http://jazz-soft.net>Jazz-Plugin</a> ...</p></object></object>';
    html += "<div>MIDI Out: <select id=selectmidi onchange='changemidi();'></select></div>"

    container.html(html);

    setTimeout(function(){
        Jazz = document.getElementById("Jazz1");
        if(!Jazz || !Jazz.isJazz) Jazz = document.getElementById("Jazz2");

        if(Jazz.isJazz){

            Jazz.MidiOut(0x80,0,0);
            Jazz.lastNote = 0;

            var select=document.getElementById('selectmidi');

            try{
                var list=Jazz.MidiOutList();
                for(var i in list){
                    select[i]=new Option(list[i],list[i],i==0,i==0);
                }
            }
            catch(err){}

            select.onchange = function(){
                Jazz.MidiOutOpen(this.options[this.selectedIndex].value);
            }
            console.log("midi out initialized");
        }
    },500);
}

function posToMidiNote(pos){
    //return 58;
    var id = 0;
    if (useMidi){
        if (pos<512){
            var index = Math.floor((pos/512)*8);
            id = midiNotes[index] + (midiOctave * 12);
        }
    }else{
        // calculate frequency for webaudio
        // calculate: seems a bit off -> use table
        /*
         var octrange = 3;
         var note=pos/512*12*octrange;
         var freq=32.70319566257483*Math.pow(2,id/12);
         */
        if (pos<512){
            var index = Math.floor((pos/512)*8);
            var freq = noteArray[index];
            id = freq;
        }
    }
    return id;
}

function playNote(id){
    if (id>0){
        if(Jazz.isJazz){
            if (Jazz.lastNote != id ) Jazz.MidiOut(0x90,id,0x2f);
            Jazz.lastNote = id;
        }else{
            // fall back to webaudio
            oscillator.frequency.value = id;
            masterVolume.gain.value = 0.02;
        }
    }

}

function stopNote(id){
    if(Jazz.isJazz){
        id = id || Jazz.lastNote;
        Jazz.MidiOut(0x80,id,0);
        Jazz.lastNote = 0;
    }else{
        masterVolume.gain.value = 0;
    }
}

