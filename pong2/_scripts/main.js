var dot;
var isDragging = false;

var maininterval;
var pollinterval;
var pollCounter = 0;


var isDragging = false;
var isDrawing = false;
var canDrawColor = false;
var drawColor;

var currentX, currentY;
var activeDot = 0;

var xco = [];
var yco = [];

var xSpeed = [0];
var ySpeed = [0];

var xDot = [0];
var yDot = [0];

var dots = [];

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
var captureFrameInterval;

var playChord = false;
var useColor  = false;
var useBars = false;

var WALL = {
 left: {id : 1, sampleIndex: [0],  label: "Left"},
 right: {id : 2, sampleIndex: [2], label: "Right"},
 up: {id : 3, sampleIndex: [4],    label: "Up"},
 down: {id : 4, sampleIndex: [7],  label: "Down"}
};

var sampleUrls=[
    "Bdrum1.mp3",
    "snaredrum1.mp3",
    "snaredrum2.mp3",
    "snaredrum3.mp3",
    "hat1.mp3",
    "hat2.mp3",
    "hat3.mp3",
    "hat4.mp3",
    "hat5.mp3",
    "hat6.mp3",
    "Kik_1.wav"
];

var barBorders = [
    0,80,160,240,320
];


var presets = {
    bars4: {
        dots: [
            {x:30,y:40,speedY:2,speedX:10},
            {x:30,y:120,speedY:2,speedX:10},
            {x:30,y:200,speedY:2,speedX:10},
            {x:30,y:280,speedY:2,speedX:10}
        ]
    },
    square: {
        dots: [
            {x:55,y:60,speedY:-16,speedX:30}
        ]
    },
    beat1: {
        dots: [
            {x:40,y:160,speedY:25,speedX:10,sampleIndex: [4,5,6,7]},
            {x:120,y:160,speedY:25,speedX:10, sampleIndex: [4,5,1,0]},
            {x:200,y:160,speedY:25,speedX:10},
            {x:280,y:160,speedY:25,speedX:10,sampleIndex: [4,5,1,0]},
            {x:360,y:160,speedY:25,speedX:10}
        ]
    },
    beat2: {
        dots: [
            {x:40,y:120,speedY:21,speedX:0,sampleIndex: [4,5,6,7]},
            {x:120,y:200,speedY:21,speedX:0,sampleIndex: [4,5,1,0]},
            {x:200,y:280,speedY:21,speedX:0,sampleIndex: [4,5,1,0]},
            {x:280,y:40,speedY:21,speedX:0},
            {x:360,y:120,speedY:21,speedX:0},
            {x:440,y:120,speedY:21,speedX:0},
            {x:520,y:120,speedY:21,speedX:0,sampleIndex: [6,7,8,9]},
            {x:580,y:40,speedY:21,speedX:0,sampleIndex: [8,8,8,9]}
        ]
    },
    beat3: {
        dots: [
            {x:40,y:300,speedY:25,speedX:0,sampleIndex: [0,0,1,0]},
            {x:140,y:100,speedY:25,speedX:0,sampleIndex: [0,0,5,0]},
            {x:240,y:100,speedY:25,speedX:0,sampleIndex: [0,0,0,9]},
            {x:340,y:100,speedY:25,speedX:0,sampleIndex: [0,0,4,4]},
            {x:440,y:300,speedY:25,speedX:0,sampleIndex: [0,0,4,0]}
        ]
    }
};

function setPreset(preset){
    clearDots();
    for (var i = 0; i<preset.dots.length; i++){
        var newDot = preset.dots[i];
        addDot(newDot.x,newDot.y,newDot.speedX,newDot.speedY,newDot.sampleIndex);
    }
}

function createSelect(wall){

    var div = document.createElement("div");
    var select = document.createElement("select");
    select.id = "sampleIndexSelect" + wall.id;

    select.onchange = function(){
        wall.sampleIndex[activeDot] = this.value;
    };

    for (var i = 0; i< sampleUrls.length; i++){
        var option = document.createElement("option");
        option.setAttribute("value", i);
        option.innerHTML = sampleUrls[i];
        select.appendChild(option);
    }


    div.innerHTML = '<span id="label' + wall.label + '">' + wall.label + "</span>: ";
    div.appendChild(select);

    $("#sampleSelects").append(div);

}

