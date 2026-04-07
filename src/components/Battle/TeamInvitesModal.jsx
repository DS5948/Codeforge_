import React from "react";
import { Button } from "@/components/ui/button";

const TeamInvitesModal = ({ isOpen, onClose, invites, onAccept, onDecline }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-zinc-900 p-6 rounded-lg max-w-md w-full text-white">
        <h2 className="text-xl font-semibold mb-4">Pending Team Invites</h2>
        {invites.length === 0 ? (
          <p>No invites found.</p>
        ) : (
          invites.map((team) => (
            <div key={team._id} className="mb-4 border-b pb-2">
              <p>
                <strong>{team.name}</strong> — Battle:{" "}
                {team.battle?.title} by {team.leader?.username}
              </p>
              <div className="flex gap-2 mt-2">
                <Button onClick={() => onAccept(team._id)}>Accept</Button>
                <Button variant="ghost" onClick={() => onDecline(team._id)}>
                  Decline
                </Button>
              </div>
            </div>
          ))
        )}
        <Button className="mt-4 w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default TeamInvitesModal;
