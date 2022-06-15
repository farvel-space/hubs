import React, { useEffect, useState, useCallback } from "react";
import { useIntl, defineMessages } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { BackButton } from "../input/BackButton";
import { CloseButton } from "../input/CloseButton";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";
import { useForm } from "react-hook-form";
import { TextAreaInputField } from "../input/TextAreaInputField";
import { TextInputField } from "../input/TextInputField";
import styles from "./LeaveMessageModal.scss";
import { SCHEMA } from "../../storage/store";
import classNames from "classnames";
import { THREE } from "aframe";

const leaveMessageMessages = defineMessages({
  titleEntry: {
    id: "leave-message-modal.entry.title",
    defaultMessage: "Leave a comment or thought"
  },
  titleMessage: {
    id: "leave-message-modal.message.title",
    defaultMessage: "Comment"
  },
  titleThoughts: {
    id: "leave-message-modal.thoughts.title",
    defaultMessage: "Thoughts"
  },
  entryButtonMessage: {
    id: "leave-message-modal.entry.buttonMessage",
    defaultMessage: "Leave a comment."
  },
  entryButtonThoughts: {
    id: "leave-message-modal.entry.buttonThoughts",
    defaultMessage: "Words fail me."
  },
  submitMessage: {
    id: "leave-message-modal.message.submit",
    defaultMessage: "Share comment"
  },
  description: {
    id: "leave-message-modal.message.description",
    defaultMessage:
      "You can now submit a comment to the deceased. The comment will be be placed in the room. If you don't want to submit a comment, you can go back and choose the - Words fail me. - option or you click onto the X in the top left."
  },
  checkboxShowName: {
    id: "leave-message-modal.checkboxShowName",
    defaultMessage: "Sign with my name."
  },
  labelName: {
    id: "leave-message-modal.labelName",
    defaultMessage: "Name"
  },
  labelMessage: {
    id: "leave-message-modal.labelMessage",
    defaultMessage: "Comment"
  },
  labelPreview: {
    id: "leave-message-modal.labelPreview",
    defaultMessage: "Preview"
  },
  messageThought: {
    id: "leave-message-modal.messageThought",
    defaultMessage: "{name} thinks of you."
  },
  messageThoughtAnonymous: {
    id: "leave-message-modal.messageThoughtAnonymous",
    defaultMessage: "I think of you."
  },
  infoGoInFrontOfPicture: {
    id: "leave-message-modal.infoGoInFrontOfPicture",
    defaultMessage:
      "The comment will be placed in front of you. Please go in front of the picture, you want to comment on."
  },
  infoPubliclyVisible: {
    id: "leave-message-modal.infoPubliclyVisible",
    defaultMessage:
      "The comment will be visible to everyone. If you don't want that, please go back and close the dialog via the X in the top left."
  },
  notAvailableInfo: {
    id: "leave-message-modal.notAvailableInfo",
    defaultMessage:
      "Sorry, it is not possible to comment right now. Please let the farvel team know via {contactEmail}, so that this feature can be reactivated."
  },
  notAvailableCloseBtn: {
    id: "leave-message-modal.notAvailableCloseBtn",
    defaultMessage: "Close"
  },
  notAvailableMailSubject: {
    id: "leave-message-modal.notAvailableMailSubject",
    defaultMessage: "Comment functionality not available"
  },
  notAvailableMailBody: {
    id: "leave-message-modal.notAvailableMailBody",
    defaultMessage: "Hi farvel team, I cannot comment on pictures in room:"
  }
});

const ENTRY_STATE = 0;
const MESSAGE_STATE = 1;
const THOUGHTS_STATE = -1;

