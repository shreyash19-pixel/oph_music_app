import { useLocation, useNavigate } from "react-router-dom";
import successIcon from "../../../../../public/assets/success.svg";
import React,{ useEffect } from "react";
import PrimaryBtn from "./PrimaryBtn";

const SuccessScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { heading, btnText, redirectTo } = location.state || {};

  const handleButtonClick = () => {
    if(btnText && btnText != ""){
    navigate(redirectTo );
  };
}
  return (
    <div className="w-full h-[calc(100vh-70px)] flex items-center justify-center mx-auto text-white">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="rounded-full w-32 h-32 flex items-center justify-center mb-4">
          <img src={successIcon} alt="Success" />
        </div>
        <h2 className="text-4xl font-bold mb-8">{heading || "Success!"}</h2>
        {btnText && btnText != "" && <PrimaryBtn onClick={handleButtonClick}>
          {btnText }
        </PrimaryBtn>}
      </div>

    </div>
  );
};

export default SuccessScreen;
