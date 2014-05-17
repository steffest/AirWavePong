// audio

var samples = [];

function createSample(sampleUrl){
    var sample = {};

    sample.index = 0;
    sample.instances = [];

    // 8 isntances for each sample so the can play simultaneously
    for (var i=0; i<8;i++){
        sample.instances.push( new createAudioElm(sampleUrl));
    }

    return sample;
}

function createAudioElm(sampleUrl) {

    var audio = document.createElement('audio');

    audio.src        = sampleUrl;
    audio.volume     = 1;
    audio.preload    = "auto";
    audio.autobuffer = "autobuffer";

    return audio;
}

function playSample(index) {

    var sample = samples[index];
    var sampleInstance = sample.instances[sample.index];
    sample.index++;
    if (sample.index>=8) sample.index=0;

    if (!sampleInstance.paused) sampleInstance.currentTime = 0;

    sampleInstance.play();

}

function playSampleWithVolume(index,volume) {

    var sample = samples[index];
    var sampleInstance = sample.instances[sample.index];
    sample.index++;
    if (sample.index>=8) sample.index=0;

    if (!sampleInstance.paused) sampleInstance.currentTime = 0;
    sampleInstance.volume = volume;
    sampleInstance.play();

}
