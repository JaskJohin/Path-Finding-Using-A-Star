let canvas = document.getElementById('canvas');
let status = document.getElementById('status');cellWidth
canvas.setAttribute('width', '400px'); //Canvas width
canvas.setAttribute('height', '400px'); //Canvas height

let width = parseInt(canvas.getAttribute('width')); //Parse the canvas width to an integer
let height = parseInt(canvas.getAttribute('height')); //Parse the canvas height to an integer

let ctx = canvas.getContext('2d'); //Get the canvas context [2D]
ctx.fillRect(0,0,width,height);

var rows = 8; //Number of rows in the grid
var columns = 8; //Number of columns in the grid
var openSet = []; //Array to store the cells to be evaluated
var closedSet = []; //Array to store the cells that have already been evaluated
var grid = new Array(columns); //The 2D array to store the grid
var start, goal; //Start and goal cells
var cellWidth, cellHeight; //Cell width and height
var path = []; //Array to store the path

//Heuristic function [Manhattan distance]
function heuristics(a, b)
{
  let h = Math.max(Math.abs(a.i - b.i), Math.abs(a.j - b.j));
  return h;
}

/*Constructor for the cell object containing the cell's 
coordinates, f, g, h values, neighbors, previous cell 
and a boolean to check if the cell is a wall*/
function Cell(i,j)
{
  this.i = i; //
  this.j = j; //
  this.g = 0; // Distance from start
  this.h = 0; // Distance from goal

  //Total cost function [f = g + h]
	this.f = function()
  {
    return this.g + this.h;
  }

  this.neighbors = []; //Current cell's neighbors
  this.previous = null; //Current cell's parent
  this.wall = false; //Current cell is not a wall
  
  //Generate random walls with a 20 % probability
  if (Math.random() < 0.2)
  {
    this.wall = true;
  }
  
  //Color the cell
  this.show = function(color)
  {
    ctx.beginPath(); //Start drawing
    ctx.rect(this.i * cellWidth, this.j * cellHeight, cellWidth, cellHeight); //Draw a rectangle
    
    //If the cell is a wall, color it black, else color it white
    if (this.wall) 
    {
      ctx.fillStyle  = '#111111'
    } 
    
    else 
    {
      ctx.fillStyle = color;
    }
    ctx.strokeStyle = '#111111'; //Color the cell's border black
    ctx.fill(); //Fill the cell
    ctx.stroke(); //Draw the cell's border 
  }
  
  //Add the current cell's neighbors to the neighbors array
  this.addNeighbors = function()
  {
    let i = this.i;
    let j = this.j;

    if(i < columns - 1) //If the current cell is not the last cell in the row
    {
      this.neighbors.push(grid[i + 1][j]);
    }

    if(i > 0) //If the current cell is not the first cell in the row
    {
      this.neighbors.push(grid[i - 1][j]);
    }

    if(j < rows - 1) //If the current cell is not the last cell in the column
    {
      this.neighbors.push(grid[i][j + 1]);
    }

    if (j > 0) //If the current cell is not the first cell in the column
    {
      this.neighbors.push(grid[i][j - 1]);
    }
  }
}

//Initialize the grid
function init()
{
  cellWidth = width / columns; //Calculate the cell width
  cellHeight = height / rows; // Calculate the cell height
  
  //Construct a 2D grid
  for (let i = 0; i < columns; i++)
  {
    grid[i] = new Array(rows); //Create a new array for each column
  }
  
  //Populate the grid with cells
  for (let i = 0; i < columns; i++)
  {
    //Create a new cell for each column
    for (let j = 0; j < rows; j++)
    {
      grid[i][j] = new Cell(i, j); //Create a new cell for each row
      grid[i][j].show('white'); //Color the cell white
    }
  }
  
  //Add the neighbors to each cell
  for (let i = 0; i < columns; i++)
  {
    for (let j = 0; j < rows; j++)
    {
      grid[i][j].addNeighbors(); //Add the neighbors to the current cell
    }
  }
  
  start = grid[0][0]; //Set the start cell
  goal = grid[columns - 1][rows - 1]; //Set the goal cell
	start.wall = false; //The start cell must not be a wall
  goal.wall = false; // The goal cell must not be a wall
	goal.show('magenta'); //Color the goal cell magenta
  openSet.push(start); //Add the start cell to the open set
  draw(); //Draw the grid
}

