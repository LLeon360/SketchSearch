const canvas = document.getElementById("canvas");
const search = document.getElementById("search result");
const topResults = document.getElementById("top");
predictions = null;
curr_pred = 0
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
  canvasImg.style.display = "none";
}

function predict() {
  var dataURL = canvas.toDataURL();

  const jsonPromise = postImage();
  jsonPromise.then((json) => {
    console.log(json.prediction);
    show_pred(json.prediction);
    predictions = json.top;
    var pred_list = predictions[0]
    for(var i = 1; i < predictions.length; i++) {
      pred_list += ", " + predictions[i];
    }
    topResults.textContent = pred_list;
    curr_pred = 0;
  });
}

function show_pred(prediction) {
  search.src = "https://www.bing.com/images/search?q="+prediction;
}

function show_next() {
  if(predictions != null) {
    curr_pred = (curr_pred+1)%predictions.length;
    show_pred(predictions[curr_pred])
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
