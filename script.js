var gl;

var mouse = {
    lastX : 0,
    lastY : 0,
};
var angle = {
    x : 0,
    y : 0,
};
var drag = false;

function testGLError(functionLastCalled) {
    var lastError = gl.getError();

    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false;
    }
    return true;
}

function initialiseGL(canvas) {
    try {
        // Try to grab the standard context. If it fails, fallback to experimental
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    catch (e) {
    }

    if (!gl) {
        alert("Unable to initialise WebGL. Your browser may not support it");
        return false;
    }
    return true;
}

var vertexData = [
    // Backface -> z = 0.5
    -0.5, -0.5, -0.5,   0.0,  0.0,
    0.5,  0.5, -0.5,   1.0,  1.0,
    0.5, -0.5, -0.5,  1.0, -0.0,
    -0.5, -0.5, -0.5,  -0.0, -0.0,
    -0.5,  0.5, -0.5,  -0.0,  1.0,
    0.5,  0.5, -0.5,   1.0,  1.0,
    // Front  -> z = 0.5
    -0.5, -0.5,  0.5,  -0.0, -0.0,
    0.5,  0.5,  0.5,   1.0,  1.0,
    0.5, -0.5,  0.5,    1.0, -0.0,
    -0.5, -0.5,  0.5,  -0.0, -0.0,
    -0.5,  0.5,  0.5,   -0.0,  1.0,
    0.5,  0.5,  0.5,    1.0,  1.0,
    // LEFT  -> z = 0.5
    -0.5, -0.5, -0.5,  -0.0, -0.0,
    -0.5,  0.5,  0.5,  1.0,  1.0,
    -0.5,  0.5, -0.5,    1.0,  0.0,
    -0.5, -0.5, -0.5,   -0.0, -0.0,
    -0.5, -0.5,  0.5,   -0.0,  1.0,
    -0.5,  0.5,  0.5,   1.0,  1.0,
    // RIGHT  -> z = 0.5
    0.5, -0.5, -0.5,   -0.0, -0.0,
    0.5,  0.5,  0.5,   1.0,  1.0,
    0.5,  0.5, -0.5,    1.0,  0.0,
    0.5, -0.5, -0.5,   -0.0, -0.0,
    0.5, -0.5,  0.5,  -0.0,  1.0,
    0.5,  0.5,  0.5,   1.0,  1.0,
    // BOTTOM  -> z = 0.5
    -0.5, -0.5, -0.5,   -0.0, -0.0,
    0.5, -0.5,  0.5,    1.0,  1.0,
    0.5, -0.5, -0.5,    1.0,  0.0,
    -0.5, -0.5, -0.5,   -0.0, -0.0,
    -0.5, -0.5,  0.5,   -0.0,  1.0,
    0.5, -0.5,  0.5,    1.0,  1.0,
    // TOP  -> z = 0.5
    -0.5,  0.5, -0.5,   -0.0, -0.0,
    0.5,  0.5,  0.5,    1.0,  1.0,
    0.5,  0.5, -0.5,   1.0,  0.0,
    -0.5,  0.5, -0.5,   -0.0, -0.0,
    -0.5,  0.5,  0.5,   -0.0,  1.0,
    0.5,  0.5,  0.5,    1.0,  1.0
];

var video = document.createElement('video');

//동영상 설정 정리
video.autoplay = true; //동영상 로드 되면 자동 실행
video.loop = true; // 동영상 반복재생
video.muted = true; // 동영상 소리 off
video.src = 'wind.mp4';

var texture;

function initialiseBuffer() {

    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    texture = gl.createTexture();
		
	gl.bindTexture(gl.TEXTURE_2D, texture)
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //y축 뒤집기 -> 이미지나 동영상이 거꾸로 표시되지 않게 함
	
    //필터링
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    return testGLError("initialiseBuffers and texture initialize");
}

function initialiseShaders() {

    var fragmentShaderSource = `
			varying mediump vec2 texCoord;
			uniform sampler2D sampler2d;
			void main(void) 
			{ 
				gl_FragColor = texture2D(sampler2d, texCoord); 
			}`;

    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

    // Vertex shader code
    var vertexShaderSource = `
			attribute highp vec4 myVertex; 
			attribute highp vec2 myUV; 
			uniform mediump mat4 vmMat; 
			uniform mediump mat4 pMat; 
			varying mediump vec2 texCoord;
			void main(void)  
			{ 
				gl_Position = pMat * vmMat * myVertex; 
				texCoord = myUV*3.0; 
			}`;

    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource);
    gl.compileShader(gl.vertexShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    // Create the shader program
    gl.programObject = gl.createProgram();
    // Attach the fragment and vertex shaders to it
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader);
    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");
    gl.bindAttribLocation(gl.programObject, 1, "myUV");

    // Link the program
    gl.linkProgram(gl.programObject);
    // Check if linking succeeded in a similar way we checked for compilation errors
    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    gl.useProgram(gl.programObject);

    return testGLError("initialiseShaders");
}


