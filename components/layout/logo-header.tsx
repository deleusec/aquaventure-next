"use client";

import Image from "next/image";
import Link from "next/link";

export default function LogoHeader() {
  return (
    <Link className="flex-1" href="/" passHref aria-label="Aquaventure" title="Aquaventure">
      <Image src="/aquaventure.svg" alt="Aquaventure" width={150} height={50} />
    </Link>
  );
}
