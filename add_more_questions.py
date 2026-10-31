content = open('convex/content.ts').read()
lines = content.split('\n')

# Add more questions to reach 20+ for each
MORE_QUESTIONS = {
    'devine-ma-reponse': [
        ("Qui va choisir la réponse la plus drôle ?", ['humour']),
        ("Qui va essayer de surprendre l'autre ?", ['humour']),
        ("Qui va avoir la réponse la plus originale ?", ['humour']),
    ],
    'fou-rire-garanti': [
        ("Qui va rire le plus fort ?", ['humour']),
        ("Qui va essayer de contrôler son rire ?", ['humour']),
        ("Qui va rire le plus longtemps ?", ['humour']),
    ],
    'imitation-express': [
        ("Qui va imiter le plus fidèlement ?", ['humour']),
        ("Qui va faire rire l'autre ?", ['humour']),
        ("Qui va inventer le personnage le plus drôle ?", ['humour']),
    ],
    'aveux-rigolos': [
        ("Qui est le plus susceptible de raconter n'importe quoi ?", ['humour']),
        ("Qui est le plus susceptible de s'inventer une histoire ?", ['humour']),
        ("Qui est le plus susceptible de dire une bêtise ?", ['humour']),
    ],
    'si-j-etais-toi': [
        ("Si tu étais moi, tu prendrais quelle boisson ?", ['humour']),
        ("Si tu étais moi, tu irais où le week-end ?", ['humour']),
    ],
    'souvenirs-d-ecole': [
        ("Qui était le plus susceptible de s'endormir pendant le cours ?", ['humour']),
        ("Qui était le plus susceptible de copier la réponse ?", ['humour']),
        ("Qui était le plus susceptible de faire le fou ?", ['humour']),
    ],
    'trente-secondes-chrono': [
        ("Qui va réussir le plus de défis ?", ['humour']),
        ("Qui va avoir le plus de mal à réussir ?", ['humour']),
        ("Qui va réussir sans s'arrêter ?", ['humour']),
    ],
    'vrai-ou-faux': [
        ("Est-ce que je suis le plus organisé ?", ['humour']),
        ("Est-ce que je dors le plus ?", ['humour']),
    ],
}

# Process each experience that needs more questions
for exp_slug, questions_to_add in MORE_QUESTIONS.items():
    # Find the experience
    start_idx = None
    for i, line in enumerate(lines):
        if 'slug: "' + exp_slug + '"' in line:
            start_idx = i
            break
    
    if start_idx is None:
        continue
    
    # Find the end of questions array
    questions_end = None
    for i in range(start_idx, min(start_idx + 100, len(lines))):
        if lines[i].strip() == '],' and i > start_idx + 10:
            questions_end = i
            break
    
    if questions_end is None:
        continue
    
    # Convert questions to string
    questions_str = ""
    for prompt, themes in questions_to_add:
        questions_str = questions_str + '''          {
            kind: "choice",
            prompt: "''' + prompt + '''",
            options: ["C'est moi", "C'est toi", "On est pareils"],
            depth: "leger",
            themes: [''' + ", ".join('"' + t + '"' for t in themes) + '''],
          },
'''
    
    # Insert before the closing bracket
    lines.insert(questions_end, questions_str)

# Write back
with open('convex/content.ts', 'w') as f:
    f.write('\n'.join(lines))

print("Added more questions")
