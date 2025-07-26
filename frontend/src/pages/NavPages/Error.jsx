import { useNavigate } from "react-router-dom"
import React from "react";


export default function Error(){
  const navigate = useNavigate();
    return(
        <>
         <div className="text-center flex flex-col justify-center items-center h-[80vh] w-full ">
           <h1 className="text-3xl">ERROR 404 PAGE NOT FOUND</h1>
           <button onClick={()=>{navigate('/')}}  className="px-5 py-2 bg-cyan-400 text-black mt-4 rounded-full">Go Back</button>
         </div>
        </>
    )
}