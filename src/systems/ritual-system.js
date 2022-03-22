export class RitualSystem {
  constructor(scene) {
    this.scene = scene;

    this.scene.addEventListener("ritual_initiated", this.onRitualInitiated);
    this.scene.addEventListener("ritual_close_dialog_initiated", this.onCloseDialogInitiated);
    this.scene.addEventListener("ritual_spark_start", this.onSpawnRitualSpark);
    this.scene.addEventListener("ritual_spark_release", this.onRitualSparkRelease);
    this.scene.addEventListener("ritual_spark_release_initiated", this.onRitualSparkReleaseInitiated);
  }

  onSpawnRitualSpark = () => {
    if (this.entity) return;

    const entity = document.createElement("a-entity");
    // const tmpAnchorId = this.anchorId ? this.anchorId : 1;
    this.scene.appendChild(entity);
    entity.setAttribute("ritual-spark-avatar", { anchorId: this.anchorId ? this.anchorId : 1 });
    entity.setAttribute("offset-relative-to", { target: "#avatar-pov-node", offset: { x: 0, y: -0.25, z: 0 } });
    entity.setAttribute("destroy-at-extreme-distances", { yMax: 300 }); // for release animation, 400 is enough
    entity.setAttribute("networked", { template: "#ritual-spark-avatar" });

    this.entity = entity;
  };

  onRitualInitiated = () => {
    if (!this.scene.systems.permissions.canOrWillIfCreator("kick_users")) return;

    // map sessionid to int id
    this.presences = window.APP.hubChannel.presence.state;
    this.intIds = Object.keys(this.presences);
    // send message with mapping info to all clients
    APP.hubChannel.sendMessage(this.intIds, "ritual_anchor_mapping");

    // send message to open RitualMessageModal
    APP.hubChannel.sendMessage("start", "ritual");
  };

  onCloseDialogInitiated = () => {
    if (!this.scene.systems.permissions.canOrWillIfCreator("kick_users")) return;
    // send message to close RitualMessageModal
    APP.hubChannel.sendMessage("closeDialog", "ritual");
  };

  onRitualSparkReleaseInitiated = () => {
    APP.hubChannel.sendMessage("release", "ritual");
  };

  onRitualSparkRelease = () => {
    this.entity.components["ritual-spark-avatar"].releaseAnimation();
    this.entity = null;
  };
}
