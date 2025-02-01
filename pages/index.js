import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import VideoGrid from "../components/VideoGrid";
import Controls from "../components/Controls";

export default function Home() {
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const [peers, setPeers] = useState({});
  const peerConnections = useRef({});

  useEffect(() => {
    const init = async () => {
      const res = await fetch("/api/socket");
      if (!socketRef.current) {
        socketRef.current = io();
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        localVideoRef.current.srcObject = stream;
        socketRef.current.emit("join", "room1");

        socketRef.current.on("user-joined", async (id) => {
          const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));

          pc.ontrack = (event) => setPeers((prev) => ({ ...prev, [id]: event.streams[0] }));
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current.emit("offer", { target: id, sdp: offer });

          peerConnections.current[id] = pc;
        });

        socketRef.current.on("offer", async ({ sender, sdp }) => {
          const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));

          pc.ontrack = (event) => setPeers((prev) => ({ ...prev, [sender]: event.streams[0] }));
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.emit("answer", { target: sender, sdp: answer });

          peerConnections.current[sender] = pc;
        });

        socketRef.current.on("answer", ({ sender, sdp }) => {
          peerConnections.current[sender]?.setRemoteDescription(new RTCSessionDescription(sdp));
        });

        socketRef.current.on("ice-candidate", ({ sender, candidate }) => {
          peerConnections.current[sender]?.addIceCandidate(new RTCIceCandidate(candidate));
        });

        socketRef.current.on("user-left", (id) => {
          setPeers((prev) => {
            const newPeers = { ...prev };
            delete newPeers[id];
            return newPeers;
          });
        });
      }
    };

    init();
  }, []);

  return (
    <div>
      <video ref={localVideoRef} autoPlay playsInline muted className="video" />
      <VideoGrid peers={peers} />
      <Controls localStreamRef={localVideoRef} />
    </div>
  );
}
