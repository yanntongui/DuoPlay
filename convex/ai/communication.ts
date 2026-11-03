/**
 * Assistant de communication (phase 1).
 *
 * Il aide à formuler une envie, une limite ou un besoin sans reproche, sans
 * prendre parti et sans stocker le message. Les propositions sont composées de
 * fragments rédigés : aucun modèle, donc aucun risque d'invention sur la
 * relation du couple.
 */

export type CommIntent =
  | "envie"
  | "limite"
  | "attention"
  | "malaise"
  | "desir"
  | "temps"
  | "experience";

export type CommTone =
  | "doux"
  | "direct"
  | "romantique"
  | "simple"
  | "humoristique"
  | "court"
  | "face-a-face";

export const COMM_INTENTS: {
  value: CommIntent;
  label: string;
  hint: string;
}[] = [
  { value: "envie", label: "Une envie", hint: "Partager ce qui vous ferait plaisir" },
  { value: "limite", label: "Une limite", hint: "Poser un cadre, sans se justifier" },
  { value: "attention", label: "Un besoin d’attention", hint: "Dire que l’autre vous manque" },
  { value: "malaise", label: "Un malaise", hint: "Mettre des mots, sans accuser" },
  { value: "desir", label: "Une différence de désir", hint: "En parler sans reproche" },
  { value: "temps", label: "Du temps à deux", hint: "Demander un moment sans pression" },
  { value: "experience", label: "Une proposition", hint: "Proposer une expérience ensemble" },
];

export const COMM_TONES: { value: CommTone; label: string }[] = [
  { value: "doux", label: "Doux" },
  { value: "direct", label: "Direct" },
  { value: "romantique", label: "Romantique" },
  { value: "simple", label: "Simple" },
  { value: "humoristique", label: "Humoristique" },
  { value: "court", label: "Court" },
  { value: "face-a-face", label: "Face à face" },
];

const BASE: Record<CommIntent, string> = {
  envie:
    "J’aimerais te partager quelque chose qui me ferait plaisir. Ce n’est pas une attente, juste une envie que j’avais envie de te dire.",
  limite:
    "J’ai besoin de poser une limite pour me sentir bien avec toi. Ce n’est pas contre toi : c’est important pour moi, et j’aimerais qu’on la respecte.",
  attention:
    "J’ai envie de passer un peu de temps avec toi, sans que ce soit une obligation. Tu me manques, et j’aimerais qu’on se retrouve quand ça nous convient à tous les deux.",
  malaise:
    "Il y a quelque chose que je n’arrive pas à dire facilement. Je ne cherche pas à te reprocher quoi que ce soit : j’aimerais juste qu’on en parle calmement.",
  desir:
    "Nos envies ne sont pas toujours au même rythme, et ce n’est la faute de personne. J’aimerais qu’on puisse en parler sans pression, et sans que l’un de nous se sente responsable.",
  temps:
    "J’aimerais qu’on puisse prendre un peu plus de temps pour nous retrouver ensemble. Ce n’est pas un reproche : tu me manques et j’aimerais créer davantage de moments à deux.",
  experience:
    "J’ai vu quelque chose qui m’a fait penser à nous. Si l’idée te parle, on pourrait la découvrir ensemble, et si elle ne te dit rien, on peut simplement en parler.",
};

const OPENERS: Record<CommTone, string> = {
  doux: "J’aimerais te dire quelque chose avec douceur.",
  direct: "Je vais te le dire simplement.",
  romantique: "Tu comptes beaucoup pour moi, alors j’avais envie de te le dire.",
  simple: "Petite chose à te dire.",
  humoristique: "Bon, je me lance, avec ma maladresse habituelle.",
  court: "",
  "face-a-face": "J’aimerais qu’on prenne un moment pour en parler, tous les deux.",
};

const CLOSERS: Record<CommTone, string> = {
  doux: "Prends le temps qu’il te faut pour me répondre. Je suis là.",
  direct: "Dis-moi ce que tu en penses, franchement.",
  romantique: "Je t’embrasse, et j’ai hâte de te retrouver.",
  simple: "Voilà. Rien de plus pour l’instant.",
  humoristique: "Promis, je n’ai pas préparé de discours.",
  court: "",
  "face-a-face": "On en parle quand tu veux, sans se presser.",
};

/** Adoucit ou raccourcit une proposition selon le ton choisi. */
export function draftCommunication(
  intent: CommIntent,
  tone: CommTone,
): string {
  let body = BASE[intent];

  if (tone === "court") {
    const short: Record<CommIntent, string> = {
      envie: "J’ai une envie à te partager, sans aucune attente.",
      limite: "J’ai une limite importante pour moi. J’aimerais qu’on la respecte.",
      attention: "Tu me manques. J’aimerais qu’on se retrouve un peu, quand ça vous va.",
      malaise: "J’ai quelque chose sur le cœur. J’aimerais qu’on en parle calmement.",
      desir: "Nos rythmes sont différents, et ce n’est la faute de personne. On en parle ?",
      temps: "J’aimerais qu’on prenne un peu plus de temps pour nous. Tu me manques.",
      experience: "J’ai une idée à te proposer. Si elle te dit, on la découvre ensemble.",
    };
    return short[intent];
  }

  if (tone === "humoristique") {
    body = `${body} Rien de dramatique, promis : je tiens juste à toi.`;
  }

  if (tone === "romantique") {
    body = `${body} Ce qui compte pour moi, c’est nous, et le temps qu’on prend.`;
  }

  if (tone === "direct") {
    body = body.replace(/J’aimerais qu’on puisse /, "Je veux qu’on ").replace(/J’aimerais /g, "Je veux ");
  }

  const opener = OPENERS[tone];
  const closer = CLOSERS[tone];
  return [opener, body, closer].filter(Boolean).join(" ");
}

/**
 * Reformulations locales utilisées par les boutons « Plus doux » et
 * « Plus direct » après la première proposition.
 */
export function softenMessage(message: string): string {
  return message
    .replace(/\bJe veux\b/g, "J’aimerais")
    .replace(/\bje veux\b/g, "j’aimerais")
    .replace(/\bTu dois\b/g, "J’aimerais que tu puisses")
    .replace(/\btu dois\b/g, "j’aimerais que tu puisses")
    .concat(" Rien ne presse : prends le temps qu’il te faut.");
}

export function directMessage(message: string): string {
  return message
    .replace(/\bJ’aimerais\b/g, "Je souhaite")
    .replace(/\bj’aimerais\b/g, "je souhaite")
    .replace(/Prends le temps qu’il te faut pour me répondre\.\s*/g, "")
    .concat(" Dis-moi simplement ce que tu en penses.");
}
