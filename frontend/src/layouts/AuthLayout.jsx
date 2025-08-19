import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

import React from "react";

const AuthLayout = () => {
  return (
    <>
      <Navbar></Navbar>
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full">
          {/* Outlet to render nested routes */}
          <Outlet />
        </div>
      </div>
      <Footer></Footer>
    </>
  );
};

export default AuthLayout;
