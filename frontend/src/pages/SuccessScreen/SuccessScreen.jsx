import { useLocation, useNavigate } from "react-router-dom";
import PrimaryBtn from "../../components/Button/PrimaryBtn";
import successIcon from "../../assets/images/success.svg";
import React,{ useEffect } from "react";

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
        <h2 className="px-[12px] text-center text-3xl md:text-4xl font-bold mb-8">{heading || "Success!"}</h2>
        {btnText && btnText != "" && <PrimaryBtn onClick={handleButtonClick}>
          {btnText }
        </PrimaryBtn>}
      </div>

    </div>
  );
};

export default SuccessScreen;
