import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Backdrop } from "@mui/material";
import { Button } from "@/components/ui/button";
import Loader from "@mui/material/CircularProgress";
import toast from "react-hot-toast";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Decoration, ViewPlugin, WidgetType } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import CodeMirror from "@uiw/react-codemirror";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { php } from "@codemirror/lang-php";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import {
  FaFileAlt,
  FaHtml5,
  FaJs,
  FaPython,
  FaJava,
  FaPhp,
} from "react-icons/fa";
import {
  SiCplusplus,
  SiC,
  SiRust,
  SiGo,
  SiRuby,
  SiSwift,
  SiKotlin,
  SiTypescript,
} from "react-icons/si";
import { debounce } from "lodash";
import { Loader2, LogOutIcon, Mic, MicOff, Play, Plus, X } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { UserAvatar } from "../Avatar/UserAvatar";
import { Client } from "@stomp/stompjs";

const API_URL = import.meta.env.VITE_API_URL;

// ─── API Calls ────────────────────────────────────────────────────────────────

const fetchRoom = async ({ queryKey }) => {
  const [, roomId] = queryKey;
  const res = await fetch(`${API_URL}/room/${roomId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch room");
  const data = await res.json();
  console.log(data);
  return data;
};

const fetchFiles = async ({ queryKey }) => {
  const [, roomId] = queryKey;
  const res = await fetch(`${API_URL}/file/room/${roomId}`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch files");
  return data;
};

const createFile = async ({ roomId, name }) => {
  const type = name.split(".").pop();
  const res = await fetch(`${API_URL}/file/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ roomId, name, type, content: "" }),
  });
  const data = await res.json();
  console.log(data);
  console.log(res);
  if (!res.ok) throw new Error(data.message || "Failed to create file");
  return data;
};

const deleteFile = async ({ fileId }) => {
  const res = await fetch(`${API_URL}/file/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ fileId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete file");
  return data;
};

const updateFileContent = async ({ fileId, content }) => {
  const res = await fetch(`${API_URL}/file/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ fileId, content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update file");
  return data;
};

const runCode = async ({ roomId, code, language }) => {
  const res = await fetch(`${API_URL}/room/${roomId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code, language }),
  });
  if (!res.ok) throw new Error("Code execution failed");
  return res.json();
};

const leaveRoom = async ({ roomId }) => {
  const res = await fetch(`${API_URL}/room/leave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ roomId }),
  });
  if (!res.ok) throw new Error("Failed to leave room");
  return res.json();
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extensionToLanguage = {
  js: "javascript",
  py: "python",
  java: "java",
  cpp: "cpp",
  c: "c",
  php: "php",
  rs: "rust",
  go: "go",
};

const languageExtensions = {
  javascript: javascript(),
  python: python(),
  java: java(),
  cpp: cpp(),
  c: cpp(),
  php: php(),
  rust: rust(),
  go: go(),
};

const getLanguageFromFilename = (name) => {
  const ext = name.split(".").pop();
  return extensionToLanguage[ext] || "javascript";
};

