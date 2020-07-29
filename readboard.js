var dir = [[0,1],[0,-1],[1,0],[-1,0]];
var visited = [];
var queue = [];
var gametop = 9999;
var gamebottom = 0;
var gameleft = 9999;
var gameright = 0;

for(var i = 0; i<550; i++){
  visited[i] = [];
  for(var j = 0; j<280; j++){
   visited[i][j] = 0;
  }
}

var canvas=document.getElementById("canvas");
var ctx=canvas.getContext("2d");

var imageLoader = document.getElementById('imageLoader'); //load files 
    imageLoader.addEventListener('change', handleUpload, false);

var paste = document.getElementById('paste');
paste.addEventListener("paste",handlePaste,false);

function findpoint(imgData){
  width = imgData.width*4;
   for(var j = 250; j<300; j++){
      for(var k = 115; k<165; k++){
        if (imgData.data[j*width+k*4] == 0){
            imgData.data[j*width+k*4] = 255;
            visited[j][k] = 1;
            queue.push(j);
            queue.push(k);
            return;
        }
    }
   }
}
function grayscaleImageData(imageData) {
  var data = imageData.data;
  for (var i = 0; i < data.length; i += 4) {
    var brightness = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    data[i] = brightness;
    data[i + 1] = brightness;
    data[i + 2] = brightness;
  }
  return imageData;
}

function threshold(pixels, threshold) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    var v = (r + g + b >= threshold) ? 255 : 0;
    d[i] = d[i+1] = d[i+2] = v;
  }
  return pixels;
};

function extendlines(imgData){
  var width = imgData.width*4;
  for(var j = 0; j<280; j++){
    var line = true;
    var row = 275;
    var height = j*4;
    if(imgData.data[row * width + height] == 255){
    for(var k = 0; k<20; k++){
      if(imgData.data[(row-k)*width + height]!=255){ //check top
        line = false;
      }
      if(imgData.data[(row+k)*width + height]!=255){ //check bottom
        line = false;
      }
    }
    if(line == true){ // fill the whole column
      for(var k = 0; k<550; k++){
        imgData.data[k*width+height]=255;
        imgData.data[k*width+height+1]=255;
        imgData.data[k*width+height+2]=255;
      }
  }
    }
  }
  //extend horizontal line
  for(var j = 0; j<550; j++){
    var line = true;
    var column = 140*4;
    if(imgData.data[j*width+column] == 255){
      for(var k = 0; k<20; k++){ 
      if(imgData.data[j*width + (column + k*4)]!=255){ //check left
        line = false;
      }
      if(imgData.data[j*width + (column - k*4)]!=255){ //check right
        line = false;
      }
      }
      if(line == true){ //fill the whole
        for(var k = 0; k<280; k++){
          imgData.data[j*width+k*4]=255;
          imgData.data[j*width+k*4+1]=255;
          imgData.data[j*width+k*4+2]=255;
        }
      }
    }
  }
}

function bfs(imgData){
  while(queue.length!=0){
    gametop = Math.min(gametop,queue[0]);
    gamebottom = Math.max(gamebottom,queue[0]);
    gameleft = Math.min(gameleft,queue[1]);
    gameright = Math.max(gameright,queue[1]);
    for(var j = 0; j<4; j++){
    var newrow = queue[0] + dir[j][0];
    newrow = Math.max(0,newrow);
    newrow = Math.min(549,newrow);
    var newcolumn = queue[1] + dir[j][1];
    newcolumn = Math.max(0,newcolumn);
    newcolumn = Math.min(279,newcolumn);
    if(!visited[newrow][newcolumn] && imgData.data[newrow*width+newcolumn*4] == 0){ //check if visited and is black
    imgData.data[newrow*width+newcolumn*4] = 255;
    queue.push(newrow);
    queue.push(newcolumn);
    } 
    }
    visited[queue[0]][queue[1]] = 1;
    queue.shift();
    queue.shift();
  }
}

function getboard(aImg){
  ctx.imageSmoothingEnabled = false;
    canvas.width = 280;
  canvas.height =  550;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(aImg,0,0,280,550);
    var imgData = ctx.getImageData(0,0,280,550);
    var newimgData = ctx.getImageData(0,0,280,550);
    ctx.putImageData(threshold(grayscaleImageData(imgData),400), 0, 0); //filter and process the image
  extendlines(imgData); //extend the vertical  and horizontal lines 
  findpoint(imgData); //find the starting point to bfs
  bfs(imgData); //actually bfs
  ctx.putImageData(newimgData, 0, 0);
  for(var j = 0; j<550; j++){ //reset array back to unvisited
   visited[j] = [];
  for(var k = 0; k<280; k++){
   visited[j][k] = 0;
  }
  }
  newimgData = ctx.getImageData( gameleft,gametop, gameright-gameleft, gamebottom-gametop);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = gameright-gameleft;
  canvas.height =  gamebottom-gametop;
  ctx.putImageData(newimgData, 0, 0);
  gametop = 9999; //reset bounds
  gamebottom = 0;
  gameleft = 9999;
  gameright = 0;
}


function loadImage(rsource){ // image source, reader source
var reader = new FileReader();
    reader.onload = function(event){
      var img = new Image();
      img.src = event.target.result;
        img.onload = function(){
            getboard(img);
        }
    }
    reader.readAsDataURL(rsource); 
}

function handlePaste(e){
  e.preventDefault();
  e.stopPropagation();
  loadImage(e.clipboardData.items[0].getAsFile());
}

function handleUpload(){
   loadImage(document.getElementById("imageLoader").files[0]);    
}

function handleDrag(files) {
    loadImage(files[0]);      
} 


var dropZone=document.getElementById("canvas"); //drag image onto canvas
dropZone.addEventListener("dragenter", handleDragEnter, false);
dropZone.addEventListener("dragover", handleDragOver, false);
dropZone.addEventListener("drop", handleDrop, false);

function handleDragEnter(e){e.stopPropagation(); e.preventDefault();}
function handleDragOver(e){e.stopPropagation(); e.preventDefault();}
function handleDrop(e){
    e.stopPropagation();
    e.preventDefault();
    var url=e.dataTransfer.getData('text/plain');
        handleDrag(e.dataTransfer.files);
}
