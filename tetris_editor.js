var block = "block";
var space = "_";
var grid_size = 20; 
var colorset = [0,0,1,0,0,1,0]; //color set used for each piece used = level + colorset  colors[level][piece[colorset]]
var blockstyle = ["0", "1", "1", "0","1", "1","0"];
var selected_piece = "T";
var selected_level = "0";
var grid_type = 0;
var hover = 0;
var canid = "";
var codes = [97,98,116,106,122,111,115,108,105];
var overlap = 0;
var rows = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var fallarray= [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var remove = 0;
var stack = []; //overall stack
var boardstate = []; //state after each action
var blockstate = []; //state of each modified block
var cleared = 0;

var colors = [
["#0058F8","#3CBCFC"],
["#00A800","#B8F818"],
["#D800CC","#F878F8"],
["#0058F8","#58D854"],
["#E40058","#88F898"],
["#58F898","#6888FC"],
["#F83800","#7C7C7C"],
["#6844FC","#A80032"],
["#0058F8","#F83800"],
["#F83800","#FCA044"],
["ghost","ghost"],
]

var pieces = ["T","J","Z","O","S","L","I"];
var level = 0;
var piece = 0;
var piece_o = 0; //piece orientation 
var erase = 0;
var free_edit = 0;
//height row  I HAVE TO DO THIS THE ROTATIONS ARE NOT SYMMETRICAL

var piece_matrix = [[  //normal orientation
[[0,-1],[1,0],[0,1]], //T piece
[[0,1],[0,-1],[1,1]], //J piece
[[0,-1],[1,0],[1,1]], //Z piece
[[1,0],[0,1],[1,1]],  //O piece
[[1,-1],[1,0],[0,1]], //S piece
[[1,-1],[0,-1],[0,1]], //L piece
[[0,-2],[0,-1],[0,1]] //I piece
],

[  //rotate CW 90deg
[[0,-1],[1,0],[-1,0]], //T piece
[[-1,0],[1,0],[1,-1]], //J piece
[[1,0],[0,1],[-1,1]], //Z piece
[[1,0],[0,1],[1,1]],  //O piece
[[-1,0],[0,1],[1,1]], //S piece
[[-1,-1],[-1,0],[1,0]], //L piece
[[-2,0],[-1,0],[1,0]] //I piece
],

[  //rotate CW 180deg

[[0,-1],[-1,0],[0,1]], //T piece
[[-1,-1],[0,-1],[0,1]], //J piece
[[0,-1],[1,0],[1,1]], //Z piece
[[1,0],[0,1],[1,1]],  //O piece
[[1,-1],[1,0],[0,1]], //S piece
[[0,-1],[0,1],[-1,1]], //L piece
[[0,-2],[0,-1],[0,1]] //I piece
],

[  //rotate CW 270 deg
[[-1,0],[1,0],[0,1]], //T piece
[[1,0],[-1,0],[-1,1]], //J piece
[[1,0],[0,1],[-1,1]], //Z piece
[[1,0],[0,1],[1,1]],  //O piece
[[-1,0],[0,1],[1,1]], //S piece
[[-1,0],[1,0],[1,1]], //L piece
[[-2,0],[-1,0],[1,0]] //I piece
]];

var occupied = new Array(23);
for(var i = 0; i<23; i++){
     occupied[i] = new Array(13);
}

function checkbound(bound){
  var a = parseInt(bound.split("_")[1]);
  var b = parseInt(bound.split("_")[2]);
  return (a>=1 && b >=1 && a <= 20 && b <= 10);
}

function createblock(canvas_id, type,color, x){ //1 update boardstate 2 don't update boardstate and replace existing blocks
      var canvas = document.getElementById(canvas_id);
    if(!checkbound(canvas.id)){
  return;
  }
  if(type!=2){
    if(occupied[getcoords(canvas_id)[0]][getcoords(canvas_id)[1]] && x == 1){
      return;
    }
    if(!occupied[getcoords(canvas_id)[0]][getcoords(canvas_id)[1]]){
  rows[getcoords(canvas_id)[0]] +=1;
}
  occupied[getcoords(canvas_id)[0]][getcoords(canvas_id)[1]] = 1;
}   
if(type!=2){ //not a ghost piece
  canvas.style.colorstate = color;
  canvas.style.blockstylestate = type;
  if(x==1){
  blockstate.push(canvas_id);
  boardstate.push(blockstate);
  blockstate = [];
}
}
  if(color == "ghost"){
   type = 2;
  }
 canvas.style.outline = "3px solid black";
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0,0,canvas.width, canvas.height);
    if(type == 2){ //ghost piece
    ctx.fillStyle = "white";                          //ctx.fillStyle = "black"; bracket block
    ctx.fillRect(0,0,canvas.width, canvas.height);    //ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = "black";                          //ctx.fillStyle = "white";
    ctx.fillRect(2,2,12,12);                          //ctx.fillRect(2,2,12,12);
                                                      //ctx.fillStyle = "black";
                                                      //ctx.fillRect(6,2,4,2);
                                                      //ctx.fillRect(4,4,8,8);
                                                      //ctx.fillRect(6,12,4,2);
    }
    else{
        ctx.fillStyle = "white";
    ctx.fillRect(0,0,2,2);
    if(type == 1){
        ctx.fillRect(2,2,4,4);
        ctx.fillStyle = color;
        ctx.fillRect(4,4,2,2);
    }
    else{
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,2,2);
        ctx.fillRect(2,2,12,12);
    }
  }
  //push blockstate info 
}


