import Image from "next/image";
import NavHeader from "./NavHeader";
import ProfilePicture from "../profile/ProfilePicture";

export default function Header() {
  return (
    <header className="flex flex-row justify-between items-center gap-4 p-4">
      <div className="flex-1">
        <Image
          src="/aquaventure.svg"
          alt="Aquaventure"
          width={150}
          height={50}
        />
      </div>
      <NavHeader />
      <div className="flex-1 flex justify-end">
        <ProfilePicture />
      </div>
    </header>
  );
}