function draw()
{
  let current = null; //Current cell to be evaluated

	//If there are cells to be evaluated [There's an available path to the goal]
  if(openSet.length > 0)
  { 
    let lowestF = 0; //The index of the cell with the lowest f value in the open set
    
    //Find the cell with the lowest f value in the open set
    for (let i = 0; i < openSet.length; i++)
    {
      /*If the current cell has a lower f value than the cell with the lowest f value
      [i = current cell, lowestF = cell with the lowest f value]*/
      if(openSet[i].f < openSet[lowestF].f || openSet[i].f == openSet[lowestF].f && openSet[i].height < openSet[lowestF].height)
      {
        lowestF = i; //Set the current cell as the cell with the lowest f value
      }
    }
    
    current = openSet[lowestF]; //Set the current cell to the cell with the lowest f value
  
    //If the current cell is the goal cell
    if(current === goal)
    {
      status.innerText = "A path is found!";      
      var tmp = current; //Temporary cell [Using var because tmp is function scoped]
      path.push(tmp); //Add the current cell to the path
      
      //Add the previous cells to the path
      while(tmp.previous)
      {
        path.push(tmp.previous); //Add the previous cell to the path
        tmp = tmp.previous; //Set the previous cell as the current cell
      }
 
      //Draw the path
      for (let i = 0; i < path.length; i++)
      {
          path[i].show('#0074D9'); //Path color [blue] 
      }
       
      cancelAnimationFrame(a); //Stop the animation
      return;
    }

    removeFromArray(openSet, current); //Remove the current cell from the open set
    closedSet.push(current); //Add the current cell to the closed set
    
    //Evaluate the current cell's neighbors
    for (let i = 0; i < current.neighbors.length; i++)
    {
      let neighbor = current.neighbors[i]; //Current neighbor
      
      //If the current neighbor is not in the closed set and is not a wall
      if(!closedSet.includes(neighbor) && !neighbor.wall)
      {
        //Calculate the distance between the current cell and the its neighbor
        let tempG = calcDistance(neighbor, current);
        
        //If the current's cell neighbor is in the open set
        if (openSet.includes(neighbor))
        {
          //Then if the current neighbor has a lower g value than the current cell
          if (tempG < neighbor.g)
          {
              neighbor.g = tempG; //Set the current cell's neighbor's g value to the current cell's g value

              //Set the current cell's neighbor's height to the distance between the current cell's neighbor and the goal cell
							neighbor.height = calcDistance(neighbor, goal);
          }
        }

        else
        {
          neighbor.g = tempG; //Set the current cell's neighbor's g value to the current cell's g value
          openSet.push(neighbor); //Add the current cell's neighbor to the open set
        }
        
				neighbor.f = neighbor.height + neighbor.g; //Set the current cell's neighbor's f value
        neighbor.previous = current; //Set the current cell as the current neighbor's previous cell
      }
    }
  }
  
  else
  {
    //No path available
    status.innerText = "There is no path available!"
    cancelAnimationFrame(a);
    return;
  }
  
  //Draw the grid and the sets [openSet = green, closedSet = red]
  for (let i = 0; i < closedSet.length; i++)
  {
    closedSet[i].show('#FF4136'); //Color the closedSet red
  }
	
  for(let i = 0; i < openSet.length; i++)
  {
    openSet[i].show('#2ECC40'); //Color the openSet green
  }
	
  var a = requestAnimationFrame(draw);
}

//Function to remove an element from an array
function removeFromArray(array, element)
{
  //If the element is in the array
  if(array.indexOf(element) != -1)
  {
    array.splice(array.indexOf(element), 1); //Remove it
  }
}

//Function to calculate the distance between two cells (TO BE REVIEWED - NOT OPTIMAL)
function calcDistance(a,b)
{
	let distanceX = Math.abs(a.i - b.i); //The distance between the two cells on the x axis
	let distanceY = Math.abs(a.j - b.j); //The distance between the two cells on the y axis

	if(distanceX > distanceY)
		return 14 * distanceY + 10 * (distanceX - distanceY);
	  return 14 * distanceX + 10 * (distanceY - distanceX);
}

//Restart the simulation
function restart()
{
  status.innerText = 'Searching for a path...';
  path = []; //Reset the path array
  openSet = []; //Reset the openSet array
  closedSet = []; //Reset the closedSet array
  init(); //Reinitialize the grid
}

window.addEventListener('load', init); //Initialize the grid when the Window loads
document.getElementById('restart_btn').addEventListener('click', restart); //Restart the simulation when the Restart button is clicked