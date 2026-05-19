/**
 * Estonian translations
 * Eesti keele tõlked
 */
export const et = {
  // Common
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
  },

  // Accessibility
  accessibility: {
    skipToContent: 'Jäta vahele navigatsioon',
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
      'ÕIGE! 🌟',
      'SUUREPÄRANE! ⭐',
      'VÄGA HEA! 🎉',
      'FANTASTILINE! 🚀',
      'IMELISELT! ✨',
      'TUBLI! 💪',
      'TÄIUSLIK! 🏆',
      'HÄMMASTAV! 🌈',
      'WOW! 🔥',
      'VÄGA TUBLI! 🎊',
      'SULLE LIHTNE! 💯',
      'PROFESSIONAALNE! 🎯',
    ],
    wrong: [
      'PROOVI UUESTI! 💪',
      'ÄRA ANNA ALLA! 🌟',
      'SAAD SEDA! ⭐',
      'JÄTKA! 🚀',
      'LÄHED ÕIGELE TEEDELE! 🎯',
      'PROOVI VEEL! 💡',
      'PEAAEGU! ✨',
      'VÄGA LÄHEDAL! 🎉',
      'JÄRGMINE KORD! 🌈',
      'ÄRA LOOBU! 💪',
    ],
    streak: [
      '2 ÕIGET JÄRJEST! 🔥',
      '3 ÕIGET JÄRJEST! ⭐⭐',
      '4 ÕIGET JÄRJEST! 🌟🌟',
      '5 ÕIGET JÄRJEST! 🏆',
      '6 ÕIGET JÄRJEST! 💯',
      '7+ ÕIGET JÄRJEST! 🚀',
    ],
    levelUp: ['TASE TÕUSIS! 🎊', 'UUS TASE! 🌟', 'EDENED! ⭐', 'SUUREPÄRANE! 🏆'],
    correctAnswerIs: 'Õige vastus oli {answer}',
    notThisOne: 'Mitte see — proovi veel!',
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
    selectProfile: 'Vali profiil',
    stats: 'Statistika',
    achievements: 'Saavutused',
    tutorial: 'Õpetus',
    settings: 'Seaded',
    reset: 'Kustuta progress',
    sound: 'Heli',
    soundOn: 'Heli sisse',
    soundOff: 'Heli välja',
    score: 'Skoor',
    stars: 'Tähed',
    featured: 'Soovitatud',
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
    newAchievement: 'Uus saavutus!',
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
      noMistakes: 'Mitte ühtegi viga — tubli!',
      noFactsAttempted: 'Sa ei jõudnud ühegi tehteni — proovi uuesti!',
    },
  },

  // Stats
  stats: {
    title: 'Statistika',
    gamesPlayed: 'Mängitud mänge',
    accuracy: 'Täpsus',
    bestStreak: 'Parim seeria',
    highestLevel: 'Kõrgeim tase',
    totalStars: 'Elu jooksul teenitud tähed',
    spendableStars: 'Kulutatav tähe saldo',
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
    modalTitle: 'Saavutused 🏅',
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
        desc: 'Kasvata madu vähemalt 20 pikkuseks',
      },
      snake_growth_30: {
        title: 'Väga pikk madu',
        desc: 'Kasvata madu vähemalt 30 pikkuseks',
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
        title: 'Lause detektiiv',
        desc: 'Jõua Lause detektiivi tasemele 5',
      },
      robo_master: {
        title: 'Robomeister',
        desc: 'Jõua Robo-raja tasemele 5',
      },
      letter_detective: {
        title: 'Tähe detektiiv',
        desc: 'Jõua Tähe detektiivi tasemele 5',
      },
      unit_master: {
        title: 'Ühikumeister',
        desc: 'Jõua Ühikute tasemele 5',
      },
      compare_master: {
        title: 'Võrdlusmeister',
        desc: 'Jõua Numbrivõrdluse tasemele 5',
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
        desc: 'Lõpeta 10 Sõnakoske mängu',
      },
      battlelearn_first_win: {
        title: 'Esimene laevastik uputatud',
        desc: 'Võida oma esimene Laevade mäng',
      },
      battlelearn_captain: {
        title: 'Laevade kapten',
        desc: 'Jõua Laevade tasemele 5',
      },
      battlelearn_admiral: {
        title: 'Laevade admiral',
        desc: 'Jõua Laevade tasemele 10',
      },
    },
  },

  // Menu specific
  menuSpecific: {
    heading: 'Vali mäng',
    subtitle: 'Harjuta ja õpi',
    starsLabel: 'tähte',
    achievementsCount: 'saavutust - kliki, et näha kõiki',
    showAchievements: 'Näita saavutusi',
    showStats: 'Näita statistikat',
    toggleSoundOn: 'Lülita heli sisse',
    toggleSoundOff: 'Lülita heli välja',
    deleteProgress: 'Kustuta salvestatud progress',
    showTutorial: 'Näita juhendit',
    tutorial: 'Juhend',
    starterDescription: '👶 Vali mäng ja harjuta lugemist ja loogikat!',
    advancedDescription: '🧒 Vali mäng ja harjuta matemaatikat ja mõtlemist!',
    gamesCount: 'mängu',
    starCollector: '⭐ Tähtede koguja!',
    starMaster: '⭐⭐ Tähtede meister!',
    starLegend: '✨ Tähtede legenda!',
    newGame: 'UUS!',
    language: 'Keel',
    selectLanguage: 'Vali keel',
    editFavourites: 'Muuda lemmikuid',
    editFavouritesTitle: 'Vali mängud lemmikute sektsiooni',
    save: 'Salvesta',
    allGames: 'Kõik mängud',
    choosePack: 'Vali harjutus',
    packCount_one: '{count} harjutus',
    packCount_other: '{count} harjutust',
    picturePairsVariantLabel: 'Pildipaaride režiim',
    picturePairsVariantEmojiOnly: 'Emoji ↔ emoji',
    picturePairsVariantEmojiWord: 'Sõna ↔ emoji',
    learnersHeading: 'Õppija',
    switchLearner: 'Vaheta õppijat',
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
      title: 'NUMBRIMADU',
      desc: 'Söö õunu, lahenda tehe',
    },
    word_cascade: {
      title: 'SÕNAKOSK',
      desc: 'Püüa tähti ja lao sõnu',
    },
    fact_drill: {
      title: 'TEHTESPRINT',
      desc: 'Lahenda tehted kiires tempos',
    },
    battlelearn: {
      title: 'LAEVADE UPUTAMINE',
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
    gameDescriptionTitle: 'Kuidas mängida',
    starProgress: {
      one: '1/5 tähte! 🌟',
      two: '2/5 tähte! ⭐⭐',
      three: '3/5 tähte! ⭐⭐⭐',
      four: '4/5 tähte! ⭐⭐⭐⭐',
      last: 'Viimane täht! ⭐⭐⭐⭐⭐',
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
      instruction: 'PANE SILBID ÕIGESSE JÄRJEKORDA, ET SAADA SÕNA',
      correct: 'ÕIGE:',
    },
    wordBuilder: {
      preFilled: 'Vihje: mõned tähed on juba õiges kohas!',
      useAllLetters: 'Kasuta kõiki õigeid tähti',
      watchCase: 'Pane tähele suuri ja väikeseid tähti!',
    },
    wordCascade: {
      tapLetters: 'Puuduta tähti, et sõna kokku panna',
      tryAgain: 'Proovi uuesti!',
      wrongLetter: 'Vale täht',
      triesLeft: '{count} katset jäänud',
      outOfTries: 'Katsed otsas',
      greatJob: 'Tubli töö!',
      tutorial:
        'Puuduta langevaid tähti, et sõna kokku panna. Punasele barjäärile jõudnud tähed annavad veamärke!',
      starPickup: 'Tähtede boonus',
      heartPickup: 'Südame boonus',
      shieldPickup: 'Veamärgi kaitse',
      pickupHint: 'Puuduta tähti, südameid ja kilpe, et saada boonuseid!',
      tapGlowingLetter: 'Puuduta all olevat helendavat tähte!',
    },
    pattern: {
      tagline: 'Mustri-rong',
      instruction: 'Jätka mustrit',
      subInstruction: 'Puuduta järgmist vagunit',
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
      selectCorrectTime: 'Vali õige kellaaeg',
      correctTimeIs: 'Õige aeg on',
      oClock: 'kell {hour}',
      halfPast: 'pool {hour}',
      quarterPast: 'veerand {hour}',
      quarterTo: 'kolmveerand {hour}',
    },
    mathSnake: {
      tagline: 'Numbrimadu',
      instruction: 'Liigu nooleklahvidega ja söö õunu. Matemaatika õun annab boonuse.',
      solveLabel: 'Lahenda',
      chooseApple: 'Söö õunu. Matemaatika õun annab +1 või -2 pikkust.',
      keyboardHint: 'Kasuta nooleklahve või WASD klahve.',
      lengthLabel: 'Pikkus',
      nextMathLabel: 'Järgmine tehe',
    },
    factDrill: {
      tagline: 'Tehtesprint',
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
        'Mustri-rong',
        'Jätka mustrit',
        'Puuduta järgmist vagunit',
        'Vaata, mis mustrit järgib rong!',
        'Mõtle, mis järgmisena peaks tulema!',
        'Vaata, kuidas emojid korduvad!',
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
        'Kõik tehted on liitmine, summa kuni 20!',
        'Mõtle peast või sõrmedega – kuidas mugavam!',
        '6 + 7 = 6 + 4 + 3 = 10 + 3 = 13. Jõua alati 10-ni.',
      ],
      addition_big_snake: [
        'Liitmine kuni 100 – kümned ja ühed!',
        '37 + 25: liida esmalt kümned (30+20=50), siis ühed (7+5=12), kokku 62.',
        'Ümarda arvud 10-ni ja siis paranda: 29 + 16 ≈ 30 + 16 = 46, miinus 1 = 45.',
      ],
      subtraction_snake: [
        'Kõik tehted on lahutamine kuni 20.',
        'Kontrolli vastust liitmisega: 12 − 5 = 7, sest 5 + 7 = 12.',
        'Küsimärk tähendab puuduvat arvu – leia see.',
      ],
      subtraction_big_snake: [
        'Lahutamine kuni 100 – mõtle kümnete kaupa.',
        '63 − 28: lahuta esmalt 20 (= 43), siis 8 (= 35).',
        'Kui lahutaja on suurem, kasuta ümberarvestust: 50 − 34 = 50 − 30 − 4 = 20 − 4 = 16.',
      ],
      multiplication_snake: [
        'Kõik ülesanded on korrutamine – faktorid 2 kuni 5!',
        'Planeet tähendab korrutustehet: lahenda enne kui edasi lähed!',
        'Mõtle ridades: 3 × 4 = kolm rida, neli tähte reas.',
      ],
      multiplication_big_snake: [
        'Kogu korrutustabel – faktorid 2 kuni 10!',
        '7 × 8 on raskeim: kui ununeb, siis 7 × 10 = 70, miinus 7 × 2 = 14, kokku 56.',
        'Topeltamine aitab: 6 × 8 = 2 × (3 × 8) = 2 × 24 = 48.',
      ],
      multiplication_fact_drill_1_5: [
        'Sprint! Eesmärk on vastata mälust, mitte loendades.',
        'Vale vastus seeria katkestab, aga ei karista – jätka julgelt.',
        'Faktorid 2–5: harjuta korralikult, kuni iga tehe tuleb sekundiga.',
      ],
      multiplication_fact_drill_1_10: [
        '60 sekundit, kogu korrutustabel – pingutuse eesmärk on kiirus.',
        'Raskemate kombinatsioonide juures (7×8, 6×9) keskendu ja võta hingetõmme.',
        'Mängi mitu korda järjest – iga sprindi parim seeria näitab edenemist.',
      ],
      addition_fact_drill_within_20: [
        'Operandid 1–10, summad kuni 20. Eesmärk on mälust välja vastused.',
        'Kümneni jõudmine kiirendab: 7 + 6 = 7 + 3 + 3 = 10 + 3 = 13.',
        'Vale vastus seeria katkestab, aga ei karista – jätka julgelt.',
      ],
      addition_fact_drill_within_100: [
        'Suuremad operandid: kümned ja ühed eraldi.',
        '37 + 25: kümned (30+20=50), ühed (7+5=12), kokku 62.',
        'Ümarda 10-le ja siis paranda: 29 + 16 ≈ 30 + 16 = 46, miinus 1 = 45.',
      ],
      subtraction_fact_drill_within_20: [
        'Vahe vastus tuleb alati positiivne – suurem arv on alati ees.',
        'Kontrolli liitmisega: 12 − 5 = 7, sest 5 + 7 = 12.',
        '60 sekundit – iga vastus mälust, mitte sõrmedega.',
      ],
      subtraction_fact_drill_within_100: [
        'Lahuta kümned ja ühed eraldi: 63 − 28 = (63 − 20) − 8 = 43 − 8 = 35.',
        'Liida tagasi kontrolliks: 35 + 28 = 63.',
        'Kiirus tuleb harjutusega – mängi mitu korda järjest.',
      ],
      division_fact_drill_1_5: [
        'Jagamine on korrutuse pööre: 12 ÷ 3 = 4, sest 3 × 4 = 12.',
        'Kui ununeb, mõtle korrutustabelile.',
        'Vastused on alati täisarvud – ei jää midagi üle.',
      ],
      division_fact_drill_1_10: [
        '60 sekundit, kogu korrutustabeli pööre.',
        '56 ÷ 8: 7 × 8 = 56, järelikult 56 ÷ 8 = 7.',
        'Pööre tähendab kahesuunalist õppimist – iga korrutustehe teenib kaht jagamistehet.',
      ],
      time_match: [
        'Vaata kella osuteid!',
        'Mõtle, mis kellaaeg on näidatud!',
        'Tund on suurem number, minut väiksem!',
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
        'Puuduta langevaid tähti, et sõna kokku panna. Punasele barjäärile jõudnud tähed annavad veamärke!',
        'Puuduta tähti järjekorras, et sõna kirjutada. Otsi järgmiseks vajalikku tähte!',
        'Puuduta tähti, südameid ja kilpe boonuste saamiseks! Tähed annavad ⭐, südamed annavad ❤️, kilbid eemaldavad veamärgi.',
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
    title: 'Statistika 📊',
    close: 'Sulge statistika',
    highestLevels: 'Kõrgeimad tasemed',
  },

  // Shop
  shop: {
    title: 'Pood',
    yourStars: 'Sinu tähed',
    yourStarBalance: 'Tähe saldo',
    starBalanceDescription:
      'Saldo on kulutatav: teenid tähti taseme tõusuga ning kasutad neid vihjete ja südamete jaoks.',
    lifetimeStars: 'Kokku teenitud',
    yourHearts: 'Sinu südamed',
    buyHearts: 'Osta südameid',
    buyHeartsDescription:
      'Üks süda maksab 10 tähte. Südamed on ühised kõigis mängudes ja maksimum on 5.',
    buy1Heart: 'Osta 1 süda',
    buyHeartsCount: 'Osta {count} südant',
    cost: 'Hind',
    price: 'Hind',
    free: 'TASUTA',
    getMoreHearts: 'Hangi südameid',
    maxHearts: 'Maksimaalne arv südameid',
    notEnoughStars: 'Pole piisavalt tähti',
    buyStars: 'Osta tähti',
    buyStarsDescription:
      'Päris makset veel ei ole. Seni saad tähesaldot tasuta juurde lisada; ostetud tähed ei loe saavutuste teenitud tähtede hulka.',
    buy50Stars: 'Lisa {count} tähte',
    noHeartsToPlay: 'Sul pole südameid mängimiseks!',
    buyHeartsToContinue: 'Kasuta teenitud tähti, et südameid juurde võtta.',
  },

  // Robo path game
  roboPath: {
    perfect: 'Täiuslik!',
    perfectMessage: 'Leidsid optimaalse lahenduse!',
    addCommandUp: 'Lisa käsk: üles',
    addCommandDown: 'Lisa käsk: alla',
    addCommandLeft: 'Lisa käsk: vasakule',
    addCommandRight: 'Lisa käsk: paremale',
    removeCommand: 'Eemalda viimane käsk',
    runRobot: 'Käivita robot',
    addCommands: 'Lisa käsud...',
    max: 'MAX',
    distanceToGoal: 'Kaugus eesmärgini:',
    steps: 'sammu',
    showNumbers: 'Näita numbreid',
    hideNumbers: 'Peida numbrid',
    hint: '💡 Vihje',
    hint1: 'Proovi liikuda eesmärgi suunas!',
    hint2: 'Vältimaks kive, proovi teist teed!',
    hint3: 'Vaata optimaalset teed (poolläbipaistev nool näitab)',
    crashWithStone: '❌ Oih! Robot põrkas kiviga kokku!',
    needMoreCommands: '❌ Robot vajab rohkem käske eesmärgi saavutamiseks!',
    reachedGoal: '✅ Tubli! Robot jõudis eesmärgini!',
    programming: 'Programmeerimine on järjestikuste käskude andmine',
    avoidObstacles: 'Takistused (kivid) tuleb ümber käia',
    excellent: 'Suurepärane! ⭐⭐⭐',
    good: 'Tubli! ⭐⭐',
    solved: 'Lahendatud! ⭐',
    youUsed: 'Sul kulus',
    commands: 'käsku',
    optimalIs: 'optimaalne on',
    time: 'Aeg:',
    bestTime: 'Parim:',
    earnedXP: 'Teenitud XP:',
    tryAgainFor3Stars: 'Proovi uuesti, et saada 3 tärni!',
    tryAgainPrompt: 'Kas proovid uuesti, et saada kõik tärnid?',
    tryAgainButton: 'Proovi uuesti',
    nextButton: 'Edasi',
    continueButton: 'Jätka',
    greatJob: 'Tubli töö!',
    tryAgainForBetter: 'Proovi uuesti parema lahenduse jaoks?',
    stars: 'Tärnid:',
    legendStart: 'Start',
    legendObstacle: 'Keelatud',
    legendGoal: 'Eesmärk',
    legendHint: 'Vihje',
  },

  // Unit conversion game
  unitConversion: {
    question: 'Mitu {to} on {value} {from}?',
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
  },

  // Level up modal
  levelUp: {
    level: 'TASE',
    greatWork: 'Suurepärane töö! Oled tõeline meister. ⭐',
    nextLevel: 'JÄRGMINE TASE',
  },

  // Game names and descriptions
  games: {
    word_builder: {
      title: 'SÕNAMEISTER',
      desc: 'Lao tähtedest sõna kokku',
      gameDescription:
        'Näed pilti (emoji) ja pead valima õiged tähed järjekorras, et moodustada sõna. Tähed on segamini – vali need õiges järjekorras. Alusta esimesest tähest!',
      hintRevealNextCost: 'Näita järgmist tähte ({cost}⭐)',
      hintEliminateCost: 'Eemalda üks vale täht ({cost}⭐)',
    },
    word_cascade: {
      title: 'SÕNAKOSK',
      desc: 'Tavalised sõnad',
      gameDescription:
        'Tähed kukuvad alla – puuduta neid õiges järjekorras, et kirjutada sihtsõna. Kui täht jõuab punase jooneni, saad veamärgi. Koguda võid tähti ⭐, südameid ❤️ ja kilpe, mis eemaldavad veamärgi.',
      hintRevealNextCost: 'Näita järgmist tähte ({cost}⭐)',
    },
    word_cascade_long: {
      title: 'PIKAD SÕNAD',
      desc: 'Pikemad Sõnakose sõnad',
      gameDescription:
        'See on Sõnakose pikemate sõnade pakk. Puuduta langevaid tähti õiges järjekorras ja ehita 8-11 tähega sõna lõpuni valmis. Kui läheb keeruliseks, kasuta järgmise tähe vihjet.',
    },
    syllable_builder: {
      title: 'SILBIMEISTER',
      desc: 'Pane silbid sõnaks kokku',
      gameDescription:
        'Näed pilti ja silpe. Silbid on sõna osad – lohista need õigesse järjekorda, et moodustada täissõna. Kui loed sõna ette, kuuled ära, kas see kõlab õigesti.',
    },
    pattern: {
      title: 'MUSTRI-RONG',
      desc: 'Jätka mustrit',
      gameDescription:
        'Rongis on vaguneid emojidega, mis järgivad mustrit. Vali järgmiseks õige vagun neljast valikust. Vaata, kuidas mustrit korratakse (nt A-B-A-B või A-B-C-A-B-C).',
      hintEliminateCost: 'Eemalda üks vale ({cost}⭐)',
    },
    sentence_logic: {
      title: 'LAUSE-DETEKTIIV',
      desc: 'Kus asub ese?',
      gameDescription:
        'Loe lauset ja vaata stseeni. Lause ütleb, kus ese asub (nt "Kass on diivani peal"). Vali õige vastus neljast valikust. Pane tähele ase- ja seesütlevat käänet.',
    },
    memory_math: {
      title: 'MATEMAATIKA MÄLU',
      desc: 'Leia tehe ja vastus',
      gameDescription:
        'Pööra kaardid ümber ja leia paarid: üks kaart on tehe (nt 3+4) ja teine on vastus (7). Mäluta, kus kumb kaart on, et paarid kiiresti leida.',
      hintRevealPairCost: 'Näita üht paari ({cost}⭐)',
    },
    picture_pairs: {
      title: 'PILDIPAARID',
      desc: 'Leia pildi ja sõna paar',
      gameDescription:
        'Klassikaline mälumäng: pööra kaardid ümber ja leia pildi (emoji) ja sõna paar. Enne mängu näed kaarte lühikest aega – jäta asukohad meelde!',
      hintRevealPairCost: 'Näita üht paari ({cost}⭐)',
    },
    robo_path: {
      title: 'ROBO-RADA',
      desc: 'Programmeerirobot',
      gameDescription:
        'Anna robotile käsud (üles, alla, vasakule, paremale), et ta jõuaks rohelise aknaga lahtrini. Vältida tuleb takistusi. Vali käskude järjekord enne "Käivita" vajutamist.',
    },
    letter_match: {
      title: 'TÄHE-DETEKTIIV',
      desc: 'Leia õige täht',
      gameDescription:
        'Näed sõna ja pilti. Küsimus on: milline täht on kindlas kohas (nt esimene või teine)? Vali õige täht neljast valikust. Suur ja väike täht loetakse samaks.',
    },
    unit_conversion: {
      title: 'MÕÕTÜHIKUD',
      desc: 'Muunda ühikuid',
      gameDescription:
        'Teisenda ühest mõõtühikust teise (nt meetrid sentimeetriteks, kilogrammid grammideks). Loe ülesannet hoolikalt ja vali õige vastus.',
      hintEliminateCost: 'Eemalda üks vale ({cost}⭐)',
    },
    balance_scale: {
      title: 'KAALUD',
      desc: 'Tasakaalusta kaalud',
      gameDescription:
        'Vasakul kaalul on raskused. Arvuta vasaku poole summa ja vali kaal, mis tasakaalustab parema poole. Vali õige raskus neljast valikust.',
      hintEliminateCost: 'Eemalda üks vale ({cost}⭐)',
      chooseWeight: 'Milline kaal tasakaalustab?',
    },
    time_match: {
      title: 'KELLAMÄNG',
      desc: 'Määra kellaaeg',
      gameDescription:
        'Näed kella, mis näitab tundi ja minuteid. Vali õige kellaaeg neljast valikust (nt "kell 3" või "pool 4"). Tund on suurem number, minut väiksem.',
      hintEliminateCost: 'Eemalda üks vale aeg ({cost}⭐)',
    },
    addition_snake: {
      title: 'LIITMISUSS',
      desc: 'Liitmine kuni 20',
      gameDescription:
        'Liigu nooleklahvidega ja söö õunu – madu kasvab. Õuntel on liitmistehted (nt 6 + 7) summadega kuni 20. Vali õige vastus neljast.',
      hintEliminateCost: 'Eemalda üks vale ({cost}⭐)',
    },
    addition_big_snake: {
      title: 'SUUR LIITMISUSS',
      desc: 'Liitmine kuni 100',
      gameDescription:
        'Sama madu, suuremad arvud. Liitmistehted kuni 100. Sobib, kui väike liitmisuss tundub liiga lihtne.',
      hintEliminateCost: 'Eemalda üks vale ({cost}⭐)',
    },
    subtraction_snake: {
      title: 'LAHUTUSUSS',
      desc: 'Lahutamine kuni 20',
      gameDescription:
        'Madu, mille õuntel on lahutamistehted kuni 20. Esinevad ka puuduva arvuga ülesanded (? − 5 = 3). Vali õige vastus neljast.',
      hintEliminateCost: 'Eemalda üks vale ({cost}⭐)',
    },
    subtraction_big_snake: {
      title: 'SUUR LAHUTUSUSS',
      desc: 'Lahutamine kuni 100',
      gameDescription:
        'Suurem lahutamise madu kuni 100. Sobib 3. klassi lapsele, kes väikse juba hästi oskab.',
      hintEliminateCost: 'Eemalda üks vale ({cost}⭐)',
    },
    multiplication_snake: {
      title: 'KORRUTUSUSS',
      desc: 'Korrutustabel 1–5',
      gameDescription:
        'Juhi kosmose-ussi tähtedel ja söö planeete! Iga planeet on korrutamine (nt 3 × 4). Vali õige vastus neljast. Faktorid 2–5, sobib 2. klassile.',
      hintEliminateCost: 'Eemalda üks vale ({cost}⭐)',
    },
    multiplication_big_snake: {
      title: 'SUUR KORRUTUSUSS',
      desc: 'Korrutustabel 1–10',
      gameDescription:
        'Kogu korrutustabel faktoritega 2 kuni 10. Galaktika-madu raskematele tehetele – 3. klassi eesmärk.',
      hintEliminateCost: 'Eemalda üks vale ({cost}⭐)',
    },
    multiplication_fact_drill_1_5: {
      title: 'KORRUTUSSPRINT 1–5',
      desc: 'Korrutustabel 1–5 kiires tempos',
      gameDescription:
        'Lahenda 60 sekundi jooksul nii palju korrutustehte kui võimalik. Faktorid 2–5. Eesmärk on automatiseerida korrutustabel – vastus tuleb mälust, mitte loendades. Vale vastus seeria katkestab, aga ei karista.',
    },
    multiplication_fact_drill_1_10: {
      title: 'KORRUTUSSPRINT 1–10',
      desc: 'Korrutustabel 1–10 kiires tempos',
      gameDescription:
        'Kogu korrutustabel 60-sekundilise sprindis. Faktorid 2–10. Sobib 3. klassi tasemele, kui korrutustabel on juba tuttav ja soovid kiirust harjutada.',
    },
    addition_fact_drill_within_20: {
      title: 'LIITMISSPRINT 20',
      desc: 'Liitmine kuni 20 kiires tempos',
      gameDescription:
        '60-sekundiline liitmissprint operandidega 1–10 (summad kuni 20). Eesmärk on automatiseerida liitmistabel – vastus tuleb mälust, mitte loendades.',
    },
    addition_fact_drill_within_100: {
      title: 'LIITMISSPRINT 100',
      desc: 'Liitmine kuni 100 kiires tempos',
      gameDescription:
        'Liitmissprint suuremate arvudega (operandid 1–50, summad kuni 100). Sobib 2.–3. klassile, kui väiksem liitmine on juba tuttav.',
    },
    subtraction_fact_drill_within_20: {
      title: 'LAHUTUSSPRINT 20',
      desc: 'Lahutamine kuni 20 kiires tempos',
      gameDescription:
        '60-sekundiline lahutussprint operandidega 1–20. Tehe alati näitab suuremast arvust väiksema – vastus jääb positiivne.',
    },
    subtraction_fact_drill_within_100: {
      title: 'LAHUTUSSPRINT 100',
      desc: 'Lahutamine kuni 100 kiires tempos',
      gameDescription:
        'Lahutussprint operandidega 1–100. Sobib 3. klassile, kui väiksem lahutamine on juba tuttav.',
    },
    division_fact_drill_1_5: {
      title: 'JAGAMISSPRINT 1–5',
      desc: 'Jagamine 1–5 kiires tempos',
      gameDescription:
        'Jagamissprint korrutustabeli 1–5 põhjal. Iga tehe annab täisarvulise vastuse (12 ÷ 3 = 4). Sobib 3. klassile, kui korrutustabel on juba selge.',
    },
    division_fact_drill_1_10: {
      title: 'JAGAMISSPRINT 1–10',
      desc: 'Jagamine 1–10 kiires tempos',
      gameDescription:
        'Kogu korrutustabeli pööre 60-sekundilise sprindis. Vastused alati täisarvulised. Sobib 3.–4. klassile.',
    },
    compare_sizes: {
      title: 'ARVUDE VÕRDLEMINE',
      desc: 'Võrdle arve',
      gameDescription:
        'Võrdle kaht arvu või kogust. Vali õige sümbol: < (väiksem), = (võrdne) või > (suurem). Vaata mõlemat poolt hoolikalt.',
      instruction: 'Milline sümbol on õige?',
      symbolInstruction: 'Vali õige võrdlussümbol',
      selectSymbol: 'Vali sümbol',
      leftBigger: 'Vasak on suurem',
      rightBigger: 'Parem on suurem',
      equal: 'Nad on võrdsed',
      leftItem: 'Vasak arv',
      rightItem: 'Parem arv',
      hintEliminateCost: 'Eemalda üks vale ({cost}⭐)',
    },
    shape_shift: {
      title: 'KUJUNDAJA',
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
      hintOutline: 'Näita värve (1⭐)',
      hintPlacePiece: 'Paiguta üks tükk (2⭐)',
      hintOutlineCost: 'Näita värve ({cost}⭐)',
      hintPlacePieceCost: 'Paiguta üks tükk ({cost}⭐)',
      hintOutlineUsed: 'Kontuur juba kasutatud',
      hintPlacePieceUsed: 'Üks juba paigutatud',
      hintOutlineDescription: 'Näita korraks värvilist lahenduse kontuuri',
      hintPlacePieceDescription: 'Paigutan ühe tüki sinna õigesse kohta',
      hintText:
        'Lohista kujundid sobivatele varjudele. Puuduta pööramiseks. Vihje võib värvid korraks ette näidata.',
      rotateButton: 'Pööra 90°',
      orUse: 'või kasuta',
      piecesRemaining: 'Tükke jäänud',
      complete: 'Suurepärane! 🎉',
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
      title: 'TÄHEKUJUNDID',
      desc: 'Õpi tundma tähtkujusid',
      gameDescription:
        'Ühenda tähed joontega, et moodustada tähtkuju (nt Suur Vanker). Mõnes režiimis järgid juhiseid, mõnes ehitad mälu järgi. Võid kasutada "Tagasi" nuppu, kui teed vea.',
    },
    shape_dash: {
      title: 'KUJUNDITE JOOKS',
      desc: 'Hüppa, väldi takistusi ja vasta geomeetriale',
      gameDescription:
        'Sinu tegelane jookseb ise edasi. Vajuta tühikuklahvi või puuduta ekraani, et hüpata takistuste üle. Läbi õige kujundi värava jookstes vastame geomeetria küsimustele! Vale värav = kaotad combo/kilbi, aga jooksed edasi. Kaks valet järjest või kokkupõrge takistustega = mäng läbi.',
      tapToRetry: 'Vajuta uuesti proovimiseks',
      jumpLabel: 'Hüppa',
      playAreaLabel: 'Kujundite jooksu mänguala',
      completeLabel: 'TASE LÄBITUD!',
      jumpHint: 'või puuduta hüppamiseks • Topelthüpe on olemas!',
      attemptLabel: 'Katse',
      scoreLabel: 'Skoor',
      starsLabel: 'Tähed',
      shieldLabel: 'Kilp',
      hintRevealGateCost: 'Näita õiget väravat ({cost}⭐)',
      hintSlowTimeCost: 'Aeglusta aega väravate juures ({cost}⭐)',
      gateApproaching: 'Kujundi värav ees!',
      gateCorrect: 'Õige värav! +200',
      gateWrong: 'Vale värav! -Combo',
      consecutiveWrongWarning: 'Hoiatus: Veel üks vale värav = kokkupõrge!',
      oneMoreWrongWarning: '⚠️ Veel üks vale = kokkupõrge!',
      wrongGateNextWarning: '⚠️ Vale värav! Järgmine paneb põrkama!',
      shieldLost: '⚠️ Kilp kadus!',
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
      title: 'LAEVADE UPUTAMINE',
      desc: 'Uputa laevad ja õpi matemaatikat',
      gameDescription:
        'Vali ruut võrgustikul – kui seal on laev, saad tabamuse; kui tühi, napib. Mõnel ruudul tuleb vastata matemaatika- või loogikaküsimusele. Uputa kõik laevad, et võita!',
      hintRevealEmptyCost: 'Näita üht tühja ruutu ({cost}⭐)',
      hintRevealCost: 'Näita üht laeva asukohta ({cost}⭐)',
      hintEliminateCost: 'Eemalda üks vale vastus ({cost}⭐)',
    },
    battlelearn_adv: {
      title: 'LAEVADE UPUTAMINE',
      desc: 'Kasuta koordinaate ja loogikat laevastiku uputamiseks',
      hintRevealEmptyCost: 'Näita üht tühja ruutu ({cost}⭐)',
      hintRevealCost: 'Näita üht laeva asukohta ({cost}⭐)',
      hintEliminateCost: 'Eemalda üks vale vastus ({cost}⭐)',
    },
    battlelearn_multiplication: {
      title: 'LAEVADE UPUTAMINE: KORRUTUSTABEL',
      desc: 'Uputa laevad korrutustabeli abil',
      hintRevealEmptyCost: 'Näita üht tühja ruutu ({cost}⭐)',
      hintRevealCost: 'Näita üht laeva asukohta ({cost}⭐)',
      hintEliminateCost: 'Eemalda üks vale vastus ({cost}⭐)',
    },
    battlelearn_multiplication_1_5: {
      title: 'LAEVADE UPUTAMINE: KORRUTUSTABEL 1-5',
      desc: 'Uputa laevad korrutustabeliga 1-5',
      hintRevealEmptyCost: 'Näita üht tühja ruutu ({cost}⭐)',
      hintRevealCost: 'Näita üht laeva asukohta ({cost}⭐)',
      hintEliminateCost: 'Eemalda üks vale vastus ({cost}⭐)',
    },
  },

  // Difficulty levels
  difficulty: {
    easy: '⭐ Lihtne',
    medium: '⭐⭐ Keskmine',
    hard: '⭐⭐⭐ Raske',
  },

  // Star Mapper game
  starMapper: {
    title: 'TÄHEKUJUNDID',
    desc: 'Õpi tundma tähtkujusid',
    instructions: {
      trace: 'Ühenda tähed, järgides juhisjooni',
      build: 'Ühenda tähed mälu järgi',
      identify: 'Mis tähtkuju see on?',
      expert: 'Leia ja ühenda õiged tähed',
    },
    hint: 'Vihje',
    formLabel: 'Kuju',
    undo: 'Võta tagasi',
    tryAgain: 'Proovi uuesti',
    linesRemaining: 'Jooni jäänud: {count}',
    complete: 'Suurepärane! 🌟',
    hintGuideCost: 'Näita juhiseid ({cost}⭐)',
    hintConnectCost: 'Ühenda üks joon ({cost}⭐)',
    constellations: {
      ursa_major: { name: 'Suur Vanker', folk: 'Odamus', desc: 'Põhjataeva kuulsaim tähtkuju' },
      ursa_minor: { name: 'Väike Vanker', folk: 'Väike Vanker', desc: 'Siin asub Põhjanael' },
      cassiopeia: { name: 'Kassiopeia', desc: 'W-kujuline kuninganna' },
      orion: { name: 'Orion', folk: 'Reha ja Vikat', desc: 'Talvine kütt kolme vöötähega' },
      cygnus: { name: 'Luik', desc: 'Suvine rist taevas' },
      leo: { name: 'Lõvi', desc: 'Kevadine lõvi' },
      lyra: { name: 'Lüüra', desc: 'Vega täht asub siin' },
      aquila: { name: 'Kotkas', desc: 'Altair täht asub siin' },
      pegasus: { name: 'Pegasus', desc: 'Sügisene suur ruut' },
      draco: { name: 'Draakon', desc: 'Looklevas kujuga tähtkuju' },
      cepheus: { name: 'Kefeusus', desc: 'Kuningas põhjataevas' },
      taurus: { name: 'Sõnn', desc: 'Talvine härg Aldebaraniga' },
      gemini: { name: 'Kaksikud', desc: 'Castor ja Pollux' },
      auriga: { name: 'Veomees', desc: 'Veomees Capella tähega' },
      andromeda: { name: 'Andromeda', desc: 'Tähekea, mis viib galaktikani' },
      corona_borealis: { name: 'Põhjakroon', desc: 'Põhja krooni poolring' },
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
    title: 'LAEVADE UPUTAMINE',
    titleAdv: 'LAEVADE UPUTAMINE',
    desc: 'Uputa laevad ja õpi matemaatikat',
    descAdv: 'Kasuta koordinaate ja loogikat laevastiku uputamiseks',
    instructions: 'Tulista lahtri poole! Vasta küsimusele ainult siis, kui tabad ülesande lahtri.',
    shotReady: 'Võid tulistada!',
    clickToShoot: 'Klõpsa lahtrile, et tulistada',
    answerToEarnShot: 'Vasta õigesti, et jätkata tulistamist',
    answerToContinue: 'Vasta küsimusele, et jätkata tulistamist:',
    shipsRemaining: 'Laevu alles',
    triesBeforeHeart: 'Vead enne ❤️',
    strikesAriaLabel: '{count} vee tabamust enne südame kaotamist',
    hit: '💥 Tabamus!',
    miss: '💦 Mööda! Vasta küsimusele.',
    shipSunk: '🎯 Laev uppus!',
    victory: 'Võit!',
    allShipsSunk: 'Kõik laevad uppusid!',
    alreadyShot: 'Sinna oled juba lasknud!',
    coordinateQuestion: 'Koordinaadi küsimus',
    navigationQuestion: 'Navigatsiooni ülesanne',
    fleetMath: 'Laevastiku matemaatika',
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
      directionSequence: 'Liigu {dir1}, siis {dir2}. Mis suunas?',
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
      strategicPos: 'Parim koht ründamiseks vahemikus {x1}-{x2}, {y1}-{y2}. Keskpunkt?',
    },
  },

  // Level label
  level: 'Tase',
} as const;

export type TranslationKey = typeof et;
