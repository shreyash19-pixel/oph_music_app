import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SignUpForm from "./components/SignUpForm";


function SignUp() {

  return (
    <div>
      <SignUpForm />
    </div>
  );
}

export default SignUp;
