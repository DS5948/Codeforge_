import React, { useState } from "react";
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
import { Backdrop } from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

const fetchBattleRooms = async () => {
  const response = await fetch(`${API_URL}/battle/list-rooms`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch battle rooms");
  }
  return data;
};

const createBattleRoom = async (roomData) => {
  const response = await fetch(`${API_URL}/battle/room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(roomData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create battle room");
  }
  return data;
};

const joinBattleRoom = async ({ roomCode, teamName }) => {
  const response = await fetch(`${API_URL}/battle/room/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ roomCode, teamName }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to join battle room");
  }
  return data;
};

const ListBattleRooms = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTopic, setFilterTopic] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [joiningRoomCode, setJoiningRoomCode] = useState("");
  const [mode, setMode] = useState("solo");

  const [roomType, setRoomType] = useState("public");
  const [topic, setTopic] = useState("Graphs");
  const [difficulty, setDifficulty] = useState("Medium");
  const [maxTeamSize, setMaxTeamSize] = useState(2);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["battleRooms"],
    queryFn: fetchBattleRooms,
    onError: (err) => toast.error(err.message),
  });

  const { mutate: createRoom, isPending: creating } = useMutation({
    mutationFn: createBattleRoom,
    onSuccess: (data) => {
      toast.success("Battle room created!");
      queryClient.invalidateQueries(["battleRooms"]);
      navigate(`/battle/room/${data.roomId}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: joinRoom, isPending: joining } = useMutation({
    mutationFn: joinBattleRoom,
    onSuccess: (data) => {
      toast.success("Joined battle room!");
      navigate(`/battle/room/${data.roomId}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredRooms = data?.rooms?.filter((room) => {
    const matchesSearch = room.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = filterTopic === "All" || room.topic === filterTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <Backdrop open={joining} sx={{ color: "#fff", zIndex: 9999 }}>
          <Loader color="inherit" />
        </Backdrop>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <Input
            placeholder="Search by topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={filterTopic} onValueChange={setFilterTopic}>
            <SelectTrigger><SelectValue placeholder="Filter Topic" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Graphs">Graphs</SelectItem>
              <SelectItem value="DP">DP</SelectItem>
              <SelectItem value="Greedy">Greedy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Create Battle Dialog */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>Create Battle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Battle Room</DialogTitle>
              <DialogDescription>Choose configuration options</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Label>Room Type</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>

              <Label>Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger><SelectValue placeholder="Mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">Solo</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>

              <Label>Topic</Label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger><SelectValue placeholder="Topic" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Graphs">Graphs</SelectItem>
                  <SelectItem value="DP">DP</SelectItem>
                  <SelectItem value="Greedy">Greedy</SelectItem>
                </SelectContent>
              </Select>

              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              {mode === "team" && (
                <>
                  <Label>Max Team Size</Label>
                  <Input
                    type="number"
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                  />
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={() =>
                  createRoom({ roomType, mode, topic, difficulty, maxTeamSize })
                }
              >
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rooms Table */}
      <div className="flex-1 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Topic</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5}><Loader /></TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={5}>Error loading rooms</TableCell></TableRow>
            ) : filteredRooms?.length ? (
              filteredRooms.map((room) => (
                <TableRow key={room.roomId}>
                  <TableCell>{room.topic}</TableCell>
                  <TableCell>{room.difficulty}</TableCell>
                  <TableCell>{room.mode}</TableCell>
                  <TableCell>{room.users?.length || 0}</TableCell>
                  <TableCell>
                    {room.mode === "team" ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => setJoiningRoomCode(room.roomCode)}>Join</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Join as Team</DialogTitle>
                          </DialogHeader>
                          <Label>Enter Team Name</Label>
                          <Input
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Ex: AlphaCoders"
                          />
                          <DialogFooter>
                            <Button
                              onClick={() =>
                                joinRoom({ roomCode: joiningRoomCode, teamName })
                              }
                            >
                              Join Room
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button onClick={() => joinRoom({ roomCode: room.roomCode })}>
                        Join
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5}>No battle rooms found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ListBattleRooms;
