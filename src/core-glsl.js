export const defaultVertexSource = `
varying vec4 worldPos;
varying vec2 vUv;
void main()
{
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    worldPos = modelMatrix*vec4(position,1.0);
    vUv = uv;
    gl_Position = projectionMatrix * mvPosition;
}
`;
let fontData = {};
fetch('/fonts/Helvetica-msdf.json').then(data => data.json()).then(data => {
    fontData = data;
    console.log(fontData);
});

//xadvance 8, 43
window.textScale = 60;
window.offsetScale = 40;
let ensureFloat = 0.00000000000001;

export const genCharacters = (input, alignment)=> {
    let out = '';
    console.log(input, 'input');
    input = input.split('\\n');
    
    input.forEach((str, index) => {

        let output = [];
        
        if(str.length > 1) {
            if(str.length % 2 == 0) {
                //output.push('uv.x -= .25;');
                
            } else {
                //out += 'uv.x -= .25;\n';
            }
        }
        if(index !== 0) {
            output.push(`uv.y += lineHeight;`);
        }
        
        let totalWidth = 0.0;
        for(let i = 0; i < str.length; i++) {
            let amt = (str.length / 2 - i);
            if(amt === 0 || str.length == 1) {
                amt = ensureFloat;
            }
            let code = str.charCodeAt(i);
            let xAdvance = 0.0;
            let xOffset = 0.0;
            let kerning = 0.0;
            
            if(Object.keys(fontData).length > 0) {
                let kernings = fontData.kernings;
                if(i !== str.length -1) {
                    let code2 = str.charCodeAt(i+1);
                    let kerningMatch = kernings.filter(obj => obj.first == code).filter(obj => obj.second == code2)[0];
                    if(kerningMatch) {
                        kerning = kerningMatch.amount / window.textScale + ensureFloat;
                    }
                }
                
                let chr = fontData.chars.filter(obj => obj.id == code);
                if (chr.length === 1) {
                    
                    chr = chr[0];
                    console.log('chr', chr);
                    xAdvance = chr.xadvance / window.textScale;
                    xOffset = chr.xoffset / window.offsetScale;
                    console.log(xAdvance);
                }
            }
            //amt = 0.00000001;
            //xAdvance = 0.0; kerning = 0.0;
            // kerning = 0.0;
            // out += `uv.x += letterSpacing * ${amt * 1.00000000001 };\n`
            totalWidth += xAdvance  ;
            output.push(`uv.x -=  ${xOffset + ensureFloat}; //offset`);
            // out += `uv.x -=  ${(xAdvance + kerning) * ensureFloat};\n`
            if(code == 32) {
                output.push(`uv.x -=  ${(xAdvance + kerning ) * +ensureFloat};`);
            } else {
                output.push(`d = max(d, character(uv, ${code}));\n`);
                output.push(`uv.x -=  ${(xAdvance -xOffset) + ensureFloat}; //advance`);
            }
            // output.push(`uv.x +=  ${(xOffset) + ensureFloat};`);
            // out += `d = max(d, character(uv, ${code}));\n`;
            
            // out += `uv.x -= letterSpacing * ${amt *ensureFloat +xAdvance };\n`
        }
        if (alignment === 'left'){
            output.push(`uv.x += ${totalWidth + ensureFloat};`);
        } else if (alignment === 'center') {
            output.unshift(`uv.x += ${totalWidth / 2. + ensureFloat};`);
            output.push(`uv.x += ${totalWidth/2. + ensureFloat};`);
        } else {
            //\___(o . o)___/
            //output.push(`uv.x += ${totalWidth / 2. + ensureFloat};`);
        }
        //output.unshift(`uv.x +=  ${totalWidth/2 + ensureFloat};`);
        //output.push(`uv.x +=  ${totalWidth / 2 + ensureFloat};`);
        // output.unshift(`uv = vUv;\nuv = (uv - vec2(0.5))*fontSize + vec2(0.5);`);
        out += output.join('\n');
    });
    return out;
}

window.characters = `
uv.x += 0.6416666666666767;
uv.x -=  0.02500000000001; //offset
d = max(d, character(uv, 76));

uv.x -=  0.35833333333334333; //advance
uv.x -=  -0.049999999999990004; //offset
d = max(d, character(uv, 65));

uv.x -=  0.50000000000001; //advance
uv.x -=  1e-14; //offset
d = max(d, character(uv, 83));

uv.x -=  0.45000000000001; //advance
uv.x += 0.6416666666666767;`;
// export let characters = genCharacters('LAS');
// console.log(characters);
// const characters = `
//     uv.x += letterSpacing;
//     d = character(uv, 76);
//     uv.x -= letterSpacing;
//     d = max(d, character(uv, 65));
//     uv.x -= letterSpacing;
//     d = max(d, character(uv, 83));
// `;

