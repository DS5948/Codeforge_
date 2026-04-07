import React from "react";

const Avatar = ({ name, isActive }) => {
  const getInitials = (fullName) => {
    if (!fullName) return "";

    const nameParts = fullName.trim().split(" ");
    const firstInitial = nameParts[0]?.[0]?.toUpperCase() || "";
    const lastInitial =
      nameParts.length > 1
        ? nameParts[nameParts.length - 1][0]?.toUpperCase()
        : "";

    return `${firstInitial}${lastInitial}`;
  };

  const initials = getInitials(name);

  return (
    <div className="relative inline-block">
      {/* Avatar */}
      <div
        className="flex items-center justify-center w-10 h-10 cursor-default rounded-full bg-purple-600 text-white text-xl font-semibold"
        title={name}
      >
        {initials}
      </div>

      {/* Status Dot */}
      {/* <span
        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
          isActive ? "bg-green-500" : "bg-red-500"
        }`}
        title={isActive ? "Active" : "Inactive"}
      ></span> */}
    </div>
  );
};

export default Avatar;
