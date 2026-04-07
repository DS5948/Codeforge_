import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Code2,
  Plus,
  Users,
  Zap,
  UserPlus,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Crown,
  Mic,
  Loader2,
  ChartNoAxesCombined,
} from "lucide-react";
import Avatar from "@/components/Avatar/Avatar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const fetchRecentRooms = async () => {
  const res = await fetch(`${API_URL}/room/recent`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch recent rooms");
  return res.json();
};

const fetchBattleStats = async () => {
  const res = await fetch(`${API_URL}/battle/stats`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch battle stats");
  const data = await res.json();

  return data;
};

const joinRoom = async ({ roomId, password }) => {
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

const HomePage = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [joinPassword, setJoinPassword] = useState("");
  const [selectedModeForStats, setSelectedModeForStats] = useState("solo");
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { data: recentRooms = [], isLoading: loadingRecentRooms } = useQuery({
    queryKey: ["recentRooms"],
    queryFn: fetchRecentRooms,
  });

  const { data: battleStats, isLoading: loadingStats } = useQuery({
    queryKey: ["battleStats"],
    queryFn: fetchBattleStats,
  });

  const { mutate: joinRoomMutation, isPending: isJoining } = useMutation({
    mutationFn: joinRoom,
    onSuccess: (room) => {
      navigate(`/room/${room.roomId}`);
      toast.success("Successfully joined the room!");
      setIsJoinModalOpen(false);
      setJoinPassword("");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleJoinRoom = (room) => {
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

  const stats = [
    {
      label: "Rooms Joined",
      value: `${authUser?.roomsJoined?.length}`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Total Battles",
      value: `${battleStats?.solo.totalBattles + battleStats?.team.totalBattles}`,
      icon: Zap,
      color: "text-purple-600",
    },
    {
      label: "Wins",
      value: `${battleStats?.solo.battlesWon + battleStats?.team.battlesWon}`,
      icon: Trophy,
      color: "text-green-600",
    },
    {
      label: "Leaderboard",
      value: `# —`,
      icon: ChartNoAxesCombined,
      color: "text-yellow-600",
    },
  ];

  const quickActions = [
    {
      label: "Join/Create Room",
      icon: Users,
      variant: "outline",
      url: "/list-rooms",
    },
    {
      label: "Start Code Battle",
      icon: Zap,
      variant: "outline",
      url: "/code-battle",
    },
    { label: "Invite Teammate", icon: UserPlus, variant: "default" },
  ];

  const winRate =
    battleStats && battleStats.totalBattles > 0
      ? Math.round((battleStats.wins / battleStats.totalBattles) * 100)
      : 0;

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {authUser?.username} 👋
            </h1>
            <p className="text-slate-400 mt-1">
              Ready to code and collaborate?
            </p>
          </div>
          <Avatar name={authUser?.username} />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border-slate-800 shadow-xl bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-200 hover:shadow-2xl"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-lg bg-slate-800/50 ${stat.color}`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-slate-800 shadow-xl bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={() => navigate(action.url)}
                  variant={action.variant}
                  className={`h-12 justify-start gap-3 font-medium ${
                    action.variant === "default"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Rooms + Battle Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-slate-800 shadow-xl bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Recent Rooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRecentRooms ? (
                  <div className="flex flex-wrap gap-10">
                    {Array(4)
                      .fill(0)
                      .map((_, idx) => (
                        <Card
                          key={idx}
                          className="w-80 bg-slate-800/50 border-gray-700 rounded-lg shadow-lg overflow-hidden"
                        >
                          <CardContent className="p-6 space-y-4">
                            {/* Title Skeleton */}
                            <div className="h-6 w-3/5 bg-gray-700 rounded animate-pulse" />

                            {/* Info Lines Skeleton */}
                            <div className="flex items-center space-x-4">
                              <div className="h-4 w-4 bg-gray-700 rounded-full animate-pulse" />
                              <div className="h-4 w-2/5 bg-gray-700 rounded animate-pulse" />
                              <div className="h-4 w-4 bg-gray-700 rounded-full animate-pulse" />
                              <div className="h-4 w-1/5 bg-gray-700 rounded animate-pulse" />
                            </div>

                            {/* Button Skeleton */}
                            <div className="h-10 w-full bg-gray-700 rounded-md animate-pulse" />
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentRooms.map((room, index) => (
                      <Card
                        key={index}
                        className="border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-200"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <h3 className="font-semibold text-white">
                              {room.roomName}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Joined {formatTimeAgo(room.lastActive)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {room.users.length} members
                              </div>
                            </div>
                          </div>

                          {room.users.includes(authUser?.username) ? (
                            <Button
                              disabled={isJoining}
                              onClick={() => handleEnterRoom(room.roomId)}
                              size="sm"
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              Enter
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleJoinRoom(room)}
                              disabled={isJoining}
                              size="sm"
                              variant="outline"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {isJoining &&
                              selectedRoom.roomId === room.roomId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Join"
                              )}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {!loadingRecentRooms && recentRooms.length == 0 && (
                  <div className="text-sm font-medium text-slate-400 text-center">
                    No rooms joined
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Battle Stats */}
          <div>
            <Card className="border-slate-800 shadow-xl bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Target className="h-5 w-5" />
                    <span>Battle Stats</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedModeForStats("solo");
                      }}
                      variant="outline"
                      className={`h-8 px-4 font-medium border-slate-700 ${selectedModeForStats == "solo" ? "bg-slate-800/50" : "bg-slate-900/50"} text-slate-200 hover:bg-slate-800 hover:text-white`}
                    >
                      Solo
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedModeForStats("team");
                      }}
                      variant="outline"
                      className={`h-8 px-4 font-medium border-slate-700 bg-transparent  ${selectedModeForStats == "team" ? "bg-slate-800/50" : "bg-slate-900/50"} text-slate-200 hover:bg-slate-800 hover:text-white`}
                    >
                      Team
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-400">
                      Total Battles
                    </span>
                    <span className="text-lg font-bold text-white">
                      {selectedModeForStats == "solo"
                        ? battleStats?.solo.totalBattles
                        : battleStats?.team.totalBattles}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-400">
                      Wins
                    </span>
                    <span className="text-lg font-bold text-green-400">
                      {selectedModeForStats == "solo"
                        ? battleStats?.solo.battlesWon
                        : battleStats?.team.battlesWon}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-400">
                      Win Rate
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">
                        {winRate}%
                      </span>
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <h4 className="text-sm font-medium text-white mb-3">
                    Achievements
                  </h4>
                  <div className="space-y-2 text-center">
                    <span className="text-sm font-medium text-slate-400">
                      No achievements
                    </span>
                    {/* <Badge
          variant="secondary"
          className="w-full justify-start gap-2 py-2 bg-slate-800/50 text-slate-200 border-slate-700"
        >
          <Crown className="h-3 w-3 text-yellow-400" />
          Top Coder
        </Badge>
        <Badge
          variant="secondary"
          className="w-full justify-start gap-2 py-2 bg-slate-800/50 text-slate-200 border-slate-700"
        >
          <Mic className="h-3 w-3 text-blue-400" />
          Voice Chat Enabled
        </Badge> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
