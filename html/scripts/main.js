const canvas = document.getElementById("canvas");
const search = document.getElementById("search result");
const topResultsLeft = document.getElementById("top-left");
const topResultsCurr = document.getElementById("top-current");
const topResultsRight = document.getElementById("top-right");
predictions = null;
currPred = 0
async function postImage() {
  
  var dataURL = canvas.toDataURL();
  let data = {
    Image: dataURL
  };

  try {
    const response = await fetch('/app/API/predict', { //send png to backend
      method: "POST",
      headers: {
        "Content-Type": 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const json = await response.json();
    return json;
  }
  catch (error) {
    console.error(`Could not get products: ${error}`);
  }
}


//Manage Canvas
var ctx, flag = false,
  prevX = 0,
  currX = 0,
  prevY = 0,
  currY = 0,
  dot_flag = false;

var fillcolor = "black";

// var minX, minY, maxX, maxY;
// const dpi = window.devicePixelRatio;

function init() {
  ctx = canvas.getContext("2d");
  w = canvas.width;
  h = canvas.height;

  canvas.addEventListener("mousemove", function (e) {
    findxy('move', e)
  }, false);
  canvas.addEventListener("mousedown", function (e) {
    findxy('down', e)
  }, false);
  canvas.addEventListener("mouseup", function (e) {
    findxy('up', e);
    predict();
  }, false);
  canvas.addEventListener("mouseout", function (e) {
    findxy('out', e);
  }, false);
  
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.fillStyle = "white";
  ctx.fill();
}

function draw() {
  ctx.lineCap = 'round';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(currX, currY);
  ctx.stroke();
  ctx.closePath();
}

function erase() {
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.fillStyle = "white";
  ctx.fill();
}

function predict() {
  var dataURL = canvas.toDataURL();

  const jsonPromise = postImage();
  jsonPromise.then((json) => {
    console.log(json.prediction);
    currPred = 0;
    predictions = json.top;
    show_pred(json.prediction);
  });
}

function show_pred(prediction) {
  search.src = "https://www.bing.com/images/search?q="+prediction;
  
  
  topResultsCurr.textContent = predictions[currPred];
  var predListLeft = "", predListRight = "";
  for(var i = 0; i < currPred; i++) {
    if(i == 0) {
      predListLeft += predictions[i];
    }
    else if(i == currPred-1)
    {
      predListLeft += ", " + predictions[i] + ", ";
    }
    else {
      predListLeft += ", " + predictions[i];
    }
  }
  for(var i = currPred+1; i < predictions.length; i++) {
    predListRight += ", " + predictions[i];
  }
  
  topResultsLeft.textContent = predListLeft;
  topResultsRight.textContent = predListRight;
}

function show_next() {
  if(predictions != null) {
    currPred = (currPred+1)%predictions.length;
    show_pred(predictions[currPred])
  }
  console.log(predictions)
}

function findxy(res, e) {
  prevX = currX;
  prevY = currY;
  var rect = canvas.getBoundingClientRect()
  currX = e.clientX - rect.left;
  currY = e.clientY - rect.top;
  if (res == 'down') {

    flag = true;
    dot_flag = true;
    if (dot_flag) {
      ctx.beginPath();
      ctx.fillStyle = fillcolor;
      ctx.arc(currX, currY, 4, 0, 2 * Math.PI, false);
      ctx.closePath();
      dot_flag = false;
    }
  }
  if (res == 'up' || res == "out") {
    flag = false;
  }
  if (res == 'move') {
    if (flag) {
      draw();
    }
  }
}
