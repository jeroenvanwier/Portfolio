/* Global gl environment and corresponding program info, used for rendering. Initialized in setup(). */
gl = null;
programInfo = null;
rotationX = 0;
rotationY = 0;
squigle = 0;

lastX = 0;
lastY = 0;

/* Initial setup for the canvas and GL environment, called upon page load */
function setup() {
    const canvas = document.getElementById("titlecard-bg");
    
    // Set the resolution of the canvas equal to the size it takes up on the screen
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Set the mouse listener
    document.getElementById("titlecard").onmousemove = move;
    
    // Set the (global) gl context
    gl = canvas.getContext("webgl");
    
    if (gl === null) {
        console.log("WebGL not supported by browser");
        return
    }
    
    // Compile the shaders
    const shaderProgram = initShaders(vsSource, fsSource);
    
    // Set the (global) program info, containing the shaders and the locations of the values within them
    programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
            clientWidth: gl.getUniformLocation(shaderProgram, 'uClientWidth'),
            clientHeight: gl.getUniformLocation(shaderProgram, 'uClientHeight'),
            color: gl.getUniformLocation(shaderProgram, 'uColor')
        }
    };
    
    // Draw the first frame
    window.requestAnimationFrame(draw);
}

/* Correct canvas resolution when page is resized */
function resize() {
    const canvas = document.getElementById("titlecard-bg");
    
    // Set the resolution of the canvas equal to the (new) size it takes up on the screen
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Set the GL viewport to be in the new position
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    // Redraw the scene
    draw();
}

/* Draw a single frame to the canvas. */
function draw() {
    if (gl === null) {
        console.log("Attempt to draw frame before GL was set up.");
        return;
    }
    
    rotationX += 0.25;
    rotationY += 0.25;
    squigle += 0.02;
    squigle %= 360;
    rotationX %= 720;
    rotationY %= 720;
    
    // Draw a black background
    gl.clearColor(37/255, 41/255, 52/255, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Set the shaders
    gl.useProgram(programInfo.program);

    // Upload the canvas size to the shaders
    const canvas = document.getElementById("titlecard-bg");
    
    gl.uniform1f(programInfo.uniformLocations.clientWidth, canvas.width * 1.0);
    gl.uniform1f(programInfo.uniformLocations.clientHeight, canvas.height * 1.0);
    
    xpos = [1,0,0];
    ypos = [0,1,0];
    zpos = [0,0,1];
    
    xpos = rotate(xpos, rotationX * Math.PI * 2 / 360, (180 + rotationY) * Math.PI / 360)
    ypos = rotate(ypos, rotationX * Math.PI * 2 / 360, (180 + rotationY) * Math.PI / 360)
    zpos = rotate(zpos, rotationX * Math.PI * 2 / 360, (180 + rotationY) * Math.PI / 360)
        
    r = canvas.height / 3;
    
    left_o = [r + 50,canvas.height / 2, canvas.height / 2];
    
    right_o = [canvas.width - r - 50,canvas.height / 2, canvas.height / 2];    
    
    drawSphere(left_o, r, xpos, ypos, zpos);
    drawSphere(right_o, r, xpos, ypos, zpos);
    
    drawSquiglyLine(left_o, right_o, [0.7,0.7,0.9,1.0], squigle);
    drawSquiglyLine(left_o, right_o, [0.7,0.7,0.9,1.0], squigle*Math.E+4);
    drawSquiglyLine(left_o, right_o, [0.7,0.7,0.9,1.0], squigle*Math.PI+8);
    
    window.requestAnimationFrame(draw);
}

/* Render a sphere at position o with radius r and axes xpos, ypos, zpos */
function drawSphere(o, r, xpos, ypos, zpos) {
    drawCircle(o, r=r, xpos, ypos, color=[1.0, 47/255, 142/255, 1.0]);
    drawCircle(o, r=r, zpos, ypos, color=[4/255, 194/255, 201/255, 1.0]);
    drawCircle(o, r=r, zpos, xpos, color=[46/255, 85/255, 193/255, 1.0]);
}

/* Draw squigly line from pos1 to pos2 */
function drawSquiglyLine(pos1, pos2, color, offset) {
    line = [];
    lx = pos2[0] - pos1[0];
    ly = pos2[1] - pos1[1];
    
    for (let i = 0; i <= 100; i++) {
        let px = pos1[0] + (i / 100) * lx;
        let py = pos1[1] + (i / 100) * ly + (1 - ((i - 50)*(i - 50)/2500)) * 10 * Math.cos(offset) * Math.sin(Math.PI * 0.2 * (i + offset));
        line.push(px, py);
    }
    
    drawLine(line, color=color);
}

/* Rotate a vector by theta around the y-axis then phi around the x-axis */
function rotate(vec, theta, phi) {
    var old_vec = [vec[0], vec[1], vec[2]]
    vec[0] = Math.cos(theta) * old_vec[0] + Math.sin(theta) * old_vec[2]
    vec[2] = Math.cos(theta) * old_vec[2] - Math.sin(theta) * old_vec[0]
    old_vec = [vec[0], vec[1], vec[2]]
    vec[1] = Math.cos(phi) * old_vec[1] + Math.sin(phi) * old_vec[2]
    vec[2] = Math.cos(phi) * old_vec[2] - Math.sin(phi) * old_vec[1]
    return vec
}

/* Draw a straight line from Point a to b */
function drawLineSegment(a, b) {
    drawLine([a[0], a[1], b[0], b[1]])
}

/* Draw a circle of radius r (in pixels) around Point p */
function drawCircle(p, r = 10, v1 = [1, 0, 0], v2 = [0, 1, 0], color=[1.0, 1.0, 1.0, 1.0]) {
    const circlePositions = [];
    for (let i = 0; i <= 180; i++) {
        var xp = p[0] + v1[0] * r * Math.cos(i * Math.PI * 2 / 180) + v2[0] * r * Math.sin(i * Math.PI * 2 / 180);
        var yp = p[1] + v1[1] * r * Math.cos(i * Math.PI * 2 / 180) + v2[1] * r * Math.sin(i * Math.PI * 2 / 180);
        var zp = p[2] + v1[2] * r * Math.cos(i * Math.PI * 2 / 180) + v2[2] * r * Math.sin(i * Math.PI * 2 / 180);
        circlePositions.push(xp, yp, zp);
    }
    drawLine(circlePositions, color=color);
}

/* Draw a (not necesarily straight) line given by a series of points.
 * Optionally allows for a color given as rgba value in [0.0, 1.0] range.
 * Positions should be an array of alternating x and y values as integers.
 * For example: drawLine([0, 0, 100, 100, 100, 0, 0, 0]) draws a line from (0,0) to (100, 100) to (100, 0) to (0, 0).
 */
function drawLine(positions, color = [1.0, 1.0, 1.0, 1.0]) {
    if (positions.length <= 2) {
        return;
    }
    
    // Set the color
    gl.uniform4fv(programInfo.uniformLocations.color, new Float32Array(color));
    
    // Set the shader to read 2 values of type FLOAT at a time from the buffer
    var numComponents = 2;
    if (positions.length % 3 == 0) {
        numComponents = 3;
    }
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    
    // Upload the line to the buffer
    const buffers = initBuffers(positions);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    
    // Draw the buffer as a line
    const vertexCount = positions.length / numComponents;
    gl.drawArrays(gl.LINE_STRIP, offset, vertexCount);
}

/* Creates a GL buffer for the given list of positions */
function initBuffers(positions) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    return {
        position: positionBuffer
    }
}

