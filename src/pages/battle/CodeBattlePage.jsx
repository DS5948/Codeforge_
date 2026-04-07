import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Check,
  Clock,
  Eye,
  Loader2,
  Trophy,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Avatar from "@/components/Avatar/Avatar";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

// ------------------- API Helpers -------------------
const fetchUpcomingBattles = async () => {
  const res = await fetch(`${API_URL}/battle/upcoming`, {
    credentials: "include",
  });
  const data = await res.json();

  if (!res.ok)
    throw new Error(data?.error || "Failed to fetch upcoming battles");
  return data;
};

const fetchPastBattles = async () => {
  const res = await fetch(`${API_URL}/battle/past`, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch past battles");
  return data;
};

const fetchUserTeams = async () => {
  const res = await fetch(`${API_URL}/team/my-teams`, {
    credentials: "include",
  });
  const data = await res.json();
  console.log("user-teams: ",data);
  
  if (!res.ok) throw new Error(data?.error || "Failed to fetch user teams");
  return data;
};

const registerForBattle = async (formData) => {
  const res = await fetch(`${API_URL}/battle/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Registration failed");
  return data;
};

const createBattle = async (formData) => {
  // Convert local time strings to UTC ISO format

  const startTime = new Date(formData.startTime).toISOString();

  const payload = {
    ...formData,
    startTime,
  };
  const res = await fetch(`${API_URL}/battle/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to create battle");
  return data;
};

// ------------------- Main Component -------------------
const CodeBattlePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedBattleId, setSelectedBattleId] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [mode, setMode] = useState("solo");
  const [topic, setTopic] = useState("All");
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState(2);
  const [invites, setInvites] = useState([""]);
  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation({
      title,
      startTime,
      mode,
      topic,
      duration: Number(duration),
    });
  };
  const handleRegister = (e) => {
    e.preventDefault();
    const isTeam = selectedBattle?.mode;
    const registrationData = {
      battleId: selectedBattle?.id,
      mode: selectedBattle?.mode,
      teamName: isTeam ? teamName : null,
      teamSize: isTeam ? teamSize : null,
      invitedMembers: isTeam ? invites : [],
    };

    registerMutation(registrationData);
  };
  const handleInviteChange = (index, value) => {
    const updated = [...invites];
    updated[index] = value;
    setInvites(updated);
  };
  const handleAddInvite = () => {
    if (invites.length < teamSize - 1) {
      setInvites([...invites, ""]);
    }
  };
  const handleRemoveInvite = (index) => {
    const updated = invites.filter((_, i) => i !== index);
    setInvites(updated);
  };
  const { mutate: acceptInvite, isPending: accepting } = useMutation({
    mutationFn: (teamId) =>
      fetch(`${API_URL}/team/accept-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ teamId }),
      }).then((res) => res.json()),
    onSuccess: () => {
      toast.success("Invite accepted");
      refetchInvites();
      queryClient.invalidateQueries(["userTeams"]);
    },
  });

  const { mutate: declineInvite, isPending: declininig } = useMutation({
    mutationFn: (teamId) =>
      fetch(`${API_URL}/team/decline-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ teamId }),
      }).then((res) => res.json()),
    onSuccess: () => {
      toast.error("Invite declined");
      refetchInvites();
      queryClient.invalidateQueries(["userTeams"]);
    },
  });

  const { data: upcomingBattles, isLoading: loadingUpcoming } = useQuery({
    queryKey: ["upcomingBattles"],
    queryFn: fetchUpcomingBattles,
  });

  const { data: pastBattles, isLoading: loadingPast } = useQuery({
    queryKey: ["pastBattles"],
    queryFn: fetchPastBattles,
  });

  const { data: userTeams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ["userTeams"],
    queryFn: fetchUserTeams,
  });
  const fetchOngoingBattles = async () => {
    const res = await fetch(`${API_URL}/battle/ongoing`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data?.error || "Failed to fetch ongoing battles");
    return data;
  };

  const { data: ongoingBattles = [], isLoading: loadingOngoing } = useQuery({
    queryKey: ["ongoingBattles"],
    queryFn: fetchOngoingBattles,
  });

  const { mutate: registerMutation, isPending: isRegistering } = useMutation({
    mutationFn: registerForBattle,
    onSuccess: () => {
      toast.success("Registration successful!");
      setTeamName("")
      setShowRegisterModal(false);
      queryClient.invalidateQueries({ queryKey: ["upcomingBattles"] });
queryClient.invalidateQueries({ queryKey: ["userTeams"] });

    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createBattle,
    onSuccess: () => {
      toast.success("Battle created successfully!");
      setTitle("");
  setStartTime("");
  setMode("solo");
  setTopic("All");
  setDuration(60);
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ["upcomingBattles"] });
      queryClient.invalidateQueries({ queryKey: ["ongoingBattles"] });
    },
    onError: (err) => toast.error(err.message),
  });
  const fetchMyInvites = async () => {
    const res = await fetch(`${API_URL}/team/my-invites`, {
      credentials: "include",
    });
    const data = await res.json();
    console.log("Invites: ", data);
    

    if (!res.ok) throw new Error(data?.error || "Failed to fetch invites");
    return data;
  };

  const { data: myInvites = [], refetch: refetchInvites } = useQuery({
    queryKey: ["myInvites"],
    queryFn: fetchMyInvites,
  });

  const getUserTeamForBattle = (battleId) =>
    userTeams?.find((team) => team.battleId === battleId);
  const formatTimeUntil = (dateString) => {
    if (!dateString) return "Invalid date";

    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Invalid date";

    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Hard":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };
  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            🚩 Code Battle
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Compete solo or as a team in real-time problem-solving battles.
            Climb the leaderboard, and prove your skills.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Zap className="text-white mr-2 h-5 w-5" />
                  Start Battle
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Create New Battle
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Set up a new coding battle for the community
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="battle-title" className="text-gray-300">
                      Battle Title
                    </Label>
                    <Input
                      id="battle-title"
                      placeholder="Enter battle title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="battle-start" className="text-gray-300">
                      Start Time
                    </Label>
                    <Input
                      type="datetime-local"
                      id="battle-start"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="battle-duration" className="text-gray-300">
                      Duration (minutes)
                    </Label>
                    <Input
                      type="number"
                      id="battle-duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      min={10}
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Mode</Label>
                      <Select value={mode} onValueChange={setMode}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="solo">Solo</SelectItem>
                          <SelectItem value="team">Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Topic</Label>
                      <Input
                        type="text"
                        required
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      className="border-gray-600 text-gray-300 bg-slate-800/50 hover:bg-slate-800 transition-all"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="w-32 text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {isCreating ? <Loader2  className="h-4 w-4 animate-spin" /> : "Create Battle"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={showInvites} onOpenChange={setShowInvites}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  <Users className="mr-2 h-5 w-5" />
                  View Invites ({myInvites.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Team Invites</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Accept or decline team invitations
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {myInvites.map((invite) => (
                    <Card
                      key={invite.id}
                      className="bg-gray-800 border-gray-700"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white">
                              {invite.name}
                            </h4>
                            <p className="text-sm text-gray-400">
                              Invited by {invite.leader.username}
                            </p>
                            <p className="text-sm text-gray-300 mt-1">
                              {invite.battleTitle}
                            </p>
                            <p className="text-xs text-gray-500">
                              Starts in{" "}
                              {formatTimeUntil(invite.battle?.startTime)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                acceptInvite(invite.teamId);
                              }}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </Button>
                            <Button
                              onClick={() => {
                                declineInvite(invite.teamId);
                              }}
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-600/10 bg-transparent"
                            >
                              {declininig ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Upcoming Battles */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Upcoming Battles</h2>
          </div>
          {!loadingUpcoming && upcomingBattles?.length === 0 && (
              <div className="text-center">
                <div className="text-slate-400 text-lg mb-2">
                  No upcoming battles
                </div>
              </div>
            )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingBattles?.map((battle) => {
              const userTeam = getUserTeamForBattle(battle.id);
              const isSolo = battle.mode === "solo";
              return (
                <Card
                  key={battle.id}
                  className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-white">
                        {battle.title}
                      </CardTitle>
                      <Badge
                        className={`rounded-2xl ${getDifficultyColor(battle.difficulty)}`}
                      >
                        {`${battle.teamCount} ${battle.teamCount === 1 ? "Team" : "Teams"}`}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Starts in {formatTimeUntil(battle.startTime)}
                      </div>
                      <Badge
                        variant="outline"
                        className="border-gray-600 text-gray-300 rounded-2xl"
                      >
                        {battle.mode}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {userTeam ? (
                      battle.mode === "team" ? (
                        <Button
                          variant="outline"
                          className="w-full border-green-600 text-green-400 hover:bg-green-600/10 bg-transparent"
                          onClick={() => {
                              setSelectedTeam(userTeam);
                              setShowTeamDetails(true)
                            }
                          }
                        >
                          <Users className="mr-2 h-4 w-4" />
                          View Team: {userTeam.name}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full border-green-600 text-green-400 hover:bg-green-600/10 bg-transparent"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Registered
                        </Button>
                      )
                    ) : (
                      <Dialog
                        open={showRegisterModal}
                        onOpenChange={setShowRegisterModal}
                      >
                        <DialogTrigger asChild>
                          <Button
                            className="text-white w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => setSelectedBattle(battle)}
                          >
                            Register
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">
                              Register for Battle
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                              {selectedBattle?.title}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Mode:</span>
                                <span className="ml-2 text-white">
                                  {selectedBattle?.mode}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Difficulty:
                                </span>
                                <span className="ml-2 text-white">
                                  {selectedBattle?.difficulty}
                                </span>
                              </div>
                            </div>

                            {selectedBattle?.mode == "team" && (
                              <>
                                <div>
                                  <Label className="text-gray-300">
                                    Team Name
                                  </Label>
                                  <Input
                                    placeholder="Enter team name"
                                    value={teamName}
                                    onChange={(e) =>
                                      setTeamName(e.target.value)
                                    }
                                    className="bg-gray-800 border-gray-600 text-white"
                                    required
                                  />
                                </div>

                                <div>
                                  <Label className="text-gray-300">
                                    Team Size
                                  </Label>
                                  <Input
                                    type="number"
                                    min={2}
                                    max={5}
                                    value={teamSize}
                                    onChange={(e) => {
                                      const newSize = Number(e.target.value);
                                      setTeamSize(newSize);
                                      if (invites.length > newSize - 1) {
                                        setInvites(
                                          invites.slice(0, newSize - 1)
                                        );
                                      }
                                    }}
                                    className="bg-gray-800 border-gray-600 text-white"
                                  />
                                </div>

                                <div>
                                  <Label className="text-gray-300">
                                    Invite Teammates
                                  </Label>
                                  <p className="text-xs text-gray-400 mb-2">
                                    Add email or username of each teammate
                                    (excluding yourself).
                                  </p>
                                  <div className="space-y-2">
                                    {invites.map((invite, index) => (
                                      <div
                                        key={index}
                                        className="flex gap-2 items-center"
                                      >
                                        <Input
                                          value={invite}
                                          onChange={(e) =>
                                            handleInviteChange(
                                              index,
                                              e.target.value
                                            )
                                          }
                                          className="bg-gray-800 border-gray-600 text-white"
                                          placeholder={`Invitee ${index + 1}`}
                                          required
                                        />
                                        <Button
                                          variant="ghost"
                                          className="text-red-400 hover:text-red-300 px-2"
                                          onClick={() =>
                                            handleRemoveInvite(index)
                                          }
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                    ))}
                                    {invites.length < teamSize - 1 && (
                                      <Button
                                        type="button"
                                        variant="link"
                                        onClick={handleAddInvite}
                                        className="text-blue-400 hover:text-blue-300 text-sm px-0"
                                      >
                                        + Invite More
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setShowRegisterModal(false)}
                                className="border-gray-600 text-gray-300 bg-transparent"
                              >
                                Cancel
                              </Button>
                              <Button
                                className="w-20 text-white bg-blue-600 hover:bg-blue-700"
                                onClick={handleRegister}
                                disabled={isRegistering}
                              >
                                {isRegistering ? (
                                  <Loader2  className="h-4 w-4 animate-spin" />
                                ) : "Register"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {loadingUpcoming &&
              Array.from({ length: 3 }).map((_, i) => (
                <div className="w-full max-w-sm rounded-lg border border-gray-700 bg-gray-800/50 p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-8 w-24" /> {/* For "rsg" */}
                    <Skeleton className="h-6 w-20 rounded-full" />{" "}
                    {/* For "Medium" badge */}
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <Skeleton className="h-5 w-5 rounded-full" />{" "}
                    {/* For clock icon */}
                    <Skeleton className="h-5 w-32" />{" "}
                    {/* For "Starts in 8h 0m" */}
                    <Skeleton className="h-6 w-16 rounded-full" />{" "}
                    {/* For "solo" badge */}
                  </div>
                  <Skeleton className="h-12 w-full rounded-md" />{" "}
                  {/* For "Register" button */}
                </div>
              ))}
          </div>
        </section>

        {/* Ongoing Battles */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-green-300 rounded-full animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white">Ongoing Battles</h2>
          </div>
          {!loadingOngoing && ongoingBattles.length === 0 && (
              <div className="text-center">
                <div className="text-slate-400 text-lg mb-2">
                  No ongoing battles
                </div>
              </div>
            )}
          <div className="grid gap-4 md:grid-cols-2">
            {ongoingBattles.map((battle) => {
              const userTeam = getUserTeamForBattle(battle.id);
              const isSolo = battle.mode === "solo";
              return (
                <Card
                  key={battle.id}
                  className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">
                      <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-white">
                        {battle.title}
                      </CardTitle>
                      <Badge
                        className={`rounded-2xl ${getDifficultyColor(battle.difficulty)}`}
                      >
                        {battle.difficulty}
                      </Badge>
                      </div>
                    </CardTitle>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Ends in {formatTimeUntil(battle.endTime)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {battle.teamCount}{" "}
                        {battle.teamCount == 1
                          ? "Participant"
                          : "Participants"}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {userTeam || isSolo ? (
                      <Button
                        onClick={() => navigate(`/code-battle/${battle.id}`)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Zap className="mr-2 h-4 w-4 text-white" />
                        Enter Battle
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Dialog
                          open={showRegisterModal}
                          onOpenChange={setShowRegisterModal}
                        >
                          <DialogTrigger asChild>
                            <Button
                              className="text-white w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => setSelectedBattle(battle)}
                            >
                              {isRegistering ? (
                                <Loader2  className="h-4 w-4 animate-spin" />
                              ) : "Register"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">
                                Register for Battle
                              </DialogTitle>
                              <DialogDescription className="text-gray-400">
                                {selectedBattle?.title}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">Mode:</span>
                                  <span className="ml-2 text-white">
                                    {selectedBattle?.mode}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">
                                    Difficulty:
                                  </span>
                                  <span className="ml-2 text-white">
                                    {selectedBattle?.difficulty}
                                  </span>
                                </div>
                              </div>

                              {selectedBattle?.mode == "team" && (
                                <>
                                  <div>
                                    <Label className="text-gray-300">
                                      Team Name
                                    </Label>
                                    <Input
                                      placeholder="Enter team name"
                                      value={teamName}
                                      onChange={(e) =>
                                        setTeamName(e.target.value)
                                      }
                                      className="bg-gray-800 border-gray-600 text-white"
                                      required
                                    />
                                  </div>

                                  <div>
                                    <Label className="text-gray-300">
                                      Team Size
                                    </Label>
                                    <Input
                                      type="number"
                                      min={2}
                                      max={5}
                                      value={teamSize}
                                      onChange={(e) => {
                                        const newSize = Number(e.target.value);
                                        setTeamSize(newSize);
                                        if (invites.length > newSize - 1) {
                                          setInvites(
                                            invites.slice(0, newSize - 1)
                                          );
                                        }
                                      }}
                                      className="bg-gray-800 border-gray-600 text-white"
                                    />
                                  </div>

                                  <div>
                                    <Label className="text-gray-300">
                                      Invite Teammates
                                    </Label>
                                    <p className="text-xs text-gray-400 mb-2">
                                      Add email or username of each teammate
                                      (excluding yourself).
                                    </p>
                                    <div className="space-y-2">
                                      {invites.map((invite, index) => (
                                        <div
                                          key={index}
                                          className="flex gap-2 items-center"
                                        >
                                          <Input
                                            value={invite}
                                            onChange={(e) =>
                                              handleInviteChange(
                                                index,
                                                e.target.value
                                              )
                                            }
                                            className="bg-gray-800 border-gray-600 text-white"
                                            placeholder={`Invitee ${index + 1}`}
                                            required
                                          />
                                          <Button
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300 px-2"
                                            onClick={() =>
                                              handleRemoveInvite(index)
                                            }
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      ))}
                                      {invites.length < teamSize - 1 && (
                                        <Button
                                          type="button"
                                          variant="link"
                                          onClick={handleAddInvite}
                                          className="text-blue-400 hover:text-blue-300 text-sm px-0"
                                        >
                                          + Invite More
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowRegisterModal(false)}
                                  className="border-gray-600 text-gray-300 bg-transparent"
                                >
                                  Cancel
                                </Button>
                                <Button
                                className="w-20 text-white bg-blue-600 hover:bg-blue-700"
                                onClick={handleRegister}
                                disabled={isRegistering}
                              >
                                {isRegistering ? (
                                  <Loader2  className="h-4 w-4 animate-spin" />
                                ) : "Register"}
                              </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Spectate
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {loadingOngoing &&
              Array.from({ length: 2 }).map((_, i) => (
                <div className="w-full rounded-lg border bg-gray-800/50 border-gray-700 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-20" /> {/* For "OB" */}
        <Skeleton className="h-6 w-20 rounded-full" /> {/* For "Medium" badge */}
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" /> {/* For clock icon */}
          <Skeleton className="h-5 w-24" /> {/* For "Ends in 42m" */}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" /> {/* For users icon */}
          <Skeleton className="h-5 w-28" /> {/* For "0 Participants" */}
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-12 flex-1 rounded-md" /> {/* For "Register" button */}
        <Skeleton className="h-12 flex-1 rounded-md" /> {/* For "Spectate" button */}
      </div>
    </div>
              ))}
            
          </div>
        </section>

        {/* Past Battles */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Past Battles</h2>
          </div>
          {!loadingPast && pastBattles?.length === 0 && (
              <div className="text-center">
                <div className="text-slate-400 text-lg mb-2">
                  No past battles
                </div>
              </div>
            )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastBattles?.map((battle) => (
              <Card
                key={battle.id}
                className="bg-gray-800/30 border-gray-700 backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">
                    {battle.title}
                  </CardTitle>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Ended {formatTimeAgo(battle.endTime)}</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {battle.teamCount}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Winner:</span>
                    <div className="flex items-center gap-2">
                      {battle.winner && battle.winner !== "TBD" ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${battle.winner}`}
                            />
                            <AvatarFallback className="text-xs">
                              {battle.winner[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-yellow-400 font-medium">
                            {battle.winner}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500">TBD</span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      navigate(`/battle/leaderboard/${battle.id}`)
                    }
                    variant="ghost"
                    className="w-full text-gray-300 hover:bg-gray-700"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    View Leaderboard
                  </Button>
                </CardContent>
              </Card>
            ))}
            {loadingPast &&
              Array.from({ length: 3 }).map((_, i) => (
                <div className="w-full max-w-sm rounded-lg border border-gray-700 bg-gray-800/50 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-20" /> {/* For "rsg" */}
      </div>
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-5 w-32" /> {/* For "Ended 15h ago" */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" /> {/* For users icon */}
          <Skeleton className="h-5 w-8" /> {/* For "1" participant count */}
        </div>
      </div>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-5 w-20" /> {/* For "Winner:" label */}
        <Skeleton className="h-5 w-16" /> {/* For "TBD" or winner name */}
      </div>
      <Skeleton className="h-12 w-full rounded-md" /> {/* For "View Leaderboard" button */}
    </div>
              ))}
          </div>
        </section>

        {/* Team Details Modal */}
        <Dialog open={showTeamDetails} onOpenChange={setShowTeamDetails}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Team Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedTeam?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Team Members</h4>
                <div className="space-y-2">
                  {selectedTeam?.members?.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-gray-800 rounded"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`}
                        />
                        <AvatarFallback>
                          {member.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white">{member.username}</span>
                      {index === 0 && (
                        <Badge className="bg-blue-600">You</Badge>
                      )}
                      {selectedTeam.leader?.username === member.username && (
                        <Badge
                          variant="outline"
                          className="border-yellow-600 text-yellow-400"
                        >
                          Leader
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTeamDetails(false)}
                  className="border-gray-600 text-gray-300 bg-slate-800/50 hover:bg-slate-800 transition-all"
                >
                  Close
                </Button>
                <Button className="text-gray-300 bg-blue-600 hover:bg-blue-700">
                  Manage Team
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CodeBattlePage;
