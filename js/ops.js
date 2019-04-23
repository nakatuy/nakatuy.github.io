"use strict";

var CABLES=CABLES||{};
CABLES.OPS=CABLES.OPS||{};

var Ops=Ops || {};
Ops.Gl=Ops.Gl || {};
Ops.Ui=Ops.Ui || {};
Ops.Math=Ops.Math || {};
Ops.Anim=Ops.Anim || {};
Ops.User=Ops.User || {};
Ops.Date=Ops.Date || {};
Ops.Html=Ops.Html || {};
Ops.Value=Ops.Value || {};
Ops.Trigger=Ops.Trigger || {};
Ops.Devices=Ops.Devices || {};
Ops.Sidebar=Ops.Sidebar || {};
Ops.Boolean=Ops.Boolean || {};
Ops.TimeLine=Ops.TimeLine || {};
Ops.Gl.Shader=Ops.Gl.Shader || {};
Ops.Gl.Meshes=Ops.Gl.Meshes || {};
Ops.Gl.Matrix=Ops.Gl.Matrix || {};
Ops.Gl.Textures=Ops.Gl.Textures || {};
Ops.User.nakatuy=Ops.User.nakatuy || {};
Ops.Devices.Mouse=Ops.Devices.Mouse || {};
Ops.Gl.TextureEffects=Ops.Gl.TextureEffects || {};



// **************************************************************
// 
// Ops.Gl.MainLoop
// 
// **************************************************************

Ops.Gl.MainLoop = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const fpsLimit=op.inValue("FPS Limit",0);
const trigger=op.outTrigger("trigger");
const width=op.outValue("width");
const height=op.outValue("height");
const reduceLoadingFPS=op.inValueBool("Reduce FPS loading");
const clear=op.inValueBool("Clear",true);
const fullscreen=op.inValueBool("Fullscreen Button",false);
const active=op.inValueBool("Active",true);
const hdpi=op.inValueBool("Hires Displays",false);

hdpi.onChange=function()
{
    if(hdpi.get()) op.patch.cgl.pixelDensity=window.devicePixelRatio;
        else op.patch.cgl.pixelDensity=1;
        
    op.patch.cgl.updateSize();
    if(CABLES.UI) gui.setLayout();
};


var cgl=op.patch.cgl;
var rframes=0;
var rframeStart=0;

if(!op.patch.cgl) op.uiAttr( { 'error': 'No webgl cgl context' } );

var identTranslate=vec3.create();
vec3.set(identTranslate, 0,0,0);
var identTranslateView=vec3.create();
vec3.set(identTranslateView, 0,0,-2);

fullscreen.onChange=updateFullscreenButton;
setTimeout(updateFullscreenButton,100);
var fsElement=null;

function updateFullscreenButton()
{
    function onMouseEnter()
    {
        if(fsElement)fsElement.style.display="block";
    }

    function onMouseLeave()
    {
        if(fsElement)fsElement.style.display="none";
    }
    
    op.patch.cgl.canvas.addEventListener('mouseleave', onMouseLeave);
    op.patch.cgl.canvas.addEventListener('mouseenter', onMouseEnter);

    if(fullscreen.get())
    {
        if(!fsElement) 
        {
            fsElement = document.createElement('div');

            var container = op.patch.cgl.canvas.parentElement;
            if(container)container.appendChild(fsElement);
    
            fsElement.addEventListener('mouseenter', onMouseEnter);
            fsElement.addEventListener('click', function(e)
            {
                if(CABLES.UI && !e.shiftKey) gui.cycleRendererSize();
                    else
                    {
                        cgl.fullScreen();
                    }
            });
        }

        fsElement.style.padding="10px";
        fsElement.style.position="absolute";
        fsElement.style.right="5px";
        fsElement.style.top="5px";
        fsElement.style.width="20px";
        fsElement.style.height="20px";
        // fsElement.style.opacity="1.0";
        fsElement.style.cursor="pointer";
        fsElement.style['border-radius']="40px";
        fsElement.style.background="#444";
        fsElement.style["z-index"]="9999";
        fsElement.style.display="none";
        fsElement.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 490 490" style="width:20px;height:20px;" xml:space="preserve" width="512px" height="512px"><g><path d="M173.792,301.792L21.333,454.251v-80.917c0-5.891-4.776-10.667-10.667-10.667C4.776,362.667,0,367.442,0,373.333V480     c0,5.891,4.776,10.667,10.667,10.667h106.667c5.891,0,10.667-4.776,10.667-10.667s-4.776-10.667-10.667-10.667H36.416     l152.459-152.459c4.093-4.237,3.975-10.99-0.262-15.083C184.479,297.799,177.926,297.799,173.792,301.792z" fill="#FFFFFF"/><path d="M480,0H373.333c-5.891,0-10.667,4.776-10.667,10.667c0,5.891,4.776,10.667,10.667,10.667h80.917L301.792,173.792     c-4.237,4.093-4.354,10.845-0.262,15.083c4.093,4.237,10.845,4.354,15.083,0.262c0.089-0.086,0.176-0.173,0.262-0.262     L469.333,36.416v80.917c0,5.891,4.776,10.667,10.667,10.667s10.667-4.776,10.667-10.667V10.667C490.667,4.776,485.891,0,480,0z" fill="#FFFFFF"/><path d="M36.416,21.333h80.917c5.891,0,10.667-4.776,10.667-10.667C128,4.776,123.224,0,117.333,0H10.667     C4.776,0,0,4.776,0,10.667v106.667C0,123.224,4.776,128,10.667,128c5.891,0,10.667-4.776,10.667-10.667V36.416l152.459,152.459     c4.237,4.093,10.99,3.975,15.083-0.262c3.992-4.134,3.992-10.687,0-14.82L36.416,21.333z" fill="#FFFFFF"/><path d="M480,362.667c-5.891,0-10.667,4.776-10.667,10.667v80.917L316.875,301.792c-4.237-4.093-10.99-3.976-15.083,0.261     c-3.993,4.134-3.993,10.688,0,14.821l152.459,152.459h-80.917c-5.891,0-10.667,4.776-10.667,10.667s4.776,10.667,10.667,10.667     H480c5.891,0,10.667-4.776,10.667-10.667V373.333C490.667,367.442,485.891,362.667,480,362.667z" fill="#FFFFFF"/></g></svg>';
    }
    else
    {
        if(fsElement)
        {
            fsElement.style.display="none";
            fsElement.remove();
            fsElement=null;
        }
    }
}


fpsLimit.onChange=function()
{
    op.patch.config.fpsLimit=fpsLimit.get()||0;
};

op.onDelete=function()
{
    cgl.gl.clearColor(0,0,0,0);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    op.patch.removeOnAnimFrame(op);
};


op.patch.loading.setOnFinishedLoading(function(cb)
{
    op.patch.config.fpsLimit=fpsLimit.get();
});



op.onAnimFrame=function(time)
{
    if(!active.get())return;
    if(cgl.aborted || cgl.canvas.clientWidth===0 || cgl.canvas.clientHeight===0)return;

    if(op.patch.loading.getProgress()<1.0 && reduceLoadingFPS.get())
    {
        op.patch.config.fpsLimit=5;
    }

    if(cgl.canvasWidth==-1)
    {
        cgl.setCanvas(op.patch.config.glCanvasId);
        return;
    }

    if(cgl.canvasWidth!=width.get() || cgl.canvasHeight!=height.get())
    {
        // cgl.canvasWidth=cgl.canvas.clientWidth;
        width.set(cgl.canvasWidth);
        // cgl.canvasHeight=cgl.canvas.clientHeight;
        height.set(cgl.canvasHeight);
    }

    if(CABLES.now()-rframeStart>1000)
    {
        CGL.fpsReport=CGL.fpsReport||[];
        if(op.patch.loading.getProgress()>=1.0 && rframeStart!==0)CGL.fpsReport.push(rframes);
        rframes=0;
        rframeStart=CABLES.now();
    }
    CGL.MESH.lastShader=null;
    CGL.MESH.lastMesh=null;

    cgl.renderStart(cgl,identTranslate,identTranslateView);

    if(clear.get())
    {
        cgl.gl.clearColor(0,0,0,1);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    }

    trigger.trigger();


    if(CGL.MESH.lastMesh)CGL.MESH.lastMesh.unBind();


    if(CGL.Texture.previewTexture)
    {
        if(!CGL.Texture.texturePreviewer) CGL.Texture.texturePreviewer=new CGL.Texture.texturePreview(cgl);
        CGL.Texture.texturePreviewer.render(CGL.Texture.previewTexture);
    }
    cgl.renderEnd(cgl);
    
    
    // cgl.printError('mainloop end');
    
    

    if(!cgl.frameStore.phong)cgl.frameStore.phong={};
    rframes++;
};


};

Ops.Gl.MainLoop.prototype = new CABLES.Op();
CABLES.OPS["b0472a1d-db16-4ba6-8787-f300fbdc77bb"]={f:Ops.Gl.MainLoop,objName:"Ops.Gl.MainLoop"};




// **************************************************************
// 
// Ops.Gl.Meshes.Circle
// 
// **************************************************************

Ops.Gl.Meshes.Circle = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const render=op.inTrigger("render");
const radius=op.inValue('radius',0.5);
const innerRadius=op.inValueSlider('innerRadius',0);
const segments=op.inValueInt('segments',40);
const percent=op.inValueSlider('percent',1);
const steps=op.inValue('steps',0);
const invertSteps=op.inValueBool('invertSteps',false);
const mapping=op.inValueSelect("mapping",['flat','round']);
const drawSpline=op.inValueBool("Spline",false);

const inDraw=op.inValueBool('Draw',true);
const trigger=op.outTrigger('trigger');
const geomOut=op.addOutPort(new CABLES.Port(op,"geometry",CABLES.OP_PORT_TYPE_OBJECT));


op.setPortGroup('Size',[radius,innerRadius]);
op.setPortGroup('Display',[percent,steps,invertSteps]);

mapping.set('flat');

mapping.onChange=
    segments.onChange=
    radius.onChange=
    innerRadius.onChange=
    percent.onChange=
    steps.onChange=
    invertSteps.onChange=
    drawSpline.onChange=calcLater;

geomOut.ignoreValueSerialize=true;
const cgl=op.patch.cgl;

var geom=new CGL.Geometry("circle");
var mesh=null;
var lastSegs=-1;

var oldPrim=0;
var shader=null;
var needsCalc=true;

op.preRender=
render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpNotInTextureEffect(op)) return;

    if(needsCalc)calc();
    shader=cgl.getShader();
    if(!shader)return;
    oldPrim=shader.glPrimitive;

    if(drawSpline.get()) shader.glPrimitive=cgl.gl.LINE_STRIP;

    if(inDraw.get())mesh.render(shader);
    trigger.trigger();

    shader.glPrimitive=oldPrim;
};

function calc()
{
    var segs=Math.max(3,Math.floor(segments.get()));

    geom.clear();

    var faces=[];
    var texCoords=[];
    var vertexNormals=[];
    var tangents=[];
    var biTangents=[];

    var i=0,degInRad=0;
    var oldPosX=0,oldPosY=0;
    var oldPosXTexCoord=0,oldPosYTexCoord=0;

    var oldPosXIn=0,oldPosYIn=0;
    var oldPosXTexCoordIn=0,oldPosYTexCoordIn=0;

    var posxTexCoordIn=0,posyTexCoordIn=0;
    var posxTexCoord=0,posyTexCoord=0;
    var posx=0,posy=0;

    var verts=[];

    if(drawSpline.get())
    {
        var lastX=0;
        var lastY=0;
        var tc=[];
        for (i=0; i <= segs*percent.get(); i++)
        {
            degInRad = (360/segs)*i*CGL.DEG2RAD;
            posx=Math.cos(degInRad)*radius.get();
            posy=Math.sin(degInRad)*radius.get();

            posyTexCoord=0.5;

            if(i>0)
            {
                verts.push(lastX);
                verts.push(lastY);
                verts.push(0);
                posxTexCoord=1.0-(i-1)/segs;

                tc.push(posxTexCoord,posyTexCoord);
            }
            verts.push(posx);
            verts.push(posy);
            verts.push(0);

            lastX=posx;
            lastY=posy;
        }
        geom.setPointVertices(verts);
    }
    else
    if(innerRadius.get()<=0)
    {

        for (i=0; i <= segs*percent.get(); i++)
        {
            degInRad = (360/segs)*i*CGL.DEG2RAD;
            posx=Math.cos(degInRad)*radius.get();
            posy=Math.sin(degInRad)*radius.get();

            if(mapping.get()=='flat')
            {
                posxTexCoord=(Math.cos(degInRad)+1.0)/2;
                posyTexCoord=1.0-(Math.sin(degInRad)+1.0)/2;
                posxTexCoordIn=0.5;
                posyTexCoordIn=0.5;
            }
            else if(mapping.get()=='round')
            {
                posxTexCoord=1.0-i/segs;
                posyTexCoord=0;
                posxTexCoordIn=posxTexCoord;
                posyTexCoordIn=1;
            }

            faces.push(
                      [posx,posy,0],
                      [oldPosX,oldPosY,0],
                      [0,0,0]
                      );

            texCoords.push(posxTexCoord,posyTexCoord,oldPosXTexCoord,oldPosYTexCoord,posxTexCoordIn,posyTexCoordIn);
            vertexNormals.push(0,0,1,0,0,1,0,0,1);
            tangents.push(1,0,0,1,0,0,1,0,0);
            biTangents.push(0,1,0,0,1,0,0,1,0);

            oldPosXTexCoord=posxTexCoord;
            oldPosYTexCoord=posyTexCoord;

            oldPosX=posx;
            oldPosY=posy;
        }

        geom=CGL.Geometry.buildFromFaces(faces);
        geom.vertexNormals=vertexNormals;
        geom.tangents=tangents;
        geom.biTangents=biTangents;
        geom.texCoords=texCoords;
    }
    else
    {
        var count=0;
        var numSteps=segs*percent.get();
        var pos=0;

        for (i=0; i <= numSteps; i++)
        {
            count++;

            degInRad = (360/segs)*i*CGL.DEG2RAD;
            posx=Math.cos(degInRad)*radius.get();
            posy=Math.sin(degInRad)*radius.get();

            var posxIn=Math.cos(degInRad)*innerRadius.get()*radius.get();
            var posyIn=Math.sin(degInRad)*innerRadius.get()*radius.get();

            if(mapping.get()=='round')
            {
                posxTexCoord=1.0-i/segs;
                posyTexCoord=0;
                posxTexCoordIn=posxTexCoord;
                posyTexCoordIn=1;
            }

            if(steps.get()===0.0 ||
                (count%parseInt(steps.get(),10)===0 && !invertSteps.get()) ||
                (count%parseInt(steps.get(),10)!==0 && invertSteps.get()) )
            {
                faces.push(
                        [posx,posy,0],
                        [oldPosX,oldPosY,0],
                        [posxIn,posyIn,0]
                        );

                faces.push(
                        [posxIn,posyIn,0],
                        [oldPosX,oldPosY,0],
                        [oldPosXIn,oldPosYIn,0]
                        );

                texCoords.push(
                    posxTexCoord,0,
                    oldPosXTexCoord,0,
                    posxTexCoordIn,1,

                    posxTexCoord,1,
                    oldPosXTexCoord,0,
                    oldPosXTexCoordIn,1);

                vertexNormals.push(
                    0,0,1,0,0,1,0,0,1,
                    0,0,1,0,0,1,0,0,1
                );
                tangents.push(
                    1,0,0,1,0,0,1,0,0,
                    1,0,0,1,0,0,1,0,0
                );
                biTangents.push(
                    0,1,0,0,1,0,0,1,0,
                    0,1,0,0,1,0,0,1,0
                );
            }

            oldPosXTexCoordIn=posxTexCoordIn;
            oldPosYTexCoordIn=posyTexCoordIn;

            oldPosXTexCoord=posxTexCoord;
            oldPosYTexCoord=posyTexCoord;

            oldPosX=posx;
            oldPosY=posy;

            oldPosXIn=posxIn;
            oldPosYIn=posyIn;
        }

        geom=CGL.Geometry.buildFromFaces(faces);
        geom.vertexNormals=vertexNormals;
        geom.tangents=tangents;
        geom.biTangents=biTangents;

        if(mapping.get()=='flat') geom.mapTexCoords2d();
            else geom.texCoords=texCoords;
    }

    geomOut.set(null);
    geomOut.set(geom);

    if(geom.vertices.length==0)return;
    if(mesh) mesh.dispose();
    mesh=null;
    mesh=new CGL.Mesh(cgl,geom);
    needsCalc=false;
}

function calcLater()
{
    needsCalc=true;
}

op.onDelete=function()
{
    if(mesh)mesh.dispose();
}

};

Ops.Gl.Meshes.Circle.prototype = new CABLES.Op();
CABLES.OPS["4db917cc-2cef-43f4-83d5-38c4572fe943"]={f:Ops.Gl.Meshes.Circle,objName:"Ops.Gl.Meshes.Circle"};




// **************************************************************
// 
// Ops.Gl.Shader.BasicMaterial
// 
// **************************************************************

Ops.Gl.Shader.BasicMaterial = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={shader_frag:"{{MODULES_HEAD}}\n\nIN vec2 texCoord;\n#ifdef HAS_TEXTURES\n    IN vec2 texCoordOrig;\n    #ifdef HAS_TEXTURE_DIFFUSE\n        UNI sampler2D tex;\n    #endif\n    #ifdef HAS_TEXTURE_OPACITY\n        UNI sampler2D texOpacity;\n   #endif\n#endif\nUNI float r;\nUNI float g;\nUNI float b;\nUNI float a;\n\nvoid main()\n{\n    {{MODULE_BEGIN_FRAG}}\n    vec4 col=vec4(r,g,b,a);\n\n    #ifdef HAS_TEXTURES\n        #ifdef HAS_TEXTURE_DIFFUSE\n\n           col=texture(tex,vec2(texCoord.x,(1.0-texCoord.y)));\n\n           #ifdef COLORIZE_TEXTURE\n               col.r*=r;\n               col.g*=g;\n               col.b*=b;\n           #endif\n        #endif\n\n        col.a*=a;\n        #ifdef HAS_TEXTURE_OPACITY\n            #ifdef TRANSFORMALPHATEXCOORDS\n                col.a*=texture(texOpacity,vec2(texCoordOrig.s,1.0-texCoordOrig.t)).g;\n            #endif\n            #ifndef TRANSFORMALPHATEXCOORDS\n                col.a*=texture(texOpacity,vec2(texCoord.s,1.0-texCoord.t)).g;\n            #endif\n       #endif\n\n    #endif\n\n    {{MODULE_COLOR}}\n\n    outColor = col;\n\n\n}\n",shader_vert:"{{MODULES_HEAD}}\n\nIN vec3 vPosition;\nIN vec3 attrVertNormal;\nIN vec2 attrTexCoord;\n\nOUT vec3 norm;\nOUT vec2 texCoord;\nOUT vec2 texCoordOrig;\n\nUNI mat4 projMatrix;\nUNI mat4 modelMatrix;\nUNI mat4 viewMatrix;\n\n#ifdef HAS_TEXTURES\n    #ifdef TEXTURE_REPEAT\n        UNI float diffuseRepeatX;\n        UNI float diffuseRepeatY;\n        UNI float texOffsetX;\n        UNI float texOffsetY;\n    #endif\n#endif\n\n\nvoid main()\n{\n    mat4 mMatrix=modelMatrix;\n    mat4 mvMatrix;\n    \n    texCoordOrig=attrTexCoord;\n    texCoord=attrTexCoord;\n    #ifdef HAS_TEXTURES\n        #ifdef TEXTURE_REPEAT\n            texCoord.x=texCoord.x*diffuseRepeatX+texOffsetX;\n            texCoord.y=texCoord.y*diffuseRepeatY+texOffsetY;\n        #endif\n    #endif\n\n    vec4 pos = vec4( vPosition, 1. );\n\n\n    #ifdef BILLBOARD\n       vec3 position=vPosition;\n       mvMatrix=viewMatrix*modelMatrix;\n\n       gl_Position = projMatrix * mvMatrix * vec4((\n           position.x * vec3(\n               mvMatrix[0][0],\n               mvMatrix[1][0],\n               mvMatrix[2][0] ) +\n           position.y * vec3(\n               mvMatrix[0][1],\n               mvMatrix[1][1],\n               mvMatrix[2][1]) ), 1.0);\n    #endif\n\n    {{MODULE_VERTEX_POSITION}}\n\n    #ifndef BILLBOARD\n        mvMatrix=viewMatrix * mMatrix;\n    #endif\n\n\n    #ifndef BILLBOARD\n        // gl_Position = projMatrix * viewMatrix * modelMatrix * pos;\n        gl_Position = projMatrix * mvMatrix * pos;\n    #endif\n}\n",};
const render=op.inTrigger("render");
const trigger=op.outTrigger("trigger");
const shaderOut=op.addOutPort(new CABLES.Port(op,"shader",CABLES.OP_PORT_TYPE_OBJECT));

shaderOut.ignoreValueSerialize=true;
const cgl=op.patch.cgl;


