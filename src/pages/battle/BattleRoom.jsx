import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import PulseLoader from "react-spinners/PulseLoader";
import BattleEndModal from "@/components/Battle/BattleEndModal";
import { MdLeaderboard } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { IoIosLogOut } from "react-icons/io";
import { IoPlayOutline } from "react-icons/io5";
import CodeMirror from "@uiw/react-codemirror";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import LeaderboardModal from "@/components/Battle/LeaderboardModal";
import io from "socket.io-client";
import confetti from "canvas-confetti"; // or import { triggerConfetti } from "@/utils/confetti";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Decoration, ViewPlugin, WidgetType } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Trophy,
  Users,
  Mic,
  MicOff,
  Clock,
  Check,
  Loader2,
  Crown,
  Medal,
  Award,
  GripVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

// Mapping for CodeMirror language extensions
const languageExtensions = {
  cpp: cpp(),
  javascript: javascript(),
  python: python(),
  java: java(),
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const BattleRoom = () => {
  const socketRef = useRef(null);
  useEffect(() => {
    socketRef.current = io(API_URL, { withCredentials: true });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const config = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  };
  const navigate = useNavigate();
  const [showBattleEndModal, setShowBattleEndModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const queryClient = useQueryClient();
  const { roomId } = useParams();
  const [code, setCode] = useState("// Start coding...");
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [outputStatus, setOutputStatus] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [cursors, setCursors] = useState({});
  const [participants, setParticipants] = useState([]);
  const editorRef = useRef(null);
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "hard":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const { data: leaderboardData, refetch: refetchLeaderboard } = useQuery({
    queryKey: ["leaderboard", roomId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/battle/leaderboard/${roomId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
    enabled: !!roomId,
  });

  const {
    data: userTeam,
    isLoading: teamLoading,
    error: teamError,
  } = useQuery({
    queryKey: ["userTeam", roomId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/battle/my-team/${roomId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch team");
      }
      return res.json();
    },
    enabled: !!roomId,
  });
  const combinedRoomId = `${roomId}:${userTeam?.id}`;

  const username = authUser?.username;

  const {
    data: battleData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["battle", roomId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/battle/${roomId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch battle");
      const data = await res.json();
      console.log("Battle data: ", data);
      
      return data;
    },
    enabled: !!roomId,
  });
  useEffect(() => {
    if (!battleData?.startTime || !battleData?.duration) return;
    console.log("Battle data: ", battleData);
    
    const start = new Date(battleData.startTime).getTime();
    const end = start + battleData.duration * 60 * 1000;

    const updateTimeLeft = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        setShowBattleEndModal(true);
      }
    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [battleData]);

  const problems = battleData?.problems || [];
  const currentProblem = problems[currentIndex];
  useEffect(() => {
    if (!currentProblem || !currentProblem.languageTemplates?.[language])
      return;

    const template = currentProblem.languageTemplates[language];
    const starter = template.functionSignature + " {\n  // your code here\n}";
    const fullCode = template.boilerplate.replace("{userCode}", starter);
    setCode(fullCode);
  }, [currentIndex, language, battleData]);

  class CursorWidget extends WidgetType {
    constructor(name) {
      super();
      this.name = name;
    }

    toDOM() {
      const span = document.createElement("span");
      span.className = "cursor-widget";
      span.style.borderLeft = "2px solid orange";
      span.style.marginLeft = "-1px";
      span.style.padding = "0 2px";
      span.style.color = "orange";
      span.style.fontSize = "10px";
      span.style.pointerEvents = "none";
      span.textContent = this.name;
      return span;
    }

    ignoreEvent() {
      return true;
    }
  }

  const cursorPlugin = ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.decorations = this.getDecorations(view);
      }

      update(update) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.getDecorations(update.view);
        }
      }

      getDecorations(view) {
        const builder = new RangeSetBuilder();

        Object.entries(cursors).forEach(([user, pos]) => {
          if (user === username) return;

          const deco = Decoration.widget({
            widget: new CursorWidget(user),
            side: -1,
          });

          builder.add(pos, pos, deco);
        });

        return builder.finish();
      }

      destroy() {}
    },
    {
      decorations: (v) => v.decorations,
    }
  );
  // Socket: Join & Leave Room
  useEffect(() => {
    if (!username || !roomId || !userTeam?.id || !socketRef.current) return;
    const socket = socketRef.current;
    socket.emit("joinRoom", { roomId: combinedRoomId, username });

    socket.on("userJoined", ({ username }) => {
      setParticipants((prev) => [...new Set([...prev, username])]);
    });

    socket.on("userLeft", ({ username }) => {
      setParticipants((prev) => prev.filter((u) => u !== username));
    });
    socket.on("cursorMove", ({ username: otherUsername, pos }) => {
      setCursors((prev) => ({
        ...prev,
        [otherUsername]: pos,
      }));
    });
    // Collaborative code update
    socket.on("typing", ({ fileId, content }) => {
      setCode(content); // simple overwrite logic
    });

    return () => {
      socket.emit("leaveRoom", { roomId: combinedRoomId, username });
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("typing");
      socket.off("cursorMove");
    };
  }, [roomId, username, userTeam, combinedRoomId]);
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !username || !roomId) return;

    const peerConnections = {};
    const pendingCandidates = {};

    // 🔵 When someone joins the voice room
    socket.on("userJoinedVoice", async ({ username: remoteUsername }) => {
      if (remoteUsername === username) return;

      console.log("🔗 userJoinedVoice:", remoteUsername);

      const pc = new RTCPeerConnection(config);
      peerConnections[remoteUsername] = pc;
      peersRef.current[remoteUsername] = pc;

      // 🔍 Log local audio track info
      const audioTracks = localStreamRef.current?.getAudioTracks();
      if (audioTracks?.length) {
        const track = audioTracks[0];
        console.log("🎙️ Local audio track:", {
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
        });
      } else {
        console.warn("❌ No local audio tracks found");
      }

      // ➕ Add local stream tracks
      localStreamRef.current?.getTracks().forEach((track) => {
        console.log("➕ Adding track to peer connection:", track.kind);
        pc.addTrack(track, localStreamRef.current);
      });

      // 📤 ICE candidate sender
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          console.log("📨 Sending ICE candidate to", remoteUsername);
          socket.emit("ice-candidate", {
            target: remoteUsername,
            from: username,
            roomId: combinedRoomId,
            candidate: e.candidate,
          });
        }
      };

      // 📡 Remote track received
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        console.log("📡 Received remote stream from", remoteUsername);

        const audioTracks = remoteStream.getAudioTracks();
        console.log("🎧 Received audio tracks:", audioTracks);

        let audio = document.getElementById(`audio-${remoteUsername}`);
        if (!audio) {
          console.log(`🔧 Creating new audio element for ${remoteUsername}`);
          audio = document.createElement("audio");
          audio.id = `audio-${remoteUsername}`;
          audio.autoplay = true;
          audio.controls = true;
          document.body.appendChild(audio);
        } else {
          console.log(
            `♻️ Reusing existing audio element for ${remoteUsername}`
          );
        }

        audio.srcObject = remoteStream;

        if (document.body.contains(audio)) {
          console.log("✅ Audio element is in DOM");
        } else {
          console.warn("❌ Audio element NOT found in DOM");
        }

        console.log("🎙️ audio.srcObject set to:", audio.srcObject);
        console.log("🧪 audio.paused:", audio.paused);

        audio
          .play()
          .then(() => console.log("🔊 Playback started"))
          .catch((err) => console.error("🔇 Audio play error:", err));
      };

      // 🔄 Log connection state
      pc.onconnectionstatechange = () => {
        console.log(
          `🔄 Connection state with ${remoteUsername}:`,
          pc.connectionState
        );
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("📤 Sending offer to", remoteUsername);
      socket.emit("offer", {
        roomId: combinedRoomId,
        target: remoteUsername,
        caller: username,
        sdp: pc.localDescription,
      });
    });

    // 🟡 Receive offer
    socket.on("offer", async ({ caller, sdp }) => {
      console.log("📥 Received offer from", caller);

      const pc = new RTCPeerConnection(config);
      peerConnections[caller] = pc;
      peersRef.current[caller] = pc;

      // Handle incoming remote stream
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        console.log("📡 Received remote stream from", caller);

        const audioTracks = remoteStream.getAudioTracks();
        console.log("🎧 Received audio tracks:", audioTracks);

        let audio = document.getElementById(`audio-${caller}`);
        if (!audio) {
          console.log(`🔧 Creating new audio element for ${caller}`);
          audio = document.createElement("audio");
          audio.id = `audio-${caller}`;
          audio.autoplay = true;
          audio.controls = true;
          document.body.appendChild(audio);
        } else {
          console.log(`♻️ Reusing existing audio element for ${caller}`);
        }

        audio.srcObject = remoteStream;

        if (document.body.contains(audio)) {
          console.log("✅ Audio element is in DOM");
        } else {
          console.warn("❌ Audio element NOT found in DOM");
        }

        console.log("🎙️ audio.srcObject set to:", audio.srcObject);
        console.log("🧪 audio.paused:", audio.paused);

        audio
          .play()
          .then(() => console.log("🔊 Playback started"))
          .catch((err) => console.error("🔇 Audio play error:", err));
      };

      // Add local tracks
      localStreamRef.current?.getTracks().forEach((track) => {
        console.log("➕ Adding local track:", track.kind);
        pc.addTrack(track, localStreamRef.current);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));

      if (pendingCandidates[caller]) {
        console.log("🧊 Applying queued ICE candidates for", caller);
        pendingCandidates[caller].forEach((candidate) => {
          pc.addIceCandidate(new RTCIceCandidate(candidate));
        });
        delete pendingCandidates[caller];
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log("📤 Sending answer to", caller);
      socket.emit("answer", {
        target: caller,
        caller: username,
        roomId: combinedRoomId,
        sdp: pc.localDescription,
      });

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          console.log("📨 Sending ICE candidate to", caller);
          socket.emit("ice-candidate", {
            target: caller,
            from: username,
            roomId: combinedRoomId,
            candidate: e.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(`🔄 Connection state with ${caller}:`, pc.connectionState);
      };
    });

    // 🟢 Answer received
    socket.on("answer", async ({ caller, sdp }) => {
      console.log("📥 Received answer from", caller);
      const pc = peersRef.current[caller];
      if (!pc) {
        console.warn("⚠️ No peer connection found for", caller);
        return;
      }
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    // ❄️ ICE candidate received
    socket.on("ice-candidate", ({ from, candidate }) => {
      const pc = peersRef.current[from];
      if (pc?.remoteDescription) {
        console.log("❄️ Adding ICE candidate from", from);
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        console.log("🕗 Queueing ICE candidate from", from);
        if (!pendingCandidates[from]) {
          pendingCandidates[from] = [];
        }
        pendingCandidates[from].push(candidate);
      }
    });

    // 👋 Peer left
    socket.on("userLeftVoice", ({ username: remoteUser }) => {
      console.log("👋 User left:", remoteUser);
      const pc = peersRef.current[remoteUser];
      if (pc) {
        pc.close();
        delete peersRef.current[remoteUser];
      }

      const audio = document.getElementById(`audio-${remoteUser}`);
      if (audio) {
        console.log("🗑️ Removing audio element for", remoteUser);
        audio.remove();
      }
    });

    // 🧼 Cleanup
    return () => {
      socket.off("userJoinedVoice");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("userLeftVoice");
    };
  }, [roomId, username, combinedRoomId]);

  const { mutate: submitCode, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      console.log("Submitting code:", code);

      const res = await fetch(`${API_URL}/battle/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code,
          language,
          battleId: roomId,
          problemId: currentProblem.id,
        }),
      });

      const data = await res.json();
      console.log("Submission response:", data);
      if (!res.ok) throw new Error(data.error || "Submission failed");
      return data || "No output received.";
    },
    onSuccess: (data) => {
      setOutput(data.output);
      setOutputStatus(data.success);
      if (data.success) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        refetchLeaderboard();
        queryClient.invalidateQueries(["userTeam", roomId]);
        setShowLeaderboard(true);
      }
    },
    onError: (err) => {
      console.error("❌ Submission failed:", err.message);
      setOutput("Error: " + err.message);
    },
  });

  const toggleVoiceChat = async () => {
    setIsVoiceEnabled((prev) => !prev);

    if (!isVoiceEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        localStreamRef.current = stream;

        // Join the voice room
        socketRef.current.emit("joinVoiceRoom", {
          roomId: combinedRoomId,
          username,
        });

        // Optional: play your own audio (muted)
        const audio = new Audio();
        audio.srcObject = stream;
        audio.autoplay = true;
        audio.muted = true;
        audio.play();
      } catch (err) {
        console.error("Mic permission denied:", err);
      }
    } else {
      socketRef.current.emit("leaveVoiceRoom", {
        roomId: combinedRoomId,
        username,
      });

      // Cleanup
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
    }
  };

  const handleEditorChange = (value, viewUpdate) => {
    setCode(value);
    const socket = socketRef.current;
    if (!socket) return;
    // Emit typing event
    socket.emit("typing", {
      roomId: combinedRoomId,
      fileId: "main",
      content: value,
    });

    // Emit cursor movement
    const pos = viewUpdate.state.selection.main.head;
    socket.emit("cursorMove", {
      roomId: combinedRoomId,
      username,
      pos,
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Main Layout */}
      <div className="flex h-screen overflow-y-auto">
        {/* Left Panel - Problem Details */}
        <ResizablePanelGroup direction="horizontal" className="h-screen">
          {/* Left Panel */}
          <ResizablePanel
            defaultSize={25}
            minSize={20}
            maxSize={40}
            className="bg-gray-900 border-r border-gray-800"
          >
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Problem Header */}
                <div className="space-y-3">
                  <h1 className="text-2xl font-bold text-white">
                    {currentProblem?.title}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge
                      className={`${getDifficultyColor(currentProblem?.difficulty)} border`}
                    >
                      {currentProblem?.difficulty?.toUpperCase()}
                    </Badge>
                    <div className="flex gap-2 flex-wrap">
                      {/* {currentProblem?.topics?.map((topic) => ( */}
                        <Badge
                          key={currentProblem?.topic}
                          variant="outline"
                          className="text-blue-400 border-blue-500/30"
                        >
                          {currentProblem?.topic}
                        </Badge>
                      {/* ))} */}
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">
                    Description
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {currentProblem?.description}
                  </p>
                </div>

                {/* Input/Output Format */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Input Format</h4>
                    <code className="block p-3 bg-gray-800 rounded-lg text-green-400 text-sm break-all">
                      {currentProblem?.inputFormat}
                    </code>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Output Format</h4>
                    <code className="block p-3 bg-gray-800 rounded-lg text-blue-400 text-sm break-all">
                      {currentProblem?.outputFormat}
                    </code>
                  </div>
                </div>

                {/* Sample Input/Output */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Sample Input</h4>
                    <code className="block p-3 bg-gray-800 rounded-lg text-gray-300 text-sm break-all whitespace-pre-line">
                      {currentProblem?.sampleInput}
                    </code>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Sample Output</h4>
                    <code className="block p-3 bg-gray-800 rounded-lg text-gray-300 text-sm break-all whitespace-pre-line">
                      {currentProblem?.sampleOutput}
                    </code>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Explanation</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {currentProblem?.explanation}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              {/* Code Editor Section */}
              <ResizablePanel defaultSize={70} minSize={30}>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/30">
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => submitCode()}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" /> Submit
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
                    <CodeMirror
                      value={code}
                      theme={dracula}
                      extensions={[languageExtensions[language], cursorPlugin]}
                      onChange={handleEditorChange}
                      onCreateEditor={(editor) => (editorRef.current = editor)}
                    />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Output Panel */}
              <ResizablePanel
                defaultSize={30}
                minSize={15}
                maxSize={50}
                className="bg-gray-900/50"
              >
                <div className="h-full flex flex-col">
                  <div className="p-3 border-b border-gray-800">
                    <h3 className="font-semibold text-white">Output</h3>
                  </div>
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="p-4">
                      <pre
                        className={`text-sm whitespace-pre-wrap font-mono ${
                          isSubmitting || !output
                            ? "text-gray-300"
                            : outputStatus
                              ? "text-green-400"
                              : "text-red-500"
                        }`}
                      >
                        {isSubmitting
                          ? "Running code..."
                          : output || "Run your code to see the output..."}
                      </pre>
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel */}
<ResizablePanel
  defaultSize={25}
  minSize={20}
  maxSize={40}
  className="h-screen bg-gray-900 border-l border-gray-800 overflow-hidden" // <-- Add overflow-hidden
>
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="p-4 border-b border-gray-800">
      <h2 className="text-xl font-bold text-white truncate">{battleData?.title}</h2>
      <div className="flex items-center gap-2 text-orange-400 mt-2">
        <Clock className="h-4 w-4" />
        <span className="font-mono text-lg truncate">
           Time Left: {formatTime(timeLeft)}
        </span>
      </div>
    </div>

    {/* Controls */}
    <div className="p-4 border-b border-gray-800 space-y-3">
      <Button
        onClick={toggleVoiceChat}
        variant={isVoiceEnabled ? "default" : "outline"}
        className="w-full"
      >
        {isVoiceEnabled ? (
          <>
            <Mic className="h-4 w-4 mr-2" /> Leave Voice Chat
          </>
        ) : (
          <>
            <MicOff className="h-4 w-4 mr-2" /> Join Voice Chat
          </>
        )}
      </Button>
      <Button
        onClick={() => setShowLeaderboard(true)}
        variant="outline"
        className="w-full"
      >
        <Trophy className="h-4 w-4 mr-2" /> Leaderboard
      </Button>
    </div>

    {/* Problems List */}
    <div className="flex-1 flex flex-col p-4 overflow-hidden border-b border-gray-800">
      <h3 className="font-semibold text-white mb-3">Problems</h3>
      <div className="flex-1 overflow-y-auto space-y-2">
        {problems.map((problem, index) => {
          const isSolved = userTeam?.problemsSolved?.includes(problem.id);
          return (
            <div
              key={problem.id}
              className={`flex justify-between items-center text-sm cursor-pointer px-2 py-1 rounded ${
                index === currentIndex
                  ? "bg-white text-black font-semibold"
                  : "hover:bg-zinc-800"
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <span
                className={`text-sm ${
                  index === currentIndex ? "text-black" : "text-gray-300"
                } truncate flex-1 mr-2`}
              >
                {index + 1}. {problem.title}
              </span>
              {isSolved && <Check className="h-4 w-4 text-green-400" />}
            </div>
          );
        })}
      </div>
    </div>
  </div>
