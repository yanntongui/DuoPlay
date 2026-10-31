import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

const UNIVERSES = [
  { slug: "eclats-de-rire", title: "Éclats de rire", tagline: "Rire ensemble", description: "Des jeux légers pour s'amuser, rire et retrouver de la spontanéité.", emoji: "😄", accent: "coral" as const, order: 1, mvp: true },
  { slug: "coeur-a-coeur", title: "Cœur à cœur", tagline: "Mieux se comprendre", description: "Des expériences pour approfondir les échanges et se redécouvrir.", emoji: "💬", accent: "lavender" as const, order: 2, mvp: true },
  { slug: "flirt-et-etincelles", title: "Flirt & Étincelles", tagline: "Entretenir la tendresse", description: "Des jeux romantiques et non explicites pour raviver la séduction.", emoji: "💗", accent: "coral" as const, order: 3, mvp: true },
  { slug: "nos-souvenirs", title: "Nos souvenirs", tagline: "Célébrer son histoire", description: "Des jeux qui mettent en valeur l'histoire commune du couple.", emoji: "📸", accent: "lavender" as const, order: 4, mvp: true },
  { slug: "sortons-de-la-routine", title: "Sortons de la routine", tagline: "Passer à l'action", description: "Des défis qui transforment les jeux numériques en activités réelles.", emoji: "🌿", accent: "graphite" as const, order: 5, mvp: true },
  { slug: "notre-avenir", title: "Notre avenir", tagline: "Rêver à deux", description: "Des activités pour nourrir les projets et les rêves partagés.", emoji: "✨", accent: "lavender" as const, order: 6, mvp: true },
  { slug: "entre-nous", title: "Entre nous", tagline: "Complicité, romantisme, sensualité", description: "Des jeux complices, tendres et sensuels pour les couples adultes consentants.", emoji: "💞", accent: "coral" as const, order: 7, mvp: true },
];

const DEPTH_RANK = { leger: 1, moyen: 2, profond: 3 } as const;

export const list = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").withIndex("by_status", (q) => q.eq("status", "published")).collect();
    const experiences = (await ctx.db.query("experiences").collect()).filter((e) => e.status === "published");
    return categories.map((category) => {
      const own = experiences.filter((e) => e.categoryId === category._id);
      const minutes = own.map((e) => e.estimatedMinutes).filter((v) => v > 0);
      const durationMinutes = minutes.length ? Math.round(minutes.reduce((s, v) => s + v, 0) / minutes.length) : 10;
      const intensity = own.reduce<"leger" | "moyen" | "profond">((d, e) => DEPTH_RANK[e.depth] > DEPTH_RANK[d] ? e.depth : d, "leger");
      return { ...category, durationMinutes, intensity, experienceCount: own.length };
    });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("categories").collect();
    return all.sort((a, b) => a.order - b.order);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    let created = 0;
    let updated = 0;
    for (const universe of UNIVERSES) {
      const existing = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", universe.slug)).unique();
      if (existing) {
        await ctx.db.patch(existing._id, { title: universe.title, tagline: universe.tagline, description: universe.description, emoji: universe.emoji, accent: universe.accent, order: universe.order, mvp: universe.mvp, status: "published" });
        updated += 1;
      } else {
        await ctx.db.insert("categories", { ...universe, status: "published" });
        created += 1;
      }
    }
    return { created, updated };
  },
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", args.slug)).unique();
  },
});

export const adminUpsert = mutation({
  args: { adminKey: v.string(), id: v.optional(v.id("categories")), slug: v.string(), title: v.string(), tagline: v.string(), description: v.string(), emoji: v.string(), accent: v.union(v.literal("coral"), v.literal("lavender"), v.literal("graphite")), order: v.number(), mvp: v.boolean(), status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")) },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { adminKey: _adminKey, id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    const existing = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", args.slug)).unique();
    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }
    return await ctx.db.insert("categories", data);
  },
});

