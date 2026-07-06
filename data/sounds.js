window.SW_DATA = {
  soundPairs: [
    {
      id: "fv",
      title: "Cristal F/V",
      icon: "💎",
      description: "Treina a diferença entre F sem vibração e V com vibração.",
      hint: "Põe os dedos na garganta. No V a garganta vibra; no F quase não vibra.",
      words: [
        { correct: "faca", distractor: "vaca", prompt: "Serve para cortar pão." },
        { correct: "vaca", distractor: "faca", prompt: "Animal que dá leite." },
        { correct: "foto", distractor: "voto", prompt: "Imagem tirada com câmara." },
        { correct: "vida", distractor: "fida", prompt: "O contrário de morte." },
        { correct: "fita", distractor: "vita", prompt: "Pode servir para prender ou decorar." },
        { correct: "vento", distractor: "fento", prompt: "Ar em movimento." }
      ]
    },
    {
      id: "sz",
      title: "Cristal S/Z",
      icon: "⚡",
      description: "Treina palavras como fazer/faser, casa/caza e rosa/rossa.",
      hint: "Lê devagar e procura se o som é mais suave, como em fazer, ou mais marcado.",
      words: [
        { correct: "fazer", distractor: "faser", prompt: "Criar ou realizar alguma coisa." },
        { correct: "casa", distractor: "caza", prompt: "Lugar onde vivemos." },
        { correct: "zero", distractor: "sero", prompt: "Número antes do um." },
        { correct: "rosa", distractor: "rossa", prompt: "Flor ou cor." },
        { correct: "mesa", distractor: "meza", prompt: "Móvel onde podemos comer ou estudar." }
      ]
    },
    {
      id: "bp",
      title: "Cristal B/P",
      icon: "🛡️",
      description: "Treina sons parecidos, mas com vibração e força diferentes.",
      hint: "No P há uma pequena explosão de ar. No B a voz entra mais cedo.",
      words: [
        { correct: "bola", distractor: "pola", prompt: "Objeto redondo para jogar." },
        { correct: "pato", distractor: "bato", prompt: "Ave que nada." },
        { correct: "bota", distractor: "pota", prompt: "Calçado alto." },
        { correct: "pão", distractor: "bão", prompt: "Alimento feito com farinha." }
      ]
    },
    {
      id: "td",
      title: "Cristal T/D",
      icon: "🔥",
      description: "Treina pares como tia/dia e toca/docas.",
      hint: "No T sai ar mais seco. No D há voz/vibração.",
      words: [
        { correct: "tia", distractor: "dia", prompt: "Irmã da mãe ou do pai." },
        { correct: "dia", distractor: "tia", prompt: "Período de 24 horas." },
        { correct: "dado", distractor: "tado", prompt: "Peça com números usada em jogos." },
        { correct: "tubo", distractor: "dubo", prompt: "Canal por onde passa água ou ar." }
      ]
    }
  ],
  rewards: [
    { id: "aurora", name: "Aurora", title: "Guardiã do Som F", rarity: "★★★", icon: "🌟", unlockAt: 20 },
    { id: "violet", name: "Violet", title: "Guardiã do Som V", rarity: "★★★★", icon: "💜", unlockAt: 50 },
    { id: "nova", name: "Nova", title: "Ataque Estrela Pop", rarity: "★★★★", icon: "🎤", unlockAt: 100 },
    { id: "luna", name: "Luna", title: "Mascote Lunar", rarity: "★★★", icon: "🐺", unlockAt: 160 },
    { id: "rya", name: "Rya", title: "Capitã dos Cristais", rarity: "★★★★★", icon: "👑", unlockAt: 250 }
  ]
};