var shader=new CGL.Shader(cgl,'BasicMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.bindTextures=bindTextures;
shader.setSource(attachments.shader_vert,attachments.shader_frag);
shaderOut.set(shader);

render.onTriggered=doRender;

var textureOpacity=null;
var textureOpacityUniform=null;


function bindTextures()
{
    if(diffuseTexture.get()) cgl.setTexture(0, diffuseTexture.get().tex);
    if(textureOpacity.get()) cgl.setTexture(1, textureOpacity.get().tex);
}

op.preRender=function()
{
    shader.bind();
    doRender();
};

function doRender()
{
    if(!shader)return;

    cgl.setShader(shader);
    shader.bindTextures();

    trigger.trigger();

    cgl.setPreviousShader();
}


{
    // rgba colors
    var r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range',colorPick:'true' }));
    var g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range'}));
    var b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    var a=op.addInPort(new CABLES.Port(op,"a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range'}));

    a.uniform=new CGL.Uniform(shader,'f','a',a);
    b.uniform=new CGL.Uniform(shader,'f','b',b);
    r.uniform=new CGL.Uniform(shader,'f','r',r);
    g.uniform=new CGL.Uniform(shader,'f','g',g);


    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());
    a.set(1.0);

    op.setPortGroup('Color',[r,g,b,a]);

}

{
    // diffuse outTexture


    var diffuseTexture=op.inTexture("texture");
    var diffuseTextureUniform=null;
    shader.bindTextures=bindTextures;

    diffuseTexture.onChange=function()
    {
        if(diffuseTexture.get())
        {
            // if(diffuseTextureUniform!==null)return;
            // shader.addveUniform('texDiffuse');
            if(!shader.hasDefine('HAS_TEXTURE_DIFFUSE'))shader.define('HAS_TEXTURE_DIFFUSE');
            if(!diffuseTextureUniform)diffuseTextureUniform=new CGL.Uniform(shader,'t','texDiffuse',0);
            updateTexRepeat();
        }
        else
        {
            shader.removeUniform('texDiffuse');
            shader.removeDefine('HAS_TEXTURE_DIFFUSE');
            diffuseTextureUniform=null;
        }
    };



}

{
    // opacity texture
    textureOpacity=op.inTexture("textureOpacity");

    textureOpacity.onChange=function()
    {
        if(textureOpacity.get())
        {
            if(textureOpacityUniform!==null)return;
            shader.removeUniform('texOpacity');
            shader.define('HAS_TEXTURE_OPACITY');
            if(!textureOpacityUniform)textureOpacityUniform=new CGL.Uniform(shader,'t','texOpacity',1);
        }
        else
        {
            shader.removeUniform('texOpacity');
            shader.removeDefine('HAS_TEXTURE_OPACITY');
            textureOpacityUniform=null;
        }
    };

}

op.colorizeTexture=op.addInPort(new CABLES.Port(op,"colorizeTexture",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
op.colorizeTexture.set(false);
op.colorizeTexture.onChange=function()
{
    if(op.colorizeTexture.get()) shader.define('COLORIZE_TEXTURE');
        else shader.removeDefine('COLORIZE_TEXTURE');
};


op.doBillboard=op.addInPort(new CABLES.Port(op,"billboard",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
op.doBillboard.set(false);
op.doBillboard.onChange=function()
{
    if(op.doBillboard.get()) shader.define('BILLBOARD');
        else shader.removeDefine('BILLBOARD');
};

var texCoordAlpha=op.inValueBool("Opacity TexCoords Transform",false);

texCoordAlpha.onChange=function()
{
    if(texCoordAlpha.get()) shader.define('TRANSFORMALPHATEXCOORDS');
        else shader.removeDefine('TRANSFORMALPHATEXCOORDS');

};

var preMultipliedAlpha=op.addInPort(new CABLES.Port(op,"preMultiplied alpha",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));

function updateTexRepeat()
{
    if(!diffuseRepeatXUniform)
    {
        diffuseRepeatXUniform=new CGL.Uniform(shader,'f','diffuseRepeatX',diffuseRepeatX);
        diffuseRepeatYUniform=new CGL.Uniform(shader,'f','diffuseRepeatY',diffuseRepeatY);
        diffuseOffsetXUniform=new CGL.Uniform(shader,'f','texOffsetX',diffuseOffsetX);
        diffuseOffsetYUniform=new CGL.Uniform(shader,'f','texOffsetY',diffuseOffsetY);
    }

    diffuseRepeatXUniform.setValue(diffuseRepeatX.get());
    diffuseRepeatYUniform.setValue(diffuseRepeatY.get());
    diffuseOffsetXUniform.setValue(diffuseOffsetX.get());
    diffuseOffsetYUniform.setValue(diffuseOffsetY.get());
}


{
    // texture coords

    var diffuseRepeatX=op.addInPort(new CABLES.Port(op,"diffuseRepeatX",CABLES.OP_PORT_TYPE_VALUE));
    var diffuseRepeatY=op.addInPort(new CABLES.Port(op,"diffuseRepeatY",CABLES.OP_PORT_TYPE_VALUE));
    var diffuseOffsetX=op.addInPort(new CABLES.Port(op,"Tex Offset X",CABLES.OP_PORT_TYPE_VALUE));
    var diffuseOffsetY=op.addInPort(new CABLES.Port(op,"Tex Offset Y",CABLES.OP_PORT_TYPE_VALUE));

    op.setPortGroup('Transform Texture',[diffuseRepeatX,diffuseRepeatY,diffuseOffsetX,diffuseOffsetY]);

    diffuseRepeatX.onChange=updateTexRepeat;
    diffuseRepeatY.onChange=updateTexRepeat;
    diffuseOffsetY.onChange=updateTexRepeat;
    diffuseOffsetX.onChange=updateTexRepeat;

    var diffuseRepeatXUniform=null;
    var diffuseRepeatYUniform=null;
    var diffuseOffsetXUniform=null;
    var diffuseOffsetYUniform=null;

    shader.define('TEXTURE_REPEAT');


    diffuseOffsetX.set(0);
    diffuseOffsetY.set(0);
    diffuseRepeatX.set(1);
    diffuseRepeatY.set(1);
}


};

Ops.Gl.Shader.BasicMaterial.prototype = new CABLES.Op();
CABLES.OPS["85ae5cfa-5eca-4dd8-8b30-850ac34f7cd5"]={f:Ops.Gl.Shader.BasicMaterial,objName:"Ops.Gl.Shader.BasicMaterial"};




// **************************************************************
// 
// Ops.Gl.RandomCluster
// 
// **************************************************************

Ops.Gl.RandomCluster = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    exe=op.inTrigger("exe"),
    num=op.inValueInt("num"),
    seed=op.inValueFloat("random seed",1),
    round=op.inValueBool('round',false),
    size=op.inValueFloat("size",10),
    scaleX=op.inValueFloat("scaleX",1),
    scaleY=op.inValueFloat("scaleY",1),
    scaleZ=op.inValueFloat("scaleZ",1),
    trigger=op.outTrigger("trigger"),
    idx=op.outValue("index"),
    rnd=op.outValue("rnd"),
    rotX=op.inValueSlider("Rotate X",1),
    rotY=op.inValueSlider("Rotate Y",1),
    rotZ=op.inValueSlider("Rotate Z",1),
    scrollX=op.inValue("Scroll X",0);

op.setPortGroup("Area",[size,scaleX,scaleY,scaleZ]);
op.setPortGroup("Rotation",[rotX,rotY,rotZ]);
op.setPortGroup("Parameters",[num,round,seed]);
op.toWorkPortsNeedToBeLinked(exe,trigger);

const cgl=op.patch.cgl;
var randoms=[];
var origRandoms=[];
var randomsRot=[];
var randomsFloats=[];

var transVec=vec3.create();
var mat=mat4.create();

function doRender()
{
    // console.log(doRender);
    if(op.instanced(exe))return;

    if(CABLES.UI && CABLES.UI.renderHelper)
    {
        CABLES.GL_MARKER.drawCube(op,
            size.get()/2*scaleX.get(),
            size.get()/2*scaleY.get(),
            size.get()/2*scaleZ.get());
    }

    op.patch.instancing.pushLoop(randoms.length);

    if(scrollX.get()!=0)
    {
        for(var i=0;i<origRandoms.length;i++)
        {
            randoms[i][0]=origRandoms[i][0]+scrollX.get();
            randoms[i][0]=(randoms[i][0]%size.get())-(size.get()/2);
        }
    }

    for(var i=0;i<randoms.length;i++)
    {
        cgl.pushModelMatrix();

        mat4.translate(cgl.mMatrix,cgl.mMatrix, randoms[i]);

        if(randomsRot[i][0]) mat4.rotateX(cgl.mMatrix,cgl.mMatrix, randomsRot[i][0]);
        if(randomsRot[i][1]) mat4.rotateY(cgl.mMatrix,cgl.mMatrix, randomsRot[i][1]);
        if(randomsRot[i][2]) mat4.rotateZ(cgl.mMatrix,cgl.mMatrix, randomsRot[i][2]);

        idx.set(i);
        rnd.set(randomsFloats[i]);

        trigger.trigger();
        op.patch.instancing.increment();

        cgl.popModelMatrix();
    }
    op.patch.instancing.popLoop();

}

exe.onTriggered=doRender;

function getRandomPos()
{
    return vec3.fromValues(
        scaleX.get()*(Math.seededRandom()-0.5)*size.get(),
        scaleY.get()*(Math.seededRandom()-0.5)*size.get(),
        scaleZ.get()*(Math.seededRandom()-0.5)*size.get()
        );
}


function reset()
{
    randoms.length=0;
    randomsRot.length=0;
    randomsFloats.length=0;
    origRandoms.length=0;

    Math.randomSeed=seed.get();

    var makeRound=round.get();

    for(var i=0;i<num.get();i++)
    {
        randomsFloats.push(Math.seededRandom());

        var v=getRandomPos();

        if(makeRound)
            while(vec3.len(v)>size.get()/2)
                v=getRandomPos();

        origRandoms.push( [ v[0],v[1],v[2] ]);
        randoms.push(v);

        randomsRot.push(vec3.fromValues(
            Math.seededRandom()*360*CGL.DEG2RAD*rotX.get(),
            Math.seededRandom()*360*CGL.DEG2RAD*rotY.get(),
            Math.seededRandom()*360*CGL.DEG2RAD*rotZ.get()
            ));
    }
}

seed.onChange=reset;
num.onChange=reset;
size.onChange=reset;
scaleX.onChange=reset;
scaleZ.onChange=reset;
scaleY.onChange=reset;
round.onChange=reset;
rotX.onChange=reset;
rotY.onChange=reset;
rotZ.onChange=reset;

num.set(100);

};

Ops.Gl.RandomCluster.prototype = new CABLES.Op();
CABLES.OPS["ca3bc984-e596-48fb-b53d-502eb13979b0"]={f:Ops.Gl.RandomCluster,objName:"Ops.Gl.RandomCluster"};




// **************************************************************
// 
// Ops.Gl.Matrix.OrbitControls
// 
// **************************************************************

Ops.Gl.Matrix.OrbitControls = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const render=op.inTrigger("render");
const minDist=op.addInPort(new CABLES.Port(op,"min distance",CABLES.OP_PORT_TYPE_VALUE));
const maxDist=op.addInPort(new CABLES.Port(op,"max distance",CABLES.OP_PORT_TYPE_VALUE));

const minRotY=op.inValue("min rot y",0);
const maxRotY=op.inValue("max rot y",0);

// const minRotX=op.inValue("min rot x",0);
// const maxRotX=op.inValue("max rot x",0);

const initialRadius=op.inValue("initial radius",0);
const initialAxis=op.addInPort(new CABLES.Port(op,"initial axis y",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
const initialX=op.addInPort(new CABLES.Port(op,"initial axis x",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));

const mul=op.addInPort(new CABLES.Port(op,"mul",CABLES.OP_PORT_TYPE_VALUE));
const smoothness=op.inValueSlider("Smoothness",1.0);
const speedX=op.inValue("Speed X",1);
const speedY=op.inValue("Speed Y",1);



const active=op.inValueBool("Active",true);

const allowPanning=op.inValueBool("Allow Panning",true);
const allowZooming=op.inValueBool("Allow Zooming",true);
const allowRotation=op.inValueBool("Allow Rotation",true);
const restricted=op.inValueBool("restricted",true);
const pointerLock=op.inValueBool("Pointerlock",false);

const trigger=op.outTrigger("trigger");
const outRadius=op.outValue("radius");
const outYDeg=op.outValue("Rot Y");
const outXDeg=op.outValue("Rot X");

const inReset=op.inTriggerButton("Reset");

op.setPortGroup("Initial Values",[initialAxis,initialX,initialRadius]);
op.setPortGroup("Interaction",[mul,smoothness,speedX,speedY]);
op.setPortGroup("Boundaries",[minRotY,maxRotY,minDist,maxDist]);



mul.set(1);
minDist.set(0.05);
maxDist.set(99999);

inReset.onTriggered=reset;

const cgl=op.patch.cgl;
var eye=vec3.create();
var vUp=vec3.create();
var vCenter=vec3.create();
var viewMatrix=mat4.create();
var vOffset=vec3.create();

initialAxis.set(0.5);


var mouseDown=false;
var radius=5;
outRadius.set(radius);

var lastMouseX=0,lastMouseY=0;
var percX=0,percY=0;


vec3.set(vCenter, 0,0,0);
vec3.set(vUp, 0,1,0);

var tempEye=vec3.create();
var finalEye=vec3.create();
var tempCenter=vec3.create();
var finalCenter=vec3.create();

var px=0;
var py=0;

var divisor=1;
var element=null;
updateSmoothness();

op.onDelete=unbind;

var doLockPointer=false;

pointerLock.onChange=function()
{
    doLockPointer=pointerLock.get();
    console.log("doLockPointer",doLockPointer);
};

function reset()
{
    px=px%(Math.PI*2);
    py=py%(Math.PI*2);

    percX=(initialX.get()*Math.PI*2);
    percY=(initialAxis.get()-0.5);
    radius=initialRadius.get();
    eye=circlePos( percY );
}

function updateSmoothness()
{
    divisor=smoothness.get()*10+1.0;
}

smoothness.onChange=updateSmoothness;

var initializing=true;

function ip(val,goal)
{
    if(initializing)return goal;
    return val+(goal-val)/divisor;
}

var lastPy=0;
var lastPx=0;

render.onTriggered=function()
{
    cgl.pushViewMatrix();

    px=ip(px,percX);
    py=ip(py,percY);

    var degY=(py+0.5)*180;


    if(minRotY.get()!==0 && degY<minRotY.get())
    {
        degY=minRotY.get();
        py=lastPy;
    }
    else if(maxRotY.get()!==0 && degY>maxRotY.get())
    {
        degY=maxRotY.get();
        py=lastPy;
    }
    else
    {
        lastPy=py;
    }


    var degX=(px)*CGL.RAD2DEG;

    // if(minRotX.get()!==0 && degX<minRotX.get())
    // {
    //     degX=minRotX.get();
    //     px=lastPx;
    // }
    // else if(maxRotX.get()!==0 && degX>maxRotX.get())
    // {
    //     degX=maxRotX.get();
    //     px=lastPx;
    // }
    // else
    // {
    //     lastPx=px;
    // }



    outYDeg.set( degY );
    // outXDeg.set( (px)*180 );
    outXDeg.set( degX );


    circlePosi(eye, py );

    vec3.add(tempEye, eye, vOffset);
    vec3.add(tempCenter, vCenter, vOffset);

    finalEye[0]=ip(finalEye[0],tempEye[0]);
    finalEye[1]=ip(finalEye[1],tempEye[1]);
    finalEye[2]=ip(finalEye[2],tempEye[2]);

    finalCenter[0]=ip(finalCenter[0],tempCenter[0]);
    finalCenter[1]=ip(finalCenter[1],tempCenter[1]);
    finalCenter[2]=ip(finalCenter[2],tempCenter[2]);

    mat4.lookAt(viewMatrix, finalEye, finalCenter, vUp);
    mat4.rotate(viewMatrix, viewMatrix, px, vUp);
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,viewMatrix);

    trigger.trigger();
    cgl.popViewMatrix();
    initializing=false;
};

function circlePosi(vec,perc)
{
    const mmul=mul.get();
    if(radius<minDist.get()*mmul)radius=minDist.get()*mmul;
    if(radius>maxDist.get()*mmul)radius=maxDist.get()*mmul;

    outRadius.set(radius*mmul);

    var i=0,degInRad=0;
    // var vec=vec3.create();
    degInRad = 360*perc/2*CGL.DEG2RAD;
    vec3.set(vec,
        Math.cos(degInRad)*radius*mmul,
        Math.sin(degInRad)*radius*mmul,
        0);
    return vec;
}


function circlePos(perc)
{
    const mmul=mul.get();
    if(radius<minDist.get()*mmul)radius=minDist.get()*mmul;
    if(radius>maxDist.get()*mmul)radius=maxDist.get()*mmul;

    outRadius.set(radius*mmul);

    var i=0,degInRad=0;
    var vec=vec3.create();
    degInRad = 360*perc/2*CGL.DEG2RAD;
    vec3.set(vec,
        Math.cos(degInRad)*radius*mmul,
        Math.sin(degInRad)*radius*mmul,
        0);
    return vec;
}

function onmousemove(event)
{
    if(!mouseDown) return;

    var x = event.clientX;
    var y = event.clientY;

    var movementX=(x-lastMouseX);
    var movementY=(y-lastMouseY);

    if(doLockPointer)
    {
        movementX=event.movementX*mul.get();
        movementY=event.movementY*mul.get();
    }

    movementX*=speedX.get();
    movementY*=speedY.get();

    if(event.which==3 && allowPanning.get())
    {
        vOffset[2]+=movementX*0.01*mul.get();
        vOffset[1]+=movementY*0.01*mul.get();
    }
    else
    if(event.which==2 && allowZooming.get())
    {
        radius+=movementY*0.05;
        eye=circlePos(percY);
    }
    else
    {
        if(allowRotation.get())
        {
            percX+=movementX*0.003;
            percY+=movementY*0.002;

            if(restricted.get())
            {
                if(percY>0.5)percY=0.5;
                if(percY<-0.5)percY=-0.5;
            }
        }
    }

    lastMouseX=x;
    lastMouseY=y;
}

function onMouseDown(event)
{
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    mouseDown=true;

    if(doLockPointer)
    {
        var el=op.patch.cgl.canvas;
        el.requestPointerLock = el.requestPointerLock || el.mozRequestPointerLock || el.webkitRequestPointerLock;
        if(el.requestPointerLock) el.requestPointerLock();
        else console.log("no t found");
        // document.addEventListener("mousemove", onmousemove, false);

        document.addEventListener('pointerlockchange', lockChange, false);
        document.addEventListener('mozpointerlockchange', lockChange, false);
        document.addEventListener('webkitpointerlockchange', lockChange, false);
    }
}

function onMouseUp()
{
    mouseDown=false;
    // cgl.canvas.style.cursor='url(/ui/img/rotate.png),pointer';

    if(doLockPointer)
    {
        document.removeEventListener('pointerlockchange', lockChange, false);
        document.removeEventListener('mozpointerlockchange', lockChange, false);
        document.removeEventListener('webkitpointerlockchange', lockChange, false);

        if(document.exitPointerLock) document.exitPointerLock();
        document.removeEventListener("mousemove", pointerLock, false);
    }
}

function lockChange()
{
    var el=op.patch.cgl.canvas;

    if (document.pointerLockElement === el || document.mozPointerLockElement === el || document.webkitPointerLockElement === el)
    {
        document.addEventListener("mousemove", onmousemove, false);
        console.log("listening...");
    }
}

function onMouseEnter(e)
{
    // cgl.canvas.style.cursor='url(/ui/img/rotate.png),pointer';
}

initialRadius.onChange=function()
{
    radius=initialRadius.get();
    reset();
};

initialX.onChange=function()
{
    px=percX=(initialX.get()*Math.PI*2);
};

initialAxis.onChange=function()
{
    py=percY=(initialAxis.get()-0.5);
    eye=circlePos(percY);
};

var onMouseWheel=function(event)
{
    if(allowZooming.get())
    {
        var delta=CGL.getWheelSpeed(event)*0.06;
        radius+=(parseFloat(delta))*1.2;

        eye=circlePos(percY);
        event.preventDefault();
    }
};

var ontouchstart=function(event)
{
    doLockPointer=false;
    if(event.touches && event.touches.length>0) onMouseDown(event.touches[0]);
};

var ontouchend=function(event)
{
    doLockPointer=false;
    onMouseUp();
};

var ontouchmove=function(event)
{
    doLockPointer=false;
    if(event.touches && event.touches.length>0) onmousemove(event.touches[0]);
};

active.onChange=function()
{
    if(active.get())bind();
        else unbind();
}


function setElement(ele)
{
    unbind();
    element=ele;
    bind();
}

function bind()
{
    element.addEventListener('mousemove', onmousemove);
    element.addEventListener('mousedown', onMouseDown);
    element.addEventListener('mouseup', onMouseUp);
    element.addEventListener('mouseleave', onMouseUp);
    element.addEventListener('mouseenter', onMouseEnter);
    element.addEventListener('contextmenu', function(e){e.preventDefault();});
    element.addEventListener('wheel', onMouseWheel);

    element.addEventListener('touchmove', ontouchmove);
    element.addEventListener('touchstart', ontouchstart);
    element.addEventListener('touchend', ontouchend);
}

function unbind()
{
    if(!element)return;

    element.removeEventListener('mousemove', onmousemove);
    element.removeEventListener('mousedown', onMouseDown);
    element.removeEventListener('mouseup', onMouseUp);
    element.removeEventListener('mouseleave', onMouseUp);
    element.removeEventListener('mouseenter', onMouseUp);
    element.removeEventListener('wheel', onMouseWheel);

    element.removeEventListener('touchmove', ontouchmove);
    element.removeEventListener('touchstart', ontouchstart);
    element.removeEventListener('touchend', ontouchend);
}

eye=circlePos(0);
setElement(cgl.canvas);


bind();

initialX.set(0.25);
initialRadius.set(0.05);


};

Ops.Gl.Matrix.OrbitControls.prototype = new CABLES.Op();
CABLES.OPS["eaf4f7ce-08a3-4d1b-b9f4-ebc0b7b1cde1"]={f:Ops.Gl.Matrix.OrbitControls,objName:"Ops.Gl.Matrix.OrbitControls"};




// **************************************************************
// 
// Ops.Gl.Matrix.Transform
// 
// **************************************************************

Ops.Gl.Matrix.Transform = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    render=op.inTrigger("render"),
    posX=op.inValue("posX",0),
    posY=op.inValue("posY",0),
    posZ=op.inValue("posZ",0),
    scale=op.inValue("scale",1),
    rotX=op.inValue("rotX",0),
    rotY=op.inValue("rotY",0),
    rotZ=op.inValue("rotZ",0),
    trigger=op.outTrigger("trigger");

op.setPortGroup('Rotation',[rotX,rotY,rotZ]);
op.setPortGroup('Position',[posX,posY,posZ]);
op.setPortGroup('Scale',[scale]);
op.setUiAxisPorts(posX,posY,posZ);

const cgl=op.patch.cgl;
var vPos=vec3.create();
var vScale=vec3.create();
var transMatrix = mat4.create();
mat4.identity(transMatrix);

var
    doScale=false,
    doTranslate=false,
    translationChanged=true,
    scaleChanged=true,
    rotChanged=true;

rotX.onChange=rotY.onChange=rotZ.onChange=setRotChanged;
posX.onChange=posY.onChange=posZ.onChange=setTranslateChanged;
scale.onChange=setScaleChanged;

render.onTriggered=function()
{
    // if(!CGL.TextureEffect.checkOpNotInTextureEffect(op)) return;

    var updateMatrix=false;
    if(translationChanged)
    {
        updateTranslation();
        updateMatrix=true;
    }
    if(scaleChanged)
    {
        updateScale();
        updateMatrix=true;
    }
    if(rotChanged) updateMatrix=true;

    if(updateMatrix) doUpdateMatrix();

    cgl.pushModelMatrix();
    mat4.multiply(cgl.mMatrix,cgl.mMatrix,transMatrix);

    trigger.trigger();
    cgl.popModelMatrix();

    if(CABLES.UI && gui.patch().isCurrentOp(op))
        gui.setTransformGizmo(
            {
                posX:posX,
                posY:posY,
                posZ:posZ,
            });
};

op.transform3d=function()
{
    return { pos:[posX,posY,posZ] };
};

function doUpdateMatrix()
{
    mat4.identity(transMatrix);
    if(doTranslate)mat4.translate(transMatrix,transMatrix, vPos);

    if(rotX.get()!==0)mat4.rotateX(transMatrix,transMatrix, rotX.get()*CGL.DEG2RAD);
    if(rotY.get()!==0)mat4.rotateY(transMatrix,transMatrix, rotY.get()*CGL.DEG2RAD);
    if(rotZ.get()!==0)mat4.rotateZ(transMatrix,transMatrix, rotZ.get()*CGL.DEG2RAD);

    if(doScale)mat4.scale(transMatrix,transMatrix, vScale);
    rotChanged=false;
}

function updateTranslation()
{
    doTranslate=false;
    if(posX.get()!==0.0 || posY.get()!==0.0 || posZ.get()!==0.0) doTranslate=true;
    vec3.set(vPos, posX.get(),posY.get(),posZ.get());
    translationChanged=false;
}

function updateScale()
{
    // doScale=false;
    // if(scale.get()!==0.0)
    doScale=true;
    vec3.set(vScale, scale.get(),scale.get(),scale.get());
    scaleChanged=false;
}

function setTranslateChanged()
{
    translationChanged=true;
}

function setScaleChanged()
{
    scaleChanged=true;
}

function setRotChanged()
{
    rotChanged=true;
}

doUpdateMatrix();




};

Ops.Gl.Matrix.Transform.prototype = new CABLES.Op();
CABLES.OPS["650baeb1-db2d-4781-9af6-ab4e9d4277be"]={f:Ops.Gl.Matrix.Transform,objName:"Ops.Gl.Matrix.Transform"};




// **************************************************************
// 
// Ops.Html.HyperLink
// 
// **************************************************************

Ops.Html.HyperLink = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var exec=op.inTrigger("open");
var inUrl=op.inValueString("URL","http://cables.gl");

exec.onTriggered=function()
{
    document.location.href=inUrl.get();
    
};

};

Ops.Html.HyperLink.prototype = new CABLES.Op();





// **************************************************************
// 
// Ops.Sequence
// 
// **************************************************************

Ops.Sequence = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const exe=op.inTrigger("exe");
const exes=[];
const triggers=[];
const num=16;
exe.onTriggered=triggerAll;

function triggerAll()
{
    for(var i=0;i<triggers.length;i++) triggers[i].trigger();
}

for(var i=0;i<num;i++)
{
    triggers.push( op.addOutPort(new CABLES.Port(op,"trigger "+i,CABLES.OP_PORT_TYPE_FUNCTION)) );
    
    if(i<num-1)
    {
        var newExe=op.addInPort(new CABLES.Port(op,"exe "+i,CABLES.OP_PORT_TYPE_FUNCTION));
        newExe.onTriggered=triggerAll;
        exes.push( newExe );
    }
}


};

Ops.Sequence.prototype = new CABLES.Op();
CABLES.OPS["a466bc1f-06e9-4595-8849-bffb9fe22f99"]={f:Ops.Sequence,objName:"Ops.Sequence"};




// **************************************************************
// 
// Ops.Gl.Meshes.FullscreenRectangle
// 
// **************************************************************

Ops.Gl.Meshes.FullscreenRectangle = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={shader_frag:"\nUNI sampler2D tex;\nIN vec2 texCoord;\n\nvoid main()\n{\n   outColor= texture(tex,vec2(texCoord.x,(1.0-texCoord.y)));\n}\n",shader_vert:"{{MODULES_HEAD}}\n\nIN vec3 vPosition;\nUNI mat4 projMatrix;\nUNI mat4 mvMatrix;\n\nOUT vec2 texCoord;\nIN vec2 attrTexCoord;\n\nvoid main()\n{\n   vec4 pos=vec4(vPosition,  1.0);\n\n   texCoord=attrTexCoord;\n\n   gl_Position = projMatrix * mvMatrix * pos;\n}\n",};
const
    render=op.inTrigger('render'),
    centerInCanvas=op.inValueBool("Center in Canvas"),
    flipY=op.inValueBool("Flip Y"),
    inTexture=op.inTexture("Texture"),
    trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
var mesh=null;
var geom=new CGL.Geometry("fullscreen rectangle");
var x=0,y=0,z=0,w=0,h=0;

centerInCanvas.onChange=rebuild;
flipY.onChange=rebuild;

var shader=null;
render.onTriggered=doRender;

op.toWorkPortsNeedToBeLinked(render);

inTexture.onChange=function()
{
    var tex=inTexture.get();
    // shader=null;
    if(tex && !shader)
    {
        shader=new CGL.Shader(cgl,'fullscreenrectangle');
        shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

        shader.setSource(attachments.shader_vert,attachments.shader_frag);
        shader.fullscreenRectUniform=new CGL.Uniform(shader,'t','tex',0);
    }

    if(!tex)
    {
        shader=null;
    }
};

op.preRender=function()
{
    if(shader)shader.bind();
    if(mesh)mesh.render(shader);
    doRender();
};

function doRender()
{
    if( cgl.getViewPort()[2]!=w || cgl.getViewPort()[3]!=h ) rebuild();

    cgl.pushPMatrix();
    mat4.identity(cgl.pMatrix);
    mat4.ortho(cgl.pMatrix, 0, w,h, 0, -10.0, 1000);

    cgl.pushModelMatrix();
    mat4.identity(cgl.mMatrix);

    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);

    if(centerInCanvas.get())
    {
        var x=0;
        var y=0;
        if(w<cgl.canvasWidth) x=(cgl.canvasWidth-w)/2;
        if(h<cgl.canvasHeight) y=(cgl.canvasHeight-h)/2;

        cgl.setViewPort(x,y,w,h);
    }

    if(shader)
    {
        if(inTexture.get())
        {
            cgl.setTexture(0,inTexture.get().tex);
            // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inTexture.get().tex);
        }

        mesh.render(shader);
    }
    else
    {
        mesh.render(cgl.getShader());
    }

    cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();

    trigger.trigger();
}


