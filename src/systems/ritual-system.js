import { addMedia } from "../utils/media-utils";
import model from "../assets/models/emojis/emoji_0.glb";

export class RitualSystem {
  constructor(scene) {
    this.scene = scene;

    this.scene.addEventListener("ritual_spark_start", this.onSpawnRitualSpark);
  }

  onSpawnRitualSpark = () => {
    console.log("ritual_spark_start");

    // const { entity } = addMedia(model, "#ritual-spark-avatar");
    const entity = document.createElement("a-entity");
    this.scene.appendChild(entity);
    entity.setAttribute("ritual-spark-avatar", { initialForce: 0, maxForce: 0, maxScale: 5 });
    entity.setAttribute("offset-relative-to", { target: "#avatar-pov-node", offset: { x: 0, y: 0, z: -1.5 } });
    entity.setAttribute("networked", { template: "#ritual-spark-avatar"});
  }
}