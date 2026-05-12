/**
 * English translations
 * Inglise keele tõlked
 */
export const en = {
  // Common
  common: {
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    refresh: 'Refresh',
    loading: 'Loading...',
  },

  // Accessibility
  accessibility: {
    skipToContent: 'Skip to main content',
  },

  // Error messages
  errors: {
    somethingWentWrong: 'Something went wrong',
    gameError: 'An error occurred in the game. Try refreshing the page.',
    refreshPage: 'Refresh page',
    unknownGameType: 'Unknown game type',
    confirmReset: 'Are you sure you want to delete all progress?',
  },

  // Feedback messages
  feedback: {
    correct: [
      'CORRECT! 🌟',
      'GREAT! ⭐',
      'VERY GOOD! 🎉',
      'FANTASTIC! 🚀',
      'WONDERFUL! ✨',
      'GOOD JOB! 💪',
      'PERFECT! 🏆',
      'AMAZING! 🌈',
      'WOW! 🔥',
      'VERY GOOD! 🎊',
      'EASY FOR YOU! 💯',
      'PROFESSIONAL! 🎯',
    ],
    wrong: [
      'TRY AGAIN! 💪',
      "DON'T GIVE UP! 🌟",
      'YOU CAN DO IT! ⭐',
      'KEEP GOING! 🚀',
      "YOU'RE ON THE RIGHT TRACK! 🎯",
      'TRY MORE! 💡',
      'ALMOST! ✨',
      'VERY CLOSE! 🎉',
      'NEXT TIME! 🌈',
      "DON'T QUIT! 💪",
    ],
    streak: [
      '2 CORRECT IN A ROW! 🔥',
      '3 CORRECT IN A ROW! ⭐⭐',
      '4 CORRECT IN A ROW! 🌟🌟',
      '5 CORRECT IN A ROW! 🏆',
      '6 CORRECT IN A ROW! 💯',
      '7+ CORRECT IN A ROW! 🚀',
    ],
    levelUp: ['LEVEL UP! 🎊', 'NEW LEVEL! 🌟', 'PROGRESSING! ⭐', 'GREAT! 🏆'],
  },

  // Notification labels
  notifications: {
    correctTitle: 'Correct!',
    wrongTitle: 'Try again!',
    streakSuffix: 'correct in a row!',
    hintTitle: 'Hint',
    tipTitle: 'Tip',
    infoTitle: 'Notice',
    achievementTitle: 'Achievement!',
    levelUpTitle: 'Level up!',
    closeTip: 'Close tip',
    closeHint: 'Close hint',
    closeAchievement: 'Close achievement',
    closeLevelUp: 'Close level up',
  },

  // Game categories
  categories: {
    language: {
      name: 'Language Games',
      description: 'Words, letters and sentences',
    },
    math: {
      name: 'Math',
      description: 'Calculations and measurements',
    },
    logic: {
      name: 'Logic',
      description: 'Patterns and programming',
    },
    memory: {
      name: 'Memory',
      description: 'Memory games',
    },
  },

  // Profiles
  profiles: {
    starter: {
      label: '5+',
      desc: 'Preschooler',
    },
    advanced: {
      label: '7+',
      desc: 'School child',
    },
  },

  // Menu
  menu: {
    title: 'Smart Games',
    selectProfile: 'Select profile',
    stats: 'Statistics',
    achievements: 'Achievements',
    tutorial: 'Tutorial',
    settings: 'Settings',
    reset: 'Reset progress',
    sound: 'Sound',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    score: 'Score',
    stars: 'Stars',
    featured: 'Featured',
    favourites: 'Favourites',
  },

  // Game
  game: {
    hearts: 'Hearts',
    stars: 'Stars',
    score: 'Score',
    level: 'Level',
    hint: 'Hint',
    skip: 'Skip',
    submit: 'Submit',
    correct: 'Correct',
    wrong: 'Wrong',
    gameOver: 'Game Over',
    scoreMessage: 'You scored {score} points!',
    returnToMenu: 'Return to menu',
    retry: 'Try Again',
    continue: 'Continue',
    levelUp: 'Level up!',
    newAchievement: 'New achievement!',
    noHeartsLeft: 'No hearts left! Refill them in the shop with earned stars.',
    highScore: 'High Score',
    newRecord: 'New Record!',
    snakeSummary: {
      title: 'Session summary',
      maxLength: 'Longest snake',
      accuracy: 'Accuracy',
      bestStreak: 'Best streak',
      factsAttempted: 'Facts',
      hardestFacts: 'Practice these next time',
      noMistakes: 'No mistakes — well done!',
      noFactsAttempted: "You didn't reach any facts this run — try again!",
    },
  },

  // Stats
  stats: {
    title: 'Statistics',
    gamesPlayed: 'Games played',
    accuracy: 'Accuracy',
    bestStreak: 'Best streak',
    highestLevel: 'Highest level',
    totalStars: 'Lifetime stars earned',
    spendableStars: 'Spendable star balance',
    spendableStarsHint: 'Use these for hints and hearts.',
    lifetimeStarsHint: 'Does not go down when you spend stars in the shop.',
    totalScore: 'Total score',
    playTime: 'Play time',
    achievements: 'Achievements',
    streakSuffix: 'correct in a row',
    perGame: 'per game',
    noGamesPlayed: 'No game types played yet',
    mostPlayedGames: 'Most played games',
    gamesLabel: 'games',
  },

  // Achievements
  achievements: {
    title: 'Achievements',
    unlocked: 'Unlocked',
    locked: 'Locked',
    progress: 'Progress',
    modalTitle: 'Achievements 🏅',
    collectedLabel: 'achievements collected',
    items: {
      first_game: {
        title: 'First Step',
        desc: 'Play your first game',
      },
      perfect_5: {
        title: 'Perfect Streak',
        desc: 'Answer 5 tasks in a row',
      },
      word_master: {
        title: 'Word Master',
        desc: 'Reach Word Master level 5',
      },
      math_whiz: {
        title: 'Math Whiz',
        desc: 'Reach Math Memory level 5',
      },
      pattern_pro: {
        title: 'Pattern Pro',
        desc: 'Reach Pattern Train level 5',
      },
      score_100: {
        title: '100 Points',
        desc: 'Collect 100 points',
      },
      score_500: {
        title: '500 Points',
        desc: 'Collect 500 points',
      },
      persistent: {
        title: 'Persistent',
        desc: 'Play 10 games',
      },
      all_games: {
        title: 'All Games',
        desc: 'Try every game type',
      },
      star_collector_50: {
        title: 'Star Collector',
        desc: 'Collect 50 stars',
      },
      star_collector_100: {
        title: 'Star Master',
        desc: 'Collect 100 stars',
      },
      star_collector_250: {
        title: 'Star Legend',
        desc: 'Collect 250 stars',
      },
      snake_master: {
        title: 'Snake Master',
        desc: 'Reach Number Snake level 5',
      },
      snake_growth_20: {
        title: 'Long Snake',
        desc: 'Grow snake to at least 20 length',
      },
      snake_growth_30: {
        title: 'Very Long Snake',
        desc: 'Grow snake to at least 30 length',
      },
      snake_growth_max: {
        title: 'Maximum Snake',
        desc: 'Grow snake to maximum length (49)',
      },
      syllable_master: {
        title: 'Syllable Master',
        desc: 'Reach Syllable Master level 5',
      },
      sentence_detective: {
        title: 'Sentence Detective',
        desc: 'Reach Sentence Detective level 5',
      },
      robo_master: {
        title: 'Robo Master',
        desc: 'Reach Robo Path level 5',
      },
      letter_detective: {
        title: 'Letter Detective',
        desc: 'Reach Letter Detective level 5',
      },
      unit_master: {
        title: 'Unit Master',
        desc: 'Reach Units level 5',
      },
      compare_master: {
        title: 'Compare Master',
        desc: 'Reach Number Compare level 5',
      },
      scale_master: {
        title: 'Scale Master',
        desc: 'Reach Scales level 5',
      },
      clock_master: {
        title: 'Clock Master',
        desc: 'Reach Clock Game level 5',
      },
      cascade_master: {
        title: 'Cascade Master',
        desc: 'Reach WORD CASCADE level 5',
      },
      cascade_perfect_10: {
        title: 'Cascade Champion',
        desc: 'Complete 10 Word Cascade games',
      },
      battlelearn_first_win: {
        title: 'First Fleet Sunk',
        desc: 'Win your first BattleLearn game',
      },
      battlelearn_captain: {
        title: 'BattleLearn Captain',
        desc: 'Reach BattleLearn level 5',
      },
      battlelearn_admiral: {
        title: 'BattleLearn Admiral',
        desc: 'Reach BattleLearn level 10',
      },
    },
  },

  // Menu specific
  menuSpecific: {
    heading: 'Choose a game',
    subtitle: 'Practice and learn',
    starsLabel: 'stars',
    achievementsCount: 'achievements - click to see all',
    showAchievements: 'Show achievements',
    showStats: 'Show statistics',
    toggleSoundOn: 'Turn sound on',
    toggleSoundOff: 'Turn sound off',
    deleteProgress: 'Delete saved progress',
    showTutorial: 'Show tutorial',
    tutorial: 'Tutorial',
    starterDescription: '👶 Choose a game and practice reading and logic!',
    advancedDescription: '🧒 Choose a game and practice math and thinking!',
    gamesCount: 'games',
    starCollector: '⭐ Star Collector!',
    starMaster: '⭐⭐ Star Master!',
    starLegend: '✨ Star Legend!',
    newGame: 'NEW!',
    language: 'Language',
    selectLanguage: 'Select language',
    editFavourites: 'Edit favourites',
    editFavouritesTitle: 'Choose games for Favourites section',
    save: 'Save',
    allGames: 'All games',
    choosePack: 'Choose pack',
    packCount_one: '{count} pack',
    packCount_other: '{count} packs',
  },

  // Mechanics — one entry per shared engine. The menu groups bindings by
  // mechanic and shows the title/desc here on the aggregate card.
  mechanics: {
    math_snake: {
      title: 'NUMBER SNAKE',
      desc: 'Eat apples, solve the equation',
    },
    word_cascade: {
      title: 'WORD CASCADE',
      desc: 'Catch letters and build words',
    },
    fact_drill: {
      title: 'FACT SPRINT',
      desc: 'Answer facts at speed',
    },
  },

  // Tutorial
  tutorial: {
    welcome: {
      title: 'Welcome!',
      content: 'This is an educational game where you can practice reading, math and logic!',
    },
    selectAge: {
      title: 'Difficulty adapts',
      content:
        'Start with any game. Each skill progresses separately and the menu shows your current practice level.',
    },
    selectGame: {
      title: 'Choose a game',
      content: 'Choose a game you want to play. Each game has its own theme and difficulty.',
    },
    answerCorrectly: {
      title: 'Answer correctly',
      content:
        'Answer correctly to progress! When you demonstrate mastery (correct answers + good accuracy), you automatically level up and earn stars!',
    },
    beCareful: {
      title: 'Be careful',
      content:
        'Each wrong answer can cost one heart. Hearts are global and persist across games. When hearts run out, you can refill them in the shop with earned stars.',
    },
    collectAchievements: {
      title: 'Collect achievements',
      content: 'Collect medals and track your statistics from the menu above!',
    },
    close: 'Close tutorial',
    back: 'Back',
    next: 'Next',
    startGame: 'Start game!',
  },

  // Game screen
  gameScreen: {
    returnToMenu: 'Return to menu',
    tipsLabel: 'Tips',
    progressLabel: 'Progress',
    gameDescriptionTitle: 'How to play',
    starProgress: {
      one: '1/5 stars! 🌟',
      two: '2/5 stars! ⭐⭐',
      three: '3/5 stars! ⭐⭐⭐',
      four: '4/5 stars! ⭐⭐⭐⭐',
      last: 'Last star! ⭐⭐⭐⭐⭐',
    },
    sentenceLogic: {
      selectCorrectPicture: 'Select the correct picture',
      scene: 'Scene',
      positions: {
        NEXT_TO: 'next to',
        ON: 'on',
        UNDER: 'under',
        IN_FRONT: 'in front of',
        BEHIND: 'behind',
        INSIDE: 'inside',
      },
    },
    syllableBuilder: {
      instruction: 'PUT THE SYLLABLES IN ORDER TO MAKE A WORD',
      correct: 'CORRECT:',
    },
    wordBuilder: {
      preFilled: 'Hint: some letters are already in place!',
      useAllLetters: 'Use all correct letters',
      watchCase: 'Watch upper and lower case!',
    },
    wordCascade: {
      tapLetters: 'Tap letters to build the word',
      tryAgain: 'Try again!',
      wrongLetter: 'Wrong letter',
      triesLeft: '{count} tries left',
      outOfTries: 'Out of tries',
      greatJob: 'Great job!',
      tutorial:
        'Tap the falling letters to build the word. Letters that hit the red barrier add strikes!',
      starPickup: 'Star pickup',
      heartPickup: 'Heart pickup',
      shieldPickup: 'Shield pickup',
      pickupHint: 'Tap stars, hearts and shields to get bonuses!',
      tapGlowingLetter: 'Tap the glowing letter below!',
    },
    pattern: {
      tagline: 'Pattern Train',
      instruction: 'Finish the pattern',
      subInstruction: 'Tap the next car',
      feedbackTitle: 'Not quite',
      feedbackReason: 'The pattern repeats {pattern}. Next should be {answer}.',
      feedbackChoiceLabel: 'You chose',
      patternLabel: 'Pattern',
    },
    memoryMath: {
      pairsLabel: 'Pairs',
    },
    picturePairs: {
      pairsLabel: 'Pairs',
      movesLabel: 'Moves',
      peekLabel: 'Memorize!',
    },
    timeMatch: {
      selectCorrectTime: 'Choose the correct time',
      correctTimeIs: 'Correct time is',
      oClock: '{hour} o’clock',
      halfPast: 'half past {hour}',
      quarterPast: 'quarter past {hour}',
      quarterTo: 'quarter to {hour}',
    },
    mathSnake: {
      tagline: 'Number Snake',
      instruction: 'Move with the arrow keys and eat apples. The math apple gives a bonus.',
      solveLabel: 'Solve',
      chooseApple: 'Eat apples. The math apple gives +1 or -2 length.',
      keyboardHint: 'Use arrow keys or WASD to move.',
      lengthLabel: 'Length',
      nextMathLabel: 'Math in',
    },
    factDrill: {
      tagline: 'Fact Sprint',
      instruction: 'Answer as fast as you can',
      keyboardHint: 'Use number keys and press Enter; Backspace clears.',
      timeLeftLabel: 'Time',
      correctLabel: 'Correct',
      streakLabel: 'Streak',
      bestStreakLabel: 'Best streak',
      submitLabel: 'Submit',
      clearLabel: 'Clear',
      placeholder: 'Answer',
      feedbackCorrect: 'Right!',
      feedbackWrong: 'The answer was {answer}',
      finalTitle: 'Time up!',
      finalScoreLabel: 'Correct answers',
      finalAccuracyLabel: 'Accuracy',
      playAgain: 'Play again',
      backToMenu: 'Back to menu',
    },
    selectLevel: 'Select Level',
    currentLevel: 'Current level',
    selectNewLevel: 'Select new level',
    game: 'Game',
    hints: {
      wordBuilder: 'The word starts with letter',
      syllableBuilder: 'The word starts with syllable',
      balanceScale: 'Left side is',
      balanceScaleRight: 'right side is',
      pattern: 'Look at the pattern the train follows!',
      memoryMath: 'Flip the cards and find pairs!',
      picturePairs: 'Match the picture and the word!',
      sentenceLogic: 'Look where',
      sentenceLogicScene: 'is in the scene!',
      roboPath: 'Robot must reach the cell with green window!',
      mathSnake: 'Eat apples and watch for the math apple!',
      timeMatch: 'Look at the clock hands!',
      unitConversion: 'Calculate!',
      compare_sizes: 'Compare the sizes carefully!',
      shape_dash: 'Jump with Space or tap; choose the right shape gate answer!',
      default: 'Try again!',
    },
    hintButton: {
      show: 'Show hint',
      used: 'Hint already used',
    },
    tipButton: {
      show: 'Open tip',
      unavailable: 'Tip not available yet',
    },
    tips: {
      word_builder: [
        'Try to guess the word from the emoji!',
        'Look at the first letter — it helps you start!',
        'Think about which letters go together!',
      ],
      syllable_builder: [
        'Syllables are parts of a word — put them together!',
        'See how the syllables fit together!',
        'Say the word out loud as you build it!',
      ],
      pattern: [
        'Pattern Train',
        'Finish the pattern',
        'Tap the next car',
        'Look at the pattern the train follows!',
        'Think what should come next!',
        'Notice how the emojis repeat!',
      ],
      sentence_logic: [
        'Read the sentence carefully!',
        'Look where the objects are in the scene!',
        'Think what is logical!',
      ],
      memory_math: [
        'Flip the cards and find pairs!',
        'Think which numbers make the equation!',
        'Try to remember where each card is!',
      ],
      picture_pairs: [
        'Flip the cards and find the picture–word pair!',
        'Remember where each emoji or word was!',
        'Start with fewer pairs, then add more!',
      ],
      balance_scale: [
        'Add up what is on the left!',
        'Think which number balances the scales!',
        'Check how much is on the right!',
      ],
      robo_path: [
        'Think how the robot should move!',
        'Look where the obstacles are!',
        'Try it step by step!',
      ],
      addition_snake: [
        'Every problem is addition, sum up to 20!',
        'Do it in your head or on your fingers — whatever is easier.',
        '6 + 7 = 6 + 4 + 3 = 10 + 3 = 13. Always reach 10 first.',
      ],
      addition_big_snake: [
        'Addition up to 100 — tens and ones!',
        '37 + 25: add tens first (30+20=50), then ones (7+5=12), total 62.',
        'Round up to 10 and fix later: 29 + 16 ≈ 30 + 16 = 46, minus 1 = 45.',
      ],
      subtraction_snake: [
        'Every problem is subtraction up to 20.',
        'Check your answer by adding: 12 − 5 = 7, because 5 + 7 = 12.',
        'The question mark means a missing number — find it.',
      ],
      subtraction_big_snake: [
        'Subtraction up to 100 — think in tens.',
        '63 − 28: take 20 first (= 43), then 8 (= 35).',
        'If the subtrahend is larger, regroup: 50 − 34 = 50 − 30 − 4 = 20 − 4 = 16.',
      ],
      multiplication_snake: [
        'Every question is multiplication — factors 2 through 5!',
        'A planet means a multiplication challenge: solve it before moving on!',
        'Think in rows: 3 × 4 = three rows of four planets.',
      ],
      multiplication_big_snake: [
        'The full times table — factors 2 through 10!',
        "7 × 8 is the hardest: if you forget, 7 × 10 = 70, minus 7 × 2 = 14, that's 56.",
        'Doubling helps: 6 × 8 = 2 × (3 × 8) = 2 × 24 = 48.',
      ],
      multiplication_fact_drill_1_5: [
        'Sprint! Aim to answer from memory, not by counting.',
        "A wrong answer breaks the streak but doesn't punish you — keep going.",
        'Factors 2–5: practise until every fact comes within a second.',
      ],
      multiplication_fact_drill_1_10: [
        '60 seconds, the full times table — speed is the goal.',
        'On the harder pairs (7×8, 6×9) breathe and trust the answer that comes up.',
        'Play several sprints in a row — your best streak shows progress.',
      ],
      time_match: [
        'Look at the clock hands!',
        'Think what time is shown!',
        'Hour is the bigger number, minute the smaller one!',
      ],
      letter_match: [
        'Look at the uppercase letter and find the lowercase!',
        'Think which letter fits!',
        'Uppercase and lowercase are the same letter!',
      ],
      unit_conversion: [
        'Read the question carefully!',
        'Think about how the units relate!',
        'Use a small example to check your answer!',
      ],
      compare_sizes: [
        'Choose the right symbol: < (less than), = (equal) or > (greater than)',
        'Look at both sides carefully!',
        'Count or compare the sizes!',
        'Think which one is bigger!',
      ],
      shape_shift: [
        'Drag shapes to match the image',
        'Tap a shape to rotate it 90°',
        'Try different combinations!',
        'Think how shapes fit together',
      ],
      star_mapper: [
        'Tap stars to connect them',
        'Follow the shape and create the constellation',
        'Use "Undo" button if you make a mistake',
        'Try connecting stars in sequence',
      ],
      word_cascade: [
        'Tap the falling letters to build the word. Letters that hit the red barrier add strikes!',
        'Tap letters in order to spell the word. Watch for the letter you need next!',
        'Tap stars, hearts and shields to get bonuses! Stars give ⭐, hearts give ❤️, shields remove a strike.',
      ],
      word_cascade_long: [
        'Long words use the same rule: find the next letter and move from left to right.',
        'Use the next-letter hint when the word gets crowded.',
        'Say the whole word first, then catch the letters in order.',
      ],
      shape_dash: [
        'Press Space or tap the screen to jump!',
        'Avoid the triangular spikes and yellow blocks.',
        'In shape gates, choose the answer by jump height.',
      ],
    },
  },

  // Stats modal
  statsModal: {
    title: 'Statistics 📊',
    close: 'Close statistics',
    highestLevels: 'Highest levels',
  },

  // Shop
  shop: {
    title: 'Shop',
    yourStars: 'Your Stars',
    yourStarBalance: 'Star balance',
    starBalanceDescription:
      'Balance is spendable: earn stars by leveling up, then use them for hints and hearts.',
    lifetimeStars: 'Lifetime earned',
    yourHearts: 'Your Hearts',
    buyHearts: 'Buy Hearts',
    buyHeartsDescription:
      'One heart costs 10 stars. Hearts are shared across every game and max out at 5.',
    buy1Heart: 'Buy 1 Heart',
    buyHeartsCount: 'Buy {count} Hearts',
    cost: 'Cost',
    price: 'Price',
    free: 'FREE',
    getMoreHearts: 'Get More Hearts',
    maxHearts: 'Maximum hearts reached',
    notEnoughStars: 'Not enough stars',
    buyStars: 'Buy Stars',
    buyStarsDescription:
      'Real payments are not wired up yet. Until then, you can add star balance for free; purchased stars do not count toward earned-star achievements.',
    buy50Stars: 'Add {count} Stars',
    noHeartsToPlay: 'You have no hearts to play!',
    buyHeartsToContinue: 'Use earned stars to refill hearts and continue playing.',
  },

  // Robo path game
  roboPath: {
    perfect: 'Perfect!',
    perfectMessage: 'You found the optimal solution!',
    addCommandUp: 'Add command: up',
    addCommandDown: 'Add command: down',
    addCommandLeft: 'Add command: left',
    addCommandRight: 'Add command: right',
    removeCommand: 'Remove last command',
    runRobot: 'Run robot',
    addCommands: 'Add commands...',
    max: 'MAX',
    distanceToGoal: 'Distance to goal:',
    steps: 'steps',
    showNumbers: 'Show numbers',
    hideNumbers: 'Hide numbers',
    hint: '💡 Hint',
    hint1: 'Try moving towards the goal!',
    hint2: 'To avoid stones, try a different path!',
    hint3: 'See the optimal path (translucent arrow shows)',
    crashWithStone: '❌ Oops! Robot crashed into a stone!',
    needMoreCommands: '❌ Robot needs more commands to reach the goal!',
    reachedGoal: '✅ Great! Robot reached the goal!',
    programming: 'Programming is giving sequential commands',
    avoidObstacles: 'Obstacles (stones) must be avoided',
    excellent: 'Excellent! ⭐⭐⭐',
    good: 'Great! ⭐⭐',
    solved: 'Solved! ⭐',
    youUsed: 'You used',
    commands: 'commands',
    optimalIs: 'optimal is',
    time: 'Time:',
    bestTime: 'Best:',
    earnedXP: 'Earned XP:',
    tryAgainFor3Stars: 'Try again to get 3 stars!',
    tryAgainPrompt: 'Try again to get all the stars?',
    tryAgainButton: 'Try again',
    nextButton: 'Next',
    continueButton: 'Continue',
    greatJob: 'Great job!',
    tryAgainForBetter: 'Try again for a better solution?',
    stars: 'Stars:',
    legendStart: 'Start',
    legendObstacle: 'Blocked',
    legendGoal: 'Goal',
    legendHint: 'Hint',
  },

  // Unit conversion game
  unitConversion: {
    question: 'How many {to} are in {value} {from}?',
    units: {
      m: 'meters',
      km: 'kilometers',
      cm: 'centimeters',
      mm: 'millimeters',
      kg: 'kilograms',
      g: 'grams',
      t: 'tons',
      l: 'liters',
      ml: 'milliliters',
      dl: 'deciliters',
    },
  },

  // Level up modal
  levelUp: {
    level: 'LEVEL',
    greatWork: 'Great work! You are a true master. ⭐',
    nextLevel: 'NEXT LEVEL',
  },

  // Game names and descriptions
  games: {
    word_builder: {
      title: 'WORD MASTER',
      desc: 'Build a word from letters',
      gameDescription:
        'You see a picture (emoji) and must choose the right letters in order to spell the word. The letters are mixed up – tap them in the correct order. Start with the first letter!',
      hintRevealNextCost: 'Reveal next letter ({cost}⭐)',
      hintEliminateCost: 'Remove one wrong letter ({cost}⭐)',
    },
    word_cascade: {
      title: 'WORD CASCADE',
      desc: 'Core words',
      gameDescription:
        'Letters fall from the top – tap them in the right order to spell the target word. If a letter reaches the red line, you get a strike. Collect stars ⭐, hearts ❤️, and shields that remove a strike.',
      hintRevealNextCost: 'Reveal next letter ({cost}⭐)',
    },
    word_cascade_long: {
      title: 'LONG WORDS',
      desc: 'Longer Word Cascade words',
      gameDescription:
        'This is the longer-word pack for Word Cascade. Tap falling letters in the right order and finish an 8-11 letter word. Use the next-letter hint when it gets tricky.',
    },
    syllable_builder: {
      title: 'SYLLABLE MASTER',
      desc: 'Put syllables together into a word',
      gameDescription:
        'You see a picture and syllable parts. Syllables are parts of a word – drag them into the right order to form the full word. Saying the word out loud helps you hear if it sounds right.',
    },
    pattern: {
      title: 'PATTERN TRAIN',
      desc: 'Continue the pattern',
      gameDescription:
        'The train has carriages with emojis that follow a pattern. Choose the correct next carriage from four options. Look at how the pattern repeats (e.g. A-B-A-B or A-B-C-A-B-C).',
      hintEliminateCost: 'Remove one wrong ({cost}⭐)',
    },
    sentence_logic: {
      title: 'SENTENCE DETECTIVE',
      desc: 'Where is the object?',
      gameDescription:
        'Read the sentence and look at the scene. The sentence says where the object is (e.g. "The cat is on the sofa"). Choose the correct answer from four options. Pay attention to the grammar.',
    },
    memory_math: {
      title: 'MATH MEMORY',
      desc: 'Find the equation and answer',
      gameDescription:
        'Flip the cards and find pairs: one card is an equation (e.g. 3+4) and the other is the answer (7). Remember where each card is to find the pairs quickly.',
      hintRevealPairCost: 'Reveal one pair ({cost}⭐)',
    },
    picture_pairs: {
      title: 'PICTURE PAIRS',
      desc: 'Match pictures and words',
      gameDescription:
        'Classic memory game: flip the cards and find the picture (emoji) and word pair. Before the game starts you get a short peek – remember the positions!',
      hintRevealPairCost: 'Reveal one pair ({cost}⭐)',
    },
    robo_path: {
      title: 'ROBO PATH',
      desc: 'Program the robot',
      gameDescription:
        'Give the robot commands (up, down, left, right) so it reaches the cell with the green window. Avoid obstacles. Choose the order of commands before pressing "Run".',
    },
    letter_match: {
      title: 'LETTER DETECTIVE',
      desc: 'Find the correct letter',
      gameDescription:
        'You see a word and a picture. The question is: which letter is in a certain position (e.g. first or second)? Choose the correct letter from four options. Uppercase and lowercase count as the same.',
    },
    unit_conversion: {
      title: 'UNITS',
      desc: 'Convert units',
      gameDescription:
        'Convert from one unit to another (e.g. metres to centimetres, kilograms to grams). Read the question carefully and choose the correct answer.',
      hintEliminateCost: 'Remove one wrong ({cost}⭐)',
    },
    balance_scale: {
      title: 'SCALES',
      desc: 'Balance the scales',
      gameDescription:
        'The left side of the scale has weights. Work out the sum on the left and choose the weight that balances the right side. Pick the correct weight from four options.',
      hintEliminateCost: 'Remove one wrong ({cost}⭐)',
      chooseWeight: 'Which weight balances the scale?',
    },
    time_match: {
      title: 'CLOCK GAME',
      desc: 'Set the time',
      gameDescription:
        'You see a clock showing hours and minutes. Choose the correct time from four options (e.g. "3 o\'clock" or "half past 4"). The hour is the bigger hand, the minute the smaller.',
      hintEliminateCost: 'Remove one wrong time ({cost}⭐)',
    },
    addition_snake: {
      title: 'ADDITION SNAKE',
      desc: 'Addition within 20',
      gameDescription:
        'Move with the arrow keys and eat apples – the snake grows. Apples carry addition facts (e.g. 6 + 7) with sums up to 20. Pick the right answer from four.',
      hintEliminateCost: 'Remove one wrong ({cost}⭐)',
    },
    addition_big_snake: {
      title: 'BIG ADDITION SNAKE',
      desc: 'Addition within 100',
      gameDescription:
        'Same snake, bigger numbers. Addition up to 100. Good once the small addition snake feels easy.',
      hintEliminateCost: 'Remove one wrong ({cost}⭐)',
    },
    subtraction_snake: {
      title: 'SUBTRACTION SNAKE',
      desc: 'Subtraction within 20',
      gameDescription:
        'A snake whose apples carry subtraction facts up to 20. Missing-number variants appear too (? − 5 = 3). Pick the right answer from four.',
      hintEliminateCost: 'Remove one wrong ({cost}⭐)',
    },
    subtraction_big_snake: {
      title: 'BIG SUBTRACTION SNAKE',
      desc: 'Subtraction within 100',
      gameDescription:
        'Larger subtraction snake up to 100. Aimed at 3rd grade once the small subtraction snake feels easy.',
      hintEliminateCost: 'Remove one wrong ({cost}⭐)',
    },
    multiplication_snake: {
      title: 'MULTIPLICATION SNAKE',
      desc: 'Times table 1–5',
      gameDescription:
        'Fly a cosmic snake across the stars and eat planets! Each planet is a multiplication (e.g. 3 × 4). Pick the right answer from four. Factors 2–5, aimed at 2nd grade.',
      hintEliminateCost: 'Remove one wrong ({cost}⭐)',
    },
    multiplication_big_snake: {
      title: 'BIG MULTIPLICATION SNAKE',
      desc: 'Times table 1–10',
      gameDescription:
        'The full times table with factors 2 through 10. Galaxy snake for harder facts — the 3rd-grade target.',
      hintEliminateCost: 'Remove one wrong ({cost}⭐)',
    },
    multiplication_fact_drill_1_5: {
      title: 'TIMES SPRINT 1–5',
      desc: 'Times table 1–5 at speed',
      gameDescription:
        'Solve as many multiplication facts as you can in 60 seconds. Factors 2–5. The goal is to automate the times table — the answer should come from memory, not counting. Wrong answers reset the streak but never punish.',
    },
    multiplication_fact_drill_1_10: {
      title: 'TIMES SPRINT 1–10',
      desc: 'Times table 1–10 at speed',
      gameDescription:
        'The full times table in a 60-second sprint. Factors 2–10. Suits 3rd-grade level once the facts are familiar and the focus shifts to fluency.',
    },
    compare_sizes: {
      title: 'NUMBER COMPARE',
      desc: 'Compare numbers',
      gameDescription:
        'Compare two numbers or amounts. Choose the correct symbol: < (less than), = (equal), or > (greater than). Look at both sides carefully.',
      instruction: 'Which symbol is correct?',
      symbolInstruction: 'Choose the correct comparison symbol',
      selectSymbol: 'Select symbol',
      leftBigger: 'Left is bigger',
      rightBigger: 'Right is bigger',
      equal: 'They are equal',
      leftItem: 'Left number',
      rightItem: 'Right number',
      hintEliminateCost: 'Remove one wrong ({cost}⭐)',
    },
    shape_shift: {
      title: 'SHAPE SHIFT',
      desc: 'Build shapes from pieces',
      gameDescription:
        "Drag the shape pieces onto the board and place them to match the image. Tap a piece to rotate it 90°. In some modes you build the shape yourself or find the piece that doesn't belong.",
      instructions: {
        match: 'Drag pieces to the correct spots',
        rotate: 'Tap to rotate, drag to place',
        build: 'Build the shape from pieces',
        expert: 'One piece is extra!',
      },
      tapToRotate: 'Tap to rotate',
      dragToPlace: 'Drag to place',
      dragHint: 'Drag a shape to the board to start',
      firstMovePrompt: 'Drag a piece onto the matching shadow',
      remainingCount: '{count} pieces left',
      adjustPlacedPieces: 'Match the pieces to the shadows',
      allPiecesPlaced: 'All pieces are on the board',
      hintOutline: 'Show colors (1⭐)',
      hintPlacePiece: 'Place one piece (2⭐)',
      hintOutlineCost: 'Show colors ({cost}⭐)',
      hintPlacePieceCost: 'Place one piece ({cost}⭐)',
      hintOutlineUsed: 'Outline used',
      hintPlacePieceUsed: 'Place one used',
      hintOutlineDescription: 'Briefly show the colored solution outline',
      hintPlacePieceDescription: 'Put one piece in place for you',
      hintText:
        'Drag shapes onto the matching shadows. Tap to rotate. A hint can briefly reveal the colors.',
      rotateButton: 'Rotate 90°',
      orUse: 'or use',
      piecesRemaining: 'Pieces left',
      complete: 'Excellent! 🎉',
      tryAgain: 'Not quite – try again',
      categories: {
        shapes: 'Shapes',
        animals: 'Animals',
        objects: 'Objects',
        letters: 'Letters',
        abstract: 'Abstract',
      },
      puzzleNames: {
        simple_square: 'Square',
        simple_house: 'House',
        simple_tree: 'Tree',
        simple_diamond: 'Diamond',
        ice_cream: 'Ice Cream',
        cat_face: 'Cat',
        fish: 'Fish',
        boat: 'Boat',
        arrow_right: 'Arrow',
        mushroom: 'Mushroom',
        butterfly: 'Butterfly',
        rocket: 'Rocket',
        bird: 'Bird',
        heart: 'Heart',
        star: 'Star',
        castle: 'Castle',
      },
    },
    star_mapper: {
      title: 'STAR MAPPER',
      desc: 'Learn the constellations',
      gameDescription:
        'Connect the stars with lines to form a constellation (e.g. Ursa Major). In some modes you follow a guide; in others you build from memory. Use the "Undo" button if you make a mistake.',
    },
    shape_dash: {
      title: 'SHAPE DASH',
      desc: 'Jump, dodge, and answer geometry',
      gameDescription:
        'Your character runs automatically. Press Space or tap to jump over obstacles. Pass through the correct shape gate to answer geometry questions while running! Wrong gate = lose combo/shield, but keep running. Hit 2 wrong gates in a row or crash into obstacles = game over.',
      tapToRetry: 'Tap to try again',
      jumpLabel: 'Jump',
      playAreaLabel: 'Shape Dash play area',
      completeLabel: 'LEVEL COMPLETE!',
      jumpHint: 'or tap to jump • Double-jump available!',
      attemptLabel: 'Attempt',
      scoreLabel: 'Score',
      starsLabel: 'Stars',
      shieldLabel: 'Shield',
      hintRevealGateCost: 'Reveal correct gate ({cost}⭐)',
      hintSlowTimeCost: 'Slow time near gates ({cost}⭐)',
      gateApproaching: 'Shape Gate Ahead!',
      gateCorrect: 'Correct Gate! +200',
      gateWrong: 'Wrong Gate! -Combo',
      consecutiveWrongWarning: 'Warning: One more wrong gate = crash!',
      oneMoreWrongWarning: '⚠️ One more wrong = CRASH!',
      wrongGateNextWarning: '⚠️ Wrong gate! Next one crashes!',
      shieldLost: '⚠️ Shield Lost!',
      shapeNames: {
        Triangle: 'Triangle',
        Square: 'Square',
        Pentagon: 'Pentagon',
        Hexagon: 'Hexagon',
        Circle: 'Circle',
        Rectangle: 'Rectangle',
        Rhombus: 'Rhombus',
        Oval: 'Oval',
      },
      questions: {
        triangleSides: 'How many sides does a triangle have?',
        squareSides: 'How many sides does a square have?',
        pentagonSides: 'How many sides does a pentagon have?',
        hexagonSides: 'How many sides does a hexagon have?',
        circleSides: 'How many sides does a circle have?',
        rectangleSides: 'How many sides does a rectangle have?',
        triangleName: 'Triangle – how many sides?',
        squareName: 'Square – how many sides?',
        triangleVertices: 'How many vertices does a triangle have?',
        squareVertices: 'How many vertices does a square have?',
        rectangleCorners: 'How many corners does a rectangle have?',
        hexagonSidesAlt: 'A hexagon has how many sides?',
        whichThree: 'Which shape has 3 sides?',
        whichFour: 'Which shape has 4 sides?',
        whichSix: 'Which shape has 6 sides?',
        circleEdges: 'How many edges does a circle have?',
        whichFive: 'Which shape has 5 sides?',
        whichZero: 'Which shape has 0 sides?',
        octagonSides: 'How many sides does an octagon have?',
        triangleCorners: 'How many corners does a triangle have?',
        squareCorners: 'How many corners does a square have?',
        pentagonVertices: 'How many vertices does a pentagon have?',
        hexagonVertices: 'How many vertices does a hexagon have?',
        rectangleSidesCount: 'How many sides does a rectangle have?',
        rhombusSides: 'How many sides does a rhombus have?',
        ovalSides: 'How many sides does an oval have?',
        starPoints: 'A 5-pointed star has how many points?',
      },
    },
    battlelearn: {
      title: 'BATTLELEARN',
      desc: 'Answer and sink ships',
      gameDescription:
        "Pick a cell on the grid – if a ship is there, you get a hit; if it's empty, you miss. Some cells ask a math or logic question. Sink all the ships to win!",
      hintRevealEmptyCost: 'Reveal one empty cell ({cost}⭐)',
      hintRevealCost: 'Reveal one ship position ({cost}⭐)',
      hintEliminateCost: 'Eliminate one wrong answer ({cost}⭐)',
    },
    battlelearn_adv: {
      title: 'BATTLELEARN',
      desc: 'Master coordinates and arithmetic',
      hintRevealEmptyCost: 'Reveal one empty cell ({cost}⭐)',
      hintRevealCost: 'Reveal one ship position ({cost}⭐)',
      hintEliminateCost: 'Eliminate one wrong answer ({cost}⭐)',
    },
  },

  // Difficulty levels
  difficulty: {
    easy: '⭐ Easy',
    medium: '⭐⭐ Medium',
    hard: '⭐⭐⭐ Hard',
  },

  // Star Mapper game
  starMapper: {
    title: 'STAR MAPPER',
    desc: 'Learn the constellations',
    instructions: {
      trace: 'Connect the stars following the guide',
      build: 'Connect the stars from memory',
      identify: 'Which constellation is this?',
      expert: 'Find and connect the correct stars',
    },
    hint: 'Hint',
    formLabel: 'Form',
    undo: 'Undo',
    tryAgain: 'Not quite – try again',
    linesRemaining: 'Lines remaining: {count}',
    complete: 'Excellent! 🌟',
    hintGuideCost: 'Show guide ({cost}⭐)',
    hintConnectCost: 'Connect one line ({cost}⭐)',
    constellations: {
      ursa_major: {
        name: 'Big Dipper',
        folk: 'The Plough',
        desc: 'Most famous northern constellation',
      },
      ursa_minor: { name: 'Little Dipper', folk: 'Little Bear', desc: 'Home of the North Star' },
      cassiopeia: { name: 'Cassiopeia', desc: 'The W-shaped queen' },
      orion: { name: 'Orion', folk: 'The Hunter', desc: 'Winter hunter with three belt stars' },
      cygnus: { name: 'Cygnus', desc: 'The Northern Cross' },
      leo: { name: 'Leo', desc: 'The spring lion' },
      lyra: { name: 'Lyra', desc: 'Home of the star Vega' },
      aquila: { name: 'Aquila', desc: 'Home of the star Altair' },
      pegasus: { name: 'Pegasus', desc: 'The Great Square of autumn' },
      draco: { name: 'Draco', desc: 'The winding dragon' },
      cepheus: { name: 'Cepheus', desc: 'The king of the north' },
      taurus: { name: 'Taurus', desc: 'Winter bull with Aldebaran' },
      gemini: { name: 'Gemini', desc: 'Castor and Pollux twins' },
      auriga: { name: 'Auriga', desc: 'Charioteer with bright Capella' },
      andromeda: { name: 'Andromeda', desc: 'Chain of stars pointing to the galaxy' },
      corona_borealis: { name: 'Corona Borealis', desc: 'Northern Crown semicircle' },
    },
    seasons: {
      circumpolar: 'Year-round',
      winter: 'Winter',
      spring: 'Spring',
      summer: 'Summer',
      autumn: 'Autumn',
    },
  },

  // BattleLearn game
  battlelearn: {
    title: 'BATTLELEARN',
    titleAdv: 'BATTLELEARN',
    desc: 'Answer questions to earn shots and sink ships',
    descAdv: 'Master coordinates and arithmetic to sink the fleet',
    instructions: 'Shoot cells! Answer a question only when you hit a problem cell.',
    shotReady: 'Shot Ready!',
    clickToShoot: 'Click a cell to shoot!',
    answerToEarnShot: 'Answer to earn a shot',
    answerToContinue: 'Answer the question to continue shooting:',
    shipsRemaining: 'Ships',
    triesBeforeHeart: 'Wrong before ❤️',
    strikesAriaLabel: '{count} water hits before losing a heart',
    hit: '💥 Hit!',
    miss: '💦 Miss! Answer to continue.',
    shipSunk: '🎯 Ship sunk!',
    victory: 'Victory!',
    allShipsSunk: 'All ships sunk!',
    alreadyShot: 'Already shot here!',
    coordinateQuestion: 'Coordinate question',
    navigationQuestion: 'Navigation task',
    fleetMath: 'Fleet mathematics',
    questions: {
      // Counting questions
      countShips: 'How many ships?',
      countObjects: 'How many {item}?',
      // Arithmetic questions
      simpleAddition: '{a} ships + {b} ships = ?',
      simpleSubtraction: '{a} ships - {b} ships = ?',
      ammunition: '{total} torpedoes - {fired} fired = ?',
      missingNumber: '{a} + ? = {result}',
      missingNumberSub: '{a} - ? = {result}',
      // Comparison questions
      greaterThan: 'Which is greater: {a} or {b}?',
      lessThan: 'Which is less: {a} or {b}?',
      // Coordinate questions
      navigate: 'Position {start}, move {moves} right',
      navigateLeft: 'Position {start}, move {moves} left',
      navigateUp: 'Position {start}, move {moves} up',
      navigateDown: 'Position {start}, move {moves} down',
      // Pattern questions
      patternNext: 'Signal pattern: {pattern}, __',
      sequenceNext: 'Next number: {sequence}, __',
      // Word problems
      wordProblem1: 'Captain saw {a} ships in morning and {b} in evening. Total?',
      wordProblem2: 'Ship had {total} sailors. {left} departed. How many remain?',
      wordProblem3: 'Each ship has {perShip} cannons. {ships} ships total?',
      // Time-based
      timeProblem: 'Journey started at {start}:00 and lasted {duration} hours. When did it end?',
      // Money counting
      coinProblem: 'You have {count} coins worth {value}€. Total?',
      // Multi-step
      twoStep: '{a} ships arrived and {b} left. Initially there were {initial}. Now?',
      // Logic puzzles
      logicPuzzle: 'If {a} > {b} and {b} > {c}, then {a} ? {c}',
      // Area/perimeter
      areaProblem: 'Ship is {width} × {height} squares. Area?',
      perimeterProblem: 'Dock is {width} × {height} squares. Perimeter?',
      // Direction sequences
      directionSequence: 'Move {dir1}, then {dir2}. What direction?',
      // Advanced coordinate
      multiMove: 'Start at {start}, move {right} right, {up} up. New coordinate?',
      // Vector addition
      vectorAdd:
        'Ship moves {right1} right and {up1} up, then {right2} right and {up2} up. Total steps?',
      // Distance
      distance: 'Ship at {coord1}, target at {coord2}. Distance?',
      // Multiplication
      fleetMultiply: '{ships} destroyers × {cannons} cannons = ?',
      // Formation problems
      formationCount: 'Ships in rows: {row1}, {row2}, {row3}. Total?',
      // Strategic positioning
      strategicPos: 'Best attack position in range {x1}-{x2}, {y1}-{y2}. Center point?',
    },
  },

  // Level label
  level: 'Level',
} as const;
