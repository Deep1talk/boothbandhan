"use client";

import { useState } from "react";
import axios from "axios";
import { LogOut, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toastAlert } from "@/lib/toastAlert";
import { WEBSITE_LOGIN } from "@/routes/websiteRoutes";
import { logout } from "@/store/reducer/authReducer";
import { persistor } from "@/store/store";

export default function LogoutButton({
  className = "",
  label = "Logout",
}) {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post("/api/auth/logout");

      dispatch(logout());
      await persistor.purge();

      toastAlert("success", data?.message || "Logout successful");
      router.replace(WEBSITE_LOGIN);
      router.refresh();
    } catch (error) {
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Logout failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/90 px-4 text-sm font-medium text-foreground shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          Logging out...
        </>
      ) : (
        <>
          <LogOut className="size-4" />
          {label}
        </>
      )}
    </button>
  );
}
