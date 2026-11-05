import { SoireeLanding } from "@/components/soiree/soiree-landing";

export const metadata = { title: "Soirée DuoPlay" };

export default function SoireePage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <SoireeLanding />
    </div>
  );
}
