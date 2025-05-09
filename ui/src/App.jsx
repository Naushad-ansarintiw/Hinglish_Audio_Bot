import { useState } from "react";

function App() {
  const [recording, setRecording] = useState(false);

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Hinglish Audio Bot</h1>
      <button
        onClick={() => setRecording((r) => !r)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
}

export default App;