const getIcon = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();
  switch (ext) {
    case "py":
      return <FaPython className="text-yellow-400" />;
    case "js":
      return <FaJs className="text-yellow-300" />;
    case "ts":
      return <SiTypescript className="text-blue-400" />;
    case "html":
      return <FaHtml5 className="text-orange-500" />;
    case "java":
      return <FaJava className="text-red-500" />;
    case "cpp":
    case "cc":
    case "cxx":
      return <SiCplusplus className="text-blue-500" />;
    case "c":
      return <SiC className="text-blue-300" />;
    case "php":
      return <FaPhp className="text-indigo-400" />;
    case "rs":
      return <SiRust className="text-orange-400" />;
    case "go":
      return <SiGo className="text-cyan-400" />;
    case "rb":
      return <SiRuby className="text-red-400" />;
    case "swift":
      return <SiSwift className="text-orange-400" />;
    case "kt":
    case "kts":
      return <SiKotlin className="text-purple-400" />;
    case "json":
    case "xml":
    case "txt":
    case "md":
      return <FaFileAlt className="text-gray-300" />;
    default:
      return <FaFileAlt className="text-gray-400" />;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const RoomContent = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [roomUsers, setRoomUsers] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [allFiles, setAllFiles] = useState([]);
  const [cursors, setCursors] = useState({});
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [creatingIndex, setCreatingIndex] = useState(null);

  // ── Voice chat state ──────────────────────────────────────────────────────
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  const toggleVoiceChat = () => {
    setIsVoiceEnabled((prev) => {
      if (prev) {
        // TODO: tear down WebRTC / voice connection here
        toast.success("Left voice chat");
      } else {
        // TODO: initialise WebRTC / voice connection here
        toast.success("Joined voice chat");
      }
      return !prev;
    });
  };
  // ─────────────────────────────────────────────────────────────────────────

  const editorRef = useRef(null);

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: roomData } = useQuery({
    queryKey: ["room", roomId],
    queryFn: fetchRoom,
  });

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const username = authUser?.username;

  const { data: filesData, refetch: refetchFiles } = useQuery({
    queryKey: ["files", roomId],
    queryFn: fetchFiles,
  });

  // ── Sync files from query ─────────────────────────────────────────────────

  useEffect(() => {
    if (filesData?.files) setAllFiles(filesData.files);
  }, [filesData]);

  useEffect(() => {
    if (roomData) setRoomUsers(roomData?.users);
  }, [roomData]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createFileMutation = useMutation({ mutationFn: createFile });
  const deleteFileMutation = useMutation({ mutationFn: deleteFile });
  const updateContentMutation = useMutation({ mutationFn: updateFileContent });

  const runCodeMutation = useMutation({
    mutationFn: runCode,
    onSuccess: (data) => {
      setOutput(data.output || "No output");
      setStatus(data.status);
    },
    onError: (err) => setOutput("Error: " + err.message),
  });

  const leaveRoomMutation = useMutation({
    mutationFn: leaveRoom,
    onSuccess: () => {
      toast.success("Left room");
      navigate("/list-rooms");
    },
    onError: (err) => toast.error(err.message),
  });

  const socketRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!roomId || !username) return;

    const client = new Client({
      brokerURL: "ws://https://codeforge-backend-rnm1.onrender.com",
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    client.onConnect = () => {
      console.log("✅ Connected to WebSocket");

      // 🔥 SUBSCRIBE (store reference to unsubscribe later)
      subscriptionRef.current = client.subscribe(
        `/topic/${roomId}`,
        (message) => {
          const data = JSON.parse(message.body);
          console.log("Received STOMP message:", data);
          switch (data.event) {
            case "typing":
              setAllFiles((prev) =>
                prev.map((f) =>
                  f.id === data.fileId ? { ...f, content: data.content } : f,
                ),
              );

              queryClient.setQueryData(["files", roomId], (old) => {
                if (!old?.files) return old;

                return {
                  ...old,
                  files: old.files.map((f) =>
                    f.id === data.fileId ? { ...f, content: data.content } : f,
                  ),
                };
              });
              break;

            case "cursorMove":
              setCursors((prev) => ({
                ...prev,
                [data.username]: data.pos,
              }));
              break;

            case "userJoined":
              if (data.username !== username) {
                toast.success(`${data.username} joined`);

                setRoomUsers((prev = []) =>
                  prev.includes(data.username)
                    ? prev
                    : [...prev, data.username],
                );
              }
              break;

            case "userLeft":
              toast.success(`${data.username} left`);
              setRoomUsers((prev) => prev.filter((u) => u !== data.username));
              break;

            case "fileCreated":
              setAllFiles((prev) => [...prev, data.file]);
              break;

            case "fileDeleted":
              setAllFiles((prev) =>
                prev.filter((f) => f.id !== data.file.id),
              );
              break;

            default:
              break;
          }
        },
      );

      // 🔥 JOIN ROOM
      client.publish({
        destination: "/app/joinRoom",
        body: JSON.stringify({ roomId, username }),
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame);
    };

    client.activate();
    socketRef.current = client;

    return () => {
      console.log("🛑 Cleaning up socket...");

      try {
        if (client.connected) {
          // 🔥 LEAVE ROOM
          client.publish({
            destination: "/app/leaveRoom",
            body: JSON.stringify({ roomId, username }),
          });
        }

        // 🔥 UNSUBSCRIBE (VERY IMPORTANT)
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
        }

        client.deactivate();
      } catch (err) {
        console.error("Socket cleanup error:", err);
      }
    };
  }, [roomId, username]);
  // ── CodeMirror cursor widget ───────────────────────────────────────────────

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
    { decorations: (v) => v.decorations },
  );

  // ── Derived state ─────────────────────────────────────────────────────────

  const currentFile = allFiles[activeIndex] || { name: "", content: "" };
  const currentLanguage = getLanguageFromFilename(currentFile.name);
  const [code, setCode] = useState(currentFile.content);

  useEffect(() => {
    setCode(currentFile.content);
  }, [allFiles, activeIndex]);

  // ── Debounced save ────────────────────────────────────────────────────────

  const debouncedSave = debounce((fileId, content) => {
    updateContentMutation.mutate({ fileId, content });
  }, 1000);

  // ── Editor change handler ─────────────────────────────────────────────────

  const handleEditorChange = (value, viewUpdate, file) => {
    setCode(value);

    setAllFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, content: value } : f)),
    );

    // Broadcast typing event via STOMP
    if (socketRef.current?.connected) {
      socketRef.current.publish({
        destination: "/app/typing",
        body: JSON.stringify({ roomId, fileId: file.id, content: value }),
      });
    }

    // Debounced persist to backend
    if (file.id) {
      debouncedSave(file.id, value);
    }

    // Broadcast cursor position via STOMP
    const pos = viewUpdate.state.selection.main.head;
    if (socketRef.current?.connected) {
      socketRef.current.publish({
        destination: "/app/cursorMove",
        body: JSON.stringify({ roomId, username, pos }),
      });
    }
  };

  // ── File management ───────────────────────────────────────────────────────

  const handleCreateFile = () => {
    const newIndex = allFiles.length;
    setActiveIndex(newIndex);
    setRenamingIndex(newIndex);
  };

  const handleFileRename = (i, newName) => {
    const trimmed = newName.trim() || "untitled.js";
    setCreatingIndex(i);
    createFileMutation.mutate(
      { roomId, name: trimmed },
      {
        onSuccess: (data) => {
          // Broadcast file creation via STOMP
          if (socketRef.current?.connected) {
            socketRef.current.publish({
              destination: "/app/createFile",
              body: JSON.stringify({ roomId, file: data.file }),
            });
          }
          refetchFiles();
          setRenamingIndex(null);
          setCreatingIndex(null);
        },
        onError: () => {
          toast.error("Failed to create file.");
          setCreatingIndex(null);
        },
      },
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ResizablePanelGroup
      direction="vertical"
      className="rounded-lg border border-zinc-800 h-screen bg-zinc-950"
    >
      <Backdrop
        open={leaveRoomMutation.isPending}
        sx={{ color: "#fff", zIndex: 1200 }}
      >
        <Loader color="inherit" />
      </Backdrop>

      <ResizablePanel defaultSize={70}>
        <ResizablePanelGroup direction="horizontal">
          {/* ── Editor Panel ── */}
          <ResizablePanel defaultSize={70}>
            <div className="h-full flex flex-col bg-zinc-950 rounded-lg relative">
              {/* Tabs + Run button */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 z-10">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {[
                    ...allFiles,
                    ...(renamingIndex === allFiles.length ? [{}] : []),
                  ].map((file, i) => (
                    <div
                      key={file.id || i}
                      onClick={() => setActiveIndex(i)}
                      className={`flex items-center px-3 py-1 rounded-t-md text-sm cursor-pointer transition-all duration-200
                        ${
                          i === activeIndex
                            ? "border-t-2 border-purple-500 bg-zinc-800 text-white"
                            : "bg-zinc-900 text-gray-400 hover:bg-zinc-800 hover:text-white"
                        }
                      `}
                    >
                      {renamingIndex === i ? (
                        <input
                          autoFocus
                          type="text"
                          defaultValue={file.name || "untitled.js"}
                          className="bg-transparent text-white outline-none px-1 w-28"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleFileRename(i, e.currentTarget.value);
                            }
                          }}
                          onBlur={() => setRenamingIndex(null)}
                          disabled={creatingIndex === i}
                        />
                      ) : (
                        <span
                          onDoubleClick={() => setRenamingIndex(i)}
                          className="flex gap-1 items-center"
                        >
                          {getIcon(file.name || "untitled.js")}{" "}
                          {file.name || "untitled.js"}
                        </span>
                      )}

                      {creatingIndex === i ? (
                        <Loader2 className="w-3 h-3 ml-2 animate-spin" />
                      ) : (
                        // Fixed: use file.id consistently (not file.id)
                        file.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFileMutation.mutate(
                                { fileId: file.id },
                                {
                                  onSuccess: (data) => {
                                    // Broadcast file deletion via STOMP
                                    if (socketRef.current?.connected) {
                                      socketRef.current.publish({
                                        destination: "/app/deleteFile",
                                        body: JSON.stringify({
                                          roomId,
                                          file: data.file,
                                        }),
                                      });
                                    }
                                    toast.success(
                                      `File "${file.name}" has been removed.`,
                                    );
                                    refetchFiles();
                                    setActiveIndex((prev) =>
                                      prev > i ? prev - 1 : 0,
                                    );
                                  },
                                },
                              );
                            }}
                            className="ml-2 text-xs text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        )
                      )}
                    </div>
                  ))}

                  <button
                    className="ml-2 p-1 text-gray-300 hover:text-white transition-colors"
                    onClick={handleCreateFile}
                    disabled={
                      allFiles.length === 0 || runCodeMutation.isPending
                    }
                  >
                    <Plus />
                  </button>
                </div>

                <Button
                  onClick={() =>
                    runCodeMutation.mutate({
                      roomId,
                      code: code,
                      language: currentLanguage,
                    })
                  }
                  className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/80 text-white px-4 py-2 rounded-md transition-colors duration-200"
                  disabled={allFiles.length === 0 || runCodeMutation.isPending}
                >
                  {runCodeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" /> Submit
                    </>
                  )}
                </Button>
              </div>

              {/* Editor Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-900 relative">
                {allFiles.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <Button
                      onClick={handleCreateFile}
                      disabled={createFileMutation.isPending}
                      className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/80 text-white px-8 py-4 text-xl font-semibold flex items-center gap-3 shadow-md hover:shadow-green-600/30 transition-all"
                    >
                      {createFileMutation.isPending ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          Creating File...
                        </>
                      ) : (
                        <>
                          <Plus className="h-6 w-6" />
                          Create New File
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div
                  className={`h-full ${allFiles.length === 0 ? "blur-sm pointer-events-none" : ""}`}
                >
                  <CodeMirror
                    value={code}
                    extensions={[
                      languageExtensions[currentLanguage],
                      cursorPlugin,
                    ]}
                    theme={dracula}
                    height="100%"
                    onCreateEditor={(view) => {
                      editorRef.current = view;
                    }}
                    onChange={(val, viewUpdate) => {
                      handleEditorChange(val, viewUpdate, currentFile);
                    }}
                  />
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* ── Room Info / Users Panel ── */}
          <ResizablePanel defaultSize={30}>
            <div className="w-full h-full bg-gray-900 text-gray-50 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-700">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-100 mb-4 sm:mb-0">
                  {roomData?.room?.roomName}
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {!isVoiceEnabled ? (
                    <Button
                      onClick={toggleVoiceChat}
                      className="flex items-center gap-2 bg-[#8B5CF6] hover:bg-[#8B5CF6]/80 text-white px-4 py-2 rounded-md transition-colors duration-200"
                    >
                      <MicOff className="w-5 h-5" />
                      Join Voice Chat
                    </Button>
                  ) : (
                    <Button
                      onClick={toggleVoiceChat}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                    >
                      <Mic className="w-5 h-5" />
                      Leave Voice Chat
                    </Button>
                  )}
                  <Button
                    onClick={() => leaveRoomMutation.mutate({ roomId })}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                  >
                    <LogOutIcon className="w-5 h-5" />
                    Leave
                  </Button>
                </div>
              </div>
              <div className="h-full overflow-y-auto p-4 sm:p-6">
                <div className="flex flex-wrap gap-4 justify-items-center">
                  {roomUsers?.map((user, index) => (
                    <UserAvatar key={index} name={user} isSpeaking={true} />
                  ))}
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* ── Output Panel ── */}
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
                  runCodeMutation.isPending || !output
                    ? "text-gray-300"
                    : status === "Success"
                      ? "text-green-400"
                      : "text-red-500"
                }`}
              >
                {runCodeMutation.isPending
                  ? "Running code..."
                  : output || "Run your code to see the output..."}
              </pre>
            </div>
          </ScrollArea>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default RoomContent;
