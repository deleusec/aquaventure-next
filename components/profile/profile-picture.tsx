"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProfilePicture() {
  return (
    <Link href="/profile" passHref className="flex-1 flex justify-end items-center">
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition duration-300 cursor-pointer">
        <Image
          src="/profile.jpg"
          alt="Profile picture"
          width={40}
          height={40}
          className="object-cover w-full h-full"
        />
      </div>
    </Link>
  );
}