function removeblock(canvas_id,x,y){ // 0 = grid, 1 = no grid  1 = update boardstate 2 = no update boardstate
  console.log(y);
  var canvas = document.getElementById(canvas_id);
  var h = parseInt(canvas.id.split("_")[1]);
  var r = parseInt(canvas.id.split("_")[2]);
  if(occupied[h][r] == 1){ //actually removing a block
    if(y == 1){
      console.log("adding");
    blockstate.push(canvas_id);
    blockstate.push(canvas.style.blockstylestate);
    blockstate.push(canvas.style.colorstate);
    boardstate.push(blockstate);
    blockstate = [];
    stack.push(boardstate);
    boardstate = [];
  }
    rows[h]-=1;
  }
  occupied[h][r] = 0;
  var ctx = canvas.getContext("2d");
  if(x==0){
  ctx.fillStyle = "#414141";
  }
  else{
  ctx.fillStyle = "#000000";
  }
  ctx.fillRect(0,0,canvas.width, canvas.height);
  canvas.style.outline = "3px solid black";
  return;
} 

function background(canvas_id){
  var canvas = document.getElementById(canvas_id);
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0,0,canvas.width, canvas.height);
  canvas.style.outline = "3px solid black";
  return;
} 

function getcoords(canvas_id){
  var arr = [0,0];
  arr[0] = parseInt(canvas_id.split("_")[1],10);
  arr[1] = parseInt(canvas_id.split("_")[2],10);
  return arr;
}

function filladjacent(canvas_id,x){
  height = getcoords(canvas_id)[0];
  row = getcoords(canvas_id)[1];
    for(var i = 0; i<3; i++){
var newheight = height+piece_matrix[piece_o%4][piece][i][0];
var newrow =  row+piece_matrix[piece_o%4][piece][i][1];
newblock = (((block.concat(space)).concat(newheight)).concat(space)).concat(newrow);
if(!checkbound(newblock)){
  continue;
}
           if(x == 1){ //mousedown event
               createblock(("canvas").concat(newblock),blockstyle[piece],colors[level][colorset[piece]],1);
           }
          if(x==2){ //mouseover event
            if(!occupied[newheight][newrow]){
               createblock(("canvas").concat(newblock),2,"gray",1);
               }
            }
           if(x==3){ //mouseout event
              if(!occupied[newheight][newrow]){
               removeblock(("canvas").concat(newblock),grid_type,1);
               }
           }
    }
}

