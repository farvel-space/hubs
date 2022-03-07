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
    defaultMessage: "I want to share my last words"
  },
  entryButtonThoughts: {
    id: "ritual-message-modal.entry.buttonThoughts",
    defaultMessage: "Words fail me"
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
      "You can now submit a message to the decendent. The message will be used as part of the ritual and will be shown in the room afterwards. Participation is optional, if you don't want to submit a message, you can go back and choose the - Words fail me - option."
  },
  checkboxShowName: {
    id: "ritual-message-modal.checkboxShowName",
    defaultMessage: "Sign with my name."
  },
  labelName: {
    id: "ritual-message-modal.labelName",
    defaultMessage: "Name"
  },
  labelMessage: {
    id: "ritual-message-modal.labelMessage",
    defaultMessage: "Message"
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
  const submittedName = watch("submittedName", store.state.profile.displayName);

  useEffect(
    () => {
      register("submittedName");
      return () => {};
    },
    [register]
  );

  const onSubmit = () => {
    console.log("submit");
    scene.emit("ritual_spark_start");
    onClose();
  };

  const onNameChange = useCallback(
    e => {
      console.log("onNameChange", e);
      setValue("submittedName", e.target.value);
    },
    [setValue]
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
        {/* <p>{intl.formatMessage(ritualMessageMessages.description)}</p> */}
        {/* Textarea for message */}
        {/* <textarea
          id="textarea-message"
          placeholder={intl.formatMessage(ritualMessageMessages.description)}
          className="textarea"
          onChange={console.log("changed")}
        /> */}
        <div className="messageGroup" hidden={dialogState != MESSAGE_STATE}>
          <TextAreaInputField
            name="textarea-message"
            autoComplete="off"
            placeholder={intl.formatMessage(ritualMessageMessages.description)}
            label={intl.formatMessage(ritualMessageMessages.labelMessage)}
            minRows={8}
            // ref={register}
            // error={errors.description}
            required
            fullWidth
          />
        </div>
        <TextInputField
          id="text-input-name"
          name="submittedName"
          disabled={!submitDisplayName}
          label={intl.formatMessage(ritualMessageMessages.labelName)}
          value={submitDisplayName ? submittedName : ""} // does not work this way, gets reset after every press
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
            onChange={e => setSubmitDisplayName(e.target.checked)}
          />
          <label>{intl.formatMessage(ritualMessageMessages.checkboxShowName)}</label>
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