function rebuild()
{
    const currentViewPort=cgl.getViewPort();
    if(currentViewPort[2]==w && currentViewPort[3]==h)return;

    var xx=0,xy=0;

    w=currentViewPort[2];
    h=currentViewPort[3];

    geom.vertices = new Float32Array([
         xx+w, xy+h,  0.0,
         xx,   xy+h,  0.0,
         xx+w, xy,    0.0,
         xx,   xy,    0.0
    ]);

    if(flipY.get())
        geom.setTexCoords( new Float32Array([
             1.0, 0.0,
             0.0, 0.0,
             1.0, 1.0,
             0.0, 1.0
        ]));
    else
        geom.setTexCoords(new Float32Array([
             1.0, 1.0,
             0.0, 1.0,
             1.0, 0.0,
             0.0, 0.0
        ]));

    geom.verticesIndices = new Float32Array([
        2, 1, 0,
        3, 1, 2
    ]);


    geom.vertexNormals=new Float32Array([
        0,0,1,
        0,0,1,
        0,0,1,
        0,0,1,
        ]);
    geom.tangents=new Float32Array([
        -1,0,0,
        -1,0,0,
        -1,0,0,
        -1,0,0]);
    geom.biTangents==new Float32Array([
        0,-1,0,
        0,-1,0,
        0,-1,0,
        0,-1,0]);

                // norms.push(0,0,1);
                // tangents.push(-1,0,0);
                // biTangents.push(0,-1,0);


    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);
}


};

Ops.Gl.Meshes.FullscreenRectangle.prototype = new CABLES.Op();
CABLES.OPS["255bd15b-cc91-4a12-9b4e-53c710cbb282"]={f:Ops.Gl.Meshes.FullscreenRectangle,objName:"Ops.Gl.Meshes.FullscreenRectangle"};




// **************************************************************
// 
// Ops.Gl.TextureEffects.Blur
// 
// **************************************************************

Ops.Gl.TextureEffects.Blur = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={blur_frag:"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float dirX;\nUNI float dirY;\nUNI float amount;\n\n#ifdef HAS_MASK\n    UNI sampler2D imageMask;\n#endif\n\nfloat random(vec3 scale, float seed)\n{\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main()\n{\n    vec4 color = vec4(0.0);\n    float total = 0.0;\n\n    float am=amount;\n    #ifdef HAS_MASK\n        am=amount*texture(imageMask,texCoord).r;\n        if(am<=0.02)\n        {\n            outColor=texture(tex, texCoord);\n            return;\n        }\n    #endif\n\n   vec2 delta=vec2(dirX*am*0.01,dirY*am*0.01);\n\n\n    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\n    #ifdef MOBILE\n        offset = 0.1;\n    #endif\n\n    #if defined(FASTBLUR) && !defined(MOBILE)\n        const float range=5.0;\n    #else\n        const float range=20.0;\n    #endif\n\n    for (float t = -range; t <= range; t+=1.0)\n    {\n        float percent = (t + offset - 0.5) / range;\n        float weight = 1.0 - abs(percent);\n        vec4 smpl = texture(tex, texCoord + delta * percent);\n\n        smpl.rgb *= smpl.a;\n\n        color += smpl * weight;\n        total += weight;\n    }\n\n    outColor= color / total;\n\n    outColor.rgb /= outColor.a + 0.00001;\n\n\n\n}\n",};
const render=op.inTrigger('render');
const trigger=op.outTrigger('trigger');
const amount=op.inValueFloat("amount");
const direction=op.inValueSelect("direction",['both','vertical','horizontal'],'both');
const fast=op.inValueBool("Fast",true);
const cgl=op.patch.cgl;

amount.set(10);

var shader=new CGL.Shader(cgl);

shader.define("FASTBLUR");

fast.onChange=function()
{
    if(fast.get()) shader.define("FASTBLUR");
    else shader.removeDefine("FASTBLUR");
};

shader.setSource(shader.getDefaultVertexShader(),attachments.blur_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniDirX=new CGL.Uniform(shader,'f','dirX',0);
var uniDirY=new CGL.Uniform(shader,'f','dirY',0);

var uniWidth=new CGL.Uniform(shader,'f','width',0);
var uniHeight=new CGL.Uniform(shader,'f','height',0);

var uniAmount=new CGL.Uniform(shader,'f','amount',amount.get());
amount.onValueChange(function(){ uniAmount.setValue(amount.get()); });

var textureAlpha=new CGL.Uniform(shader,'t','imageMask',1);



var dir=0;

direction.onValueChange(function()
{
    if(direction.get()=='both')dir=0;
    if(direction.get()=='horizontal')dir=1;
    if(direction.get()=='vertical')dir=2;
});

var mask=op.inTexture("mask");

mask.onChange=function()
{
    if(mask.get() && mask.get().tex) shader.define('HAS_MASK');
        else shader.removeDefine('HAS_MASK');
};



render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    // first pass
    if(dir===0 || dir==2)
    {

        cgl.currentTextureEffect.bind();
        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );


        if(mask.get() && mask.get().tex)
        {
            cgl.setTexture(1, mask.get().tex );
            // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, mask.get().tex );
        }


        uniDirX.setValue(0.0);
        uniDirY.setValue(1.0);

        cgl.currentTextureEffect.finish();
    }

    // second pass
    if(dir===0 || dir==1)
    {

        cgl.currentTextureEffect.bind();
        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );


        if(mask.get() && mask.get().tex)
        {
            cgl.setTexture(1, mask.get().tex );
            // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, mask.get().tex );
        }

        uniDirX.setValue(1.0);
        uniDirY.setValue(0.0);

        cgl.currentTextureEffect.finish();
    }

    cgl.setPreviousShader();
    trigger.trigger();
};


};

Ops.Gl.TextureEffects.Blur.prototype = new CABLES.Op();
CABLES.OPS["54f26f53-f637-44c1-9bfb-a2f2b722e998"]={f:Ops.Gl.TextureEffects.Blur,objName:"Ops.Gl.TextureEffects.Blur"};




// **************************************************************
// 
// Ops.Gl.TextureEffects.DrawImage
// 
// **************************************************************

Ops.Gl.TextureEffects.DrawImage = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={drawimage_frag:"#ifdef HAS_TEXTURES\n  IN vec2 texCoord;\n  UNI sampler2D tex;\n  UNI sampler2D image;\n#endif\n\nIN mat3 transform;\nUNI float rotate;\n{{BLENDCODE}}\n\n#ifdef HAS_TEXTUREALPHA\n   UNI sampler2D imageAlpha;\n#endif\n\nUNI float amount;\n\nvoid main()\n{\n   vec4 blendRGBA=vec4(0.0,0.0,0.0,1.0);\n   #ifdef HAS_TEXTURES\n       vec2 tc=texCoord;\n\n       #ifdef TEX_FLIP_X\n           tc.x=1.0-tc.x;\n       #endif\n       #ifdef TEX_FLIP_Y\n           tc.y=1.0-tc.y;\n       #endif\n\n       #ifdef TEX_TRANSFORM\n           vec3 coordinates=vec3(tc.x, tc.y,1.0);\n           tc=(transform * coordinates ).xy;\n       #endif\n\n       blendRGBA=texture(image,tc);\n\n       vec3 blend=blendRGBA.rgb;\n       vec4 baseRGBA=texture(tex,texCoord);\n       vec3 base=baseRGBA.rgb;\n\n       vec3 colNew=_blend(base,blend);\n\n       #ifdef REMOVE_ALPHA_SRC\n           blendRGBA.a=1.0;\n       #endif\n\n       #ifdef HAS_TEXTUREALPHA\n           vec4 colImgAlpha=texture(imageAlpha,texCoord);\n           float colImgAlphaAlpha=colImgAlpha.a;\n\n           #ifdef ALPHA_FROM_LUMINANCE\n               vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), colImgAlpha.rgb ));\n               colImgAlphaAlpha=(gray.r+gray.g+gray.b)/3.0;\n           #endif\n\n           blendRGBA.a=colImgAlphaAlpha*blendRGBA.a;\n           \n           #ifdef INVERT_ALPHA\n           blendRGBA.a=1.0-blendRGBA.a;\n           #endif\n       #endif\n\n\n   #endif\n\n   blendRGBA.rgb=mix( colNew, base ,1.0-blendRGBA.a*amount);\n   blendRGBA.a=1.0;\n\n\n   outColor= blendRGBA;\n}",drawimage_vert:"IN vec3 vPosition;\nIN vec2 attrTexCoord;\nIN vec3 attrVertNormal;\nOUT vec2 texCoord;\nOUT vec3 norm;\nUNI mat4 projMatrix;\nUNI mat4 mvMatrix;\n\nUNI float posX;\nUNI float posY;\nUNI float scale;\nUNI float rotate;\n\nOUT mat3 transform;\n\nvoid main()\n{\n    texCoord=attrTexCoord;\n    norm=attrVertNormal;\n\n    #ifdef TEX_TRANSFORM\n    vec3 coordinates=vec3(attrTexCoord.x, attrTexCoord.y,1.0);\n    float angle = radians( rotate );\n    vec2 scale= vec2(scale,scale);\n    vec2 translate= vec2(posX,posY);\n\n    transform = mat3(   scale.x * cos( angle ), scale.x * sin( angle ), 0.0,\n                        - scale.y * sin( angle ), scale.y * cos( angle ), 0.0,\n                        - 0.5 * scale.x * cos( angle ) + 0.5 * scale.y * sin( angle ) - 0.5 * translate.x*2.0 + 0.5,  - 0.5 * scale.x * sin( angle ) - 0.5 * scale.y * cos( angle ) - 0.5 * translate.y*2.0 + 0.5, 1.0);\n    #endif\n\n    gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);\n}",};
var render=op.inTrigger('render');
var amount=op.addInPort(new CABLES.Port(op,"amount",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var blendMode=CGL.TextureEffect.AddBlendSelect(op,"blendMode");

var image=op.addInPort(new CABLES.Port(op,"image",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true }));

var imageAlpha=op.addInPort(new CABLES.Port(op,"imageAlpha",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true }));
var alphaSrc=op.inValueSelect("alphaSrc",['alpha channel','luminance']);
var removeAlphaSrc=op.addInPort(new CABLES.Port(op,"removeAlphaSrc",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));

var invAlphaChannel=op.addInPort(new CABLES.Port(op,"invert alpha channel",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));


var trigger=op.outTrigger('trigger');

op.toWorkPortsNeedToBeLinked(image);


blendMode.set('normal');
var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'drawimage');

amount.set(1.0);

render.onTriggered=doRender;

var srcFrag=attachments.drawimage_frag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());

