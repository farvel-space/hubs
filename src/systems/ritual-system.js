import { addMedia } from "../utils/media-utils";
import { renderChatMessage } from "../react-components/chat-message";
import { ObjectContentOrigins } from "../object-types";
import { usePinObject } from "../react-components/room/object-hooks";

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

  getIntIdFromSessionId = sessionId => {
    return this.intIds.indexOf(sessionId) + 1; // index of anchors starts with 1
  };

  // TODO: do some refactoring in order to have nicer styling for messages in room. probably add to the functionality of chat-message.js or using troika text altogether
  // TODO: Visibility of messages
  handleRitualMessage = async msgBody => {
    if (!this.scene.systems.permissions.canOrWillIfCreator("kick_users")) return;
    if (msgBody.message === null) return; // TODO: remove later on

    const { name, message, sessionId } = msgBody;
    let rndrMsg = message + "\n" + " - " + name;
    if (name == null) rndrMsg = message;

    console.log("handleRitualMessage", name, message, sessionId);

    // code snippet from src/react-components/chat-message.js:
    const [blob] = await renderChatMessage(rndrMsg, null, true);
    const msgFile = new File([blob], "ritual-message.png", { type: "image/png" });

    // position of anchor
    const iId = this.getIntIdFromSessionId(sessionId);
    const anchorPos = document.querySelector("a-entity.ritual-anchor-message-" + String(iId).padStart(3, "0")).object3D
      .position;

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
    // entity.setAttribute("visible", false);
    entity.setAttribute("position", anchorPos);

    entity.addEventListener("media_resolved", ({ detail }) => {
      if (!NAF.utils.isMine(entity) && !NAF.utils.takeOwnership(entity)) {
        console.error("Could not take ownership of media entity", detail);
        return;
      }
      window.APP.pinningHelper.setPinned(entity, true);
    });
  };
}
