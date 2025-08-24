import React from "react";
import Add from "../../../public/assets/images/add.png";

const AddNewSong = () => {
  return (
    <div className="ml-[63px] mr-[63px]">
      <h1 className="mt-[55px] font-extrabold text-[55px]">Add New Song </h1>

      <form className="mt-[40px] flex items-center justify-center flex-col w-full">
        <div className="w-full max-w-[764px]">
          <p className="text-[17px] font-semibold text-white mt-[32px] mb-[12px]">
            Song name :
          </p>
          <input
            type="text"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
            placeholder="Type your name  here "
          />
        </div>

        <div className="w-full max-w-[764px]">
          <p className="text-[17px] font-semibold text-white mt-[32px] mb-[12px]">
            Views :
          </p>
          <input
            type="text"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
            placeholder="Type your desription  here "
          />
        </div>

        <div className="w-full max-w-[764px]">
          <p className="text-[17px] font-semibold text-white mt-[32px] mb-[12px]">
            Credits :
          </p>
          <input
            type="text"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
            placeholder="Type here "
          />
        </div>

        <div className="w-full max-w-[764px]">
          <p className="text-[17px] font-semibold text-white mt-[32px] mb-[12px]">
            Time :
          </p>
          <input
            type="text"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
            placeholder="Add your link here"
          />
        </div>
        <div className="w-full max-w-[764px]">
          <p className="text-[17px] font-semibold text-white mt-[32px] mb-[12px]">
            Proof :
          </p>
          <input
            type="text"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
            placeholder="Add your link here"
          />
        </div>

        <div className="flex flex-col gap-[12px] mt-[36px] w-full max-w-[764px]">
          <p className="text-[17px] font-semibold text-white">Audio file :</p>

          <div className="w-full min-h-[290px] p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors flex items-center justify-center">
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

        <button className="w-[374px] mx-auto mt-[60px] bg-cyan-400 text-gray-900 rounded-full py-3 font-semibold hover:bg-cyan-300 transition-colors">
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
              <th className="pb-[14px] text-[15px] font-semibold">SONG NAME</th>
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

export default AddNewSong;
