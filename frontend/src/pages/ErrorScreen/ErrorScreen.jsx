import { useLocation, useNavigate } from "react-router-dom";
import PrimaryBtn from "../../components/Button/PrimaryBtn";
import errorIcon from "../../../public/assets/images/error.svg";
import React, { useEffect } from "react";

const ErrorScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { heading, btnText, redirectTo } = location.state || {};

  const handleButtonClick = () => {
    if (btnText && btnText != "") {
      navigate(redirectTo, {
        state:{
          songName: location.state.songName
        }
      });
    }
  };
  return (
    <div className="w-full h-[calc(100vh-70px)] flex items-center justify-center mx-auto text-white">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="rounded-full w-32 h-32 flex items-center justify-center mb-4">
          <img src={errorIcon} alt="Error" />
        </div>
        <h2 className="text-[2rem] font-bold mb-6 text-center">{heading || "Error!"}</h2>

        {btnText && btnText != "" && (
          <PrimaryBtn onClick={handleButtonClick}>{btnText}</PrimaryBtn>
        )}
      </div>
    </div>
  );
};

export default ErrorScreen;
