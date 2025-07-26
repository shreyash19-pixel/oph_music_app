import React from "react";

const PrimaryBtn = (props) => {
  const { onClick, children, className,type } = props;

  return (
    <button
      onClick={onClick}
      type={type}
      className={`bg-primary text-black font-medium py-2 px-4 min-w-[250px] rounded-full ${className}`}
    >
      {children}
    </button>
  );
};

export default PrimaryBtn;
