const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');



//this is to scale everything
context.scale(20,20);
//to make row dissapear after filled
function arenaSweep(){
  outer: for(let y = arena.length - 1; y > 0; y--){
    for(let x = 0; x < arena[y].length; x++){
      if(arena[y][x] === 0){
        continue outer;
      }
    }
    const row = arena.splice(y,1)[0].fill(0);
    arena.unshift(row);
    y++;
  }

}

function collide(arena,player){
    const [m,o] = [player.matrix, player.pos];
    for(let y = 0; y < m.length; ++y){
      for(let x = 0; x < m[y].length; ++x){
        if(m[y][x] !==0 &&
        (arena[y+o.y] &&
        arena[y+o.y][x + o.x]) !== 0){
          return true;
        }
      }
    }
    return false;
}

//function to allow pieces to stick
function createMatrix(w,h){
  const matrix = [];
  while (h--){
  matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

//This it to build the Tetris pieces
function createPiece(type){
  if(type === 'T'){
  return [
  //extra zero is because when rotating it would just flip up and down without it.
    [0,0,0],
    [1,1,1],
    [0,1,0],
    ];
  } else if(type === 'O'){
  return [
    [2,2],
    [2,2],
    ];
  }
  else if(type === 'L'){
    return [
      [0,3,0],
      [0,3,0],
      [0,3,3]
      ];
  }  else if(type === 'J'){
    return [
      [0,4,0],
      [0,4,0],
      [4,4,0]
      ];
  }else if(type === 'I'){
    return [
      [0,5,0,0],
      [0,5,0,0],
      [0,5,0,0],
      [0,5,0,0],
      ];
  }else if(type === 'S'){
    return [
      [0,6,6],
      [6,6,0],
      [0,0,0],
      ];
  }else if(type === 'Z'){
    return [
      [7,7,0],
      [0,7,7],
      [0,0,0],
      ];
  }
}

function draw(){
  context.fillStyle = '#000';
  context.fillRect(0,0, canvas.width, canvas.height);
  drawMatrix(arena, {x: 0, y:0});
  drawMatrix(player.matrix, player.pos);

}
//using offset means you can move the pieve later
function drawMatrix(matrix, offset){
  matrix.forEach((row, y) =>{
    row.forEach((value, x) =>{
      if(value !==0 ){
        context.fillStyle = colours[value];
        context.fillRect(x + offset.x,
                          y + offset.y,1,1);
      }
    });
  });
}
//gonna copy all the functions from a player into the arena
function merge(arena,player){
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value !==0){
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });

}
//Makes it drop
//  if(dropCounter > dropInterval){
//    player.pos.y++;
//    dropCounter = 0;
//  }

function playerDrop(){
    player.pos.y++;
    if(collide(arena,player)){
      player.pos.y--;
      merge(arena,player);
      playerReset();
      arenaSweep();
    }
    dropCounter = 0;
}
//stops us being able to exit the arena
function playerMove(dir){
  player.pos.x += dir;
  if(collide(arena,player)){
    player.pos.x -= dir;
  }
}

function playerReset(){
  const pieces = 'ITOSZLJ';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
                  (player.matrix[0].length / 2 | 0);
//resets the game after you reach the top
  if(collide(arena,player)){
    arena.forEach(row => row.fill(0));
  }
}

//player rotate
function playerRotate(dir){
  const pos = player.pos.x;
  let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)){
      player.pos.x += offset;
      offset = -(offset > 0 ? 1 : -1);
      if(offset > player.matrix[0].length){
        rotate(player.matrix, -dir);
        player.pos.x = pos;
        return;
      }
    }
}
//rotation function
function rotate(matrix, dir){
  for(let y = 0; y< matrix.length; ++y){
    for(let x = 0; x < y; ++x){
      [
        matrix[x][y],
        matrix[y][x],
      ] = [
        matrix[y][x],
        matrix[x][y],
      ];
    }
  }
  if(dir > 0){
    matrix.forEach(row => row.reverse());
  }else {
    matrix.reverse();
  }
}
let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

const colours = [
    null,
    'red',
    'blue',
    'orange',
    'green',
    'purple',
    'pink',
    'yellow',
]

function update(time = 0){
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if(dropCounter > dropInterval){
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

function updateScore(){
  document.getElementbyId('score').innertext = player.score;
}
//20 units high & 12 wide
const arena = createMatrix(12,20);


//add player structure

const player = {

  pos: { x : 0, y : 0},
  matrix: null,
  score: 0,
}

//Keyboard controls
//This piece of code is triggered anytime you push the keyboard
//keycode 37 for left
//keycode 39 for right
document.addEventListener('keydown', event =>{
  if(event.keyCode === 37){
    playerMove(-1);
  } else if(event.keyCode ===39) {
  playerMove(1);
  }else if(event.keyCode === 40){
        playerDrop();
  }else if(event.keyCode === 81){
    playerRotate(-1)
  }else if(event.keyCode === 87){
    playerRotate(1)
  }
});

playerReset();
update ();