shader.setSource(attachments.drawimage_vert,srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','image',1);
var textureAlpha=new CGL.Uniform(shader,'t','imageAlpha',2);

invAlphaChannel.onChange=function()
{
    if(invAlphaChannel.get()) shader.define('INVERT_ALPHA');
        else shader.removeDefine('INVERT_ALPHA');
};

removeAlphaSrc.onChange=function()
{
    if(removeAlphaSrc.get()) shader.define('REMOVE_ALPHA_SRC');
        else shader.removeDefine('REMOVE_ALPHA_SRC');
};
removeAlphaSrc.set(true);

alphaSrc.onChange=function()
{
    if(alphaSrc.get()=='luminance') shader.define('ALPHA_FROM_LUMINANCE');
        else shader.removeDefine('ALPHA_FROM_LUMINANCE');
};

alphaSrc.set("alpha channel");


{
    //
    // texture flip
    //
    var flipX=op.addInPort(new CABLES.Port(op,"flip x",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
    var flipY=op.addInPort(new CABLES.Port(op,"flip y",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));

    flipX.onChange=function()
    {
        if(flipX.get()) shader.define('TEX_FLIP_X');
            else shader.removeDefine('TEX_FLIP_X');
    };

    flipY.onChange=function()
    {
        if(flipY.get()) shader.define('TEX_FLIP_Y');
            else shader.removeDefine('TEX_FLIP_Y');
    };
}

{
    //
    // texture transform
    //
    var scale=op.addInPort(new CABLES.Port(op,"scale",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    var posX=op.addInPort(new CABLES.Port(op,"pos x",CABLES.OP_PORT_TYPE_VALUE, {}));
    var posY=op.addInPort(new CABLES.Port(op,"pos y",CABLES.OP_PORT_TYPE_VALUE, {}));
    var rotate=op.addInPort(new CABLES.Port(op,"rotate",CABLES.OP_PORT_TYPE_VALUE, {}));

    scale.set(1.0);

    var uniScale=new CGL.Uniform(shader,'f','scale',scale.get());
    var uniPosX=new CGL.Uniform(shader,'f','posX',posX.get());
    var uniPosY=new CGL.Uniform(shader,'f','posY',posY.get());
    var uniRotate=new CGL.Uniform(shader,'f','rotate',rotate.get());

    function updateTransform()
    {
        if(scale.get()!=1.0 || posX.get()!=0.0 || posY.get()!=0.0 || rotate.get()!=0.0 )
        {
            if(!shader.hasDefine('TEX_TRANSFORM')) shader.define('TEX_TRANSFORM');
            uniScale.setValue( parseFloat(scale.get()) );
            uniPosX.setValue( posX.get() );
            uniPosY.setValue( posY.get() );
            uniRotate.setValue( rotate.get() );
        }
        else
        {
            // shader.removeDefine('TEX_TRANSFORM');
        }
    }

    scale.onChange=updateTransform;
    posX.onChange=updateTransform;
    posY.onChange=updateTransform;
    rotate.onChange=updateTransform;
}

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);


var amountUniform=new CGL.Uniform(shader,'f','amount',amount);
var oldHadImageAlpha=false;

function doRender()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    if(imageAlpha.get() && !oldHadImageAlpha || !imageAlpha.get() && oldHadImageAlpha)
    {
        if(imageAlpha.get() && imageAlpha.get().tex)
        {
            shader.define('HAS_TEXTUREALPHA');
            oldHadImageAlpha=true;
        }
        else
        {
            shader.removeDefine('HAS_TEXTUREALPHA');
            oldHadImageAlpha=false;
        }
    }

    if(image.get() && image.get().tex && amount.get()>0.0)
    {
        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

        if(image.get() && image.get().tex) cgl.setTexture(1, image.get().tex );
            else cgl.setTexture(1, null);

        if(imageAlpha.get() && imageAlpha.get().tex) cgl.setTexture(2, imageAlpha.get().tex );
            else cgl.setTexture(2,null);

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    trigger.trigger();
}



};

Ops.Gl.TextureEffects.DrawImage.prototype = new CABLES.Op();
CABLES.OPS["8248b866-9492-48c8-897d-3097c6fe6fe8"]={f:Ops.Gl.TextureEffects.DrawImage,objName:"Ops.Gl.TextureEffects.DrawImage"};




// **************************************************************
// 
// Ops.Gl.TextureEffects.ImageCompose
// 
// **************************************************************

Ops.Gl.TextureEffects.ImageCompose = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const render=op.inTrigger("render");
const useVPSize=op.addInPort(new CABLES.Port(op,"use viewport size",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
const width=op.inValueInt("width");
const height=op.inValueInt("height");

const tfilter=op.inValueSelect("filter",['nearest','linear','mipmap'],"linear");
const twrap=op.inValueSelect("wrap",['clamp to edge','repeat','mirrored repeat']);
const fpTexture=op.inValueBool("HDR");

const trigger=op.outTrigger("trigger");
const texOut=op.outTexture("texture_out");

const bgAlpha=op.inValueSlider("Background Alpha",1);
const outRatio=op.outValue("Aspect Ratio");

op.setPortGroup("Texture Size",[useVPSize,width,height]);
op.setPortGroup("Texture Settings",[twrap,tfilter,fpTexture]);



texOut.set(null);
var cgl=op.patch.cgl;
var effect=null;
var tex=null;

var w=8,h=8;
var prevViewPort=[0,0,0,0];
var reInitEffect=true;

var bgFrag=''
    .endl()+'uniform float a;'
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   outColor= vec4(0.0,0.0,0.0,a);'
    .endl()+'}';
var bgShader=new CGL.Shader(cgl,'imgcompose bg');
bgShader.setSource(bgShader.getDefaultVertexShader(),bgFrag);
var uniBgAlpha=new CGL.Uniform(bgShader,'f','a',bgAlpha);

var selectedFilter=CGL.Texture.FILTER_LINEAR;
var selectedWrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;

function initEffect()
{
    if(effect)effect.delete();
    if(tex)tex.delete();

    effect=new CGL.TextureEffect(cgl,{"isFloatingPointTexture":fpTexture.get()});

    tex=new CGL.Texture(cgl,
        {
            "name":"image compose",
            "isFloatingPointTexture":fpTexture.get(),
            "filter":selectedFilter,
            "wrap":selectedWrap,
            "width": Math.ceil(width.get()),
            "height": Math.ceil(height.get()),
        });

    effect.setSourceTexture(tex);
    texOut.set(null);
    // texOut.set(effect.getCurrentSourceTexture());

    reInitEffect=false;

    // op.log("reinit effect");
    // tex.printInfo();
}

fpTexture.onChange=function()
{
    reInitEffect=true;
};

function updateResolution()
{
    if(!effect)initEffect();

    if(useVPSize.get())
    {
        w=cgl.getViewPort()[2];
        h=cgl.getViewPort()[3];
    }
    else
    {
        w=Math.ceil(width.get());
        h=Math.ceil(height.get());
    }

    if((w!=tex.width || h!= tex.height) && (w!==0 && h!==0))
    {
        height.set(h);
        width.set(w);
        tex.setSize(w,h);
        outRatio.set(w/h);
        effect.setSourceTexture(tex);
        texOut.set(null);
        texOut.set(tex);
    }

    if(texOut.get())
        if(!texOut.get().isPowerOfTwo() )
        {
            if(!op.uiAttribs.hint)
                op.uiAttr(
                    {
                        hint:'texture dimensions not power of two! - texture filtering will not work.',
                        warning:null
                    });
        }
        else
        if(op.uiAttribs.hint)
        {
            op.uiAttr({hint:null,warning:null}); //todo only when needed...
        }

}


function updateSizePorts()
{
    if(useVPSize.get())
    {
        width.setUiAttribs({greyout:true});
        height.setUiAttribs({greyout:true});
    }
    else
    {
        width.setUiAttribs({greyout:false});
        height.setUiAttribs({greyout:false});
    }
}


useVPSize.onChange=function()
{
    updateSizePorts();
    if(useVPSize.get())
    {
        width.onChange=null;
        height.onChange=null;
    }
    else
    {
        width.onChange=updateResolution;
        height.onChange=updateResolution;
    }
    updateResolution();

};


op.preRender=function()
{
    doRender();
    bgShader.bind();
};


var doRender=function()
{
    if(!effect || reInitEffect)
    {
        initEffect();
    }
    var vp=cgl.getViewPort();
    prevViewPort[0]=vp[0];
    prevViewPort[1]=vp[1];
    prevViewPort[2]=vp[2];
    prevViewPort[3]=vp[3];


    cgl.gl.blendFunc(cgl.gl.SRC_ALPHA, cgl.gl.ONE_MINUS_SRC_ALPHA);
    // cgl.gl.blendFunc(cgl.gl.SRC_ALPHA,cgl.gl.ONE_MINUS_SRC_ALPHA);



    updateResolution();

    cgl.currentTextureEffect=effect;
    effect.setSourceTexture(tex);

    effect.startEffect();

    // render background color...
    cgl.setShader(bgShader);
    cgl.currentTextureEffect.bind();
    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();

    texOut.set(effect.getCurrentSourceTexture());
    // texOut.set(effect.getCurrentTargetTexture());


    // if(effect.getCurrentSourceTexture.filter==CGL.Texture.FILTER_MIPMAP)
    // {
    //         this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_2D, effect.getCurrentSourceTexture.tex);
    //         effect.getCurrentSourceTexture.updateMipMap();
    //     // else
    //     // {
    //     //     this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_2D, this._textureSource.tex);;
    //     //     this._textureSource.updateMipMap();
    //     // }

    //     this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_2D, null);
    // }

    effect.endEffect();

    cgl.setViewPort(prevViewPort[0],prevViewPort[1],prevViewPort[2],prevViewPort[3]);


    cgl.gl.blendFunc(cgl.gl.SRC_ALPHA,cgl.gl.ONE_MINUS_SRC_ALPHA);

    cgl.currentTextureEffect=null;
};


function onWrapChange()
{
    if(twrap.get()=='repeat') selectedWrap=CGL.Texture.WRAP_REPEAT;
    if(twrap.get()=='mirrored repeat') selectedWrap=CGL.Texture.WRAP_MIRRORED_REPEAT;
    if(twrap.get()=='clamp to edge') selectedWrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reInitEffect=true;
    updateResolution();
}

twrap.set('clamp to edge');
twrap.onChange=onWrapChange;

function onFilterChange()
{
    if(tfilter.get()=='nearest') selectedFilter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear')  selectedFilter=CGL.Texture.FILTER_LINEAR;
    if(tfilter.get()=='mipmap')  selectedFilter=CGL.Texture.FILTER_MIPMAP;

    reInitEffect=true;
    updateResolution();
    // effect.setSourceTexture(tex);
    // updateResolution();
}

tfilter.set('linear');
tfilter.onChange=onFilterChange;

useVPSize.set(true);
render.onTriggered=doRender;

width.set(640);
height.set(360);
updateSizePorts();

};

Ops.Gl.TextureEffects.ImageCompose.prototype = new CABLES.Op();
CABLES.OPS["5c04608d-1e42-4e36-be00-1be4a81fc309"]={f:Ops.Gl.TextureEffects.ImageCompose,objName:"Ops.Gl.TextureEffects.ImageCompose"};




// **************************************************************
// 
// Ops.Gl.Texture
// 
// **************************************************************

Ops.Gl.Texture = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var filename=op.inFile("file");
var tfilter=op.inValueSelect("filter",['nearest','linear','mipmap']);
var wrap=op.inValueSelect("wrap",['repeat','mirrored repeat','clamp to edge'],"clamp to edge");
var flip=op.inValueBool("flip",false);
var unpackAlpha=op.inValueBool("unpackPreMultipliedAlpha",false);

var textureOut=op.outTexture("texture");
var width=op.outValue("width");
var height=op.outValue("height");
var loading=op.outValue("loading");
var ratio=op.outValue("Aspect Ratio");

unpackAlpha.hidePort();

const cgl=op.patch.cgl;
var cgl_filter=0;
var cgl_wrap=0;

filename.onChange=flip.onChange=function(){reloadSoon();};

tfilter.onChange=onFilterChange;
wrap.onChange=onWrapChange;
unpackAlpha.onChange=function(){ reloadSoon(); };

var timedLoader=0;

tfilter.set('mipmap');
wrap.set('repeat');

textureOut.set(CGL.Texture.getEmptyTexture(cgl));

var setTempTexture=function()
{
    var t=CGL.Texture.getTempTexture(cgl);
    textureOut.set(t);
};

var loadingId=null;
var tex=null;
function reloadSoon(nocache)
{
    // if(!loadingId)loadingId=cgl.patch.loading.start('textureOp',filename.get());

    // if(timedLoader!=0)
    // {
    //     console.log('tex load canceled...');
    // }
    clearTimeout(timedLoader);
    timedLoader=setTimeout(function()
    {
        // console.log('tex load yay...');
        realReload(nocache);
    },30);
}

function realReload(nocache)
{
    if(!loadingId)loadingId=cgl.patch.loading.start('textureOp',filename.get());

    var url=op.patch.getFilePath(String(filename.get()));
    if(nocache)url+='?rnd='+CABLES.generateUUID();

    if((filename.get() && filename.get().length>1))
    {
        loading.set(true);

        if(tex)tex.delete();
        tex=CGL.Texture.load(cgl,url,
            function(err)
            {
                if(err)
                {
                    setTempTexture();
                    op.uiAttr({'error':'could not load texture "'+filename.get()+'"'});
                    cgl.patch.loading.finished(loadingId);
                    return;
                }
                else op.uiAttr({'error':null});
                textureOut.set(tex);
                width.set(tex.width);
                height.set(tex.height);
                ratio.set(tex.width/tex.height);

                if(!tex.isPowerOfTwo()) op.uiAttr(
                    {
                        hint:'texture dimensions not power of two! - texture filtering will not work.',
                        warning:null
                    });
                    else op.uiAttr(
                        {
                            hint:null,
                            warning:null
                        });

                textureOut.set(null);
                textureOut.set(tex);
                // tex.printInfo();

            },{
                wrap:cgl_wrap,
                flip:flip.get(),
                unpackAlpha:unpackAlpha.get(),
                filter:cgl_filter
            });

        textureOut.set(null);
        textureOut.set(tex);

        if(!textureOut.get() && nocache)
        {
        }

        cgl.patch.loading.finished(loadingId);
    }
    else
    {
        cgl.patch.loading.finished(loadingId);
        setTempTexture();
    }
}


function onFilterChange()
{
    if(tfilter.get()=='nearest') cgl_filter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear') cgl_filter=CGL.Texture.FILTER_LINEAR;
    if(tfilter.get()=='mipmap') cgl_filter=CGL.Texture.FILTER_MIPMAP;

    reloadSoon();
}

function onWrapChange()
{
    if(wrap.get()=='repeat') cgl_wrap=CGL.Texture.WRAP_REPEAT;
    if(wrap.get()=='mirrored repeat') cgl_wrap=CGL.Texture.WRAP_MIRRORED_REPEAT;
    if(wrap.get()=='clamp to edge') cgl_wrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reloadSoon();
}

op.onFileChanged=function(fn)
{
    console.log(fn);
    if(filename.get() && filename.get().indexOf(fn)>-1)
    {
        textureOut.set(null);
        textureOut.set(CGL.Texture.getTempTexture(cgl));

        realReload(true);
    }
};







};

Ops.Gl.Texture.prototype = new CABLES.Op();
CABLES.OPS["466394d4-6c1a-4e5d-a057-0063ab0f096a"]={f:Ops.Gl.Texture,objName:"Ops.Gl.Texture"};




// **************************************************************
// 
// Ops.Gl.Render2Texture
// 
// **************************************************************

Ops.Gl.Render2Texture = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var cgl=op.patch.cgl;

var render=op.inTrigger('render');
var useVPSize=op.addInPort(new CABLES.Port(op,"use viewport size",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));

var width=op.inValueInt("texture width");
var height=op.inValueInt("texture height");
var tfilter=op.addInPort(new CABLES.Port(op,"filter",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));

var msaa=op.inValueSelect("MSAA",["none","2x","4x","8x"],"none");
var trigger=op.outTrigger('trigger');
// var tex=op.addOutPort(new CABLES.Port(op,"texture",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true}));
// var texDepth=op.addOutPort(new CABLES.Port(op,"textureDepth",CABLES.OP_PORT_TYPE_TEXTURE));

var tex=op.outTexture("texture");
var texDepth=op.outTexture("textureDepth");

var fpTexture=op.inValueBool("HDR");
var depth=op.inValueBool("Depth",true);
var clear=op.inValueBool("Clear",true);

var fb=null;

width.set(512);
height.set(512);
useVPSize.set(true);
tfilter.set('linear');
var reInitFb=true;

op.setPortGroup('Alignment',[useVPSize,width,height,tfilter]);


// todo why does it only work when we render a mesh before>?>?????
// only happens with matcap material with normal map....

useVPSize.onChange=updateVpSize;
function updateVpSize()
{
    if(useVPSize.get())
    {
        width.setUiAttribs({greyout:true});
        height.setUiAttribs({greyout:true});
    }
    else
    {
        width.setUiAttribs({greyout:false});
        height.setUiAttribs({greyout:false});
    }
}

fpTexture.onChange=function()
{
    reInitFb=true;
};

depth.onChange=function()
{
    reInitFb=true;
};

clear.onChange=function()
{
    reInitFb=true;
};

var onFilterChange=function()
{
    reInitFb=true;
};

msaa.onChange=function()
{
    reInitFb=true;
};

function doRender()
{
    if(!fb || reInitFb)
    {
        if(fb) fb.delete();
        if(cgl.glVersion>=2)
        {
            var ms=true;
            var msSamples=4;

            if(msaa.get()=="none")
            {
                msSamples=0;
                ms=false;
            }
            if(msaa.get()=="2x")msSamples=2;
            if(msaa.get()=="4x")msSamples=4;
            if(msaa.get()=="8x")msSamples=8;

            fb=new CGL.Framebuffer2(cgl,8,8,
            {
                isFloatingPointTexture:fpTexture.get(),
                multisampling:ms,
                depth:depth.get(),
                multisamplingSamples:msSamples,
                clear:clear.get()
            });
        }
        else
        {
            fb=new CGL.Framebuffer(cgl,8,8,{isFloatingPointTexture:fpTexture.get()});
        }

        if(tfilter.get()=='nearest') fb.setFilter(CGL.Texture.FILTER_NEAREST);
            else if(tfilter.get()=='linear') fb.setFilter(CGL.Texture.FILTER_LINEAR);
            else if(tfilter.get()=='mipmap') fb.setFilter(CGL.Texture.FILTER_MIPMAP);


        texDepth.set( fb.getTextureDepth() );
        reInitFb=false;
    }

    if(useVPSize.val)
    {
        width.set( cgl.getViewPort()[2] );
        height.set( cgl.getViewPort()[3] );
    }

    if(fb.getWidth()!=Math.ceil(width.get()) || fb.getHeight()!=Math.ceil(height.get()) )
    {
        fb.setSize(
            Math.max(1,Math.ceil(width.get())),
            Math.max(1,Math.ceil(height.get())) );
    }

    fb.renderStart(cgl);

    trigger.trigger();
    fb.renderEnd(cgl);

    cgl.resetViewPort();

    tex.set( fb.getTextureColor() );
}


render.onTriggered=doRender;


tfilter.onValueChange(onFilterChange);
updateVpSize();

};

Ops.Gl.Render2Texture.prototype = new CABLES.Op();
CABLES.OPS["d01fa820-396c-4cb5-9d78-6b14762852af"]={f:Ops.Gl.Render2Texture,objName:"Ops.Gl.Render2Texture"};




// **************************************************************
// 
// Ops.Trigger.SwitchTrigger
// 
// **************************************************************

Ops.Trigger.SwitchTrigger = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// constants
var NUM_PORTS = 10;

// inputs
var exePort = op.inTriggerButton('Execute');
var switchPort = op.inValueInt('Switch Value');

// outputs
var nextTriggerPort = op.outTrigger('Next Trigger');
var valueOutPort = op.outValue('Switched Value');
var triggerPorts = [];
for(var j=0; j<NUM_PORTS; j++) {
    triggerPorts[j] = op.outTrigger('Trigger ' + j);
}
var defaultTriggerPort = op.outTrigger('Default Trigger');

// functions

/**
 * Performs the switch case
 */
function update() {
    var index = Math.round(switchPort.get());
    if(index >= 0 && index < NUM_PORTS) {
        valueOutPort.set(index);
        triggerPorts[index].trigger();
    } else {
        valueOutPort.set(-1);
        defaultTriggerPort.trigger();
    }
    nextTriggerPort.trigger();
}

// change listeners / trigger events
exePort.onTriggered = update;

};

Ops.Trigger.SwitchTrigger.prototype = new CABLES.Op();
CABLES.OPS["44ceb5d8-b040-4722-b189-a6fb8172517d"]={f:Ops.Trigger.SwitchTrigger,objName:"Ops.Trigger.SwitchTrigger"};




// **************************************************************
// 
// Ops.Value.Value
// 
// **************************************************************

Ops.Value.Value = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const v=op.inValueFloat("value");
const result=op.outValue("result");

v.onChange=exec;

function exec()
{
    result.set(parseFloat(v.get()));
}

};

Ops.Value.Value.prototype = new CABLES.Op();
CABLES.OPS["8fb2bb5d-665a-4d0a-8079-12710ae453be"]={f:Ops.Value.Value,objName:"Ops.Value.Value"};




// **************************************************************
// 
// Ops.Math.Incrementor
// 
// **************************************************************

Ops.Math.Incrementor = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var increment = op.inTriggerButton("Increment");
var decrement = op.inTriggerButton("Decrement");
var inLength=op.inValueInt("Length");
var reset=op.inTriggerButton("Reset");
var inMode=op.inValueSelect("Mode",["Rewind","Stop at Max"]);
var value=op.outValue("Value");
var outRestarted=op.outTrigger("Restarted");


value.ignoreValueSerialize=true;
inLength.set(10);
var val=0;
value.set(0);

inLength.onTriggered=reset;
reset.onTriggered=doReset;

var MODE_REWIND=0;
var MODE_STOP=1;

var mode=MODE_REWIND;

inMode.onChange=function()
{
    if(inMode.get()=="Rewind")
    {
        mode=MODE_REWIND;
    }
    if(inMode.get()=="Stop at Max")
    {
        mode=MODE_STOP;
    }
};

function doReset()
{
    value.set(null);
    val=0;
    value.set(val);
    outRestarted.trigger();
}

decrement.onTriggered=function()
{
    val--;
    if(mode==MODE_REWIND && val<0)val=inLength.get()-1;
    if(mode==MODE_STOP && val<0)val=0;

    value.set(val);
};

increment.onTriggered=function()
{
    val++;
    if(mode==MODE_REWIND && val>=inLength.get())
    {
        val=0;
        outRestarted.trigger();
    }
    if(mode==MODE_STOP && val>=inLength.get())val=inLength.get()-1;

    value.set(val);
};


};

Ops.Math.Incrementor.prototype = new CABLES.Op();
CABLES.OPS["45cc0011-ada8-4423-8f5b-39a3810b8389"]={f:Ops.Math.Incrementor,objName:"Ops.Math.Incrementor"};




// **************************************************************
// 
// Ops.Ui.PatchInput
// 
// **************************************************************

Ops.Ui.PatchInput = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};

op.getPatchOp=function()
{
    for(var i in op.patch.ops)
    {
        if(op.patch.ops[i].patchId)
        {
            if(op.patch.ops[i].patchId.get()==op.uiAttribs.subPatch)
            {
                return op.patch.ops[i];
            }
        }
    }
};


};

Ops.Ui.PatchInput.prototype = new CABLES.Op();
CABLES.OPS["e3f68bc3-892a-4c78-9974-aca25c27025d"]={f:Ops.Ui.PatchInput,objName:"Ops.Ui.PatchInput"};




// **************************************************************
// 
// Ops.Ui.PatchOutput
// 
// **************************************************************

Ops.Ui.PatchOutput = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};

// empty

};

Ops.Ui.PatchOutput.prototype = new CABLES.Op();
CABLES.OPS["851b44cb-5667-4140-9800-5aeb7031f1d7"]={f:Ops.Ui.PatchOutput,objName:"Ops.Ui.PatchOutput"};




// **************************************************************
// 
// Ops.Ui.SubPatch
// 
// **************************************************************

Ops.Ui.SubPatch = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
op.dyn=op.addInPort(new CABLES.Port(op,"create port",CABLES.OP_PORT_TYPE_DYNAMIC));
op.dynOut=op.addOutPort(new CABLES.Port(op,"create port out",CABLES.OP_PORT_TYPE_DYNAMIC));

var dataStr=op.addInPort(new CABLES.Port(op,"dataStr",CABLES.OP_PORT_TYPE_VALUE,{ display:'readonly' }));
op.patchId=op.addInPort(new CABLES.Port(op,"patchId",CABLES.OP_PORT_TYPE_VALUE,{ display:'readonly' }));

var data={"ports":[],"portsOut":[]};

// Ops.Ui.Patch.maxPatchId=CABLES.generateUUID();

op.patchId.onChange=function()
{
    // console.log("subpatch changed...");
    // clean up old subpatch if empty
    var oldPatchOps=op.patch.getSubPatchOps(oldPatchId);

    // console.log("subpatch has childs ",oldPatchOps.length);

    if(oldPatchOps.length==2)
    {
        for(var i=0;i<oldPatchOps.length;i++)
        {
            // console.log("delete ",oldPatchOps[i]);
            op.patch.deleteOp(oldPatchOps[i].id);
        }
    }
    else
    {
        // console.log("old subpatch has ops.,...");
    }


};

var oldPatchId=CABLES.generateUUID();
op.patchId.set(oldPatchId);

op.onLoaded=function()
{
    // op.patchId.set(CABLES.generateUUID());
};

op.onLoadedValueSet=function()
{
    data=JSON.parse(dataStr.get());
    if(!data)
    {
        data={"ports":[],"portsOut":[]};
    }
    setupPorts();


};




function loadData()
{


}




getSubPatchInputOp();
getSubPatchOutputOp();

var dataLoaded=false;
dataStr.onChange=function()
{
    if(dataLoaded)return;

    if(!dataStr.get())return;
    try
    {
        // console.log('parse subpatch data');
        loadData();
    }
    catch(e)
    {
        // op.log('cannot load subpatch data...');
        console.log(e);
    }
};

function saveData()
{
    dataStr.set(JSON.stringify(data));
}

function addPortListener(newPort,newPortInPatch)
{
    //console.log('newPort',newPort.name);
    if(newPort.direction==CABLES.PORT_DIR_IN)
    {
        if(newPort.type==CABLES.OP_PORT_TYPE_FUNCTION)
        {
            newPort.onTriggered=function()
            {
                if(newPortInPatch.isLinked())
                    newPortInPatch.trigger();
            };
        }
        else
        {
            newPort.onChange=function()
            {
                newPortInPatch.set(newPort.get());
            };
        }
    }
}

function setupPorts()
{
    if(!op.patchId.get())return;
    var ports=data.ports||[];
    var portsOut=data.portsOut||[];
    var i=0;

    for(i=0;i<ports.length;i++)
    {
        if(!op.getPortByName(ports[i].name))
        {
            // console.log("ports[i].name",ports[i].name);

            var newPort=op.addInPort(new CABLES.Port(op,ports[i].name,ports[i].type));
            var patchInputOp=getSubPatchInputOp();

            // console.log(patchInputOp);

            var newPortInPatch=patchInputOp.addOutPort(new CABLES.Port(patchInputOp,ports[i].name,ports[i].type));

// console.log('newPortInPatch',newPortInPatch);


            newPort.ignoreValueSerialize=true;
            addPortListener(newPort,newPortInPatch);
        }
    }

    for(i=0;i<portsOut.length;i++)
    {
        if(!op.getPortByName(portsOut[i].name))
        {
            var newPortOut=op.addOutPort(new CABLES.Port(op,portsOut[i].name,portsOut[i].type));
            var patchOutputOp=getSubPatchOutputOp();
            var newPortOutPatch=patchOutputOp.addInPort(new CABLES.Port(patchOutputOp,portsOut[i].name,portsOut[i].type));

            newPortOut.ignoreValueSerialize=true;

            addPortListener(newPortOutPatch,newPortOut);
        }
    }

    dataLoaded=true;

}



op.dyn.onLinkChanged=function()
{
    if(op.dyn.isLinked())
    {
        var otherPort=op.dyn.links[0].getOtherPort(op.dyn);
        op.dyn.removeLinks();
        otherPort.removeLinkTo(op.dyn);


        var newName="in"+data.ports.length+" "+otherPort.parent.name+" "+otherPort.name;

        data.ports.push({"name":newName,"type":otherPort.type});

        setupPorts();

        var l=gui.scene().link(
            otherPort.parent,
            otherPort.getName(),
            op,
            newName
            );

        // console.log('-----+===== ',otherPort.getName(),otherPort.get() );
        // l._setValue();
        // l.setValue(otherPort.get());

        dataLoaded=true;
        saveData();
    }
    else
    {
        setTimeout(function()
        {
            op.dyn.removeLinks();
            gui.patch().removeDeadLinks();
        },100);
    }

};

op.dynOut.onLinkChanged=function()
{
    if(op.dynOut.isLinked())
    {
        var otherPort=op.dynOut.links[0].getOtherPort(op.dynOut);
        op.dynOut.removeLinks();
        otherPort.removeLinkTo(op.dynOut);
        var newName="out"+data.ports.length+" "+otherPort.parent.name+" "+otherPort.name;

        data.portsOut.push({"name":newName,"type":otherPort.type});

        setupPorts();

        gui.scene().link(
            otherPort.parent,
            otherPort.getName(),
            op,
            newName
            );

        dataLoaded=true;
        saveData();
    }
    else
    {
        setTimeout(function()
        {
            op.dynOut.removeLinks();
            gui.patch().removeDeadLinks();
        },100);


        op.log('dynOut unlinked...');
    }
    gui.patch().removeDeadLinks();
};



function getSubPatchOutputOp()
{
    var patchOutputOP=op.patch.getSubPatchOp(op.patchId.get(),'Ops.Ui.PatchOutput');

    if(!patchOutputOP)
    {
        // console.log("Creating output for ",op.patchId.get());
        op.patch.addOp('Ops.Ui.PatchOutput',{'subPatch':op.patchId.get()} );
        patchOutputOP=op.patch.getSubPatchOp(op.patchId.get(),'Ops.Ui.PatchOutput');

        if(!patchOutputOP) console.warn('no patchinput2!');
    }
    return patchOutputOP;

}

function getSubPatchInputOp()
{
    var patchInputOP=op.patch.getSubPatchOp(op.patchId.get(),'Ops.Ui.PatchInput');

    if(!patchInputOP)
    {
        op.patch.addOp('Ops.Ui.PatchInput',{'subPatch':op.patchId.get()} );
        patchInputOP=op.patch.getSubPatchOp(op.patchId.get(),'Ops.Ui.PatchInput');
        if(!patchInputOP) console.warn('no patchinput2!');
    }


    return patchInputOP;
}

op.addSubLink=function(p,p2)
{
    var num=data.ports.length;

    var sublPortname="in"+(num-1)+" "+p2.parent.name+" "+p2.name;
    console.log('sublink! ',sublPortname);

    if(p.direction==CABLES.PORT_DIR_IN)
    {
        var l=gui.scene().link(
            p.parent,
            p.getName(),
            getSubPatchInputOp(),
            sublPortname
            );

        // console.log('- ----=====EEE ',p.getName(),p.get() );
        // console.log('- ----=====EEE ',l.getOtherPort(p).getName() ,l.getOtherPort(p).get() );
    }
    else
    {
        var l=gui.scene().link(
            p.parent,
            p.getName(),
            getSubPatchOutputOp(),
            "out"+(num)+" "+p2.parent.name+" "+p2.name
            );
    }

    var bounds=gui.patch().getSubPatchBounds(op.patchId.get());

    getSubPatchInputOp().uiAttr(
        {
            "translate":
            {
                "x":bounds.minx,
                "y":bounds.miny-100
            }
        });

    getSubPatchOutputOp().uiAttr(
        {
            "translate":
            {
                "x":bounds.minx,
                "y":bounds.maxy+100
            }
        });
    saveData();
    return sublPortname;
};



op.onDelete=function()
{
    for (var i = op.patch.ops.length-1; i >=0 ; i--)
    {
        if(op.patch.ops[i].uiAttribs && op.patch.ops[i].uiAttribs.subPatch==op.patchId.get())
        {
            // console.log(op.patch.ops[i].objName);
            op.patch.deleteOp(op.patch.ops[i].id);
        }
    }



};


};

Ops.Ui.SubPatch.prototype = new CABLES.Op();
CABLES.OPS["84d9a6f0-ed7a-466d-b386-225ed9e89c60"]={f:Ops.Ui.SubPatch,objName:"Ops.Ui.SubPatch"};




// **************************************************************
// 
// Ops.Gl.InteractiveRectangle
// 
// **************************************************************

Ops.Gl.InteractiveRectangle = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};

var render=op.inTrigger("render");
var trigger=op.outTrigger('trigger');

var width=op.inValue("width",1);
var height=op.inValue("height",1);

var inId=op.inValueString("id");
var classPort = op.inValueString("Class");

