import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL;

const fetchTeamDetails = async (teamId) => {
  const res = await fetch(`${API_URL}/team/${teamId}`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch team details");
  return data;
};

const TeamPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const {
    data: team,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => fetchTeamDetails(teamId),
  });

  if (isLoading) return <div className="text-white p-6">Loading...</div>;
  if (isError)
    return <div className="text-red-400 p-6">Error: {error.message}</div>;

  return (
    <div className="min-h-screen px-6 py-10 bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Team: {team.name}</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Battle</h2>
          <p className="text-gray-300">
            {team.battle?.title} ({team.battle?.mode}) — Starts on: {" "}
            {new Date(team.battle?.startTime).toLocaleString()}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Leader</h2>
          <p className="text-gray-300">
            {team.leader?.username} ({team.leader?.email})
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Members</h2>
          <ul className="list-disc list-inside text-gray-300">
            {team.members.map((member) => (
              <li key={member._id}>{member.username} ({member.email})</li>
            ))}
          </ul>
        </section>

        {team.invited?.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Invited Members</h2>
            <ul className="list-disc list-inside text-gray-400">
              {team.invited.map((invite, idx) => (
                <li key={idx}>
                  {invite.email} — Status: {invite.status}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;