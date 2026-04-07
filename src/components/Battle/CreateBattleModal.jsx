// src/components/Battle/CreateBattleModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CreateBattleModal = ({ isOpen, onClose, onCreate, isLoading }) => {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [mode, setMode] = useState("solo");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(60); // 👈 default 60 minutes

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ title, startTime, mode, topic, duration: Number(duration) });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 text-white max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">🛠️ Create New Battle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block mb-1 text-sm">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 px-3 py-2 rounded text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Start Time</label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 px-3 py-2 rounded text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Duration (in minutes)</label>
            <input
              type="number"
              min="10"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 px-3 py-2 rounded text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 px-3 py-2 rounded text-sm"
            >
              <option value="solo">Solo</option>
              <option value="team">Team</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm">Topic</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 px-3 py-2 rounded text-sm"
            />
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-4">
            <DialogClose asChild>
              <button
                type="button"
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-sm rounded"
              >
                Cancel
              </button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBattleModal;
