
class Filamant_App {
  constructor() {
    this.canvas = document.getElementById('ar_canvas');
    const engine = this.engine = Filament.Engine.create(this.canvas, {alpha: true});
    this.scene = engine.createScene();
    this.triangle = Filament.EntityManager.get()
      .create();
    this.scene.addEntity(this.triangle);
    const TRIANGLE_POSITIONS = new Float32Array([
      1, 0,
      Math.cos(Math.PI * 2 / 3), Math.sin(Math.PI * 2 / 3),
      Math.cos(Math.PI * 4 / 3), Math.sin(Math.PI * 4 / 3),
    ]);
    const TRIANGLE_COLORS = new Uint32Array([0xffff0000, 0xff00ff00, 0xff0000ff]);
    const VertexAttribute = Filament.VertexAttribute;
    const AttributeType = Filament.VertexBuffer$AttributeType;
    this.vb = Filament.VertexBuffer.Builder()
      .vertexCount(3)
      .bufferCount(2)
      .attribute(VertexAttribute.POSITION, 0, AttributeType.FLOAT2, 0, 8)
      .attribute(VertexAttribute.COLOR, 1, AttributeType.UBYTE4, 0, 4)
      .normalized(VertexAttribute.COLOR)
      .build(engine);
    this.vb.setBufferAt(engine, 0, TRIANGLE_POSITIONS);
    this.vb.setBufferAt(engine, 1, TRIANGLE_COLORS);
    this.ib = Filament.IndexBuffer.Builder()
      .indexCount(3)
      .bufferType(Filament.IndexBuffer$IndexType.USHORT)
      .build(engine);
    this.ib.setBuffer(engine, new Uint16Array([0, 1, 2]));
    const mat = engine.createMaterial('../arrow.gltf');
    const matinst = mat.getDefaultInstance();
    Filament.RenderableManager.Builder(1)
      .boundingBox({
        center: [-1, -1, -1],
        halfExtent: [1, 1, 1]
      })
      .material(0, matinst)
      .geometry(0, Filament.RenderableManager$PrimitiveType.TRIANGLES, this.vb, this.ib)
      .build(engine, this.triangle);
    this.swapChain = engine.createSwapChain();
    this.renderer = engine.createRenderer();
    this.camera = engine.createCamera(Filament.EntityManager.get()
      .create());
    this.view = engine.createView();
    this.view.setBlendMode(Filament.View$BlendMode.TRANSLUCENT)
    this.view.setCamera(this.camera);
    this.view.setScene(this.scene);
    // Set up a blue-green background:
    // this.renderer.setClearOptions({
    //   clearColor: [0.0, 0.1, 0.2, 1.0],
    //   clear: true
    // });
    // Adjust the initial viewport:
    this.resize();
    this.render = this.render.bind(this);
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    window.requestAnimationFrame(this.render);
  }
  render() {
    // Rotate the triangle.
    const radians = Date.now() / 1000;
    const transform = mat4.fromRotation(mat4.create(), radians, [0, 0, 1]);
    const tcm = this.engine.getTransformManager();
    const inst = tcm.getInstance(this.triangle);
    tcm.setTransform(inst, transform);
    inst.delete();
    // Render the frame.
    this.renderer.render(this.swapChain, this.view);
    window.requestAnimationFrame(this.render);
  }
  resize() {
    const dpr = window.devicePixelRatio;
    let h=window.innerWidth , w = window.innerHeight;
    let d = w<h?w:h
    d=d*0.3
    const width = this.canvas.width = d//window.innerWidth * dpr;
    const height = this.canvas.height = d// window.innerHeight * dpr;
    this.view.setViewport([0, 0, width, height]);
    const aspect = width / height;
    const Projection = Filament.Camera$Projection;
    this.camera.setProjection(Projection.ORTHO, -aspect, aspect, -1, 1, 0, 1);
    this.canvas.className="ARCANVAS";
  }
}

if (USER_TYPE!="agent"){
Filament.init(['../arrow.gltf'], () => {
  window.app = new Filamant_App()
  document.getElementById('ar_canvas').className="ARCANVAS";
});
}
// https://google.github.io/filament/webgl/triangle.filamat