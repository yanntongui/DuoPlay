content = open('convex/content.ts').read()
lines = content.split('\n')

# Count current and add to reach 20
CURRENT = {
    'devine-ma-reponse': 19,  # need 1
    'defis-rigolos': 16,  # need 4
    'imitation-express': 14,  # need 6
    'aveux-rigolos': 15,  # need 5
    'si-j-etais-toi': 13,  # need 7
    'souvenirs-d-ecole': 12,  # need 8
    'trente-secondes-chrono': 9,  # need 11
    'vrai-ou-faux': 12,  # need 8
}

QUESTIONS_TO_ADD = {
    'devine-ma-reponse': [
        ("Qui va choisir la réponse la plus drôle ?", ['humour']),
    ],
    'defis-rigolos': [
        ("Qui va inventer le défi le plus simple ?", ['humour']),
        ("Qui va inventer le défi le plus dur ?", ['humour']),
        ("Qui va rire le plus du défi de l'autre ?", ['humour']),
        ("Qui va réussir tous les défis ?", ['humour']),
    ],
    'imitation-express': [
        ("Qui va imiter le plus de personnes ?", ['humour']),
        ("Qui va être le plus convaincant ?", ['humour']),
        ("Qui va se faire deviner le moins vite ?", ['humour']),
        ("Qui va rire le plus de son imitation ?", ['humour']),
        ("Qui va avoir le plus d'expressions ?", ['humour']),
        ("Qui va réussir le plus d'imitations ?", ['humour']),
    ],
    'aveux-rigolos': [
        ("Qui est le plus susceptible de mentir ?", ['humour']),
        ("Qui est le plus susceptible de s'auto-censurer ?", ['humour']),
        ("Qui est le plus susceptible de faire une confidence ?", ['humour']),
        ("Qui est le plus susceptible de se confier ?", ['humour']),
        ("Qui est le plus susceptible de tout avouer ?", ['humour']),
    ],
    'si-j-etais-toi': [
        ("Si tu étais moi, tu cuisinerais quoi ?", ['humour']),
        ("Si tu étais moi, tu achèterais quoi ?", ['humour']),
        ("Si tu étais moi, tu regarderais quoi à la télé ?", ['humour']),
        ("Si tu étais moi, tu écouterais quelle musique ?", ['humour']),
        ("Si tu étais moi, tu jouerais quel jeu ?", ['humour']),
        ("Si tu étais moi, tu lirais quel livre ?", ['humour']),
    ],
    'souvenirs-d-ecole': [
        ("Qui était le plus susceptible de dormir sur sa chaise ?", ['humour']),
        ("Qui était le plus susceptible de faire des bulles ?", ['humour']),
        ("Qui était le plus susceptible de copier ses devoirs ?", ['humour']),
        ("Qui était le plus susceptible de ne pas écouter ?", ['humour']),
        ("Qui était le plus susceptible de rire en classe ?", ['humour']),
        ("Qui était le plus susceptible de s'échapper ?", ['humour']),
        ("Qui était le plus susceptible de dormir ?", ['humour']),
    ],
    'trente-secondes-chrono': [
        ("Qui va réussir le défi de 10 mots ?", ['humour']),
        ("Qui va réussir le défi de 5 animaux ?", ['humour']),
        ("Qui va être le plus rapide ?", ['humour']),
        ("Qui va essayer de tricher ?", ['humour']),
        ("Qui va avoir le plus de mal ?", ['humour']),
        ("Qui va réussir à s'arrêter à 30 secondes ?", ['humour']),
        ("Qui va oublier de s'arrêter ?", ['humour']),
        ("Qui va réussir sans hésitation ?", ['humour']),
    ],
    'vrai-ou-faux': [
        ("Est-ce que je suis le plus patient ?", ['humour']),
        ("Est-ce que je suis le plus timide ?", ['humour']),
        ("Est-ce que je suis le plus silencieux ?", ['humour']),
        ("Est-ce que je suis le plus bavard ?", ['humour']),
        ("Est-ce que je suis le plus créatif ?", ['humour']),
        ("Est-ce que je suis le plus drôle ?", ['humour']),
        ("Est-ce que je suis le plus romantique ?", ['humour']),
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
        continue
    
    # Find the end of questions array
    questions_end = None
    for i in range(start_idx, min(start_idx + 100, len(lines))):
        if lines[i].strip() == ']' and i > start_idx + 10:
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

print("Added final questions")
