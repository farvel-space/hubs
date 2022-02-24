export class RitualSystem {
  constructor(scene) {
    this.scene = scene;

    this.scene.addEventListener("ritual_spark_start", this.onSpawnRitualSpark);
  }

  onSpawnRitualSpark = () => {
    console.log("ritual_spark_start");

    const entity = document.createElement("a-entity");
    this.scene.appendChild(entity);
    entity.setAttribute("offset-relative-to", { target: "#avatar-pov-node", offset: { x: 0, y: 0, z: 0 } });
    // entity.setAttribute("ritual-spark-avatar", { initialForce: 0, maxForce: 0, maxScale: 5 });
    entity.setAttribute("ritual-spark-avatar");
    entity.setAttribute("networked", { template: "#ritual-spark-avatar" });
  };
}
