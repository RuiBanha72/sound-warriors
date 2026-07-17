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

const EXTRA_WORDS = {
  fv: [
    ["vela", "fela", "v", "Luz pequena que ajuda a ver no escuro."], ["festa", "vesta", "f", "Celebração depois de uma grande vitória."],
    ["varanda", "faranda", "v", "Lugar da casa com vista para a rua."], ["fada", "vada", "f", "Personagem mágica de uma história."],
    ["vagem", "fagem", "v", "Parte verde onde crescem ervilhas."], ["fogo", "vogo", "f", "Chama que aquece a fogueira."]
  ],
  sz: [
    ["zebra", "sebra", "z", "Animal com riscas pretas e brancas."], ["sopa", "zopa", "s", "Comida quente feita numa panela."],
    ["tesoura", "tezoura", "s", "Ferramenta para cortar papel."], ["azar", "asar", "z", "Quando algo não corre como esperávamos."],
    ["sapato", "zapato", "s", "Protege o pé ao caminhar."], ["azeite", "aseite", "z", "Usa-se numa salada ou para cozinhar."]
  ],
  bp: [
    ["pipa", "biba", "p", "Brinquedo que voa preso por um fio."], ["bico", "pico", "b", "Parte pontiaguda de uma ave."],
    ["pote", "bote", "p", "Recipiente onde se guardam objetos pequenos."], ["banco", "panco", "b", "Lugar onde nos sentamos no jardim."],
    ["pomba", "bomba", "p", "Ave que pode voar numa praça."], ["barba", "parpa", "b", "Pelos que crescem no rosto de algumas pessoas."]
  ],
  td: [
    ["tenda", "denda", "t", "Abrigo de pano usado num acampamento."], ["doce", "toce", "d", "Alimento com sabor açucarado."],
    ["tapete", "dapete", "t", "Peça de tecido colocada no chão."], ["duna", "tuna", "d", "Monte de areia junto ao mar."],
    ["tartaruga", "dardaruga", "t", "Animal com carapaça que anda devagar."], ["dado", "tato", "d", "Cubo com pontos usado em jogos."]
  ],
  cg: [
    ["cama", "gama", "c", "Lugar onde dormimos à noite."], ["galo", "calo", "g", "Ave que canta de manhã."],
    ["copo", "gopo", "c", "Recipiente usado para beber água."], ["gota", "cota", "g", "Pequena porção de água da chuva."],
    ["coroa", "goroa", "c", "Objeto que um rei pode usar na cabeça."], ["goma", "coma", "g", "Doce pequeno e elástico."]
  ],
  chj: [
    ["chá", "já", "ch", "Bebida quente feita com folhas ou ervas."], ["jardim", "chardim", "j", "Espaço com flores e plantas."],
    ["chapéu", "japéu", "ch", "Protege a cabeça do sol."], ["joelho", "choelho", "j", "Articulação no meio da perna."],
    ["chocolate", "jocolate", "ch", "Doce feito com cacau."], ["jantar", "chantar", "j", "Refeição do fim do dia."]
  ],
  lr: [
    ["lago", "rago", "l", "Lugar com água rodeado de terra."], ["rei", "lei", "r", "Pessoa que usa uma coroa num reino."],
    ["laranja", "raranja", "l", "Fruta redonda e de cor viva."], ["relógio", "lelógio", "r", "Objeto que mostra as horas."],
    ["lobo", "robo", "l", "Animal que vive em alcateia."], ["rampa", "lampa", "r", "Plano inclinado que ajuda a subir."]
  ],
  grupos: [
    ["prenda", "pernda", "pr", "Presente oferecido numa festa."], ["trigo", "tirgo", "tr", "Cereal usado para fazer pão."],
    ["cravo", "carvo", "cr", "Flor que pode ter um perfume forte."], ["planta", "palnta", "pl", "Ser vivo que cresce na terra."],
    ["bloco", "bolco", "bl", "Conjunto de folhas para desenhar."], ["fruta", "furta", "fr", "Alimento como maçã ou pera."]
  ]
};

Object.entries(EXTRA_WORDS).forEach(([pairId, words]) => {
  const pair = window.SW_DATA.soundPairs.find(item => item.id === pairId);
  if (!pair) return;
  pair.words.push(...words.map(([correct, distractor, target, prompt]) => ({ correct, distractor, target, prompt })));
});
