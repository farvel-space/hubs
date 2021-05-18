import React, { useEffect, useRef, useCallback } from "react";
import { useIntl, defineMessages, FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { CloseButton } from "../input/CloseButton";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";
import { useAudioRecorder } from "./useAudioRecorder";
import { AudioRecorderPlayer } from "./AudioRecorderPlayer";
import { useForm } from "react-hook-form";
import configs from "../../utils/configs";

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
  const [startRecording, stopRecording, isRecording, audioSrc, audioFile, timerDisplay] = useAudioRecorder();
  const { handleSubmit } = useForm();
  const isRecordingRef = useRef(isRecording);
  isRecordingRef.current = isRecording;

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

    // save used avatar and set it to "unavailable avatar"
    const tmpUsedAvatar = store.state.profile.avatarId;
    store.update({ profile: { avatarId: "JrFMCQ5" } });
    scene.emit("avatar_updated");

    return () => {
      audioSettings(tmpMuted, tmpMediaVolume, tmpVoiceVolume);
      store.update({ profile: { avatarId: tmpUsedAvatar } });
      scene.emit("avatar_updated");
    };
  }, []);

  const termsUrl = configs.link("terms_of_use", "https://github.com/mozilla/hubs/blob/master/TERMS.md");
  const privacyUrl = configs.link("privacy_notice", "https://github.com/mozilla/hubs/blob/master/PRIVACY.md");

  const toslink = useCallback(
    chunks => (
      <a rel="noopener noreferrer" target="_blank" href={termsUrl}>
        {chunks}
      </a>
    ),
    [termsUrl]
  );

  const privacylink = useCallback(
    chunks => (
      <a rel="noopener noreferrer" target="_blank" href={privacyUrl}>
        {chunks}
      </a>
    ),
    [privacyUrl]
  );

  return (
    <Modal
      title={<FormattedMessage id="audio-recording-modal.title" defaultMessage="Submit Voice Message" />}
      beforeTitle={<CloseButton onClick={onClose} />}
    >
      <Column as="form" padding center onSubmit={handleSubmit(onSubmit)}>
        <p>{intl.formatMessage(audioRecordingMessages.description)}</p>
        <AudioRecorderPlayer isRecording={isRecording} audioSrc={audioSrc} timerDisplay={timerDisplay} />
        <Button
          preset={isRecording ? "cancel" : "primary"}
          onClick={isRecording ? stopRecording : startRecording}
          rel="noopener noreferrer"
        >
          {intl.formatMessage(
            isRecording ? audioRecordingMessages.stoprecording : audioRecordingMessages.startrecording
          )}
        </Button>
        <p>
          <small>
            <FormattedMessage
              id="audio-recording-modal.tos-and-privacy"
              defaultMessage="By submitting, you agree to the <toslink>terms of use</toslink> and <privacylink>privacy notice</privacylink>. All voice messages will be deleted no later than June 30, 2021."
              values={{
                toslink,
                privacylink
              }}
            />
          </small>
        </p>
        <Button type="submit" preset="accept" disabled={!audioFile || isRecording}>
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
