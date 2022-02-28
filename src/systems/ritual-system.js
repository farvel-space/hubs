export class RitualSystem {
  constructor(scene) {
    this.scene = scene;

    this.scene.addEventListener("ritual_initiated", this.onRitualInitiated);
    this.scene.addEventListener("ritual_spark_start", this.onSpawnRitualSpark);
  }

  onSpawnRitualSpark = () => {
    console.log("ritual_spark_start");

    const entity = document.createElement("a-entity");
    // const tmpAnchorId = this.anchorId ? this.anchorId : 1;
    this.scene.appendChild(entity);
    entity.setAttribute("ritual-spark-avatar", { anchorId: this.anchorId ? this.anchorId : 1 });
    entity.setAttribute("offset-relative-to", { target: "#avatar-pov-node", offset: { x: 0, y: -0.25, z: 0 } });
    entity.setAttribute("networked", { template: "#ritual-spark-avatar" });
  };

  onRitualInitiated = () => {
    // emit message to open message modal
    APP.hubChannel.sendMessage("start", "ritual");

    console.log("RitualSystem.onRitualStarted");
    // map sessionid to int id
    this.presences = window.APP.hubChannel.presence.state;
    this.intIds = Object.keys(this.presences);

    // send message to all clients
    APP.hubChannel.sendMessage(this.intIds, "ritual_anchor_mapping");

    // set own id --> necessary?
    // this.anchorId = this.intIds.indexOf(window.NAF.clientId) + 1;
  };
}
