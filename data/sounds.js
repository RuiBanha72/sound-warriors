window.SW_DATA = {
  missionModes: [
    { id: "choose", label: "Escolher", title: "Escolhe o ataque certo" },
    { id: "letter", label: "Letra perdida", title: "Completa a palavra" },
    { id: "write", label: "Escrever", title: "Escreve a palavra final" },
    { id: "correct", label: "Corrigir", title: "Corrige o glitch" },
    { id: "boss", label: "Boss", title: "Boss dos glitches reais" }
  ],
  soundPairs: [
    {
      id: "fv",
      title: "Neon City",
      code: "F/V",
      letters: ["f", "v"],
      icon: "💎",
      glow: "rgba(255,47,179,0.38)",
      monster: "Vox Glitch",
      description: "Treino de sons sem vibração e com vibração. Ideal para trocas como fogueira/vogueira ou faca/vaca.",
      hint: "Poder secreto: toca na garganta. No V há vibração. No F sai só ar.",
      words: [
        { correct: "faca", distractor: "vaca", target: "f", prompt: "Ataque certo para cortar o pão no palco." },
        { correct: "vaca", distractor: "faca", target: "v", prompt: "Mascote que dá leite para o batido da equipa." },
        { correct: "foto", distractor: "voto", target: "f", prompt: "Flash! O público quer guardar este momento." },
        { correct: "vida", distractor: "fida", target: "v", prompt: "Energia máxima da heroína." },
        { correct: "fita", distractor: "vita", target: "f", prompt: "Acessório brilhante para o microfone." },
        { correct: "vento", distractor: "fento", target: "v", prompt: "Rajada que empurra o glitch para longe." },
        { correct: "fogueira", distractor: "vogueira", target: "f", prompt: "Luz quente no acampamento da equipa." },
        { correct: "grava", distractor: "grafa", target: "v", prompt: "A produtora grava o novo refrão." }
      ]
    },
    {
      id: "sz",
      title: "Zero Beat",
      code: "S/Z",
      letters: ["s", "z"],
      icon: "⚡",
      glow: "rgba(53,214,255,0.36)",
      monster: "Zeta Noise",
      description: "Treino de palavras em que o som pode enganar a escrita: s, z, ss ou outras formas ortográficas.",
      hint: "Poder secreto: lê a palavra em voz baixa e procura a versão que já viste nos livros.",
      words: [
        { correct: "fazer", distractor: "faser", target: "z", prompt: "A heroína vai criar um novo ataque." },
        { correct: "casa", distractor: "caza", target: "s", prompt: "Base secreta da equipa." },
        { correct: "zero", distractor: "sero", target: "z", prompt: "Número inicial do contador da batalha." },
        { correct: "rosa", distractor: "rossa", target: "s", prompt: "Cor do palco principal." },
        { correct: "mesa", distractor: "meza", target: "s", prompt: "Onde ficam as cartas raras antes do show." },
        { correct: "cozinha", distractor: "cosinha", target: "z", prompt: "Sala onde se prepara o lanche da tour." }
      ]
    },
    {
      id: "bp",
      title: "Bubble Dome",
      code: "B/P",
      letters: ["b", "p"],
      icon: "🛡️",
      glow: "rgba(170,255,95,0.26)",
      monster: "Pop Blocker",
      description: "Arena de pares surdos/sonoros: P explode com ar; B liga a voz mais cedo.",
      hint: "Poder secreto: no P sai uma explosão de ar. No B a voz liga mais cedo.",
      words: [
        { correct: "bola", distractor: "pola", target: "b", prompt: "Objeto redondo lançado pela mascote." },
        { correct: "pato", distractor: "bato", target: "p", prompt: "Animal convidado para o lago neon." },
        { correct: "bota", distractor: "pota", target: "b", prompt: "Calçado da guerreira para entrar na arena." },
        { correct: "pão", distractor: "bão", target: "p", prompt: "Snack antes do concerto." },
        { correct: "barco", distractor: "parco", target: "b", prompt: "Transporte para atravessar o lago." }
      ]
    },
    {
      id: "td",
      title: "Thunder Stage",
      code: "T/D",
      letters: ["t", "d"],
      icon: "🔥",
      glow: "rgba(255,216,107,0.31)",
      monster: "Drum Shadow",
      description: "Palco dos trovões para treinar T/D, outro par em que a vibração da voz pode confundir.",
      hint: "Poder secreto: no T o ar sai seco. No D sentes mais voz.",
      words: [
        { correct: "tia", distractor: "dia", target: "t", prompt: "Convidada VIP da heroína." },
        { correct: "dia", distractor: "tia", target: "d", prompt: "Tempo que dura a tour de hoje." },
        { correct: "dado", distractor: "tado", target: "d", prompt: "Cubo mágico usado para abrir prémios." },
        { correct: "tubo", distractor: "dubo", target: "t", prompt: "Canhão de luz que dispara confettis." },
        { correct: "dedo", distractor: "teto", target: "d", prompt: "Parte da mão usada para tocar no ecrã." }
      ]
    },
    {
      id: "cg",
      title: "Crystal Gate",
      code: "C/G",
      letters: ["c", "g"],
      icon: "🌀",
      glow: "rgba(123,61,255,0.34)",
      monster: "Gate Glitch",
      description: "Treino de trocas C/G, muito útil para erros como grito/crito ou gola/cola.",
      hint: "Poder secreto: C é mais seco; G liga mais a voz. Diz devagar e sente a garganta.",
      words: [
        { correct: "gato", distractor: "cato", target: "g", prompt: "Animal que salta para cima do palco." },
        { correct: "cola", distractor: "gola", target: "c", prompt: "Serve para colar o cartaz do concerto." },
        { correct: "gola", distractor: "cola", target: "g", prompt: "Parte da camisola da cantora." },
        { correct: "grito", distractor: "crito", target: "g", prompt: "Som forte do público quando começa o show." },
        { correct: "casa", distractor: "gasa", target: "c", prompt: "Base secreta da equipa." },
        { correct: "fogueira", distractor: "foceira", target: "g", prompt: "Luz quente do acampamento." }
      ]
    },
    {
      id: "chj",
      title: "Jet Chorus",
      code: "CH/J",
      letters: ["ch", "j"],
      icon: "🚀",
      glow: "rgba(255,85,116,0.30)",
      monster: "Jet Jammer",
      description: "Treino de CH/J para distinguir sons próximos na leitura e na escrita.",
      hint: "Poder secreto: diz a palavra devagar. Se a voz vibra mais, pode estar perto do J.",
      words: [
        { correct: "chuva", distractor: "juva", target: "ch", prompt: "Cai do céu antes do concerto." },
        { correct: "janela", distractor: "chanela", target: "j", prompt: "Por onde entra a luz no quarto." },
        { correct: "chave", distractor: "jave", target: "ch", prompt: "Abre a porta do backstage." },
        { correct: "jogo", distractor: "chogo", target: "j", prompt: "Missão que a heroína quer ganhar." },
        { correct: "chefe", distractor: "jefe", target: "ch", prompt: "Pessoa que lidera a equipa." }
      ]
    },
    {
      id: "lr",
      title: "Laser Road",
      code: "L/R",
      letters: ["l", "r"],
      icon: "🌈",
      glow: "rgba(170,255,95,0.24)",
      monster: "Laser Rumble",
      description: "Treino de L/R e de palavras em que a posição da língua muda muito o som.",
      hint: "Poder secreto: no L a língua toca mais à frente. No R há mais vibração ou arrasto.",
      words: [
        { correct: "rato", distractor: "lato", target: "r", prompt: "Animal pequeno que correu pelo palco." },
        { correct: "lata", distractor: "rata", target: "l", prompt: "Objeto metálico usado como tambor." },
        { correct: "rua", distractor: "lua", target: "r", prompt: "Caminho por onde passa a tour." },
        { correct: "lua", distractor: "rua", target: "l", prompt: "Brilha no céu durante o show." },
        { correct: "livro", distractor: "rivro", target: "l", prompt: "Objeto com histórias e missões." }
      ]
    },
    {
      id: "grupos",
      title: "Combo Lab",
      code: "Grupos",
      letters: ["pr", "tr", "cr", "gr", "pl", "cl"],
      icon: "🧬",
      glow: "rgba(255,216,107,0.24)",
      monster: "Combo Bug",
      description: "Treino de grupos consonânticos, adições e inversões: triplo/tripolo, crocodilo/corcudilo.",
      hint: "Poder secreto: parte a palavra em bocados e bate palmas por sílabas antes de escrever.",
      words: [
        { correct: "triplo", distractor: "tripolo", target: "tr", prompt: "Quando algo vale três vezes mais." },
        { correct: "crocodilo", distractor: "corcudilo", target: "cr", prompt: "Animal grande com dentes fortes." },
        { correct: "grande", distractor: "garnde", target: "gr", prompt: "O palco principal é muito grande." },
        { correct: "prato", distractor: "parto", target: "pr", prompt: "Onde fica o jantar antes da missão." },
        { correct: "claro", distractor: "calro", target: "cl", prompt: "Quando se vê bem a palavra." }
      ]
    }
  ],
  rewards: [
    { id: "mika", name: "Mika Neon", title: "Vocalista Relâmpago", rarity: "★★★", icon: "🎤", unlockAt: 20 },
    { id: "yuna", name: "Yuna Star", title: "Dançarina das Gemas", rarity: "★★★★", icon: "💃", unlockAt: 50 },
    { id: "kira", name: "Kira Vox", title: "Ataque Super Refrão", rarity: "★★★★", icon: "🌈", unlockAt: 100 },
    { id: "lumi", name: "Lumi", title: "Mascote Lunar", rarity: "★★★", icon: "🐺", unlockAt: 160 },
    { id: "aria", name: "Aria Queen", title: "Capitã da World Tour", rarity: "★★★★★", icon: "👑", unlockAt: 250 },
    { id: "sol", name: "Sol Pop", title: "Carta Holográfica", rarity: "★★★★★", icon: "✨", unlockAt: 400 },
    { id: "nova", name: "Nova Mestre", title: "Caçadora de Glitches", rarity: "★★★★★★", icon: "🏆", unlockAt: 650 }
  ]
};