export let sculptureStarterCode = () => `
uniform mat4 projectionMatrix;
uniform float time;
uniform float opacity;
uniform vec3 sculptureCenter;
uniform vec3 mouse;
uniform float stepSize;
uniform sampler2D msdf;
uniform vec2 resolution;
vec3 msdfTexture;

varying vec2 vUv;
varying vec4 worldPos;


const float PI = 3.14159265;
const float TAU = PI*2.0;
const float TWO_PI = TAU;

const float max_dist = 4.0;
const float intersection_threshold = 0.00007;


// Simple oscillators 

float osc(float freq, float amp, float base, float phase) {
    return base+amp*sin(TWO_PI*(freq*time+phase));
}

float osc(float freq, float amp, float base) {
    return osc(freq, amp, base, 0.0);
}

float osc(float freq, float amp) {
    return osc(freq, amp, 1.0);
}

float osc(float freq) {
    return osc(freq, 0.5);
}

float osc() {
    return osc(1.0);
}

// Trig functions normalized to the range 0.0-1.0
float nsin(float x) {
    return sin(x)*0.5+0.5;
}

float ncos(float x) {
    return cos(x)*0.5+0.5;
}

float round(float x) {
    return floor(x+0.5);
}

float softSquare(float x, int pw) {
    return 1.0/(pow(tan(x),float(pw+1)*2.0)+1.0);
}



vec3 toSpherical(vec3 p) {
    float phi = atan(p.x,p.z);
    float r = length(p);
    float theta = acos(-p.y/r);
    return vec3(r,theta,phi);
}

vec3 fromSpherical(vec3 p) {
    return vec3(p.x*sin(p.y)*cos(p.z), p.x*sin(p.y)*sin(p.z), p.x*cos(p.y));
}

float dot2( in vec3 v ) { return dot(v,v); }

vec3 repeat3D(vec3 p, vec3 c )
{
    return mod(p,c)-0.5*c;
}

float repeat1D(inout float p, float size)
{
	float halfSize = size * 0.5;
	float c = floor((p + halfSize) / size);
  	p = mod(p + halfSize, size)-halfSize;
  	return c;
}

mat2 rot2(float a){
    float c = cos(a); float s = sin(a);
	return mat2(c, s, -s, c);
}

vec2 _hash( vec2 p ) // replace this by something better
{
	p = vec2( dot(p,vec2(127.1,311.7)),
			  dot(p,vec2(269.5,183.3)) );
	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec2 p )
{
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;
	vec2 i = floor( p + (p.x+p.y)*K1 );
	
    vec2 a = p - i + (i.x+i.y)*K2;
    vec2 o = step(a.yx,a.xy);    
    vec2 b = a - o + K2;
	vec2 c = a - 1.0 + 2.0*K2;
    vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
	vec3 n = h*h*h*h*vec3( dot(a,_hash(i+0.0)), dot(b,_hash(i+o)), dot(c,_hash(i+1.0)));
    return dot( n, vec3(70.0) );
}

vec3 _hash33(vec3 p3)
{
    p3 = fract(p3 * vec3(.1031,.11369,.13787));
    p3 += dot(p3, p3.yxz+19.19);
    return -1.0 + 2.0 * fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}

// simplex noise from https://www.shadertoy.com/view/4sc3z2
float noise(vec3 p)
{
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    
    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
    
    // thx nikita: https://www.shadertoy.com/view/XsX3zB
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
	vec3 i1 = e * (1.0 - e.zxy);
	vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    
    vec3 d1 = d0 - (i1 - 1.0 * K2);
    vec3 d2 = d0 - (i2 - 2.0 * K2);
    vec3 d3 = d0 - (1.0 - 3.0 * K2);
    
    vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
    vec4 n = h * h * h * h * vec4(dot(d0, _hash33(i)), dot(d1, _hash33(i + i1)), dot(d2, _hash33(i + i2)), dot(d3, _hash33(i + 1.0)));
    
    return dot(vec4(31.316), n);
}

float fractalNoise(vec3 p, float falloff, int iterations) {
    float v = 0.0;
    float amp = 1.0;
    float invFalloff = 1.0/falloff;
    for (int i=0; i<10; i++) {
        v += noise(p)*amp;
	if (i>=iterations) break;
        amp *= invFalloff;
        p *= falloff;
    }
    return v;
} 

float fractalNoise(vec3 p) {
    return fractalNoise(p, 2.0, 5);
}

// Adapted from IQ's usage at https://www.shadertoy.com/view/lllXz4
// Spherical Fibonnacci points, Benjamin Keinert, Matthias Innmann,
// Michael Sanger and Marc Stamminger

const float PHI = 1.61803398875;

vec4 sphericalDistribution( vec3 p, float n )
{
    p = normalize(p);
    float m = 1.0 - 1.0/n;

    float phi = min(atan(p.y, p.x), PI), cosTheta = p.z;

    float k = max(2.0, floor( log(n * PI * sqrt(5.0) * (1.0 - cosTheta*cosTheta))/ log(PHI+1.0)));
    float Fk = pow(PHI, k)/sqrt(5.0);
    vec2 F = vec2( round(Fk), round(Fk * PHI) ); // k, k+1

    vec2 ka = 2.0*F/n;
    vec2 kb = 2.0*PI*( fract((F+1.0)*PHI) - (PHI-1.0) );

    mat2 iB = mat2( ka.y, -ka.x,
    kb.y, -kb.x ) / (ka.y*kb.x - ka.x*kb.y);

    vec2 c = floor( iB * vec2(phi, cosTheta - m));
    float d = 8.0;
    float j = 0.0;
    vec3 bestQ = vec3(0.0,0.0,8.0);
    for( int s=0; s<4; s++ )
    {
        vec2 uv = vec2( float(s-2*(s/2)), float(s/2) );

        float i = dot(F, uv + c); // all quantities are ingeters (can take a round() for extra safety)

        float phi = 2.0*PI*fract(i*PHI);
        float cosTheta = m - 2.0*i/n;
        float sinTheta = sqrt(1.0 - cosTheta*cosTheta);

        vec3 q = vec3( cos(phi)*sinTheta, sin(phi)*sinTheta, cosTheta );
        float squaredDistance = dot(q-p, q-p);
        if (squaredDistance < d)
        {
            d = squaredDistance;
            j = i;
            bestQ = q;
        }
    }
    return vec4(bestQ,sqrt(d));
}



#define COLS 16.0
#define ROWS 16.0
#define START_CODE 33
#define CHARS_COUNT 94


float thickness = 0.0; //: range(-1.0, +1.0);
float border = 0.0; //: range(0.0, 0.25);

float pxSize = 0.05;

const vec3 bottomColor = vec3(0.0, 0.21875, 0.375);
const vec3 topColor = vec3(0.0, 0.625, 1.0);
const vec3 borderColor = vec3(1.0, 1.0, 1.0);

uniform vec2 shadow1Offset;
uniform float shadow1Blur;
uniform vec4 shadow1Color;
uniform float shadow1NoiseSpeed;
uniform float shadow1NoiseScale;
uniform float shadow1NoiseAmplitude;
uniform bool shadow1NoiseEnabled;

uniform vec2 shadow2Offset;
uniform float shadow2Blur;
uniform vec4 shadow2Color;
uniform float shadow2NoiseSpeed;
uniform float shadow2NoiseScale;
uniform float shadow2NoiseAmplitude;
uniform bool shadow2NoiseEnabled;

uniform vec2 shadow3Offset;
uniform float shadow3Blur;
uniform vec4 shadow3Color;
uniform float shadow3NoiseSpeed;
uniform float shadow3NoiseScale;
uniform float shadow3NoiseAmplitude;
uniform bool shadow3NoiseEnabled;

uniform float fontSize;
uniform float letterSpacing;
uniform float lineHeight;
uniform float mouseMovementSpeed;

uniform float invert;


float median(float r, float g, float b) 
{
    return max(min(r, g), min(max(r, g), b));
}

float remap(float x, vec2 from, vec2 to)
{
    
    return to.x + (x - from.x) / 
        (from.y - from.x) * (to.y - to.x);
}

vec2 getCharacterUV(vec2 uv, int code)
{
    //float ar = iResolution.x / iResolution.y;
    float row = float((code - START_CODE) / int(COLS));
    float col = float(float(code - START_CODE) - COLS * row);
    float stepX = 1.0 / COLS, stepY = 1.0 / ROWS;
    vec2 tileX = vec2(col * stepX, (col + 1.0) * stepX);
    vec2 tileY = vec2((ROWS - (row + 1.0)) * stepY, 
                      (ROWS - row) * stepY);
        
    vec2 result = vec2(remap(uv.x, vec2(0, 1), tileX), 
                       remap(uv.y, vec2(0, 1), tileY));
    
    return result;
}

float linearstep(float lo, float hi, float x)
{
	return (clamp(x, lo, hi) - lo) / (hi - lo);
}

float character(vec2 uv, int code) {
    
    vec2 cuv = getCharacterUV(uv, code);
    vec3 sd = texture2D(msdf, cuv).rgb;
    
    float sigDist = median(sd.r, sd.g, sd.b) - 0.5;

    sigDist *= step(0.0, uv.x);
    sigDist *= step(0.0, 1.-uv.x);
    sigDist *= step(0.0, uv.y);
    sigDist *= step(0.0, 1.-uv.y);
  	
  	return sigDist;
}

float remap(float value, float inputMin, float inputMax, float outputMin, float outputMax)
{
    return (value - inputMin) * ((outputMax - outputMin) / (inputMax - inputMin)) + outputMin;
}

float las(vec2 uv) {
    float d = 0.0;
    ${window.characters}
  	return d;
}

`;



