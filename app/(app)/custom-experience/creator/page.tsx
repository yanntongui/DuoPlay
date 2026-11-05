import { CustomExperienceCreator } from "@/components/custom-experience/creator";

export const metadata = { title: "Créateur · DuoPlay" };

export default function CreatorPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <CustomExperienceCreator />
    </div>
  );
}
