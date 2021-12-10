function main() {
    //Access the canvas through DOM: Document Object Model
    var canvas = document.getElementById('myCanvas');   // The paper

    /**
   * @type {WebGLRenderingContext} gl
   */
    var gl = canvas.getContext('webgl');                // The brush and the paints

    // Define vertices data consisting of position and color properties
    var vertices = [...ver];
    var indices = [...ind];

    var cubeVertices = [...cubeVer];
    var cubeIndices = [...cubeInd];

    var planeVertices = [...planeVer];
    var planeIndices = [...planeInd];

    var uNormalModel;
    var vertexShaderSource;
    var vertexShader;
    var fragmentShaderSource;
    var fragmentShader;
    var aPosition;
    var aColor;
    var aNormal;
    var uView;
    var uProjection;
    var projection;
    var view;
    var camera;

    var uLightConstant;
    var uAmbientIntensity;
    var uLightPosition;
    var uNormalModel;
    var uViewerPosition;
    var uModel;

    function glasses() {
        // Create a linked-list for storing the vertices data
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Create a linked-list for storing the indices data
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        shader();
    }

    function cube() {
        var cubeVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);

        var cubeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
        shader();
    }

    function plane() {
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(planeVertices), gl.STATIC_DRAW);

        // Create a linked-list for storing the indices data
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(planeIndices), gl.STATIC_DRAW);
        shader();
    }

    function shader() {
        vertexShaderSource = `
            attribute vec3 aPosition;
            attribute vec3 aColor;
            attribute vec3 aNormal;
            varying vec3 vColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform mat4 uModel;
            uniform mat4 uView;
            uniform mat4 uProjection;
            void main() {
                gl_Position = uProjection * uView * uModel * (vec4(aPosition * 2. / 3., 1.));
                vColor = aColor;
                vNormal = aNormal;
                vPosition = (uModel * (vec4(aPosition * 2. / 3., 1.))).xyz;
            }
        `;

        fragmentShaderSource = `
            precision mediump float;
            varying vec3 vColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform vec3 uLightConstant;        // It represents the light color
            uniform float uAmbientIntensity;    // It represents the light intensity
            // uniform vec3 uLightDirection;
            uniform vec3 uLightPosition;
            uniform mat3 uNormalModel;
            uniform vec3 uViewerPosition;
            void main() {
                vec3 ambient = uLightConstant * uAmbientIntensity;
                // vec3 lightDirection = uLightDirection;
                vec3 lightDirection = uLightPosition - vPosition;
                vec3 normalizedLight = normalize(lightDirection);  // [2., 0., 0.] becomes a unit vector [1., 0., 0.]
                vec3 normalizedNormal = normalize(uNormalModel * vNormal);
                float cosTheta = dot(normalizedNormal, normalizedLight);
                vec3 diffuse = vec3(0., 0., 0.);
                if (cosTheta > 0.) {
                    float diffuseIntensity = cosTheta;
                    diffuse = uLightConstant * diffuseIntensity;
                }
                vec3 reflector = reflect(-lightDirection, normalizedNormal);
                vec3 normalizedReflector = normalize(reflector);
                vec3 normalizedViewer = normalize(uViewerPosition - vPosition);
                float cosPhi = dot(normalizedReflector, normalizedViewer);
                vec3 specular = vec3(0., 0., 0.);
                if (cosPhi > 0.) {
                    float shininessConstant = 100.0; 
                    float specularIntensity = pow(cosPhi, shininessConstant); 
                    specular = uLightConstant * specularIntensity;
                }
                vec3 phong = ambient + diffuse + specular;
                gl_FragColor = vec4(phong * vColor/255.0, 1.);
            }
        `;
        // Create .c in GPU
        vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);

        // Compile .c into .o
        gl.compileShader(vertexShader);
        gl.compileShader(fragmentShader);

        // Prepare a .exe shell (shader program)
        shaderProgram = gl.createProgram();

        // Put the two .o files into the shell
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);

        // Link the two .o files, so together they can be a runnable program/context.
        gl.linkProgram(shaderProgram);

        // Start using the context (analogy: start using the paints and the brushes)
        gl.useProgram(shaderProgram);

        // Teach the computer how to collect
        //  the positional values from ARRAY_BUFFER
        //  to each vertex being processed
        aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
        gl.vertexAttribPointer(
            aPosition,
            3,
            gl.FLOAT,
            false,
            9 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        gl.enableVertexAttribArray(aPosition);
        aColor = gl.getAttribLocation(shaderProgram, "aColor");
        gl.vertexAttribPointer(
            aColor,
            3,
            gl.FLOAT,
            false,
            9 * Float32Array.BYTES_PER_ELEMENT,
            6 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(aColor);
        aNormal = gl.getAttribLocation(shaderProgram, "aNormal");
        gl.vertexAttribPointer(
            aNormal,
            3,
            gl.FLOAT,
            false,
            9 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(aNormal);

        // Connect the uniform transformation matrices
        uModel = gl.getUniformLocation(shaderProgram, "uModel");
        uView = gl.getUniformLocation(shaderProgram, "uView");
        uProjection = gl.getUniformLocation(shaderProgram, "uProjection");

        // Set the projection matrix in the vertex shader
        projection = glMatrix.mat4.create();
        glMatrix.mat4.perspective(
            projection,
            Math.PI / 3,    // field of view
            1,              // ratio
            0.5,            // near clip
            10              // far clip
        );
        gl.uniformMatrix4fv(uProjection, false, projection);

        // Set the view matrix in the vertex shader
        view = glMatrix.mat4.create();
        camera = [0, 0, 7];
        glMatrix.mat4.lookAt(
            view,
            camera,      // camera position
            [0, 0, 0],      // the point where camera looks at
            [0, 1, 0]       // up vector of the camera
        );
        gl.uniformMatrix4fv(uView, false, view);

        // Define the lighting and shading
        uLightConstant = gl.getUniformLocation(shaderProgram, "uLightConstant");
        uAmbientIntensity = gl.getUniformLocation(shaderProgram, "uAmbientIntensity");
        gl.uniform3fv(uLightConstant, [1.0, 1, 1.0]);   // orange light
        gl.uniform1f(uAmbientIntensity, 1) // light intensity: 40%
        // var uLightDirection = gl.getUniformLocation(shaderProgram, "uLightDirection");
        // gl.uniform3fv(uLightDirection, [2.0, 0.0, 0.0]);    // light comes from the right side
        uLightPosition = gl.getUniformLocation(shaderProgram, "uLightPosition");
        // gl.uniform3fv(uLightPosition, [1.0, 1.0, 1.0]);
        uNormalModel = gl.getUniformLocation(shaderProgram, "uNormalModel");
        uViewerPosition = gl.getUniformLocation(shaderProgram, "uViewerPosition");
        gl.uniform3fv(uViewerPosition, camera);
    }

    function render() {
        // Reset the frame buffer
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0, 0.92156, 0.92156, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        cube();
        var model = glMatrix.mat4.create();
        glMatrix.mat4.translate(model, model, [0, 1.7, 0]);
        glMatrix.mat4.scale(model, model, [0.4, 0.4, 0.4]);
        gl.uniformMatrix4fv(uModel, false, model);
        var pos = glMatrix.vec3.create();
        pos = glMatrix.mat4.getTranslation(pos, model);
        gl.uniform3fv(uLightConstant, [1, 1, 1]);
        gl.uniform1f(uAmbientIntensity, 1);
        gl.uniform3fv(uLightPosition, pos);
        var normalModel = glMatrix.mat3.create();
        glMatrix.mat3.normalFromMat4(normalModel, model);
        gl.uniformMatrix3fv(uNormalModel, false, normalModel);
        gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);

        glasses();
        model = glMatrix.mat4.create();
        // Define a rotation matrix about x axis and store it to the model matrix
        glMatrix.mat4.rotate(model, model, -1.3, [1, 0, 0]);
        // Define a rotation matrix about y axis and store it to the model matrix
        glMatrix.mat4.rotate(model, model, 0, [0, 1, 0]);
        glMatrix.mat4.rotate(model, model, 1.6, [0, 0, 1]);
        // Define a translation matrix and store it to the model matrix
        glMatrix.mat4.translate(model, model, [0, 1.7, 0]);
        // var pos = glMatrix.vec3.create();
        // pos = glMatrix.mat4.getTranslation(pos, model);
        // gl.uniform3fv(uLightConstant, [1, 1, 1]);
        // gl.uniform1f(uAmbientIntensity, 0.431);
        // gl.uniform3fv(uLightPosition, pos);
        // Set the model matrix in the vertex shader
        gl.uniformMatrix4fv(uModel, false, model);
        // Set the model matrix for normal vector
        normalModel = glMatrix.mat3.create();
        glMatrix.mat3.normalFromMat4(normalModel, model);
        gl.uniformMatrix3fv(uNormalModel, false, normalModel);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        model = glMatrix.mat4.create();
        // Define a rotation matrix about x axis and store it to the model matrix
        glMatrix.mat4.rotate(model, model, -1.4, [1, 0, 0]);
        // Define a rotation matrix about y axis and store it to the model matrix
        glMatrix.mat4.rotate(model, model, 0, [0, 1, 0]);
        glMatrix.mat4.rotate(model, model, -1.8, [0, 0, 1]);
        // Define a translation matrix and store it to the model matrix
        glMatrix.mat4.translate(model, model, [0, 1.7, 0]);
        // var pos = glMatrix.vec3.create();
        // pos = glMatrix.mat4.getTranslation(pos, model);
        // gl.uniform3fv(uLightConstant, [1, 1, 1]);
        // gl.uniform1f(uAmbientIntensity, 0.431);
        // gl.uniform3fv(uLightPosition, pos);
        // Set the model matrix in the vertex shader
        gl.uniformMatrix4fv(uModel, false, model);
        normalModel = glMatrix.mat3.create();
        glMatrix.mat3.normalFromMat4(normalModel, model);
        gl.uniformMatrix3fv(uNormalModel, false, normalModel);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        plane();
        model = glMatrix.mat4.create();
        glMatrix.mat4.scale(model, model, [20, 20, 1]);
        glMatrix.mat4.rotate(model, model, -0.54, [1, 0, 0]);
        glMatrix.mat4.translate(model, model, [0, 0, -1]);
        gl.uniformMatrix4fv(uModel, false, model);
        // Set the model matrix in the vertex shader
        normalModel = glMatrix.mat3.create();
        glMatrix.mat3.normalFromMat4(normalModel, model);
        gl.uniformMatrix3fv(uNormalModel, false, normalModel);
        gl.drawElements(gl.TRIANGLES, planeIndices.length, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}