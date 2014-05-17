var dot;
var isDragging = false;
var isDrawing = false;
var canDrawColor = false;
var canDrawObject = false;

var maininterval;
var pollinterval;
var pollCounter = 0;

var currentX, currentY;
var xco = [];
var yco = [];

var xSpeed = 0;
var ySpeed = 0;

var xDot = 0;
var yDot = 0;

var drawX = 0;
var drawY = 0;

var canvas;
var ctx;

var w;
var h;

var t;
var t2;

var env;
var rev;
var osc;
var count = 1;

var drawColor;
var drawObject;

$(document).ready(function(){

    var w = 600;
    var h = 320;

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    var arr = [];

    arr.push('source-atop');
    arr.push('source-in');
    arr.push('source-out');
    arr.push('source-over');
    arr.push('destination-atop');
    arr.push('destination-in');
    arr.push('destination-out');
    arr.push('destination-over');
    arr.push('lighter');
    arr.push('darker');
    arr.push('xor');
    arr.push('copy');

    //ctx.globalCompositeOperation = 'source-atop';


    canvas.width = w;
    canvas.height = h;


    ctx.globalCompositeOperation = 'eer';


    var dot = $("#dot");

    dot.get(0).onmousedown = function(event){
        if (maininterval) maininterval.stop();
        clearInterval(pollinterval);
        console.log("start drag");
        isDragging = true;

        currentX = event.clientX -10;
        currentY = event.clientY -10;

        pollinterval = setInterval(function(){
            xco.push(currentX);
            yco.push(currentY);
            pollCounter++;

            if (pollCounter>10){
                xco.pop();
                yco.pop();
            }
        },50);
    };

    document.onmouseup = function(){

        console.error("up");

        if (isDrawing){
            isDrawing = false;
            clearInterval(pollinterval);
        }

        if (isDragging){
            isDragging = false;
            clearInterval(pollinterval);
            pollCounter = 0;
            var l = xco.length;

            xSpeed = xco[l-1] - xco[l-2];
            ySpeed = yco[l-1] - yco[l-2];

            xDot = currentX + 10;
            yDot = currentY + 10;

            console.log("speed: " + xSpeed + "," + ySpeed);

            maininterval = T("interval", {interval:50}, function(count) {
                //    var f = freqsm[(Math.random() * freqsm.length)|0] * 0.5;
                //    vco.freq.linTo(f, "20ms");
                //    vcf.freq.sinTo(880 * 2, "60ms");



                //pollinterval = setInterval(function(){

                if (xDot < 20) {
                    bump();
                    xSpeed = 0-xSpeed;
                }
                if (yDot < 20) {
                    bump();
                    ySpeed = 0-ySpeed;
                }
                if (xDot > w) {
                    bump();
                    xSpeed = 0-xSpeed;
                }
                if (yDot > h) {
                    bump();
                    ySpeed = 0-ySpeed;
                }

                xDot += xSpeed;
                yDot += ySpeed;

                var p = ctx.getImageData(xDot, yDot, 1, 1).data;

                var r = p[0];
                var g = p[1];
                var b = p[2];

                $("#log").html(g);


                if ((count % 16) == 1){

                    var c = chord();
                    /*
                    t.set({
                        freq: c,
                        beats: (r % 4)
                    });


                    //t2.mul.linTo(1)

                    t2.set({
                        freq: c,
                        beats: (b % 4),
                        mul: 0.0001 * g
                    });
                     */


                }

                //t.set({pitch: r});
                //t2.set({mix: g/250})


                dot.css({left: xDot + "px", top: yDot + "px"});

            }).start();

            xco = [];
            yco = [];

        }
    };

    document.body.onmousemove = function(event){
        if (isDragging){
            var x = event.clientX -10;
            var y = event.clientY -10;

            currentX = x;
            currentY = y;

            dot.css({left: x + "px", top: y + "px"});
        }
    };

    $(canvas).mousedown(function(e){

        if (canDrawColor){
            isDrawing = true;
            var pos = findPos(this);
            drawX = e.pageX - pos.x;
            drawY = e.pageY - pos.y;

            //if (snapCheck.checked){
            //    x = (Math.floor(x/stepDistance) * stepDistance);
            //    y = (Math.floor(y/stepDistance) * stepDistance);
            //    drawOffset = 0;
            //}

            pollinterval = setInterval(function(){
                draw();
            },50);
        }else{
            if (canDrawObject){

            }
        }


    });

    $(canvas).mousemove(function(e) {
        var pos = findPos(this);
        drawX = e.pageX - pos.x;
        drawY = e.pageY - pos.y;
    });

    function draw(){
        if (isDrawing){
            ctx.fillStyle = drawColor;
            var drawOffset = 10;
            ctx.fillRect(drawX-drawOffset, drawY-drawOffset, 20, 20);
        }
    }

    $(".color").on("click",function(){
        $(".color").removeClass("active");
        $(this).addClass("active");
        drawColor = this.style.color;

        if (this.id){
            canDrawColor = false;
            canDrawObject = true;
            drawObject = this.id;
        }else{
            canDrawColor = true;
        }
    });

    var img = new Image();
    img.onload=function(){
        console.error("img load");
        ctx.drawImage(img,0,0);
    };

    img.src = "_assets/tree.jpg";



    //t.play();
    //t2 = T("reverb", {room:0.95, damp:0.1, mix:0.75}, t);
    //t2.play();


    osc = T("sin", {freq:freqs(count), mul:0.5});
    env = T("perc", {a:50, r:500}, osc).bang();
    rev = T("reverb", {room:0.95, damp:0.1, mix:0.2}, env);


    //var freqsm = [220, 493, 523, 277, 587, 659, 349];
    //var vco = T("sin", {freq:T("param"), mul:0.8});
    //var vcf = T("MoogFF", {freq:T("param"), gain:2.1, mul:0.25}, vco).play();

    //T("interval", {interval:500}, function(count) {
    //    var f = freqsm[(Math.random() * freqsm.length)|0] * 0.5;
    //    vco.freq.linTo(f, "20ms");
    //    vcf.freq.sinTo(880 * 2, "60ms");
    //}).start();


    //t = T("cosc", {wave:"sin", freq:440, beats:4, mul:0.4}).play();
    //t2 = T("cosc", {wave:"saw", freq:440, beats:3, mul:0.01}).play();



    //t = T("sin", {freq:220, mul:0.2});
    //t.play();

    // T("*", T("tri", 880, 0.25),T("+sin", 8).kr()).play();

    //T("interval", {interval:interval}, freqs, env).start();



});

var freqs = function(count) {
    return [220, 440, 660, 880][count % 4];
};

var chord = function() {
    var f = [220, 440, 523.25,659.26,493.88];
    var r = Math.floor(Math.random() * f.length);
    return f[r];
};

function bump(){
    count++;
    osc.set({freq:freqs(count)})
    env.bang();
    rev.play()
}