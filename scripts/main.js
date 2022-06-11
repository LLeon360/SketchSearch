const canvas = document.getElementById("canvas")
const canvasImg = document.getElementById("canvas img")
const labelSelect = document.getElementById("label select")

async function postImage() {
  // var value = labelSelect.name
  // console.log(value)
  var label = labelSelect.options[labelSelect.selectedIndex].value;
  console.log(label);
  let data = {
    Image: canvasImg.src,
    Label: label
  };

  try {
    const response = await fetch('/app/API/save_image', { //send png to backend
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
    findxy('up', e)
  }, false);
  canvas.addEventListener("mouseout", function (e) {
    findxy('out', e)
  }, false);
}

function draw() {
  ctx.lineCap = 'round';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(currX, currY);
  ctx.stroke();
  ctx.closePath();
}

function erase() {
  // var m = confirm("Would you like to clear the canvas?");
  // if (m) {
      ctx.clearRect(0, 0, w, h);
     canvasImg.style.display = "none";
  // }
}

function save() {
  canvasImg.style.border = "8px solid";
  var dataURL = canvas.toDataURL()
  canvasImg.src = dataURL;
  canvasImg.style.display = "inline";

  const jsonPromise = postImage();
  jsonPromise.then((json) => {
    console.log(json.output)
  });
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
