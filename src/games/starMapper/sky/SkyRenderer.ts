/**
 * The WebGL night sky (ADR-0007): the only module that imports three.js or
 * the full star catalogue, so both stay in this lazy chunk. It draws what
 * `astro.ts` describes and owns no camera of its own.
 */
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  LinearFilter,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Texture,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from 'three';
import catalog from './data/catalog.json';
import milkyWayUrl from './data/milkyway.png?url';
import {
  bvToRgb,
  cameraBasis,
  equatorialVector,
  horizontalToVector,
  magToSize,
  skyMatrix,
  type Camera,
} from './astro';

const STAR_RADIUS = 700;
const MILKY_WAY_RADIUS = 800;
const DOME_RADIUS = 900;
const TREE_RADIUS = 500;
const CLOUD_RADIUS = 560;
const CLOUD_NIGHT = new Color('#3a4866');
const CLOUD_DAWN = new Color('#c98a5a');

const STAR_VERTEX = /* glsl */ `
  attribute float size;
  attribute float phase;
  attribute vec3 color;
  uniform float uScale;
  uniform float uTime;
  uniform float uTwinkle;
  uniform float uDawn;
  uniform vec3 uEast;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 dir = normalize(world.xyz);
    float up = dir.y;
    float low = 1.0 - smoothstep(0.0, 0.5, up);
    float toward = max(0.0, dot(normalize(vec3(dir.x, 0.0, dir.z) + 1e-5), uEast));
    float twinkle = 1.0 + uTwinkle * (0.12 + 0.3 * low) * sin(uTime * (2.0 + phase) + phase * 17.0);
    vColor = color;
    vFade = smoothstep(-0.02, 0.06, up) * (1.0 - uDawn * (0.3 + 0.6 * toward * low));
    gl_PointSize = size * uScale * twinkle;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const STAR_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vFade;
  void main() {
    float r = length(gl_PointCoord - vec2(0.5));
    float core = smoothstep(0.5, 0.0, r);
    float a = core * core * vFade;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * (0.6 + 0.6 * core), a);
  }
`;

const MILKY_WAY_VERTEX = /* glsl */ `
  varying vec3 vDir;
  varying float vUp;
  void main() {
    vDir = normalize(position);
    vUp = normalize((modelMatrix * vec4(position, 1.0)).xyz).y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const MILKY_WAY_FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uStrength;
  varying vec3 vDir;
  varying float vUp;
  const float PI = 3.141592653589793;
  void main() {
    float ra = atan(vDir.y, vDir.x);
    float dec = asin(clamp(vDir.z, -1.0, 1.0));
    vec2 uv = vec2(ra / (2.0 * PI) + 0.5, dec / PI + 0.5);
    float v = texture2D(uMap, uv).r;
    float fade = smoothstep(0.0, 0.25, vUp);
    gl_FragColor = vec4(vec3(0.62, 0.68, 0.82) * v * uStrength * fade, 1.0);
  }
`;

const DOME_VERTEX = /* glsl */ `
  varying float vUp;
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vUp = vDir.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DOME_FRAGMENT = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform float uDawn;
  uniform vec3 uEast;
  varying float vUp;
  varying vec3 vDir;
  void main() {
    float u = clamp(vUp, 0.0, 1.0);
    vec3 c = mix(uHorizon, uMid, smoothstep(0.0, 0.25, u));
    c = mix(c, uZenith, smoothstep(0.25, 0.9, u));
    float toward = max(0.0, dot(normalize(vec3(vDir.x, 0.0, vDir.z) + 1e-5), uEast));
    float low = 1.0 - smoothstep(0.0, 0.45, u);
    c = mix(c, vec3(0.17, 0.23, 0.38), uDawn * 0.35 * (1.0 - u));
    c += uDawn * low * toward * toward * vec3(0.9, 0.55, 0.3) * 0.75;
    gl_FragColor = vec4(c, 1.0);
  }
`;

