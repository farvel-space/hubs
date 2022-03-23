import React, { useEffect, useState, useCallback } from "react";
import PropTypes, { number } from "prop-types";
import styles from "./RitualControlSidebar.scss";
import { Sidebar } from "../sidebar/Sidebar";
import { CloseButton } from "../input/CloseButton";
import { useIntl, defineMessages } from "react-intl";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";

const ritualControlMessages = defineMessages({
  title: {
    id: "ritual-contol-sidebar.title",
    defaultMessage: "Ritual Control"
  },
  buttonInitiate: {
    id: "ritual-contol-sidebar.button.initiate",
    defaultMessage: "Initiate Ritual"
  },
  buttonCloseDialogs: {
    id: "ritual-contol-sidebar.button.closeDialogs",
    defaultMessage: "Close all dialogs"
  },
  buttonRelease: {
    id: "ritual-contol-sidebar.button.release",
    defaultMessage: "Release messages"
  },
  messagesSent: {
    id: "ritual-contol-sidebar.messagesSent",
    defaultMessage: "Messages sent"
  },
  releaseCompleted: {
    id: "ritual-contol-sidebar.releaseCompleted",
    defaultMessage: "Release completed"
  }
});

const ENTRY_STATE = 0;
const MESSAGE_STATE = 1;
const TREE_STATE = 2;
const RELEASE_STATE = 3;
const FINAL_STATE = 4;

export function RitualControlSidebar({ onClose, scene }) {
  const intl = useIntl();
  const [ritualState, setRitualState] = useState(ENTRY_STATE);
  const [numberMessagesSent, setNumberMessagesSent] = useState(0);
  const [numberPeople, setNumberPeople] = useState(0);
  const [numberReleaseCompleted, setNumberReleaseCompleted] = useState(0);
  // const { handleSubmit, register, watch, errors, setValue } = useForm({});

  const updateStats = useCallback(
    () => {
      setNumberPeople(window.APP.hubChannel.presence.list().length);
      switch (ritualState) {
        case MESSAGE_STATE:
        case TREE_STATE:
          setNumberMessagesSent(document.querySelectorAll("a-entity.ritual-spark-avatar").length);
          break;
        case RELEASE_STATE:
          setNumberReleaseCompleted(numberPeople - document.querySelectorAll("a-entity.ritual-spark-avatar").length);
          break;
      }
      if (numberReleaseCompleted == numberPeople && ritualState == RELEASE_STATE) {
        setRitualState(FINAL_STATE);
      }
    },
    [ritualState, numberPeople, numberReleaseCompleted]
  );

  useEffect(
    () => {
      updateStats();
      const interval = setInterval(() => {
        updateStats();
      }, 5000);
      return () => clearInterval(interval);
    },
    [updateStats]
  );

  const ritualButtonClicked = useCallback(
    emitStr => {
      scene.emit(emitStr);
      setRitualState(prevState => prevState + 1);
    },
    [scene]
  );

  // const ritualButtonClicked = (emitStr) => {
  //   scene.emit(emitStr);
  //   setRitualState(ritualState + 1);
  // };

  return (
    <Sidebar title={intl.formatMessage(ritualControlMessages.title)} beforeTitle={<CloseButton onClick={onClose} />}>
      <Column padding>
        <p>
          {intl.formatMessage(ritualControlMessages.messagesSent)}: {numberMessagesSent} / {numberPeople}
        </p>
        <p>
          {intl.formatMessage(ritualControlMessages.releaseCompleted)}: {numberReleaseCompleted} / {numberPeople}
        </p>
        <Button
          preset="primary"
          sm
          onClick={() => ritualButtonClicked("ritual_initiated")}
          disabled={ritualState != ENTRY_STATE}
        >
          {intl.formatMessage(ritualControlMessages.buttonInitiate)}
        </Button>
        <Button
          preset="primary"
          sm
          onClick={() => ritualButtonClicked("ritual_close_dialog_initiated")}
          disabled={ritualState != MESSAGE_STATE}
        >
          {intl.formatMessage(ritualControlMessages.buttonCloseDialogs)}
        </Button>
        <Button
          preset="primary"
          sm
          onClick={() => ritualButtonClicked("ritual_spark_release_initiated")}
          disabled={ritualState != TREE_STATE}
        >
          {intl.formatMessage(ritualControlMessages.buttonRelease)}
        </Button>
      </Column>
    </Sidebar>
  );
}

RitualControlSidebar.propTypes = {
  onClose: PropTypes.func,
  scene: PropTypes.object
};