</ResizablePanel>

        </ResizablePanelGroup>
      </div>

      {/* Leaderboard Modal */}
      <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Leaderboard
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {leaderboardData?.leaderboard.map((team, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50"
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index + 1)}
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {team.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{team.teamName}</div>
                  <div className="text-sm text-gray-400">
                    {team.score} pts • {team.problemsSolved} solved
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Battle End Modal */}
      <Dialog open={showBattleEndModal} onOpenChange={setShowBattleEndModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              🎉 Battle Ended!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="text-6xl">🏆</div>
            <div>
              <h3 className="text-xl font-bold text-yellow-400">
                Winner: {leaderboardData?.leaderboard[0].teamName}
              </h3>
              <p className="text-gray-300">
                {leaderboardData?.leaderboard[0].score} points •{" "}
                {leaderboardData?.leaderboard[0].problemsSolved}{" "}
                {leaderboardData?.leaderboard[0].problemsSolved > 1
                  ? "problems"
                  : "problem"}{" "}
                solved
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Final Rankings:</h4>
              <div className="space-y-1 text-sm">
                {leaderboardData?.leaderboard.map((team, index) => (
                  <div key={index} className="flex justify-between">
                    <span>
                      #{index + 1} {team.teamName}
                    </span>
                    <span>{team.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={() => navigate("/code-battle")} className="w-full">
              Return home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BattleRoom;
