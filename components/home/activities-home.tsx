import Image from "next/image";
import ActivitiesGrid from "../activities/activities-grid";

export default function ActivitiesHome() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 p-4 xl:p-10 relative">
      <Image
        src="/gradient_3.svg"
        alt="gradient"
        width={500}
        height={500}
        className="-z-10 absolute -top-1/3 left-0 h-full w-auto"
      />

      <h2>Nos activités</h2>
      <p className="text-center">
        Discover the beauty of the ocean and the wonders that lie beneath the
      </p>

      <div>
        <ActivitiesGrid />
      </div>
    </div>
  );
}
