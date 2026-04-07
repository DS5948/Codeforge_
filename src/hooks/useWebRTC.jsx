import { useEffect, useState } from "react";
import { useSocket } from "@/components/SocketContext";

const useWebRTC = (roomId) => {

  const socket = useSocket();
  const [remoteStreams, setRemoteStreams] = useState({});
  const [peerConnections, setPeerConnections] = useState({});

  // Create new peer connection
  const createPeerConnection = (username) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // Handle ICE Connection State
      pc.onconnectionstatechange = () => {
        console.log("ICE Connection State: ", pc.iceConnectionState);
      };

      // Handle remote streams
      pc.ontrack = (event) => {
        if (event.streams[0]) {
          setRemoteStreams((prev) => {
            const existingStream = prev[username];
            if (existingStream === event.streams[0]) {
              return prev;
            }

            const updatedStreams = { ...prev, [username]: event.streams[0] };
            console.log("Updated remote streams: ", updatedStreams);
            return updatedStreams;
          });
        } else {
          console.error("No streams found in the remote track event.");
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            roomId,
            candidate: event.candidate,
            toUsername: username,
          });
        }
      };

      // Store the peer connection
      setPeerConnections((prev) => ({ ...prev, [username]: pc }));

      return pc;
    } catch (error) {
      console.error(`Error creating PeerConnection for ${username}:` , error);
      return null;
    }
  };

  // Add local tracks and create SDP offer
  const setUpLocalTracksAndOffer = async (username) => {
    try {
      const pc = createPeerConnection(username);
      if (!pc) throw new Error("Failed to create PeerConnection");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Local stream obtained: ", stream);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      console.log(`Tracks added to PeerConnection for ${username}`);

      const offer = await pc.createOffer();
      console.log(`SDP offer created for user ${username}`, offer.sdp);

      await pc.setLocalDescription(offer);
      console.log(`Local description set for user ${username}`);

      socket.emit("offer", {
        roomId,
        sdp: pc.localDescription,
        toUsername: username,
      });
    } catch (error) {
      console.error("Error setting up local tracks and offer: ", error);
    }
  };

  // Close peer connection
  const closePeerConnection = (username) => {
    const pc = peerConnections[username];
    if (pc) {
      pc.close();
      setPeerConnections((prev) => {
        const updated = { ...prev };
        delete updated[username];
        return updated;
      });
      console.log(`Closed connection for ${username}`);
    }
  };

  // Handle offer, answer and iceCandidate events
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleOffer = async ({ sdp, fromUsername }) => {
      try {
        let pc = peerConnections[fromUsername];
        if (!pc) {
          pc = createPeerConnection(fromUsername);
        }

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log(`Remote description set for offer from ${fromUsername}`);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        console.log("Local audio tracks added");

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("SDP answer created and set locally");

        socket.emit("answer", {
          roomId,
          sdp: pc.localDescription,
          toUsername: fromUsername,
        });
      } catch (error) {
        console.error("Error handling offer: ", error);
      }
    };

    const handleIceCandidate = async ({ candidate, fromUsername }) => {
      try {
        const pc = peerConnections[fromUsername];
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error("Error handling ICE candidate: ", error);
      }
    };

    const handleAnswer = async ({ sdp, fromUsername }) => {
      try {
        const pc = peerConnections[fromUsername];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          console.log(`Remote description set for answer from ${fromUsername}`);
        }
      } catch (error) {
        console.error("Error handling answer: ", error);
      }
    };

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("iceCandidate", handleIceCandidate);

    return () => {
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("iceCandidate", handleIceCandidate);
    };
  }, [roomId, socket, peerConnections]);

  return {
    peerConnections,
    remoteStreams,
    setPeerConnections,
    createPeerConnection,
    setUpLocalTracksAndOffer,
  };
};

export default useWebRTC;
