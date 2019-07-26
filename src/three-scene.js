import * as THREE from 'three';
import { ShaderContainer } from './shader-container.js';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, BrightnessContrastEffect, BlurPass, BlendFunction, SavePass} from "postprocessing";


export const renderScene = (container, guiData) => {
    
    const scene = new THREE.Scene();
    
    const texture = new THREE.TextureLoader().load('fonts/msdf3.png');
    const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(0, 0, 2);

    const raycaster = new THREE.Raycaster();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    // renderer.setClearColor('0x000000');
    // render.setClearColor('0x000000');
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    const composer = new EffectComposer(renderer);
    // const controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    // controls.dampingFactor = 1.25;
    // controls.zoomSpeed = 0.5;
    // controls.rotateSpeed = 0.5;
    let mouse = new THREE.Vector2();
    let intersectedObject = null;

    // container.addEventListener('mousedown', this.onMouseDown, false);
    // container.addEventListener('mouseup', this.onMouseUp, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener("touchstart", onTouchMove, false);
    document.addEventListener("touchmove", onTouchMove, false);

    let objectsToRaycast = [];
    let shaderContainer = new ShaderContainer(1, texture);
    scene.add(shaderContainer.mesh);
    objectsToRaycast.push(shaderContainer.mesh);


    var pointLight = new THREE.PointLight(0xffffff, 0.5);
    scene.add(pointLight);
    pointLight.position.y = 40;
    pointLight.position.x = 40;

    window.scene = scene;
    let bloomEffect = new BloomEffect();
    window.bloomEffect = bloomEffect;
    let blurPass = new BlurPass();
    let savePass = new SavePass();
    let brightnessContrastEffect = new BrightnessContrastEffect({ contrast: guiData.params.contrast });
    const effectPass = new EffectPass(camera, bloomEffect);
    effectPass.renderToScreen = true;

    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(blurPass);
    // composer.addPass(savePass);
    composer.addPass(effectPass);
    


    window.addEventListener('resize', onWindowResize);
    renderer.setAnimationLoop((time) => renderScene(time));

    function renderScene(time) {
        raycaster.setFromCamera(mouse, camera);
        // let intersects = raycaster.intersectObjects(objectsToRaycast);
        // if (intersects.length > 0) {
        //     const firstIntersect = intersects[0].object;
        //     firstIntersect.material.side = THREE.FrontSide;
        //     const frontSideIntersection = raycaster.intersectObjects(objectsToRaycast);
        //     if (frontSideIntersection.length > 0) {
        //         firstIntersect.material.uniforms.mouse.value = frontSideIntersection[0].point.sub(firstIntersect.position);
        //     } else {
        //         firstIntersect.material.uniforms.mouse.value = camera.position.clone().sub(firstIntersect.position);
        //     }
        //     firstIntersect.material.side = THREE.BackSide;
        //     container.style.cursor = 'pointer';
        //     intersectedObject = firstIntersect;
        // } else {
        //     container.style.cursor = 'auto';
        //     intersectedObject = null;
        // }

        // controls.update();
        
        bloomEffect.distinction = guiData.bloom.distinction;
        bloomEffect.blendMode.opacity.value = guiData.bloom.opacity;
        bloomEffect.setResolutionScale(guiData.bloom.resolutionScale);
        blurPass.setResolutionScale(1.5 - guiData.params.blur);
        
        brightnessContrastEffect.uniforms.get("contrast").value = guiData.params.contrast;
        brightnessContrastEffect.uniforms.get("brightness").value = guiData.params.brightness;

        window.brightnessContrastEffect = brightnessContrastEffect;
        // brightnessContrastEffect.fragmentShader = "uniform float brightness;uniform float contrast;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor = clamp(vec4((inputColor.rgb - vec3(0.5)) * contrast + vec3(0.5), inputColor.a), 0.0, 1.0);}";
        brightnessContrastEffect.fragmentShader = "uniform float brightness;uniform float contrast;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 col = pow(abs(inputColor.rgb * 2. - 1.), 1. / max(vec3(contrast), vec3(0.0001)) * sign(inputColor.rgb - 0.5) + 0.5;outputColor = vec4(col, inputColor.a);}"
//         brightnessContrastEffect.fragmentShader =`uniform float brightness;
// uniform float contrast;
// void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){
//     vec4 o = inputColor;
//     // if(brightness >= 0.0 && brightness < 2.0) {
//     //     o = vec4(vec3(brightness) - o.xyz , o.a);
//     // } else{
//     //     o = vec4(o.xyz - vec3(brightness - 3.), o.a);
//     // }

//     vec3 col = pow(abs(o.rgb * 2. - 1.), 1. / max(vec3(contrast), vec3(0.0001)) * sign(o.rgb - 0.5) + 0.5;
    
//     outputColor = vec4(col, o.a);
// }`;
        // brightnessContrastEffect.fragmentShader = "uniform float brightness;uniform float contrast;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 color=inputColor.rgb;color *= contrast; outputColor=vec4(color,1.0),inputColor.a);}" fragColor = clamp(dstColor, 0.0, 1.0);
        // vec4 dstColor = vec4((srcColor.rgb - vec3(0.5)) * contrast + vec3(0.5), 1.0);
        shaderContainer.update({time, mouse, ...guiData});
        composer.render(time);
    }

    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        composer.setSize(container.clientWidth, container.clientHeight);
        
    }

    function onDocumentMouseMove(event) {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    function onTouchMove(event) {

        var pointer = event.changedTouches ? event.changedTouches[0] : event;

        var rect = container.getBoundingClientRect();
        mouse.x = (pointer.clientX - rect.left) / rect.width * 2 - 1;
        mouse.y = - (pointer.clientY - rect.top) / rect.height * 2 + 1;

    }
}