var temp = 0;

// texture에 image copy
function imageTexture(){
    var image = new Image();
    var NewImage = document.getElementById('NewImage')

    if(!temp) {
        image.src = "img.png";
    }
    else{
        image.src = NewImage.files[0].name
    }

    //이미지 변경됐을 때
    NewImage.addEventListener('change', function () {
        image.src = NewImage.files[0].name
        temp ++;
    })

    image.addEventListener('load', function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    });

}

//기존 texture에 video를 copy
function videoTexture() {


    var NewVideo = document.getElementById('NewVideo')

    NewVideo.addEventListener('change', function () {
        video.src = NewVideo.files[0].name;
        video.play();

    })

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

}

//마우스의 상태 변화에 따라 해당 함수 호출
function mouseCallbacks(){
    var canvas = document.getElementById("helloapicanvas");
    canvas.onmousedown = mouseDown;
    canvas.onmouseup = mouseUp;
    canvas.onmousemove = mouseMove;
}

//마우스 버튼이 눌릴 때 발생
function mouseDown(e){
    //마우스 좌표 값
    var x = e.offsetX;
    var y = e.offsetY;
    var rect = e.target.getBoundingClientRect();//사용하는 화면 좌표 값 구하기

    //마우스가 canvas 안에 있는지 확인
    if(rect.left<=x && x<rect.right && rect.top <=y && y<rect.bottom){
        mouse.lastX = x;
        mouse.lastY = y;
        drag = true;
    }
}

//마우스 버튼 땔 때 발생
function mouseUp(e){
    drag = false;
}

//마우스 움직일 때 발생
function mouseMove(e){
    var canvas = document.getElementById("helloapicanvas");
    //마우스 좌표 값
    var x = e.offsetX;
    var y = e.offsetY;

    //마우스 클릭하고 있을 때 angle 계산
    if(drag){
        var factor = 5/canvas.height; //회전 속도
        var dx = factor * (x-mouse.lastX); //마우스의 움직임 - x축으로 얼마나 움직였는지
        var dy = factor * (y-mouse.lastY); //마우스의 움직임 - y축으로 얼마나 움직였는지

        angle.x = angle.x + dy;
        angle.y = angle.y + dx;
    }
    mouse.lastX = x;
    mouse.lastY = y;
}

var textureCheck = 1; //초기 값은 image texture

//image texture mapping 과 video texture mapping 선택
function textureChange() {
    //cube에 이미지 텍스쳐를 입혔을 때 버튼이 눌림
    //동영상을 재생한다.
    if(textureCheck){
        video.play();
        textureCheck ^= 1;
    }
    //cube에 동영상 텍스쳐를 입혔을 때 버튼이 눌림
    //이미지 텍스쳐를 입히기 전에 동영상을 멈추고, 원래 상태로 되돌린다.
    else if(!textureCheck){
        textureCheck ^=1;
        video.pause();
        video.currentTime = 0;
    }
    else
        return;
}