var pivotX=op.addInPort(new CABLES.Port(op,"pivot x",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","left","right"]} ));
var pivotY=op.addInPort(new CABLES.Port(op,"pivot y",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","top","bottom"]} ));

var axis=op.addInPort(new CABLES.Port(op,"axis",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:["xy","xz"]} ));

var isInteractive=op.inValueBool('Is Interactive',true);
var active=op.inValueBool('Render',true);
var divVisible=op.inValueBool('Show Boundings',true);

var cursorPort=op.inValueSelect("Cursor",["auto","crosshair","pointer","Hand","move","n-resize","ne-resize","e-resize","se-resize","s-resize","sw-resize","w-resize","nw-resize","text","wait","help", "none"],"pointer");

var geomOut=op.addOutPort(new CABLES.Port(op,"geometry",CABLES.OP_PORT_TYPE_OBJECT));
geomOut.ignoreValueSerialize=true;

var mouseOver=op.outValue("Pointer Hover",false);
var mouseDown=op.outValue("Pointer Down",false);
var outX=op.outValue("Pointer X");
var outY=op.outValue("Pointer Y");

var outTop=op.outValue("Top");
var outLeft=op.outValue("Left");
var outRight=op.outValue("Right");
var outBottom=op.outValue("Bottom");


var mouseClick=op.outTrigger("Left Click");

var elementPort = op.outObject('Dom Element');

var cgl=op.patch.cgl;
axis.set('xy');
pivotX.set('center');
pivotY.set('center');

var geom=new CGL.Geometry();
var mesh=null;
var div=null;
var m=mat4.create();
var trans=mat4.create();
var pos=vec3.create();
var divAlign=vec3.create();
var divAlignSize=vec3.create();

axis.onChange=rebuild;
pivotX.onChange=rebuild;
pivotY.onChange=rebuild;
width.onChange=rebuild;
height.onChange=rebuild;
cursorPort.onChange=updateCursor;
rebuild();


var modelMatrix=mat4.create();
var identViewMatrix=mat4.create();
var zeroVec3=vec3.create();

render.onTriggered=function()
{
    if(!div)
    {
        setUpDiv();
        addListeners();
        updateDivVisibility();
        updateIsInteractive();
    }
    updateDivSize();

    if(active.get() && mesh) mesh.render(cgl.getShader());

    trigger.trigger();
};

function rebuild()
{
    var w=width.get();
    var h=height.get();
    var x=0;
    var y=0;
    
    if(typeof w=='string')w=parseFloat(w);
    if(typeof h=='string')h=parseFloat(h);
    
    if(pivotX.get()=='center') 
    {
        x=0;
        divAlign[0]=-w/2;
    }
    if(pivotX.get()=='right')
    {
        x=-w/2;
    }
    if(pivotX.get()=='left')
    {
        x=w/2;
    }

    if(pivotY.get()=='center')
    {
        y=0;
        divAlign[1]=-h/2;
    }
    if(pivotY.get()=='top') y=-h/2;
    if(pivotY.get()=='bottom') y=+h/2;

    var verts=[];
    var tc=[];
    var norms=[];
    var indices=[];

    var numRows=1;
    var numColumns=1;

    var stepColumn=w/numColumns;
    var stepRow=h/numRows;

    var c,r;

    for(r=0;r<=numRows;r++)
    {
        for(c=0;c<=numColumns;c++)
        {
            verts.push( c*stepColumn - width.get()/2+x );
            if(axis.get()=='xz') verts.push( 0.0 );
            verts.push( r*stepRow - height.get()/2+y );
            if(axis.get()=='xy') verts.push( 0.0 );

            tc.push( c/numColumns );
            tc.push( 1.0-r/numRows );

            if(axis.get()=='xz')
            {
                norms.push(0);
                norms.push(1);
                norms.push(0);
            }

            if(axis.get()=='xy')
            {
                norms.push(0);
                norms.push(0);
                norms.push(-1);
            }
        }
    }
    
    for(c=0;c<numColumns;c++)
    {
        for(r=0;r<numRows;r++)
        {
            var ind = c+(numColumns+1)*r;
            var v1=ind;
            var v2=ind+1;
            var v3=ind+numColumns+1;
            var v4=ind+1+numColumns+1;

            indices.push(v1);
            indices.push(v3);
            indices.push(v2);

            indices.push(v2);
            indices.push(v3);
            indices.push(v4);
        }
    }

    geom.clear();
    geom.vertices=verts;
    geom.texCoords=tc;
    geom.verticesIndices=indices;
    geom.vertexNormals=norms;

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);

}

var divX=0;
var divY=0;
var divWidth=0;
var divHeight=0;

var mvMatrix=mat4.create();
divVisible.onChange=updateDivVisibility;
inId.onChange=updateId;
classPort.onChange = updateClassNames;

function updateDivVisibility()
{
    if(div)
    {
        if(divVisible.get()) div.style.border='1px solid red';
            else div.style.border='none';
    }
}

function updateCursor()
{
    if(div)
    {
        div.style.cursor = cursorPort.get();
    }
}

function updateId()
{
    if(div)
    {
        div.setAttribute('id',inId.get());
        
    }
}

function updateDivSize()
{
    var vp=cgl.getViewPort();
    
    
    mat4.multiply(mvMatrix,cgl.vMatrix,cgl.mvMatrix);
    vec3.transformMat4(pos, divAlign, mvMatrix);
    vec3.transformMat4(trans, pos, cgl.pMatrix);



    var x1 = (trans[0] * vp[2]/2) + vp[2]/2;
    var y1 = (trans[1] * vp[3]/2) + vp[3]/2;

    
    divAlignSize[0] = divAlign[0] + width.get();
    divAlignSize[1] = divAlign[1];
    
    vec3.transformMat4(pos, divAlignSize, mvMatrix);
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    var x2 = ((trans[0] * vp[2]/2) + vp[2]/2);
    var y2= ((trans[1] * vp[3]/2) + vp[3]/2);




    divAlignSize[0] = divAlign[0];
    divAlignSize[1] = divAlign[1] + height.get();
    
    vec3.transformMat4(pos, divAlignSize, mvMatrix);
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    var x3 = ((trans[0] * vp[2]/2) + vp[2]/2);
    var y3= ((trans[1] * vp[3]/2) + vp[3]/2);




    divAlignSize[0] = divAlign[0] + width.get();
    divAlignSize[1] = divAlign[1] + height.get();
    
    vec3.transformMat4(pos, divAlignSize, mvMatrix);
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    var x4 = ((trans[0] * vp[2]/2) + vp[2]/2);
    var y4 = ((trans[1] * vp[3]/2) + vp[3]/2);


    divX=Math.min(x1,x2,x3,x4);
    divY=Math.min(vp[3]-y1,vp[3]-y2,vp[3]-y3,vp[3]-y4);

    var xb=Math.max(x1,x2,x3,x4);
    var yb=Math.max(vp[3]-y1,vp[3]-y2,vp[3]-y3,vp[3]-y4);

outTop.set(divY);//=op.outValue("Top");
outLeft.set(divX);//=op.outValue("Left");
outRight.set(xb);//=op.outValue("Right");
outBottom.set(yb);//=op.outValue("Bottom");



    divWidth=Math.abs(xb-divX);
    divHeight=Math.abs(yb-divY);
    
    


    div.style.left=divX+'px';
    div.style.top=divY+'px';
    div.style.width=divWidth+'px';
    div.style.height=divHeight+'px';
}

function updateClassNames() {
    if(div) {
        div.className = classPort.get(); 
    }
}

op.onDelete=function()
{
    if(div)div.remove();    
}

function setUpDiv()
{
    if(!div)
    {
        div = document.createElement('div');
        div.style.padding="0px";
        div.style.position="absolute";
        // div.style.overflow="hidden";
        div.style['box-sizing']="border-box";
        div.style.border="1px solid red";
        div.style['border-left']="1px solid blue";
        div.style['border-top']="1px solid green";
        div.style["z-index"]="9999";
        
        var canvas = op.patch.cgl.canvas.parentElement;
        canvas.appendChild(div);
        updateCursor();
        updateIsInteractive();
        updateId();
        updateClassNames();
    }
    updateDivSize();
    elementPort.set(div);
    // op.log('div', div);
}

var listenerElement=null;

function onMouseMove(e)
{
    var offsetX=-width.get()/2;
    var offsetY=-height.get()/2;

    outX.set( Math.max(0.0,Math.min(1.0,e.offsetX/divWidth)));
    outY.set( Math.max(0.0,Math.min(1.0,1.0-e.offsetY/divHeight)));
}

function onMouseLeave(e)
{
    mouseDown.set(false);
    mouseOver.set(false);
}

function onMouseEnter(e)
{
    mouseOver.set(true);
}

function onMouseDown(e)
{
    mouseDown.set(true);
}

function onMouseUp(e)
{
    mouseDown.set(false);
}

function onmouseclick(e)
{
    mouseClick.trigger();
}

function onTouchMove(e)
{
    // console.log('touchmoveevent',e);

    var targetEle=document.elementFromPoint(
        e.targetTouches[0].pageX,e.targetTouches[0].pageY);

    if(targetEle==div)
    {
        mouseOver.set(true);
        if(e.touches && e.touches.length>0) 
        {
            var rect = div.getBoundingClientRect(); //e.target
            var x = e.targetTouches[0].pageX - rect.left;
            var y = e.targetTouches[0].pageY - rect.top;

            var touch=e.touches[0];
        
            outX.set( Math.max(0.0,Math.min(1.0,x/divWidth)));
            outY.set( Math.max(0.0,Math.min(1.0,1.0-y/divHeight)));

            onMouseMove(touch);
        }
    }
    else
    {
        mouseOver.set(false);
    }
}


active.onChange=updateActiveRender;
function updateActiveRender()
{
    if(active.get()) 
    {
        addListeners();
        if(div) div.style['display']='block';
    }
    else
    {
        removeListeners();
        if(div) div.style['display']='none';
    }
    
}

isInteractive.onChange=updateIsInteractive;
function updateIsInteractive()
{
    if(isInteractive.get()) 
    {
        addListeners();
        if(div)div.style['pointer-events']='initial';
    }
    else
    {
        removeListeners();
        if(div)div.style['pointer-events']='none';
    }
}

function removeListeners()
{
    if(listenerElement)
    {
        document.removeEventListener('touchmove', onTouchMove);
        // listenerElement.removeEventListener('touchend', onMouseLeave);
        // listenerElement.removeEventListener('touchstart', onMouseEnter);
    
        listenerElement.removeEventListener('click', onmouseclick);
        listenerElement.removeEventListener('mousemove', onMouseMove);
        listenerElement.removeEventListener('mouseleave', onMouseLeave);
        listenerElement.removeEventListener('mousedown', onMouseDown);
        listenerElement.removeEventListener('mouseup', onMouseUp);
        listenerElement.removeEventListener('mouseenter', onMouseEnter);
        // listenerElement.removeEventListener('contextmenu', onClickRight);
        listenerElement=null;
    }
}

function addListeners()
{
    if(listenerElement)removeListeners();
    
    listenerElement=div;

    if(listenerElement)
    {
        document.addEventListener('touchmove', onTouchMove);
        // listenerElement.addEventListener('touchend', onMouseLeave);
        // listenerElement.addEventListener('touchstart', onMouseEnter);
    
        listenerElement.addEventListener('click', onmouseclick);
        listenerElement.addEventListener('mousemove', onMouseMove);
        listenerElement.addEventListener('mouseleave', onMouseLeave);
        listenerElement.addEventListener('mousedown', onMouseDown);
        listenerElement.addEventListener('mouseup', onMouseUp);
        listenerElement.addEventListener('mouseenter', onMouseEnter);
        // listenerElement.addEventListener('contextmenu', onClickRight);
        
    }
}



};

Ops.Gl.InteractiveRectangle.prototype = new CABLES.Op();
CABLES.OPS["eeebdb51-9d8c-404d-a538-f5d9cf409200"]={f:Ops.Gl.InteractiveRectangle,objName:"Ops.Gl.InteractiveRectangle"};




// **************************************************************
// 
// Ops.Gl.Textures.Text
// 
// **************************************************************

Ops.Gl.Textures.Text = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var text=op.addInPort(new CABLES.Port(op,"text",CABLES.OP_PORT_TYPE_VALUE,{type:'string',display:'editor'}));
var inFontSize=op.addInPort(new CABLES.Port(op,"fontSize"));
var maximize=op.addInPort(new CABLES.Port(op,"Maximize Size",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
var texWidth=op.addInPort(new CABLES.Port(op,"texture width"));
var texHeight=op.addInPort(new CABLES.Port(op,"texture height"));
var align=op.addInPort(new CABLES.Port(op,"align",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['left','center','right']}));
var valign=op.addInPort(new CABLES.Port(op,"vertical align",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['top','center','bottom']}));
var font=op.addInPort(new CABLES.Port(op,"font",CABLES.OP_PORT_TYPE_VALUE,{type:'string'}));
var lineDistance=op.addInPort(new CABLES.Port(op,"line distance"));
var border=op.addInPort(new CABLES.Port(op,"border"));
var doRefresh=op.inTriggerButton("Refresh");

var cachetexture=op.inValueBool("Reuse Texture",true);

// var textureOut=op.addOutPort(new CABLES.Port(op,"texture",CABLES.OP_PORT_TYPE_TEXTURE));
var textureOut=op.outTexture("texture");
var outRatio=op.addOutPort(new CABLES.Port(op,"Ratio",CABLES.OP_PORT_TYPE_VALUE));
textureOut.ignoreValueSerialize=true;

var cgl=op.patch.cgl;

doRefresh.onTriggered=refresh;

border.set(0);
texWidth.set(512);
texHeight.set(512);
lineDistance.set(1);
inFontSize.set(30);
font.set('Arial');
align.set('center');
valign.set('center');

var fontImage = document.createElement('canvas');
fontImage.id = "texturetext_"+CABLES.generateUUID();
fontImage.style.display = "none";
var body = document.getElementsByTagName("body")[0];
body.appendChild(fontImage);



var ctx = fontImage.getContext('2d');


function reSize()
{
    textureOut.get().setSize(texWidth.get(),texHeight.get());

    ctx.canvas.width=fontImage.width=texWidth.get();
    ctx.canvas.height=fontImage.height=texHeight.get();
    refresh();
}

function refresh()
{
    ctx.clearRect(0,0,fontImage.width,fontImage.height);
    ctx.fillStyle = 'white';
    var fontSize=parseFloat(inFontSize.get());
    var fontname=font.get()+'';
    if(fontname.indexOf(" ")>-1)fontname='"'+fontname+'"';
    ctx.font = fontSize+'px '+fontname+'';
    ctx.textAlign = align.get();

    if(border.get()>0)
    {
        ctx.beginPath();
        ctx.lineWidth=""+border.get();
        ctx.strokeStyle="white";
        ctx.rect(
            0,
            0,
            texWidth.get(),
            texHeight.get()
            );
        ctx.stroke();
    }

    var i=0;

    // if(text.get())
    {
        var txt=(text.get()+'').replace(/<br\/>/g, '\n');
        var txt=(text.get()+'').replace(/<br>/g, '\n');

        var strings = txt.split("\n");


        var posy=0,i=0;

        if(maximize.get())
        {
            fontSize=texWidth.get();
            var count=0;
            var maxWidth=0;
            var maxHeight=0;

            do
            {
                count++;
                if(count>300)break;
                fontSize-=10;
                ctx.font = fontSize+'px "'+font.get()+'"';
                maxWidth=0;
                maxHeight=strings.length*fontSize*1.1;
                for(i=0;i<strings.length;i++)
                {
                    maxWidth=Math.max(maxWidth,ctx.measureText(strings[i]).width);
                }
            }
            while(maxWidth>ctx.canvas.width || maxHeight>ctx.canvas.height);
        }

        if(valign.get()=='center')
        {
            var maxy=(strings.length-1.5)*fontSize+parseFloat(lineDistance.get());
            posy=ctx.canvas.height / 2-maxy/2;
        }
        else if(valign.get()=='top') posy=fontSize;
        else if(valign.get()=='bottom')  posy=ctx.canvas.height -(strings.length)*(parseFloat(inFontSize.get())+parseFloat(lineDistance.get()));

        for(i=0;i<strings.length;i++)
        {
            if(align.get()=='center') ctx.fillText(strings[i], ctx.canvas.width / 2, posy);
            if(align.get()=='left') ctx.fillText(strings[i], 0, posy);
            if(align.get()=='right') ctx.fillText(strings[i], ctx.canvas.width, posy);
            posy+=fontSize+parseFloat(lineDistance.get());
        }
    }

    ctx.restore();
    outRatio.set(ctx.canvas.height/ctx.canvas.width);


    if(!cachetexture.get() || !textureOut.get()) textureOut.set(new CGL.Texture.createFromImage( cgl, fontImage, { filter:CGL.Texture.FILTER_MIPMAP } ));
        else textureOut.get().initTexture(fontImage,CGL.Texture.FILTER_MIPMAP);

    textureOut.get().unpackAlpha=true;
}

align.onChange=refresh;
valign.onChange=refresh;
text.onChange=refresh;
inFontSize.onChange=refresh;
font.onChange=refresh;
lineDistance.onChange=refresh;
maximize.onChange=refresh;

texWidth.onChange=reSize;
texHeight.onChange=reSize;

border.onChange=refresh;

text.set('cables');
reSize();

};

Ops.Gl.Textures.Text.prototype = new CABLES.Op();
CABLES.OPS["84a1d08e-c0c7-4f73-9e15-06dd86e854d3"]={f:Ops.Gl.Textures.Text,objName:"Ops.Gl.Textures.Text"};




// **************************************************************
// 
// Ops.Gl.Meshes.Rectangle
// 
// **************************************************************

Ops.Gl.Meshes.Rectangle = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var render=op.inTrigger("render");
var trigger=op.outTrigger('trigger');

var width=op.inValue("width",1);
var height=op.inValue("height",1);

var pivotX=op.inValueSelect("pivot x",["center","left","right"]);
var pivotY=op.inValueSelect("pivot y",["center","top","bottom"]);

var nColumns=op.inValueInt("num columns",1);
var nRows=op.inValueInt("num rows",1);
var axis=op.inValueSelect("axis",["xy","xz"],"xy");

var active=op.inValueBool('Active',true);

var geomOut=op.outObject("geometry");
geomOut.ignoreValueSerialize=true;

var cgl=op.patch.cgl;
axis.set('xy');
pivotX.set('center');
pivotY.set('center');

op.setPortGroup('Pivot',[pivotX,pivotY]);
op.setPortGroup('Size',[width,height]);
op.setPortGroup('Structure',[nColumns,nRows]);

var geom=new CGL.Geometry('rectangle');
var mesh=null;

axis.onChange=rebuild;
pivotX.onChange=rebuild;
pivotY.onChange=rebuild;
width.onChange=rebuild;
height.onChange=rebuild;
nRows.onChange=rebuild;
nColumns.onChange=rebuild;
rebuild();

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpNotInTextureEffect(op)) return;


    if(active.get() && mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};

function rebuild()
{
    var w=width.get();
    var h=height.get();
    var x=0;
    var y=0;

    if(typeof w=='string')w=parseFloat(w);
    if(typeof h=='string')h=parseFloat(h);

    if(pivotX.get()=='center') x=0;
    else if(pivotX.get()=='right') x=-w/2;
    else if(pivotX.get()=='left') x=+w/2;

    if(pivotY.get()=='center') y=0;
    else if(pivotY.get()=='top') y=-h/2;
    else if(pivotY.get()=='bottom') y=+h/2;

    var verts=[];
    var tc=[];
    var norms=[];
    var tangents=[];
    var biTangents=[];
    var indices=[];

    var numRows=Math.round(nRows.get());
    var numColumns=Math.round(nColumns.get());

    var stepColumn=w/numColumns;
    var stepRow=h/numRows;

    var c,r,a;
    a=axis.get();
    for(r=0;r<=numRows;r++)
    {
        for(c=0;c<=numColumns;c++)
        {
            verts.push( c*stepColumn - width.get()/2+x );
            if(a=='xz') verts.push( 0.0 );
            verts.push( r*stepRow - height.get()/2+y );
            if(a=='xy') verts.push( 0.0 );

            tc.push( c/numColumns );
            tc.push( 1.0-r/numRows );

            if(a=='xz')
            {
                norms.push(0,1,0);
                tangents.push(1,0,0);
                biTangents.push(0,0,1);
            }
            else if(a=='xy')
            {
                norms.push(0,0,1);
                tangents.push(-1,0,0);
                biTangents.push(0,-1,0);
            }
        }
    }

    for(c=0;c<numColumns;c++)
    {
        for(r=0;r<numRows;r++)
        {
            var ind = c+(numColumns+1)*r;
            var v1=ind;
            var v2=ind+1;
            var v3=ind+numColumns+1;
            var v4=ind+1+numColumns+1;

            indices.push(v1);
            indices.push(v3);
            indices.push(v2);

            indices.push(v2);
            indices.push(v3);
            indices.push(v4);
        }
    }

    geom.clear();
    geom.vertices=verts;
    geom.texCoords=tc;
    geom.verticesIndices=indices;
    geom.vertexNormals=norms;
    geom.tangents=tangents;
    geom.biTangents=biTangents;

    if(numColumns*numRows>64000)geom.unIndex();

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);

}

op.onDelete=function()
{
    if(mesh)mesh.dispose();
}

};

Ops.Gl.Meshes.Rectangle.prototype = new CABLES.Op();
CABLES.OPS["20f3c4e7-04d1-44e0-b868-05756d1c66c6"]={f:Ops.Gl.Meshes.Rectangle,objName:"Ops.Gl.Meshes.Rectangle"};




// **************************************************************
// 
// Ops.Boolean.IfTrueThen
// 
// **************************************************************

Ops.Boolean.IfTrueThen = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    exe=op.inTrigger("exe"),
    boolean=op.inValueBool("boolean",false),
    triggerThen=op.outTrigger("then"),
    triggerElse=op.outTrigger("else");

boolean.onChange=execBool;
exe.onTriggered=exec;

function execBool()
{
    if(exe.isLinked())return;
    exec();
}

function exec()
{
    if(boolean.get() || boolean.get()>=1 ) triggerThen.trigger();
        else triggerElse.trigger();
}



};

Ops.Boolean.IfTrueThen.prototype = new CABLES.Op();
CABLES.OPS["99892fda-8821-4660-ac57-3103d1546924"]={f:Ops.Boolean.IfTrueThen,objName:"Ops.Boolean.IfTrueThen"};




// **************************************************************
// 
// Ops.Math.Sum
// 
// **************************************************************

Ops.Math.Sum = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    number1=op.inValueFloat("number1",1),
    number2=op.inValueFloat("number2",1),
    result=op.outValue("result");

number1.onChange=
number2.onChange=exec;
exec();

function exec()
{
    var v=number1.get()+number2.get();
    if(!isNaN(v)) result.set( v );
}



};

Ops.Math.Sum.prototype = new CABLES.Op();
CABLES.OPS["c8fb181e-0b03-4b41-9e55-06b6267bc634"]={f:Ops.Math.Sum,objName:"Ops.Math.Sum"};




// **************************************************************
// 
// Ops.Math.Abs
// 
// **************************************************************

Ops.Math.Abs = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const number=op.inValue("number");
const result=op.outValue("result");

number.onChange=function()
{
    result.set( Math.abs(number.get()) );
};

};

Ops.Math.Abs.prototype = new CABLES.Op();
CABLES.OPS["6b5af21d-065f-44d2-9442-8b7a254753f6"]={f:Ops.Math.Abs,objName:"Ops.Math.Abs"};




// **************************************************************
// 
// Ops.TimeLine.AutoPlay
// 
// **************************************************************

Ops.TimeLine.AutoPlay = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};

op.patch.timer.play();

};

Ops.TimeLine.AutoPlay.prototype = new CABLES.Op();
CABLES.OPS["6069e8fe-6cf5-4be6-be38-4d46056ec9f7"]={f:Ops.TimeLine.AutoPlay,objName:"Ops.TimeLine.AutoPlay"};




// **************************************************************
// 
// Ops.Gl.Shader.CustomShader
// 
// **************************************************************

Ops.Gl.Shader.CustomShader = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={fshader:"",vshader:"hello world",};
var render=op.inTrigger('render');
var fragmentShader=op.addInPort(new CABLES.Port(op,"fragment",CABLES.OP_PORT_TYPE_VALUE,{display:'editor',editorSyntax:'glsl'}));
var vertexShader=op.addInPort(new CABLES.Port(op,"vertex",CABLES.OP_PORT_TYPE_VALUE,{display:'editor',editorSyntax:'glsl'}));

var trigger=op.outTrigger('trigger');
var outShader=op.outObject("Shader");
var cgl=op.patch.cgl;
var uniformInputs=[];
var uniformTextures=[];


op.toWorkPortsNeedToBeLinked(outShader);



var shader=new CGL.Shader(cgl,"shaderMaterial");
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

// shader.glslVersion=0;

op.setPortGroup("Source Code",[fragmentShader,vertexShader]);

fragmentShader.set(CGL.Shader.getDefaultFragmentShader());
vertexShader.set(CGL.Shader.getDefaultVertexShader());
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
fragmentShader.onChange=updateLater;
vertexShader.onChange=updateLater;
render.onTriggered=doRender;

var needsUpdate=true;
op.onLoadedValueSet=initDataOnLoad;

