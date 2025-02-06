import ActivitiesGrid from "../activities/activities-grid";

export default function ActivitiesHome() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 p-4 xl:p-10">
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
