"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { LogOutIcon } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function ProfilePicture() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, loading, initializeUser } = useUser();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const profileImage = user?.media?.[0]?.url || "/blank-profile-picture.png";

  useEffect(() => {
    initializeUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 flex items-center justify-end relative">
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-secondary hover:border-primary transition duration-300 cursor-pointer">
            {!loading ? (
              profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile picture"
                  width={40}
                  height={40}
                  loading="lazy"
                  className="object-cover w-full h-full"
                />
              ) : (
                <Image
                  src="/blank-profile-picture.png"
                  alt="Default profile picture"
                  width={40}
                  height={40}
                  loading="lazy"
                  className="object-cover w-full h-full"
                />
              )
            ) : (
              <div className="w-full h-full bg-gray-200 animate-pulse" />
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="absolute right-0">
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            Profile
          </DropdownMenuItem>
          {user?.role === "ADMIN" && (
            <DropdownMenuItem onClick={() => router.push("/admin")}>
              Admin
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            color="danger"
            className="text-destructive"
            onClick={handleLogout}
          >
            <LogOutIcon className="w-5 h-5" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