//video Play or Stop
function videoToggle(){
    //동영상이 멈춰있고 cube에 동영상 텍스쳐가 입혀져 있다면 동영상을 재생한다.
    if (video.paused && !textureCheck)
        video.play();
    //동영상이 재생 중이고 cube에 동영상 텍스쳐가 입혀져 있다면 동영상을 멈춘다.
    else if(!video.paused&& !textureCheck)
        video.pause();
    else
        return;
}

//video Sound on or off
function videoSound() {
    // cube에 동영상 텍스쳐가 입혀져 있고 소리가 꺼져있다면 소리를 켠다.
    if(!textureCheck && video.muted){
        video.muted = false;
    }
    // cube에 동영상 텍스쳐가 입혀져 있고 소리가 켜져있다면 소리를 끈다.
    else if(!textureCheck && !video.muted){
        video.muted = true;
    }
    else
        return;
}

function renderScene() {

    //textureCheck 변수 값에 맞게 image texture mapping 이나 video texture mapping을 진행한다.
    if(textureCheck){
        document.getElementById('NewImage').style.display ="block";
        document.getElementById('NewVideo').style.display = "none";
        imageTexture()
    }
	
    //video.readyState는 동영상의 로드 상태를 파악하는 프로퍼티로 4의 값을 가지면
    //재생 속도에 맞춰 동영상을 매끄럽게 재생할 수 있는 상태이다.
    else if(!textureCheck && video.readyState==4){
        document.getElementById('NewImage').style.display ="none";
        document.getElementById('NewVideo').style.display = "block";
        videoTexture()
    }
	var check_count = document.getElementsByName("wrap_s").length;
	var wS=gl.REPEAT ; var wT=gl.REPEAT;
	for (var i=0; i<check_count; i++) {
		if (document.getElementsByName("wrap_s")[i].checked == true) {
			if(i==0) wS=gl.REPEAT;
			else if(i==1) wS=gl.CLAMP_TO_EDGE;
			else wS=gl.MIRRORED_REPEAT;
		}
	}

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wS);

	var check_count = document.getElementsByName("wrap_t").length;

	for (var i=0; i<check_count; i++) {
		if (document.getElementsByName("wrap_t")[i].checked == true) {
			if(i==0) wT=gl.REPEAT;
			else if(i==1) wT=gl.CLAMP_TO_EDGE;
			else wT=gl.MIRRORED_REPEAT;
		}
	}

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wT);
	

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);										// Added for depth Test

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	// Added for depth Test
    gl.enable(gl.DEPTH_TEST);								// Added for depth Test

    var vmMatLocation = gl.getUniformLocation(gl.programObject, "vmMat");
    var pMatLocation = gl.getUniformLocation(gl.programObject, "pMat");

    var vmMat = [1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0];

    mat4.lookAt(vmMat, [0.0, 0.0, 2.0], [0.0,0.0,0.0], [0.0, 1.0, 0.0]);
    //마우스 움직임에 따라 회전
    mat4.rotate(vmMat,vmMat,angle.x,[1,0,0]);
    mat4.rotate(vmMat,vmMat,angle.y,[0,1,0]);

    var pMat = [];
    mat4.identity(pMat);
    mat4.perspective(pMat, 60*3.14/180, 800.0/600.0, 0.5, 5);

    gl.uniformMatrix4fv(vmMatLocation, gl.FALSE, vmMat );
    gl.uniformMatrix4fv(pMatLocation, gl.FALSE, pMat );

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 20, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, gl.FALSE, 20, 12);
	
	


    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }

    gl.drawArrays(gl.TRIANGLES, 0, 36);

    if (!testGLError("gl.drawArrays")) {
        return false;
    }

    return true;
}

function main() {
    var canvas = document.getElementById("helloapicanvas");

    if (!initialiseGL(canvas)) {
        return;
    }

    if (!initialiseBuffer()) {
        return;
    }

    if (!initialiseShaders()) {
        return;
    }
    mouseCallbacks();

    // renderScene();
    // Render loop
    requestAnimFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000, 60);
            };
    })();

    (function renderLoop() {
        if (renderScene()) {
            // Everything was successful, request that we redraw our scene again in the future
            requestAnimFrame(renderLoop);
        }
    })();
}
