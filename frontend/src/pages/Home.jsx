import { signInWithPopup } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, googleProvider } from "../../utils/firebase";
import api from "../../utils/axios";
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { setUserdata } from "../redux/userSlice";
import SideBar from "../components/SideBar";
import ChatArea from "../components/ChatArea";
import Artifact from "../components/Artifact";

function Home() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [warming, setWarming] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const wakeService = async (url) => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 75000);

    try {
      await fetch(url, {
        method: "GET",
        mode: "no-cors",
        cache: "no-store",
        signal: controller.signal,
      });
    } catch (error) {
      console.log(`Warmup failed for ${url}`, error);
    } finally {
      clearTimeout(timeout);
    }
  };

  // Wake all 5 Render services when frontend opens
  useEffect(() => {
    const warmBackend = async () => {
      setWarming(true);

      const services = [
        "https://visionai-gateway-ctaq.onrender.com/",
        "https://visionai-auth.onrender.com/",
        "https://visionai-chat.onrender.com/",
        "https://visionai-agent.onrender.com/",
        "https://visionai-billing.onrender.com/",
      ];

      try {
        console.log("Starting VisionAI backend services...");

        await Promise.allSettled(
          services.map((url) => wakeService(url))
        );

        console.log("VisionAI backend warmup finished");
      } catch (error) {
        console.log("Warmup error:", error);
      } finally {
        setWarming(false);
      }
    };

    warmBackend();
  }, []);

  const handleLogin = async (token) => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { data } = await api.post("/api/auth/login", {
          token,
        });

        dispatch(setUserdata(data));

        return;
      } catch (error) {
        console.log(
          `Login attempt ${attempt} failed`,
          error
        );

        if (attempt === 3) {
          throw error;
        }

        await sleep(4000);
      }
    }
  };

  const googleLogin = async () => {
    try {
      setLoginLoading(true);

      const data = await signInWithPopup(
        auth,
        googleProvider
      );

      const token = await data.user.getIdToken();

      await handleLogin(token);
    } catch (error) {
      console.log("Google login error:", error);

      alert(
        "Login failed. Backend may still be starting. Please try again."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-[#0d0f14] text-white overflow-hidden">
      <SideBar />

      <ChatArea />

      <Artifact />

      {!userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
          <div className="w-[340px] bg-[#13151c] border border-white/[0.08] rounded-2xl p-7 flex flex-col gap-5">

            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-semibold text-slate-100 tracking-tight">
                Welcome to VisionAI
              </h2>

              <p className="text-[13px] text-slate-500">
                {warming
                  ? "Starting VisionAI servers. First load may take around 1 minute..."
                  : "Please login to continue using the app."}
              </p>
            </div>

            <button
              className="w-full flex items-center justify-center gap-3 py-[11px] rounded-xl text-sm font-medium text-black/90 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
              onClick={googleLogin}
              disabled={warming || loginLoading}
            >
              <FcGoogle size={15} />

              {warming
                ? "Starting VisionAI..."
                : loginLoading
                ? "Signing in..."
                : "Continue With Google"}
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

export default Home;