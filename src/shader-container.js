import * as THREE from 'three';
import { defaultVertexSource, sculptureStarterCode, fragFooter} from './core-glsl.js'


export class ShaderContainer {
    constructor(size, fontTexture) {
        this.size = size
        this.vertexShader = defaultVertexSource;
        this.fontTexture = fontTexture;
        // this.geometry = new THREE.BoxGeometry(size, size, size);
        let fragSource = sculptureStarterCode + fragFooter;
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
          msdf: { value: this.fontTexture }
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
        this.mesh.material = this.generateMaterial(this.vertexShader, this.fragmentShader);
    }

    update(time) {
        this.mesh.material.uniforms['time'].value = time * 0.001;
        this.mesh.material.uniforms['sculptureCenter'].value = this.mesh.position;
        this.mesh.material.uniforms['opacity'].value = this.opacity;
        this.mesh.material.uniforms['stepSize'].value = this.stepSize;
        this.mesh.material.uniforms['size'].value = this.scale;
        this.mesh.material.uniforms['raySize'].value = this.raySize;
        this.mesh.material.uniforms['minStep'].value = this.minStep;
    }
    
}