function selectpiece(p){ // letter of piece
  var element = document.getElementById(p);
  piece = pieces.indexOf(p);
  document.getElementById(selected_piece).style.outline = " black";
  selected_piece = p;
  element.style.outline = "#9CFCF0 solid 3px";
  document.getElementById("curpiece").src = ("images/".concat(p).concat("_").concat(level).concat(".png"));
  document.getElementById("curpiece").style.imageRendering = "pixelated";
  piece_o = 0;

return;
}

function selectlevel(l){
  var element = document.getElementById(l);
  level = l;
  document.getElementById(selected_level).style.outline = "black";
  selected_level = l;
  element.style.outline = "#9CFCF0 solid 3px";
  for(var i = 0; i<7; i++){
    document.getElementById(pieces[i].concat("png")).src = "images/".concat(pieces[i]).concat("_").concat(level).concat(".png");
  }
  document.getElementById("curpiece").src = "images/".concat(pieces[piece]).concat("_").concat(level).concat(".png");
return;
}

function rotate(direction){
  if(direction == 1){
    piece_o += 1;
    if(piece_o>3){
      piece_o = 0;
    }
    return;
  }
  piece_o -= 1;
    if(piece_o<0){
      piece_o = 3;
    }
}

function updatestate(canvas_id,x,y){ //rotation update x = 1 rotate, x = 2 new piece
  var a = occupied[getcoords(canvas_id)[0]][getcoords(canvas_id)[1]];
  if(!a){
  removeblock(canvas_id,grid_type,2);
}
  filladjacent(canvas_id,3);
  if(x==1){ //rotate
      rotate(y);
  }
  else{
    selectpiece(pieces[y]);
  }
  if(!a){
  createblock(canvas_id,2,"black",1);
  }
  filladjacent(canvas_id,2);
}

function undo(){
    if(stack.length != 0){
      for(var i = 0; i<stack[stack.length-1].length; i++){
        if(stack[stack.length-1][i].length == 1){ //remove block operation
        removeblock(stack[stack.length-1][i][0],grid_type,2);
        }
        else{ //add block operation
        createblock(stack[stack.length-1][i][0],stack[stack.length-1][i][1],stack[stack.length-1][i][2],2);
        }
      }
      stack.pop();
    }

}

function clear(){
  for(var i = 0; i<=20; i++){
      if(rows[i] == 10){
        var cleared = 1;
      }
  }
  if(cleared == 1){
  for(var x = 1; x<=20; x++){
    for(var y = 1; y<=10; y++){
      var canvas = document.getElementById("canvasblock".concat("_").concat(x).concat("_").concat(y));
      blockstate.push(canvas.id);
      if(occupied[x][y]){
      blockstate.push(canvas.style.blockstylestate);
      blockstate.push(canvas.style.colorstate);
      boardstate.push(blockstate);
      blockstate = [];
      }
      else{
        boardstate.push(blockstate);
      }
      blockstate = [];
    }
  }
  stack.push(boardstate);
  boardstate = [];
}
cleared = 0;
  if(rows[1] == 10){
    remove = 1;
    for(var j = 1; j<=10; j++){
      removeblock("canvasblock".concat("_").concat(1).concat("_").concat(j),grid_type,2); //clear lines
    }
  }
for(var i = 20; i>=2; i--){
  if(rows[i] == 10){
    remove =1;
    for(var k = i-1; k>=1; k--){
      fallarray[k]+=1;
    }
    for(var j = 1; j<=10; j++){
      removeblock("canvasblock".concat("_").concat(i).concat("_").concat(j),grid_type,2); //clear lines
    }
  }
}
for(var i = 19; i>=1; i--){ //let the bodies hit the floor
  if(fallarray[i] == 0){
    continue;
  }
  for(var j = 1; j<=10; j++){
    var sourcecanvas = document.getElementById("canvasblock".concat("_").concat(i).concat("_").concat(j));
  var newcanvas = document.getElementById("canvasblock".concat("_").concat(i+fallarray[i]).concat("_").concat(j)).getContext('2d');
  newcanvas.drawImage(sourcecanvas, 0, 0);
  var isoccupied = occupied[i][j];
 removeblock(sourcecanvas.id,grid_type,2);
 if(isoccupied){
  if(!occupied[i+fallarray[i]][j]){ //transfer block
     rows[i+fallarray[i]] +=1;
     occupied[i+fallarray[i]][j] = 1;
  }
 }
  }
}
for(var i = 0; i<= 20; i++){
  fallarray[i] = 0;
}
remove = 0;
}

