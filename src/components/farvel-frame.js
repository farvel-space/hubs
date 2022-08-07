import { createImageTexture } from "../utils/media-utils";
import { TextureCache } from "../utils/texture-cache";

AFRAME.registerComponent("farvel-frame", {
  schema: {
    assetURL: {
      default: "https://jigsawhubs-1-assets.onboardxr.live/files/aa1df4e8-92b9-4358-ad90-4437663b6a2b.glb"
    },
    zOffset: { default: -0.026 },
    scaleSetting: { default: { x: 0.6, y: 0.6, z: 0.5 } },
    defaultEnabled: { default: true },
    frameEl: { default: {} },
    isSmall: { default: false },
    ratio: { default: 1 }
  },

  async init() {
    this.time = 0;

    const textureCache = new TextureCache();
    const { src, version } = this.el.components["media-image"].data;

    //determine image scale-ratio
    let promise = createImageTexture(src);
    let texture = await promise;
    let cacheItem = textureCache.set(src, version, texture);
    this.data.ratio = cacheItem.ratio;

    //initialize frame element
    this.data.frameEl = document.createElement("a-entity");
    this.el.appendChild(this.data.frameEl);
    this.data.frameEl.setAttribute("media-loader", { src: this.data.assetURL, resolve: true });

    //set networked
    this.data.frameEl.setAttribute("networked", { template: "#interactable-media" });

    //set size and zoffset
    let elScale = this.el.object3D.scale;
    this.data.maxScale = new THREE.Vector3(
      elScale.x * this.data.scaleSetting.x,
      elScale.y * this.data.scaleSetting.y * this.data.ratio,
      elScale.z * this.data.scaleSetting.z
    );
    this.data.frameEl.object3D.position.z = this.data.zOffset;
    if (this.data.defaultEnabled) {
      this.data.frameEl.setAttribute("scale", {
        x: this.data.maxScale.x,
        y: this.data.maxScale.y,
        z: this.data.maxScale.z
      });
      this.data.isSmall = false;
    } else {
      this.data.frameEl.setAttribute("scale", {
        x: this.data.maxScale.x * 0.0001,
        y: this.data.maxScale.x * 0.0001,
        z: this.data.maxScale.x * 0.0001
      });
      this.data.isSmall = true;
    }
    this.data.frameEl.object3D.matrixAutoUpdate = true;
  },

  animateScale(dur, relScale) {
    console.log(this.data.maxScale);
    if (!this.data.maxScale) return;
    let animScale = AFRAME.ANIME.default.timeline({
      targets: this.data.frameEl.object3D.scale,
      loop: false,
      autoplay: true,
      easing: "easeInOutSine",
      duration: dur
    });
    animScale.add({
      x: this.data.maxScale.x * relScale,
      y: this.data.maxScale.y * relScale,
      z: this.data.maxScale.z * relScale
    });
    animScale.began = true;
  },

  tick(t, dt) {
    this.time += dt;
    //console.log("ticking");
    //update visibility based on defaultEnabled
    if (this.data.isSmall && this.data.defaultEnabled) {
      //make big
      this.data.isSmall = false;
      this.animateScale(3000, 1);
    } else if (!this.data.isSmall && !this.data.defaultEnabled) {
      //make small
      this.data.isSmall = true;
      this.animateScale(3000, 0.001);
    }
  }
});
