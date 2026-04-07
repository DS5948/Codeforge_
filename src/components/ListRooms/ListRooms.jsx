import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "@mui/material/CircularProgress";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Globe,
  Loader2,
  Lock,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

const API_URL = import.meta.env.VITE_API_URL;

// Function to fetch rooms
const fetchRooms = async () => {
  console.log("Fetching rooms...");
  const response = await fetch(`${API_URL}/room`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch rooms");
  }

  const data = await response.json();
  console.log("data: ", data);

  return data;
};

// Function to join a room
const joinRoom = async ({ roomId, password }) => {
  console.log("Joining room with ID:", roomId); // Debug log

  const response = await fetch(`${API_URL}/room/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ roomId, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to join room");
  }

  const data = await response.json();
  return data.room;
};

// Function to create a room
const createRoom = async ({ roomName, roomType, password }) => {
  console.log("Creating room:", roomName, roomType);

  const response = await fetch(`${API_URL}/room/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ roomName, roomType, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create room");
  }

  const data = await response.json();
  console.log("data", data);

  return data.room;
};

const ListRooms = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomPassword, setNewRoomPassword] = useState("");
  const [newRoomType, setNewRoomType] = useState("public");
  const [joinPassword, setJoinPassword] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  // Fetch rooms
  const {
    data: rooms,
    isLoading: loadingRooms,
    isError,
    error,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });

  // Create room mutation
  const { mutate: createRoomMutation, isPending: isCreating } = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      toast.success("Room created successfully!");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setIsCreateModalOpen(false);
      setNewRoomName("");
      setNewRoomType("public");
      setNewRoomPassword("");
    },
    onError: (err) => {
      console.error("Create room error:", err);
      toast.error(err.message);
    },
  });

  // Join room mutation
  const { mutate: joinRoomMutation, isPending: isJoining } = useMutation({
    mutationFn: joinRoom,
    onSuccess: (room) => {
      navigate(`/room/${room.roomId}`);
      toast.success("Successfully joined the room!");
      setIsJoinModalOpen(false);
      setJoinPassword("");
    },
    onError: (err) => {
      console.error("Join room error:", {
        error: err,
        roomId: selectedRoom?._id,
        hadPassword: !!joinPassword,
      });
      toast.error(err.message);
    },
  });

  // Filter rooms
  const filteredRooms = rooms?.filter((room) => {
    const matchesSearch = room.roomName
      ?.toLowerCase()
      .includes(searchQuery?.toLowerCase());
    const matchesType = filterType === "all" || room.roomType === filterType;
    return matchesSearch && matchesType;
  });

  const handleJoinRoom = (room) => {
    console.log("Attempting to join room:", room);
    setSelectedRoom(room);
    if (room.roomType === "private") {
      setIsJoinModalOpen(true);
    } else {
      joinRoomMutation({ roomId: room.roomId });
    }
  };

  const handleEnterRoom = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Coding Rooms</h1>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 w-full sm:w-64"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>

              <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-600 text-white">
                  <DialogHeader>
                    <DialogTitle>Create New Room</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="room-name">Room Name</Label>
                      <Input
                        id="room-name"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="Enter room name..."
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="room-type">Room Type</Label>
                      <Select
                        value={newRoomType}
                        onValueChange={(value) => setNewRoomType(value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newRoomType === "private" && (
                      <div>
                        <Label htmlFor="room-password">Password</Label>
                        <Input
                          id="room-password"
                          type="password"
                          value={newRoomPassword}
                          onChange={(e) => setNewRoomPassword(e.target.value)}
                          placeholder="Enter room password..."
                          className="bg-slate-700 border-slate-600 text-white mt-1"
                        />
                      </div>
                    )}

                    <Button
                      onClick={() => {
                        createRoomMutation({
                          roomName: newRoomName,
                          roomType: newRoomType,
                          password: newRoomPassword,
                        });
                      }}
                      disabled={!newRoomName.trim() || isCreating}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Room"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {filteredRooms?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-2">No rooms found</div>
            <p className="text-slate-500">
              Try adjusting your search or create a new room
            </p>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700/50 hover:bg-slate-700/30">
                  <TableHead className="text-slate-300">Room Name</TableHead>
                  <TableHead className="text-slate-300">Type</TableHead>
                  <TableHead className="text-slate-300">Creator</TableHead>
                  <TableHead className="text-slate-300">Members</TableHead>
                  <TableHead className="text-slate-300">Created</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms?.map((room) => (
                  <TableRow
                    key={room._id}
                    className="border-slate-700/50 hover:bg-slate-700/30"
                  >
                    <TableCell>
                      <div
                        className={`text-left font-medium ${
                          room.users.includes(authUser?.username)
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-white cursor-default"
                        }`}
                      >
                        {room.roomName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        key={`badge-${room._id}`}
                        variant={
                          room.roomType === "public" ? "default" : "destructive"
                        }
                        className={`${
                          room.roomType === "public"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-red-600 hover:bg-red-700"
                        } rounded-2xl`}
                      >
                        {room.roomType === "public" ? (
                          <>
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {room.roomCreator}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {room.users.length}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(room.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {room.users.includes(authUser?.username) ? (
                        <Button
                          disabled={isJoining}
                          onClick={() => handleEnterRoom(room.roomId)}
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        >
                          Enter
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleJoinRoom(room)}
                          disabled={isJoining}
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          {isJoining && selectedRoom.roomId == room.roomId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Join"
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Skeleton Rows */}
                {loadingRooms &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`} className="animate-pulse">
                      <TableCell>
                        <Skeleton className="h-5 w-3/4" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-5 rounded-full" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-2/3" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-5 rounded-full" />
                          <Skeleton className="h-5 w-8" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-5 rounded-full" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-9 w-20 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Join Private Room Modal */}
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white">
          <DialogHeader>
            <DialogTitle>Join Private Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-300">
              {'Enter the password for "'}
              {selectedRoom?.roomName}
              {'"'}
            </p>
            <div>
              <Label htmlFor="join-password">Password</Label>
              <Input
                id="join-password"
                type="password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                placeholder="Enter password..."
                className="bg-slate-700 border-slate-600 text-white mt-1"
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  joinRoomMutation({
                    roomId: selectedRoom?.roomId,
                    password: joinPassword,
                  })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsJoinModalOpen(false);
                  setJoinPassword("");
                }}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  console.log("Joining room with ID:", selectedRoom?._id);
                  joinRoomMutation({
                    roomId: selectedRoom?.roomId,
                    password: joinPassword,
                  });
                }}
                disabled={!joinPassword.trim() || isJoining}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Room"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListRooms;
