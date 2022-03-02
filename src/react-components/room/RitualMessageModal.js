import React, { useEffect, useState, useRef } from "react";
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
import { store } from "../../storage/store";

const ritualMessageMessages = defineMessages({
  titleEntry: {
    id: "ritual-message-modal.titleEntry",
    defaultMessage: "Take part in the ritual"
  },
  titleMessage: {
    id: "ritual-message-modal.titleMessage",
    defaultMessage: "Submit a message to the descendent"
  },
  titleThoughts: {
    id: "ritual-message-modal.titleThoughts",
    defaultMessage: "Send your thoughts of the descendent"
  },
  entryButtonMessage: {
    id: "ritual-message-modal.entryButtonMessage",
    defaultMessage: "I want to send last words"
  },
  entryButtonThoughts: {
    id: "ritual-message-modal.entryButtonThoughts",
    defaultMessage: "Words fail me"
  },
  submit: {
    id: "ritual-message-modal.submit",
    defaultMessage: "Submit Message"
  },
  description: {
    id: "ritual-message-modal.description",
    defaultMessage: "In this dialog you can submit a message to the decendent. The message will be used as part of the ritual and will be shown in the room afterwards. Participation is optional, if you don't want to submit a message, you can go back and choose the - Words fail me - option."
  },
  checkboxShowName: {
    id: "ritual-message-modal.checkboxShowName",
    defaultMessage: "Sign the message with my name."
  }
});

const ENTRY_STATE = 0;
const MESSAGE_STATE = 1;
const THOUGHTS_STATE = -1;

function stopPropagation(e) {
  console.log("stopPropagation");
  e.stopPropagation();
}

export function RitualMessageModal({ scene, store, onClose }) {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState(ENTRY_STATE);
  const { handleSubmit } = useForm();
  const [hasEnteredMessage, setHasEnteredMessage] = useState(false);
  const [submitDisplayName, setSubmitDisplayName] = useState(true);
  const [submittedName, setSubmittedName] = useState(store.state.profile.displayName);
  const displayNameInputRef = useRef(null);



  // useEffect(() => {
  //   console.log("useEffect");
  //   if (displayNameInputRef.current) {
  //     console.log("useEffect: add event listener");
  //     // stop propagation so that avatar doesn't move when wasd'ing during text input.
  //     displayNameInputRef.current.addEventListener("keydown", stopPropagation);
  //     displayNameInputRef.current.addEventListener("keypress", stopPropagation);
  //     displayNameInputRef.current.addEventListener("keyup", stopPropagation);
  //   }
  //   return () => {
  //     console.log("useEffect: remove event listener");
  //     if (displayNameInputRef.current) {
  //       displayNameInputRef.current.removeEventListener("keydown", stopPropagation);
  //       displayNameInputRef.current.removeEventListener("keypress", stopPropagation);
  //       displayNameInputRef.current.removeEventListener("keyup", stopPropagation);
  //     }
  //   };
  // }, []);

  const onBack = () => {
    setDialogState(ENTRY_STATE);
  };

  const onSubmit = () => {
    console.log("submit");
    scene.emit("ritual_spark_start");
    onClose();
  };

  const changeToMessageState = () => {
    setDialogState(MESSAGE_STATE);
  };

  const changeToThoughtState = () => {
    setDialogState(THOUGHTS_STATE);
  };

  const changeToEntryState = () => {
    setDialogState(ENTRY_STATE);
  };

  const EntryDialog = () => {
    return (
      <Column as="form" padding center className={styles.entry}>
        <Button type="button" preset="accent1" onClick={handleSubmit(changeToMessageState)}>
          {intl.formatMessage(ritualMessageMessages.entryButtonMessage)}
        </Button>
        <Button type="button" preset="accent2" onClick={handleSubmit(changeToThoughtState)}>
          {intl.formatMessage(ritualMessageMessages.entryButtonThoughts)}
        </Button>
      </Column>
    );
  };

  const SubmitNameCheckbox = () => {
    return (
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
    );
  };

  const NameTextfield = () => {
    return (
      <TextInputField
        disabled={!submitDisplayName}
        // label={<FormattedMessage id="avatar-settings-content.display-name-label" defaultMessage="Display Name" />}
        value={submittedName} // does not work this way, gets reset after every press
        pattern={SCHEMA.definitions.profile.properties.displayName.pattern}
        spellCheck="false"
        required
        onChange={e => setSubmittedName(e.target.value)} // needed when using form?
        // description={
        //   <FormattedMessage
        //     id="avatar-settings-content.display-name-description"
        //     defaultMessage="Alphanumerics, hyphens, underscores, and tildes. At least 3 characters, no more than 32"
        //   />
        // }
        ref={displayNameInputRef}
      />
    );
  };

  const MessageDialog = () => {
    return (
      <Column as="form" className={styles.message} padding center onSubmit={handleSubmit(onSubmit)}>
        {/* <p>{intl.formatMessage(ritualMessageMessages.description)}</p> */}
        {/* Textarea for message */}
        {/* <textarea
          id="textarea-message"
          placeholder={intl.formatMessage(ritualMessageMessages.description)}
          className="textarea"
          onChange={console.log("changed")}
        /> */}
        <TextAreaInputField
          name="textarea-message"
          autoComplete="off"
          placeholder={intl.formatMessage(ritualMessageMessages.description)}
          // label={<FormattedMessage id="room-settings-sidebar.description" defaultMessage="Room Description" />}
          minRows={5}
          // ref={register}
          // error={errors.description}
          required
          fullWidth
        />
        {/* store.state.profile.displayName */}
        <NameTextfield />
        <SubmitNameCheckbox />
        {/* <Button type="submit" preset="accept" disabled={!hasEnteredMessage}> */}
        <Button type="submit" preset="accept">
          {intl.formatMessage(ritualMessageMessages.submit)}
        </Button>
      </Column>
    );
  };

  const ThoughtsDialog = () => {
    return (
      <Column as="form" className={styles.message} padding center onSubmit={handleSubmit(onSubmit)}>
        <NameTextfield />
        <SubmitNameCheckbox />
        <Button type="submit" preset="accept">
          {intl.formatMessage(ritualMessageMessages.submit)}
        </Button>
      </Column>
    );
  };

  return (
    // <Modal title={intl.formatMessage(ritualMessageMessages.title)} beforeTitle={<CloseButton onClick={onClose} />}>
    <Modal
      title={
        dialogState == ENTRY_STATE
          ? intl.formatMessage(ritualMessageMessages.titleEntry)
          : dialogState == MESSAGE_STATE
            ? intl.formatMessage(ritualMessageMessages.titleMessage)
            : intl.formatMessage(ritualMessageMessages.titleThoughts)
      }
      beforeTitle={dialogState == ENTRY_STATE ? null : <BackButton onClick={onBack} />}
    >
      {/* { dialogState == ENTRY_STATE ? 
        <EntryDialog />
        : (dialogState == MESSAGE_STATE ?
          <MessageDialog />
        :
          <ThoughtsDialog />
        } */}
      {dialogState == ENTRY_STATE && <EntryDialog />}
      {dialogState == MESSAGE_STATE && <MessageDialog />}
      {dialogState == THOUGHTS_STATE && <ThoughtsDialog />}
    </Modal>
  );
}

RitualMessageModal.propTypes = {
  onClose: PropTypes.func,
  scene: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired
};