$(document).ready(function(){


    for (var i = 0; i< sampleUrls.length; i++){
        var url = "../_samples/" + sampleUrls[i];
        samples.push(new createSample(url));
    }

    createSelect(WALL.left);
    createSelect(WALL.right);
    createSelect(WALL.up);
    createSelect(WALL.down);


    w = 600;
    h = 320;

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = w;
    canvas.height = h;

    var dot = $("#dot1");
    dots.push(dot);

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

        if (isDrawing){
            isDrawing = false;
            clearInterval(pollinterval);
        }

        if (isDragging){

            isDragging = false;
            clearInterval(pollinterval);
            pollCounter = 0;
            var l = xco.length;

            xSpeed[0] = xco[l-1] - xco[l-2];
            ySpeed[0] = yco[l-1] - yco[l-2];

            initPong();

        }
    };

    document.body.onmousemove = function(event){
        if (isDragging){

            var x = event.clientX -10;
            var y = event.clientY -10;



            var offsetX = $("#dots").offset().left;
            var offsetY = $("#dots").offset().top;

            x = x-offsetX;
            y = y-offsetY;

            dot.css({left: (x) + "px", top: y + "px"});

            currentX = x;
            currentY = y;

            xDot[0] = currentX + 10;
            yDot[0] = currentY + 10;

            var p = ctx.getImageData(xDot[0], yDot[0], 1, 1).data;

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



    $("#dots").mousedown(function(e){


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
        }


    });

    $("#dots").mousemove(function(e) {
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
        xDot[0] = currentX + 10;
        yDot[0] = currentY + 10;

        console.log("speed: " + xSpeed + "," + ySpeed);

        maininterval = T("interval", {interval:50}, function(count) {
            for (var dotCount = 0; dotCount<dots.length; dotCount++){
                var thisDot = dots[dotCount];

                var curXDot = xDot[dotCount];
                var curYDot = yDot[dotCount];

                var minY = 20;
                var maxY = h;

                var minX = 20;
                var maxX = w;

                if (useBars && dotCount<4){
                    console.error(useBars)
                    minY = barBorders[dotCount];
                    maxY = barBorders[dotCount+1];
                }

                var bumpWall = undefined;

                if (curXDot < minX) {
                    bumpWall = WALL.left;
                    xSpeed[dotCount] = 0-xSpeed[dotCount];
                }
                if (curYDot < minY) {
                    bumpWall = WALL.up;
                    ySpeed[dotCount] = 0-ySpeed[dotCount];
                }
                if (curXDot > maxX) {
                    if (useBars){
                        xDot[dotCount] = curXDot-maxX;
                    }else{
                        bumpWall = WALL.right;
                        xSpeed[dotCount] = 0-xSpeed[dotCount];
                    }
                }
                if (curYDot > maxY) {
                    bumpWall = WALL.down;
                    ySpeed[dotCount] = 0-ySpeed[dotCount];
                }

                xDot[dotCount] += xSpeed[dotCount];
                yDot[dotCount] += ySpeed[dotCount];

                var pixelX = Math.max(Math.min(xDot[dotCount],w),0);
                var pixelY = Math.max(Math.min(yDot[dotCount],h),0);

                var p = ctx.getImageData(pixelX, pixelY, 1, 1).data;

                var r = p[0];
                var g = p[1];
                var b = p[2];

                if (dotCount == 0){

                    if (p[3]>0){
                        var css = pixelDataToCSS(p);
                        $("body").css({"background-color" : css});
                    }

                    logColor(r,g,b);


                    if (playChord){
                        t.set({freq: r*2});
                    }else{
                        t.set({freq: 0});
                    }

                }


                var offsetX = -20;
                var offsetY = -20;

                if (thisDot && xDot[dotCount] && yDot[dotCount]){
                    thisDot.css({left: (offsetX+xDot[dotCount]) + "px", top: (offsetY+yDot[dotCount]) + "px"});
                }

                if (bumpWall){
                    bump(bumpWall,dotCount,r,g,b);
                }





            }
        }).start();

        xco = [];
        yco = [];
    }


    // initial values
    currentX = 50;
    currentY = 50;
    xSpeed[0] = 12;
    ySpeed[0] = 8;
    updateDotSelectors();

    $("#dotSelectors").on("click","div",function(){
        activateDot(numeric(this.id))
    })

    $("#presets").on("click","div",function(){
        setPreset(presets[this.id]);
    })

    $("#speedX").on("change",function(){
        xSpeed[activeDot] = parseInt(this.value);
    });

    $("#speedY").on("change",function(){
        ySpeed[activeDot] = parseInt(this.value);
    });

    $("#playChord").on("change",function(){
        playChord = this.checked
    });

    $("#useColor").on("change",function(){
        useColor = this.checked
    });

    $("#useBars").on("change",function(){
        if (!useBars){
            setPreset(presets.bars4);
        }
        useBars = this.checked
    });

    $("#videosource").on("click","div",function(){
        setVideoSource(this.innerHTML);
    });



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


    initPong();
    activateDot(1)

});


var freqs = function(count) {
    return [220, 440, 660, 880][count % 4];
};

var chord = function() {
    var f = [220, 440, 523.25,659.26,493.88];
    var r = Math.floor(Math.random() * f.length);
    return f[r];
};

function bump(wall,dotIndex,r,g,b){


    if (playChord && dots.length==1){
        count++;
        osc.set({freq:freqs(count)});
        env.bang();
        rev.play();
    }

    var sampleIndex = 0;

    if (useColor){

        sampleIndex = WALL.left.sampleIndex[dotIndex];
        if (r>=g && r>=b) sampleIndex = WALL.right.sampleIndex[dotIndex];
        if (b>=r && b>=g) sampleIndex = WALL.up.sampleIndex[dotIndex];

        //console.error(r,g,b,sampleIndex);

        playSample(sampleIndex);

    }else{
        if (wall) sampleIndex = wall.sampleIndex[dotIndex];

        playSample(sampleIndex);
    }

}

function stop(){

    maininterval.stop();
}

function addDot(x,y,speedX,speedY,sampleIndex){



    if (typeof x == "undefined") x = 100;
    if (typeof y == "undefined") y = 100;

    if (typeof speedX == "undefined") speedX = 10;
    if (typeof speedY == "undefined") speedY = 10;

    if (typeof sampleIndex == "undefined") sampleIndex = [0,1,2,3];
    console.error(sampleIndex);

    var index = dots.length + 1;
    var newDot = document.createElement("div");
    newDot.className = "dot";
    newDot.id = "dot" + index;
    $("#dots").append(newDot);

    xSpeed.push(speedX);
    ySpeed.push(speedY);

    xDot.push(x);
    yDot.push(y);

    WALL.left.sampleIndex.push(sampleIndex[0]);
    WALL.right.sampleIndex.push(sampleIndex[1]);
    WALL.up.sampleIndex.push(sampleIndex[2]);
    WALL.down.sampleIndex.push(sampleIndex[3]);

    dots.push($(newDot));
    updateDotSelectors();

}

function removeDot(){
    var index = dots.length;
    $("#dot" + (index+1)).remove();
    dots.pop();
    xSpeed.pop();
    ySpeed.pop();
    xDot.pop();
    yDot.pop();
    WALL.left.sampleIndex.pop();
    WALL.right.sampleIndex.pop();
    WALL.up.sampleIndex.pop();
    WALL.down.sampleIndex.pop();

    if (activeDot>=index) activeDot = index-1;
    updateDotSelectors();
}

function clearDots(){
    for (var i = 0, len = dots.length; i<=len; i++){
        removeDot();
    }
}

function updateDotSelectors(){
    var container = $("#dotSelectors");
    container.empty();
    for (var i = 0; i<dots.length; i++){
        var dotselector = document.createElement("div");
        dotselector.innerHTML = (i+1);
        dotselector.id = "dotSelector" + (i+1);
        container.append(dotselector);
    }

    $("#dotSelector" + (activeDot+1)).addClass("active");

}

function activateDot(id){
    console.log(id);
    $(".dot").removeClass("active");
    $("#dotSelectors").find("div").removeClass("active");
    $("#dot" + id).addClass("active");
    $("#dotSelector" + id).addClass("active");

    activeDot = id-1;

    $("#speedX").val(xSpeed[activeDot]);
    $("#speedY").val(ySpeed[activeDot]);

    $("#sampleIndexSelect1").val(WALL.left.sampleIndex[activeDot]);
    $("#sampleIndexSelect2").val(WALL.right.sampleIndex[activeDot]);
    $("#sampleIndexSelect3").val(WALL.up.sampleIndex[activeDot]);
    $("#sampleIndexSelect4").val(WALL.down.sampleIndex[activeDot]);

}

function logColor(r,g,b){
    $("#log").html("Red: " + r + " Green: " + g + " Blue: " + b);
}

var captureFrame = function(){
    ctx.drawImage(video,0,0,600,320);
    console.error("capture");
};

function setVideoSource(source){

    $("video").remove();
    clearInterval(captureFrameInterval);

    if (source == "vid"){
        var url = "../_assets/BigBuckBunny.mp4";
        playVideo(url,function(){
            captureFrameInterval = setInterval(function(){captureFrame()},50);
        })
    }

    if (source == "cam"){
        initVideo(function(){
            captureFrameInterval = setInterval(function(){captureFrame()},50);
        })
    }
};


