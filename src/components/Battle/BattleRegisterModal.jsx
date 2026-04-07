import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const BattleRegisterModal = ({ isOpen, onClose, onRegister, battleId }) => {
  const [mode, setMode] = useState("solo");
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState(2);
  const [invites, setInvites] = useState([""]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const registrationData = {
      battleId,
      mode,
      teamName: mode === "team" ? teamName : null,
      teamSize: mode === "team" ? teamSize : null,
      invitedMembers: mode === "team" ? invites : [],
    };
    onRegister(registrationData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 text-white max-w-md w-full">
        <DialogHeader className="flex flex-row items-center justify-between mb-2">
          <DialogTitle className="text-lg font-bold">
            🚀 Register for Code Battle
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Mode */}
          <div>
            <label className="block mb-1 text-sm font-medium">Battle Mode</label>
            <select
              className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-sm"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                if (e.target.value !== "team") {
                  setInvites([]);
                }
              }}
            >
              <option value="solo">Solo</option>
              <option value="team">Team</option>
            </select>
          </div>


          {/* Team Fields */}
          {mode === "team" && (
            <>
              <div>
                <label className="block mb-1 text-sm font-medium">Team Name</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-sm"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Team Size</label>
                <input
                  type="number"
                  min={2}
                  max={5}
                  value={teamSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setTeamSize(newSize);
                    if (invites.length > newSize - 1) {
                      setInvites(invites.slice(0, newSize - 1));
                    }
                  }}
                  className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Invite Teammates</label>
                <p className="text-xs text-gray-400 mb-2">
                  Enter emails or usernames of teammates. They will receive an invitation to join.
                </p>
                {invites.map((invite, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={invite}
                      onChange={(e) => handleInviteChange(index, e.target.value)}
                      className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-sm"
                      placeholder={`Invitee ${index + 1} email or username`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveInvite(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {invites.length < teamSize - 1 && (
                  <button
                    type="button"
                    onClick={handleAddInvite}
                    className="text-blue-400 hover:underline text-sm mt-1"
                  >
                    + Invite More
                  </button>
                )}
              </div>
            </>
          )}

          <DialogFooter className="mt-6 flex justify-end gap-4">
            <DialogClose asChild>
              <button
                type="button"
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-sm rounded"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              className="px-4 py-2 text-black bg-white hover:opacity-80 transition-all text-sm font-semibold rounded"
            >
              Register
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BattleRegisterModal;
