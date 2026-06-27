import React from "react";
import Logo from "../../assets/images/logo.svg";
import Menu from "../../assets/images/Menu.svg";
import { useOutletContext } from "react-router-dom";

const NavbarLeft = () => {
  const { showNav, setShowNav } = useOutletContext();

  return (
    <div className="flex items-center justify-center gap-[30px] lg:hidden">
      <button onClick={() => setShowNav(!showNav)}>
        <img src={Menu} />
      </button>
      <img src={Logo} />
    </div>
  );
};

export default NavbarLeft;
