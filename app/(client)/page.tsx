import ActivitiesHome from "@/components/home/activities-home";
import DiscoverHome from "@/components/home/discover-home";
import HeaderHome from "@/components/home/header-home";

export default function Home() {
  return (
    <>
      <HeaderHome />
      <DiscoverHome />
      <ActivitiesHome />
    </>
  );
}
