export default function Controls({ localStreamRef }) {
  const toggleVideo = () => {
    const enabled = localStreamRef.current.getVideoTracks()[0].enabled;
    localStreamRef.current.getVideoTracks()[0].enabled = !enabled;
  };

  const toggleAudio = () => {
    const enabled = localStreamRef.current.getAudioTracks()[0].enabled;
    localStreamRef.current.getAudioTracks()[0].enabled = !enabled;
  };

  return (
    <div className="controls">
      <button onClick={toggleVideo}>Toggle Video</button>
      <button onClick={toggleAudio}>Toggle Audio</button>
    </div>
  );
}
