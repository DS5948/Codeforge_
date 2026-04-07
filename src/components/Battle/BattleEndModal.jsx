import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BattleEndModal = ({ visible, onClose, roomId }) => {
  const navigate = useNavigate();

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-600">
            🏁 Battle Ended!
          </DialogTitle>
        </DialogHeader>
        <p className="text-gray-500 my-4">Time's up. Great job!</p>
        <div className="flex gap-4 justify-center mt-4">
          <Button
            className="bg-blue-600 text-white"
            onClick={() => navigate(`/battle/leaderboard/${roomId}`)}
          >
            Show Leaderboard
          </Button>
          <Button
            className="bg-gray-600 text-white"
            onClick={() => navigate("/code-battle")}
          >
            Go Home
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BattleEndModal;