export function LeaveMessageModal({ scene, store, onClose }) {
  const intl = useIntl();
  const { handleSubmit, register, watch, setValue } = useForm();
  const [dialogState, setDialogState] = useState(ENTRY_STATE);
  const [submitDisplayName, setSubmitDisplayName] = useState(true);
  // const [submitDisplayNameChangedState, setSubmitDisplayNameChangedState] = useState(true);
  const submittedName = watch("submittedName", store.state.profile.displayName);
  const submittedMessage = watch("submittedMessage", "");

  useEffect(
    () => {
      register("submittedName");
      register("submittedMessage");
      return () => {};
    },
    [register]
  );

  const getThoughtValue = useCallback(
    () => {
      if (submitDisplayName) {
        return intl.formatMessage(leaveMessageMessages.messageThought, { name: submittedName });
      } else {
        return intl.formatMessage(leaveMessageMessages.messageThoughtAnonymous);
      }
    },
    [submitDisplayName, submittedName, intl]
  );

  const onSubmit = useCallback(
    () => {
      let tmpMsg = submittedMessage;
      let tmpName = submittedName;
      if (dialogState === THOUGHTS_STATE) {
        tmpMsg = getThoughtValue();
        tmpName = null;
      }

      // position and rotation
      const objOffset = new THREE.Vector3(0, 0, -0.5);
      const avatarRig = document.querySelector("#avatar-pov-node");
      avatarRig.object3D.localToWorld(objOffset); // getting current world position
      const objQuat = new THREE.Quaternion();
      avatarRig.object3D.getWorldQuaternion(objQuat);
      const objRotation = new THREE.Euler().setFromQuaternion(objQuat, "YXZ");

      // send message to manager with conditionals
      const message = {
        dest: "manager",
        action: "leaveMessage",
        data: {
          name: submitDisplayName ? tmpName : null, // TODO: if not wanted, dont show name or send "anonymous"?!
          message: tmpMsg,
          objOffset: objOffset,
          objRotation: objRotation
        }
      };

      APP.hubChannel.sendMessage(JSON.stringify(message), "leaveMessage");
      onClose();
    },
    [onClose, submittedName, submittedMessage, submitDisplayName, getThoughtValue, dialogState]
  );

  const onNameChange = useCallback(
    e => {
      setValue("submittedName", e.target.value);
    },
    [setValue]
  );

  const onMessageChange = useCallback(
    e => {
      setValue("submittedMessage", e.target.value);
    },
    [setValue]
  );

  const onCheckboxSubmitDisplayNameChange = useCallback(
    e => {
      setSubmitDisplayName(e.target.checked);
    },
    [setSubmitDisplayName]
  );

  const isFarvelLeaveMessageBotPresent = () => {
    const presences = window.APP.hubChannel.presence.state;
    for (const key in presences) {
      if (
        presences[key].metas[0].profile.identityName &&
        presences[key].metas[0].profile.identityName == "farvel Bot" &&
        presences[key].metas[0].roles["owner"] == true &&
        presences[key].metas[0].roles["signed_in"] == true
      ) {
        return true;
      }
    }
    return false;
  };

  if (!isFarvelLeaveMessageBotPresent()) {
    const contactEmail = "hi@farvel.space";
    return (
      <Modal
        title={intl.formatMessage(leaveMessageMessages.titleEntry)}
        beforeTitle={<CloseButton onClick={onClose} />}
      >
        <Column padding center className={classNames(styles.entry, styles.hiddenAttr)}>
          <p>
            {intl.formatMessage(leaveMessageMessages.notAvailableInfo, {
              contactEmail: (
                <a
                  href={`mailto:${contactEmail}?subject=${intl.formatMessage(
                    leaveMessageMessages.notAvailableMailSubject
                  )}&body=${intl.formatMessage(leaveMessageMessages.notAvailableMailBody)} ${window.location.href} `}
                >
                  {contactEmail}
                </a>
              )
            })}
          </p>
          <Button lg type="button" preset="cancel" onClick={onClose}>
            {intl.formatMessage(leaveMessageMessages.notAvailableCloseBtn)}
          </Button>
        </Column>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        dialogState == ENTRY_STATE
          ? intl.formatMessage(leaveMessageMessages.titleEntry)
          : dialogState == MESSAGE_STATE
            ? intl.formatMessage(leaveMessageMessages.titleMessage)
            : intl.formatMessage(leaveMessageMessages.titleThoughts)
      }
      beforeTitle={
        dialogState == ENTRY_STATE ? (
          <CloseButton onClick={onClose} />
        ) : (
          <BackButton onClick={() => setDialogState(ENTRY_STATE)} />
        )
      }
    >
      {/* Entry Dialog */}
      <Column
        padding
        center
        className={classNames(styles.entry, styles.hiddenAttr)}
        hidden={!(dialogState == ENTRY_STATE)}
      >
        <p>{intl.formatMessage(leaveMessageMessages.infoGoInFrontOfPicture)}</p>
        <Button lg type="button" preset="accent1" onClick={() => setDialogState(MESSAGE_STATE)}>
          {intl.formatMessage(leaveMessageMessages.entryButtonMessage)}
        </Button>
        <Button lg type="button" preset="accent2" onClick={() => setDialogState(THOUGHTS_STATE)}>
          {intl.formatMessage(leaveMessageMessages.entryButtonThoughts)}
        </Button>
      </Column>

      {/* Message and Thought Form */}
      <Column
        as="form"
        className={classNames(styles.hiddenAttr, styles.form)}
        padding
        center
        onSubmit={handleSubmit(onSubmit)}
        hidden={dialogState == ENTRY_STATE}
      >
        <div className="messageGroup" hidden={dialogState != MESSAGE_STATE}>
          <TextAreaInputField
            name="textarea-message"
            autoComplete="off"
            placeholder={intl.formatMessage(leaveMessageMessages.description)}
            label={intl.formatMessage(leaveMessageMessages.labelMessage)}
            minRows={8}
            onChange={onMessageChange}
            // ref={register}
            // error={errors.description}
            required={dialogState == MESSAGE_STATE}
            fullWidth
          />
        </div>
        <div className="messageGroup thought-preview" hidden={dialogState != THOUGHTS_STATE}>
          <p>{intl.formatMessage(leaveMessageMessages.infoPubliclyVisible)}</p>
          <TextAreaInputField
            name="textarea-message-preview"
            autoComplete="off"
            label={intl.formatMessage(leaveMessageMessages.labelPreview)}
            minRows={2}
            disabled={true}
            value={getThoughtValue()}
            fullWidth
          />
        </div>
        <TextInputField
          id="text-input-name"
          name="submittedName"
          disabled={!submitDisplayName}
          label={intl.formatMessage(leaveMessageMessages.labelName)}
          value={submitDisplayName ? submittedName : ""}
          pattern={SCHEMA.definitions.profile.properties.displayName.pattern}
          spellCheck="false"
          required
          onChange={onNameChange} // needed when using form?
          fullWidth
          // description={
          //   <FormattedMessage
          //     id="avatar-settings-content.display-name-description"
          //     defaultMessage="Alphanumerics, hyphens, underscores, and tildes. At least 3 characters, no more than 32"
          //   />
          // }
        />
        <div className="checkbox-container">
          <input
            id="checkbox-submit-display-name"
            type="checkbox"
            className="checkbox"
            checked={submitDisplayName}
            onChange={onCheckboxSubmitDisplayNameChange}
          />
          <label>{intl.formatMessage(leaveMessageMessages.checkboxShowName)}</label>
        </div>
        {/* <div className="checkbox-container">
          <input
            id="checkbox-disclose-to-room"
            type="checkbox"
            className="checkbox"
            checked={discloseToRoom}
            onChange={onCheckboxDiscloseToRoomChange}
          />
          <label>{intl.formatMessage(leaveMessageMessages.checkboxDiscloseToRoom)}</label>
        </div> */}
        <Button type="submit" preset="accept">
          {intl.formatMessage(leaveMessageMessages.submitMessage)}
        </Button>
      </Column>
    </Modal>
  );
}

LeaveMessageModal.propTypes = {
  onClose: PropTypes.func,
  scene: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired
};