/* Listener for mouse movement */
function move(e) {
    // Find (x,y) location relative to canvas origin
    const x = e.x;
    const y = e.y;
    
    if (lastX == 0 || lastY == 0) {
        lastX = x;
        lastY = y;
    }
    
    dx = x - lastX;
    sx = 1;
    if (dx < 0) {
        dx *= -1;
        sx = -1;
    }
    
    dy = y - lastY;
    sy = 1;
    if (dy < 0) {
        dy *= -1;
        sy = -1;
    }
    
    rotationX += sx * Math.sqrt(dx) * 0.4;
    rotationY += sy * Math.sqrt(dy) * 0.4;
    
    lastX = x;
    lastY = y;
}

/*
 * Vertex Shader:
 * Translates an (x,y,z) pixel coordinate into [-1.0, 1.0]^3 space used by OpenGL
 *
 * aVertexPosition: the (x,y,z) pixel coordinate
 *
 * uClientWidth: the uniform value of the width of the canvas (in pixels)
 * uClientHeight: the uniform value of the height of the canvas (in pixels)
 */
const vsSource = `
    attribute vec4 aVertexPosition;
    uniform float uClientWidth;
    uniform float uClientHeight;
    void main() {
        float x = -1.0 + (2.0 * aVertexPosition[0] / uClientWidth);
        float y = 1.0 - (2.0 * aVertexPosition[1] / uClientHeight);
        float z = aVertexPosition[2] / uClientHeight;
        gl_Position = vec4(x, y, z, aVertexPosition.w);
    }
`;

/*
 * Fragment Shader:
 * Determines the color of a drawn pixel.
 *
 * Always returns solid whiteSpace
 */ 
const fsSource = `
    precision mediump float;
    uniform vec4 uColor;
    
    void main() {
        gl_FragColor = uColor * gl_FragCoord.z * gl_FragCoord.z;
    }
`;

/* Initialize the vertex and fragment shaders and link them to the program */
function initShaders(vsSource, fsSource) {
    const vsS = loadShader(gl.VERTEX_SHADER, vsSource);
    const fsS = loadShader(gl.FRAGMENT_SHADER, fsSource);
    
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vsS);
    gl.attachShader(shaderProgram, fsS);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    
    return shaderProgram;
}

/* Create and compile a shader of the given type using the given source code */
function loadShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}
