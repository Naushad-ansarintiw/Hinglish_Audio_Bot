import { useState } from "react";

function App() {
  const [recording, setRecording] = useState(false);
  const [conversation, setConversation] = useState([]);

  const startRecognition = () => {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) return alert("Speech API not supported");

    const r = new Speech();
    r.continuous = false;
    r.interimResults = false;
    r.maxAlternatives = 1;

    r.onstart = () => console.log("Recognition started");
    r.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("User:", transcript);
      setConversation((c) => [...c, { sender: "user", text: transcript }]);

      // Call your backend
      try {
        const resp = await fetch("http://localhost:4000/api/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: transcript }),
        });
        console.log("Response: ", resp);
        const { reply } = await resp.json();
        console.log("Bot:", reply);
        setConversation((c) => [...c, { sender: "bot", text: reply }]);
      } catch (err) {
        console.error("Response error", err);
      }
    };

    r.onend = () => setRecording(false);
    r.start();
    setRecording(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Hinglish Audio Bot</h1>
      <button
        onClick={() => (recording ? null : startRecognition())}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {recording ? "Listening…" : "Start Recording"}
      </button>

      <div className="mt-6 space-y-3">
        {conversation.map((msg, i) => (
          <div
            key={i}
            className={msg.sender === "bot" ? "text-green-600" : "text-black"}
          >
            <strong>{msg.sender === "bot" ? "Bot" : "You"}:</strong> {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