function initDataOnLoad(data)
{
    updateShader();

    // set uniform values AFTER shader has been compiled and uniforms are extracted and uniform ports are created.

    for(var i=0;i<uniformInputs.length;i++)
        for(var j=0;j<data.portsIn.length;j++)
            if(uniformInputs[i].name==data.portsIn[j].name)
                uniformInputs[i].set(data.portsIn[j].value);

}

function updateLater()
{
    needsUpdate=true;
}

op.init=function()
{
    updateShader();
};

function doRender()
{
    if(needsUpdate)updateShader();
    trigger.trigger();
}

function bindTextures()
{
    for(var i=0;i<uniformTextures.length;i++)
    {
        if(uniformTextures[i] && uniformTextures[i].get() && uniformTextures[i].get().tex)
        {
            cgl.setTexture(0+i+3, uniformTextures[i].get().tex);
        }
    }
}

function hasUniformInput(name)
{
    var i=0;
    for(i=0;i<uniformInputs.length;i++) if(uniformInputs[i].name==name)return true;
    for(i=0;i<uniformTextures.length;i++) if(uniformTextures[i].name==name)return true;
    return false;
}

var tempMat4=mat4.create();
// var lastm4;

const uniformNameBlacklist = [
    'modelMatrix',
    'viewMatrix',
    'normalMatrix',
    'mvMatrix',
    'projMatrix',
    'inverseViewMatrix',
    'camPos'
];
function updateShader()
{
    if(!shader)return;
    needsUpdate=false;

    // shader.glslVersion=0;
    shader.bindTextures=bindTextures.bind(this);
    shader.setSource(vertexShader.get(),fragmentShader.get());

    shader.compile();

    var activeUniforms = cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_UNIFORMS);

    var i=0;
    var countTexture=0;
    for (i=0; i < activeUniforms; i++)
    {
        var uniform = cgl.gl.getActiveUniform(shader.getProgram(), i);



        if (
			hasUniformInput(uniform.name) ||
			uniform.name.indexOf('mod') == 0 ||
			uniformNameBlacklist.indexOf(uniform.name)!=-1
		)
		    continue;

        if(uniform.type==cgl.gl.FLOAT)
        {
            var newInput=null;
            if(uniform.size>1)
            {
                newInput=op.inArray(uniform.name,[]);

                newInput.uniform=new CGL.Uniform(shader,'f[]',uniform.name,new Float32Array(22));

                newInput.onChange=function(p)
                {
                    p.uniform.needsUpdate=true;
                    p.uniform.setValue(new Float32Array(p.get()));
                };

            }
            else
            {
                newInput=op.inValue(uniform.name,0);
                newInput.uniform=new CGL.Uniform(shader,'f',uniform.name,newInput);
                newInput.onChange=function(p)
                {
                    p.uniform.needsUpdate=true;
                    p.uniform.setValue(p.get());
                };

            }


            uniformInputs.push(newInput);

        }
        else
        if(uniform.type==cgl.gl.FLOAT_MAT4)
        {
            var newInputM4=op.inArray(uniform.name);
            newInputM4.onChange=function(p)
            {
                if(p.get() && p.isLinked())
                {
                    mat4.copy(tempMat4,p.get());
                    p.uniform.needsUpdate=true;
                    p.uniform.setValue(tempMat4);
                }
            };

            uniformInputs.push(newInputM4);
            // lastm4=newInputM4;
            newInputM4.uniform=new CGL.Uniform(shader,'m4',uniform.name,mat4.create());
        }
        else
        if(uniform.type==cgl.gl.SAMPLER_2D)
        {
            var newInputTex=op.inObject(uniform.name);
            newInputTex.uniform=new CGL.Uniform(shader,'t',uniform.name,3+countTexture);
            uniformTextures.push(newInputTex);
            countTexture++;
        }
        else
        {
            console.log('unsupported uniform type',uniform.type,uniform);
        }
    }

    for(i=0;i<uniformInputs.length;i++)
    {
        uniformInputs[i].uniform.needsUpdate=true;
    }

    if(CABLES.UI) gui.patch().showOpParams(op);


    outShader.set(null);
    outShader.set(shader);

}


// 0x8B50: 'FLOAT_VEC2',
// 0x8B51: 'FLOAT_VEC3',
// 0x8B52: 'FLOAT_VEC4',
// 0x8B53: 'INT_VEC2',
// 0x8B54: 'INT_VEC3',
// 0x8B55: 'INT_VEC4',
// 0x8B56: 'BOOL',
// 0x8B57: 'BOOL_VEC2',
// 0x8B58: 'BOOL_VEC3',
// 0x8B59: 'BOOL_VEC4',
// 0x8B5A: 'FLOAT_MAT2',
// 0x8B5B: 'FLOAT_MAT3',
// 0x8B5C: 'FLOAT_MAT4',
// 0x8B5E: 'SAMPLER_2D',
// 0x8B60: 'SAMPLER_CUBE',
// 0x1400: 'BYTE',
// 0x1401: 'UNSIGNED_BYTE',
// 0x1402: 'SHORT',
// 0x1403: 'UNSIGNED_SHORT',
// 0x1404: 'INT',
// 0x1405: 'UNSIGNED_INT',
// 0x1406: 'FLOAT'


updateShader();


};

Ops.Gl.Shader.CustomShader.prototype = new CABLES.Op();
CABLES.OPS["86565630-2092-4d16-b177-ffb1d4040f4e"]={f:Ops.Gl.Shader.CustomShader,objName:"Ops.Gl.Shader.CustomShader"};




// **************************************************************
// 
// Ops.Gl.Shader.Shader2Texture
// 
// **************************************************************

Ops.Gl.Shader.Shader2Texture = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var exec=op.inTrigger("Render");
var inShader=op.inObject("Shader");
var tfilter=op.inValueSelect("filter",['nearest','linear']);
// ,'mipmap'
const twrap=op.inValueSelect("wrap",['clamp to edge','repeat','mirrored repeat'],'clamp to edge');

var inVPSize=op.inValueBool("Use Viewport Size",true);
var inWidth=op.inValueInt("Width",512);
var inHeight=op.inValueInt("Height",512);
var inFloatingPoint=op.inValueBool("Floating Point",false);
var next=op.outTrigger("Next");
var outTex=op.outTexture("Texture");

var prevViewPort=[0,0,0,0];
var cgl=op.patch.cgl;
var effect=null;

inWidth.onChange=initFbLater;
inHeight.onChange=initFbLater;
inFloatingPoint.onChange=initFbLater;
inVPSize.onChange=initFbLater;
tfilter.onChange=initFbLater;
twrap.onChange=initFbLater;

var fb=null;
var tex=null;
var needInit=true;
var mesh=CGL.MESHES.getSimpleRect(cgl,"shader2texture rect");

tfilter.set("nearest");

function initFbLater()
{
    needInit=true;
}

function initFb()
{
    needInit=false;
    if(fb)fb.delete();
    fb=null;

    var w=inWidth.get();
    var h=inHeight.get();

    var filter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear') filter=CGL.Texture.FILTER_LINEAR;
//        else if(tfilter.get()=='mipmap') filter=CGL.Texture.FILTER_MIPMAP;

    var selectedWrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;
    if(twrap.get()=='repeat') selectedWrap=CGL.Texture.WRAP_REPEAT;
    if(twrap.get()=='mirrored repeat') selectedWrap=CGL.Texture.WRAP_MIRRORED_REPEAT;



    if(inVPSize.get())
    {
        inWidth.setUiAttribs({hidePort:true,greyout:true});
        inHeight.setUiAttribs({hidePort:true,greyout:true});

        w=cgl.getViewPort()[2];
        h=cgl.getViewPort()[3];
        inWidth.set(w);
        inHeight.set(h);
    }
    else
    {
        if(inWidth.uiAttribs.hidePort)
        {
            inWidth.setUiAttribs({hidePort:false,greyout:false});
            inHeight.setUiAttribs({hidePort:false,greyout:false});
        }
    }

    if(cgl.glVersion>=2)
    {
        fb=new CGL.Framebuffer2(cgl,w,h,
        {
            isFloatingPointTexture:inFloatingPoint.get(),
            multisampling:false,
            wrap:selectedWrap,
            filter:filter,
            depth:true,
            multisamplingSamples:0,
            clear:true
        });
    }
    else
    {
        fb=new CGL.Framebuffer(cgl,inWidth.get(),inHeight.get(),
        {
            isFloatingPointTexture:inFloatingPoint.get(),
            filter:filter,
            wrap:selectedWrap
        });
    }



}

exec.onTriggered=function()
{
    var vp=cgl.getViewPort();

    // console.log();
    if(!fb || needInit )initFb();
    if(inVPSize.get() && fb && ( vp[2]!=fb.getTextureColor().width || vp[3]!=fb.getTextureColor().height ) )
    {
        initFb();
    }

    prevViewPort[0]=vp[0];
    prevViewPort[1]=vp[1];
    prevViewPort[2]=vp[2];
    prevViewPort[3]=vp[3];


    fb.renderStart(cgl);

    cgl.pushPMatrix();
    mat4.identity(cgl.pMatrix);

    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);

    cgl.pushModelMatrix();
    mat4.identity(cgl.mMatrix);

    cgl.setShader(inShader.get());
    if(inShader.get().bindTextures) inShader.get().bindTextures();

    mesh.render(inShader.get());

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();
    fb.renderEnd(cgl);

    outTex.set(fb.getTextureColor());

    cgl.setPreviousShader();

    cgl.gl.viewport(prevViewPort[0],prevViewPort[1],prevViewPort[2],prevViewPort[3] );

    next.trigger();
};


};

Ops.Gl.Shader.Shader2Texture.prototype = new CABLES.Op();
CABLES.OPS["a3debb76-7d84-4548-9e7b-24891423dcce"]={f:Ops.Gl.Shader.Shader2Texture,objName:"Ops.Gl.Shader.Shader2Texture"};




// **************************************************************
// 
// Ops.Gl.Meshes.TextMesh
// 
// **************************************************************

Ops.Gl.Meshes.TextMesh = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={textmesh_frag:"UNI sampler2D tex;\nIN vec2 texCoord;\nUNI float r;\nUNI float g;\nUNI float b;\nUNI float a;\n\nvoid main()\n{\n   vec4 col=texture(tex,texCoord);\n   col.a=col.r;\n   col.r*=r;\n   col.g*=g;\n   col.b*=b;\n   col*=a;\n\n   outColor=col;\n}",textmesh_vert:"UNI sampler2D tex;\nUNI mat4 projMatrix;\nUNI mat4 modelMatrix;\nUNI mat4 viewMatrix;\nUNI float scale;\nIN vec3 vPosition;\nIN vec2 attrTexCoord;\nIN mat4 instMat;\nIN vec2 attrTexOffsets;\nIN vec2 attrTexSize;\n\nOUT vec2 texCoord;\n\nvoid main()\n{\n   texCoord=(attrTexCoord*(attrTexSize)) + attrTexOffsets;\n   mat4 instModelMat=instMat;\n   instModelMat[3][0]*=scale;\n\n   vec4 vert=vec4( vPosition.x*(attrTexSize.x/attrTexSize.y)*scale,vPosition.y*scale,vPosition.z*scale, 1. );\n\n   mat4 mvMatrix=viewMatrix * modelMatrix * instModelMat;\n\n   #ifndef BILLBOARD\n       gl_Position = projMatrix * mvMatrix * vert;\n   #endif\n}\n",};
var render=op.inTrigger("Render");
var next=op.outTrigger("Next");
var textureOut=op.outTexture("texture");
var str=op.inValueString("Text","cables");
var scale=op.inValue("Scale",1);
var inFont=op.inValueString("Font","Arial");
var align=op.inValueSelect("align",['left','center','right'],'center');
var valign=op.inValueSelect("vertical align",['Top','Middle','Bottom'],'Middle');
var lineHeight=op.inValue("Line Height",1);
var letterSpace=op.inValue("Letter Spacing");

var loaded=op.outValue("Font Available",0);

var cgl=op.patch.cgl;

var textureSize=2048;
var fontLoaded=false;

align.onChange=generateMesh;
str.onChange=generateMesh;

lineHeight.onChange=generateMesh;
var cgl=op.patch.cgl;
var geom=null;
var mesh=null;

var createMesh=true;
var createTexture=true;

textureOut.set(null);
inFont.onChange=function()
    {
        createTexture=true;
        createMesh=true;
        checkFont();
    };

function checkFont()
{
    var oldFontLoaded=fontLoaded;
    try
    {
    fontLoaded=document.fonts.check('20px '+inFont.get());
    }
    catch(ex)
    {
        console.log(ex);
    }

    if(!oldFontLoaded && fontLoaded)
    {
        loaded.set(true);
        createTexture=true;
        createMesh=true;
    }

    if(!fontLoaded) setTimeout(checkFont,250);
}

var canvasid=null;


CABLES.OpTextureMeshCanvas={};

var valignMode=0;

valign.onChange=function()
{
    if(valign.get()=='Middle')valignMode=0;
    if(valign.get()=='Top')valignMode=1;
    if(valign.get()=='Bottom')valignMode=2;
};

function getFont()
{
    canvasid=''+inFont.get();
    if(CABLES.OpTextureMeshCanvas.hasOwnProperty(canvasid))
    {
        return CABLES.OpTextureMeshCanvas[canvasid];
    }

    var fontImage = document.createElement('canvas');
    fontImage.dataset.font=inFont.get();
    fontImage.id = "texturetext_"+CABLES.generateUUID();
    fontImage.style.display = "none";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(fontImage);
    var _ctx= fontImage.getContext('2d');
    CABLES.OpTextureMeshCanvas[canvasid]=
        {
            ctx:_ctx,
            canvas:fontImage,
            chars:{},
            characters:'?',
            fontSize:320
        };
    return CABLES.OpTextureMeshCanvas[canvasid];
}

op.onDelete=function()
{
    // fontImage.remove();
    if(canvasid && CABLES.OpTextureMeshCanvas[canvasid])
        CABLES.OpTextureMeshCanvas[canvasid].canvas.remove();
};

var shader=new CGL.Shader(cgl,'TextMesh');
shader.setSource(attachments.textmesh_vert,attachments.textmesh_frag);
var uniTex=new CGL.Uniform(shader,'t','tex',0);
var uniScale=new CGL.Uniform(shader,'f','scale',scale);


const r = op.inValueSlider("r", 1);
const g = op.inValueSlider("g", 1);
const b = op.inValueSlider("b", 1);
r.setUiAttribs({ colorPick: true });

const runiform=new CGL.Uniform(shader,'f','r',r);
const guniform=new CGL.Uniform(shader,'f','g',g);
const buniform=new CGL.Uniform(shader,'f','b',b);

var a=op.inValueSlider("a");
a.uniform=new CGL.Uniform(shader,'f','a',a);
a.set(1.0);

var height=0;

var vec=vec3.create();
var lastTextureChange=-1;
var disabled=false;

render.onTriggered=function()
{

    var font=getFont();
    if(font.lastChange!=lastTextureChange)
    {
        createMesh=true;
        lastTextureChange=font.lastChange;
    }

    if(createTexture) generateTexture();
    if(createMesh)generateMesh();

    if(mesh && mesh.numInstances>0)
    {
        cgl.pushBlendMode(CGL.BLEND_NORMAL,true);
        cgl.setShader(shader);

        cgl.setTexture(0,textureOut.get().tex);

        if(valignMode==2) vec3.set(vec, 0,height,0);
        if(valignMode==1) vec3.set(vec, 0,0,0);
        if(valignMode==0) vec3.set(vec, 0,height/2,0);
        vec[1]-=lineHeight.get();
        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix,cgl.mMatrix, vec);
        if(!disabled)mesh.render(cgl.getShader());

        cgl.popModelMatrix();

        cgl.setTexture(0,null);
        cgl.setPreviousShader();
        cgl.popBlendMode();
    }

    next.trigger();
};

letterSpace.onChange=function()
{
    createMesh=true;
};


function generateMesh()
{
    var theString=String(str.get()+'');
    if(!textureOut.get())return;

    var font=getFont();
    if(!font.geom)
    {
        font.geom=new CGL.Geometry("textmesh");

        font.geom.vertices = [
            1.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            1.0, 0.0, 0.0,
            0.0, 0.0, 0.0
        ];

        font.geom.texCoords = new Float32Array([
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 0.0
        ]);

        font.geom.verticesIndices = [
            0, 1, 2,
            3, 1, 2
        ];
    }

    if(!mesh)mesh=new CGL.Mesh(cgl,font.geom);

    var strings=(theString).split('\n');

    var transformations=[];
    var tcOffsets=[];//new Float32Array(str.get().length*2);
    var tcSize=[];//new Float32Array(str.get().length*2);
    var charCounter=0;
    createTexture=false;
    var m=mat4.create();


    for(var s=0;s<strings.length;s++)
    {
        var txt=strings[s];
        var numChars=txt.length;

        var pos=0;
        var offX=0;
        var width=0;

        for(var i=0;i<numChars;i++)
        {
            var chStr=txt.substring(i,i+1);
            var char=font.chars[String(chStr)];
            if(char) width+=(char.texCoordWidth/char.texCoordHeight);
        }

        height=0;

        if(align.get()=='left') offX=0;
        else if(align.get()=='right') offX=width;
        else if(align.get()=='center') offX=width/2;

        height=(s+1)*lineHeight.get();

        for(var i=0;i<numChars;i++)
        {
            var chStr=txt.substring(i,i+1);
            var char=font.chars[String(chStr)];


            if(!char)
            {
                createTexture=true;
                return;
            }
            else
            {
                tcOffsets.push(char.texCoordX,1-char.texCoordY-char.texCoordHeight);
                tcSize.push(char.texCoordWidth,char.texCoordHeight);

                mat4.identity(m);
                mat4.translate(m,m,[pos-offX,0-s*lineHeight.get(),0]);

                pos+=(char.texCoordWidth/char.texCoordHeight)+letterSpace.get();
                transformations.push(Array.prototype.slice.call(m));

                charCounter++;
            }
        }
    }

    var transMats = [].concat.apply([], transformations);

    disabled=false;
    if(transMats.length==0)disabled=true;

    mesh.numInstances=transMats.length/16;

    if(mesh.numInstances==0)
    {
        disabled=true;
        return;
    }

    mesh.setAttribute('instMat',new Float32Array(transMats),16,{"instanced":true});
    mesh.setAttribute('attrTexOffsets',new Float32Array(tcOffsets),2,{"instanced":true});
    mesh.setAttribute('attrTexSize',new Float32Array(tcSize),2,{"instanced":true});

    createMesh=false;

    if(createTexture) generateTexture();
}

function printChars(fontSize,simulate)
{
    var font=getFont();
    if(!simulate) font.chars={};

    var ctx=font.ctx;

    ctx.font = fontSize+'px '+inFont.get();
    ctx.textAlign = "left";

    var posy=0,i=0;
    var posx=0;
    var lineHeight=fontSize*1.4;
    var result=
        {
            "fits":true
        };

    for(var i=0;i<font.characters.length;i++)
    {
        var chStr=String(font.characters.substring(i,i+1));
        var chWidth=(ctx.measureText(chStr).width);

        if(posx+chWidth>=textureSize)
        {
            posy+=lineHeight+2;
            posx=0;
        }

        if(!simulate)
        {
            font.chars[chStr]=
                {
                    str:chStr,
                    texCoordX:posx/textureSize,
                    texCoordY:posy/textureSize,
                    texCoordWidth:chWidth/textureSize,
                    texCoordHeight:lineHeight/textureSize,
                };

            ctx.fillText(chStr, posx, posy+fontSize);
        }

        posx+=chWidth+12;
    }

    if(posy>textureSize-lineHeight)
    {
        result.fits=false;
    }

    result.spaceLeft=textureSize-posy;

    return result;
}

function generateTexture()
{
    var font=getFont();
    var string=String(str.get());
    if(string==null || string==undefined)string='';
    for(var i=0;i<string.length;i++)
    {
        var ch=string.substring(i,i+1);
        if(font.characters.indexOf(ch)==-1)
        {
            font.characters+=ch;
            createTexture=true;
        }
    }

    var ctx=font.ctx;
    font.canvas.width=font.canvas.height=textureSize;

    if(!font.texture)
        font.texture=CGL.Texture.createFromImage(cgl,font.canvas,
            {
                filter:CGL.Texture.FILTER_MIPMAP
            });

    font.texture.setSize(textureSize,textureSize);

    ctx.fillStyle = 'transparent';
    ctx.clearRect(0,0,textureSize,textureSize);
    ctx.fillStyle = 'rgba(255,255,255,255)';

    var fontSize=font.fontSize+40;

    var simu=printChars(fontSize,true);
    while(!simu.fits)
    {
        fontSize-=5;
        simu=printChars(fontSize,true);
    }

    printChars(fontSize,false);

    ctx.restore();

    font.texture.initTexture(font.canvas,CGL.Texture.FILTER_MIPMAP);
    font.texture.unpackAlpha=true;
    textureOut.set(font.texture);

    font.lastChange=CABLES.now();

    createMesh=true;
    createTexture=false;
}


};

Ops.Gl.Meshes.TextMesh.prototype = new CABLES.Op();
CABLES.OPS["780487b9-503c-4e2c-913f-e1ffda7a6329"]={f:Ops.Gl.Meshes.TextMesh,objName:"Ops.Gl.Meshes.TextMesh"};




// **************************************************************
// 
// Ops.Gl.AspectRatio
// 
// **************************************************************

Ops.Gl.AspectRatio = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};

var aspects=[
    { title:"1:2", v:1/2 },
    { title:"1", v:1 },
    { title:"5:4", v:5/4 },
    { title:"4:3", v:4/3 },
    { title:"3:2", v:3/2 },
    { title:"11:8", v:11/8 },
    { title:"16:9", v:16/9 },
    { title:"2:1", v:2 },
    { title:"21:9", v:21/9 },
    { title:"custom", v:0 },
    ];
var aspectTitles=[];
for(var i=0;i<aspects.length;i++) aspectTitles.push(aspects[i].title);

const
    render=op.inTrigger('render'),
    trigger=op.outTrigger('trigger'),
    outWidth=op.outValue("Width"),
    outHeight=op.outValue("Height"),
    inAspect=op.inValueSelect('Aspect Ratio',aspectTitles,aspects[0].title),
    inCustom=op.inValueFloat("Custom",1.777777);
    // blackBars=op.inValueBool("Black Bars");


const cgl=op.patch.cgl;
var w=1000,h=1000,x,y;
var ratio=1;

inAspect.onChange=changedRatio;
inCustom.onChange=changedRatio;

changedRatio();

function changedRatio()
{
    var selected=inAspect.get();
    if(selected=='custom')
    {
        if(inCustom.uiAttribs.greyout) inCustom.setUiAttribs({greyout:false});
        ratio=Math.abs(inCustom.get());
    }
    else
    {
        if(!inCustom.uiAttribs.greyout) inCustom.setUiAttribs({greyout:true});

        for(var i=0;i<aspects.length;i++)
        {
            if(aspects[i].title==selected)
            {
                ratio=aspects[i].v;
                break;
            }
        }
    }
}


function resize()
{
    var _w=cgl.canvasHeight*ratio;
    var _h=cgl.canvasHeight;
    var _x=0;
    var _y=0;
    if(_w>cgl.canvasWidth)
    {
       _w=cgl.canvasWidth;
       _h=cgl.canvasWidth/ratio;
    }

    if(_w<cgl.canvasWidth) _x=(cgl.canvasWidth-_w)/2;
    if(_h<cgl.canvasHeight) _y=(cgl.canvasHeight-_h)/2;


    _w=Math.ceil(_w);
    _h=Math.ceil(_h);
    _x=Math.ceil(_x);
    _y=Math.ceil(_y);

    if(_w!=w || _h!=h || _x!=x ||_y!=y)
    {
        w=_w;
        h=_h;
        x=_x;
        y=_y;

        cgl.setViewPort(x,y,w,h);

        for(var i=0;i<op.patch.ops.length;i++)
            if(op.patch.ops[i].onResize)op.patch.ops[i].onResize();
    }

    outWidth.set(w);
    outHeight.set(h);
}

op.onDelete=function()
{
    cgl.resetViewPort();
};

