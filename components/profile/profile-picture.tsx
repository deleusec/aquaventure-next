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

export default function ProfilePicture() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex-1 flex items-center justify-end relative">
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-secondary hover:border-primary transition duration-300 cursor-pointer">
            <Image
              src="/profile.jpg"
              alt="Profile picture"
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="absolute right-0">
            <DropdownMenuItem onClick={() => router.push("/profile")}>
                Profile
            </DropdownMenuItem>
            <DropdownMenuItem
            color="danger"
              onClick={handleLogout}
            >
              Logout
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
