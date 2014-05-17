var dot;
var isDragging = false;

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

var canvas;
var ctx;

var w;
var h;

var t;
var t2;

var env;
var rev;
var rev2;
var osc;
var count = 1;

$(document).ready(function(){

    var w = 600;
    var h = 320;

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = w;
    canvas.height = h;

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

        if (isDragging){

            isDragging = false;
            clearInterval(pollinterval);
            pollCounter = 0;
            var l = xco.length;

            xSpeed = xco[l-1] - xco[l-2];
            ySpeed = yco[l-1] - yco[l-2];

            initPong();

        }
    };

    document.body.onmousemove = function(event){
        if (isDragging){
            var x = event.clientX -10;
            var y = event.clientY -10;



            var offsetX = $(canvas).offset().left;

            dot.css({left: (x) + "px", top: y + "px"});

            currentX = x-offsetX;
            currentY = y;

            xDot = currentX + 10;
            yDot = currentY + 10;

            var p = ctx.getImageData(xDot, yDot, 1, 1).data;

            var r = p[0];
            var g = p[1];
            var b = p[2];
            logColor(r,g,b);

            if (p[3]>0){
                var css = pixelDataToCSS(p);
                $("body").css({"background-color" : css});
            }

        }
    };


    var img = new Image();
    img.onload=function(){
        console.error("img load");
        ctx.drawImage(img,0,0,img.width,img.height,0,0,w,h);
    };

    img.src = "../_assets/rainbow2.jpg";


    //t.play();
    //t2 = T("reverb", {room:0.95, damp:0.1, mix:0.75}, t);
    //t2.play();


    osc = T("sin", {freq:freqs(count), mul:0.5});
    env = T("perc", {a:50, r:500}, osc).bang();
    rev = T("reverb", {room:0.95, damp:0.1, mix:0.2}, env);

/*
    var freqsm = [220, 493, 523, 277, 587, 659, 349];
    var vco = T("sin", {freq:T("param"), mul:0.8});
    var vcf = T("MoogFF", {freq:T("param"), gain:2.1, mul:0.25}, vco).play();

    T("interval", {interval:500}, function(count) {
        var f = freqsm[(Math.random() * freqsm.length)|0] * 0.5;
        vco.freq.linTo(f, "20ms");
        vcf.freq.sinTo(880 * 2, "60ms");
    }).start();
*/

    //t = T("cosc", {wave:"sin", freq:440, beats:4, mul:0.4}).play();
    //t2 = T("cosc", {wave:"saw", freq:440, beats:3, mul:0.01}).play();



    t = T("sin", {freq:220, mul:0.2});
    rev2 = T("reverb", {room:0.95, damp:0.1, mix:0.2}, t);
    rev2.play();

    //t.play();

    // T("*", T("tri", 880, 0.25),T("+sin", 8).kr()).play();

    //T("interval", {interval:interval}, freqs, env).start();


    var initPong = function(){
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

            if (p[3]>0){
                var css = pixelDataToCSS(p);
                $("body").css({"background-color" : css});
            }

            logColor(r,g,b);

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
            t.set({freq: r*2})


            var offsetX = $(canvas).offset().left;

            dot.css({left: (offsetX+xDot) + "px", top: yDot + "px"});

        }).start();

        xco = [];
        yco = [];
    }


    // initial values
    currentX = 50;
    currentY = 50;
    xSpeed = 12;
    ySpeed = 8;
    initPong();

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
    osc.set({freq:freqs(count)});
    env.bang();
    rev.play();
}

function stop(){

    maininterval.stop();
}

function logColor(r,g,b){
    $("#log").html("Red: " + r + " Green: " + g + " Blue: " + b);
}