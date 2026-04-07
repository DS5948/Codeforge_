// components/Battle/TeamDetailsModal.jsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const TeamDetailsModal = ({ isOpen, onClose, team }) => {
  if (!team) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white">
        <DialogHeader>
          <DialogTitle>Team: {team.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p>
            <strong>Battle:</strong> {team.battle?.title} ({team.battle?.mode})
          </p>
          <p>
            <strong>Leader:</strong> {team.leader?.username} ({team.leader?.email})
          </p>

          <div>
            <strong>Members:</strong>
            <ul className="list-disc list-inside text-sm ml-4">
              {team.members.map((member) => (
                <li key={member._id}>
                  {member.username} ({member.email})
                </li>
              ))}
            </ul>
          </div>

          {team.invited?.length > 0 && (
            <div>
              <strong>Invited Members:</strong>
              <ul className="list-disc list-inside text-sm ml-4 text-gray-400">
                {team.invited.map((invite, idx) => (
                  <li key={idx}>
                    {invite.email} — Status: {invite.status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamDetailsModal;
