content = open('convex/content.ts').read()
lines = content.split('\n')

# Helper to add questions before the closing ], of a questions array
def find_questions_end(start_line, max_lines=100):
    for i in range(start_line, min(start_line + max_lines, len(lines))):
        if lines[i].strip() == '],' and i > start_line + 10:
            return i
    return None

# Questions to add to each experience
QUESTIONS_TO_ADD = {
    'devine-ma-reponse': [
        {
            'kind': 'choice',
            'prompt': "Qui va répondre le plus vite ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va choisir la réponse la plus folle ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va répondre le plus sérieusement ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va inventer une réponse complètement absurde ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va essayer de piéger l'autre ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va donner la réponse la plus inattendue ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va essayer de deviner ce que l'autre va répondre ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['complicité'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va choisir la réponse la plus safe ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va avoir le meilleur timing ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va rire le plus fort de sa propre réponse ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va essayer d'imiter l'autre ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va surprendre l'autre ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va être le plus stratégique ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va choisir la réponse la plus mignonne ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
    ],
    'defis-rigolos': [
        {
            'kind': 'challenge',
            'prompt': "Fais une danse complètement folle pendant 10 secondes.",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'challenge',
            'prompt': "Dessine ton partenaire les yeux fermés.",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'challenge',
            'prompt': "Dis 3 compliments ridicules à ton partenaire.",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'challenge',
            'prompt': "Imite un animal pendant 15 secondes.",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'challenge',
            'prompt': "Parle avec un accent exagéré pendant 30 secondes.",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va inventer le défi le plus fou ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va relever le défi le plus facilement ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va rire le plus pendant le défi ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va abandonner le premier ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va inventer le défi le plus créatif ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va être le plus à l'aise ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va faire le plus de gestes ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
    ],
    'fou-rire-garanti': [
        {
            'kind': 'challenge',
            'prompt': "Ri sans t'arrêter pendant 30 secondes.",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'challenge',
            'prompt': "Raconte une blague que tu connais mal.",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'challenge',
            'prompt': "Dis un mot en exagérant l'accent de ton partenaire.",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va rire le plus vite ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va avoir le rire le plus bruyant ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va rire jusqu'aux larmes ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va essayer de ne pas rire ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va avoir le rire le plus contagieux ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va rire le plus de ses propres bêtises ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va essayer de faire rire l'autre ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
    ],
    'imitation-express': [
        {
            'kind': 'challenge',
            'prompt': "Imite le téléphone de ton partenaire qui sonne.",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'challenge',
            'prompt': "Imite ton partenaire en train de lire.",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'challenge',
            'prompt': "Imite quelqu'un de la famille de ton partenaire.",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va imiter le mieux ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va se faire deviner le plus vite ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va être le plus drôle ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va imiter le plus de gens ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
    ],
    'aveux-rigolos': [
        {
            'kind': 'open',
            'prompt': "Quelle est ta bêtise la plus drôle ?",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'open',
            'prompt': "Quelle est ta pire blague ?",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui a le pire sens de l'humour ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui raconte les meilleures blagues ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui est le plus susceptible de faire une bêtise ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
    ],
    'si-j-etais-toi': [
        {
            'kind': 'choice',
            'prompt': "Si tu étais moi, tu ferais quoi en premier le matin ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Si tu étais moi, tu mangerais quoi au dîner ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Si tu étais moi, tu choisirais quelle chanson ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Si tu étais moi, tu regarderais quel film ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
    ],
    'souvenirs-d-ecole': [
        {
            'kind': 'choice',
            'prompt': "Qui était le plus susceptible de faire une bêtise en classe ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui était le plus susceptible de s'endormir en classe ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui était le plus susceptible de copier sur le voisin ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
    ],
    'trente-secondes-chrono': [
        {
            'kind': 'challenge',
            'prompt': "Dis 10 mots commençant par la même lettre en 30 secondes.",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'challenge',
            'prompt': "Nomme 5 animaux en 30 secondes.",
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Qui va réussir le plus de challenges ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
    ],
    'vrai-ou-faux': [
        {
            'kind': 'choice',
            'prompt': "Est-ce que je suis le meilleur cuisinier ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Est-ce que je chante sous la douche ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Est-ce que je parle en dormant ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
        {
            'kind': 'choice',
            'prompt': "Est-ce que je m'endors devant la télé ?",
            'options': ["C'est moi", "C'est toi", "On est pareils"],
            'depth': 'leger',
            'themes': ['humour'],
        },
    ],
}

# Process each experience
for exp_slug, questions_to_add in QUESTIONS_TO_ADD.items():
    # Find the experience
    start_idx = None
    for i, line in enumerate(lines):
        if 'slug: "' + exp_slug + '"' in line:
            start_idx = i
            break
    
    if start_idx is None:
        print("Skipping " + exp_slug + ": not found")
        continue
    
    # Find the end of questions array
    questions_end = None
    for i in range(start_idx, min(start_idx + 100, len(lines))):
        if lines[i].strip() == '],' and i > start_idx + 10:
            questions_end = i
            break
    
    if questions_end is None:
        print("Skipping " + exp_slug + ": no questions end found")
        continue
    
    # Convert questions to string
    questions_str = ""
    for q in questions_to_add:
        opts_str = ", ".join('"' + opt + '"' for opt in q['options']) if 'options' in q else ""
        themes_str = ", ".join('"' + t + '"' for t in q['themes'])
        questions_str = questions_str + '''          {
            kind: "''' + q['kind'] + '''",
            prompt: "''' + q['prompt'] + '''",
'''
        if opts_str:
            questions_str = questions_str + '''            options: [''' + opts_str + '''],
'''
        questions_str = questions_str + '''            depth: "''' + q['depth'] + '''",
            themes: [''' + themes_str + '''],
          },
'''
    
    # Insert before the closing bracket
    lines.insert(questions_end, questions_str)

# Write back
with open('convex/content.ts', 'w') as f:
    f.write('\n'.join(lines))

print("Added questions to all experiences in Éclats de rire")
