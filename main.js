function main() {
  /**
   * @type {HTMLCanvasElement} canvas
   */
  var canvas = document.getElementById("myCanvas");

  /**
   * @type {WebGLRenderingContext} gl
   */
  var gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("Browser only support experimental WebGl");
    gl = canvas.getContext("experimental-webgl");
  }

  var vertices = [...kerangkaKiri, ...kerangkaKanan, ...kacaKiri, ...kacaKanan];

  // Buat buffer untuk LinkedList tempat penyimpanan sementara sebelum titik digambar
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Mendefinisikan vertexShader dan fragmentShader
  var vertexShaderSource = `
    attribute vec2 aPosition;
    attribute vec3 aColor;
    varying vec3 vColor;
    uniform mat4 uChanged;
    void main(){
        gl_Position = uChanged * vec4(aPosition, 0.0, 1.0);
        vColor = aColor;
    }
  `;

  var fragmentShaderSource = `
    precision mediump float;
    varying vec3 vColor;
    void main(){
        gl_FragColor = vec4(vColor, 1.0);
    }
  `;

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.shaderSource(fragmentShader, fragmentShaderSource);

  //Compile Shader
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error("ERROR compiling vertex shader!", gl.getShaderInfoLog(vertexShader));
    return;
  }

  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error("ERROR compiling fragment shader!", gl.getShaderInfoLog(fragmentShader));
    return;
  }

  // attach shader ke program grafika
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);

  // link program ke program utama
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("ERROR validating program!", gl.getProgramInfoLog(shaderProgram));
    return;
  }

  gl.validateProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  //Dapatkan lokasi positon dari shader untuk diolah
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  var aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.enableVertexAttribArray(aPosition);

  var aColor = gl.getAttribLocation(shaderProgram, "aColor");
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(aColor);

  //Waktunya NGGAMBARR
  var speed = 0.0231;
  var change = 0;
  var uChange = gl.getUniformLocation(shaderProgram, "uChanged");
  function render() {
    // change += 1;
    // gl.uniform1f(uChange, change);
    // gl.clearColor(1.0, 1.0, 1.0, 1.0); //Kasih BackGround dengan putih
    // gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    if (change >= 0.8 || change < -0.8) speed = -speed;
    change += speed;
    const kiri = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]

    const kanan = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, change, 0, 1,
    ]

    gl.clearColor(0.729, 0.662, 0.470, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //gambar kerangka kiri
    gl.uniformMatrix4fv(uChange, false, kiri);
    gl.drawArrays(gl.TRIANGLES, 0, 42);
    gl.drawArrays(gl.TRIANGLES, 42, 48);
    gl.drawArrays(gl.TRIANGLE_FAN, 90, 20);
    gl.drawArrays(gl.TRIANGLE_FAN, 110, 20);
    gl.drawArrays(gl.TRIANGLE_FAN, 130, 17);

    //gambar kerangka kanan
    gl.uniformMatrix4fv(uChange, false, kanan);
    gl.drawArrays(gl.TRIANGLE_FAN, 147, 4);
    gl.drawArrays(gl.TRIANGLES, 151, 48);
    gl.drawArrays(gl.TRIANGLE_FAN, 199, 4);
    gl.drawArrays(gl.TRIANGLES, 203, 48);
    gl.drawArrays(gl.TRIANGLE_FAN, 251, 27);
    gl.drawArrays(gl.TRIANGLE_FAN, 278, 29);
    gl.drawArrays(gl.TRIANGLE_FAN, 307, 24);

    //kaca kiri
    gl.uniformMatrix4fv(uChange, false, kiri);
    gl.drawArrays(gl.TRIANGLE_FAN, 331, 25);
    gl.drawArrays(gl.TRIANGLE_FAN, 356, 17);

    //kaca kanan
    gl.uniformMatrix4fv(uChange, false, kanan);
    gl.drawArrays(gl.TRIANGLE_FAN, 373, 20);
    gl.drawArrays(gl.TRIANGLE_FAN, 393, 18);
  }
  setInterval(render, 1000 / 60);
}
