import { useRef } from "react";

export default function useSTT(onTranscript) {
  const recognitionRef = useRef(null);
  const isListening = useRef(false);

  const startRecording = () => {
    if (isListening.current) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN"; // supports Indian English

    recognition.onstart = () => {
      console.log("🎤 Listening...");
      isListening.current = true;
    };

    recognition.onresult = (event) => {
      const text =
        event.results[event.results.length - 1][0].transcript;

      console.log("🧠 Recognized:", text);

      if (text && text.trim().length > 3) {
        onTranscript(text.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error("❌ Speech error:", event.error);
    };

    recognition.onend = () => {
      console.log("🛑 Stopped listening");
      isListening.current = false;
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    isListening.current = false;
  };

  return { startRecording, stopRecording };
}