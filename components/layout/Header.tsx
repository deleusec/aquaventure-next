import NavHeader from "./nav-header";
import ProfilePicture from "../profile/profile-picture";
import LogoHeader from "./logo-header";

export default function Header() {
  return (
    <header className="flex flex-row justify-between items-center gap-4 p-4">
      <LogoHeader />
      <NavHeader />
      <ProfilePicture />
    </header>
  );
}
