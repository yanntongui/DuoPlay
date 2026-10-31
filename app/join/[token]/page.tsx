import { redirect } from "next/navigation";

/**
 * Un lien d'invitation peut arriver sous la forme /join/<token> (partage,
 * QR code). La salle de jeu vit sur /partie/<token> : on y redirige.
 */
export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  redirect(`/partie/${token}`);
}
