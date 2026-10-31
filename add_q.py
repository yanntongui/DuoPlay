lines = open('convex/content.ts').read().split('\n')

# Add 1 question to devine-ma-reponse at line 340
lines.insert(340, '''          {
            kind: "choice",
            prompt: "Qui va rire le plus de l'histoire ?",
            options: ["C'est moi", "C'est toi", "On est pareils"],
            depth: "leger",
            themes: ["humour"],
          },''')

# Add more questions to other experiences
# defis-rigolos - insert at line 460
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

# Continue with other experiences...
# Add to imitation-express
for q in [
    ("Qui va imiter le plus de personnes ?", ["humour"]),
    ("Qui va être le plus convaincant ?", ["humour"]),
    ("Qui va se faire deviner le moins vite ?", ["humour"]),
    ("Qui va rire le plus de son imitation ?", ["humour"]),
    ("Qui va avoir le plus d'expressions ?", ["humour"]),
    ("Qui va réussir le plus d'imitations ?", ["humour"]),
]:
    lines.insert(765, '''          {
            kind: "choice",
            prompt: "''' + q[0] + '''",
            options: ["C'est moi", "C'est toi", "On est pareils"],
            depth: "leger",
            themes: ["''' + q[1][0] + '''"],
          },''')

with open('convex/content.ts', 'w') as f:
    f.write('\n'.join(lines))

print("Added questions")
