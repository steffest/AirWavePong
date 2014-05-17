function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function pixelDataToCSS(data){
    return "rgba(" + data[0] + "," + data[1] + "," + data[2] + "," + data[3] + ")";
}

function averageArray(a){
    var sum = 0;
    var result = 0;
    var len= a.length;
    if (len>0){
        for(var i = 0; i < len; i++)
        {
            sum += a[i];
        }
        result = sum/len;
    }
    return result;

}


function numeric(s){
    return  s.replace(/\D/g,'');
}