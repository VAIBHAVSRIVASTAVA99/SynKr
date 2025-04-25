import React from "react";
import { useNavigate } from "react-router-dom";
import MyImage from "../components/img.png";
import MyImage3 from "../components/image3.png";
import MyImage4 from "../components/image4.png";
import MyImage2 from "../components/circle-removebg-preview.png";

const Homemain = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="relative h-screen z-0 bg-gray-900">
        <div className="absolute mx-auto flex max-w-sm top-40 left-40 items-center gap-x-10 rounded-xl bg-gray-700 pt-3 shadow-lg">
          <div>
            <div className="text-center text-s text-cyan-400 pr-4 pl-4 pb-4">
              Private messaging Platform
            </div>
          </div>
        </div>

        <div className="absolute mx-auto flex flex-col top-60 left-40">
          <div className="text-5xl mt-2 text-indigo-400 font-bold">Say Hi!</div>
          <div className="text-3xl mt-3 text-cyan-400 font-bold">TO YOUR</div>
          <div className="text-3xl font-bold text-emerald-400 mt-2">
            Family & Friends
          </div>

          <div className="text-s text-gray-300 mt-4">
            <div className="absolute mx-auto flex flex-col">
              <p>Rich, interactive messaging to</p>
              <p> share precious moments while ensuring privacy.</p>
            </div>
          </div>
          <div className="mx-auto flex max-w-xs items-center gap-x-10 rounded-xl  mt-40 p-2 shadow-lg">
            <button
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-lg font-medium text-white"
              onClick={() => navigate("/home")}
            >
              GET STARTED
            </button>
          </div>
        </div>
        <div className="absolute top-20 right-40">
          <div className="relative z-0 bg-gray-900">
            <div className="absolute mx-auto flex max-w-sm top-50 left-0 items-center gap-x-10 rounded-xl bg-blue-800 pt-4 shadow-lg">
              <div>
                <div className="text-center text-s text-cyan-400 pr-2 pl-2 pb-2">
                  I'd rather listen to a podcast, watch football, watch a movie
                </div>
              </div>
            </div>
            <img src={MyImage} alt="Messaging Illustration" />
            <div className="relative z-0 bg-gray-900">
              <div className="absolute mx-auto flex max-w-sm top-50 left-0 items-center gap-x-10 rounded-xl bg-blue-800 pt-3 pb-2 pl-1 pr-1 shadow-lg">
                <div className="flex flex-row">
                  <img
                    src={MyImage2}
                    width={50}
                    height={50}
                    pb-3
                    alt="Messaging Illustration"
                  />
                  <div className="text-center text-s text-indigo-400 font-bold pr-4 pl-4 pb-2">
                    JJ
                    <p className="text-gray-300">Hello Joe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative min-h-screen bg-gray-900 flex justify-around items-center p-2">
        <div className="bg-gray-900 p-6 rounded-lg w-full max-w-5xl mb-10">
          <div className="flex justify-between items-start gap-x-20">
            <div className="flex flex-col text-gray-300 w-3/5">
              <div className="text-2xl">
                <h1>With private messaging you can be yourself, speak</h1>
                <h1>freely and feel close to the most</h1>
                <h1>important people in your life</h1>
                <h1>no matter where they are</h1>
              </div>

              <div className="relative mt-5 top-12">
                <div className="rounded-xl flex items-center bg-gray-900 p-3 shadow-lg w-fit border-l-2 border-emerald-500">
                  <img src={MyImage2} width={50} height={50} alt="User Icon" />
                  <div className="text-indigo-400 font-bold px-4">
                    JJ
                    <p className="text-sm text-gray-300">Hello Joe</p>
                  </div>
                </div>

                <div className="absolute top-12 right-10 rounded-xl p-3">
                  <img
                    src={MyImage3}
                    width={270}
                    height={270}
                    alt="User Icon"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-row">
              <img src={MyImage4} width={450} height={450} alt="Messaging Illustration" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 p-6 w-full text-center rounded-lg">
        <div className="flex justify-around">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-indigo-400 mb-4">
              Enormous acceptance
            </h2>
            <h2 className="text-xl font-semibold text-indigo-400 mb-4">
              from users
            </h2>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-cyan-400">10+</h3>
            <p className="text-gray-300">People Interacted</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-cyan-400">99%</h3>
            <p className="text-gray-300">Positive Feedback</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homemain;