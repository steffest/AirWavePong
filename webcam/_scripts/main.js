var ctx_buffer;
var ctx_output;

var data_buffer=[null,null];
var data_output=null;

var scrdiff=new Array(512*200);

var frame=0;

$(document).ready(function(){
    var x,y;

    ctx_buffer=document.getElementById("buffer").getContext("2d");
    ctx_output=document.getElementById("output").getContext("2d");
    data_output=ctx_output.createImageData(512,200);

    for(y=0;y<200;++y) {
        for(x=0;x<512;++x) {
            scrdiff[y*512+x]=0;
        }
    }

    // set output to black
    for(y=0;y<200;++y) {
        for(x=0;x<512;++x) {
            data_output.data[(y*512+x)*4]=0;
            data_output.data[(y*512+x)*4+1]=0;
            data_output.data[(y*512+x)*4+2]=0;
            data_output.data[(y*512+x)*4+3]=255;
        }
    }

    initVideo(function(){
        setInterval(captureFrame,50);
    })
});

function captureFrame(){
    var x,y,offs,offs4,roffs4;
    var oframe=frame^1;

    // draw on buffer and get data;
    ctx_buffer.drawImage(video,0,0,512,200);
    data_buffer[frame]=ctx_buffer.getImageData(0,0,512,200);

    var r,g,b;

    // calculate the difference between each frame;
    if(data_buffer[frame] && data_buffer[oframe]) {
        var pixeldata_new=data_buffer[frame].data;
        var pixeldata_old=data_buffer[oframe].data;

        var dpix=data_output.data;

        for(y=0;y<200;++y) {

            offs=y*512;
            offs4=offs*4;
            roffs4=(y*512+511)*4;

            for(x=0;x<512;++x) {
                var cr=pixeldata_new[roffs4];
                var cg=pixeldata_new[roffs4+1];
                var cb=pixeldata_new[roffs4+2];

                var diff=Math.min(255,(Math.abs(cr-pixeldata_old[roffs4])+Math.abs(cg-pixeldata_old[roffs4+1])+Math.abs(cb-pixeldata_old[roffs4+2])));
                var v=Math.max(scrdiff[offs]*0.9,diff);
                scrdiff[offs]=v;

                r=v;
                g=0;
                b=0;

                dpix[offs4]=r;
                dpix[offs4+1]=g;
                dpix[offs4+2]=b;

                ++offs;
                offs4+=4;
                roffs4-=4;
            }
        }

        ctx_output.putImageData(data_output,0,0);
    }

    (frame==0) ? frame=1 : frame=0;

}