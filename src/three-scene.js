import * as THREE from 'three';
import { ShaderContainer } from './shader-container.js';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, BrightnessContrastEffect, BlendFunction, SavePass, BlurPass, KernelSize} from "postprocessing";
import { InvertEffect} from './invert-effect.js';
// import { FeedbackEffect } from './feedback-effect.js';
// import ThreeMSDF from 'three-msdf'


export const renderScene = (container, guiData) => {
    console.log('got to donwload screenshot')
    window.guiData = guiData;
    window.resScale = 700;
    const scene = new THREE.Scene();
    
    const texture = new THREE.TextureLoader().load('fonts/msdf-left-allign.png');
    const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(0, 0, 2);
    guiData.params.resolution = new THREE.Vector2(container.clientWidth, container.clientHeight);

    const raycaster = new THREE.Raycaster();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer : true });
    
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
    let blurPass = new BlurPass({ height: 960, kernelSize: KernelSize.HUGE});
    window.blurPass = blurPass;
    let savePass = new SavePass();

    let brightnessContrastEffect = new BrightnessContrastEffect({ contrast: guiData.params.contrast });
    // let feedbackEffect = new FeedbackEffect({ bufferTexture: savePass2.renderTarget, frameTexture: savePass.renderTarget });
    let invertEffect = new InvertEffect({ invert: guiData.params.invert });
    const effectPass = new EffectPass(camera, bloomEffect, brightnessContrastEffect, invertEffect);
    effectPass.renderToScreen = true;

    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(blurPass);
    composer.addPass(effectPass);
    composer.addPass(savePass);

    

    let t = 0.0;
    window.addEventListener('resize', onWindowResize);
    renderer.setAnimationLoop((time) => renderScene(time));

    function renderScene(time) {
        raycaster.setFromCamera(mouse, camera);
        t = time;
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

        
        
        bloomEffect.threshold = guiData.bloom.distinction;
        bloomEffect.blendMode.opacity.value = guiData.bloom.opacity;
        bloomEffect.setResolutionScale(guiData.bloom.resolutionScale);
        // blurPass.setResolutionScale(1.5 - (guiData.params.blur));
        blurPass.scale = (guiData.params.blur);
        brightnessContrastEffect.fragmentShader = `
        uniform float brightness;
        uniform float contrast;
        void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){
            outputColor = inputColor * contrast;
        }`;
        brightnessContrastEffect.uniforms.get("contrast").value = guiData.params.contrast;
        invertEffect.uniforms.get('invert').value = guiData.params.invert;
        
        shaderContainer.update({time, mouse, ...guiData});

        composer.render(time);
    }

    function onWindowResize() {
        let width = container.clientWidth;
        let height = container.clientHeight;
        composer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        composer.render(t);
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

    function defaultFileName(ext) {
        const str = `LAS Export ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}${ext}`;
        return str.replace(/\//g, '-').replace(/:/g, '.');
    }

    function downloadScreenShot(width, height) {
        const renderer = composer.getRenderer();
		const originalSize = renderer.getSize(new THREE.Vector2());
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        composer.setSize(width, height);
		composer.render(t);

		// Data URL doesn't work because the image data is too big.
		renderer.domElement.toBlob((blob) => {

			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
            a.setAttribute("download", defaultFileName('.png'));
			a.href = url;
			a.click();

			URL.revokeObjectURL(url);

			// Restore the original resolution.
			composer.setSize(originalSize.width, originalSize.height);
            camera.aspect = originalSize.width / originalSize.height;
            camera.updateProjectionMatrix();
            guiData.params.resolution.set(originalSize.width, originalSize.height);
            shaderContainer.update({ t, mouse, ...guiData });
            composer.render(t);

		});

    }


    return { downloadScreenShot};
    
}