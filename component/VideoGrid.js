export default function VideoGrid({ peers }) {
  return (
    <div className="video-grid">
      {Object.values(peers).map((stream, index) => (
        <video key={index} autoPlay playsInline srcObject={stream} className="video" />
      ))}
    </div>
  );
}
