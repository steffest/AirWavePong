var canvas;
var ctx;
var isPlaying = false;
var playStepInterval;
var step = -1;
var stepDistance = 20;

var drawcolor = "rgb(255,0,0)";
var snapCheck;


$(document).ready(function(){
    // set up some sample squares
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fillRect(0, 0, 20, 50);
    ctx.fillStyle = "rgb(0,0,255)";
    ctx.fillRect(55, 0, 20, 50);

    $(canvas).mousemove(function(e) {
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        var coord = "x=" + x + ", y=" + y;
        var c = this.getContext('2d');
        var p = c.getImageData(x, y, 1, 1).data;

        var r = p[0];
        var g = p[1];
        var b = p[2];



        var hex = "#" + ("000000" + rgbToHex(r,g,b)).slice(-6);
        $('#status').html(coord + "<br>" + hex + " - " + p[0]);
    });

    $(canvas).mousedown(function(e){
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;

        var drawOffset = 10;

        if (snapCheck.checked){
            x = (Math.floor(x/stepDistance) * stepDistance);
            y = (Math.floor(y/stepDistance) * stepDistance);
            drawOffset = 0;
        }

        ctx.fillStyle = drawcolor;
        ctx.fillRect(x-drawOffset, y-drawOffset, 20, 20);

    });

    samples.push(new createSample("_samples/KIK_1.wav"));
    samples.push(new createSample("_samples/HAT_1.wav"));

    $(".color").on("click",function(){
        $(".color").removeClass("active");
        $(this).addClass("active");
        drawcolor = this.style.backgroundColor;
    });

    snapCheck = document.getElementById("snapgrid");

    var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);


    var canvas_options_form = document.getElementById('canvas-options');
    var canvas_filename = document.getElementById('canvas-filename');

    canvas_options_form.addEventListener("submit", function(event) {
        event.preventDefault();
        canvas.toBlob(function(blob) {
            saveAs(
                blob
                , (canvas_filename.value || canvas_filename.placeholder) + ".png"
            );
        }, "image/png");
    }, false);

});

function playPause() {
    console.error("playpause");
    isPlaying = !isPlaying;

    if (isPlaying){
        play()
    } else{
        stop();
    }
}

function tick(){

    if (!isPlaying) return;

    step++;
    if (step>=16) step = 0;

    var x = (step * stepDistance) + 4;
    var y = 20;

    $("#playbar").css({left: x + "px"});

    // get color
    var p = ctx.getImageData(x, y, 1, 1).data;

    var r = p[0];
    var g = p[1];
    var b = p[2];

    var hex = "#" + ("000000" + rgbToHex(r,g,b)).slice(-6);

    // get sample
    var sample = 0;
    if ((r>200) && (g+b)<50) sample=1;
    if ((b>200) && (r+g)<50) sample=2;


    $('#statusbar').html(hex);

    if (sample>0) playSample(sample-1);

    setTimeout(tick,200);
}

function play(){
   isPlaying = true;
   tick();
}

function stop(){
    isPlaying = false;
}





// canvas

function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
            //canvas.width = img.width;
            //canvas.height = img.height;
            ctx.drawImage(img,0,0);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
}

// util

