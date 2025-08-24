import React from "react";
import Add from "../../../public/assets/images/add.png";
import Provide from "../../../public/assets/images/provide2.png";
import { NavLink, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const EPKManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="ml-[63px] mr-[63px]">
      <h1 className="mt-[55px] font-extrabold text-[55px]">EPK Management</h1>

      <form className="flex flex-col gap-[42px]">
        <div className="grid grid-cols-2 mt-[35px] gap-[54px]">
          <div className="flex flex-col">
            <div className="flex flex-col gap-[12px]">
              <p className="text-[17px] font-semibold text-white">Bio</p>

              <textarea
                className="w-full h-[150px]  w-full bg-gray-800/50 border rounded-lg border-gray-700 p-3 focus:outline-none focus:border-cyan-400"
                placeholder="Type your name  here"
              />
            </div>

            <div className="flex flex-col gap-[12px] mt-[36px]">
              <p className="text-[17px] font-semibold text-white">
                Bio video :
              </p>

              <div
                className="
                w-[100%]
                w-[100%] min-h-[290px] 
               p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors
                flex items-center justify-center 
                
                "
              >
                <div className="flex items-center flex-col gap-3">
                  <img src={Add} alt="Add" />
                  <p className="font-medium text-[#666B76] text-[21px]">
                    Upload Video File
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[17px] font-semibold text-white mt-[32px] mb-[12px]">
                Change Artist Story :
              </p>
              <input
                type="text"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
                placeholder="Type ypour story here"
              />
            </div>

            <div className="flex flex-col gap-[12px] mt-[36px]">
              <p className="text-[17px] font-semibold text-white">
                Artist Story video :
              </p>

              <div
                className="
                w-[100%]
                w-[100%] min-h-[290px] 
                p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors
                flex items-center justify-center 
                
                "
              >
                <div className="flex items-center flex-col gap-3">
                  <img src={Add} alt="Add" />
                  <p className="font-medium text-[#666B76] text-[21px]">
                    Upload Video File
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-[50px] flex items-center">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                className="w-[20px] h-[20px]"
              />
              <p className="ml-[33px] text-[20px] font-semibold text-white">
                Agree to terms and conditions{" "}
              </p>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-[43px]">
              <img
                src={Provide}
                className="w-32 h-32 rounded-full border-4 border-[#5DC9DE] object-cover"
              />

              <div className="flex flex-col gap-[17px]">
                <p className="text-white font-medium text-[35px]">
                  Your Profile Photo
                </p>
                <p className="text-white font-medium text-[20px]">
                  This image wil appear on your profile Upload a high qualty
                  image{" "}
                </p>
              </div>
            </div>

            <div
              className="
                w-[100%]
                w-[100%] min-h-[130px] 
                opacity-100
                p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors
                flex items-center justify-center 
                
                mt-[60px]
                "
            >
              <div className="flex items-center flex-col gap-3">
                <img src={Add} alt="Add" className="w-[24px]" />
                <p className="font-medium text-[#666B76] text-[15px]">
                  Upload Your File
                </p>
              </div>
            </div>
            <p className="text-white font-medium text-[40px] mt-[35px] mb-[25px]">
              Your Profile feed
            </p>

            <div className="flex flex-col gap-[12px]">
              <p className="text-[17px] font-semibold text-white">
                Change Your Images:
              </p>

              <div
                className="
                w-[100%]
                w-[100%] min-h-[290px] 
               p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors
                flex items-center justify-center 
                
                "
              >
                <div className="flex items-center flex-col gap-3">
                  <img src={Add} alt="Add" />
                  <p className="font-medium text-[#666B76] text-[21px]">
                    Upload Your File
                  </p>
                </div>
              </div>
            </div>

            <p className="text-white font-medium text-[35px] mt-[35px]">
              Add New Song
            </p>
            <Link
              to="/dashboard/add-new-song"
              className="bg-[#6F4FA0] text-white text-center px-[36px] py-[17px] rounded-[42px] mt-[30px] max-w-[300px] 
hover:bg-[#5A3F85] "
            >
              Add Your Song
            </Link>
          </div>
        </div>
        <button className="w-[374px] mx-auto bg-cyan-400 text-gray-900 rounded-full py-3 font-semibold hover:bg-cyan-300 transition-colors">
          SUBMIT
        </button>
      </form>

      <section>
        <h1 className="font-extrabold text-[55px] mt-[55px]">Status</h1>

        <table className="w-full border-collapse mt-[41px]">
          <thead>
            <tr className="border-b border-b-[#FFFFFF33] text-left">
              <th className="pb-[14px] text-[15px] font-semibold">DATE</th>
              <th className="pb-[14px] text-[15px] font-semibold">REQUEST</th>
              <th className="pb-[14px] text-[15px] font-semibold">STATUS</th>
              <th className="pb-[14px] text-[15px] font-semibold">REASON</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-[12px] font-bold text-[16px]">01/05/2000</td>
              <td className="py-[12px] font-bold text-[16px]">
                Picture update
              </td>
              <td className="py-[12px] font-bold text-[16px]">Denied</td>
              <td className="py-[12px] font-bold text-[16px]">
                Proof not found
              </td>
            </tr>

            <tr>
              <td className="py-[12px] font-bold text-[16px]">01/05/2000</td>
              <td className="py-[12px] font-bold text-[16px]">
                Picture update
              </td>
              <td className="py-[12px] font-bold text-[16px]">Denied</td>
              <td className="py-[12px] font-bold text-[16px]">
                Proof not found
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default EPKManagement;
