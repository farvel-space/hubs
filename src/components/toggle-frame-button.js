import { guessContentType } from "../utils/media-url-utils";
import { findAncestorWithComponent } from "../utils/scene-graph";

AFRAME.registerComponent("toggle-frame-button", {
  init() {
    this.updateSrc = () => {
      if (!this.targetEl.parentNode) return; // If removed
      const src = (this.src = this.targetEl.components["media-loader"].data.src);
      const visible = src && guessContentType(src) !== "video/vnd.hubs-webrtc";
      this.el.object3D.visible = !!visible;
    };

    NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      this.targetEl = networkedEl;
      this.targetEl.addEventListener("media_resolved", this.updateSrc, { once: true });
      this.updateSrc();
    });

    this.onClick = () => {
      //console.log('clicked button')
      let framedEl = findAncestorWithComponent(this.el, "farvel-frame");
      if (!framedEl) return;
      let currentVal = framedEl.components["farvel-frame"].data.defaultEnabled;
      framedEl.setAttribute("farvel-frame", { defaultEnabled: !currentVal });
    };
  },

  play() {
    this.el.object3D.addEventListener("interact", this.onClick);
  },

  pause() {
    this.el.object3D.removeEventListener("interact", this.onClick);
  }
});
