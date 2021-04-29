import React, { useEffect } from "react";
import { useIntl, defineMessages, FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { CloseButton } from "../input/CloseButton";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";
import { useAudioRecorder } from "./useAudioRecorder";
import { AudioRecorderPlayer } from "./AudioRecorderPlayer";
import { useForm } from "react-hook-form";

const audioRecordingMessages = defineMessages({
  submit: {
    id: "audio-recording-modal.recording.submit",
    defaultMessage: "Submit Recording"
  },
  description: {
    id: "audio-recording-modal.recording.description",
    defaultMessage:
      "Record und upload a voice message for others to hear. The environment is muted and others are not be able to hear you, while you have this dialog opened. After recording you will be able to hear your message before submitting and therefore uploading it. You can re-record your message, as often as you want."
  },
  startrecording: {
    id: "audio-recording-modal.recording.start",
    defaultMessage: "Record"
  },
  stoprecording: {
    id: "audio-recording-modal.recording.stop",
    defaultMessage: "Stop"
  }
});

export function AudioRecorderModal({ scene, store, onClose }) {
  const intl = useIntl();
  const [record, isRecording, audioSrc, audioFile] = useAudioRecorder();
  const { handleSubmit } = useForm();

  const audioSettings = (mute, gMediaV, gVoiceV) => {
    if (mute != scene.is("muted")) scene.emit("action_mute");
    store.update({
      preferences: {
        globalMediaVolume: gMediaV,
        globalVoiceVolume: gVoiceV
      }
    });
  };

  const onSubmit = () => {
    scene.emit("add_media", audioFile.size > 0 && audioFile);
    onClose();
  };

  useEffect(() => {
    const tmpMuted = scene.is("muted");
    const tmpMediaVolume = store.state.preferences.globalMediaVolume;
    const tmpVoiceVolume = store.state.preferences.globalVoiceVolume;
    audioSettings(true, 0.0, 0.0);

    return () => {
      audioSettings(tmpMuted, tmpMediaVolume, tmpVoiceVolume);
    };
  }, []);

  return (
    <Modal
      title={<FormattedMessage id="audio-recording-modal.title" defaultMessage="Submit Voice Message" />}
      beforeTitle={<CloseButton onClick={onClose} />}
    >
      <Column as="form" padding center onSubmit={handleSubmit(onSubmit)}>
        <p>{intl.formatMessage(audioRecordingMessages.description)}</p>
        <AudioRecorderPlayer isRecording={isRecording} audioSrc={audioSrc} />
        <Button preset={isRecording ? "cancel" : "basic"} onClick={record} rel="noopener noreferrer">
          {intl.formatMessage(
            isRecording ? audioRecordingMessages.stoprecording : audioRecordingMessages.startrecording
          )}
        </Button>
        <Button type="submit" preset="accept">
          {intl.formatMessage(audioRecordingMessages.submit)}
        </Button>
      </Column>
    </Modal>
  );
}

AudioRecorderModal.propTypes = {
  onClose: PropTypes.func,
  scene: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired
};
