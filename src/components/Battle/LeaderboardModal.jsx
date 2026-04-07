// components/Battle/LeaderboardModal.jsx
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const LeaderboardModal = ({ visible, onClose, data = [] }) => {
  if (!visible) return null;

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogTitle className="text-lg font-bold mb-4">🏆 Leaderboard</DialogTitle>
        <div className="space-y-2">
          {data.leaderboard.length === 0 ? (
            <p>No submissions yet.</p>
          ) : (
            <table className="w-full text-sm text-left border">
              <thead className="bg-zinc-100 text-black">
                <tr>
                  <th className="p-2">Rank</th>
                  <th className="p-2">Team</th>
                  <th className="p-2">Score</th>
                  <th className="p-2">Solved</th>
                </tr>
              </thead>
              <tbody>
                {data.leaderboard.map((team, index) => (
                  <tr key={team._id} className="border-t">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{team.teamName}</td>
                    <td className="p-2">{team.score}</td>
                    <td className="p-2">{team.problemsSolved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardModal;