/** A spruce-and-birch treeline: the height in degrees above the horizon at an azimuth. */
function treeHeight(az: number, seed: number): number {
  const s = (x: number) => {
    const v = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  const slot = Math.floor(az / 1.6);
  const local = az / 1.6 - slot;
  const tall = 1.4 + 2.2 * s(slot);
  const spruce = s(slot + 0.5) > 0.35;
  const shape = spruce
    ? 1 - Math.abs(local - 0.5) * 2
    : Math.sqrt(Math.max(0, 1 - (2 * local - 1) ** 2));
  const hill = 0.6 + 0.5 * Math.sin((az * Math.PI) / 70 + seed);
  return hill + tall * (spruce ? shape : 0.7 * shape);
}

function treelineGeometry(radius: number, seed: number, lift: number): BufferGeometry {
  const positions: number[] = [];
  const step = 0.4;
  for (let az = 0; az < 360; az += step) {
    const h0 = treeHeight(az, seed) + lift;
    const h1 = treeHeight(az + step, seed) + lift;
    const b0 = horizontalToVector(-30, az);
    const b1 = horizontalToVector(-30, az + step);
    const t0 = horizontalToVector(h0, az);
    const t1 = horizontalToVector(h1, az + step);
    for (const v of [b0, t0, t1, b0, t1, b1])
      positions.push(v[0] * radius, v[1] * radius, v[2] * radius);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  return g;
}

function groundGeometry(radius: number): BufferGeometry {
  const g = new SphereGeometry(
    radius,
    48,
    12,
    0,
    Math.PI * 2,
    Math.PI / 2 + 0.4,
    Math.PI / 2 - 0.4,
  );
  return g;
}

export interface SkyRenderer {
  setSize(width: number, height: number, pixelRatio: number): void;
  /** `dawn` from 0 (night) to 1 (the dawn has reached the target). */
  render(camera: Camera, sceneUtc: number, timeSec: number, dawn: number): void;
  setReducedMotion(reduced: boolean): void;
  dispose(): void;
}

class ThreeSkyRenderer implements SkyRenderer {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(60, 1, 0.1, 2000);
  private readonly sky = new Scene();
  private readonly starMaterial: ShaderMaterial;
  private readonly milkyWayMaterial: ShaderMaterial;
  private readonly disposables: { dispose(): void }[] = [];
  private texture: Texture | null = null;
  private reduced = false;
  private height = 1;
  private pixelRatio = 1;
  private readonly domeMaterial: ShaderMaterial;
  private readonly clouds: { sprite: Sprite; az: number; alt: number; speed: number }[] = [];
  private cloudMaterial: SpriteMaterial | null = null;
  private cloudsPlaced = false;
  private disposed = false;
  private projectedAspect = 0;
  private readonly basis = new Matrix4();
  private readonly right = new Vector3();
  private readonly up = new Vector3();
  private readonly back = new Vector3();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
    this.renderer.setClearColor(new Color('#04060e'));
    this.sky.matrixAutoUpdate = false;
    this.scene.add(this.sky);

    const dome = new SphereGeometry(DOME_RADIUS, 32, 16);
    const east = new Vector3(...horizontalToVector(0, 90));
    this.domeMaterial = new ShaderMaterial({
      vertexShader: DOME_VERTEX,
      fragmentShader: DOME_FRAGMENT,
      side: BackSide,
      depthWrite: false,
      uniforms: {
        uZenith: { value: new Color('#04060e') },
        uMid: { value: new Color('#091122') },
        uHorizon: { value: new Color('#16223a') },
        uDawn: { value: 0 },
        uEast: { value: east },
      },
    });
    this.scene.add(new Mesh(dome, this.domeMaterial));
    this.disposables.push(dome, this.domeMaterial);

    const mwGeometry = new SphereGeometry(MILKY_WAY_RADIUS, 64, 32);
    this.milkyWayMaterial = new ShaderMaterial({
      vertexShader: MILKY_WAY_VERTEX,
      fragmentShader: MILKY_WAY_FRAGMENT,
      side: BackSide,
      depthWrite: false,
      transparent: true,
      blending: AdditiveBlending,
      uniforms: { uMap: { value: null }, uStrength: { value: 0 } },
    });
    this.sky.add(new Mesh(mwGeometry, this.milkyWayMaterial));
    this.disposables.push(mwGeometry, this.milkyWayMaterial);
    new TextureLoader().load(milkyWayUrl, (texture) => {
      if (this.disposed) {
        texture.dispose();
        return;
      }
      texture.minFilter = LinearFilter;
      texture.generateMipmaps = false;
      this.texture = texture;
      this.milkyWayMaterial.uniforms.uMap!.value = texture;
      this.milkyWayMaterial.uniforms.uStrength!.value = 0.32;
    });

    const rows = catalog as unknown as [number, number, number, number, number][];
    const positions = new Float32Array(rows.length * 3);
    const colors = new Float32Array(rows.length * 3);
    const sizes = new Float32Array(rows.length);
    const phases = new Float32Array(rows.length);
    rows.forEach(([, ra, dec, mag, bv], i) => {
      const v = equatorialVector(ra, dec);
      positions.set([v[0] * STAR_RADIUS, v[1] * STAR_RADIUS, v[2] * STAR_RADIUS], i * 3);
      colors.set(bvToRgb(bv), i * 3);
      sizes[i] = magToSize(mag);
      phases[i] = (i * 0.618) % 1;
    });
    const starGeometry = new BufferGeometry();
    starGeometry.setAttribute('position', new BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new BufferAttribute(sizes, 1));
    starGeometry.setAttribute('phase', new BufferAttribute(phases, 1));
    this.starMaterial = new ShaderMaterial({
      vertexShader: STAR_VERTEX,
      fragmentShader: STAR_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uScale: { value: 1 },
        uTime: { value: 0 },
        uTwinkle: { value: 1 },
        uDawn: { value: 0 },
        uEast: { value: east },
      },
    });
    const stars = new Points(starGeometry, this.starMaterial);
    stars.frustumCulled = false;
    this.sky.add(stars);
    this.disposables.push(starGeometry, this.starMaterial);

    const ground = groundGeometry(TREE_RADIUS + 20);
    const groundMaterial = new ShaderMaterial({
      vertexShader: DOME_VERTEX,
      fragmentShader: 'void main() { gl_FragColor = vec4(0.012, 0.02, 0.035, 1.0); }',
      side: DoubleSide,
    });
    this.scene.add(new Mesh(ground, groundMaterial));
    this.disposables.push(ground, groundMaterial);

    for (const [radius, seed, lift, color] of [
      [TREE_RADIUS + 10, 3.1, 0.9, '#0a0e16'],
      [TREE_RADIUS, 1.7, 0, '#030509'],
    ] as const) {
      const g = treelineGeometry(radius, seed, lift);
      const m = new ShaderMaterial({
        vertexShader: DOME_VERTEX,
        fragmentShader: `void main() { gl_FragColor = vec4(${new Color(color)
          .toArray()
          .map((c) => c.toFixed(4))
          .join(', ')}, 1.0); }`,
        side: DoubleSide,
      });
      this.scene.add(new Mesh(g, m));
      this.disposables.push(g, m);
    }
    this.addClouds();
  }

  /** A few soft clouds low over the treeline that drift and catch the dawn. */
  private addClouds(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const glow = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    glow.addColorStop(0, 'rgba(255,255,255,0.9)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.scale(1, 0.5);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new CanvasTexture(canvas);
    const material = new SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      opacity: 0,
    });
    this.cloudMaterial = material;
    this.disposables.push(texture, material);
    for (let i = 0; i < 7; i++) {
      const sprite = new Sprite(material);
      const width = 90 + ((i * 37) % 60);
      sprite.scale.set(width, width * 0.32, 1);
      sprite.frustumCulled = false;
      this.scene.add(sprite);
      this.clouds.push({
        sprite,
        az: (i * 53) % 360,
        alt: 5 + ((i * 7) % 12),
        speed: 0.25 + (i % 3) * 0.1,
      });
    }
  }

  private updateClouds(timeSec: number, dawn: number): void {
    if (!this.cloudMaterial) return;
    this.cloudMaterial.color.copy(CLOUD_NIGHT).lerp(CLOUD_DAWN, dawn);
    this.cloudMaterial.opacity = 0.12 + 0.3 * dawn;
    // Under reduced motion the clouds stand still: place them once.
    if (this.reduced && this.cloudsPlaced) return;
    this.cloudsPlaced = true;
    for (const c of this.clouds) {
      const v = horizontalToVector(c.alt, c.az + (this.reduced ? 0 : timeSec * c.speed));
      c.sprite.position.set(v[0] * CLOUD_RADIUS, v[1] * CLOUD_RADIUS, v[2] * CLOUD_RADIUS);
    }
  }

  setSize(width: number, height: number, pixelRatio: number): void {
    this.height = Math.max(1, height);
    this.pixelRatio = Math.min(2, pixelRatio);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(Math.max(1, width), this.height, false);
    this.camera.aspect = Math.max(1, width) / this.height;
  }

  setReducedMotion(reduced: boolean): void {
    this.reduced = reduced;
    this.starMaterial.uniforms.uTwinkle!.value = reduced ? 0 : 1;
  }

  render(camera: Camera, sceneUtc: number, timeSec: number, dawn: number): void {
    const m = skyMatrix(sceneUtc);
    this.sky.matrix.set(m[0], m[1], m[2], 0, m[3], m[4], m[5], 0, m[6], m[7], m[8], 0, 0, 0, 0, 1);
    this.sky.matrixWorldNeedsUpdate = true;

    const { right, up, forward } = cameraBasis(camera);
    this.basis.makeBasis(
      this.right.set(...right),
      this.up.set(...up),
      this.back.set(-forward[0], -forward[1], -forward[2]),
    );
    this.camera.quaternion.setFromRotationMatrix(this.basis);
    if (this.camera.fov !== camera.fov || this.projectedAspect !== this.camera.aspect) {
      this.camera.fov = camera.fov;
      this.projectedAspect = this.camera.aspect;
      this.camera.updateProjectionMatrix();
    }

    this.starMaterial.uniforms.uScale!.value =
      this.pixelRatio * Math.min(1.8, Math.sqrt(60 / camera.fov));
    this.starMaterial.uniforms.uTime!.value = timeSec;
    this.starMaterial.uniforms.uDawn!.value = dawn;
    this.domeMaterial.uniforms.uDawn!.value = dawn;
    this.updateClouds(timeSec, dawn);
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.disposed = true;
    for (const d of this.disposables) d.dispose();
    this.texture?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

/** A renderer on the canvas, or null when WebGL is not available. */
export function createSkyRenderer(canvas: HTMLCanvasElement): SkyRenderer | null {
  try {
    return new ThreeSkyRenderer(canvas);
  } catch {
    return null;
  }
}
