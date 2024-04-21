#version 300 es
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

#ifdef HW_PERFORMANCE
#define u_resolution iResolution
#define u_time iTime
#else
out vec4 fragColor;
#endif

const vec3 col1top    = vec3(0./255.,  31./255., 63./255.);
const vec3 col1bottom = vec3(30./255., 60./255., 90./255.);
const vec3 col2       = vec3(0./255.,  25./255., 55./255.);
const vec3 col3       = vec3(0./255.,  15./255., 45./255.);
const vec3 col4       = vec3(0./255.,  10./255., 35./255.);

// https://iquilezles.org/articles/fbm/

float hash(int n) 
{
  n = (n << 13) ^ n;
  n = n * (n * n * 15731 + 789221) + 1376312589;
  return -1.0 + 2.0 * float(n & ivec3(0x0fffffff)) / float(0x0fffffff);
}

float hash2(int n, int m) 
{
  n = (n << 13) ^ n;
  n ^= (m << 17) ^ m;
  n = n * (n * n * 15731 + 789221) + 1376312589;
  return -1.0 + 2.0 * float(n & ivec3(0x0fffffff)) / float(0x0fffffff);
}

float gnoise(in float p)
{
  int   i = int(floor(p));
  float f = fract(p);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(
    hash(i + 0) * (f - 0.0), 
    hash(i + 1) * (f - 1.0),
    u
  );
}

float fbm(in float x, in float G)
{
  x += 26.06;
  float n = 0.0;
  float s = 1.0;
  float a = 0.0;
  float f = 1.0;
  for(int i = 0; i < 8; i++) {
      n += s * gnoise(x * f);
      a += s;
      s *= G;
      f *= 2.0;
      x += 0.31;
  }
  return n;
}

vec3 mountainRow(vec3 col1, vec3 col2, float x, float y) {
    float y1 = 0.5 + 0.9 * fbm(x, 0.5);
    
    y1 = 1.0 - smoothstep(0.0, 0.005, y - y1);
    
    return mix(col1, col2, y1);
}

// https://www.shadertoy.com/view/MslGD8
vec2 hashVec2(vec2 p)
{
  p = vec2(
    dot(p,vec2(127.1,311.7)),
    dot(p,vec2(269.5,183.3))
  );
  return fract(sin(p)*18.5453);
}

float voronoi(in vec2 x)
{
  vec2 n = floor(x);
  vec2 f = fract(x);

  vec3 m = vec3(8.0);
  for(int j = -1; j <= 1; j++) {
    vec2 g = vec2(-1., float(j));
    vec2 o = hashVec2(n + g);
    vec2 r = g - f + (0.5 + 0.5 * sin(6.2831 * o));
    float d = dot(r, r);
    if (d < m.x) m = vec3(d, o);

    g = vec2(0., float(j));
    o = hashVec2(n + g);
    r = g - f + (0.5 + 0.5 * sin(6.2831 * o));
    d = dot(r, r);
    if (d < m.x) m = vec3(d, o);

    g = vec2(1., float(j));
    o = hashVec2(n + g);
    r = g - f + (0.5 + 0.5 * sin(6.2831 * o));
    d = dot(r, r);
    if (d < m.x) m = vec3(d, o);
  }

  return m.y + m.z;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
  vec2 uv = fragCoord / u_resolution.xy;
  uv.x *= u_resolution.x / u_resolution.y;

  float time = 0.005 * u_time;

  // add noise to prevent gradient banding
  float noise = hash2(
    int(uv.x*10000.),
    int(uv.y*10000.)
  ) * .1;

  float stars = hash2(
    int((uv.x + time * 0.2) * 800. + time * 20.),
    int((uv.y - time * 0.2) * 800. + time * 20.)
  );

  vec3 col = mix(col1top, col1bottom, 1. - uv.y + noise);

  if (stars > 1.0 - 0.001 * uv.y) {
    col += vec3(.1 + uv.y * .4 - (1. - stars) * 300.);
  }

  vec2 p = vec2(uv.x + time, uv.y);
  float c = voronoi(40. * vec2(mod(p.x, 100.), p.y));
  vec3 texture = vec3(0.0025) * cos(c * 6.2831);
  
  col = mountainRow(col, col2 + texture, p.x, p.y / 0.22 - 1.2);

  p = vec2(uv.x + 11. + 3. * time, uv.y);
  c = voronoi(20. * vec2(mod(p.x, 100.), p.y));
  texture = vec3(0.004) * cos(c * 6.2831);

  col = mountainRow(col, col3 + texture, p.x, p.y / 0.3 - 0.3);

  p = vec2(uv.x + 29. + 5. * time, uv.y);
  c = voronoi(10. * vec2(mod(p.x, 100.), p.y));
  texture = vec3(0.008) * cos(c * 6.2831);

  col = mountainRow(col, col4 + texture, p.x, p.y / 0.5 + .4);

  fragColor = vec4(col,1.0);
}

#ifndef HW_PERFORMANCE
void main()
{
  mainImage(fragColor, gl_FragCoord.xy);
}
#endif
