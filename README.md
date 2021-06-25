# WegGL_Tutorial

# WebGL Tutorial : Image Texture Mapping & Vedio Texture Mapping & Mouse Drag

### 소프트웨어학과 201823780 정석화

## 개요

컴퓨터 그래픽스라는 가상의 어떠한 그래픽을 만듬에 있어서 텍스쳐가 그 물체의 특징을 보다 효과적으로 표현할 수 있는 방법이라고 생각하며 가장 중요한 부분이라고 생각한다. 수업시간에 진행한 큐브에 사진을 텍스쳐로 사용하여 진행하는 것이 흥미롭게 느껴졌고 프로젝트를 이미 진행한 지난 프로젝들을 살펴보다가 두가지의 종류를 한번 합쳐서 구현해보고자 하여 진행하게 되었다. 고로 본 프로젝트는 이서현 학우와 이예빈 학우의 프로젝트를 참고하였고 코드도 참고하여 진행했음을 밝한다.



## 기능 설명
본 프로젝트는 큐브 형태의 모양에 이미지를 3x3 형태로 입히거나 동영상을 3x3의 형태로 입힐 수 있게 진행하였다.

* 버튼을 통한 Image Texture와 Vedio Texture 전환
* 비디오 재생, 소리 on/off  
* Texture warpping의 다양한 기능 적용 (REPEAT, CLAMP_TO_EDGE, MIRRORED_REPEAT)
* 마우스의 드래그로 큐브 회전

## 이슈
동영상을 하나를 업로드 하는데에는 해상도에는 문제가 되지 않았다. 그렇지만 3x3의 격자로 동영상을 삽입하려고 하였을 때는 해상도의 문제가 있었다. 직사각형이게 되면 CLAMP_TO_EDGE의 기능만 활성화가 되고 REPEAT, MIRRORED_REPEAT의 경우에는 화면이 그냥 검정색으로 나오는 경우가 생겼다. 그래서 동영상의 해상도를 1024x1024로 정사각형으로 변환을 해주니까 3x3에도 문제없이 동영상을 텍스쳐로 넣을 수 있었다.

## 프로젝트 상세 내용
### Texture Mapping
 텍스쳐 매핑은 컴퓨터 그래픽스 분야에서 가상의 3차원 물체의 표면에 세부적인 질감의 묘사를 하거나 색을 칠하는 기법이다. 일반적으로는 수식이나 2차원의 그림을 3차원 물체의 표면에 여러가지 방법을 통하여 적용하고 이에 따라 컴퓨터 그래픽 화면을 만들어 나갈 때 마치 실제의 물체처럼 느껴지게 끔 그 세부 묘사를 하는 것이다. 텍스쳐 매핑을 하는 방식의 하나인 UV mapping에 대해서 알아볼 것이다.


### UV Mapping
 UV Mapping은 수평적이고 수직적인 Coordinates, 즉 2D에 모델의 각 점들을 지정하는 것이다. 0~1까지의 값으로 변화를 준다. texture 이미지는 이런 공간적인 분배에 따라 만들어지게 되며, 때문에 모델의 각 점들의 texture는 UV map 점들의 위치에 따라 나오게 된다. 


