import React, { useEffect, useState, useCallback } from "react";
import { useIntl, defineMessages } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { BackButton } from "../input/BackButton";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";
import { useForm } from "react-hook-form";
import { TextAreaInputField } from "../input/TextAreaInputField";
import { TextInputField } from "../input/TextInputField";
import styles from "./RitualMessageModal.scss";
import { SCHEMA } from "../../storage/store";
import classNames from "classnames";

const ritualMessageMessages = defineMessages({
  titleEntry: {
    id: "ritual-message-modal.entry.title",
    defaultMessage: "Take part in the ritual"
  },
  titleMessage: {
    id: "ritual-message-modal.message.title",
    defaultMessage: "Message"
  },
  titleThoughts: {
    id: "ritual-message-modal.thoughts.title",
    defaultMessage: "Thoughts"
  },
  entryButtonMessage: {
    id: "ritual-message-modal.entry.buttonMessage",
    defaultMessage: "I want to share my last words."
  },
  entryButtonThoughts: {
    id: "ritual-message-modal.entry.buttonThoughts",
    defaultMessage: "Words fail me."
  },
  submitMessage: {
    id: "ritual-message-modal.message.submit",
    defaultMessage: "Share Message"
  },
  submitThoughts: {
    id: "ritual-message-modal.thoughts.submit",
    defaultMessage: "My thoughts are with you."
  },
  description: {
    id: "ritual-message-modal.message.description",
    defaultMessage:
      "You can now submit a message to the deceased. The message will be be shown in the room afterwards. Participation is optional. If you don't want to submit a message, you can go back and choose the - Words fail me. - option."
  },
  checkboxShowName: {
    id: "ritual-message-modal.checkboxShowName",
    defaultMessage: "Sign with my name."
  },
  checkboxDiscloseToRoom: {
    id: "ritual-message-modal.discloseToRoom",
    defaultMessage: "Publish message in room."
  },
  labelName: {
    id: "ritual-message-modal.labelName",
    defaultMessage: "Name"
  },
  labelMessage: {
    id: "ritual-message-modal.labelMessage",
    defaultMessage: "Message"
  },
  labelPreview: {
    id: "ritual-message-modal.labelPreview",
    defaultMessage: "Preview"
  },
  messageThought: {
    id: "ritual-message-modal.messageThought",
    defaultMessage: "{name} thought of you."
  },
  nameThoughtAnonymous: {
    id: "ritual-message-modal.nameThoughtAnonymous",
    defaultMessage: "Someone"
  }
});

const ENTRY_STATE = 0;
const MESSAGE_STATE = 1;
const THOUGHTS_STATE = -1;

export function RitualMessageModal({ scene, store, onClose }) {
  const intl = useIntl();
  const { handleSubmit, register, watch, setValue } = useForm();
  const [dialogState, setDialogState] = useState(ENTRY_STATE);
  // const [hasEnteredMessage, setHasEnteredMessage] = useState(false);
  const [submitDisplayName, setSubmitDisplayName] = useState(true);
  const [submitDisplayNameChangedState, setSubmitDisplayNameChangedState] = useState(true);
  const [discloseToRoom, setDiscloseToRoom] = useState(true);
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
      const name = submitDisplayName ? submittedName : intl.formatMessage(ritualMessageMessages.nameThoughtAnonymous);
      return intl.formatMessage(ritualMessageMessages.messageThought, { name: name });
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

      // send message to manager with conditionals
      const message = {
        dest: "manager",
        action: "ritualMessage",
        data: {
          name: submitDisplayName ? tmpName : null, // TODO: if not wanted, dont show name or send "anonymous"?!
          message: discloseToRoom ? tmpMsg : null
        }
      };
      APP.hubChannel.sendMessage(JSON.stringify(message), "ritual");

      scene.emit("ritual_spark_start");
      onClose();
    },
    [scene, onClose, submittedName, submittedMessage, discloseToRoom, submitDisplayName, getThoughtValue, dialogState]
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
      setSubmitDisplayNameChangedState(e.target.checked);
    },
    [setSubmitDisplayName, setSubmitDisplayNameChangedState]
  );

  const onCheckboxDiscloseToRoomChange = useCallback(
    e => {
      setDiscloseToRoom(e.target.checked);
      if (e.target.checked) {
        setSubmitDisplayName(submitDisplayNameChangedState);
      } else {
        setSubmitDisplayName(false);
      }
    },
    [setDiscloseToRoom, setSubmitDisplayName, submitDisplayNameChangedState]
  );

  return (
    <Modal
      title={
        dialogState == ENTRY_STATE
          ? intl.formatMessage(ritualMessageMessages.titleEntry)
          : dialogState == MESSAGE_STATE
            ? intl.formatMessage(ritualMessageMessages.titleMessage)
            : intl.formatMessage(ritualMessageMessages.titleThoughts)
      }
      beforeTitle={dialogState == ENTRY_STATE ? null : <BackButton onClick={() => setDialogState(ENTRY_STATE)} />}
    >
      {/* Entry Dialog */}
      <Column
        padding
        center
        className={classNames(styles.entry, styles.hiddenAttr)}
        hidden={!(dialogState == ENTRY_STATE)}
      >
        <Button lg type="button" preset="accent1" onClick={() => setDialogState(MESSAGE_STATE)}>
          {intl.formatMessage(ritualMessageMessages.entryButtonMessage)}
        </Button>
        <Button lg type="button" preset="accent2" onClick={() => setDialogState(THOUGHTS_STATE)}>
          {intl.formatMessage(ritualMessageMessages.entryButtonThoughts)}
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
            placeholder={intl.formatMessage(ritualMessageMessages.description)}
            label={intl.formatMessage(ritualMessageMessages.labelMessage)}
            minRows={8}
            onChange={onMessageChange}
            // ref={register}
            // error={errors.description}
            required={dialogState == MESSAGE_STATE}
            fullWidth
          />
        </div>
        <div className="messageGroup thought-preview" hidden={dialogState != THOUGHTS_STATE}>
          <TextAreaInputField
            name="textarea-message-preview"
            autoComplete="off"
            label={intl.formatMessage(ritualMessageMessages.labelPreview)}
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
          label={intl.formatMessage(ritualMessageMessages.labelName)}
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
            disabled={!discloseToRoom}
          />
          <label className={!discloseToRoom ? "disabled" : null}>
            {intl.formatMessage(ritualMessageMessages.checkboxShowName)}
          </label>
        </div>
        <div className="checkbox-container">
          <input
            id="checkbox-disclose-to-room"
            type="checkbox"
            className="checkbox"
            checked={discloseToRoom}
            onChange={onCheckboxDiscloseToRoomChange}
          />
          <label>{intl.formatMessage(ritualMessageMessages.checkboxDiscloseToRoom)}</label>
        </div>
        <Button type="submit" preset="accept">
          {intl.formatMessage(
            dialogState == MESSAGE_STATE ? ritualMessageMessages.submitMessage : ritualMessageMessages.submitThoughts
          )}
        </Button>
      </Column>
    </Modal>
  );
}

RitualMessageModal.propTypes = {
  onClose: PropTypes.func,
  scene: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired
};
