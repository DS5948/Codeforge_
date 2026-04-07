import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ListRooms from "./components/ListRooms/ListRooms";
import JoinedRooms from "./pages/JoinedRooms";
import Layout from "./components/Layout/Layout";
import LandingPage from "./pages/LandingPage";
import RoomContent from "./components/RoomContent/RoomContent";
import { useQuery } from "@tanstack/react-query";
import Loader from "@mui/material/CircularProgress";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import ListBattleRooms from "./pages/battle/ListBattleRooms";
import BattleRoom from "./pages/battle/BattleRoom";
import BattleHistory from "./pages/battle/BattleHistory";
import CodeBattlePage from "./pages/battle/CodeBattlePage";
import LeaderboardPage from "./pages/battle/LeaderboardPage";
import TeamPage from "./pages/battle/TeamPage";
import LoadingAnimation from "./components/LoadingAnimation/LoadingAnimation";
import NotFound from "./pages/NotFound";
import OtpPage from "./pages/OtpPage";

const App = () => {
  const API_URL = import.meta.env.VITE_API_URL;
const { data: authUser, isLoading } = useQuery({
  queryKey: ["authUser"],
  queryFn: async () => {
    console.log("Fetching authenticated user...");

    const res = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
    });    
    
    if (res.status === 401 || res.status === 403) {
      return null;
    }
    console.log("Response: ", res);
    
    const data = await res.json();
    console.log("data: ", data);
    
    if (!res.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    return data;
  },

  retry: false,

  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
});
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingAnimation />
      </div>
    );
  }
  return (
    <div className="App">
      <Routes>
        {/* 👇 Root route shows landing page for everyone */}
        <Route path="/" element={<LandingPage />} />

        {/* 👇 Redirect if already logged in and visiting login or signup */}
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/home" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/home" />}
        />
        <Route path="/verify-otp" element={!authUser? <OtpPage /> : <Navigate to="/" />} />
        {/* 👇 Authenticated routes inside Layout */}
        <Route path="/" element={<Layout />}>
          <Route
            path="home"
            element={authUser ? <HomePage /> : <Navigate to="/" />}
          />
          <Route
            path="list-rooms"
            element={authUser ? <ListRooms /> : <Navigate to="/" />}
          />
          <Route path="joined-rooms" element={<JoinedRooms />} />
          <Route path="room/:roomId" element={<RoomContent />} />
          <Route path="battle/list" element={<ListBattleRooms />} />
          <Route path="battle/history" element={<BattleHistory />} />
          <Route path="code-battle" element={authUser ? <CodeBattlePage /> : <Navigate to="/" />} />
          <Route
            path="battle/leaderboard/:battleId"
            element={<LeaderboardPage />}
          />
          <Route path="battle/team/:teamId" element={<TeamPage />} />
        </Route>

        {/* 👇 Outside Layout */}
        <Route path="/code-battle/:roomId" element={<BattleRoom />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
