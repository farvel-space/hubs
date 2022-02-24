// import { textureLoader } from "../utils/media-utils";
// import { resolveUrl } from "../utils/media-utils";
// import { proxiedUrlFor } from "../utils/media-url-utils";
import sparkImage from "../assets/images/ritual-spark.png";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
// import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
// import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const sparkImageSrcUrl = new URL(sparkImage, window.location.href).href;

/**
 * 
 * @component ritual-spark
 */
AFRAME.registerComponent("ritual-spark-avatar", {
  schema: {
    initialForce: { default: 0 },
    maxForce: { default: 6.5 },
    maxScale: { default: 5 }
  },

  init: function() {
    console.log("ritual-spark init", this.el);
    this.fpsCounter = 0;
    this.initialScale = this.el.object3D.scale.x;
    this.maxScale = this.data.maxScale * this.initialScale;

    NAF.utils.getNetworkedEntity(this.el).then(networkedEntity => {
      console.log("ritual-spark networkedEntity", networkedEntity);
      this.networkedEntity = networkedEntity;

      this.initialScale = this.networkedEntity.object3D.scale.x;
      this.maxScale = this.data.maxScale * this.initialScale;
    });

    const geometry = new THREE.PlaneGeometry(0.5, 0.5);
    const texture = new THREE.TextureLoader().load(sparkImageSrcUrl);
    const material = new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.material.transparent = true;
    mesh.material.alphaTest = 0;
    this.el.setObject3D("mesh", mesh);
  },

  tick: function() {
    this.fpsCounter += 1;
    // console.log("ritual-spark tick", t, dt);

    if (!this.networkedEntity || NAF.utils.isMine(this.networkedEntity)) {
      const entity = this.networkedEntity || this.el;

      // change opacity of material to random value
      if (this.fpsCounter % 12 === 0) {
        entity.getObject3D("mesh").material.opacity = Math.random() * 0.1 + 0.9;
      }
    }
  },
});
