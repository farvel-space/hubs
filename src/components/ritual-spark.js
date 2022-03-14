import anime from "animejs";
import sparkImage from "../assets/images/ritual-spark.png";
const sparkImageSrcUrl = new URL(sparkImage, window.location.href).href;
const animation_1_duration = 10000;
const animation_2_duration = 60000;

/**
 *
 * @component ritual-spark
 */
AFRAME.registerComponent("ritual-spark-avatar", {
  schema: {
    anchorId: { default: 1, type: "int" }
  },

  init: function() {
    // console.log("ritual-spark init", this.el);
    this.fpsCounter = 0;
    this.animation_1_started = false;

    // NAF.utils.getNetworkedEntity(this.el).then(networkedEntity => {
    //   // console.log("ritual-spark networkedEntity", networkedEntity);
    //   this.networkedEntity = networkedEntity;
    // });

    const geometry = new THREE.PlaneGeometry(0.5, 0.5);
    const texture = new THREE.TextureLoader().load(sparkImageSrcUrl);
    const material = new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.material.transparent = true;
    mesh.material.alphaTest = 0;
    this.el.setObject3D("mesh", mesh);

    // select tree anchor
    const anchor = document.querySelector("a-entity.ritual-anchor-" + String(this.data.anchorId).padStart(3, "0"));
    this.anchor = anchor.object3D.position;
    console.log("anchor selector", "a-entity.ritual-anchor-" + String(this.data.anchorId).padStart(3, "0"));
  },

  animate: function(x, y, z, duration) {
    // animation
    const obj = this.el.object3D;

    const step = (function() {
      const lastValue = {};
      return function(anim) {
        const value = anim.animatables[0].target;
        
        // For animation timeline.
        if (value.x === lastValue.x && value.y === lastValue.y && value.z === lastValue.z) {
          return;
        }

        lastValue.x = value.x;
        lastValue.y = value.y;
        lastValue.z = value.z;

        obj.position.set(value.x, value.y, value.z);
        obj.matrixNeedsUpdate = true;
      };
    })();

    // TODO: depending on scenery structure, x and z should be swapped. Maybe there should be a config in the scene.
    const config = {
      duration: duration,
      loop: 0,
      round: false,
      x: {
        value: x,
        easing: "easeOutBack" // "easeInOutQuad"
      },
      y: {
        value: y,
        easing: "easeInCubic"
      },
      z: {
        value: z,
        easing: "easeInOutQuad"
      },
      targets: obj.position,
      update: anim => step(anim),
      complete: anim => step(anim)
    };
    anime(config);
  },

  // update: function(oldData) {
  //   console.log("ritual-spark update old data", oldData);
  //   console.log("ritual-spark update", this.el.object3D.position);
  // },

  // updateSchema: function(data) {
  //   console.log("ritual-spark updateSchema", data);
  // },

  // how to trigger this function?
  releaseAnimation: function() {
    const y = 1001;
    let x = this.anchor.x;
    let z = this.anchor.z;

    if (Math.random() > 0.5) {
      x += Math.random() * 10;
      z += Math.random() * 10;
    } else {
      x -= Math.random() * 10;
      z -= Math.random() * 10;
    }

    this.animate(x, y, z, animation_2_duration); // because of destroy-at-extreme-distances, this entity will be destroyed when passing 1000 units
  },

  tick: function() {
    this.fpsCounter += 1;
    // console.log("ritual-spark tick", t, dt);

    if (!this.networkedEntity || NAF.utils.isMine(this.networkedEntity)) {
      const entity = this.networkedEntity || this.el;
      // console.log("ritual-spark tick", entity.object3D.position);

      // change opacity of material to random value // TODO: use anime.js for this?
      if (this.fpsCounter % 12 === 0) {
        entity.getObject3D("mesh").material.opacity = Math.random() * 0.1 + 0.9;
      }

      if (!this.animation_1_started) {
        this.animation_1_started = true;
        this.animate(this.anchor.x, this.anchor.y, this.anchor.z, animation_1_duration);
      }
    }
  }
});
