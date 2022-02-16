import React, { useState } from "react";
import { useIntl, defineMessages } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { CloseButton } from "../input/CloseButton";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";
import { useForm } from "react-hook-form";
import { TextAreaInputField } from "../input/TextAreaInputField";

const ritualMessageMessages = defineMessages({
  title: {
    id: "ritual-message-modal.title",
    defaultMessage: "Submit a message to the descendent"
  },
  submit: {
    id: "ritual-message-modal.submit",
    defaultMessage: "Submit Message"
  },
  description: {
    id: "ritual-message-modal.description",
    defaultMessage: "In this dialog you can submit a message to the decendent. The message will be used as part of the ritual and will be shown in the room afterwards. This is optional, if you don't want to submit a message, you can leave this dialog empty."
  }
});

export function RitualMessageModal({ scene, store, onClose }) {
  const intl = useIntl();
  const { handleSubmit } = useForm();
  const [hasEnteredMessage, setHasEnteredMessage] = useState(false);

//   const audioSettings = (mute, gMediaV, gVoiceV) => {
//     if (mute != scene.is("muted")) scene.emit("action_mute");
//     store.update({
//       preferences: {
//         globalMediaVolume: gMediaV,
//         globalVoiceVolume: gVoiceV
//       }
//     });
//   };

  const onSubmit = () => {
    console.log("submit");
    // scene.emit("add_media", audioFile.size > 0 && audioFile);
    onClose();
  };

//   useEffect(() => {
//     const tmpMuted = scene.is("muted");
//     const tmpMediaVolume = store.state.preferences.globalMediaVolume;
//     const tmpVoiceVolume = store.state.preferences.globalVoiceVolume;

//     // save current volume settings in store, to restore if people reload while recording dialog is opened
//     store.update({
//       preferences: {
//         tmpMutedGlobalMediaVolume: tmpMediaVolume === undefined ? 100 : tmpMediaVolume,
//         tmpMutedGlobalVoiceVolume: tmpVoiceVolume === undefined ? 100 : tmpMediaVolume
//       }
//     });

//     // mute the environment
//     audioSettings(true, 0.0, 0.0);

//     return () => {
//       audioSettings(tmpMuted, tmpMediaVolume, tmpVoiceVolume);
//     };
//   }, []);

  return (
    <Modal title={intl.formatMessage(ritualMessageMessages.title)} beforeTitle={<CloseButton onClick={onClose} />}>
      <Column as="form" padding center onSubmit={handleSubmit(onSubmit)}>
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
          fullWidth
        />
        <Button type="submit" preset="accept" disabled={hasEnteredMessage}>
          {intl.formatMessage(ritualMessageMessages.submit)}
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
