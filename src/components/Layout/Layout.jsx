import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "../Sidebar/Sidebar";

const Layout = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // Track window width

    // Update windowWidth on resize
    useEffect(() => {
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  return (
    <Box sx={{ display: "flex",height:'100vh' }}>
      <Sidebar />
      <Box className={`${windowWidth < 768 ? 'ml-16' : ''} w-full`} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