export const fragFooter = `
// For advanced users //
void main() {
    vec2 uv = vUv;
    // uv = gl_FragCoord.xy / resolution.xy;
    uv = (uv - vec2(0.5))*fontSize + vec2(0.5);
    
    
    // uv.x -= 0.5;
    // uv.y -= 0.5;
    //uv *= fontSize;
    
    //uv.x *= resolution.x/resolution.y;
    
    
    
    // uv.x -= 0.25;

    //uv -= vec2(0.25);
    //uv = (uv - vec2(0.5)) + vec2(0.5);
    
    msdfTexture = texture2D(msdf, vUv).rgb;
    
    //int code = START_CODE + int(mouse.x * float(CHARS_COUNT));    
    
    float sd = las(uv);
    float inside = linearstep(0.0, -border+pxSize, sd);
    float outsideBorder = border > 0.0 ? linearstep(0.0, +border+pxSize, sd) : 1.0;
    
    float fontSizeMap = (1.0 - 20.0/fontSize);
    //fontSizeMap = 1.0;
    vec2 mouseMovement = mouse.xy * mouseMovementSpeed;
    vec2 uv2 = uv;
    if(shadow1NoiseEnabled) {
        uv2 -= noise(uv*shadow1NoiseScale +time*shadow1NoiseSpeed)*shadow1NoiseAmplitude*fontSizeMap;
    } else { 
        uv2.x += sin(shadow1NoiseScale +time*shadow1NoiseSpeed)*shadow1NoiseAmplitude*fontSizeMap;
        uv2.y += cos(shadow1NoiseScale +time*shadow1NoiseSpeed)*shadow1NoiseAmplitude*fontSizeMap;
    }
    sd = las(uv2 - shadow1Offset - mouseMovement);
    float shadow1 = shadow1Color.a*linearstep(0.0, +shadow1Blur+pxSize, sd);
    vec2 uv3 = uv;
    if(shadow2NoiseEnabled) {
        uv3 -= noise(uv*shadow2NoiseScale +time*shadow2NoiseSpeed + 100.)*shadow2NoiseAmplitude*fontSizeMap;
    } else { 
        uv3.x += sin(shadow2NoiseScale +time*shadow2NoiseSpeed)*shadow2NoiseAmplitude*fontSizeMap;
        uv3.y += cos(shadow2NoiseScale +time*shadow2NoiseSpeed)*shadow2NoiseAmplitude*fontSizeMap;
    }
    sd = las(uv3 - shadow2Offset - mouseMovement);
    float shadow2 = shadow2Color.a*linearstep(0.0, +shadow2Blur+pxSize, sd);
    vec2 uv4 = uv;
    if(shadow3NoiseEnabled) {
        uv4 -= noise(uv*shadow3NoiseScale +time*shadow3NoiseSpeed + 1000.)*shadow3NoiseAmplitude*fontSizeMap;
    } else { 
        uv4.x += sin(shadow3NoiseScale +time*shadow3NoiseSpeed)*shadow3NoiseAmplitude*fontSizeMap;
        uv4.y += cos(shadow3NoiseScale +time*shadow3NoiseSpeed)*shadow3NoiseAmplitude*fontSizeMap;
    }
    sd = las(uv4 - shadow3Offset - mouseMovement);
    float shadow3 = shadow3Color.a*linearstep(0.0, +shadow3Blur+pxSize, sd);

    vec4 fg = vec4(mix(borderColor, mix(bottomColor, topColor, uv.y), outsideBorder), inside);
    vec4 o = vec4(mix(vec3(0.0), vec3(1.0), fg.a), fg.a);
    o = mix(o, shadow1Color, (1.0 - inside) * shadow1);
    o = mix(o, shadow2Color, (1.0 - inside) * shadow2);
    o = mix(o, shadow3Color, (1.0 - inside) * shadow3);
    
    gl_FragColor = o;
	
}
`;