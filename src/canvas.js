function initCanvas() {
  var canvas = document.getElementById("bg-canvas");
  const dpr = window.devicePixelRatio;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  var timeTravel = false;
  var timeShift = 0;

  var gl = canvas.getContext("webgl2");
  var vsSource = document.getElementById("vertex-shader").textContent;
  var fsSource = document.getElementById("fragment-shader").textContent;

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vsSource);
  gl.compileShader(vertexShader);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fsSource);
  gl.compileShader(fragmentShader);
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  var positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  var positionAttributeLocation = gl.getAttribLocation(
    shaderProgram,
    "position",
  );
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  var timeUniformLocation = gl.getUniformLocation(shaderProgram, "u_time");
  var resolutionUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "u_resolution",
  );

  var counter = 0;
  var timeSeed = (performance.timeOrigin / 1000) % (60 * 60 * 24);

  function render() {
    if (counter++ % 5 !== 0) {
      requestAnimationFrame(render);
      return;
    }

    if (timeTravel) {
      timeShift += 2;
    } else if (timeShift > 0) {
      timeShift = Math.max(0, timeShift - 2);
    }

    var currentTime = timeSeed + timeShift + performance.now() / 1000;
    gl.uniform1f(timeUniformLocation, currentTime);
    gl.uniform2f(
      resolutionUniformLocation,
      window.innerWidth * dpr,
      window.innerHeight * dpr,
    );
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  render();

  window.addEventListener("keydown", (e) => {
    if (e.key === "t") {
      timeTravel = true;
    }
  });

  window.addEventListener("keyup", () => {
    timeTravel = false;
  });
}

initCanvas();
