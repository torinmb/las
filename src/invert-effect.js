import * as THREE from 'three';
import { BlendFunction, Effect} from "postprocessing";


/**
 * A brightness/contrast effect.
 *
 * Reference: https://github.com/evanw/glfx.js
 */
let fragmentShader = `
uniform float invert;
void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){
	vec4 o = inputColor;
    if(invert >= 0.0 && invert < 2.0) {
        outputColor = vec4(vec3(invert) - o.xyz , o.a);
    } else {
        outputColor = vec4(o.xyz - vec3(invert - 3.), o.a);
	}
}
`;

export class InvertEffect extends Effect {


	constructor({ blendFunction = BlendFunction.NORMAL, invert = 0.0} = {}) {

		super("InvertEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["invert", new THREE.Uniform(invert)]
			])
		});

	}

}