export const adminSetStatus = mutation({
  args: { adminKey: v.string(), id: v.id("categories"), status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")) },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const seedAllQuestions = mutation({
  args: {},
  handler: async (ctx) => {
    const exps = await ctx.db.query("experiences").collect();
    const cats = await ctx.db.query("categories").collect();
    const eclatsId = cats.find(c => c.slug === "eclats-de-rire")?._id;
    if (!eclatsId) throw new Error("eclats-de-rire category not found");
    const eclatsExp = exps.filter(e => e.categoryId === eclatsId);
    const expMap = new Map(eclatsExp.map(e => [e.slug, e._id]));
    
    // Delete existing eclats questions
    const existingQ = await ctx.db.query("questions").collect();
    for (const q of existingQ) {
      if (eclatsExp.some(e => e._id === q.experienceId)) {
        await ctx.db.delete(q._id);
      }
    }
    
    // Insert all questions (200+)
    const questions = [
      // qui-de-nous-deux (21)
      {e:"qui-de-nous-deux",k:"choice",p:"Qui de nous deux est le plus matinal ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["quotidien"],ord:1},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui oublie le plus souvent ses affaires ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["quotidien"],ord:2},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui est le plus susceptible de parler à un inconnu ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["personnalité"],ord:3},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui prend le plus de temps pour se préparer ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["quotidien"],ord:4},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui craque en premier devant une envie de sucré ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["quotidien"],ord:5},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui gagne le plus souvent quand vous êtes en désaccord ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["complicité"],ord:6},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui a le rire le plus contagieux ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["humour"],ord:7},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui est le plus susceptible de s'enfermer dans un placard ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["humour"],ord:8},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui fait le plus de fautes de frappe ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["quotidien"],ord:9},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui est le plus susceptible de s'endormir devant la télé ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["quotidien"],ord:10},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui est le plus susceptible d'acheter des vêtements trop grands ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["humour"],ord:11},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui est le plus susceptible de se perdre en voiture ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["quotidien"],ord:12},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui est le plus susceptible de faire la sieste ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["quotidien"],ord:13},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui est le plus susceptible de regarder la télé en mangeant ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["quotidien"],ord:14},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui est le plus susceptible de parler dans son sommeil ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["humour"],ord:15},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui est le plus susceptible de s'excuser même quand ce n'est pas de sa faute ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["personnalité"],ord:16},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui est le plus susceptible de chanter dans la douche ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["humour"],ord:17},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui est le plus susceptible de se plaindre d'avoir mal dormi ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["quotidien"],ord:18},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui est le plus susceptible de faire les magasins sans rien acheter ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["humour"],ord:19},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui est le plus susceptible de s'endormir sur le canapé ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["quotidien"],ord:20},
      {e:"qui-de-nous-deux",k:"choice",p:"Qui est le plus susceptible de faire des grimaces ?",o:["C'est moi","C'est toi","On se ressemble","Aucun des deux"],d:"leger",t:["humour"],ord:21},
      // devine-ma-reponse (21)
      {e:"devine-ma-reponse",k:"choice",p:"Si on partait demain sans préparer, où irais-tu ?",o:["La plage","La montagne","Une grande ville","Rien, j'aime être à la maison"],d:"leger",t:["humour"],ord:1},
      {e:"devine-ma-reponse",k:"choice",p:"Quel est ton petit plaisir coupable ?",o:["Manger du chocolat","Regarder des séries","Dormir jusqu'à midi","Écouter de la musique"],d:"leger",t:["humour"],ord:2},
      {e:"devine-ma-reponse",k:"choice",p:"Quel est le pire cadeau à te faire ?",o:["Un cadeau trop cher","Un cadeau trop petit","Un cadeau trop personnel","Un cadeau pas assez attentionné"],d:"leger",t:["humour"],ord:3},
      {e:"devine-ma-reponse",k:"open",p:"Quelle chanson te fait immédiatement danser ?",d:"leger",t:["humour"],ord:4},
      {e:"devine-ma-reponse",k:"open",p:"Quel est ton plus grand talent caché ?",d:"leger",t:["humour"],ord:5},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va répondre le plus vite ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:6},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va choisir la réponse la plus folle ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:7},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va répondre le plus sérieusement ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:8},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va inventer une réponse complètement absurde ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:9},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va essayer de piéger l'autre ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:10},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va donner la réponse la plus inattendue ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:11},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va essayer de deviner ce que l'autre va répondre ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:12},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va choisir la réponse la plus safe ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:13},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va avoir le meilleur timing ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:14},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va rire le plus fort de sa propre réponse ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:15},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va essayer d'imiter l'autre ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:16},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va surprendre l'autre ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:17},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va être le plus stratégique ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:18},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va choisir la réponse la plus mignonne ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:19},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va choisir la réponse la plus drôle ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:20},
      {e:"devine-ma-reponse",k:"choice",p:"Qui va rire le plus de l'histoire ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:21},
      // defis-rigolos (21)
      {e:"defis-rigolos",k:"challenge",p:"Fais une imitation de ton animal préféré pendant 30 secondes",d:"leger",t:["humour","jeu"],ord:1},
      {e:"defis-rigolos",k:"challenge",p:"Danse ta chanson préférée sans musique",d:"leger",t:["humour","jeu"],ord:2},
      {e:"defis-rigolos",k:"challenge",p:"Dis ton prénom avec l'accent de ton choix",d:"leger",t:["humour"],ord:3},
      {e:"defis-rigolos",k:"challenge",p:"Imite un robot pendant une minute",d:"leger",t:["humour","jeu"],ord:4},
      {e:"defis-rigolos",k:"choice",p:"Qui va réussir le mieux le défi ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:5},
      {e:"defis-rigolos",k:"choice",p:"Qui va rire le plus pendant le défi ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:6},
      {e:"defis-rigolos",k:"choice",p:"Qui va abandonner le premier ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:7},
      {e:"defis-rigolos",k:"challenge",p:"Fais rire l'autre en 30 secondes",d:"leger",t:["humour"],ord:8},
      {e:"defis-rigolos",k:"challenge",p:"Parle uniquement en questions pendant 1 minute",d:"leger",t:["humour","jeu"],ord:9},
      {e:"defis-rigolos",k:"challenge",p:"Crée un texte de rap sur place",d:"leger",t:["humour","jeu"],ord:10},
      {e:"defis-rigolos",k:"choice",p:"Qui est le meilleur comédien ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:11},
      {e:"defis-rigolos",k:"choice",p:"Qui a le rire le plus bizarre ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:12},
      {e:"defis-rigolos",k:"challenge",p:"Fais semblant de recevoir un appel téléphonique",d:"leger",t:["humour"],ord:13},
      {e:"defis-rigolos",k:"challenge",p:"Montre un mimétisme d'animal au choix",d:"leger",t:["humour","jeu"],ord:14},
      {e:"defis-rigolos",k:"choice",p:"Qui va faire la meilleure performance ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:15},
      {e:"defis-rigolos",k:"challenge",p:"Dis un discours de 30 secondes sur un sujet au hasard",d:"leger",t:["humour","jeu"],ord:16},
      {e:"defis-rigolos",k:"challenge",p:"Crée une nouvelle chanson avec n'importe quels mots",d:"leger",t:["humour"],ord:17},
      {e:"defis-rigolos",k:"choice",p:"Qui a le plus d'imagination ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:18},
      {e:"defis-rigolos",k:"choice",p:"Qui va choisir le prochain défi ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:19},
      {e:"defis-rigolos",k:"challenge",p:"Fais une statue vivante pendant 1 minute",d:"leger",t:["humour"],ord:20},
      {e:"defis-rigolos",k:"challenge",p:"Raconte une blague que personne n'a encore entendue",d:"leger",t:["humour"],ord:21},
      // fou-rire-garanti (21)
      {e:"fou-rire-garanti",k:"choice",p:"Quelle est la chose la plus drôle qui te soit arrivée ?",o:["Un accident de voiture","Une situation embarrassante","Une blague ratée","Une mauvaise interprétation"],d:"leger",t:["humour"],ord:1},
      {e:"fou-rire-garanti",k:"choice",p:"Quel est ton rire le plus contagieux ?",o:["Le mien","Celui de l'autre","On a le même rire"],d:"leger",t:["humour"],ord:2},
      {e:"fou-rire-garanti",k:"choice",p:"Quel est ton souvenir le plus drôle d'enfance ?",o:["Une dispute d'école","Un jeu d'extérieur","Une blague de famille","Une sortie scolaire"],d:"leger",t:["humour","souvenirs"],ord:3},
      {e:"fou-rire-garanti",k:"choice",p:"Quelle est la blague la plus mauvaise que tu connaisse ?",o:["Une blague de père","Une blague de copain","Une blague de télé","Une blague de livre"],d:"leger",t:["humour"],ord:4},
      {e:"fou-rire-garanti",k:"choice",p:"Quel est ton animal de prédilection ?",o:["Le chat","Le chien","Le lapin","Le poisson"],d:"leger",t:["humour"],ord:5},
      {e:"fou-rire-garanti",k:"choice",p:"Quelle est ta chose préférée à faire ?",o:["Lire","Regarder des séries","Jouer","Dormir"],d:"leger",t:["humour"],ord:6},
      {e:"fou-rire-garanti",k:"choice",p:"Quel est ton plat préféré ?",o:["La pizza","Les pâtes","Le sushi","Le fromage"],d:"leger",t:["humour"],ord:7},
      {e:"fou-rire-garanti",k:"choice",p:"Quelle est ta chanson préférée ?",o:["Une chanson pop","Une chanson rock","Une chanson classique","Une chanson d'opéra"],d:"leger",t:["humour"],ord:8},
      {e:"fou-rire-garanti",k:"choice",p:"Quel est ton film préféré ?",o:["Un film d'horreur","Un film d'animation","Un film d'action","Un film romantique"],d:"leger",t:["humour"],ord:9},
      {e:"fou-rire-garanti",k:"choice",p:"Quelle est ta boisson préférée ?",o:["L'eau","Le café","Le thé","Le jus de fruit"],d:"leger",t:["humour"],ord:10},
      {e:"fou-rire-garanti",k:"choice",p:"Quel est ton sport préféré ?",o:["Le football","Le tennis","La natation","Le vélo"],d:"leger",t:["humour"],ord:11},
      {e:"fou-rire-garanti",k:"choice",p:"Quelle est ta saison préférée ?",o:["Le printemps","L'été","L'automne","L'hiver"],d:"leger",t:["humour"],ord:12},
      {e:"fou-rire-garanti",k:"choice",p:"Quel est ton voyage préféré ?",o:["Un voyage à la plage","Un voyage à la montagne","Un voyage à la ville","Un voyage à la campagne"],d:"leger",t:["humour"],ord:13},
      {e:"fou-rire-garanti",k:"choice",p:"Quelle est ta couleur préférée ?",o:["Le bleu","Le vert","Le rouge","Le jaune"],d:"leger",t:["humour"],ord:14},
      {e:"fou-rire-garanti",k:"choice",p:"Quel est ton animal préféré ?",o:["Le lion","Le tigre","Le léopard","Le guépard"],d:"leger",t:["humour"],ord:15},
      {e:"fou-rire-garanti",k:"choice",p:"Quelle est ta franchise préférée ?",o:["Star Wars","Harry Potter","Marvel","DC"],d:"leger",t:["humour"],ord:16},
      {e:"fou-rire-garanti",k:"choice",p:"Quel est ton super-héros préféré ?",o:["Superman","Batman","Spiderman","Wonder Woman"],d:"leger",t:["humour"],ord:17},
      {e:"fou-rire-garanti",k:"choice",p:"Quelle est ta série préférée ?",o:["Stranger Things","Breaking Bad","Game of Thrones","Friends"],d:"leger",t:["humour"],ord:18},
      {e:"fou-rire-garanti",k:"choice",p:"Quel est ton jeu vidéo préféré ?",o:["Call of Duty","Fortnite","Mario","The Legend of Zelda"],d:"leger",t:["humour"],ord:19},
      {e:"fou-rire-garanti",k:"choice",p:"Quelle est ta musique préférée ?",o:["La pop","Le rock","L'hip-hop","Le jazz"],d:"leger",t:["humour"],ord:20},
      {e:"fou-rire-garanti",k:"choice",p:"Quel est ton moment préféré de la journée ?",o:["Le matin","L'après-midi","Le soir","La nuit"],d:"leger",t:["humour"],ord:21},
      // imitation-express (21)
      {e:"imitation-express",k:"challenge",p:"Imite le rire de ton partenaire",d:"leger",t:["humour"],ord:1},
      {e:"imitation-express",k:"challenge",p:"Imite l'accent de ton choix",d:"leger",t:["humour"],ord:2},
      {e:"imitation-express",k:"challenge",p:"Imite un animal pendant 30 secondes",d:"leger",t:["humour","jeu"],ord:3},
      {e:"imitation-express",k:"challenge",p:"Imite un personnage célèbre",d:"leger",t:["humour"],ord:4},
      {e:"imitation-express",k:"choice",p:"Qui va imiter le mieux ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:5},
      {e:"imitation-express",k:"challenge",p:"Imite un robot",d:"leger",t:["humour"],ord:6},
      {e:"imitation-express",k:"challenge",p:"Imite un singe",d:"leger",t:["humour"],ord:7},
      {e:"imitation-express",k:"challenge",p:"Imite un oiseau",d:"leger",t:["humour"],ord:8},
      {e:"imitation-express",k:"choice",p:"Qui a le talent d'imitation ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:9},
      {e:"imitation-express",k:"challenge",p:"Imite un film",d:"leger",t:["humour"],ord:10},
      {e:"imitation-express",k:"challenge",p:"Imite une chanson",d:"leger",t:["humour"],ord:11},
      {e:"imitation-express",k:"challenge",p:"Imite un métier",d:"leger",t:["humour"],ord:12},
      {e:"imitation-express",k:"choice",p:"Qui va faire la meilleure imitation ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:13},
      {e:"imitation-express",k:"challenge",p:"Imite un sport",d:"leger",t:["humour"],ord:14},
      {e:"imitation-express",k:"challenge",p:"Imite un instrument de musique",d:"leger",t:["humour"],ord:15},
      {e:"imitation-express",k:"choice",p:"Qui a le plus d'humour ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:16},
      {e:"imitation-express",k:"challenge",p:"Imite un objet",d:"leger",t:["humour"],ord:17},
      {e:"imitation-express",k:"challenge",p:"Imite un sentiment",d:"leger",t:["humour"],ord:18},
      {e:"imitation-express",k:"choice",p:"Qui va gagner ce défi ?",o:["C'est moi","C'est toi","On est pareils"],d:"leger",t:["humour"],ord:19},
      {e:"imitation-express",k:"challenge",p:"Imite une personne de la famille",d:"leger",t:["humour"],ord:20},
      {e:"imitation-express",k:"challenge",p:"Imite un souvenir",d:"leger",t:["humour"],ord:21},
      // aveux-rigolos (21)
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton péché mignon ?",o:["Manger du chocolat","Regarder des séries","Dormir","Acheter des vêtements"],d:"leger",t:["humour"],ord:1},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton vice secret ?",o:["Les chips","Les bonbons","La pizza","Les glaces"],d:"leger",t:["humour"],ord:2},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton plaisir coupable ?",o:["Les livres","Les films","Les jeux vidéo","Les réseaux sociaux"],d:"leger",t:["humour"],ord:3},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton moment préféré ?",o:["Le matin","L'après-midi","Le soir","La nuit"],d:"leger",t:["humour"],ord:4},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton activité préférée ?",o:["Lire","Regarder des séries","Jouer","Dormir"],d:"leger",t:["humour"],ord:5},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton souvenir préféré ?",o:["Un voyage","Un anniversaire","Une fête","Une sortie"],d:"leger",t:["humour"],ord:6},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton endroit préféré ?",o:["La plage","La montagne","La ville","La campagne"],d:"leger",t:["humour"],ord:7},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton objet préféré ?",o:["Un téléphone","Une voiture","Une maison","Un animal"],d:"leger",t:["humour"],ord:8},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton film préféré ?",o:["Un film d'horreur","Un film d'animation","Un film d'action","Un film romantique"],d:"leger",t:["humour"],ord:9},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton plat préféré ?",o:["La pizza","Les pâtes","Le sushi","Le fromage"],d:"leger",t:["humour"],ord:10},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton animal préféré ?",o:["Le lion","Le tigre","Le léopard","Le guépard"],d:"leger",t:["humour"],ord:11},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton sport préféré ?",o:["Le football","Le tennis","La natation","Le vélo"],d:"leger",t:["humour"],ord:12},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton voyage préféré ?",o:["Un voyage à la plage","Un voyage à la montagne","Un voyage à la ville","Un voyage à la campagne"],d:"leger",t:["humour"],ord:13},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton color préféré ?",o:["Le bleu","Le vert","Le rouge","Le jaune"],d:"leger",t:["humour"],ord:14},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton franchise préféré ?",o:["Star Wars","Harry Potter","Marvel","DC"],d:"leger",t:["humour"],ord:15},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton super-héros préféré ?",o:["Superman","Batman","Spiderman","Wonder Woman"],d:"leger",t:["humour"],ord:16},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton série préférée ?",o:["Stranger Things","Breaking Bad","Game of Thrones","Friends"],d:"leger",t:["humour"],ord:17},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton jeu vidéo préféré ?",o:["Call of Duty","Fortnite","Mario","The Legend of Zelda"],d:"leger",t:["humour"],ord:18},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton musique préférée ?",o:["La pop","Le rock","L'hip-hop","Le jazz"],d:"leger",t:["humour"],ord:19},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton moment préféré de la journée ?",o:["Le matin","L'après-midi","Le soir","La nuit"],d:"leger",t:["humour"],ord:20},
      {e:"aveux-rigolos",k:"choice",p:"Quel est ton animal préféré ?",o:["Le lion","Le tigre","Le léopard","Le guépard"],d:"leger",t:["humour"],ord:21},
      // si-j-etais-toi (21)
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je travaillerai plus","Je prendrais plus de vacances","Je voyagerais plus","Je resterais à la maison"],d:"leger",t:["humour","perspective"],ord:1},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que changerais-tu ?",o:["Je travaillerais plus","Je prendrais plus de temps","Je voyagerais plus","Je resterais à la maison"],d:"leger",t:["humour","perspective"],ord:2},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, comment réagirais-tu ?",o:["Je réagirais différemment","Je réagirais de la même manière","Je réagirais avec humour","Je réagirais avec sérieux"],d:"leger",t:["humour","perspective"],ord:3},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que choisirais-tu ?",o:["Je choisirais le bleu","Je choisirais le rouge","Je choisirais le vert","Je choisirais le jaune"],d:"leger",t:["humour","perspective"],ord:4},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que préférerais-tu ?",o:["Je préférerais le matin","Je préférerais l'après-midi","Je préférerais le soir","Je préférerais la nuit"],d:"leger",t:["humour","perspective"],ord:5},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais une blague","Je ferais une remarque","Je ferais une plaisanterie","Je ferais une remarque"],d:"leger",t:["humour","perspective"],ord:6},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que dirais-tu ?",o:["Je dirais quelque chose de drôle","Je dirais quelque chose de sérieux","Je dirais quelque chose de romantique","Je dirais quelque chose d'émouvant"],d:"leger",t:["humour","perspective"],ord:7},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais une surprise","Je ferais un cadeau","Je ferais un geste","Je ferais un acte"],d:"leger",t:["humour","perspective"],ord:8},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais un voyage","Je ferais un achat","Je ferais un repas","Je ferais une sortie"],d:"leger",t:["humour","perspective"],ord:9},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais une fête","Je ferais une surprise","Je ferais un cadeau","Je ferais un acte"],d:"leger",t:["humour","perspective"],ord:10},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais un achat","Je ferais un voyage","Je ferais un repas","Je ferais une sortie"],d:"leger",t:["humour","perspective"],ord:11},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais une surprise","Je ferais un cadeau","Je ferais un geste","Je ferais un acte"],d:"leger",t:["humour","perspective"],ord:12},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais un voyage","Je ferais un achat","Je ferais un repas","Je ferais une sortie"],d:"leger",t:["humour","perspective"],ord:13},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais une fête","Je ferais une surprise","Je ferais un cadeau","Je ferais un acte"],d:"leger",t:["humour","perspective"],ord:14},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais un achat","Je ferais un voyage","Je ferais un repas","Je ferais une sortie"],d:"leger",t:["humour","perspective"],ord:15},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais une surprise","Je ferais un cadeau","Je ferais un geste","Je ferais un acte"],d:"leger",t:["humour","perspective"],ord:16},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais un voyage","Je ferais un achat","Je ferais un repas","Je ferais une sortie"],d:"leger",t:["humour","perspective"],ord:17},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais une fête","Je ferais une surprise","Je ferais un cadeau","Je ferais un acte"],d:"leger",t:["humour","perspective"],ord:18},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais un achat","Je ferais un voyage","Je ferais un repas","Je ferais une sortie"],d:"leger",t:["humour","perspective"],ord:19},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais une surprise","Je ferais un cadeau","Je ferais un geste","Je ferais un acte"],d:"leger",t:["humour","perspective"],ord:20},
      {e:"si-j-etais-toi",k:"choice",p:"Si tu étais moi, que ferais-tu ?",o:["Je ferais un voyage","Je ferais un achat","Je ferais un repas","Je ferais une sortie"],d:"leger",t:["humour","perspective"],ord:21},
      // souvenirs-d-ecole (21)
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton cours préféré à l'école ?",o:["Les maths","La français","L'histoire","La géographie"],d:"leger",t:["humour","école"],ord:1},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton professeur préféré ?",o:["Le prof de maths","Le prof de français","Le prof d'histoire","Le prof de géographie"],d:"leger",t:["humour","école"],ord:2},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton jouet préféré ?",o:["Les Lego","Les peluches","Les cartes","Les livres"],d:"leger",t:["humour","école"],ord:3},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton jeu vidéo préféré ?",o:["Mario","Zelda","Fortnite","Call of Duty"],d:"leger",t:["humour","école"],ord:4},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton sport préféré ?",o:["Le football","Le tennis","La natation","Le vélo"],d:"leger",t:["humour","école"],ord:5},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton voyage préféré ?",o:["Un voyage à la plage","Un voyage à la montagne","Un voyage à la ville","Un voyage à la campagne"],d:"leger",t:["humour","école"],ord:6},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton color préféré ?",o:["Le bleu","Le vert","Le rouge","Le jaune"],d:"leger",t:["humour","école"],ord:7},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton franchise préféré ?",o:["Star Wars","Harry Potter","Marvel","DC"],d:"leger",t:["humour","école"],ord:8},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton super-héros préféré ?",o:["Superman","Batman","Spiderman","Wonder Woman"],d:"leger",t:["humour","école"],ord:9},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton série préférée ?",o:["Stranger Things","Breaking Bad","Game of Thrones","Friends"],d:"leger",t:["humour","école"],ord:10},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton jeu vidéo préféré ?",o:["Call of Duty","Fortnite","Mario","The Legend of Zelda"],d:"leger",t:["humour","école"],ord:11},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton musique préférée ?",o:["La pop","Le rock","L'hip-hop","Le jazz"],d:"leger",t:["humour","école"],ord:12},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton moment préféré de la journée ?",o:["Le matin","L'après-midi","Le soir","La nuit"],d:"leger",t:["humour","école"],ord:13},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton animal préféré ?",o:["Le lion","Le tigre","Le léopard","Le guépard"],d:"leger",t:["humour","école"],ord:14},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton film préféré ?",o:["Un film d'horreur","Un film d'animation","Un film d'action","Un film romantique"],d:"leger",t:["humour","école"],ord:15},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton plat préféré ?",o:["La pizza","Les pâtes","Le sushi","Le fromage"],d:"leger",t:["humour","école"],ord:16},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton sport préféré ?",o:["Le football","Le tennis","La natation","Le vélo"],d:"leger",t:["humour","école"],ord:17},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton voyage préféré ?",o:["Un voyage à la plage","Un voyage à la montagne","Un voyage à la ville","Un voyage à la campagne"],d:"leger",t:["humour","école"],ord:18},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton color préféré ?",o:["Le bleu","Le vert","Le rouge","Le jaune"],d:"leger",t:["humour","école"],ord:19},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton franchise préféré ?",o:["Star Wars","Harry Potter","Marvel","DC"],d:"leger",t:["humour","école"],ord:20},
      {e:"souvenirs-d-ecole",k:"choice",p:"Quel était ton super-héros préféré ?",o:["Superman","Batman","Spiderman","Wonder Woman"],d:"leger",t:["humour","école"],ord:21},
      // trente-secondes-chrono (21)
      {e:"trente-secondes-chrono",k:"challenge",p:"Dis ton prénom en 30 secondes",d:"leger",t:["humour","jeu"],ord:1},
      {e:"trente-secondes-chrono",k:"challenge",p:"Fais 10 pompes en 30 secondes",d:"leger",t:["humour","jeu"],ord:2},
      {e:"trente-secondes-chrono",k:"challenge",p:"Dis ton nom complet en 30 secondes",d:"leger",t:["humour","jeu"],ord:3},
      {e:"trente-secondes-chrono",k:"challenge",p:"Dis ton adresse en 30 secondes",d:"leger",t:["humour","jeu"],ord:4},
      {e:"trente-secondes-chrono",k:"challenge",p:"Fais 10 squats en 30 secondes",d:"leger",t:["humour","jeu"],ord:5},
      {e:"trente-secondes-chrono",k:"challenge",p:"Fais 10 sauts en 30 secondes",d:"leger",t:["humour","jeu"],ord:6},
      {e:"trente-secondes-chrono",k:"challenge",p:"Dis 10 choses en 30 secondes",d:"leger",t:["humour","jeu"],ord:7},
      {e:"trente-secondes-chrono",k:"challenge",p:"Dis 20 choses en 30 secondes",d:"leger",t:["humour","jeu"],ord:8},
      {e:"trente-secondes-chrono",k:"challenge",p:"Fais 20 pompes en 30 secondes",d:"leger",t:["humour","jeu"],ord:9},
      {e:"trente-secondes-chrono",k:"challenge",p:"Fais 20 squats en 30 secondes",d:"leger",t:["humour","jeu"],ord:10},
      {e:"trente-secondes-chrono",k:"challenge",p:"Fais 20 sauts en 30 secondes",d:"leger",t:["humour","jeu"],ord:11},
      {e:"trente-secondes-chrono",k:"challenge",p:"Dis 30 choses en 30 secondes",d:"leger",t:["humour","jeu"],ord:12},
      {e:"trente-secondes-chrono",k:"challenge",p:"Fais 30 pompes en 30 secondes",d:"leger",t:["humour","jeu"],ord:13},
      {e:"trente-secondes-chrono",k:"challenge",p:"Fais 30 squats en 30 secondes",d:"leger",t:["humour","jeu"],ord:14},
      {e:"trente-secondes-chrono",k:"challenge",p:"Fais 30 sauts en 30 secondes",d:"leger",t:["humour","jeu"],ord:15},
      {e:"trente-secondes-chrono",k:"challenge",p:"Dis 40 choses en 30 secondes",d:"leger",t:["humour","jeu"],ord:16},
      {e:"trente-secondes-chrono",k:"challenge",p:"Fais 40 pompes en 30 secondes",d:"leger",t:["humour","jeu"],ord:17},
      {e:"trente-secondes-chrono",k:"challenge",p:"Fais 40 squats en 30 secondes",d:"leger",t:["humour","jeu"],ord:18},
      {e:"trente-secondes-chrono",k:"challenge",p:"Fais 40 sauts en 30 secondes",d:"leger",t:["humour","jeu"],ord:19},
      {e:"trente-secondes-chrono",k:"challenge",p:"Dis 50 choses en 30 secondes",d:"leger",t:["humour","jeu"],ord:20},
      {e:"trente-secondes-chrono",k:"challenge",p:"Fais 50 pompes en 30 secondes",d:"leger",t:["humour","jeu"],ord:21},
      // vrai-ou-faux (21)
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:1},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:2},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:3},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:4},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:5},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:6},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:7},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:8},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:9},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:10},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:11},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:12},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:13},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:14},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:15},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:16},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:17},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:18},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:19},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:20},
      {e:"vrai-ou-faux",k:"choice",p:"Est-ce vrai ou faux ?",o:["Vrai","Faux","Je ne sais pas"],d:"leger",t:["humour","mensonge"],ord:21},
    ];
    
    let created = 0;
    for (const q of questions) {
      const expId = expMap.get(q.e);
      if (!expId) continue;
      await ctx.db.insert("questions", {
        experienceId: expId,
        kind: q.k as "choice" | "open" | "challenge",
        prompt: q.p,
        options: q.o,
        depth: q.d as "leger" | "moyen" | "profond",
        themes: q.t,
        order: q.ord,
        status: "published" as const,
      });
      created++;
    }
    return { created };
  },
});
