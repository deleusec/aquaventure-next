import prisma from "@/lib/prisma"; 
import ActivityDetails from "@/components/activities/details"; 

async function getActivity(id: string) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(id) },
      include: { activityType: true },
    });
    return activity;
  } catch (error) {
    throw new Error("Erreur lors de la récupération de l'activité");
  }
}

export default async function ActivityPage({
  params,
}: {
  params: { id: string };
}) {
  const activity = await getActivity(params.id);

  if (!activity) {
    return (
      <div className="container py-8">
        <div className="text-red-500">Activité non trouvée</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <ActivityDetails activity={activity} />
    </div>
  );
}
