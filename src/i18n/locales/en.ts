/**
 * English translations
 * Inglise keele tõlked
 */
export const en = {
  // Common
  controlPad: {
    up: 'Up',
    down: 'Down',
    left: 'Left',
    right: 'Right',
  },

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
    forStars_one: 'for {count} star',
    forStars_other: 'for {count} stars',
  },

  // Accessibility
  accessibility: {
    skipToContent: 'Skip to main content',
  },

  // KHE site header
  siteHeader: {
    homeLabel: 'KHE.ee home',
    languageLabel: 'Language',
    darkTheme: 'Dark theme',
  },

  // The site footer (@khelias/ui)
  siteFooter: {
    linksLabel: 'Page links',
    privacy: 'Privacy',
    hosting: 'Runs on a home server in Estonia',
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
      'Correct!',
      'Great!',
      'Very good!',
      'Fantastic!',
      'Wonderful!',
      'Good job!',
      'Perfect!',
      'Amazing!',
      'Wow!',
      'Well done!',
      'That was easy for you!',
      'Like a pro!',
    ],
    wrong: [
      'Try again!',
      "Don't give up!",
      'You can do it!',
      'Keep going!',
      "You're on the right track!",
      'Try once more!',
      'Almost!',
      'Very close!',
      'Next time it will work!',
      "Don't quit!",
    ],
    streak: [
      '2 correct in a row!',
      '3 correct in a row!',
      '4 correct in a row!',
      '5 correct in a row!',
      '6 correct in a row!',
      '7 or more correct in a row!',
    ],
    levelUp: ['Level up!', 'New level!', "You're making progress!", 'Great!'],
    correctAnswerIs: 'The correct answer was {answer}',
    notThisOne: 'Not this one, try again!',
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
    closeTip: 'Close tip',
    closeHint: 'Close hint',
    closeAchievement: 'Close achievement',
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
    stats: 'Statistics',
    achievements: 'Achievements',
    tutorial: 'Tutorial',
    settings: 'Settings',
    reset: 'Reset progress',
    sound: 'Sound',
    score: 'Score',
    stars: 'Stars',
    favourites: 'Favourites',
  },

  // Game
  game: {
    stars: 'Stars',
    score: 'Score',
    level: 'Level',
    hint: 'Hint',
    skip: 'Skip',
    submit: 'Submit',
    correct: 'Correct',
    wrong: 'Wrong',
    timeUp: 'Time up!',
    returnToMenu: 'Return to menu',
    continue: 'Continue',
    highScore: 'High score',
    newRecord: 'New Record!',
    snakeSummary: {
      title: 'Round summary',
      maxLength: 'Longest snake',
      accuracy: 'Accuracy',
      bestStreak: 'Best streak',
      factsAttempted: 'Facts',
      hardestFacts: 'Practice these next time',
      noMistakes: 'No mistakes, well done!',
      noFactsAttempted: "You didn't reach any facts this run. Try again!",
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
    spendableStars: 'Star balance',
    spendableStarsHint: 'Use these for hints and themes.',
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
    modalTitle: 'Achievements',
    collectedLabel: 'achievements collected',
    items: {
      first_game: {
        title: 'First Step',
        desc: 'Play your first game',
      },
      perfect_5: {
        title: 'Perfect Streak',
        desc: 'Answer 5 tasks correctly in a row',
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
        desc: 'Grow the snake to at least 20 segments',
      },
      snake_growth_30: {
        title: 'Very Long Snake',
        desc: 'Grow the snake to at least 30 segments',
      },
      snake_growth_max: {
        title: 'Maximum Snake',
        desc: 'Grow the snake to its maximum length (49)',
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
        desc: 'Reach Word Cascade level 5',
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
    showAchievements: 'Show achievements',
    showStats: 'Show statistics',
    toggleSoundOn: 'Turn sound on',
    toggleSoundOff: 'Turn sound off',
    deleteProgress: 'Delete saved progress',
    showTutorial: 'Show tutorial',
    tutorial: 'Tutorial',
    starCollector: 'Star collector',
    newGame: 'New',
    language: 'Language',
    editFavourites: 'Edit favourites',
    editFavouritesTitle: 'Choose games for Favourites section',
    save: 'Save',
    allFilter: 'All',
    subjects: 'Subjects',
    choosePack: 'Choose pack',
    packCount_one: '{count} pack',
    packCount_other: '{count} packs',
    picturePairsVariantLabel: 'Picture Pairs mode',
    picturePairsVariantEmojiOnly: 'Emoji ↔ emoji',
    picturePairsVariantEmojiWord: 'Word ↔ emoji',
    learnersHeading: 'Learner',
    addLearner: 'Add a new learner',
    addLearnerTitle: 'Add learner',
    addLearnerNamePrompt: 'Learner name:',
    addLearnerNamePlaceholder: 'E.g. Alex',
    removeLearner: 'Delete learner',
    removeLearnerTitle: 'Delete learner',
    removeLearnerConfirm: 'Delete learner {name}?',
    deleteProgressTitle: 'Delete progress',
    deleteProgressConfirm: 'Delete all saved progress? This action cannot be undone.',
    sectionProfile: 'Profile',
    sectionProgress: 'Progress',
    sectionPreferences: 'Preferences',
    sectionSystem: 'System',
    settingsTitle: 'Settings',
  },

  // Mechanics — one entry per shared engine. The menu groups bindings by
  // mechanic and shows the title/desc here on the aggregate card.
  mechanics: {
    math_snake: {
      title: 'Number snake',
      desc: 'Eat apples, solve the equation',
    },
    word_cascade: {
      title: 'Word cascade',
      desc: 'Catch letters and build words',
    },
    fact_drill: {
      title: 'Fact sprint',
      desc: 'Answer facts at speed',
    },
    battlelearn: {
      title: 'BattleLearn',
      desc: 'Sink ships with answers',
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
        'Games are played in rounds. Every round you finish gives stars, and three rounds raise the level.',
    },
    beCareful: {
      title: 'Be careful',
      content:
        'Every round has three lives and a wrong answer costs one. A new round starts with three again.',
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
    roundLabel: 'Round',
    roundLives: 'Lives left: {count}',
    changeLevel: 'Change level',
    gameDescriptionTitle: 'How to play',
    starProgress: {
      one: '1/5 stars',
      two: '2/5 stars',
      three: '3/5 stars',
      four: '4/5 stars',
      last: 'Last star!',
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
      instruction: 'Put the syllables in order to make a word',
      correct: 'Correct:',
    },
    letterMatch: {
      instruction: 'Find the same letter in lowercase',
    },
    wordBuilder: {
      instruction: 'Look at the picture and build the word from the letters',
      preFilled: 'Hint: some letters are already in place!',
    },
    wordCascade: {
      triesLeft_one: '{count} try left',
      triesLeft_other: '{count} tries left',
      outOfTries: 'Out of tries',
      letterLabel: 'Letter {letter}',
      tapThisLetter: 'Letter {letter}, tap this one',
    },
    pattern: {
      instruction: 'Finish the pattern',
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
      oClock: '{hour} o’clock',
      halfPast: 'half past {hour}',
      quarterPast: 'quarter past {hour}',
      quarterTo: 'quarter to {nextHour}',
    },
    mathSnake: {
      nextMathLabel: 'Next problem',
    },
    factDrill: {
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
      finalAccuracyLabel: 'Accuracy',
      restartLabel: 'Start over',
    },
    selectLevel: 'Select level',
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
        'Look at the first letter: it helps you start!',
        'Think about which letters go together!',
      ],
      syllable_builder: [
        'Syllables are parts of a word. Put them together!',
        'See how the syllables fit together!',
        'Say the word out loud as you build it!',
      ],
      pattern: [
        'Say the pictures out loud: apple, pear, apple, pear. What comes next?',
        'Find the place where the pattern starts again.',
        'Look at the last carriage and think what came after it last time.',
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
        'Think before you turn: hitting the wall or your own tail costs a life.',
        '6 + 7: make ten first. 6 + 4 = 10, then 3 more, 13 in all.',
        'On a computer you can steer with the arrow keys too.',
      ],
      addition_big_snake: [
        'Add the tens first, then the ones: 37 + 25 is 30 + 20 = 50 and 7 + 5 = 12, 62 in all.',
        'The longer the snake, the further ahead you need to think about turning.',
        'On a computer you can steer with the arrow keys too.',
      ],
      subtraction_snake: [
        'Check with adding: 12 − 5 = 7, because 5 + 7 = 12.',
        'A question mark is a missing number. Think which number fits there.',
        'On a computer you can steer with the arrow keys too.',
      ],
      subtraction_big_snake: [
        'Take away the tens first, then the ones: 63 − 20 = 43, then 43 − 8 = 35.',
        'Check with adding: 35 + 28 = 63.',
        'On a computer you can steer with the arrow keys too.',
      ],
      multiplication_snake: [
        '3 × 4 is three rows with four stars in each row.',
        'If you forget, add: 4 × 3 = 3 + 3 + 3 + 3 = 12.',
        'On a computer you can steer with the arrow keys too.',
      ],
      multiplication_big_snake: [
        '7 × 8 is easy to forget: 7 × 10 = 70, take away 7 × 2 = 14, you get 56.',
        'Double it: 6 × 8 is two times 3 × 8, that is 24 + 24 = 48.',
        'On a computer you can steer with the arrow keys too.',
      ],
      multiplication_fact_drill_1_5: [
        'Try to answer from memory, without counting on your fingers.',
        'A wrong answer costs no life, your streak just starts again.',
        'Play a few times in a row: the answers come faster each time.',
      ],
      multiplication_fact_drill_1_10: [
        '7 × 8 and 6 × 9 are the hardest. Take a moment and think calmly.',
        'If you forget, use a nearby fact: 6 × 9 is 6 × 10 minus 6, that is 54.',
        'A wrong answer costs no life, your streak just starts again.',
      ],
      addition_fact_drill_within_20: [
        'Make ten: 7 + 6 = 7 + 3 + 3 = 13.',
        'Try to answer from memory, without counting on your fingers.',
        'A wrong answer costs no life, your streak just starts again.',
      ],
      addition_fact_drill_within_100: [
        'Add the tens and the ones apart: 37 + 25 is 50 and 12, 62 in all.',
        '29 + 16: add 30 + 16 = 46 and take 1 away, you get 45.',
        'A wrong answer costs no life, your streak just starts again.',
      ],
      subtraction_fact_drill_within_20: [
        'The bigger number always comes first, so the answer never goes below zero.',
        'Check with adding: 12 − 5 = 7, because 5 + 7 = 12.',
        'Try to answer from memory, without counting on your fingers.',
      ],
      subtraction_fact_drill_within_100: [
        'Take away the tens first, then the ones: 63 − 20 = 43, then 43 − 8 = 35.',
        'Check with adding: 35 + 28 = 63.',
        'Play a few times in a row: the answers come faster each time.',
      ],
      division_fact_drill_1_5: [
        'Dividing is multiplying backwards: 12 ÷ 3 = 4, because 3 × 4 = 12.',
        'Here the division always comes out exactly.',
        'If you forget, think of the times table.',
      ],
      division_fact_drill_1_10: [
        '56 ÷ 8: what number times 8 makes 56? 7 × 8 = 56, so the answer is 7.',
        'One times fact gives two divisions: 7 × 8 = 56, so 56 ÷ 8 = 7 and 56 ÷ 7 = 8.',
        'Here the division always comes out exactly.',
      ],
      time_match: [
        'The short hand shows the hour, the long hand the minutes.',
        'When the long hand points at 12, it is exactly that hour, like 3 o’clock.',
        'When the long hand points at 6, it is half past the hour, like half past 3.',
      ],
      letter_match: [
        'Look at the capital letter and find the small one!',
        'Think which letter fits!',
        'A capital and a small letter can be the same letter!',
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
        'Tap one star and then another, or drag from star to star.',
        'Drag the sky to look around and pinch to zoom.',
        'You can undo a wrong line.',
        'My sky shows every constellation you have found.',
      ],
      word_cascade: [
        'Look only for the letter the word needs next.',
        'Say the word out loud first and listen for the next letter.',
        'Stuck? The hint shows the next letter.',
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
    title: 'Statistics',
    close: 'Close statistics',
    highestLevels: 'Highest levels',
  },

  // Shop
  shop: {
    starsBadge: 'Stars {value}, open the shop',
    title: 'Shop',
    yourStarBalance: 'Star balance',
    starBalanceDescription: 'Every round you finish gives stars; use them for hints and themes.',
    lifetimeStars: 'Lifetime earned',
    price: 'Price',
    free: 'Free',
    notEnoughStars: 'Not enough stars',
    buyStars: 'Buy stars',
    buyStarsDescription:
      'Real payments are not wired up yet. Until then, you can add star balance for free; purchased stars do not count toward earned-star achievements.',
    buy50Stars: 'Add {count} stars',
    themes: 'Themes',
    themesDescription:
      'A theme changes the background of the menu and the games. A theme you buy stays yours, and you can switch at any time.',
    tierCommon: 'Common',
    tierRare: 'Rare',
    tierSpecial: 'Special',
    buyTheme: 'Buy',
    useTheme: 'Use',
    themeInUse: 'In use',
    buyThemeLabel: 'Buy the {name} theme for {cost} stars',
    useThemeLabel: 'Use the {name} theme',
    themeInUseLabel: 'The {name} theme is in use',
  },

  // Robo path game
  roboPath: {
    removeCommand: 'Remove last command',
    runRobot: 'Run robot',
    addCommands: 'Add commands...',
    youUsed: 'You used',
    commands: 'commands',
    optimalIs: 'Shortest way:',
    tryAgainButton: 'Try again',
    continueButton: 'Continue',
    greatJob: 'Great job!',
    tryAgainForBetter: 'Try a shorter way?',
    legendStart: 'Start',
    legendObstacle: 'Blocked',
    legendGoal: 'Goal',
    legendHint: 'Hint',
    commandCount: 'Commands',
    oneCommandLeft: 'One more command',
  },

  // Unit conversion game
  unitConversion: {
    question: 'How many {to} are in {value} {from}?',
    instruction: 'Work it out and pick the right answer',
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
    unitsOne: {
      m: 'meter',
      km: 'kilometer',
      cm: 'centimeter',
      mm: 'millimeter',
      kg: 'kilogram',
      g: 'gram',
      t: 'ton',
      l: 'liter',
      ml: 'milliliter',
      dl: 'deciliter',
    },
  },

  // Round end screen
  roundEnd: {
    reachedTitle: 'Round done!',
    lostTitle: 'Out of lives',
    levelUp: 'New level: {level}!',
    levelPassed: 'You have passed this level already.',
    roundsToLevel_one: '{count} more round to level {level}.',
    roundsToLevel_other: '{count} more rounds to level {level}.',
    timedGoal: 'A round counts when you answer at least 10 times, nearly all right.',
    starsEarned_one: 'You earned {count} star',
    starsEarned_other: 'You earned {count} stars',
    nextRound: 'Next round',
  },

  // Game names and descriptions
  games: {
    word_builder: {
      title: 'Word master',
      desc: 'Build a word from letters',
      gameDescription:
        'You see a picture (emoji) and must choose the right letters in order to spell the word. The letters are mixed up – tap them in the correct order. Start with the first letter!',
      hintRevealNextCost: 'Reveal next letter',
      hintEliminateCost: 'Remove one wrong letter',
    },
    word_cascade: {
      title: 'Word cascade',
      desc: 'Core words',
      gameDescription:
        'Letters fall in columns. Tap the letter the word needs next and finish the word. Three wrong taps in a row cost a life and the word starts over.',
      hintRevealNextCost: 'Reveal next letter',
    },
    word_cascade_long: {
      title: 'Long words',
      desc: 'Longer Word Cascade words',
      gameDescription:
        'This is the longer-word pack for Word Cascade. Tap falling letters in the right order and finish an 8-11 letter word. Use the next-letter hint when it gets tricky.',
    },
    syllable_builder: {
      title: 'Syllable master',
      desc: 'Put syllables together into a word',
      gameDescription:
        'You see a picture and some syllables. Tap the syllables in the right order to spell the name of what is in the picture. Tapped a wrong one? Tap it in the word and it goes back.',
    },
    pattern: {
      title: 'Pattern train',
      desc: 'Continue the pattern',
      gameDescription:
        "The train's carriages carry pictures that repeat in a set order. Choose, from three carriages, the one that comes next at the end of the train.",
      hintEliminateCost: 'Remove one wrong',
    },
    sentence_logic: {
      title: 'Sentence detective',
      desc: 'Where is the object?',
      gameDescription:
        'Read the sentence, for example “The cat is on the sofa”. Choose the picture where the thing is exactly where the sentence says.',
    },
    memory_math: {
      title: 'Math memory',
      desc: 'Find the equation and answer',
      gameDescription:
        'Flip the cards and find pairs: one card is an equation (e.g. 3+4) and the other is the answer (7). Remember where each card is to find the pairs quickly.',
      hintRevealPairCost: 'Reveal one pair',
    },
    picture_pairs: {
      title: 'Picture pairs',
      desc: 'Match pictures and words',
      gameDescription:
        'Classic memory game: flip the cards and find the picture (emoji) and word pair. Before the game starts you get a short peek – remember the positions!',
      hintRevealPairCost: 'Reveal one pair',
    },
    robo_path: {
      title: 'Robo path',
      desc: 'Program the robot',
      gameDescription:
        'Use the arrows to write down how the robot moves so it reaches the battery. It cannot go through a rock. When the commands are ready, press "Run robot".',
    },
    letter_match: {
      title: 'Letter detective',
      desc: 'Find the correct letter',
      gameDescription:
        'You see a capital letter. Find the same letter in lowercase among the choices. There are three choices at first, later four.',
    },
    unit_conversion: {
      title: 'Units',
      desc: 'Convert units',
      gameDescription:
        'Convert from one unit to another (e.g. metres to centimetres, kilograms to grams). Read the question carefully and choose the correct answer.',
      hintEliminateCost: 'Remove one wrong',
    },
    balance_scale: {
      title: 'Scales',
      desc: 'Balance the scales',
      gameDescription:
        'The left side of the scale has weights. Work out the sum on the left and choose the weight that balances the right side. Pick the correct weight from four options.',
      hintEliminateCost: 'Remove one wrong',
      chooseWeight: 'Which weight balances the scale?',
    },
    time_match: {
      title: 'Clock game',
      desc: 'Set the time',
      gameDescription:
        'Look at the clock hands: the short one shows the hour, the long one the minutes. Choose the right time. First the answers are in words, like “3 o’clock” or “half past 3”, later in numbers, like 3:05.',
      hintEliminateCost: 'Remove one wrong time',
    },
    addition_snake: {
      title: 'Addition snake',
      desc: 'Addition within 20',
      gameDescription:
        'Steer the snake with the arrow buttons and eat apples. Every second or third apple brings a sum, with answers up to 20. A right answer makes the snake longer. Don’t hit the wall or your own tail.',
      hintEliminateCost: 'Remove one wrong',
    },
    addition_big_snake: {
      title: 'Big addition snake',
      desc: 'Addition within 100',
      gameDescription:
        'Like the addition snake, with numbers up to 100. Steer with the arrow buttons and eat apples. Every second or third apple brings a sum.',
      hintEliminateCost: 'Remove one wrong',
    },
    subtraction_snake: {
      title: 'Subtraction snake',
      desc: 'Subtraction within 20',
      gameDescription:
        'Steer the snake with the arrow buttons and eat apples. Every second or third apple brings a subtraction up to 20, sometimes with a missing number (? − 5 = 3). A right answer makes the snake longer.',
      hintEliminateCost: 'Remove one wrong',
    },
    subtraction_big_snake: {
      title: 'Big subtraction snake',
      desc: 'Subtraction within 100',
      gameDescription:
        'Like the subtraction snake, with numbers up to 100. Steer with the arrow buttons and eat apples. Every second or third apple brings a subtraction.',
      hintEliminateCost: 'Remove one wrong',
    },
    multiplication_snake: {
      title: 'Multiplication snake',
      desc: 'Times table 1–5',
      gameDescription:
        'Steer the space snake with the arrow buttons and collect stars. Every second or third star is a planet with a times question, like 3 × 4, with numbers 2 to 5. A right answer makes the snake longer.',
      hintEliminateCost: 'Remove one wrong',
    },
    multiplication_big_snake: {
      title: 'Big multiplication snake',
      desc: 'Times table 1–10',
      gameDescription:
        'The whole times table, numbers 2 to 10. Steer with the arrow buttons and collect stars. Every second or third star is a planet with a times question.',
      hintEliminateCost: 'Remove one wrong',
    },
    multiplication_fact_drill_1_5: {
      title: 'Times sprint 1–5',
      desc: 'Times table 1–5 at speed',
      gameDescription:
        'Solve as many multiplication facts as you can in 60 seconds. Factors 2–5. The goal is to automate the times table: the answer should come from memory, not counting. Wrong answers reset the streak but never punish.',
    },
    multiplication_fact_drill_1_10: {
      title: 'Times sprint 1–10',
      desc: 'Times table 1–10 at speed',
      gameDescription:
        'The full times table in a 60-second sprint. Factors 2–10. Suits 3rd-grade level once the facts are familiar and the focus shifts to fluency.',
    },
    addition_fact_drill_within_20: {
      title: 'Plus sprint 20',
      desc: 'Addition within 20 at speed',
      gameDescription:
        'A 60-second addition sprint with operands 1–10 (sums up to 20). Automates the basic addition table: the answer comes from memory, not counting.',
    },
    addition_fact_drill_within_100: {
      title: 'Plus sprint 100',
      desc: 'Addition within 100 at speed',
      gameDescription:
        'Addition sprint with larger operands (1–50, sums up to 100). Suits grade 2–3 once basic addition is familiar.',
    },
    subtraction_fact_drill_within_20: {
      title: 'Minus sprint 20',
      desc: 'Subtraction within 20 at speed',
      gameDescription:
        '60-second subtraction sprint with operands 1–20. The larger number always comes first, so answers stay non-negative.',
    },
    subtraction_fact_drill_within_100: {
      title: 'Minus sprint 100',
      desc: 'Subtraction within 100 at speed',
      gameDescription:
        'Subtraction sprint with operands 1–100. Suits grade 3 once smaller subtraction is familiar.',
    },
    division_fact_drill_1_5: {
      title: 'Divide sprint 1–5',
      desc: 'Division 1–5 at speed',
      gameDescription:
        'A division sprint based on the 1–5 times table. Every fact has a whole-number answer (12 ÷ 3 = 4). Suits grade 3 once the times table is solid.',
    },
    division_fact_drill_1_10: {
      title: 'Divide sprint 1–10',
      desc: 'Division 1–10 at speed',
      gameDescription:
        'The full times table inverse in a 60-second sprint. Whole-number answers only. Suits grade 3–4.',
    },
    compare_sizes: {
      title: 'Number compare',
      desc: 'Compare numbers',
      gameDescription:
        'Compare two numbers or amounts. Choose the correct symbol: < (less than), = (equal), or > (greater than). Look at both sides carefully.',
      instruction: 'Compare the two sides and pick the right sign',
      leftBigger: 'Left is bigger',
      rightBigger: 'Right is bigger',
      equal: 'They are equal',
      leftItem: 'Left number',
      rightItem: 'Right number',
      hintEliminateCost: 'Remove one wrong',
    },
    shape_shift: {
      title: 'Shape shift',
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
      firstMovePrompt: 'Drag a piece onto its matching silhouette',
      remainingCount: '{count} pieces left',
      adjustPlacedPieces: 'Match the pieces to the shadows',
      allPiecesPlaced: 'All pieces are on the board',
      hintOutline: 'Show colors',
      hintPlacePiece: 'Place one piece',
      hintOutlineCost: 'Show colors',
      hintPlacePieceCost: 'Place one piece',
      hintOutlineUsed: 'Outline used',
      hintPlacePieceUsed: 'Place one used',
      hintOutlineDescription: 'Briefly show the colored solution outline',
      hintPlacePieceDescription: 'Put one piece in place for you',
      hintText:
        'Drag shapes onto the matching shadows. Tap to rotate. A hint can briefly reveal the colors.',
      rotateButton: 'Rotate 90°',
      orUse: 'or use',
      piecesRemaining: 'Pieces left',
      complete: 'Excellent!',
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
      title: 'Night Sky',
      desc: 'Learn the constellations of the Estonian sky',
      gameDescription:
        'The real night sky over Estonia. Draw a constellation star by star, name it, draw it from memory or find it in the sky. Every constellation you find lights up in My sky.',
    },
    shape_dash: {
      title: 'Shape dash',
      desc: 'Jump, dodge, and answer geometry',
      gameDescription:
        'Your character runs automatically. Press Space or tap to jump over obstacles. Pass through the correct shape gate to answer geometry questions while running! Wrong gate = lose combo/shield, but keep running. Two wrong gates in a row or a crash into an obstacle costs a life and the run starts over.',
      tapToRetry: 'Tap to try again',
      jumpLabel: 'Jump',
      playAreaLabel: 'Shape Dash play area',
      completeLabel: 'Level complete!',
      jumpHint: 'or tap to jump • Double-jump available!',
      attemptLabel: 'Attempt',
      scoreLabel: 'Score',
      starsLabel: 'Stars',
      shieldLabel: 'Shield',
      hintRevealGateCost: 'Reveal correct gate',
      hintSlowTimeCost: 'Slow time near gates',
      gateApproaching: 'Shape Gate Ahead!',
      gateCorrect: 'Correct Gate! +200',
      gateWrong: 'Wrong Gate! -Combo',
      consecutiveWrongWarning: 'Warning: One more wrong gate = crash!',
      oneMoreWrongWarning: 'One more wrong and you crash!',
      wrongGateNextWarning: 'Wrong gate! The next wrong one crashes.',
      shieldLost: 'Shield lost!',
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
      title: 'BattleLearn',
      desc: 'Answer and sink ships',
      gameDescription:
        "Pick a cell on the grid – if a ship is there, you get a hit; if it's empty, you miss. Some cells ask a math or logic question. Sink all the ships to win!",
      hintRevealEmptyCost: 'Reveal one empty cell',
      hintRevealCost: 'Reveal one ship position',
      hintEliminateCost: 'Eliminate one wrong answer',
    },
    battlelearn_multiplication: {
      title: 'BattleLearn: multiplication',
      desc: 'Sink ships with multiplication facts',
      hintRevealEmptyCost: 'Reveal one empty cell',
      hintRevealCost: 'Reveal one ship position',
      hintEliminateCost: 'Eliminate one wrong answer',
    },
    battlelearn_multiplication_1_5: {
      title: 'BattleLearn: multiplication 1-5',
      desc: 'Sink ships with multiplication facts 1-5',
      hintRevealEmptyCost: 'Reveal one empty cell',
      hintRevealCost: 'Reveal one ship position',
      hintEliminateCost: 'Eliminate one wrong answer',
    },
  },

  // Difficulty levels
  difficulty: {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  },

  // Star Mapper game
  starMapper: {
    title: 'Night Sky',
    task: {
      draw: 'Draw {name}',
      memory: 'Draw {name} from memory',
      find: 'Find {name} in the sky',
      drawUnnamed: 'Draw the constellation',
    },
    moment: '{month} evening, {hour}:00',
    momentNight: '{month} night, {hour}:00',
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    findTap: 'Tap it when you find it',
    linesLeft: '{count} lines left',
    linesLeftOne: '1 line left',
    undo: 'Undo',
    hint: 'Hint',
    hints: {
      shape: 'Show the shape',
      nextLine: 'Next line',
      hop: 'Star hop',
    },
    mySky: 'My sky',
    close: 'Close',
    next: 'Next',
    nameQuestion: 'Which constellation is this?',
    found: 'Found',
    wellDrawn: 'Well drawn!',
    bestSeen: 'Best seen on a {month} evening.',
    bestSeenAlways: 'Seen from Estonia on every clear night.',
    source: 'Source: {title}',
    starLabel: 'Star {name}',
    starNumber: 'Star {n}',
    selected: 'selected',
    seasons: {
      winter: 'Winter sky',
      spring: 'Spring sky',
      summer: 'Summer sky',
      autumn: 'Autumn sky',
    },
    clockLabel: 'Time until dawn',
    seasonDone: {
      winter: 'All winter constellations found!',
      spring: 'All spring constellations found!',
      summer: 'All summer constellations found!',
      autumn: 'All autumn constellations found!',
    },
    treasure: 'Treasure',
    treasureLabel: 'Hidden treasure',
    meteorLabel: 'Meteor',
    owl: {
      label: 'Huu the owl, say it again',
      draw: 'Connect the ringed stars.',
      memory: 'Now without the rings!',
      find: 'Move the sky and look.',
      foundInSky: 'You found it! Now draw it.',
      name: 'Do you know who this is?',
      shape: 'Look at the shape closely.',
      nextLine: 'I drew this line for you.',
      hop: 'Follow the arrow.',
      hopPolaris: 'Two stars of the Big Dipper point to Polaris.',
      dawnNear: 'Hurry, the dawn is coming!',
    },
    treasures: {
      pleiades: {
        name: 'The Pleiades',
        folk: 'In Estonian folklore the Sieve',
        desc: 'A close cluster of stars in Taurus. With the naked eye you can see six or seven.',
      },
      andromeda_galaxy: {
        name: 'The Andromeda Galaxy',
        desc: 'Our neighbour galaxy, the farthest thing you can see with the naked eye.',
      },
      mizar_alcor: {
        name: 'Mizar and Alcor',
        folk: 'In Estonian folklore the Ox and the Wolf',
        desc: "Beside the middle star of the Big Dipper's handle is a tiny star.",
      },
      orion_nebula: {
        name: 'The Orion Nebula',
        desc: 'A great cloud of gas where new stars are born.',
      },
      double_cluster: {
        name: 'The Double Cluster',
        desc: 'Two star clusters side by side near Cassiopeia.',
      },
      albireo: {
        name: 'Albireo',
        desc: "The star at the swan's beak. A telescope shows two stars, gold and blue.",
      },
      meteor: {
        name: 'A meteor',
        desc: 'A pebble from space burns up in the air and leaves a moment of light.',
      },
    },
    directions: { north: 'north', east: 'east', south: 'south', west: 'west' },
    starNames: {
      '11767': 'Polaris',
      '91262': 'Vega',
      '102098': 'Deneb',
      '97649': 'Altair',
      '24436': 'Rigel',
      '27989': 'Betelgeuse',
      '21421': 'Aldebaran',
      '49669': 'Regulus',
      '37826': 'Pollux',
      '69673': 'Arcturus',
      '24608': 'Capella',
      '65378': 'Mizar',
    },
    constellations: {
      ursa_major: {
        name: 'Big Dipper',
        desc: 'Seven bright stars: four make the wagon and three its shaft.',
        folk: 'Odamus, Taeva Vanker, Eelija vanker, Sandivanker',
        story:
          'Peedu was driving his ox cart through the forest when a wolf leapt at the ox. The Old Father lifted them all into the sky and, as a punishment, made the wolf pull the cart beside the ox. The tiny star next to the middle star of the shaft is the wolf, still pulling towards the forest.',
      },
      ursa_minor: {
        name: 'Little Dipper',
        desc: 'At the end of its shaft is Polaris, which shows north.',
        folk: 'Vaese mehe rattad (the poor man’s wheels)',
        story:
          'An old tale says the little wagon belongs to a poor wanderer. He has no money and no bread, so he needs no big wagon: a small one is enough.',
      },
      cassiopeia: { name: 'Cassiopeia', desc: 'Five bright stars make a W or an M.' },
      orion: {
        name: 'Orion',
        desc: 'Four bright corners with three stars in a row in the middle, like a belt.',
        folk: 'Koot ja Reha (flail and rake); the belt: Oda, Sandisauad, Moosese kepp',
        story:
          'Old Estonians saw threshing tools in Orion, a flail and a rake. When the Flails and Rakes set in the morning around St Martin’s Day, a good harvest year was expected.',
      },
      cygnus: {
        name: 'Swan',
        desc: 'A large cross in the Milky Way, with bright Deneb at the top.',
        folk: 'Suur Rist (the Great Cross)',
        story:
          'The Milky Way is the birds’ road. The Old Father made it so that migrating birds find their way to warm lands at night and back home in spring. The birds are led by a white bird, like a swan.',
      },
      lyra: {
        name: 'Lyre',
        desc: 'Very bright Vega with a small parallelogram of stars beside it.',
        folk: 'Kaarikud (the carts); Vega is Voorimees (the carter)',
        story:
          'A poor carter had only two goats instead of horses. He built two carts, harnessed the goats and hauled loads with them. For his diligence the Old Father made him a star in the sky.',
      },
      pegasus: {
        name: 'Pegasus',
        desc: 'Four stars at the corners of a great square, high in the south on autumn evenings.',
        folk: 'Nelikand (the square)',
      },
      leo: { name: 'Lion', desc: 'A backwards question mark is the mane and a triangle the tail.' },
      corona_borealis: { name: 'Northern Crown', desc: 'A small half-ring of stars like a crown.' },
      gemini: { name: 'Twins', desc: 'Two bright stars, Castor and Pollux, are the twins’ heads.' },
      cepheus: { name: 'Cepheus', desc: 'A house of stars whose roof points towards Polaris.' },
      aquila: { name: 'Eagle', desc: 'Bright Altair between two fainter stars by the Milky Way.' },
      taurus: { name: 'Bull', desc: 'Reddish Aldebaran is the bull’s eye; the horns reach far.' },
      auriga: { name: 'Charioteer', desc: 'A pentagon with bright Capella at one corner.' },
      andromeda: {
        name: 'Andromeda',
        desc: 'A long row of stars starting at a corner of the Square of Pegasus.',
      },
      bootes: { name: 'Herdsman', desc: 'An ice-cream cone with orange Arcturus at its tip.' },
      canis_minor: { name: 'Little Dog', desc: 'Only two stars, one of them bright Procyon.' },
      aries: { name: 'Ram', desc: 'A short bent row of three stars near the Pleiades.' },
      delphinus: {
        name: 'Dolphin',
        desc: 'A small diamond of stars by the Milky Way.',
        folk: 'Väike Rist (the Little Cross)',
      },
      triangulum: { name: 'Triangle', desc: 'Three stars in a small triangle below Andromeda.' },
      sagitta: { name: 'Arrow', desc: 'A small arrow in the Milky Way, above the Eagle.' },
      cancer: { name: 'Crab', desc: 'A faint Y between the Twins and the Lion.' },
      virgo: { name: 'Virgin', desc: 'A large spring constellation with bright Spica.' },
      draco: { name: 'Dragon', desc: 'A long winding tail between the two Dippers.' },
      camelopardalis: { name: 'Giraffe', desc: 'A very faint constellation near Polaris.' },
      canes_venatici: {
        name: 'Hunting Dogs',
        desc: 'Two stars below the shaft of the Big Dipper.',
      },
      coma_berenices: {
        name: 'Berenice’s Hair',
        desc: 'A faint cluster of stars behind the Lion’s tail.',
      },
      equuleus: {
        name: 'Little Horse',
        desc: 'A tiny constellation between Pegasus and the Dolphin.',
      },
      lacerta: { name: 'Lizard', desc: 'A zigzag of stars between the Swan and Cassiopeia.' },
      leo_minor: { name: 'Little Lion', desc: 'A few faint stars above the Lion’s head.' },
      lynx: { name: 'Lynx', desc: 'A long faint row between the Big Dipper and the Twins.' },
      monoceros: {
        name: 'Unicorn',
        desc: 'A faint constellation beside Orion in the winter Milky Way.',
      },
      serpens: {
        name: 'Serpent',
        desc: 'The head is below the Northern Crown, the body a winding row.',
      },
      sextans: { name: 'Sextant', desc: 'A very faint constellation below the Lion.' },
      vulpecula: { name: 'Fox', desc: 'A faint constellation between the Swan and the Arrow.' },
      cetus: { name: 'Whale', desc: 'A large autumn constellation low in the southern sky.' },
      scutum: {
        name: 'Shield',
        desc: 'A small constellation in a bright part of the Milky Way, low in the south.',
      },
      aquarius: {
        name: 'Water Bearer',
        desc: 'An autumn constellation low in the south, below Pegasus.',
      },
    },
  },

  // BattleLearn game
  battlelearn: {
    title: 'BattleLearn',
    desc: 'Answer questions to earn shots and sink ships',
    instructions: 'Shoot cells! Answer a question only when you hit a problem cell.',
    answerToContinue: 'Answer the question to continue shooting:',
    shipsSunk: 'Ships sunk',
    strikesAriaLabel: '{count} water hits before losing a life',
    hit: 'Hit!',
    miss: 'Miss! Answer to continue.',
    alreadyShot: 'Already shot here!',
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
      // Advanced coordinate
      multiMove: 'Start at {start}, move {right} right, {up} up. New coordinate?',
      // Vector addition
      vectorAdd:
        'Ship moves {right1} right and {up1} up, then {right2} right and {up2} up. Total steps?',
      // Distance
      distance: 'Ship at {coord1}, target at {coord2}. Distance?',
      // Multiplication
      multiplicationFact: '{a} × {b} = ?',
      fleetMultiply: '{ships} destroyers × {cannons} cannons = ?',
      // Formation problems
      formationCount: 'Ships in rows: {row1}, {row2}, {row3}. Total?',
      // Strategic positioning
    },
  },

  // Level label
  level: 'Level',
} as const;
