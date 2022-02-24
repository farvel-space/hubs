import anime from "animejs";
import sparkImage from "../assets/images/ritual-spark.png";
const sparkImageSrcUrl = new URL(sparkImage, window.location.href).href;

/**
 *
 * @component ritual-spark
 */
AFRAME.registerComponent("ritual-spark-avatar", {
  // schema: {
  //   initialForce: { default: 0 },
  //   maxForce: { default: 6.5 },
  //   maxScale: { default: 5 }
  // },

  init: function() {
    console.log("ritual-spark init", this.el);
    this.fpsCounter = 0;
    this.animation_1_started = false;
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



    console.log("position", this.el.object3D.position);

  },

  startAnimation: function() {
    // animation
    const obj = this.el.object3D;

    const step = (function() {
      const lastValue = {};
      return function(anim) {
        const value = anim.animatables[0].target;
        // value.x = Math.max(Number.MIN_VALUE, value.x);
        // value.y = Math.max(Number.MIN_VALUE, value.y);
        // value.z = Math.max(Number.MIN_VALUE, value.z);

        // console.log("ritual-spark step", value);

        // For animation timeline.
        if (value.x === lastValue.x && value.y === lastValue.y && value.z === lastValue.z) {
          return;
        }

        lastValue.x = value.x;
        lastValue.y = value.y;
        lastValue.z = value.z;

        obj.position.set( value.x, value.y, value.z);
        obj.matrixNeedsUpdate = true;
      };
    })();

    
    const config = {
      duration: 10000,
      easing: "linear",
      loop: 0,
      round: false,
      x: 0,
      y: 0.5,
      z: 0,
      targets: [{ x: obj.position.x, y: obj.position.y, z: obj.position.z }],
      update: anim => step(anim),
      complete: anim => step(anim)
    };
    console.log("ritual-spark startAnimation config", config);

    anime(config);
  },

  // update: function(oldData) {
  //   console.log("ritual-spark update old data", oldData);
  //   console.log("ritual-spark update", this.el.object3D.position);
  // },

  // updateSchema: function(data) {
  //   console.log("ritual-spark updateSchema", data);
  // },

  tick: function() {
    this.fpsCounter += 1;
    // console.log("ritual-spark tick", t, dt);
   
    if (!this.networkedEntity || NAF.utils.isMine(this.networkedEntity)) {
      const entity = this.networkedEntity || this.el;

      // console.log("ritual-spark tick", entity.object3D.position);

      // change opacity of material to random value
      if (this.fpsCounter % 12 === 0) {
        entity.getObject3D("mesh").material.opacity = Math.random() * 0.1 + 0.9;
      }

      if (!this.animation_1_started) {
        this.animation_1_started = true;
        this.startAnimation();
      }
    }
  }
});