render.onTriggered=function()
{
    // if(blackBars.get())
    // {
    //     cgl.gl.clearColor(0,0,0,1);
    //     cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    // }

    resize();
    x=Math.round(x);
    y=Math.round(y);
    w=Math.round(w+0.5);
    h=Math.round(h+0.5);

    cgl.setViewPort(x,y,w,h);

    mat4.perspective(cgl.pMatrix,45, ratio, 0.1, 1100.0);

    trigger.trigger();

};


};

Ops.Gl.AspectRatio.prototype = new CABLES.Op();
CABLES.OPS["b4f17994-3028-4203-9a8d-d5e5377a58fc"]={f:Ops.Gl.AspectRatio,objName:"Ops.Gl.AspectRatio"};




// **************************************************************
// 
// Ops.Sidebar.Button
// 
// **************************************************************

Ops.Sidebar.Button = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
var parentPort = op.inObject('link');
var buttonTextPort = op.inValueString('Text', 'Button');

// outputs
var siblingsPort = op.outObject('childs');
var buttonPressedPort = op.outTrigger('Pressed Trigger');

// vars
var el = document.createElement('div');
el.classList.add('sidebar__item');
el.classList.add('sidebar--button');
var input = document.createElement('div');
input.classList.add('sidebar__button-input');
el.appendChild(input);
input.addEventListener('click', onButtonClick);
var inputText = document.createTextNode(buttonTextPort.get());
input.appendChild(inputText);
op.toWorkNeedsParent('Ops.Sidebar.Sidebar');

// events
parentPort.onChange = onParentChanged;
buttonTextPort.onChange = onButtonTextChanged;
op.onDelete = onDelete;

// functions

function onButtonClick() {
    buttonPressedPort.trigger();
}

function onButtonTextChanged() {
    var buttonText = buttonTextPort.get();
    input.textContent = buttonText;
    if(CABLES.UI) {
        op.setTitle('Button: ' + buttonText);
    }
}

function onParentChanged() {
    var parent = parentPort.get();
    if(parent && parent.parentElement) {
        parent.parentElement.appendChild(el);
        siblingsPort.set(null);
        siblingsPort.set(parent);
    } else { // detach
        if(el.parentElement) {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(el) {
    if(el) {
        el.style.display = 'block';
    }
}

function hideElement(el) {
    if(el) {
        el.style.display = 'none';
    }
}

function onDelete() {
    removeElementFromDOM(el);
}

function removeElementFromDOM(el) {
    if(el && el.parentNode && el.parentNode.removeChild) {
        el.parentNode.removeChild(el);
    }
}


};

Ops.Sidebar.Button.prototype = new CABLES.Op();
CABLES.OPS["118df748-16d1-46f4-b8fc-38d7cc5a0aab"]={f:Ops.Sidebar.Button,objName:"Ops.Sidebar.Button"};




// **************************************************************
// 
// Ops.Sidebar.Sidebar
// 
// **************************************************************

Ops.Sidebar.Sidebar = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={style_css:"/*\n * SIDEBAR\n */\n\n.icon-chevron-down {\n\t\n    top: 2px;\n    right: 9px;\n}\n\n.icon-chevron-up {\n\tbackground-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWNoZXZyb24tdXAiPjxwb2x5bGluZSBwb2ludHM9IjE4IDE1IDEyIDkgNiAxNSI+PC9wb2x5bGluZT48L3N2Zz4=);\n    top: 2px;\n    right: 9px;\n}\n.icon-refresh {\n    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcmVmcmVzaC1jdyI+PHBvbHlsaW5lIHBvaW50cz0iMjMgNCAyMyAxMCAxNyAxMCI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPSIxIDIwIDEgMTQgNyAxNCI+PC9wb2x5bGluZT48cGF0aCBkPSJNMy41MSA5YTkgOSAwIDAgMSAxNC44NS0zLjM2TDIzIDEwTTEgMTRsNC42NCA0LjM2QTkgOSAwIDAgMCAyMC40OSAxNSI+PC9wYXRoPjwvc3ZnPg==);\n    height: 100%;\n}\n.icon-back {\n    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcm90YXRlLWNjdyI+PHBvbHlsaW5lIHBvaW50cz0iMSA0IDEgMTAgNyAxMCI+PC9wb2x5bGluZT48cGF0aCBkPSJNMy41MSAxNWE5IDkgMCAxIDAgMi4xMy05LjM2TDEgMTAiPjwvcGF0aD48L3N2Zz4=);\n    height: 100%;\n}\n\n\n.sidebar-cables-right\n{\n    right: 0px;\n    left: initial !important;\n}\n\n.sidebar-cables {\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 100000;\n  color: #BBBBBB;\n  width: 220px;\n  max-height: 100%;\n  box-sizing: border-box;\n  overflow-y: auto;\n  overflow-x: hidden;\n  /* overflow-y: overlay; */\n  /* max-height: 1000px; */\n  /* ransition: max-height 0.5s; */\n  font-size: 13px;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Helvetica, \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", SimSun, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";\n  line-height: 1em; /* prevent emojis from breaking height of the title */\n  --sidebar-border-radius: 4px;\n  --sidebar-monospace-font-stack: \"SFMono-Regular\", Consolas, \"Liberation Mono\", Menlo, Courier, monospace;\n  --sidebar-hover-transition-time: .2s;\n}\n\n.sidebar-cables::selection {\n    background-color: #24baa7;\n    color: #EEEEEE;\n}\n\n.sidebar-cables::-webkit-scrollbar {\n    background-color: transparent;\n    --cables-scrollbar-width: 8px;\n    width: var(--cables-scrollbar-width);\n}\n\n.sidebar-cables::-webkit-scrollbar-track {\n    background-color: transparent;\n    width: var(--cables-scrollbar-width);\n}\n\n.sidebar-cables::-webkit-scrollbar-thumb {\n    background-color: #333333;\n    border-radius: 4px;\n    width: var(--cables-scrollbar-width);\n}\n\n.sidebar-cables--closed {\n  width: auto;\n}\n\n.sidebar__close-button {\n  background-color: #1A1A1A;\n  -webkit-user-select: none;  /* Chrome all / Safari all */\n  -moz-user-select: none;     /* Firefox all */\n  -ms-user-select: none;      /* IE 10+ */\n  user-select: none;          /* Likely future */ \n  transition: background-color var(--sidebar-hover-transition-time);\n  color: #CCCCCC;\n  height: 22px;\n  box-sizing: border-box;\n  padding-top: 2px;\n  text-align: center;\n  cursor: pointer;\n  border-top: 1px solid #272727;\n  border-radius: 0 0 var(--sidebar-border-radius) var(--sidebar-border-radius);\n  opacity: 1.0;\n  transition: opacity 0.3s;\n  overflow: hidden;\n}\n\n.sidebar__close-button-icon {\n    display: inline-block;\n    width: 21px;\n    height: 20px;\n    position: relative;\n    top: -1px;\n    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWNoZXZyb24tdXAiPjxwb2x5bGluZSBwb2ludHM9IjE4IDE1IDEyIDkgNiAxNSI+PC9wb2x5bGluZT48L3N2Zz4=);\n    background-size: cover;\n    background-repeat: no-repeat;\n    background-repeat: no-repeat;\n    background-position: 0 -1px;\n}\n\n.sidebar--closed .sidebar__close-button {\n    margin-top: 8px;\n    margin-left: 8px;\n    padding-top: 13px;\n    padding-left: 11px;\n    padding-right: 11px;\n    width: 46px;\n    height: 46px;\n    border-radius: 50%;\n    cursor: pointer;\n    opacity: 0.3;\n}\n\n.sidebar--closed .sidebar__close-button-icon {\n    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyMnB4IiBoZWlnaHQ9IjE3cHgiIHZpZXdCb3g9IjAgMCAyMiAxNyIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4gICAgICAgIDx0aXRsZT5Hcm91cCAzPC90aXRsZT4gICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+ICAgIDxkZWZzPjwvZGVmcz4gICAgPGcgaWQ9IkNhbnZhcy1TaWRlYmFyIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4gICAgICAgIDxnIGlkPSJEZXNrdG9wLWdyZWVuLWJsdWlzaC1Db3B5LTkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMC4wMDAwMDAsIC0yMi4wMDAwMDApIj4gICAgICAgICAgICA8ZyBpZD0iR3JvdXAtMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAuMDAwMDAwLCAyMi4wMDAwMDApIj4gICAgICAgICAgICAgICAgPHBhdGggZD0iTTAuNSwyLjUgTDIuNSwyLjUiIGlkPSJMaW5lLTIiIHN0cm9rZT0iIzk3OTc5NyIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSI+PC9wYXRoPiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTAuNSwyLjUgTDIxLjUsMi41IiBpZD0iTGluZS0yIiBzdHJva2U9IiM5Nzk3OTciIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiPjwvcGF0aD4gICAgICAgICAgICAgICAgPHBhdGggZD0iTTAuNSw4LjUgTDExLjUsOC41IiBpZD0iTGluZS0yIiBzdHJva2U9IiM5Nzk3OTciIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiPjwvcGF0aD4gICAgICAgICAgICAgICAgPHBhdGggZD0iTTE5LjUsOC41IEwyMS41LDguNSIgaWQ9IkxpbmUtMiIgc3Ryb2tlPSIjOTc5Nzk3IiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIj48L3BhdGg+ICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0wLjUsMTQuNSBMNS41LDE0LjUiIGlkPSJMaW5lLTIiIHN0cm9rZT0iIzk3OTc5NyIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSI+PC9wYXRoPiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTMuNSwxNC41IEwyMS41LDE0LjUiIGlkPSJMaW5lLTIiIHN0cm9rZT0iIzk3OTc5NyIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSI+PC9wYXRoPiAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTMiIGZpbGw9IiM5Nzk3OTciIGN4PSI2LjUiIGN5PSIyLjUiIHI9IjIuNSI+PC9jaXJjbGU+ICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwtMyIgZmlsbD0iIzk3OTc5NyIgY3g9IjE1LjUiIGN5PSI4LjUiIHI9IjIuNSI+PC9jaXJjbGU+ICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwtMyIgZmlsbD0iIzk3OTc5NyIgY3g9IjkuNSIgY3k9IjE0LjUiIHI9IjIuNSI+PC9jaXJjbGU+ICAgICAgICAgICAgPC9nPiAgICAgICAgPC9nPiAgICA8L2c+PC9zdmc+);\n    background-position: 0px 0px;\n}\n\n.sidebar__close-button:hover {\n  background-color: #111111;\n  opacity: 1.0 !important;\n}\n\n/*\n * SIDEBAR ITEMS\n */\n\n.sidebar__items {\n  /* max-height: 1000px; */\n  /* transition: max-height 0.5;*/ \n}\n\n.sidebar--closed .sidebar__items {\n  /* max-height: 0; */\n  height: 0;\n  display: none;\n  pointer-interactions: none;\n}\n\n/*\n * SIDEBAR GROUP\n */\n\n.sidebar__group {\n  background-color: #1A1A1A;\n  overflow: hidden;\n  box-sizing: border-box;\n  animate: height;\n  /* max-height: 1000px; */\n  /* transition: max-height 0.5s; */\n  --sidebar-group-header-height: 28px;\n}\n\n.sidebar__group--closed {\n  /* max-height: 13px; */\n  height: var(--sidebar-group-header-height);\n}\n\n.sidebar__group-header {\n  box-sizing: border-box;\n  color: #EEEEEE;\n  -webkit-user-select: none;  /* Chrome all / Safari all */\n  -moz-user-select: none;     /* Firefox all */\n  -ms-user-select: none;      /* IE 10+ */\n  user-select: none;          /* Likely future */ \n  height: var(--sidebar-group-header-height);\n  padding-top: 7px;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  cursor: pointer;\n  transition: background-color var(--sidebar-hover-transition-time);\n  position: relative;\n}\n\n.sidebar__group-header:hover {\n  background-color: #111111;\n}\n\n.sidebar__group-header-title {\n  text-align: center;\n  overflow: hidden;\n  padding: 0 24px;\n}\n\n.sidebar__group-header-icon {\n    width: 17px;\n    height: 14px;\n    background-repeat: no-repeat;\n    display: inline-block;\n    position: absolute;\n    background-size: cover;\n    \n    /* icon open */\n    /* feather icon: chevron up */\n    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWNoZXZyb24tdXAiPjxwb2x5bGluZSBwb2ludHM9IjE4IDE1IDEyIDkgNiAxNSI+PC9wb2x5bGluZT48L3N2Zz4=);\n    top: 4px;\n    right: 5px;\n    opacity: 0.0;\n    transition: opacity 0.3;\n}\n\n.sidebar__group-header:hover .sidebar__group-header-icon {\n    opacity: 1.0;\n}\n\n/* icon closed */\n.sidebar__group--closed .sidebar__group-header-icon {\n    /* feather icon: chevron down */\n    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWNoZXZyb24tZG93biI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+);\n    top: 4px;\n    right: 5px;\n}\n\n/*\n * SIDEBAR ITEM\n */\n\n.sidebar__item {\n  background-color: #222222;\n  box-sizing: border-box;\n  padding: 7px;\n}\n\n.sidebar__item-label {\n  display: inline-block;\n  -webkit-user-select: none;  /* Chrome all / Safari all */\n  -moz-user-select: none;     /* Firefox all */\n  -ms-user-select: none;      /* IE 10+ */\n  user-select: none;          /* Likely future */ \n  width: calc(50% - 7px);\n  margin-right: 7px;\n  max-height: 1em;\n  text-overflow: ellipsis;\n  /* overflow: hidden; */\n}\n\n.sidebar__item-value-label {\n  font-family: var(--sidebar-monospace-font-stack);\n  display: inline-block;\n  text-overflow: ellipsis;\n  overflow: hidden;\n  white-space: nowrap;\n  max-width: 50%;\n}\n\n.sidebar__item-value-label::selection {\n    background-color: #24baa7;\n    color: #EEEEEE;\n}\n\n.sidebar__item + .sidebar__item,\n.sidebar__item + .sidebar__group,\n.sidebar__group + .sidebar__item,\n.sidebar__group + .sidebar__group {\n  border-top: 1px solid #272727;\n}\n\n/*\n * SIDEBAR ITEM TOGGLE\n */\n\n.sidebar__toggle {\n    cursor: pointer;    \n}\n\n.sidebar__toggle-input {\n  --sidebar-toggle-input-color: #CCCCCC;\n  --sidebar-toggle-input-color-hover: #EEEEEE;\n  --sidebar-toggle-input-border-size: 2px;\n  display: inline;\n  float: right;\n  box-sizing: border-box;\n  border-radius: 50%;\n  cursor: pointer;\n  --toggle-size: 11px;\n  margin-top: 2px;\n  background-color: transparent;\n  border: var(--sidebar-toggle-input-border-size) solid var(--sidebar-toggle-input-color);\n  width: var(--toggle-size);\n  height: var(--toggle-size);\n  transition: background-color var(--sidebar-hover-transition-time);\n  transition: border-color var(--sidebar-hover-transition-time);\n}\n.sidebar__toggle:hover .sidebar__toggle-input {\n  border-color: var(--sidebar-toggle-input-color-hover);\n}\n\n.sidebar__toggle .sidebar__item-value-label {\n  -webkit-user-select: none;  /* Chrome all / Safari all */\n  -moz-user-select: none;     /* Firefox all */\n  -ms-user-select: none;      /* IE 10+ */\n  user-select: none;          /* Likely future */ \n  max-width: calc(50% - 12px);\n}\n.sidebar__toggle-input::after { clear: both; }\n\n.sidebar__toggle--active .sidebar__toggle-input {\n  transition: background-color var(--sidebar-hover-transition-time);\n  background-color: var(--sidebar-toggle-input-color);\n}\n.sidebar__toggle--active .sidebar__toggle-input:hover {\n  background-color: var(--sidebar-toggle-input-color-hover);\n  border-color: var(--sidebar-toggle-input-color-hover);\n  transition: background-color var(--sidebar-hover-transition-time);\n  transition: border-color var(--sidebar-hover-transition-time);\n}\n\n/*\n * SIDEBAR ITEM BUTTON\n */\n\n.sidebar__button {}\n\n.sidebar__button-input {\n  -webkit-user-select: none;  /* Chrome all / Safari all */\n  -moz-user-select: none;     /* Firefox all */\n  -ms-user-select: none;      /* IE 10+ */\n  user-select: none;          /* Likely future */ \n  height: 24px;\n  background-color: #444444;\n  color: #CCCCCC;\n  box-sizing: border-box;\n  padding-top: 5px;\n  text-align: center;\n  border-radius: var(--sidebar-border-radius);\n  cursor: pointer;\n}\n\n.sidebar__button-input:hover {\n  background-color: #555555;\n}\n\n/*\n * VALUE DISPLAY (shows a value)\n */\n\n.sidebar__value-display {}\n\n/*\n * SLIDER\n */\n\n.sidebar__slider {\n  --sidebar-slider-input-height: 18px;\n}\n\n.sidebar__slider-input-wrapper {\n  width: 100%;\n  margin-top: 10px;\n  position: relative;\n}\n\n.sidebar__slider-input {\n  -webkit-appearance: none;  /* Override default CSS styles */\n  appearance: none;\n  margin: 0;\n  width: 100%;\n  height: var(--sidebar-slider-input-height);\n  background: #333333;\n  cursor: pointer;\n  outline: none;\n  -webkit-transition: .2s; /* 0.2 seconds transition on hover */\n  transition: background-color .2s;\n  border: none;\n}\n\n.sidebar__slider-input:focus, .sidebar__slider-input:hover {\n    border: none;\n}\n\n.sidebar__slider-input-active-track {\n  position: absolute;\n  top: 0;\n  left: 0;\n  background-color: #CCCCCC; \n  pointer-events: none;\n  height: var(--sidebar-slider-input-height);\n  /* width: 10px; */\n}\n\n/* Mouse-over effects */\n.sidebar__slider-input:hover {\n  background-color: #444444;\n}\n\n/* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */ \n.sidebar__slider-input::-webkit-slider-thumb {\n    -webkit-appearance: none; /* Override default look */\n    appearance: none;\n    width: var(--sidebar-slider-input-height);\n    /* width: 0 !important; */\n    height: var(--sidebar-slider-input-height);\n    background: #EEEEEE !important;\n    z-index: 999999999999 !important;\n    border: none;\n    border-radius: 0 !important;\n    cursor: pointer;\n}\n.sidebar__slider-input:hover ::-webkit-slider-thumb {\n  background-color: #EEEEEE !important;\n}\n\n.sidebar__slider-input::-moz-range-thumb {\n    /* width: var(--sidebar-slider-input-height); */\n    width: 0 !important;\n    height: var(--sidebar-slider-input-height);\n    background: #EEEEEE;\n    cursor: pointer;\n    border-radius: 0 !important;\n    border: none;\n    outline: 0;\n    z-index: 99999999999999999 !important;\n}\n\n.sidebar__slider-input::-moz-range-track {\n  background-color: transparent;\n}\n\n.sidebar__slider-input::-moz-range-thumb:hover {\n  /* background-color: #EEEEEE; */\n}\n\n.sidebar__slider-input-wrapper:hover .sidebar__slider-input-active-track {\n  background-color: #EEEEEE;  \n}\n\n.sidebar__slider-input-wrapper:hover .sidebar__slider-input::-moz-range-thumb {\n  background-color: #EEEEEE !important;  \n}\n\n.sidebar__slider-input-wrapper:hover .sidebar__slider-input::-webkit-slider-thumb {\n  background-color: #EEEEEE;  \n}\n\n.sidebar__slider input[type=text] {\n    box-sizing: border-box;\n    background-color: #333333;\n    color: #BBBBBB;\n    display: inline-block;\n    width: 50%;\n    height: 18px;\n    outline: none;\n    border: none;\n    border-radius: 0;\n    padding: 0 0 0 4px !important;\n    margin: 0;\n} \n\n.sidebar__slider input[type=text]:active, \n.sidebar__slider input[type=text]:focus,\n.sidebar__slider input[type=text]:hover {\n    background-color: #444444;\n    color: #EEEEEE;\n}\n\n/*\n * TEXT / DESCRIPTION\n */\n \n.sidebar__text .sidebar__item-label {\n    width: auto;\n    display: block;\n    max-height: none;\n    margin-right: 0;\n    line-height: 1.1em;\n} \n\n/*\n * SIDEBAR INPUT\n */\n.sidebar__text-input input[type=text] {\n    box-sizing: border-box;\n    background-color: #333333;\n    color: #BBBBBB;\n    display: inline-block;\n    width: 50%;\n    height: 18px;\n    outline: none;\n    border: none;\n    border-radius: 0;\n    padding: 0 0 0 4px !important;\n    margin: 0;\n} \n\n.sidebar__text-input input[type=text]:active, \n.sidebar__text-input input[type=text]:focus,\n.sidebar__text-input input[type=text]:hover {\n    background-color: #444444;\n    color: #EEEEEE;\n}\n\n/*\n * SIDEBAR SELECT\n */\n \n .sidebar__select {}\n .sidebar__select-select {\n    color: #BBBBBB;\n    -webkit-appearance: none; \n    -moz-appearance: none;\n    appearance: none;\n    box-sizing: border-box;\n    width: 50%;\n    height: 18px;\n    background-color: #333333;\n    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWNoZXZyb24tZG93biI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+);\n    background-repeat: no-repeat;\n    background-position: 87px 1px;\n    background-size: 16px 16px;\n    margin: 0;\n    padding: 0 0 0 4px;\n    border-radius: 0;\n    border: none;\n    cursor: pointer;\n    outline: none;\n }\n \n.sidebar__select-select:hover,\n.sidebar__select-select:active,\n.sidebar__select-select:active {\n    background-color: #444444;\n    color: #EEEEEE;\n}\n\n/*\n * COLOR PICKER\n */\n \n .sidebar__color-picker-color-input {}\n \n .sidebar__color-picker input[type=text] {\n    box-sizing: border-box;\n    background-color: #333333;\n    color: #BBBBBB;\n    display: inline-block;\n    width: calc(50% - 21px); /* 50% minus space of picker circle */\n    height: 18px;\n    outline: none;\n    border: none;\n    border-radius: 0;\n    padding: 0 0 0 4px !important;\n    margin: 0;\n    margin-right: 7px;\n} \n\n.sidebar__color-picker input[type=text]:active, \n.sidebar__color-picker input[type=text]:focus,\n.sidebar__color-picker input[type=text]:hover {\n    background-color: #444444;\n    color: #EEEEEE;\n}\n\n.sidebar__color-picker input[type=color],\n.sidebar__palette-picker input[type=color] {\n    display: inline-block;\n    border-radius: 100%;\n    height: 14px;\n    width: 14px;\n    padding: 0;\n    border: none;\n    border-color: transparent;\n    outline: none;\n    background: none;\n    appearance: none;\n    -moz-appearance: none;\n    -webkit-appearance: none;\n    cursor: pointer;\n    position: relative;\n    top: 3px;\n}\n.sidebar__color-picker input[type=color]:focus,\n.sidebar__palette-picker input[type=color]:focus {\n    outline: none;\n}\n.sidebar__color-picker input[type=color]::-moz-color-swatch,\n.sidebar__palette-picker input[type=color]::-moz-color-swatch {\n    border: none;\n}\n.sidebar__color-picker input[type=color]::-webkit-color-swatch-wrapper,\n.sidebar__palette-picker input[type=color]::-webkit-color-swatch-wrapper {\n    padding: 0;\t\n}\n.sidebar__color-picker input[type=color]::-webkit-color-swatch,\n.sidebar__palette-picker input[type=color]::-webkit-color-swatch {\n    border: none;\n    border-radius: 100%;\n}\n\n/*\n * Palette Picker\n */\n.sidebar__palette-picker .sidebar__palette-picker-color-input.first {\n    margin-left: 0;\n}\n.sidebar__palette-picker .sidebar__palette-picker-color-input.last {\n    margin-right: 0;\n}\n.sidebar__palette-picker .sidebar__palette-picker-color-input {\n    margin: 0 4px;\n}\n\n.sidebar__palette-picker .circlebutton {\n    width: 14px;\n    height: 14px;\n    border-radius: 1em;\n    display: inline-block;\n    top: 3px;\n    position: relative;\n}\n\n/*\n * Preset\n */\n.sidebar__item-presets-preset\n{\n    padding:4px;\n    cursor:pointer;\n    padding-left:8px;\n    padding-right:8px;\n    margin-right:4px;\n    background-color:#444;\n\n}\n\n.sidebar__item-presets-preset:hover\n{\n    background-color:#666;\n}",};
// vars
const CSS_ELEMENT_CLASS = 'cables-sidebar-style'; /* class for the style element to be generated */
const CSS_ELEMENT_DYNAMIC_CLASS = 'cables-sidebar-dynamic-style'; /* things which can be set via op-port, but not attached to the elements themselves, e.g. minimized opacity */
const SIDEBAR_CLASS = 'sidebar-cables';
const SIDEBAR_ID = 'sidebar'+CABLES.uuid();
const SIDEBAR_ITEMS_CLASS = 'sidebar__items';
const SIDEBAR_OPEN_CLOSE_BTN_CLASS = 'sidebar__close-button';
const SIDEBAR_OPEN_CLOSE_BTN_ICON_CLASS = 'sidebar__close-button-icon';
const BTN_TEXT_OPEN = ''; // 'Close';
const BTN_TEXT_CLOSED = ''; // 'Show Controls';
var cssFileContent = attachments.style_css; /* the CSS style attachment */
let openCloseBtn = null;
let openCloseBtnIcon = null;

// inputs
var visiblePort = op.inValueBool("Visible", true);
var opacityPort = op.inValueSlider('Opacity', 1);
var defaultMinimizedPort = op.inValueBool('Default Minimized');
var minimizedOpacityPort = op.inValueSlider('Minimized Opacity', 0.5);

var side = op.inValueBool('Side');

// outputs
var childrenPort = op.outObject('childs');

var sidebarEl = document.querySelector('.' + SIDEBAR_ID);
if(!sidebarEl) {
    sidebarEl = initSidebarElement();    
}
var sidebarItemsEl = sidebarEl.querySelector('.' + SIDEBAR_ITEMS_CLASS);
childrenPort.set({
    parentElement: sidebarItemsEl,
    parentOp: op,
});
onDefaultMinimizedPortChanged();
initSidebarCss();
updateDynamicStyles();

// change listeners
visiblePort.onChange = onVisiblePortChange;
opacityPort.onChange = onOpacityPortChange;
defaultMinimizedPort.onChange = onDefaultMinimizedPortChanged;
minimizedOpacityPort.onChange = onMinimizedOpacityPortChanged;
op.onDelete = onDelete;

// functions

function onMinimizedOpacityPortChanged() {
    updateDynamicStyles();
}

side.onChange=function()
{
    if(side.get()) sidebarEl.classList.add('sidebar-cables-right');
        else sidebarEl.classList.remove('sidebar-cables-right');
};


function onDefaultMinimizedPortChanged() {
    if(!openCloseBtn) { return; }
    if(defaultMinimizedPort.get()) {
        sidebarEl.classList.add('sidebar-cables--closed');
        // openCloseBtn.textContent = BTN_TEXT_CLOSED;
    } else {
        sidebarEl.classList.remove('sidebar-cables--closed');
        // openCloseBtn.textContent = BTN_TEXT_OPEN;
    }
}

function onOpacityPortChange()
{
    var opacity = opacityPort.get();
    sidebarEl.style.opacity = opacity;
}

function onVisiblePortChange() {
    if(visiblePort.get()) {
        sidebarEl.style.display = 'block';
    } else {
        sidebarEl.style.display = 'none';
    }
}

side.onChanged=function()
{
    
};

/**
 * Some styles cannot be set directly inline, so a dynamic stylesheet is needed.
 * Here hover states can be set later on e.g.
 */
function updateDynamicStyles() {
    let dynamicStyles = document.querySelectorAll('.' + CSS_ELEMENT_DYNAMIC_CLASS);
    if(dynamicStyles) {
        dynamicStyles.forEach(function(e) {
            e.parentNode.removeChild(e);
        });    
    }
    let newDynamicStyle = document.createElement('style');
    newDynamicStyle.classList.add(CSS_ELEMENT_DYNAMIC_CLASS);
    let cssText = '.sidebar--closed .sidebar__close-button { ';
    cssText +=         'opacity: ' + minimizedOpacityPort.get();
    cssText +=     '}';
    let cssTextEl = document.createTextNode(cssText);
    newDynamicStyle.appendChild(cssTextEl);
    document.body.appendChild(newDynamicStyle);
}

function initSidebarElement() {
    var element = document.createElement('div');
    element.classList.add(SIDEBAR_CLASS);
    element.classList.add(SIDEBAR_ID);
        var canvasWrapper = op.patch.cgl.canvas.parentElement; /* maybe this is bad outside cables!? */
    canvasWrapper.appendChild(element);
    var items = document.createElement('div');
    items.classList.add(SIDEBAR_ITEMS_CLASS);
    element.appendChild(items);
    openCloseBtn = document.createElement('div');
    openCloseBtn.classList.add(SIDEBAR_OPEN_CLOSE_BTN_CLASS);
    openCloseBtn.addEventListener('click', onOpenCloseBtnClick);
    // openCloseBtn.textContent = BTN_TEXT_OPEN;
    element.appendChild(openCloseBtn);
    openCloseBtnIcon = document.createElement('span');
    openCloseBtnIcon.classList.add(SIDEBAR_OPEN_CLOSE_BTN_ICON_CLASS);
    openCloseBtn.appendChild(openCloseBtnIcon);
    return element;
}

function onOpenCloseBtnClick(ev) {
  ev.stopPropagation();
  const sidebarEl = ev.target.closest('.' + SIDEBAR_CLASS);
  if(!sidebarEl) { console.error('Sidebar could not be closed...'); return; }
  sidebarEl.classList.toggle('sidebar--closed');
  const btn = ev.target;
  let btnText = BTN_TEXT_OPEN;
  if(sidebarEl.classList.contains('sidebar--closed')) {
    btnText = BTN_TEXT_CLOSED;
   }
   // btn.textContent = btnText
}

function initSidebarCss() {
    //var cssEl = document.getElementById(CSS_ELEMENT_ID);
    var cssElements = document.querySelectorAll('.' + CSS_ELEMENT_CLASS);
    // remove old script tag
    if(cssElements) {
        cssElements.forEach(function(e) {
            e.parentNode.removeChild(e);
        });
    }
    var newStyle = document.createElement('style');
    newStyle.innerHTML = cssFileContent;
    newStyle.classList.add(CSS_ELEMENT_CLASS);
    document.body.appendChild(newStyle);
}

function onDelete() {
    removeElementFromDOM(sidebarEl);
}

function removeElementFromDOM(el) {
    if(el && el.parentNode && el.parentNode.removeChild) {
        el.parentNode.removeChild(el);    
    }
}



};

Ops.Sidebar.Sidebar.prototype = new CABLES.Op();
CABLES.OPS["5a681c35-78ce-4cb3-9858-bc79c34c6819"]={f:Ops.Sidebar.Sidebar,objName:"Ops.Sidebar.Sidebar"};




// **************************************************************
// 
// Ops.Math.Sine
// 
// **************************************************************

Ops.Math.Sine = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// input
var value = op.inValue('value');

var phase = op.inValue('phase', 0.0);
var mul = op.inValue('frequency', 1.0);
var amplitude = op.inValue('amplitude', 1.0);
var invert = op.inValueBool("asine", false);

// output
var result = op.outValue('result');

var calculate = Math.sin;

phase.onChange = 
value.onChange = function()
{
    result.set(
        amplitude.get() * calculate( ( value.get()*mul.get() ) + phase.get() )
    );
};

invert.onChange = function()
{
    if(invert.get()) calculate = Math.asin;
    else calculate = Math.sin;
}


};

