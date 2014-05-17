var audioElements = [];
var sliderElements = [];
var sliders;
var isPlaying;


var preset = [
    {url : "ohyeah.mp3", volume: 0.0},
    {url : "drone2.mp3", volume: 0.2},
    {url : "electricity.mp3", volume: 0.0}
];

var imageUrl = "../_assets/redlips.jpg";
var heathMapUrl = "../_assets/redlips_heath.jpg";
var w = 400;
var h = 540;

$(document).ready(function(){

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext('2d');

    var heathmap = document.getElementById("heathmap");
    var ctx_heathmap = heathmap.getContext('2d');

    canvas.width = w;
    canvas.height = h;

    heathmap.width = w;
    heathmap.height = h;

    sliders = document.getElementById("sliders");

    var img = new Image();
    img.onload=function(){
        ctx.drawImage(img,0,0,w,h);
    };
    img.src = imageUrl;

    var img_heathmap = new Image();
    img_heathmap.onload=function(){
        ctx_heathmap.drawImage(img_heathmap,0,0,w,h);
    };
    img_heathmap.src = heathMapUrl;


    heathmap.onmousemove = function(e){
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;

        var pixelData = ctx_heathmap.getImageData(x, y, 1, 1).data;

        var color = pixelData;
        var css = pixelDataToCSS(pixelData);

        $("body").css({"background-color" : css});
        setVolumeToColor(color,"saturation");

    };


    initAudio();
});


function initAudio(){
    for (var i = 0; i<preset.length; i++){
        var audio = preset[i];
        addAudio(audio.url,audio.volume);
    }
    isPlaying = true;
}

function addAudio(url,volume){
    console.log("adding "  + url);
    console.log("adding "  + url);

    var a = new Audio("../_samples/" + url);

    a.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
    //}
    a.volume = volume;
    a.play();
    audioElements.push(a);

    var label = document.createElement("label");
    label.innerHTML = url;

    var input = document.createElement("input");
    input.type = "range";
    input.min = 0;
    input.max = 100;
    input.value = volume * 100;
    input.onchange = function(){setVolume(this,a)};

    var div = document.createElement("div");
    div.appendChild(label);
    div.appendChild(input);

    sliderElements.push(input);
    sliders.appendChild(div);

}

function setVolumeToColor(color,mapping){
    if (mapping == "rgb"){
        // simple RGB mapping
        console.error(color);
        for (var i = 0; i<3; i++){
            var r = color[i];
            var audio = audioElements[i];
            var slider = sliderElements[i];
            audio.volume = (r/255);
            slider.value = audio.volume*100;
        }
    }

    if (mapping == "saturation"){

        var r = Math.max(color[0] - (color[1] + color[2])/2,0);
        var g = Math.max(color[1] - (color[0] + color[2])/2,0);
        var b = Math.max(color[2] - (color[0] + color[1])/2,0);

        r = r + ((r-100) * 3);
        r = Math.max(0,r);
        r = Math.min(255,r);

        b = b + ((b-80) * 3);
        b = Math.max(0,b);
        b = Math.min(255,b);

        if ((b+r) == 0){
            g = 30;
        }else{
            g = 10;
        }



        var data = [r,g,b];
        logColor(r,g,b)

        for (var i = 0; i<3; i++){
            var v = data[i];
            var audio = audioElements[i];
            var slider = sliderElements[i];
            audio.volume = (v/255);
            slider.value = audio.volume*100;
        }
    }

}

function setVolume(elm,a){
    a.volume = elm.value / 100;
}

function stop(){
    for (var i = 0; i< audioElements.length; i++){
        var audio = audioElements[i];
        if (isPlaying){
            audio.pause();
        }else{
            audio.play();
        }
    }
    isPlaying = !isPlaying;
}

function toggleHeathMap(){
    $("#heathmap").toggleClass("visible")
}

function logColor(r,g,b){
    $("#log").html("Red: " + r + " Green: " + g + " Blue: " + b);
}


