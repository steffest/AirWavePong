var ctx_buffer;
var ctx_output;

var data_buffer=[null,null];
var data_output=null;

var scrdiff=new Array(512*200);

var frame=0;

var trackingColors = [];
var trackingMovement = [];

var colorMatchTresshold = 50;
var horizontalMovementToScale = false;
var trackMovementY = 100;
var useMidi = false;
var showGrid = false;

$(document).ready(function(){
    var x,y;

    ctx_buffer=document.getElementById("buffer").getContext("2d");
    ctx_output=document.getElementById("output").getContext("2d");
    data_output=ctx_output.createImageData(512,300);

    for(y=0;y<300;++y) {
        for(x=0;x<512;++x) {
            scrdiff[y*512+x]=0;
        }
    }

    // set output to black
    for(y=0;y<300;++y) {
        for(x=0;x<512;++x) {
            data_output.data[(y*512+x)*4]=0;
            data_output.data[(y*512+x)*4+1]=0;
            data_output.data[(y*512+x)*4+2]=0;
            data_output.data[(y*512+x)*4+3]=255;
        }
    }

    samples.push(new createSample("../_samples/KIK_1.wav"));
    samples.push(new createSample("../_samples/HAT_1.wav"));

    initVideo(function(){
        setInterval(captureFrame,50);
    });


    $("#buffer").on("click",function(e){
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;

        var pixelData = ctx_buffer.getImageData(x, y, 1, 1).data;
        var hsl = rgbToHsl(pixelData[0],pixelData[1],pixelData[2]);
        trackingColors.push({
            color: pixelData,
            hsl: hsl
        });

        var elm = document.createElement("div");
        elm.className = "trackingcolor";
        elm.style.backgroundColor = pixelDataToCSS(pixelData);

        $("#trackingColorBar").append(elm);
        $("#buffer").hide();

    });

    $("#colormatchtresshold").on("change",function(){
        colorMatchTresshold = 100-this.value;
    });

    $("#trackMovementY").on("change",function(){
        trackMovementY = this.value;
    });

    $("#trackmovement").on("change",function(){
        horizontalMovementToScale = this.checked;
    });

    $("#midiOctave").on("change",function(){
        midiOctave = this.value;
    });

    $("#useMidi").on("change",function(){
        useMidi = this.checked;
        if (useMidi){
            initMidi();
        }
    });

    $("#showGrid").on("change",function(){
        showGrid = this.checked;
    });

    createOscillator();

});

