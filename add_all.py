lines = open('convex/content.ts').read().split('\n')

# defis-rigolos: 16 -> needs 4 more
for q in [
    ("Qui va inventer le défi le plus simple ?", ["humour"]),
    ("Qui va inventer le défi le plus dur ?", ["humour"]),
    ("Qui va rire le plus du défi de l'autre ?", ["humour"]),
    ("Qui va réussir tous les défis ?", ["humour"]),
]:
    lines.insert(460, '''          {
            kind: "choice",
            prompt: "''' + q[0] + '''",
            options: ["C'est moi", "C'est toi", "On est pareils"],
            depth: "leger",
            themes: ["''' + q[1][0] + '''"],
          },''')

# imitation-express: 13 -> needs 7 more (was 14, now has 13 after insert? let's check)
# Actually the insert shifted everything, let me recalculate
for q in [
    ("Qui va imiter le plus de personnes ?", ["humour"]),
    ("Qui va être le plus convaincant ?", ["humour"]),
    ("Qui va se faire deviner le moins vite ?", ["humour"]),
    ("Qui va rire le plus de son imitation ?", ["humour"]),
    ("Qui va avoir le plus d'expressions ?", ["humour"]),
    ("Qui va réussir le plus d'imitations ?", ["humour"]),
]:
    lines.insert(770, '''          {
            kind: "choice",
            prompt: "''' + q[0] + '''",
            options: ["C'est moi", "C'est toi", "On est pareils"],
            depth: "leger",
            themes: ["''' + q[1][0] + '''"],
          },''')

# aveux-rigolos: 14 -> needs 6 more
for q in [
    ("Qui est le plus susceptible de mentir ?", ["humour"]),
    ("Qui est le plus susceptible de s'auto-censurer ?", ["humour"]),
    ("Qui est le plus susceptible de faire une confidence ?", ["humour"]),
    ("Qui est le plus susceptible de se confier ?", ["humour"]),
    ("Qui est le plus susceptible de tout avouer ?", ["humour"]),
    ("Qui est le plus susceptible de raconter n'importe quoi ?", ["humour"]),
]:
    lines.insert(875, '''          {
            kind: "choice",
            prompt: "''' + q[0] + '''",
            options: ["C'est moi", "C'est toi", "On est pareils"],
            depth: "leger",
            themes: ["''' + q[1][0] + '''"],
          },''')

# si-j-etais-toi: 18 -> needs 2 more
for q in [
    ("Si tu étais moi, tu cuisinerais quoi ?", ["humour"]),
    ("Si tu étais moi, tu achèterais quoi ?", ["humour"]),
]:
    lines.insert(1020, '''          {
            kind: "choice",
            prompt: "''' + q[0] + '''",
            options: ["C'est moi", "C'est toi", "On est pareils"],
            depth: "leger",
            themes: ["''' + q[1][0] + '''"],
          },''')

# souvenirs-d-ecole: 7 -> needs 13 more
for q in [
    ("Qui était le plus susceptible de dormir sur sa chaise ?", ["humour"]),
    ("Qui était le plus susceptible de faire des bulles ?", ["humour"]),
    ("Qui était le plus susceptible de copier ses devoirs ?", ["humour"]),
    ("Qui était le plus susceptible de ne pas écouter ?", ["humour"]),
    ("Qui était le plus susceptible de rire en classe ?", ["humour"]),
    ("Qui était le plus susceptible de s'échapper ?", ["humour"]),
    ("Qui était le plus susceptible de dormir ?", ["humour"]),
    ("Qui était le plus susceptible de bavarder ?", ["humour"]),
    ("Qui était le plus susceptible de rêvasser ?", ["humour"]),
    ("Qui était le plus susceptible de se faire chahuter ?", ["humour"]),
    ("Qui était le plus susceptible de se faire remarquer ?", ["humour"]),
    ("Qui était le plus susceptible de se faire punir ?", ["humour"]),
    ("Qui était le plus susceptible de se faire appeler ?", ["humour"]),
]:
    lines.insert(1105, '''          {
            kind: "choice",
            prompt: "''' + q[0] + '''",
            options: ["C'est moi", "C'est toi", "On est pareils"],
            depth: "leger",
            themes: ["''' + q[1][0] + '''"],
          },''')

# trente-secondes-chrono: 11 -> needs 9 more
for q in [
    ("Qui va réussir le défi de 10 mots ?", ["humour"]),
    ("Qui va réussir le défi de 5 animaux ?", ["humour"]),
    ("Qui va être le plus rapide ?", ["humour"]),
    ("Qui va essayer de tricher ?", ["humour"]),
    ("Qui va avoir le plus de mal ?", ["humour"]),
    ("Qui va réussir à s'arrêter à 30 secondes ?", ["humour"]),
    ("Qui va oublier de s'arrêter ?", ["humour"]),
    ("Qui va réussir sans hésitation ?", ["humour"]),
    ("Qui va être le plus concentré ?", ["humour"]),
]:
    lines.insert(1185, '''          {
            kind: "choice",
            prompt: "''' + q[0] + '''",
            options: ["C'est moi", "C'est toi", "On est pareils"],
            depth: "leger",
            themes: ["''' + q[1][0] + '''"],
          },''')

# vrai-ou-faux: 12 -> needs 8 more
for q in [
    ("Est-ce que je suis le plus patient ?", ["humour"]),
    ("Est-ce que je suis le plus timide ?", ["humour"]),
    ("Est-ce que je suis le plus silencieux ?", ["humour"]),
    ("Est-ce que je suis le plus bavard ?", ["humour"]),
    ("Est-ce que je suis le plus créatif ?", ["humour"]),
    ("Est-ce que je suis le plus drôle ?", ["humour"]),
    ("Est-ce que je suis le plus romantique ?", ["humour"]),
    ("Est-ce que je suis le plus attentionné ?", ["humour"]),
]:
    lines.insert(1285, '''          {
            kind: "choice",
            prompt: "''' + q[0] + '''",
            options: ["C'est moi", "C'est toi", "On est pareils"],
            depth: "leger",
            themes: ["''' + q[1][0] + '''"],
          },''')

with open('convex/content.ts', 'w') as f:
    f.write('\n'.join(lines))

print("Added questions")