Ops.Math.Sine.prototype = new CABLES.Op();
CABLES.OPS["d24da018-9f3d-428b-85c9-6ff14d77548b"]={f:Ops.Math.Sine,objName:"Ops.Math.Sine"};




// **************************************************************
// 
// Ops.Math.Multiply
// 
// **************************************************************

Ops.Math.Multiply = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const number1=op.inValueFloat("number1");
const number2=op.inValueFloat("number2");
const result=op.outValue("result");

number1.set(1);
number2.set(2);

number1.onChange=update;
number2.onChange=update;
update();

function update()
{
    const n1=number1.get();
    const n2=number2.get();

    if(isNaN(n1))n1=0;
    if(isNaN(n2))n2=0;

    result.set( n1*n2 );
}



};

Ops.Math.Multiply.prototype = new CABLES.Op();
CABLES.OPS["1bbdae06-fbb2-489b-9bcc-36c9d65bd441"]={f:Ops.Math.Multiply,objName:"Ops.Math.Multiply"};




// **************************************************************
// 
// Ops.Anim.Timer
// 
// **************************************************************

Ops.Anim.Timer = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var playPause=op.inValueBool("Play",true);
var reset=op.inTriggerButton("Reset");
var outTime=op.outValue("Time");
var inSpeed=op.inValue("Speed",1);

var timer=new CABLES.Timer();

playPause.onChange=setState;
setState();

function setState()
{
    if(playPause.get())
    {
        timer.play();
        op.patch.addOnAnimFrame(op);
    }
    else
    {
        timer.pause();
        op.patch.removeOnAnimFrame(op);
    }
}

reset.onTriggered=function()
{
    timer.setTime(0);
    outTime.set(0);
};

op.onAnimFrame=function()
{
    timer.update();
    outTime.set(timer.get()*inSpeed.get());

};


};

Ops.Anim.Timer.prototype = new CABLES.Op();
CABLES.OPS["65ae3c2e-90d7-48fe-93df-30245f0bcf34"]={f:Ops.Anim.Timer,objName:"Ops.Anim.Timer"};




// **************************************************************
// 
// Ops.Devices.Mouse.Mouse
// 
// **************************************************************

Ops.Devices.Mouse.Mouse = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    relative=op.inValueBool("relative"),
    normalize=op.inValueBool("normalize"),
    active=op.inValueBool("Active",true),
    smooth=op.inValueBool("smooth"),
    smoothSpeed=op.inValueFloat("smoothSpeed",20),
    area=op.inValueSelect("Area",['Canvas','Document','Parent Element'],"Canvas"),
    multiply=op.inValueFloat("multiply",1),
    flipY=op.inValueBool("flip y",true),
    outMouseX=op.outValue("x"),
    outMouseY=op.outValue("y"),
    mouseDown=op.outValueBool("button down"),
    mouseClick=op.outTrigger("click"),
    mouseUp=op.outTrigger("Button Up"),
    mouseClickRight=op.outTrigger("click right"),
    mouseOver=op.outValueBool("mouseOver"),
    outButton=op.outValue("button");

var smoothTimer=0;
var cgl=op.patch.cgl;
var listenerElement=null;

function setValue(x,y)
{
    if(normalize.get())
    {
        var w=cgl.canvas.width;
        var h=cgl.canvas.height;
        if(listenerElement==document.body)
        {
            w=listenerElement.clientWidth;
            h=listenerElement.clientHeight;
        }
        outMouseX.set( (x/w*2.0-1.0)*multiply.get() );
        outMouseY.set( (y/h*2.0-1.0)*multiply.get() );
    }
    else
    {
        outMouseX.set( x*multiply.get() );
        outMouseY.set( y*multiply.get() );
    }
}

smooth.onChange=function()
{
    if(smooth.get()) smoothTimer = setInterval(updateSmooth, 5);
        else if(smoothTimer)clearTimeout(smoothTimer);
};

var smoothX,smoothY;
var lineX=0,lineY=0;

normalize.onChange=function()
{
    mouseX=0;
    mouseY=0;
    setValue(mouseX,mouseY);
};

var mouseX=cgl.canvas.width/2;
var mouseY=cgl.canvas.height/2;

lineX=mouseX;
lineY=mouseY;

outMouseX.set(mouseX);
outMouseY.set(mouseY);

var relLastX=0;
var relLastY=0;
var offsetX=0;
var offsetY=0;
addListeners();

area.onChange=addListeners;

var speed=0;

function updateSmooth()
{
    speed=smoothSpeed.get();
    if(speed<=0)speed=0.01;
    var distanceX = Math.abs(mouseX - lineX);
    var speedX = Math.round( distanceX / speed, 0 );
    lineX = (lineX < mouseX) ? lineX + speedX : lineX - speedX;

    var distanceY = Math.abs(mouseY - lineY);
    var speedY = Math.round( distanceY / speed, 0 );
    lineY = (lineY < mouseY) ? lineY + speedY : lineY - speedY;

    setValue(lineX,lineY);
}

function onMouseEnter(e)
{
    mouseDown.set(false);
    mouseOver.set(true);
    speed=smoothSpeed.get();
}

function onMouseDown(e)
{
    outButton.set(e.which);
    mouseDown.set(true);
}

function onMouseUp(e)
{
    outButton.set(0);
    mouseDown.set(false);
    mouseUp.trigger();
}

function onClickRight(e)
{
    mouseClickRight.trigger();
    e.preventDefault();
}

function onmouseclick(e)
{
    mouseClick.trigger();
}


function onMouseLeave(e)
{
    relLastX=0;
    relLastY=0;

    speed=100;

    if(area.get()!='Document')
    {
        // leave anim
        if(smooth.get())
        {
            mouseX=cgl.canvas.width/2;
            mouseY=cgl.canvas.height/2;
        }

    }
    mouseOver.set(false);
    mouseDown.set(false);
}

relative.onChange=function()
{
    offsetX=0;
    offsetY=0;
}

function onmousemove(e)
{
    mouseOver.set(true);

    if(!relative.get())
    {
        if(area.get()!="Document")
        {
            offsetX=e.offsetX;
            offsetY=e.offsetY;
        }
        else
        {
            offsetX=e.clientX;
            offsetY=e.clientY;
        }

        if(smooth.get())
        {
            mouseX=offsetX;

            if(flipY.get()) mouseY=listenerElement.clientHeight-offsetY;
                else mouseY=offsetY;
        }
        else
        {
            if(flipY.get()) setValue(offsetX,listenerElement.clientHeight-offsetY);
                else setValue(offsetX,offsetY);
        }
    }
    else
    {
        if(relLastX!=0 && relLastY!=0)
        {
            offsetX=e.offsetX-relLastX;
            offsetY=e.offsetY-relLastY;
        }
        else
        {

        }

        relLastX=e.offsetX;
        relLastY=e.offsetY;

        mouseX+=offsetX;
        mouseY+=offsetY;

        if(mouseY>460)mouseY=460;
    }
};

function ontouchstart(event)
{
    mouseDown.set(true);

    if(event.touches && event.touches.length>0) onMouseDown(event.touches[0]);
}

function ontouchend(event)
{
    mouseDown.set(false);
    onMouseUp();
}

function removeListeners()
{
    listenerElement.removeEventListener('touchend', ontouchend);
    listenerElement.removeEventListener('touchstart', ontouchstart);

    listenerElement.removeEventListener('click', onmouseclick);
    listenerElement.removeEventListener('mousemove', onmousemove);
    listenerElement.removeEventListener('mouseleave', onMouseLeave);
    listenerElement.removeEventListener('mousedown', onMouseDown);
    listenerElement.removeEventListener('mouseup', onMouseUp);
    listenerElement.removeEventListener('mouseenter', onMouseEnter);
    listenerElement.removeEventListener('contextmenu', onClickRight);
    listenerElement=null;
}

function addListeners()
{
    if(listenerElement)removeListeners();

    listenerElement=cgl.canvas;
    if(area.get()=='Document') listenerElement=document.body;
    if(area.get()=='Parent Element') listenerElement=cgl.canvas.parentElement;

    listenerElement.addEventListener('touchend', ontouchend);
    listenerElement.addEventListener('touchstart', ontouchstart);

    listenerElement.addEventListener('click', onmouseclick);
    listenerElement.addEventListener('mousemove', onmousemove);
    listenerElement.addEventListener('mouseleave', onMouseLeave);
    listenerElement.addEventListener('mousedown', onMouseDown);
    listenerElement.addEventListener('mouseup', onMouseUp);
    listenerElement.addEventListener('mouseenter', onMouseEnter);
    listenerElement.addEventListener('contextmenu', onClickRight);
}

active.onChange=function()
{
    if(listenerElement)removeListeners();
    if(active.get())addListeners();
}

op.onDelete=function()
{
    removeListeners();
};

addListeners();


};

Ops.Devices.Mouse.Mouse.prototype = new CABLES.Op();
CABLES.OPS["0bf51f3e-3161-4cc5-aecf-6e9160089fd2"]={f:Ops.Devices.Mouse.Mouse,objName:"Ops.Devices.Mouse.Mouse"};




// **************************************************************
// 
// Ops.Math.MapRange
// 
// **************************************************************

Ops.Math.MapRange = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};

const result=op.outValue("result");
var v=op.inValueFloat("value");
var old_min=op.inValueFloat("old min");
var old_max=op.inValueFloat("old max");
var new_min=op.inValueFloat("new min");
var new_max=op.inValueFloat("new max");
var easing=op.inValueSelect("Easing",["Linear","Smoothstep","Smootherstep"],"Linear");

op.setPortGroup("Input Range",[old_min,old_max]);
op.setPortGroup("Output Range",[new_min,new_max]);

var ease=0;
var r=0;

easing.onChange=function()
{
    if(easing.get()=="Smoothstep") ease=1;
        else if(easing.get()=="Smootherstep") ease=2;
            else ease=0;
};


function exec()
{
    if(v.get()>=Math.max( old_max.get(),old_min.get() ))
    {
        result.set(new_max.get());
        return;
    }
    else
    if(v.get()<=Math.min( old_max.get(),old_min.get() ))
    {
        result.set(new_min.get());
        return;
    }

    var nMin=new_min.get();
    var nMax=new_max.get();
    var oMin=old_min.get();
    var oMax=old_max.get();
    var x=v.get();

    var reverseInput = false;
    var oldMin = Math.min( oMin, oMax );
    var oldMax = Math.max( oMin, oMax );
    if(oldMin!= oMin) reverseInput = true;

    var reverseOutput = false;
    var newMin = Math.min( nMin, nMax );
    var newMax = Math.max( nMin, nMax );
    if(newMin != nMin) reverseOutput = true;

    var portion=0;

    if(reverseInput) portion = (oldMax-x)*(newMax-newMin)/(oldMax-oldMin);
        else portion = (x-oldMin)*(newMax-newMin)/(oldMax-oldMin);

    if(reverseOutput) r=newMax - portion;
        else r=portion + newMin;

    if(ease===0)
    {
        result.set(r);
    }
    else
    if(ease==1)
    {
        x = Math.max(0, Math.min(1, (r-nMin)/(nMax-nMin)));
        result.set( nMin+x*x*(3 - 2*x)* (nMax-nMin) ); // smoothstep
    }
    else
    if(ease==2)
    {
        x = Math.max(0, Math.min(1, (r-nMin)/(nMax-nMin)));
        result.set( nMin+x*x*x*(x*(x*6 - 15) + 10) * (nMax-nMin) ) ; // smootherstep
    }

}

v.set(0);
old_min.set(0);
old_max.set(1);
new_min.set(-1);
new_max.set(1);


v.onChange=exec;
old_min.onChange=exec;
old_max.onChange=exec;
new_min.onChange=exec;
new_max.onChange=exec;

result.set(0);

exec();

};

Ops.Math.MapRange.prototype = new CABLES.Op();
CABLES.OPS["2617b407-60a0-4ff6-b4a7-18136cfa7817"]={f:Ops.Math.MapRange,objName:"Ops.Math.MapRange"};




// **************************************************************
// 
// Ops.Trigger.IfEqualsThen
// 
// **************************************************************

Ops.Trigger.IfEqualsThen = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const exe=op.inTrigger("exe");
var value1=op.inValue("Value 1",0);
var value2=op.inValue("Value 2",0);

var triggerThen=op.addOutPort(new CABLES.Port(op,"then",CABLES.OP_PORT_TYPE_FUNCTION));
var triggerElse=op.addOutPort(new CABLES.Port(op,"else",CABLES.OP_PORT_TYPE_FUNCTION));

function exec()
{
    if(value1.get()==value2.get() )
    {
        triggerThen.trigger();
    }
    else
    {
        triggerElse.trigger();
    }
}

exe.onTriggered=exec;


};

Ops.Trigger.IfEqualsThen.prototype = new CABLES.Op();
CABLES.OPS["e8196d70-d0a6-470a-9448-a7ac0c0e956e"]={f:Ops.Trigger.IfEqualsThen,objName:"Ops.Trigger.IfEqualsThen"};




// **************************************************************
// 
// Ops.Value.ValueSwitcher
// 
// **************************************************************

Ops.Value.ValueSwitcher = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var currentVal=op.outValue("Value");
var oldVal=op.outValue("Last Value");
var triggered=op.outTrigger("Triggered");

var triggers=[];
var inVals=[];
var inExes=[];

function onTrigger()
{
    oldVal.set(currentVal.get());
    currentVal.set( inVals[this.slot].get() );
    triggered.trigger();
}

var num=8;
for(var i=0;i<num;i++)
{
    var newExe=op.addInPort(new CABLES.Port(op,"Trigger "+i,CABLES.OP_PORT_TYPE_FUNCTION));
    newExe.slot=i;
    newExe.onTriggered=onTrigger.bind(newExe);
    var newVal=op.addInPort(new CABLES.Port(op,"Value "+i,CABLES.OP_PORT_TYPE_VALUE));
    inVals.push( newVal );
}

var defaultVal = op.inValueString("Default Value");

currentVal.set(defaultVal.get());
oldVal.set(defaultVal.get());

defaultVal.onChange = function(){
    oldVal.set(currentVal.get());
    currentVal.set(defaultVal.get());
};




};

Ops.Value.ValueSwitcher.prototype = new CABLES.Op();
CABLES.OPS["1acdcafc-111d-445a-be4e-3454a1b797e5"]={f:Ops.Value.ValueSwitcher,objName:"Ops.Value.ValueSwitcher"};




// **************************************************************
// 
// Ops.Date.DateAndTime
// 
// **************************************************************

Ops.Date.DateAndTime = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var UPDATE_RATE_DEFAULT = 500;
var UPDATE_RATE_MIN = 50;
var updateRate = UPDATE_RATE_DEFAULT;

var outYear=op.outValue("Year");
var outMonth=op.outValue("Month");
var outDay=op.outValue("Day");
var outHours=op.outValue("Hours");
var outMinutes=op.outValue("Minutes");
var outSeconds=op.outValue("Seconds");
var outTimestemp=op.outValue("Timestamp");
var d = new Date();
var updateRatePort = op.inValue("Update Rate", UPDATE_RATE_DEFAULT);

var timeout=setTimeout(update, UPDATE_RATE_DEFAULT);
update();

function update()
{
    d = new Date();

    outSeconds.set( d.getSeconds() );
    outMinutes.set( d.getMinutes() );
    outHours.set( d.getHours() );
    outDay.set( d.getDate() );
    outMonth.set( d.getMonth() );
    outYear.set( d.getFullYear() );
    
    timeout=setTimeout(update, updateRate);
    
    outTimestemp.set(Date.now());
}

updateRatePort.onChange = function() {
    var newUpdateRate = updateRatePort.get();
    if(newUpdateRate && newUpdateRate >= UPDATE_RATE_MIN) {
        updateRate = newUpdateRate;
    }
};

op.onDelete=function()
{
    clearTimeout(timeout);
};

};

Ops.Date.DateAndTime.prototype = new CABLES.Op();
CABLES.OPS["beff95ec-7b50-4b6e-80b8-a7e4ab97d8cc"]={f:Ops.Date.DateAndTime,objName:"Ops.Date.DateAndTime"};




// **************************************************************
// 
// Ops.User.nakatuy.HyperLink_NewWindow
// 
// **************************************************************

Ops.User.nakatuy.HyperLink_NewWindow = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var exec=op.inTrigger("open");
var inUrl=op.inValueString("URL","http://creative-plus.net");

exec.onTriggered=function()
{
    window.open(inUrl.get());
}


};

Ops.User.nakatuy.HyperLink_NewWindow.prototype = new CABLES.Op();