document.getElementById("gamescreen").style.paddingLeft = "3px";
document.getElementById("gamescreen").style.paddingTop = "3px";

for(var i = 0; i<grid_size; i++){ //height

     var row_number = i+1
     var a  = document.createElement('div');
     row_name = "row".concat(row_number);
     a.id = row_name;
     a.style.display= "flex";
     a.style.justifyContent = "center";

     document.getElementById("gamescreen").appendChild(a);

  for(var j = 0; j<10; j++){
    var height_number = j+1;
          var name = (((block.concat(space)).concat(row_number)).concat(space)).concat(height_number);
          var a = document.createElement('div');
          a.id = name;             //24px 3px padding for desktop
          a.style.height = "24px"; //48px 6px padding for mobile
          a.style.width = "24px";
          a.style.paddingRight = "3px";
          a.style.paddingBottom = "3px";

          a.onmousemove = function(e) { //free edit mode
              if(e.buttons == 1) {
               if(erase == 1){
                removeblock(("canvas").concat(this.id),grid_type,1);
               }
               if(free_edit == 1){
                var block_height = parseInt(this.id.split("_")[1],10);
              var block_row = parseInt(this.id.split("_")[2],10);
              if(!occupied[block_height][block_row]){
                createblock(("canvas").concat(this.id),blockstyle[piece],colors[level][colorset[piece]],1);
                stack.push(boardstate);
                boardstate = [];
              }

               }
               // stack.push(state) push the old state into the stack
              } 

         }
         a.onmousedown = function() {
              if(!checkbound(this.id)){
                return;
              }
              if(erase == 1){
                removeblock(("canvas").concat(this.id),grid_type,1);
                return;
              }
              var height = getcoords(this.id)[0];
              var row = getcoords(this.id)[1];
              //if(!occupied[height][row]){
                createblock(("canvas").concat(this.id),blockstyle[piece],colors[level][colorset[piece]],1);
              //}
              if(free_edit == 1){
                stack.push(boardstate);
                boardstate = [];
                return;
              }
              filladjacent(this.id,1);
              stack.push(boardstate);
              boardstate = [];
               // stack.push(state) push the old state into the stack
         }

         a.onmouseover = function() {
          canid = ("canvas").concat(this.id);
          hover = 1;
              if(erase == 1){
                return;
              }
              var height = getcoords(this.id)[0];
              var row = getcoords(this.id)[1];
              if(!(checkbound(this.id))){
                return;
              }
              if(!occupied[height][row]){
                  createblock(("canvas").concat(this.id),2,"gray",1);
              }
              if(free_edit == 1){
                return;
              }
              filladjacent(this.id,2);
         }

         a.onmouseout = function() {
          hover = 0;
              var height = getcoords(this.id)[0];
              var row = getcoords(this.id)[1];
              if(!(checkbound(this.id))){
                return;
              }
              if(!occupied[height][row] ){ 
                  removeblock(("canvas").concat(this.id),grid_type,2);
              }
              filladjacent(this.id,3);
         }

         occupied[i][j] = 0;
         var canvas = document.createElement("canvas");
         canvas.width = "16";
         canvas.height = "16";
         canvas.style.outline = "3px solid black";
         canvas.style.width = "100%";
         canvas.style.height = "100%";
         canvas.style.imageRendering = "pixelated";

         canvas.id = "canvas".concat(a.id);
         a.appendChild(canvas);
          document.getElementById(row_name).appendChild(a);
          removeblock(canvas.id,grid_type,2);
         
  }

}

