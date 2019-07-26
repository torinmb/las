import * as THREE from 'three';
import { defaultVertexSource, sculptureStarterCode, fragFooter} from './core-glsl.js'


export class ShaderContainer {
    constructor(size, fontTexture) {
        
        this.size = size
        this.vertexShader = defaultVertexSource;
        this.fontTexture = fontTexture;
        // this.geometry = new THREE.BoxGeometry(size, size, size);
        let fragSource = sculptureStarterCode() + fragFooter;
        this.fragmentShader = fragSource;
        this.geometry = new THREE.PlaneBufferGeometry(2, 2, 1);
        // this.geometry = new THREE.SphereBufferGeometry(size, 400, 400);
        this.mesh = new THREE.Mesh(
            this.geometry,
            this.generateMaterial(defaultVertexSource, this.fragmentShader)
        );
        
        this.selected = false;
        this.stepSize = 0.8;
        this.raySize = size + 1;
        this.minStep = 2.5;
        this.scale = size;
        
        this.setOpacity(1.0);
        window.refreshMaterial = this.refreshMaterial.bind(this);
    }

    selectedSculpture(selected) {
        this.selected = selected;
    }

    setOpacity(value) {
        this.opacity = value;
        this.mesh.visible = value !== 0.0;
    }

    generateMaterial(vertexShader, fragmentShader) {
        // return new THREE.MeshBasicMaterial( {color: 0xffff00} );
      const material = new THREE.ShaderMaterial({
        uniforms: {
            time: {value: 0.0},
            mouse: {value: new THREE.Vector3(0.5,0.5,0.5)},
            opacity: {value: 1.0},
            sculptureCenter: {value: new THREE.Vector3()},
            stepSize: { value: 0.8 },
            size: { value: this.size },
            raySize: { value: this.raySize },
            minStep: { value: this.minStep },
            msdf: { value: this.fontTexture },
            shadow1Offset: { value : new THREE.Vector2()},
            shadow1Blur: { value: 0.2 },
            shadow1Color: { value: new THREE.Vector4() },
            shadow2Offset: { value: new THREE.Vector2() },
            shadow2Blur: { value: 0.2 },
            shadow2Color: { value: new THREE.Vector4() },
            shadow3Offset: { value: new THREE.Vector2() },
            shadow3Blur: { value: 0.2 },
            shadow3Color: { value: new THREE.Vector4() },
            fontSize: { value: 1.0 },
            letterSpacing: { value: 1.0 },
            mouseMovementSpeed: { value: 1.0 },
            invert : { value: 1.0 },
        },
        vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        depthTest: true,
        side: THREE.FrontSide
      });
      material.extensions.fragDepth = true;
      return material;
    }

    setShaderSource(fragmentShader) {
        this.fragmentShader = fragmentShader;
    }

    refreshMaterial() {
        console.log(window.characters);
        this.mesh.material = this.generateMaterial(this.vertexShader, sculptureStarterCode() + fragFooter);
    }

    update(payload) {
        let {time, mouse, color1, color2, color3, params} = payload;
        this.mesh.material.uniforms['time'].value = time * 0.001;
        this.mesh.material.uniforms['mouse'].value = [mouse.x, mouse.y, 1.0];
        this.mesh.material.uniforms['sculptureCenter'].value = this.mesh.position;
        this.mesh.material.uniforms['opacity'].value = this.opacity;
        this.mesh.material.uniforms['stepSize'].value = this.stepSize;
        this.mesh.material.uniforms['size'].value = this.scale;
        this.mesh.material.uniforms['raySize'].value = this.raySize;
        this.mesh.material.uniforms['minStep'].value = this.minStep;
        this.mesh.material.uniforms['shadow1Offset'].value = [color1.xOffset, color1.yOffset];
        let c1 = color1.color;
        this.mesh.material.uniforms['shadow1Color'].value = [c1[0]/255, c1[1]/255, c1[2]/255, c1[3]];
        this.mesh.material.uniforms['shadow1Blur'].value = color1.blurRadius;

        this.mesh.material.uniforms['shadow2Offset'].value = [color2.xOffset, color2.yOffset];
        let c2 = color2.color;
        this.mesh.material.uniforms['shadow2Color'].value = [c2[0] / 255, c2[1] / 255, c2[2] / 255, c2[3]];
        this.mesh.material.uniforms['shadow2Blur'].value = color2.blurRadius;

        this.mesh.material.uniforms['shadow3Offset'].value = [color3.xOffset, color3.yOffset];
        let c3 = color3.color;
        this.mesh.material.uniforms['shadow3Color'].value = [c3[0] / 255, c3[1] / 255, c3[2] / 255, c3[3]];
        this.mesh.material.uniforms['shadow3Blur'].value = color3.blurRadius;
        this.mesh.material.uniforms['fontSize'].value = 20. - params.fontSize;
        this.mesh.material.uniforms['letterSpacing'].value = params.letterSpacing;
        this.mesh.material.uniforms['mouseMovementSpeed'].value = params.mouseMovementSpeed;
        
        this.mesh.material.uniforms['invert'].value = params.invert;
        
    }
    
}