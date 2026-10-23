/**
 * Estonian translations
 * Eesti keele tõlked
 */
export const et = {
  // Common
  controlPad: {
    up: 'Üles',
    down: 'Alla',
    left: 'Vasakule',
    right: 'Paremale',
  },

  common: {
    yes: 'Jah',
    no: 'Ei',
    ok: 'OK',
    cancel: 'Tühista',
    confirm: 'Kinnita',
    close: 'Sulge',
    save: 'Salvesta',
    delete: 'Kustuta',
    edit: 'Muuda',
    back: 'Tagasi',
    next: 'Järgmine',
    previous: 'Eelmine',
    refresh: 'Värskenda',
    loading: 'Laadimine...',
    forStars_one: '{count} tähe eest',
    forStars_other: '{count} tähe eest',
  },

  // Accessibility
  accessibility: {
    skipToContent: 'Jäta vahele navigatsioon',
  },

  // KHE site header
  siteHeader: {
    homeLabel: 'KHE.ee avaleht',
    languageLabel: 'Keel',
    darkTheme: 'Tume teema',
  },

  // The site footer (@khelias/ui)
  siteFooter: {
    linksLabel: 'Lehe lingid',
    privacy: 'Privaatsus',
    hosting: 'Ise majutatud Eestis',
  },

  // Error messages
  errors: {
    somethingWentWrong: 'Midagi läks valesti',
    gameError: 'Mängus tekkis viga. Proovi lehte värskendada.',
    refreshPage: 'Värskenda lehte',
    unknownGameType: 'Tundmatu mängutüüp',
    confirmReset: 'Kas oled kindel, et soovid kogu progressi kustutada?',
  },

  // Feedback messages
  feedback: {
    correct: [
      'Õige!',
      'Suurepärane!',
      'Väga hea!',
      'Fantastiline!',
      'Imeline!',
      'Tubli!',
      'Täiuslik!',
      'Hämmastav!',
      'Vau!',
      'Väga tubli!',
      'See on sulle lihtne!',
      'Nagu meister!',
    ],
    wrong: [
      'Proovi uuesti!',
      'Ära anna alla!',
      'Sa saad sellega hakkama!',
      'Jätka!',
      'Oled õigel teel!',
      'Proovi veel!',
      'Peaaegu!',
      'Väga lähedal!',
      'Järgmine kord läheb paremini!',
      'Ära loobu!',
    ],
    streak: [
      '2 õiget järjest!',
      '3 õiget järjest!',
      '4 õiget järjest!',
      '5 õiget järjest!',
      '6 õiget järjest!',
      '7 või rohkem õiget järjest!',
    ],
    levelUp: ['Tase tõusis!', 'Uus tase!', 'Edened!', 'Suurepärane!'],
    correctAnswerIs: 'Õige vastus oli {answer}',
    notThisOne: 'Mitte see, proovi veel!',
  },

  // Notification labels
  notifications: {
    correctTitle: 'Õige!',
    wrongTitle: 'Proovi uuesti!',
    streakSuffix: 'õiget järjest!',
    hintTitle: 'Vihje',
    tipTitle: 'Näpunäide',
    infoTitle: 'Info',
    achievementTitle: 'Saavutus!',
    levelUpTitle: 'Tase tõusis!',
    closeTip: 'Sulge näpunäide',
    closeHint: 'Sulge vihje',
    closeAchievement: 'Sulge saavutus',
    closeLevelUp: 'Sulge taseme tõus',
  },

  // Game categories
  categories: {
    language: {
      name: 'Keelemängud',
      description: 'Sõnad, tähed ja laused',
    },
    math: {
      name: 'Matemaatika',
      description: 'Arvutamine ja mõõtmine',
    },
    logic: {
      name: 'Loogika',
      description: 'Mustrid ja programmeerimine',
    },
    memory: {
      name: 'Mälu',
      description: 'Mälumängud',
    },
  },

  // Profiles
  profiles: {
    starter: {
      label: '5+',
      desc: 'Koolieelik',
    },
    advanced: {
      label: '7+',
      desc: 'Koolilaps',
    },
  },

  // Menu
  menu: {
    title: 'Tarkade Mängud',
    stats: 'Statistika',
    achievements: 'Saavutused',
    tutorial: 'Õpetus',
    settings: 'Seaded',
    reset: 'Kustuta progress',
    sound: 'Heli',
    score: 'Skoor',
    stars: 'Tähed',
    favourites: 'Lemmikud',
  },

  // Game
  game: {
    hearts: 'Südamed',
    stars: 'Tähed',
    score: 'Skoor',
    level: 'Tase',
    hint: 'Vihje',
    skip: 'Jäta vahele',
    submit: 'Esita',
    correct: 'Õige',
    wrong: 'Vale',
    gameOver: 'Mäng läbi',
    timeUp: 'Aeg läbi!',
    scoreMessage: 'Said {score} punkti!',
    returnToMenu: 'Tagasi menüüsse',
    retry: 'Proovi uuesti',
    continue: 'Jätka',
    rescueAttempt: 'Päästa katse',
    levelUp: 'Tase tõusis!',
    noHeartsLeft: 'Südamed on otsas! Täida neid poes teenitud tähtede eest.',
    highScore: 'Parim tulemus',
    newRecord: 'Uus rekord!',
    snakeSummary: {
      title: 'Selle mängu kokkuvõte',
      maxLength: 'Pikim uss',
      accuracy: 'Täpsus',
      bestStreak: 'Parim seeria',
      factsAttempted: 'Tehteid',
      hardestFacts: 'Need tehted vajavad veel harjutamist',
      noMistakes: 'Mitte ühtegi viga, tubli!',
      noFactsAttempted: 'Sa ei jõudnud ühegi tehteni. Proovi uuesti!',
    },
  },

  // Stats
  stats: {
    title: 'Statistika',
    gamesPlayed: 'Mängitud mänge',
    accuracy: 'Täpsus',
    bestStreak: 'Parim seeria',
    highestLevel: 'Kõrgeim tase',
    totalStars: 'Kokku teenitud tähed',
    spendableStars: 'Tähtede saldo',
    spendableStarsHint: 'Saad kasutada vihjete ja südamete jaoks.',
    lifetimeStarsHint: 'Ei vähene, kui poes tähti kulutad.',
    totalScore: 'Koguskoor',
    playTime: 'Mänguaeg',
    achievements: 'Saavutused',
    streakSuffix: 'järjestikust õiget',
    perGame: 'mängu kohta',
    noGamesPlayed: 'Pole veel mängutüüpe mängitud',
    mostPlayedGames: 'Kõige rohkem mängitud mängud',
    gamesLabel: 'mängu',
  },

  // Achievements
  achievements: {
    title: 'Saavutused',
    unlocked: 'Avatud',
    locked: 'Lukus',
    progress: 'Edenemine',
    modalTitle: 'Saavutused',
    collectedLabel: 'saavutust kogutud',
    items: {
      first_game: {
        title: 'Esimene samm',
        desc: 'Mängi oma esimene mäng',
      },
      perfect_5: {
        title: 'Täiuslik seeria',
        desc: 'Vasta 5 ülesannet järjest õigesti',
      },
      word_master: {
        title: 'Sõnameister',
        desc: 'Jõua Sõnameistri tasemele 5',
      },
      math_whiz: {
        title: 'Matemaatikameister',
        desc: 'Jõua Matemaatika mälu tasemele 5',
      },
      pattern_pro: {
        title: 'Mustriproff',
        desc: 'Jõua Mustri-rongi tasemele 5',
      },
      score_100: {
        title: 'Sada punkti',
        desc: 'Kogu kokku 100 punkti',
      },
      score_500: {
        title: 'Viissada punkti',
        desc: 'Kogu kokku 500 punkti',
      },
      persistent: {
        title: 'Püsivus',
        desc: 'Mängi kokku 10 mängu',
      },
      all_games: {
        title: 'Kõik mängud',
        desc: 'Proovi kõiki mängutüüpe',
      },
      star_collector_50: {
        title: 'Tähtede koguja',
        desc: 'Kogu kokku 50 tähte',
      },
      star_collector_100: {
        title: 'Tähtede meister',
        desc: 'Kogu kokku 100 tähte',
      },
      star_collector_250: {
        title: 'Tähtede legend',
        desc: 'Kogu kokku 250 tähte',
      },
      snake_master: {
        title: 'Madumeister',
        desc: 'Jõua Numbrimadu tasemele 5',
      },
      snake_growth_20: {
        title: 'Pikk madu',
        desc: 'Kasvata madu vähemalt 20 lüli pikkuseks',
      },
      snake_growth_30: {
        title: 'Väga pikk madu',
        desc: 'Kasvata madu vähemalt 30 lüli pikkuseks',
      },
      snake_growth_max: {
        title: 'Maksimaalne madu',
        desc: 'Kasvata madu maksimaalse pikkuseni (49)',
      },
      syllable_master: {
        title: 'Silbimeister',
        desc: 'Jõua Silbimeistri tasemele 5',
      },
      sentence_detective: {
        title: 'Lause-detektiiv',
        desc: 'Jõua Lause-detektiivi tasemele 5',
      },
      robo_master: {
        title: 'Robomeister',
        desc: 'Jõua Robo-raja tasemele 5',
      },
      letter_detective: {
        title: 'Tähe-detektiiv',
        desc: 'Jõua Tähe-detektiivi tasemele 5',
      },
      unit_master: {
        title: 'Ühikumeister',
        desc: 'Jõua Mõõtühikute tasemele 5',
      },
      compare_master: {
        title: 'Võrdlusmeister',
        desc: 'Jõua Arvude võrdlemise tasemele 5',
      },
      scale_master: {
        title: 'Kaalumeister',
        desc: 'Jõua Kaalude tasemele 5',
      },
      clock_master: {
        title: 'Kellameister',
        desc: 'Jõua Kellamängu tasemele 5',
      },
      cascade_master: {
        title: 'Sõnakose meister',
        desc: 'Jõua Sõnakose tasemele 5',
      },
      cascade_perfect_10: {
        title: 'Sõnakose kangelane',
        desc: 'Lõpeta 10 Sõnakose mängu',
      },
      battlelearn_first_win: {
        title: 'Esimene laevastik uputatud',
        desc: 'Võida oma esimene Laevade uputamise mäng',
      },
      battlelearn_captain: {
        title: 'Laevade kapten',
        desc: 'Jõua Laevade uputamise tasemele 5',
      },
      battlelearn_admiral: {
        title: 'Laevade admiral',
        desc: 'Jõua Laevade uputamise tasemele 10',
      },
    },
  },

  // Menu specific
  menuSpecific: {
    heading: 'Vali mäng',
    subtitle: 'Harjuta ja õpi',
    starsLabel: 'tähte',
    showAchievements: 'Näita saavutusi',
    showStats: 'Näita statistikat',
    toggleSoundOn: 'Lülita heli sisse',
    toggleSoundOff: 'Lülita heli välja',
    deleteProgress: 'Kustuta salvestatud progress',
    showTutorial: 'Näita juhendit',
    tutorial: 'Juhend',
    starCollector: 'Tähtede koguja',
    newGame: 'Uus',
    language: 'Keel',
    editFavourites: 'Muuda lemmikuid',
    editFavouritesTitle: 'Vali mängud lemmikute sektsiooni',
    save: 'Salvesta',
    allFilter: 'Kõik',
    subjects: 'Valdkonnad',
    choosePack: 'Vali harjutus',
    packCount_one: '{count} harjutus',
    packCount_other: '{count} harjutust',
    picturePairsVariantLabel: 'Pildipaaride režiim',
    picturePairsVariantEmojiOnly: 'Emoji ↔ emoji',
    picturePairsVariantEmojiWord: 'Sõna ↔ emoji',
    learnersHeading: 'Õppija',
    addLearner: 'Lisa uus õppija',
    addLearnerTitle: 'Lisa õppija',
    addLearnerNamePrompt: 'Õppija nimi:',
    addLearnerNamePlaceholder: 'Nt. Mari',
    removeLearner: 'Kustuta õppija',
    removeLearnerTitle: 'Kustuta õppija',
    removeLearnerConfirm: 'Kindlasti kustutada õppija {name}?',
    deleteProgressTitle: 'Kustuta progress',
    deleteProgressConfirm:
      'Kas kustutada kogu salvestatud progress? Seda toimingut ei saa tagasi võtta.',
    sectionProfile: 'Profiil',
    sectionProgress: 'Edenemine',
    sectionPreferences: 'Eelistused',
    sectionSystem: 'Süsteem',
    settingsTitle: 'Seaded',
  },

  // Mechanics — one entry per shared engine. The menu groups bindings by
  // mechanic and shows the title/desc here on the aggregate card.
  mechanics: {
    math_snake: {
      title: 'Numbrimadu',
      desc: 'Söö õunu, lahenda tehe',
    },
    word_cascade: {
      title: 'Sõnakosk',
      desc: 'Püüa tähti ja lao sõnu',
    },
    fact_drill: {
      title: 'Tehtesprint',
      desc: 'Lahenda tehted kiires tempos',
    },
    battlelearn: {
      title: 'Laevade uputamine',
      desc: 'Uputa laevad vastustega',
    },
  },

  // Tutorial
  tutorial: {
    welcome: {
      title: 'Tere tulemast!',
      content: 'See on õppemäng, kus saad harjutada lugemist, matemaatikat ja loogikat!',
    },
    selectAge: {
      title: 'Tase kohandub',
      content:
        'Alusta sobivast mängust. Iga oskuse tase liigub edasi eraldi ja menüü näitab sinu praegust harjutustaset.',
    },
    selectGame: {
      title: 'Vali mäng',
      content: 'Vali mäng, mida soovid mängida. Igal mängul on oma teema ja raskusaste.',
    },
    answerCorrectly: {
      title: 'Vasta õigesti',
      content:
        'Vasta õigesti, et edasi jõuda! Kui näitad oskust (õiged vastused + hea täpsus), tõused automaatselt taseme võrra ja teenid tähti!',
    },
    beCareful: {
      title: 'Ole ettevaatlik',
      content:
        'Iga vale vastus võib maksta ühe südame. Südamed on globaalsed ja säilivad mängude vahel. Kui südamed otsa saavad, saad neid poes teenitud tähtede eest juurde võtta.',
    },
    collectAchievements: {
      title: 'Kogu saavutusi',
      content: 'Kogu medaleid ja jälgi oma statistikat menüü ülevalt!',
    },
    close: 'Sulge juhend',
    back: 'Tagasi',
    next: 'Järgmine',
    startGame: 'Alusta mängu!',
  },

  // Game screen
  gameScreen: {
    returnToMenu: 'Tagasi menüüsse',
    tipsLabel: 'Näpunäited',
    progressLabel: 'Edenemine',
    levelHeldByAccuracy: 'Veel mõni õige vastus järjest, siis tuleb uus tase.',
    changeLevel: 'Muuda taset',
    gameDescriptionTitle: 'Kuidas mängida',
    starProgress: {
      one: '1/5 tähte',
      two: '2/5 tähte',
      three: '3/5 tähte',
      four: '4/5 tähte',
      last: 'Viimane täht!',
    },
    sentenceLogic: {
      selectCorrectPicture: 'Vali õige pilt',
      scene: 'Stseen',
      positions: {
        NEXT_TO: 'kõrval',
        ON: 'kohal',
        UNDER: 'all',
        IN_FRONT: 'ees',
        BEHIND: 'taga',
        INSIDE: 'sees',
      },
    },
    syllableBuilder: {
      instruction: 'Pane silbid õigesse järjekorda, et saada sõna',
      correct: 'Õige:',
    },
    letterMatch: {
      instruction: 'Leia sama täht väikese tähena',
    },
    wordBuilder: {
      instruction: 'Vaata pilti ja pane tähtedest sõna kokku',
      preFilled: 'Vihje: mõned tähed on juba õiges kohas!',
    },
    wordCascade: {
      triesLeft_one: '{count} katse jäänud',
      triesLeft_other: '{count} katset jäänud',
      outOfTries: 'Katsed otsas',
      letterLabel: 'Täht {letter}',
      tapThisLetter: 'Täht {letter}, puuduta seda',
    },
    pattern: {
      instruction: 'Jätka mustrit',
      feedbackTitle: 'Peaaegu!',
      feedbackReason: 'Muster kordub {pattern}. Järgmine peab olema {answer}.',
      feedbackChoiceLabel: 'Valisid',
      patternLabel: 'Muster',
    },
    memoryMath: {
      pairsLabel: 'Paarid',
    },
    picturePairs: {
      pairsLabel: 'Paarid',
      movesLabel: 'Käigud',
      peekLabel: 'Jäta meelde!',
    },
    timeMatch: {
      oClock: 'kell {hour}',
      halfPast: 'pool {nextHour}',
      quarterPast: 'veerand {nextHour}',
      quarterTo: 'kolmveerand {nextHour}',
    },
    mathSnake: {
      nextMathLabel: 'Järgmine tehe',
    },
    factDrill: {
      instruction: 'Vasta võimalikult kiiresti',
      keyboardHint: 'Kasuta numbriklahve ja vajuta Enter; Backspace kustutab.',
      timeLeftLabel: 'Aega',
      correctLabel: 'Õigeid',
      streakLabel: 'Seeria',
      bestStreakLabel: 'Parim seeria',
      submitLabel: 'Kinnita',
      clearLabel: 'Kustuta',
      placeholder: 'Vastus',
      feedbackCorrect: 'Õige!',
      feedbackWrong: 'Õige vastus oli {answer}',
      finalAccuracyLabel: 'Täpsus',
      restartLabel: 'Alusta uuesti',
    },
    selectLevel: 'Vali tase',
    currentLevel: 'Praegune tase',
    selectNewLevel: 'Vali uus tase',
    game: 'Mäng',
    hints: {
      wordBuilder: 'Sõna algab tähega',
      syllableBuilder: 'Sõna algab silbiga',
      balanceScale: 'Vasak pool on',
      balanceScaleRight: 'parem pool on',
      pattern: 'Vaata, mis mustrit järgib rong!',
      memoryMath: 'Pööra kaardid ümber ja leia paarid!',
      picturePairs: 'Leia pildi ja sõna paar!',
      sentenceLogic: 'Vaata, kus asub',
      sentenceLogicScene: 'stseenis!',
      roboPath: 'Robot peab jõudma rohelise aknaga lahtrisse!',
      mathSnake: 'Söö õunu ja vaata, millal tuleb matemaatika õun!',
      timeMatch: 'Vaata kella osuteid!',
      unitConversion: 'Arvuta ümber!',
      compare_sizes: 'Võrdle suurusi hoolikalt!',
      shape_dash: 'Hüppa tühikuklahviga või puudutades; vali kujundiväravas õige vastus!',
      default: 'Proovi veel!',
    },
    hintButton: {
      show: 'Näita vihjet',
      used: 'Vihje on juba kasutatud',
    },
    tipButton: {
      show: 'Ava näpunäide',
      unavailable: 'Näpunäide pole veel saadaval',
    },
    tips: {
      word_builder: [
        'Proovi mõelda, mis sõna võiks emoji järgi olla!',
        'Vaata esimest tähte - see aitab alustada!',
        'Mõtle, millised tähed sobivad kokku!',
      ],
      syllable_builder: [
        'Silbid on sõna osad - proovi neid kokku panna!',
        'Vaata, kuidas silbid kokku sobivad!',
        'Mõtle, kuidas sõna kõlab, kui loed seda!',
      ],
      pattern: [
        'Ütle pildid valjusti: õun, pirn, õun, pirn. Mis tuleb järgmisena?',
        'Otsi kohta, kus muster hakkab otsast peale.',
        'Vaata viimast vagunit ja mõtle, mis tuli selle järel eelmine kord.',
      ],
      sentence_logic: [
        'Loe lauset hoolikalt läbi!',
        'Vaata, kus objektid stseenis asuvad!',
        'Mõtle, mis on loogiline!',
      ],
      memory_math: [
        'Pööra kaardid ümber ja leia paarid!',
        'Mõtle, mis arvud kokku annavad tehte vastuse!',
        'Proovi meelde jätta, kus mis kaart on!',
      ],
      picture_pairs: [
        'Pööra kaardid ümber ja leia pildi ning sõna paar!',
        'Meenuta, kus emoji või sõna olid!',
        'Vähe paaridega alusta, siis lisa juurde!',
      ],
      balance_scale: [
        'Arvuta, kui palju on vasakul pool!',
        'Mõtle, mis arv tasakaalustab kaalud!',
        'Vaata, kui palju on paremal pool!',
      ],
      robo_path: [
        'Mõtle, kuidas robot peab liikuma!',
        'Vaata, kus on takistused!',
        'Proovi sammhaaval!',
      ],
      addition_snake: [
        'Mõtle enne, kuhu keerad: sein ja oma saba lõpetavad mängu.',
        '6 + 7: tee enne kümme täis. 6 + 4 = 10, siis veel 3, kokku 13.',
        'Arvutis saad ussi juhtida ka nooleklahvidega.',
      ],
      addition_big_snake: [
        'Liida enne kümned, siis ühed: 37 + 25 on 30 + 20 = 50 ja 7 + 5 = 12, kokku 62.',
        'Mida pikem uss, seda rohkem tuleb ette mõelda, kuhu keerata.',
        'Arvutis saad ussi juhtida ka nooleklahvidega.',
      ],
      subtraction_snake: [
        'Kontrolli liitmisega: 12 − 5 = 7, sest 5 + 7 = 12.',
        'Küsimärk tähendab puuduvat arvu. Mõtle, mis arv sinna sobib.',
        'Arvutis saad ussi juhtida ka nooleklahvidega.',
      ],
      subtraction_big_snake: [
        'Lahuta enne kümned, siis ühed: 63 − 20 = 43, siis 43 − 8 = 35.',
        'Kontrolli liitmisega: 35 + 28 = 63.',
        'Arvutis saad ussi juhtida ka nooleklahvidega.',
      ],
      multiplication_snake: [
        '3 × 4 on kolm rida, igas reas neli tähte.',
        'Kui ei mäleta, liida: 4 × 3 = 3 + 3 + 3 + 3 = 12.',
        'Arvutis saad ussi juhtida ka nooleklahvidega.',
      ],
      multiplication_big_snake: [
        '7 × 8 ununeb kergesti: 7 × 10 = 70, võta ära 7 × 2 = 14, saad 56.',
        'Kahekordista: 6 × 8 on kaks korda 3 × 8, see on 24 + 24 = 48.',
        'Arvutis saad ussi juhtida ka nooleklahvidega.',
      ],
      multiplication_fact_drill_1_5: [
        'Proovi vastata peast, ilma sõrmedel lugemata.',
        'Vale vastus ei võta südant, seeria lihtsalt algab otsast.',
        'Mängi mitu korda järjest: vastused tulevad iga korraga kiiremini.',
      ],
      multiplication_fact_drill_1_10: [
        '7 × 8 ja 6 × 9 on kõige raskemad. Võta hetk ja mõtle rahulikult.',
        'Kui ununeb, mõtle lähedasele tehtele: 6 × 9 on 6 × 10 miinus 6, see on 54.',
        'Vale vastus ei võta südant, seeria lihtsalt algab otsast.',
      ],
      addition_fact_drill_within_20: [
        'Tee kümme täis: 7 + 6 = 7 + 3 + 3 = 13.',
        'Proovi vastata peast, ilma sõrmedel lugemata.',
        'Vale vastus ei võta südant, seeria lihtsalt algab otsast.',
      ],
      addition_fact_drill_within_100: [
        'Liida kümned ja ühed eraldi: 37 + 25 on 50 ja 12, kokku 62.',
        '29 + 16: liida 30 + 16 = 46 ja võta 1 ära, saad 45.',
        'Vale vastus ei võta südant, seeria lihtsalt algab otsast.',
      ],
      subtraction_fact_drill_within_20: [
        'Suurem arv on alati ees, nii et vastus ei lähe alla nulli.',
        'Kontrolli liitmisega: 12 − 5 = 7, sest 5 + 7 = 12.',
        'Proovi vastata peast, ilma sõrmedel lugemata.',
      ],
      subtraction_fact_drill_within_100: [
        'Lahuta enne kümned, siis ühed: 63 − 20 = 43, siis 43 − 8 = 35.',
        'Kontrolli liitmisega: 35 + 28 = 63.',
        'Mängi mitu korda järjest: vastused tulevad iga korraga kiiremini.',
      ],
      division_fact_drill_1_5: [
        'Jagamine on korrutamine tagurpidi: 12 ÷ 3 = 4, sest 3 × 4 = 12.',
        'Jagamine läheb siin alati täpselt välja.',
        'Kui ununeb, mõtle korrutustabelile.',
      ],
      division_fact_drill_1_10: [
        '56 ÷ 8: mis arv korda 8 annab 56? 7 × 8 = 56, seega vastus on 7.',
        'Üks korrutustehe annab kaks jagamist: 7 × 8 = 56, siis 56 ÷ 8 = 7 ja 56 ÷ 7 = 8.',
        'Jagamine läheb siin alati täpselt välja.',
      ],
      time_match: [
        'Lühike osuti näitab tundi, pikk osuti minuteid.',
        'Kui pikk osuti näitab kaheteistkümmet, on kell täpselt see tund, näiteks kell 3.',
        'Kui pikk osuti näitab kuut, ütle „pool“ ja järgmine tund, näiteks pool 4.',
      ],
      letter_match: [
        'Vaata suurt tähte ja leia väike!',
        'Mõtle, mis täht sobib!',
        'Suur ja väike täht on sama!',
      ],
      unit_conversion: [
        'Loe küsimust hoolikalt!',
        'Mõtle ühikute vahekordadele!',
        'Kontrolli vastust väikese näitega!',
      ],
      compare_sizes: [
        'Vali õige võrdlussümbol: < (väiksem), = (võrdne) või > (suurem)',
        'Vaata mõlemat poolt hoolikalt!',
        'Loe või võrdle suurusi!',
        'Mõtle, kumb on suurem!',
      ],
      shape_shift: [
        'Lohista kujundid vastavusse pildiga',
        'Puuduta kujundit, et seda pöörata 90°',
        'Proovi erinevaid kombinatsioone!',
        'Mõtle, kuidas kujundid kokku sobivad',
      ],
      star_mapper: [
        'Puuduta tähtesid, et neid ühendada',
        'Järgi kuju ja loo tähtkuju',
        'Kasuta "Tagasi" nuppu, kui teed vea',
        'Proovi järjest tähtedest joont tõmmata',
      ],
      word_cascade: [
        'Otsi ainult seda tähte, mida sõna järgmisena vajab.',
        'Ütle sõna enne valjusti ja kuula, mis täht tuleb järgmisena.',
        'Kui jääd kinni, näitab vihje järgmist tähte.',
      ],
      word_cascade_long: [
        'Pikk sõna on sama reegel: otsi ainult järgmist tähte ja liigu vasakult paremale.',
        'Kui sõna on pikk, kasuta vihjet järgmise tähe näitamiseks.',
        'Ütle sõna enne alustamist valjusti läbi ja püüa siis tähed järjekorras kinni.',
      ],
      shape_dash: [
        'Vajuta tühikuklahvi või puuduta ekraani, et hüpata!',
        'Vältida tuleb kolmnurkseid okkaid ja kollaseid plokke.',
        'Kujundiväravas vali hüppe kõrgusega õige vastus.',
      ],
    },
  },

  // Stats modal
  statsModal: {
    title: 'Statistika',
    close: 'Sulge statistika',
    highestLevels: 'Kõrgeimad tasemed',
  },

  // Shop
  shop: {
    starsBadge: 'Tähed {value}, ava pood',
    heartsBadge: 'Südamed {value}, ava pood',
    title: 'Pood',
    yourStarBalance: 'Tähtede saldo',
    starBalanceDescription:
      'Saldo on kulutatav: teenid tähti taseme tõusuga ning kasutad neid vihjete, südamete ja teemade jaoks.',
    lifetimeStars: 'Kokku teenitud',
    yourHearts: 'Sinu südamed',
    buyHearts: 'Osta südameid',
    buyHeartsDescription:
      'Üks süda maksab 10 tähte. Südamed on ühised kõigis mängudes ja maksimum on 5.',
    buy1Heart: 'Osta 1 süda',
    buyHeartsCount: 'Osta {count} südant',
    cost: 'Hind',
    price: 'Hind',
    free: 'Tasuta',
    getMoreHearts: 'Hangi südameid',
    maxHearts: 'Maksimaalne arv südameid',
    notEnoughStars: 'Pole piisavalt tähti',
    buyStars: 'Osta tähti',
    buyStarsDescription:
      'Päris makset veel ei ole. Seni saad tähtede saldot tasuta juurde lisada; ostetud tähed ei loe saavutuste teenitud tähtede hulka.',
    buy50Stars: 'Lisa {count} tähte',
    noHeartsToPlay: 'Sul pole südameid mängimiseks!',
    buyHeartsToContinue: 'Kasuta teenitud tähti, et südameid juurde võtta.',
    themes: 'Teemad',
    themesDescription:
      'Teema muudab menüü ja mängude tausta. Ostetud teema jääb sulle ja teemat saad vahetada igal ajal.',
    tierCommon: 'Tavaline',
    tierRare: 'Haruldane',
    tierSpecial: 'Eriline',
    buyTheme: 'Osta',
    useTheme: 'Kasuta',
    themeInUse: 'Kasutusel',
    buyThemeLabel: 'Osta teema {name}, hind {cost} tähte',
    useThemeLabel: 'Kasuta teemat {name}',
    themeInUseLabel: 'Teema {name} on kasutusel',
  },

  // Robo path game
  roboPath: {
    perfect: 'Täiuslik!',
    perfectMessage: 'Leidsid lühima tee!',
    removeCommand: 'Eemalda viimane käsk',
    runRobot: 'Käivita robot',
    addCommands: 'Lisa käsud...',
    youUsed: 'Sul kulus',
    commands: 'käsku',
    optimalIs: 'Lühim tee:',
    tryAgainButton: 'Proovi uuesti',
    continueButton: 'Jätka',
    greatJob: 'Tubli töö!',
    tryAgainForBetter: 'Kas proovid lühemat teed?',
    legendStart: 'Start',
    legendObstacle: 'Keelatud',
    legendGoal: 'Eesmärk',
    legendHint: 'Vihje',
    commandCount: 'Käsud',
    oneCommandLeft: 'Veel üks käsk',
  },

  // Unit conversion game
  unitConversion: {
    question: 'Mitu {to} on {value} {from}?',
    instruction: 'Arvuta ja vali õige vastus',
    units: {
      m: 'meetrit',
      km: 'kilomeetrit',
      cm: 'sentimeetrit',
      mm: 'millimeetrit',
      kg: 'kilogrammi',
      g: 'grammi',
      t: 'tonni',
      l: 'liitrit',
      ml: 'milliliitrit',
      dl: 'detsiliitrit',
    },
    unitsOne: {
      m: 'meeter',
      km: 'kilomeeter',
      cm: 'sentimeeter',
      mm: 'millimeeter',
      kg: 'kilogramm',
      g: 'gramm',
      t: 'tonn',
      l: 'liiter',
      ml: 'milliliiter',
      dl: 'detsiliiter',
    },
  },

  // Level up modal
  levelUp: {
    level: 'Tase',
    greatWork: 'Suurepärane töö! Oled tõeline meister.',
    nextLevel: 'Järgmine tase',
    starsEarned_one: 'Said {count} tähe',
    starsEarned_other: 'Said {count} tähte',
  },

  // Game names and descriptions
  games: {
    word_builder: {
      title: 'Sõnameister',
      desc: 'Lao tähtedest sõna kokku',
      gameDescription:
        'Näed pilti (emoji) ja pead valima õiged tähed järjekorras, et moodustada sõna. Tähed on segamini – vali need õiges järjekorras. Alusta esimesest tähest!',
      hintRevealNextCost: 'Näita järgmist tähte',
      hintEliminateCost: 'Eemalda üks vale täht',
    },
    word_cascade: {
      title: 'Sõnakosk',
      desc: 'Tavalised sõnad',
      gameDescription:
        'Tähed langevad tulpades. Puuduta tähte, mida sõna järgmisena vajab, ja kirjuta sõna valmis. Kolm valet puudutust järjest lõpetavad mängu ja võtavad ühe südame.',
      hintRevealNextCost: 'Näita järgmist tähte',
    },
    word_cascade_long: {
      title: 'Pikad sõnad',
      desc: 'Pikemad Sõnakose sõnad',
      gameDescription:
        'See on Sõnakose pikemate sõnade pakk. Puuduta langevaid tähti õiges järjekorras ja ehita 8-11 tähega sõna lõpuni valmis. Kui läheb keeruliseks, kasuta järgmise tähe vihjet.',
    },
    syllable_builder: {
      title: 'Silbimeister',
      desc: 'Pane silbid sõnaks kokku',
      gameDescription:
        'Näed pilti ja silpe. Puuduta silpe õiges järjekorras, nii et neist saab pildil oleva asja nimi. Kui eksid, puuduta sõnas olevat silpi ja see läheb tagasi.',
    },
    pattern: {
      title: 'Mustri-rong',
      desc: 'Jätka mustrit',
      gameDescription:
        'Rongi vagunitel on pildid, mis korduvad kindlas järjekorras. Vali kolmest vagunist see, mis tuleb rongi lõppu järgmisena.',
      hintEliminateCost: 'Eemalda üks vale',
    },
    sentence_logic: {
      title: 'Lause-detektiiv',
      desc: 'Kus asub ese?',
      gameDescription:
        'Loe lauset, näiteks „Kass on diivani peal“. Vali pilt, kus ese on täpselt seal, kus lause ütleb.',
    },
    memory_math: {
      title: 'Matemaatika mälu',
      desc: 'Leia tehe ja vastus',
      gameDescription:
        'Pööra kaardid ümber ja leia paarid: üks kaart on tehe (nt 3+4) ja teine on vastus (7). Mäluta, kus kumb kaart on, et paarid kiiresti leida.',
      hintRevealPairCost: 'Näita üht paari',
    },
    picture_pairs: {
      title: 'Pildipaarid',
      desc: 'Leia pildi ja sõna paar',
      gameDescription:
        'Klassikaline mälumäng: pööra kaardid ümber ja leia pildi (emoji) ja sõna paar. Enne mängu näed kaarte lühikest aega – jäta asukohad meelde!',
      hintRevealPairCost: 'Näita üht paari',
    },
    robo_path: {
      title: 'Robo-rada',
      desc: 'Programmeerirobot',
      gameDescription:
        'Pane nooltega kirja, kuidas robot liigub, et ta jõuaks akuni. Kivist ei saa läbi minna. Kui käsud on valmis, vajuta „Käivita robot“.',
    },
    letter_match: {
      title: 'Tähe-detektiiv',
      desc: 'Leia õige täht',
      gameDescription:
        'Näed suurt tähte. Leia valikutest sama täht väikese tähena. Alguses on valikus kolm tähte, hiljem neli.',
    },
    unit_conversion: {
      title: 'Mõõtühikud',
      desc: 'Muunda ühikuid',
      gameDescription:
        'Teisenda ühest mõõtühikust teise (nt meetrid sentimeetriteks, kilogrammid grammideks). Loe ülesannet hoolikalt ja vali õige vastus.',
      hintEliminateCost: 'Eemalda üks vale',
    },
    balance_scale: {
      title: 'Kaalud',
      desc: 'Tasakaalusta kaalud',
      gameDescription:
        'Vasakul kaalul on raskused. Arvuta vasaku poole summa ja vali kaal, mis tasakaalustab parema poole. Vali õige raskus neljast valikust.',
      hintEliminateCost: 'Eemalda üks vale',
      chooseWeight: 'Milline kaal tasakaalustab?',
    },
    time_match: {
      title: 'Kellamäng',
      desc: 'Määra kellaaeg',
      gameDescription:
        'Vaata kella osuteid: lühike näitab tundi, pikk minuteid. Vali õige kellaaeg. Alguses on vastused sõnadega, näiteks „kell 3“ või „pool 4“, hiljem numbritega, näiteks 3:05.',
      hintEliminateCost: 'Eemalda üks vale aeg',
    },
    addition_snake: {
      title: 'Liitmisuss',
      desc: 'Liitmine kuni 20',
      gameDescription:
        'Juhi ussi noolenuppudega ja söö õunu. Iga teine või kolmas õun toob liitmisülesande, vastused kuni 20. Õige vastus teeb ussi pikemaks. Ära sõida vastu seina ega oma saba.',
      hintEliminateCost: 'Eemalda üks vale',
    },
    addition_big_snake: {
      title: 'Suur liitmisuss',
      desc: 'Liitmine kuni 100',
      gameDescription:
        'Nagu liitmisuss, aga arvud on kuni 100. Juhi ussi noolenuppudega ja söö õunu. Iga teine või kolmas õun toob liitmisülesande.',
      hintEliminateCost: 'Eemalda üks vale',
    },
    subtraction_snake: {
      title: 'Lahutususs',
      desc: 'Lahutamine kuni 20',
      gameDescription:
        'Juhi ussi noolenuppudega ja söö õunu. Iga teine või kolmas õun toob lahutamisülesande kuni 20, mõnikord puuduva arvuga (? − 5 = 3). Õige vastus teeb ussi pikemaks.',
      hintEliminateCost: 'Eemalda üks vale',
    },
    subtraction_big_snake: {
      title: 'Suur lahutususs',
      desc: 'Lahutamine kuni 100',
      gameDescription:
        'Nagu lahutususs, aga arvud on kuni 100. Juhi ussi noolenuppudega ja söö õunu. Iga teine või kolmas õun toob lahutamisülesande.',
      hintEliminateCost: 'Eemalda üks vale',
    },
    multiplication_snake: {
      title: 'Korrutususs',
      desc: 'Korrutustabel 1–5',
      gameDescription:
        'Juhi kosmoseussi noolenuppudega ja korja tähti. Iga teise või kolmanda tähe asemel tuleb planeet korrutamisega, näiteks 3 × 4, arvudega 2 kuni 5. Õige vastus teeb ussi pikemaks.',
      hintEliminateCost: 'Eemalda üks vale',
    },
    multiplication_big_snake: {
      title: 'Suur korrutususs',
      desc: 'Korrutustabel 1–10',
      gameDescription:
        'Kogu korrutustabel arvudega 2 kuni 10. Juhi ussi noolenuppudega ja korja tähti. Iga teise või kolmanda tähe asemel tuleb planeet korrutamisega.',
      hintEliminateCost: 'Eemalda üks vale',
    },
    multiplication_fact_drill_1_5: {
      title: 'Korrutussprint 1–5',
      desc: 'Korrutustabel 1–5 kiires tempos',
      gameDescription:
        'Lahenda 60 sekundi jooksul nii palju korrutustehte kui võimalik. Faktorid 2–5. Eesmärk on automatiseerida korrutustabel – vastus tuleb mälust, mitte loendades. Vale vastus seeria katkestab, aga ei karista.',
    },
    multiplication_fact_drill_1_10: {
      title: 'Korrutussprint 1–10',
      desc: 'Korrutustabel 1–10 kiires tempos',
      gameDescription:
        'Kogu korrutustabel 60-sekundilise sprindis. Faktorid 2–10. Sobib 3. klassi tasemele, kui korrutustabel on juba tuttav ja soovid kiirust harjutada.',
    },
    addition_fact_drill_within_20: {
      title: 'Liitmissprint 20',
      desc: 'Liitmine kuni 20 kiires tempos',
      gameDescription:
        '60-sekundiline liitmissprint operandidega 1–10 (summad kuni 20). Eesmärk on automatiseerida liitmistabel – vastus tuleb mälust, mitte loendades.',
    },
    addition_fact_drill_within_100: {
      title: 'Liitmissprint 100',
      desc: 'Liitmine kuni 100 kiires tempos',
      gameDescription:
        'Liitmissprint suuremate arvudega (operandid 1–50, summad kuni 100). Sobib 2.–3. klassile, kui väiksem liitmine on juba tuttav.',
    },
    subtraction_fact_drill_within_20: {
      title: 'Lahutussprint 20',
      desc: 'Lahutamine kuni 20 kiires tempos',
      gameDescription:
        '60-sekundiline lahutussprint operandidega 1–20. Tehe alati näitab suuremast arvust väiksema – vastus jääb positiivne.',
    },
    subtraction_fact_drill_within_100: {
      title: 'Lahutussprint 100',
      desc: 'Lahutamine kuni 100 kiires tempos',
      gameDescription:
        'Lahutussprint operandidega 1–100. Sobib 3. klassile, kui väiksem lahutamine on juba tuttav.',
    },
    division_fact_drill_1_5: {
      title: 'Jagamissprint 1–5',
      desc: 'Jagamine 1–5 kiires tempos',
      gameDescription:
        'Jagamissprint korrutustabeli 1–5 põhjal. Iga tehe annab täisarvulise vastuse (12 ÷ 3 = 4). Sobib 3. klassile, kui korrutustabel on juba selge.',
    },
    division_fact_drill_1_10: {
      title: 'Jagamissprint 1–10',
      desc: 'Jagamine 1–10 kiires tempos',
      gameDescription:
        'Kogu korrutustabeli pööre 60-sekundilise sprindis. Vastused alati täisarvulised. Sobib 3.–4. klassile.',
    },
    compare_sizes: {
      title: 'Arvude võrdlemine',
      desc: 'Võrdle arve',
      gameDescription:
        'Võrdle kaht arvu või kogust. Vali õige sümbol: < (väiksem), = (võrdne) või > (suurem). Vaata mõlemat poolt hoolikalt.',
      instruction: 'Võrdle pooli ja vali õige märk',
      leftBigger: 'Vasak on suurem',
      rightBigger: 'Parem on suurem',
      equal: 'Nad on võrdsed',
      leftItem: 'Vasak arv',
      rightItem: 'Parem arv',
      hintEliminateCost: 'Eemalda üks vale',
    },
    shape_shift: {
      title: 'Kujundaja',
      desc: 'Ehita kujundeid tükkidest',
      gameDescription:
        'Lohista geomeetrilised tükid lauale ja paiguta need pildile vastavusse. Puuduta tükki, et teda 90° pöörata. Mõnes režiimis tuleb ehitada kujund ise või leida üleliigne tükk.',
      instructions: {
        match: 'Lohista tükid õigetesse kohtadesse',
        rotate: 'Puuduta pööramiseks, lohista paigutamiseks',
        build: 'Ehita kujund tükkidest',
        expert: 'Üks tükk on üleliigne!',
      },
      tapToRotate: 'Puuduta pööramiseks',
      dragToPlace: 'Lohista paigutamiseks',
      dragHint: 'Lohista kujund laudale alustamiseks',
      firstMovePrompt: 'Lohista tükk sobivale varjule',
      remainingCount: 'Jäänud {count} tükki',
      adjustPlacedPieces: 'Sobita tükid varjudega',
      allPiecesPlaced: 'Kõik tükid on laual',
      hintOutline: 'Näita värve',
      hintPlacePiece: 'Paiguta üks tükk',
      hintOutlineCost: 'Näita värve',
      hintPlacePieceCost: 'Paiguta üks tükk',
      hintOutlineUsed: 'Kontuur juba kasutatud',
      hintPlacePieceUsed: 'Üks juba paigutatud',
      hintOutlineDescription: 'Näita korraks värvilist lahenduse kontuuri',
      hintPlacePieceDescription: 'Paigutan ühe tüki sinna õigesse kohta',
      hintText:
        'Lohista kujundid sobivatele varjudele. Puuduta pööramiseks. Vihje võib värvid korraks ette näidata.',
      rotateButton: 'Pööra 90°',
      orUse: 'või kasuta',
      piecesRemaining: 'Tükke jäänud',
      complete: 'Suurepärane!',
      tryAgain: 'Proovi uuesti',
      categories: {
        shapes: 'Kujundid',
        animals: 'Loomad',
        objects: 'Esemed',
        letters: 'Tähed',
        abstract: 'Abstraktsed',
      },
      puzzleNames: {
        simple_square: 'Ruut',
        simple_house: 'Maja',
        simple_tree: 'Puu',
        simple_diamond: 'Romb',
        ice_cream: 'Jäätis',
        cat_face: 'Kass',
        fish: 'Kala',
        boat: 'Paat',
        arrow_right: 'Nool',
        mushroom: 'Seen',
        butterfly: 'Liblikas',
        rocket: 'Rakett',
        bird: 'Lind',
        heart: 'Süda',
        star: 'Täht',
        castle: 'Loss',
      },
    },
    star_mapper: {
      title: 'Tähekujundid',
      desc: 'Õpi tundma tähtkujusid',
      gameDescription:
        'Ühenda tähed joontega, et moodustada tähtkuju (nt Suur Vanker). Mõnes režiimis järgid juhiseid, mõnes ehitad mälu järgi. Võid kasutada "Tagasi" nuppu, kui teed vea.',
    },
    shape_dash: {
      title: 'Kujundite jooks',
      desc: 'Hüppa, väldi takistusi ja vasta geomeetriale',
      gameDescription:
        'Sinu tegelane jookseb ise edasi. Vajuta tühikuklahvi või puuduta ekraani, et hüpata takistuste üle. Läbi õige kujundi värava jookstes vastame geomeetria küsimustele! Vale värav = kaotad combo/kilbi, aga jooksed edasi. Kaks valet järjest või kokkupõrge takistustega = mäng läbi.',
      tapToRetry: 'Vajuta uuesti proovimiseks',
      jumpLabel: 'Hüppa',
      playAreaLabel: 'Kujundite jooksu mänguala',
      completeLabel: 'Tase läbitud!',
      jumpHint: 'või puuduta hüppamiseks • Topelthüpe on olemas!',
      attemptLabel: 'Katse',
      scoreLabel: 'Skoor',
      starsLabel: 'Tähed',
      shieldLabel: 'Kilp',
      hintRevealGateCost: 'Näita õiget väravat',
      hintSlowTimeCost: 'Aeglusta aega väravate juures',
      gateApproaching: 'Kujundi värav ees!',
      gateCorrect: 'Õige värav! +200',
      gateWrong: 'Vale värav! -Combo',
      consecutiveWrongWarning: 'Hoiatus: Veel üks vale värav = kokkupõrge!',
      oneMoreWrongWarning: 'Veel üks vale ja põrkad kokku!',
      wrongGateNextWarning: 'Vale värav! Järgmine vale paneb põrkama.',
      shieldLost: 'Kilp kadus!',
      shapeNames: {
        Triangle: 'Kolmnurk',
        Square: 'Ruut',
        Pentagon: 'Viisnurk',
        Hexagon: 'Kuusnurk',
        Circle: 'Ring',
        Rectangle: 'Ristkülik',
        Rhombus: 'Romb',
        Oval: 'Ovaal',
      },
      questions: {
        triangleSides: 'Mitu külge on kolmnurgal?',
        squareSides: 'Mitu külge on ruudul?',
        pentagonSides: 'Mitu külge on viisnurgal?',
        hexagonSides: 'Mitu külge on kuusnurgal?',
        circleSides: 'Mitu külge on ringil?',
        rectangleSides: 'Mitu külge on ristkülikul?',
        triangleName: 'Kolmnurk – mitu külge?',
        squareName: 'Ruut – mitu külge?',
        triangleVertices: 'Mitu tippu on kolmnurgal?',
        squareVertices: 'Mitu tippu on ruudul?',
        rectangleCorners: 'Mitu nurka on ristkülikul?',
        hexagonSidesAlt: 'Mitu külge on kuusnurgal?',
        whichThree: 'Millisel kujul on 3 külge?',
        whichFour: 'Millisel kujul on 4 külge?',
        whichSix: 'Millisel kujul on 6 külge?',
        circleEdges: 'Mitu serva on ringil?',
        whichFive: 'Millisel kujul on 5 külge?',
        whichZero: 'Millisel kujul on 0 külge?',
        octagonSides: 'Mitu külge on kaheksanurgal?',
        triangleCorners: 'Mitu nurka on kolmnurgal?',
        squareCorners: 'Mitu nurka on ruudul?',
        pentagonVertices: 'Mitu tippu on viisnurgal?',
        hexagonVertices: 'Mitu tippu on kuusnurgal?',
        rectangleSidesCount: 'Mitu külge on ristkülikul?',
        rhombusSides: 'Mitu külge on rombil?',
        ovalSides: 'Mitu külge on ovaalil?',
        starPoints: 'Mitu tipu on viisnurkstel tähel?',
      },
    },
    battlelearn: {
      title: 'Laevade uputamine',
      desc: 'Uputa laevad ja õpi matemaatikat',
      gameDescription:
        'Vali ruut võrgustikul – kui seal on laev, saad tabamuse; kui tühi, napib. Mõnel ruudul tuleb vastata matemaatika- või loogikaküsimusele. Uputa kõik laevad, et võita!',
      hintRevealEmptyCost: 'Näita üht tühja ruutu',
      hintRevealCost: 'Näita üht laeva asukohta',
      hintEliminateCost: 'Eemalda üks vale vastus',
    },
    battlelearn_multiplication: {
      title: 'Laevade uputamine: korrutustabel',
      desc: 'Uputa laevad korrutustabeli abil',
      hintRevealEmptyCost: 'Näita üht tühja ruutu',
      hintRevealCost: 'Näita üht laeva asukohta',
      hintEliminateCost: 'Eemalda üks vale vastus',
    },
    battlelearn_multiplication_1_5: {
      title: 'Laevade uputamine: korrutustabel 1-5',
      desc: 'Uputa laevad korrutustabeliga 1-5',
      hintRevealEmptyCost: 'Näita üht tühja ruutu',
      hintRevealCost: 'Näita üht laeva asukohta',
      hintEliminateCost: 'Eemalda üks vale vastus',
    },
  },

  // Difficulty levels
  difficulty: {
    easy: 'Lihtne',
    medium: 'Keskmine',
    hard: 'Raske',
  },

  // Star Mapper game
  starMapper: {
    title: 'Tähekujundid',
    desc: 'Õpi tundma tähtkujusid',
    instructions: {
      trace: 'Ühenda tähed, järgides juhisjooni',
      build: 'Ühenda tähed mälu järgi',
      identify: 'Mis tähtkuju see on?',
      expert: 'Leia ja ühenda õiged tähed',
    },
    hint: 'Vihje',
    undo: 'Võta tagasi',
    tryAgain: 'Proovi uuesti',
    linesRemaining: 'Jooni jäänud: {count}',
    complete: 'Suurepärane!',
    hintGuideCost: 'Näita juhiseid',
    starLabel: 'Täht {name}',
    selected: 'valitud',
    hintConnectCost: 'Ühenda üks joon',
    constellations: {
      ursa_major: { name: 'Suur Vanker', folk: 'Odamus', desc: 'Põhjataeva kuulsaim tähtkuju' },
      ursa_minor: { name: 'Väike Vanker', folk: 'Väike Vanker', desc: 'Siin asub Põhjanael' },
      cassiopeia: { name: 'Kassiopeia', desc: 'W-kujuline kuninganna' },
      orion: { name: 'Orion', folk: 'Reha ja Vikat', desc: 'Talvine kütt kolme vöötähega' },
      cygnus: { name: 'Luik', desc: 'Suvine rist taevas' },
      leo: { name: 'Lõvi', desc: 'Kevadine lõvi' },
      lyra: { name: 'Lüüra', desc: 'Siin on hele täht Vega' },
      aquila: { name: 'Kotkas', desc: 'Siin on hele täht Altair' },
      pegasus: { name: 'Pegasus', desc: 'Sügisene suur ruut' },
      draco: { name: 'Draakon', desc: 'Looklev nagu lohe saba' },
      cepheus: { name: 'Kefeus', desc: 'Kuningas põhjataevas' },
      taurus: { name: 'Sõnn', desc: 'Talvine härg Aldebaraniga' },
      gemini: { name: 'Kaksikud', desc: 'Castor ja Pollux' },
      auriga: { name: 'Veomees', desc: 'Veomees Capella tähega' },
      andromeda: { name: 'Andromeda', desc: 'Tähtede rida, mis näitab teed galaktikani' },
      corona_borealis: { name: 'Põhjakroon', desc: 'Tähtede poolring nagu kroon' },
    },
    seasons: {
      circumpolar: 'Aastaringne',
      winter: 'Talv',
      spring: 'Kevad',
      summer: 'Suvi',
      autumn: 'Sügis',
    },
  },

  // BattleLearn game
  battlelearn: {
    title: 'Laevade uputamine',
    desc: 'Uputa laevad ja õpi matemaatikat',
    instructions: 'Tulista lahtri poole! Vasta küsimusele ainult siis, kui tabad ülesande lahtri.',
    answerToContinue: 'Vasta küsimusele, et jätkata tulistamist:',
    shipsSunk: 'Uputatud',
    strikesAriaLabel: '{count} vee tabamust enne südame kaotamist',
    hit: 'Tabamus!',
    miss: 'Mööda! Vasta küsimusele.',
    victory: 'Võit!',
    allShipsSunk: 'Kõik laevad uppusid!',
    alreadyShot: 'Sinna oled juba lasknud!',
    questions: {
      // Counting questions
      countShips: 'Mitu laeva?',
      countObjects: 'Mitu {item}?',
      // Arithmetic questions
      simpleAddition: '{a} laeva + {b} laeva = ?',
      simpleSubtraction: '{a} laeva - {b} laeva = ?',
      ammunition: 'Oli {total} torpeedot, tulistatud on {fired}. Kui palju on alles?',
      missingNumber: '{a} + ? = {result}',
      missingNumberSub: '{a} - ? = {result}',
      // Comparison questions
      greaterThan: 'Kumb on suurem: {a} või {b}?',
      lessThan: 'Kumb on väiksem: {a} või {b}?',
      // Coordinate questions
      navigate: 'Alguspositsioon {start}. Liigu {moves} sammu paremale. Uus koordinaat?',
      navigateLeft: 'Alguspositsioon {start}. Liigu {moves} sammu vasakule. Uus koordinaat?',
      navigateUp: 'Alguspositsioon {start}. Liigu {moves} sammu üles. Uus koordinaat?',
      navigateDown: 'Alguspositsioon {start}. Liigu {moves} sammu alla. Uus koordinaat?',
      // Pattern questions
      patternNext: 'Signaali muster: {pattern}, __',
      sequenceNext: 'Järgmine arv: {sequence}, __',
      // Word problems
      wordProblem1: 'Kapten nägi hommikul {a} laeva ja õhtul {b} laeva. Kokku mitu laeva?',
      wordProblem2:
        'Laeval oli {total} meremeest. Seejärel lahkus {left} meremeest. Mitu jäi laevale?',
      wordProblem3:
        'Igal laeval on {perShip} kahurit. Kui laevu on {ships}, siis kokku mitu kahurit?',
      // Time-based
      timeProblem:
        'Reis algas kell {start}:00 ja kestis {duration} tundi. Millal reis lõppes? (anna vastuseks tunninumber)',
      // Money counting
      coinProblem: 'Sul on {count} münti, igaüks {value}€ väärt. Kui palju raha kokku?',
      // Multi-step
      twoStep:
        'Sadamasse saabus {a} laeva ja lahkus {b} laeva. Algselt oli seal {initial} laeva. Mitu laeva on nüüd sadamas?',
      // Logic puzzles
      logicPuzzle: 'Kui {a} > {b} ja {b} > {c}, siis {a} ? {c} (vali: >, < või =)',
      // Area/perimeter
      areaProblem:
        'Laeva võrk on {width} × {height} ruutu suur. Kui suur on pindala (ruutühikutes)?',
      perimeterProblem: 'Doki võrk on {width} × {height} ruutu. Kui pikk on ümbermõõt (ühikutes)?',
      // Direction sequences
      // Advanced coordinate
      multiMove:
        'Alguspunkt on {start}. Liigu {right} sammu paremale ja {up} sammu üles. Mis on uus koordinaat?',
      // Vector addition
      vectorAdd:
        'Laev liigub {right1} sammu paremale ja {up1} sammu üles, siis {right2} sammu paremale ja {up2} sammu üles. Kokku mitu sammu?',
      // Distance
      distance: 'Laev asub {coord1}, sihtmärk on {coord2}. Mitu ühikut kaugusel?',
      // Multiplication
      multiplicationFact: '{a} × {b} = ?',
      fleetMultiply:
        'Ühel hävitajal on {cannons} kahurit. Hävitajaid on {ships}. Kokku mitu kahurit?',
      // Formation problems
      formationCount:
        'Esimeses reas {row1} laeva, teises reas {row2} laeva, kolmandas reas {row3} laeva. Kokku mitu laeva?',
      // Strategic positioning
    },
  },

  // Level label
  level: 'Tase',
} as const;

export type TranslationKey = typeof et;
