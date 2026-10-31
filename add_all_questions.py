content = open('convex/content.ts').read()
lines = content.split('\n')

# Find qui-de-nous-deux and add 4 more questions
inserted = False
for i in range(80, 120):
    if i < len(lines) and lines[i].strip() == '],' and i+1 < len(lines) and '},' in lines[i+1]:
        # Add 4 more questions before the ]
        more_questions = '''          {
            kind: "choice",
            prompt: "Qui est le plus susceptible de chanter dans la douche ?",
            options: ["C'est moi", "C'est toi", "On se ressemble", "Aucun des deux"],
            depth: "leger",
            themes: ["humour"],
          },
          {
            kind: "choice",
            prompt: "Qui est le plus susceptible de se plaindre d'avoir mal dormi ?",
            options: ["C'est moi", "C'est toi", "On se ressemble", "Aucun des deux"],
            depth: "leger",
            themes: ["quotidien"],
          },
          {
            kind: "choice",
            prompt: "Qui est le plus susceptible de faire les magasins sans rien acheter ?",
            options: ["C'est moi", "C'est toi", "On se ressemble", "Aucun des deux"],
            depth: "leger",
            themes: ["humour"],
          },
          {
            kind: "choice",
            prompt: "Qui est le plus susceptible de s'endormir sur le canapé ?",
            options: ["C'est moi", "C'est toi", "On se ressemble", "Aucun des deux"],
            depth: "leger",
            themes: ["quotidien"],
          },
'''
        lines.insert(i, more_questions)
        inserted = True
        break

with open('convex/content.ts', 'w') as f:
    f.write('\n'.join(lines))

print("Added 4 more questions to qui-de-nous-deux")