### Code
#### Vertex Shader
<pre><code>var vertexShaderSource = `
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
</code></pre>
text Coordinate인 u,v를 선언한다.

#### Fragment Shader
<pre><code>var fragmentShaderSource = `
    varying mediump vec2 texCoord;
    uniform sampler2D sampler2d;
    void main(void) 
    { 
        gl_FragColor = texture2D(sampler2d, texCoord); 
    }`;
</code></pre>
text coordinate를 정의한다.


#### ImageTexture
<pre><code>function imageTexture(){
    var image = new Image();
    var NewImage = document.getElementById('NewImage')

    if(!temp) 
        image.src = "img.png";
    else
        image.src = NewImage.files[0].name


    NewImage.addEventListener('change', function () {
        image.src = NewImage.files[0].name
        temp ++;
    })

    image.addEventListener('load', function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    });
}
</code></pre>
이미지를 텍스쳐로 로드한다. 이미지 파일만 업로드 할 수 있다.이미 전의 것이 있을 경우 새로운 것으로 덮어쓴다.


#### VedioTexture
<pre><code>function videoTexture() {
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
</code></pre>
비디오를 텍스쳐로 로드한다. 비디오 파일만 업로드 할 수 있다. 이미 전의 것이 있을 경우 덮어쓴다. 비디오는 자동 실행된다. 소리는 처음엔 음소거로 나기때문에 나게하려면 버튼을 눌러 소리를 활성화 한다.

#### Texture Change
<pre><code>function textureChange() {
    if(textureCheck){
        video.play();
        textureCheck ^= 1;
    }
        
    else if(!textureCheck){
        textureCheck ^=1;
        video.pause();
        video.currentTime = 0;
    }
    else
        return;
}
</code></pre>
이미지 텍스쳐와 비디오 텍스쳐의 모드를 선택할 수 있다.


#### Vedio Function
<pre><code>function videoToggle(){
    if (video.paused && !textureCheck)
        video.play();
    else if(!video.paused&& !textureCheck)
        video.pause();
    else
        return;
}

function videoSound() {
    if(!textureCheck && video.muted){
        video.muted = false;
    }
    else if(!textureCheck && !video.muted){
        video.muted = true;
    }
    else
        return;
}
</code></pre>
각종 비디오의 기능들을 설정할 수 있다. 재생/정지, 소리 on/off 기능이 있다.


#### Mouse Status Call
<pre><code>function mouseCallbacks(){
    var canvas = document.getElementById("helloapicanvas");
    canvas.onmousedown = mouseDown;
    canvas.onmouseup = mouseUp;
    canvas.onmousemove = mouseMove;
}
</code></pre>
마우스의 상태가 변할시 관련 함수를 호출한다.


#### Mouse Function
<pre><code>function mouseDown(e){
    var x = e.offsetX;
    var y = e.offsetY;
    var rect = e.target.getBoundingClientRect();//사용하는 화면 좌표 값 구하기

    if(rect.left<=x && x<rect.right && rect.top <=y && y<rect.bottom){
        mouse.lastX = x;
        mouse.lastY = y;
        drag = true;
    }
}
</code></pre>

<pre><code>function mouseUp(e){
    drag = false;
}
</code></pre>

<pre><code>function mouseMove(e){
    var canvas = document.getElementById("helloapicanvas");
    
    var x = e.offsetX;
    var y = e.offsetY;

    if(drag){
        var factor = 5/canvas.height; 
        var dx = factor * (x-mouse.lastX); 
        var dy = factor * (y-mouse.lastY); 

        angle.x = angle.x + dy;
        angle.y = angle.y + dx;
    }
    mouse.lastX = x;
    mouse.lastY = y;
}
</code></pre>
마우스의 각 기능들을 구현하였다. 큐브를 마우스를 통해 움직일 수 있다.

#### Texture warpping
```    
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
```
## Result 
result directory에 업로드 (비디오도 이미지 파일로 결과 올림)

image_repeat 

image_clamp_to_edge

image_mirrored

vedio_repeat

vedio_clamp_to_edge

vedio_mirrored


## Review
프로젝트를 진행하면서 어려웠던 점은 동영상 텍스쳐를 넣을 때 CLAMP_TO_EDGE 기능만 활성화가 되고 나머지 기능으로 진행하면 검정색으로 나타나는 상황이 제일 힘들었다. 어떠한 이유인지는 잘 모르겠지만 정사각형의 형태로 해상도를 조절해야만 다양한 기능을 했을 때도 정상적으로 보여질 수 있었다. 이번 프로젝트를 진행하면서 텍스쳐를 입히는 주제로 공부를 해보며 더 깊이있게 배우는 시간이 된 것 같아서 좋았다.


## Copyright 
(CC-NC-BY) Jeong SeockHwa 2021


## Reference

https://git.ajou.ac.kr/hwan/webgl-tutorial/-/tree/master/student2020/good_project/201723274

https://git.ajou.ac.kr/bin/webgl-tutorial

https://heinleinsgame.tistory.com/9

https://m.blog.naver.com/PostView.naver?isHttpsRedirect=true&blogId=baekhyebin&logNo=220839471531
