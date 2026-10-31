content = open('convex/content.ts').read()
lines = content.split('\n')

# Questions to add to qui-de-nous-deux
additional = [
'''          {
            kind: "choice",
            prompt: "Qui a le rire le plus contagieux ?",
            options: ["C'est moi", "C'est toi", "On se ressemble", "Aucun des deux"],
            depth: "leger",
            themes: ["humour"],
          },
          {
            kind: "choice",
            prompt: "Qui est le plus susceptible de s'enfermer dans un placard ?",
            options: ["C'est moi", "C'est toi", "On se ressemble", "Aucun des deux"],
            depth: "leger",
            themes: ["humour"],
          },
          {
            kind: "choice",
            prompt: "Qui fait le plus de fautes de frappe ?",
            options: ["C'est moi", "C'est toi", "On se ressemble", "Aucun des deux"],
            depth: "leger",
            themes: ["quotidien"],
          },
          {
            kind: "choice",
            prompt: "Qui est le plus susceptible de s'endormir devant la télé ?",
            options: ["C'est moi", "C'est toi", "On se ressemble", "Aucun des deux"],
            depth: "leger",
            themes: ["quotidien"],
          },
          {
            kind: "choice",
            prompt: "Qui est le plus susceptible d'acheter des vêtements trop grands ?",
            options: ["C'est moi", "C'est toi", "On se ressemble", "Aucun des deux"],
            depth: "leger",
            themes: ["humour"],
          },
          {
            kind: "choice",
            prompt: "Qui est le plus susceptible de se perdre en voiture ?",
            options: ["C'est moi", "C'est toi", "On se ressemble", "Aucun des deux"],
            depth: "leger",
            themes: ["quotidien"],
          },
          {
            kind: "choice",
            prompt: "Qui est le plus susceptible de faire la sieste ?",
            options: ["C'est moi", "C'est toi", "On se ressemble", "Aucun des deux"],
            depth: "leger",
            themes: ["quotidien"],
          },
          {
            kind: "choice",
            prompt: "Qui est le plus susceptible de regarder la télé en mangeant ?",
            options: ["C'est moi", "C'est toi", "On se ressemble", "Aucun des deux"],
            depth: "leger",
            themes: ["quotidien"],
          },
          {
            kind: "choice",
            prompt: "Qui est le plus susceptible de parler dans son sommeil ?",
            options: ["C'est moi", "C'est toi", "On se ressemble", "Aucun des deux"],
            depth: "leger",
            themes: ["humour"],
          },
          {
            kind: "choice",
            prompt: "Qui est le plus susceptible de s'excuser même quand ce n'est pas de sa faute ?",
            options: ["C'est moi", "C'est toi", "On se ressemble", "Aucun des deux"],
            depth: "leger",
            themes: ["personnalité"],
          },
'''
]

# Find the position to insert - right before the " ]," that closes questions array for qui-de-nous-deux
for i in range(60, 100):
    if i < len(lines) and lines[i].strip() == '],' and i+1 < len(lines) and '},' in lines[i+1]:
        lines.insert(i, additional[0])
        break

with open('convex/content.ts', 'w') as f:
    f.write('\n'.join(lines))

print("Added questions to qui-de-nous-deux")
