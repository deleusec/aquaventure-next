import ActivitiesList from "@/components/activities/activities-list";
import ActivityTypesList from "@/components/activities/activities-type-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ActivitiesAdmin() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Activités</h1>
      </div>

      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activities">Activités</TabsTrigger>
          <TabsTrigger value="types">Types d&apos;activités</TabsTrigger>
        </TabsList>
        <TabsContent value="activities" className="mt-6">
          <ActivitiesList />
        </TabsContent>
        <TabsContent value="types" className="mt-6">
          <ActivityTypesList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