for(var i =0; i < 7; i++){ //set piece
  document.getElementById(pieces[i]).style.imageRendering = "pixelated";
  document.getElementById(pieces[i]).addEventListener("click", function(){
    selectpiece(this.id.toString());
  });
}


            for(var i =0; i < 11; i++){ //set level
              document.getElementById(i.toString()).style.imageRendering = "pixelated";
     document.getElementById(i.toString()).addEventListener("click", function(){
              selectlevel(this.id.toString());
         });
             document.getElementById(i.toString()).style.marginLeft = "10px";
             document.getElementById(i.toString()).style.marginRight = "10px";

   }

   document.getElementById("rotatecw").addEventListener("click", function(){
    rotate(1);
    });

   document.getElementById("rotateccw").addEventListener("click", function(){
    rotate(2);
    });

   document.getElementById("erase").addEventListener("click", function(){
    if(erase == 1){
      this.style.outline = "black";
      erase = 0;
    }
    else{
      document.getElementById("edit").style.outline = "black";
      this.style.outline = "#9CFCF0 solid 3px";
      erase = 1;
      free_edit = 0;
    }
    });

document.getElementById("edit").addEventListener("click", function(){
  if(free_edit == 1){
    this.style.outline = "black";
    free_edit = 0;
    }
  else{
    document.getElementById("erase").style.outline = "black";
    this.style.outline = "#9CFCF0 solid 3px";
    free_edit = 1;
    erase = 0;
    }
});


document.getElementById("clear").addEventListener("click", clear);


document.getElementById("undo").addEventListener("click", undo);

document.getElementById("grid").addEventListener("click", function(){
  if(grid_type == 1 ){
    grid_type = 0;
  }
  else{
    grid_type = 1;
  }
for(var i = 1; i<=20; i++){
  for(var j = 1; j<=10; j++){
    if(!occupied[i][j]){
      removeblock(("canvasblock_").concat(i).concat("_").concat(j),grid_type,2);
    }
  }
}
});
document.addEventListener("keypress", function(){
  if(free_edit == 0 && erase == 0){
    console.log(event.keyCode);
  if(event.keyCode == 49){
    if(hover == 1){ //if hovering over, update piece 
      updatestate(canid,1,1);
    }
    else{
      rotate(1);
    }
  }
  if(event.keyCode == 50){
    if(hover == 1){ //if hovering over, update piece 
      updatestate(canid,1,2);
    }
    else{
      rotate(2);
    }
  }

  if(event.keyCode == 116 || event.keyCode == 84){ //T
    if(hover == 1){
      updatestate(canid,2,0);
    }
    else{
      selectpiece('T');
    }

  }

  if(event.keyCode == 106 || event.keyCode == 74){ //J
    if(hover == 1){
      updatestate(canid,2,1);
    }
    else{
      selectpiece('J');
    }
  }

  if(event.keyCode == 122 || event.keyCode == 90){ //Z
    if(hover == 1){
      updatestate(canid,2,2);
    }
    else{
      selectpiece('Z');
    }
  }

  if(event.keyCode == 111 || event.keyCode == 79){ // O
    if(hover == 1){
      updatestate(canid,2,3);
    }
    else{
      selectpiece('O');
    }

  }

  if(event.keyCode == 115 || event.keyCode == 83){ //S
    if(hover == 1){
      updatestate(canid,2,4);
    }
    else{
      selectpiece('S');
    }
  }

  if(event.keyCode == 108 || event.keyCode == 76){ //L 
    if(hover == 1){
      updatestate(canid,2,5);
    }
    else{
      selectpiece('L');
    }
  }

  if(event.keyCode == 105 || event.keyCode == 73){ //I
    if(hover == 1){
      updatestate(canid,2,6);
    }
    else{
      selectpiece('I');
    }
  }

}
if(event.keyCode == 117 || event.keyCode == 85 ){
  undo();
}
if(event.keyCode == 99 || event.keyCode == 67 ){
  clear();
}
});
