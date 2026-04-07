import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL;

const LeaderboardPage = () => {
  const { battleId } = useParams();

  const { data: leaderboardData, isLoading, error } = useQuery({
    queryKey: ["leaderboard", battleId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/battle/leaderboard/${battleId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch leaderboard");
      return data;
    },
    enabled: !!battleId,
  });

  if (isLoading) {
    return <div className="text-white text-center py-10">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">Error: {error.message}</div>;
  }

  const topThree = leaderboardData?.leaderboard?.slice(0, 3);
  const rest = leaderboardData?.leaderboard?.slice(3);

  const getDisplayName = (entry) => entry.teamName || entry.userName || "Unknown";

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-6 py-10 font-sans">
      <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center">
        🏆 Leaderboard ({leaderboardData?.battleName})
      </h1>

      {/* Top 3 Summary */}
      <div className="flex justify-center items-end gap-6 mb-10">
        {topThree?.[1] && (
          <div className="bg-[#111827] rounded-xl w-44 text-center px-4 py-6 transform translate-y-8 shadow-md">
            <h3 className="text-white text-sm font-medium mb-1">{getDisplayName(topThree[1])}</h3>
            <div className="bg-[#333845] text-gray-300 text-xs py-1 px-2 rounded mb-1">🥈 2nd Place</div>
            <p className="text-gray-400 text-xs">Solved: {topThree[1].problemsSolved}</p>
            <p className="text-blue-400 font-semibold text-sm mt-1">Score: {topThree[1].score}</p>
          </div>
        )}
        {topThree?.[0] && (
          <div className="bg-gradient-to-b from-[#3d3d58] to-[#1c1f26] rounded-xl w-52 text-center px-4 py-8 transform -translate-y-2 shadow-xl scale-105">
            <h3 className="text-white text-base font-semibold mb-2">{getDisplayName(topThree[0])}</h3>
            <div className="bg-yellow-500 text-black text-xs py-1 px-2 rounded mb-1 inline-block">🥇 1st Place</div>
            <p className="text-gray-300 text-sm">Solved: {topThree[0].problemsSolved}</p>
            <p className="text-blue-400 font-bold text-lg mt-1">Score: {topThree[0].score}</p>
          </div>
        )}
        {topThree?.[2] && (
          <div className="bg-[#111827] rounded-xl w-44 text-center px-4 py-6 transform translate-y-12 shadow-md">
            <h3 className="text-white text-sm font-medium mb-1">{getDisplayName(topThree[2])}</h3>
            <div className="bg-[#333845] text-gray-300 text-xs py-1 px-2 rounded mb-1">🥉 3rd Place</div>
            <p className="text-gray-400 text-xs">Solved: {topThree[2].problemsSolved}</p>
            <p className="text-blue-400 font-semibold text-sm mt-1">Score: {topThree[2].score}</p>
          </div>
        )}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-[#111827] rounded-lg overflow-hidden shadow-md">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1f2937] text-gray-300 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Team/User</th>
              <th className="py-3 px-4">Solved</th>
              <th className="py-3 px-4">Score</th>
            </tr>
          </thead>
          <tbody>
            {rest?.map((entry, index) => (
              <tr
                key={entry.teamName || entry.userName || index}
                className="border-b border-gray-800 hover:bg-gray-800 transition"
              >
                <td className="py-3 px-4">{index + 4}</td>
                <td className="py-3 px-4">{getDisplayName(entry)}</td>
                <td className="py-3 px-4">{entry.problemsSolved}</td>
                <td className="py-3 px-4">{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
