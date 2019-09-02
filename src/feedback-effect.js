import * as THREE from 'three';
import { BlendFunction, Effect} from "postprocessing";

let fragmentShader = `
uniform sampler2D bufferTexture;//Our input texture
uniform sampler2D sceneTexture;
uniform float mixAmount;

void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){
    vec2 uv2 = inputColor.xy;
    uv2 = mix(vec2(0.5), uv2, .9);
    vec4 sum = texture2D(bufferTexture, uv2);
    vec4 src = texture2D(sceneTexture, uv2);
    sum.rgb = mix(sum.rbg, src.rgb, mixAmount);
    outputColor = sum;
}
`;

export class FeedbackEffect extends Effect {
    constructor({ blendFunction = BlendFunction.NORMAL, bufferTexture, sceneTexture, mixAmount = 0.01} = {}) {
        super("FeedbackEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
                ["mixAmount", new THREE.Uniform(mixAmount)],
                ["bufferTexture", new THREE.Uniform(bufferTexture.texture)],
                ["sceneTexture", new THREE.Uniform(sceneTexture.texture)]
			])
		});
	}
}