function captureFrame(){
    var x,y,offs,offs4,roffs4;
    var oframe=frame^1;

    // draw on buffer and get data;
    ctx_buffer.drawImage(video,0,0,512,300);
    data_buffer[frame]=ctx_buffer.getImageData(0,0,512,300);

    var r,g,b;
    var i,trackingColor;

    for (i=0; i<trackingColors.length; i++){
        trackingColor = trackingColors[i];
        trackingColor.averageX = [];
        trackingColor.averageY = [];
        trackingColor.trace = [];
    }

    trackingMovement.averageX = [];
    trackingMovement.averageY = [];

    // calculate the difference between each frame;
    if(data_buffer[frame] && data_buffer[oframe]) {
        var pixeldata_new=data_buffer[frame].data;
        var pixeldata_old=data_buffer[oframe].data;

        var pixeldata_delta=data_output.data;

        for(y=0;y<300;++y) {

            offs=y*512;
            offs4=offs*4;
            roffs4=(y*512+511)*4;

            for(x=0;x<512;++x) {
                var cr=pixeldata_new[roffs4];
                var cg=pixeldata_new[roffs4+1];
                var cb=pixeldata_new[roffs4+2];

                var diff=Math.min(255,(Math.abs(cr-pixeldata_old[roffs4])+Math.abs(cg-pixeldata_old[roffs4+1])+Math.abs(cb-pixeldata_old[roffs4+2])));
                var v;
                if (!showGrid){
                    v = Math.max(scrdiff[offs]*0.9,diff);
                }else{
                    v = diff;
                }
                scrdiff[offs]=v;

                if (v>100){
                    // medium movement
                    if (horizontalMovementToScale){
                        if (Math.abs(y-trackMovementY) < 10) trackingMovement.averageX.push(x);
                    }

                }

                // track colors
                if (v>200){
                    // lot's of motion on this point;


                    if (trackingColors.length>0){
                        // search for tracking color
                        for (i=0; i<trackingColors.length; i++){

                            trackingColor = trackingColors[i];

                            var hsl1= trackingColor.hsl;
                            var hsl2 = rgbToHsl(cr,cg,cb);

                            // calculate diff -
                            // weighted: color most, saturation less, ignore de luminance ?
                            var h = Math.abs(hsl1[0]-hsl2[0]) * 255;
                            var s = Math.abs(hsl1[1]-hsl2[1]) * 255;
                            var l = Math.abs(hsl1[2]-hsl2[2]) * 255;

                            diff = h + s/2 + l/4;

                            if (diff < colorMatchTresshold){
                                trackingColor.trace.push(diff);
                                trackingColor.averageX.push(x);
                                trackingColor.averageY.push(y);
                            }
                        }
                    }
                }

                r=v;
                g=0;
                b=0;

                pixeldata_delta[offs4]=r;
                pixeldata_delta[offs4+1]=g;
                pixeldata_delta[offs4+2]=b;

                ++offs;
                offs4+=4;
                roffs4-=4;
            }
        }

        ctx_output.putImageData(data_output,0,0);

        if (showGrid){
            var step = 64;
            for (var i = 1; i<8 ; i++){
                drawLine(i*step,0,[0,0,255,0.5]);
            }
        }

        //draw general Movement tracker
        if (horizontalMovementToScale){
            drawLine(0,trackMovementY,[255,255,255,0.5]);

            if (trackingMovement.averageX.length > 1){
                x = Math.round(averageArray(trackingMovement.averageX));
                //y = Math.round(averageArray(trackingMovement.averageY));
                y = trackMovementY;

                if (trackingMovement.fadeCount<2){
                    var note = posToMidiNote(x);
                    console.log("playing note " + note);
                    trackingMovement.playpoint = {x: x, y: y};
                    trackingMovement.playFadeCount = 5;

                    playNote(note);
                }

                trackingMovement.point = {x: x, y: y};
                trackingMovement.fadeCount = 5;

            }

            if (trackingMovement.fadeCount > 0){
                var colorData = [255,255,255,5/trackingMovement.fadeCount];
                var point = trackingMovement.point;

                drawCircle(point.x,point.y,colorData);

                var note = posToMidiNote(x);
                playNote(note);

                if (trackingMovement.playFadeCount>0){
                    point = trackingMovement.playpoint;
                    drawDrop(point.x,point.y,trackingMovement.playFadeCount);
                }

                trackingMovement.playFadeCount--;
                trackingMovement.fadeCount--;
            }else{
                stopNote();
            }
        }



        // draw tracked Colors
        for (i=0; i<trackingColors.length; i++){
            trackingColor = trackingColors[i];
            //console.log(trackingColor.trace);
            if (trackingColor.averageX.length > 2){
                x = Math.round(averageArray(trackingColor.averageX));
                y = Math.round(averageArray(trackingColor.averageY));

                if (trackingColor.fadeCount<2){

                    if (samples.length>i){
                        console.log("playing sample");
                        trackingColor.playpoint = {x: x, y: y};
                        trackingColor.playFadeCount = 5;
                        playSample(i);
                    }else{
                        console.log("no sample for this color");
                    }
                }

                trackingColor.point = {x: x, y: y};
                trackingColor.fadeCount = 5;
            }

            if (trackingColor && trackingColor.fadeCount > 0){
                var colorData = trackingColor.color;
                colorData[3] = 5/trackingColor.fadeCount;
                var point = trackingColor.point;
                drawCircle(point.x,point.y,colorData);

                if (trackingColor.playFadeCount>0){
                    point = trackingColor.playpoint;
                    drawDrop(point.x,point.y,trackingColor.playFadeCount);
                }

                trackingColor.playFadeCount--;
                trackingColor.fadeCount--;
            }
        }

    }

    (frame==0) ? frame=1 : frame=0;

}

function drawCircle(x,y,color){
    ctx_output.fillStyle=pixelDataToCSS(color);
    ctx_output.beginPath();
    ctx_output.arc(x, y, 10, 0, Math.PI*2);
    ctx_output.closePath();
    ctx_output.fill();

}

function drawLine(x,y,color){
    ctx_output.strokeStyle=pixelDataToCSS(color);
    ctx_output.lineWidth = 1;
    ctx_output.beginPath();
    if (x==0){
        ctx_output.moveTo(0,y);
        ctx_output.lineTo(512,y);
    }
    if (y==0){
        ctx_output.moveTo(x,0);
        ctx_output.lineTo(x,300);
    }
    ctx_output.closePath();
    ctx_output.stroke();

}

function drawDrop(x,y,step){
    if (step>0){
        var radius = 10 + (50/step);
        ctx_output.strokeStyle="rgba(255,255,255," + step/5 + ")";
        ctx_output.lineWidth = 2;
        ctx_output.beginPath();
        ctx_output.arc(x, y, radius, 0, Math.PI*2);
        ctx_output.closePath();
        ctx_output.stroke();
    }
}

function drop(){
    var step = 5;
    var x = 150;
    var y = 150;


    drawDrop(x,y,5);
    setTimeout(function(){drawDrop(x,y,4)},50);
    setTimeout(function(){drawDrop(x,y,3)},100);
    setTimeout(function(){drawDrop(x,y,2)},150);
    setTimeout(function(){drawDrop(x,y,1)},200);
    setTimeout(function(){drawDrop(x,y,0)},250);
}

function addColor(){
    $("#buffer").show();
}