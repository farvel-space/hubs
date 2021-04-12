import { useEffect, useCallback, useState, useRef } from "react";
import vmsg from "vmsg";
import vmsgWasmFile from "../../vendor/vmsg.wasm";

/**
 * This web audio recorder uses:
 * @author Kagami / https://github.com/Kagami/vmsg : vmsg is a small library for creating voice messages.
 * LAME Project / https://lame.sourceforge.io/ : LAME is a high quality MPEG Audio Layer III (MP3) encoder licensed under the LGPL.
 */

export function useAudioRecorder() {
  const recorderRef = useRef();
  const [isRecording, setIsRecording] = useState(false);
  const [audioSrc, setAudioSrc] = useState("");
  const [audioFile, setAudioFile] = useState();

  useEffect(() => {
    recorderRef.current = new vmsg.Recorder({
      wasmURL: vmsgWasmFile
    });
  }, []);

  const record = useCallback(
    async () => {
      const recorder = recorderRef.current;
      if (!isRecording) {
        try {
          await recorder.initAudio();
          await recorder.initWorker();
          recorder.startRecording();
          setIsRecording(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        const blob = await recorder.stopRecording();
        setAudioSrc(URL.createObjectURL(blob));
        setAudioFile(new File([blob], "audioMessage.mp3", { type: "audio/mpeg" }));
        setIsRecording(false);
      }
    },
    [isRecording, setIsRecording, recorderRef]
  );
  return [record, isRecording, audioSrc, audioFile];
}
