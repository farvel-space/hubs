import { useEffect, useCallback, useRef, useState } from "react";

export function useAudioRecorder() {
  let mediaRecorder;
  let recording = false;
  const [audioSrc, setAudioSrc] = useState('#');

  useEffect(() => {
    if (navigator.mediaDevices.getUserMedia) {
      console.log('getUserMedia supported.');
      const constraints = { audio: true };
      let chunks = [];

      let onSuccess = function(stream) {
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.onstop = function(e) {
          console.log("data available after MediaRecorder.stop() called.");
          
          const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
          chunks = [];
          const audioURL = window.URL.createObjectURL(blob);
          setAudioSrc(audioURL);
          console.log("recorder stopped");
          console.log("audioURL: ", audioURL);

          // return () => {
          //   audio.pause();
          //   audio.currentTime = 0;
          //   clearTimeout(soundTimeoutRef.current);
          // };
        };
    
        mediaRecorder.ondataavailable = function(e) {
          chunks.push(e.data);
        };
      };

      let onError = function(err) {
        console.log('The following error occured: ' + err);
      };
    
      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    } else {
      console.log('getUserMedia not supported on your browser!');
    }
    
  }, []);

  const record = useCallback(
    () => {
      if (!recording) {
        mediaRecorder.start();
        console.log(mediaRecorder.state);
        console.log("recorder started");
        recording = true;
      } else {
        mediaRecorder.stop();
        console.log(mediaRecorder.state);
        console.log("recorder stopped");
        recording = false;
      }
      
    },
    []
  );
  return [record, audioSrc];
}