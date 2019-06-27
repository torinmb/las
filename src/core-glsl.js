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



export const sculptureStarterCode = `
uniform mat4 projectionMatrix;
uniform float time;
uniform float opacity;
uniform vec3 sculptureCenter;
uniform vec3 mouse;
uniform float stepSize;
uniform sampler2D msdf;
vec3 msdfTexture;

varying vec2 vUv;
varying vec4 worldPos;


const float PI = 3.14159265;
const float TAU = PI*2.0;
const float TWO_PI = TAU;

const float max_dist = 4.0;
const float intersection_threshold = 0.00007;

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

float add( float d1, float d2 )
{
    return min(d1,d2);
}

float subtract( float d1, float d2 )
{
    return max(-d1,d2);
}

float intersect( float d1, float d2 )
{
    return max(d1,d2);
}

float shell(float d, float thickness) {
    return abs(d)-thickness;
}

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

// polynomial smooth min (k = 0.1) (from IQ)
float smoothAdd( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float smoothSubtract(float a,float b, float k)
{
    return -smoothAdd(-a,-b,k);
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



`;



export const fragFooter = `
// For advanced users //
void main() {
    
    msdfTexture = texture2D(msdf, vUv).rgb;
    vec3 col = 0.5 + 0.5*cos(time+vUv.xyx+vec3(0,2,4));
    // Output to screen
    gl_FragColor = vec4(col,1.0);
}
`;