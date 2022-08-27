/* 'Farvel Frame' developed by Michael Morran July & August 2022 for Farvel
This feature automatically generates a child 3D element whenever a .png or .jpg are drag-and-dropped into hubs. In making these feature, a number of parameters have been made controllable in Spoke in the hierarchy on the scene level...

1. Enable Farvel Frame - Controls the presence of frames in the scene. If disabled, no frames will spawn on drag-and-dropped images.
2. Frames Visible By Default - Controls the starting size of frames once they load onto a drag-and-dropped image. If disabled, frames will be imperceptibly small when loading on drag-and-dropped images.
3. Frame Asset URL - The hosted link for the frame .glb. This should take .glbs hosted on the same server as the feature. Do not use sketchfab for hosting. 
4. Z-axis Offset - Controls the distance betweeen the image and the frame. This should be adjusted to properly situate pictures within each frame asset, ensuring that the image is not imbeded inside of the frame.
5. Asset Scale Settings - These parameters control the size of the frame asset relative to the image. 

For the implementation of this feature, the following changes have been made to the following directories and files. To query these changes, please search for comments between 'mike-frame' and 'mike-frame-end'.

space-client Branch: 'mike/farvel-frame'

space-client Files Added:
  src/components/farvel-frame.js
  src/components/toggle-frame-button.js
  src/systems/farvel-frame-system.js

space-client Files Changed:
  src/gltf-component-mappings.js
    Lines 621 -> 625
  src/hub.html
    Lines 455 -> 457
  src/hub.js
    Lines 195 -> 198
  src/scene-entry-manager.js
    Lines 25 -> 27
    Lines 232 -> 257

Spoke Branch: 'farvel-frame'

Spoke Files Added:
  scripts/deploy.js

Spoke Files Changes:
  package.json
    Line 26
  src/editor/nodes/SceneNode.js
    Lines 143 -> 156
    Lines 185 -> 193
    Lines 289 -> 297
    Lines 461 -> 471
  src/ui/properties/SceneNodeEditor.js 
    Lines 16 -> 18
    Lines 45 -> 53
    Lines 364 -> 413 (EDITS ARE IN REACT AND NOT COMMENTED WITH 'mike-frame')

For Spoke deployment, please follow this tutorial on a new file, please use this tutorial...
  A. yarn install
  B. yarn start
  C. Ensure scripts/deploy.js is present
  D. Ensure package.js has added the following deploy script: "deploy": "node -r esm -r @babel/register ./scripts/deploy.js",
  F. Create .ret.credentials file manually
  E. From your Hubs Client, copy and paste the .ret.credentials into Spoke's .ret.credentials
  G. yarn run deploy
*/

import { createImageTexture } from "../utils/media-utils";
import { TextureCache } from "../utils/texture-cache";

AFRAME.registerComponent("farvel-frame", {
  schema: {
    assetURL: {
      default: "https://jigsawhubs-1-assets.onboardxr.live/files/753c8479-b03f-4720-9d64-bf0352ab1fbb.glb"
    },
    zOffset: { default: -0.002 },
    scaleSetting: { default: { x: 3, y: 3, z: 1.5 } },
    defaultEnabled: { default: true },
    frameEl: { default: {} },
    isSmall: { default: false },
    ratio: { default: 1 },
    reflector: { default: false }
  },

  async init() {
    //Assign Spoke Data
    if (!window.APP["farvelFrame"].farvelFrame) return;
    Object.assign(this.data, window.APP["farvelFrame"]);
    this.time = 0;

    //determine image pixel ratio
    const textureCache = new TextureCache();
    const { src, version } = this.el.components["media-image"].data;
    let promise = createImageTexture(src);
    let texture = await promise;
    let cacheItem = textureCache.set(src, version, texture);
    this.data.ratio = cacheItem.ratio;

    //initialize networked frame element
    this.data.frameEl = document.createElement("a-entity");
    this.data.frameEl.setAttribute("media-loader", { src: this.data.assetURL, resolve: true });
    this.el.appendChild(this.data.frameEl);

    //calculate element scale with asset settings and media pixel ratio
    let elScale = this.el.object3D.scale;
    this.data.maxScale = new THREE.Vector3(
      elScale.x * this.data.scaleSetting.x,
      elScale.y * this.data.scaleSetting.y * this.data.ratio,
      elScale.z * this.data.scaleSetting.z
    );

    //set initial size and zoffset
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

    //On frame element loaded =>
    this.data.frameEl.addEventListener("media-loaded", () => {
      //remove manipulation on frame
      this.data.frameEl.removeAttribute("is-remote-hover-target");

      //set pinned event listener to pin frame el with main image
      this.el.addEventListener("pinned", () => {
        window.APP.pinningHelper.setPinned(this.data.frameEl, true);

        //set networked
        this.data.frameEl.setAttribute("networked", { template: "#interactable-media" });

        //remove as child using flushToDOM and reparent entity to scene and set world position
        // let framePos = new THREE.Vector3();
        // this.data.frameEl.object3D.getWorldPosition(framePos);
        // this.data.frameEl.flushToDOM();
        // AFRAME.scenes[0].appendChild(this.data.frameEl);
        // this.data.frameEl.setAttribute("position", framePos);
      });
    });
  },

  animateScale(dur, relScale) {
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
    if (!this.data.frameEl.object3D || this.data.isSmall === "") return;

    //reset frame el transform in case of accidental movement
    // this.data.frameEl.setAttribute("position", { x: 0, y: 0, z: this.data.zOffset });
    // this.data.frameEl.setAttribute("rotation", { x: 0, y: 0, z: 0 });

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

    //remove frame button if frameEl detached
    if (!this.data.frameEl.attached) {
      let buttonEl = this.el.querySelector("[toggle-frame-button]");
      buttonEl.object3D.visible = false;
      buttonEl.matrixAutoUpdate = true;
    }
  }
});
