import { addMedia } from "../utils/media-utils";
import { renderChatMessage } from "../react-components/chat-message";
import { ObjectContentOrigins } from "../object-types";

export class RitualSystem {
  constructor(scene) {
    this.scene = scene;

    this.scene.addEventListener("ritual_initiated", this.onRitualInitiated);
    this.scene.addEventListener("ritual_close_dialog_initiated", this.onCloseDialogInitiated);
    this.scene.addEventListener("ritual_spark_start", this.onSpawnRitualSpark);
    this.scene.addEventListener("ritual_spark_release", this.onRitualSparkRelease);
    this.scene.addEventListener("ritual_spark_release_initiated", this.onRitualSparkReleaseInitiated);
    this.scene.addEventListener("ritual_release_messages", this.onReleaseMessages);

    this.messageObjs = [];
  }

  sendJSONMessageToHubChannel = (dest, action, data) => {
    const message = {
      dest: dest,
      action: action,
      data: data
    };
    APP.hubChannel.sendMessage(JSON.stringify(message), "ritual");
  };

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
    this.isRitualManager = true;

    this.sendJSONMessageToHubChannel("client", "start", this.intIds);

    // // combine start message with intIDs
    // const msg = {
    //   dest: "client",
    //   action: "start",
    //   data: this.intIds
    // };

    // // send message with mapping info to all clients and start ritual
    // APP.hubChannel.sendMessage(JSON.stringify(msg), "ritual");
  };

  onCloseDialogInitiated = () => {
    if (!this.scene.systems.permissions.canOrWillIfCreator("kick_users")) return;

    // // send message to close RitualMessageModal
    // const msg = {
    //   dest: "client",
    //   action: "closeDialog"
    // };
    // APP.hubChannel.sendMessage(JSON.stringify(msg), "ritual");

    this.sendJSONMessageToHubChannel("client", "closeDialog");
  };

  onRitualSparkReleaseInitiated = () => {
    // const msg = {
    //   dest: "client",
    //   action: "release"
    // };
    // APP.hubChannel.sendMessage(JSON.stringify(msg), "ritual");
    this.sendJSONMessageToHubChannel("client", "release");
  };

  onRitualSparkRelease = () => {
    this.entity.components["ritual-spark-avatar"].releaseAnimation();
    this.entity = null;
  };

  getIntIdFromSessionId = sessionId => {
    return this.intIds.indexOf(sessionId) + 1; // index of anchors starts with 1
  };

  // TODO: do some refactoring in order to have nicer styling for messages in room. probably add to the functionality of chat-message.js or using troika text altogether
  handleRitualMessage = async msgBody => {
    if (!this.scene.systems.permissions.canOrWillIfCreator("kick_users") || !this.isRitualManager) return;
    if (msgBody.data.message === null) return; // TODO: remove later on

    const msgScale = 1.5;
    const { name, message, sessionId } = msgBody.data;
    let rndrMsg = message + "\n" + " - " + name;
    if (name == null) rndrMsg = message;

    // code snippet from src/react-components/chat-message.js:
    const [blob] = await renderChatMessage(rndrMsg, null, true);
    const msgFile = new File([blob], "ritual-message.png", { type: "image/png" });

    // position of anchor
    const iId = this.getIntIdFromSessionId(sessionId);
    const anchorObj = document.querySelector("a-entity.ritual-anchor-message-" + String(iId).padStart(3, "0"));
    const anchorPos = anchorObj.object3D.position;
    // convert to degrees and round to 2 decimals
    const anchorRot = {
      x: Math.round(anchorObj.object3D.rotation.x * (180 / Math.PI) * 100) / 100,
      y: Math.round(anchorObj.object3D.rotation.y * (180 / Math.PI) * 100) / 100,
      z: Math.round(anchorObj.object3D.rotation.z * (180 / Math.PI) * 100) / 100
    };

    // code snippet from src/scene-entry-manager.js:
    const { entity } = addMedia(
      msgFile,
      "#interactable-media",
      ObjectContentOrigins.FILE,
      null,
      !(msgFile instanceof MediaStream),
      true,
      false
    );
    entity.setAttribute("media-loader", { playSoundEffect: false });
    entity.setAttribute("visible", false);
    entity.setAttribute("position", anchorPos);
    entity.setAttribute("rotation", anchorRot);
    entity.setAttribute("scale", { x: msgScale, y: msgScale });

    entity.addEventListener("media_resolved", ({ detail }) => {
      if (!NAF.utils.isMine(entity) && !NAF.utils.takeOwnership(entity)) {0
        console.error("Could not take ownership of media entity", detail);
        return;
      }
      window.APP.pinningHelper.setPinned(entity, true);
      this.messageObjs.push(entity);
    });
  };

  onReleaseMessages = () => {
    if (!this.scene.systems.permissions.canOrWillIfCreator("kick_users")) return;

    this.messageObjs.forEach(entity => {
      entity.setAttribute("visible", true);
    });
    this.isRitualManager = false;
  };
}
