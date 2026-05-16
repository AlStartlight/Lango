import type { GrammarLesson, CefrLevel } from "./types";

/**
 * English grammar curriculum organized by CEFR level.
 * Each lesson contains structured content + 3-4 interactive exercises.
 */
const LESSONS: GrammarLesson[] = [
  // ===================== A1 (Beginner) =====================
  {
    id: "a1-sentence-structure",
    title: "Basic Sentence Structure",
    description: "Learn how to form simple sentences with Subject-Verb-Object order",
    category: "sentence_structure",
    categoryLabel: "Sentence Structure",
    cefrLevel: "A1",
    difficulty: "beginner",
    content: {
      explanation:
        "In English, the most basic sentence structure follows a simple pattern: Subject + Verb + Object. This word order is very consistent — unlike many other languages, English rarely changes the order of these core elements.",
      rules: [
        {
          title: "Subject + Verb + Object (SVO)",
          text: "Almost every English sentence needs a subject (who or what does the action), a verb (the action), and optionally an object (what receives the action). The subject comes first, then the verb, then the object.",
          highlight: true,
        },
        {
          title: "Subject must always be stated",
          text: "Unlike languages such as Spanish or Japanese, English sentences always need an explicit subject. 'Is raining' is incorrect — you must say 'It is raining.'",
        },
        {
          title: "Adjective placement",
          text: "Adjectives go BEFORE the noun they describe: 'a red car' not 'a car red.'",
        },
      ],
      examples: [
        {
          correct: "The cat eats fish.",
          annotation: "Subject (The cat) + Verb (eats) + Object (fish)",
        },
        {
          correct: "She reads a book.",
          annotation: "Subject (She) + Verb (reads) + Object (a book)",
        },
        {
          correct: "They live in a big house.",
          incorrect: "They live in a house big.",
          annotation: "Adjective 'big' comes before noun 'house'",
        },
      ],
      tables: [
        {
          headers: ["Part", "Role", "Example"],
          rows: [
            ["Subject", "Who/what performs the action", "The dog, My mother, They"],
            ["Verb", "The action or state", "runs, is, eat, read"],
            ["Object", "What receives the action", "a ball, the book, coffee"],
          ],
          caption: "The three core parts of a basic sentence",
        },
      ],
      tips: [
        'Remember the pattern: WHO does WHAT. Ask yourself "Who?" then "What do they do?"',
        "If you're unsure about word order, start with the subject, then the verb, then everything else.",
        "Practice by taking a simple sentence and swapping the subject: 'I eat apples' → 'She eats apples.'",
      ],
    },
    exercises: [
      {
        id: "a1-ss-mc-1",
        type: "multiple_choice",
        question: "Which sentence follows correct English word order?",
        options: [
          "Eats fish the cat.",
          "The cat eats fish.",
          "Fish eats the cat.",
          "Cat the fish eats.",
        ],
        correctAnswer: "The cat eats fish.",
        explanation:
          "English uses Subject + Verb + Object order. 'The cat' (subject) + 'eats' (verb) + 'fish' (object) is correct.",
        points: 10,
      },
      {
        id: "a1-ss-fb-1",
        type: "fill_blank",
        question: "Complete the sentence with the correct word order:",
        context: "_________ (reads / My mother / books)",
        correctAnswer: "My mother reads books",
        answerVariants: ["My mother reads books."],
        hint: "Start with the person, then the action, then the thing.",
        explanation:
          "The correct order is Subject (My mother) + Verb (reads) + Object (books).",
        points: 10,
      },
      {
        id: "a1-ss-ord-1",
        type: "ordering",
        question: "Arrange these words to form a correct sentence:",
        correctAnswer: "The boy plays football",
        answerVariants: ["The boy plays football."],
        hint: "Subject → Verb → Object",
        explanation:
          "Subject (The boy) + Verb (plays) + Object (football) follows the standard SVO pattern.",
        points: 15,
      },
      {
        id: "a1-ss-cor-1",
        type: "correction",
        question: "Find and fix the error in this sentence:",
        context: "She drives a car red.",
        correctAnswer: "She drives a red car.",
        answerVariants: ["She drives a red car"],
        hint: "Where should the adjective go?",
        explanation:
          "Adjectives come BEFORE nouns in English. 'Red' describes 'car', so it should be 'a red car'.",
        points: 15,
      },
    ],
  },
  {
    id: "a1-verb-to-be",
    title: "The Verb 'To Be'",
    description: "Master the most important verb in English — am, is, are",
    category: "verbs",
    categoryLabel: "Verbs",
    cefrLevel: "A1",
    difficulty: "beginner",
    content: {
      explanation:
        "The verb 'to be' is the most common verb in English. It describes states of being, identities, and characteristics. Unlike other verbs, it changes form depending on the subject.",
      rules: [
        {
          title: "Present forms of 'to be'",
          text: "I → am, He/She/It → is, You/We/They → are. These three forms cover all subjects in the present tense. Memorize which form goes with each subject.",
          highlight: true,
        },
        {
          title: "Contractions are common",
          text: "In speaking and informal writing, we contract: I am → I'm, you are → you're, he is → he's, she is → she's, it is → it's, we are → we're, they are → they're.",
        },
        {
          title: "Making negatives",
          text: "Add 'not' after the verb: I am not, he is not (or he isn't), they are not (or they aren't).",
        },
      ],
      examples: [
        {
          correct: "I am a student.",
          annotation: "Use 'am' with the subject 'I'",
        },
        {
          correct: "She is very kind.",
          incorrect: "She am very kind.",
          annotation: "Use 'is' with 'she'",
        },
        {
          correct: "They are from Brazil.",
          annotation: "Use 'are' with plural 'they'",
        },
      ],
      tables: [
        {
          headers: ["Subject", "To Be", "Contraction", "Example"],
          rows: [
            ["I", "am", "I'm", "I'm happy"],
            ["You", "are", "you're", "You're late"],
            ["He / She / It", "is", "he's / she's / it's", "She is a doctor"],
            ["We", "are", "we're", "We're tired"],
            ["They", "are", "they're", "They're at home"],
          ],
          caption: "Present tense conjugation of 'to be'",
        },
      ],
      tips: [
        'The most common mistake is using "is" with "I". Always say "I am" — never "I is."',
        "Practice with: I am happy. You are happy. He is happy. We are happy. They are happy.",
        'Remember the contractions — they make you sound more natural in conversation.',
      ],
    },
    exercises: [
      {
        id: "a1-be-mc-1",
        type: "multiple_choice",
        question: "Choose the correct form of 'to be':",
        context: "She ___ a teacher.",
        options: ["am", "is", "are", "be"],
        correctAnswer: "is",
        explanation:
          "'She' is a third-person singular subject, so it takes 'is'.",
        points: 10,
      },
      {
        id: "a1-be-fb-1",
        type: "fill_blank",
        question: "Fill in the correct form of 'to be':",
        context: "They ___ very happy today.",
        correctAnswer: "are",
        answerVariants: ["are", "'re", "They're"],
        hint: "Use the form for 'they' — the same as 'you' and 'we'.",
        explanation:
          "'They' is a plural subject and takes 'are'.",
        points: 10,
      },
      {
        id: "a1-be-fb-2",
        type: "fill_blank",
        question: "Complete with the correct negative form:",
        context: "I ___ (not) a doctor. I am a student.",
        correctAnswer: "am not",
        answerVariants: ["am not", "I'm not"],
        hint: "Add 'not' after the verb.",
        explanation:
          "The negative of 'am' is 'am not'. The contraction is 'I'm not'.",
        points: 10,
      },
      {
        id: "a1-be-cor-1",
        type: "correction",
        question: "Find and fix the error:",
        context: "We is going to the park.",
        correctAnswer: "We are going to the park.",
        answerVariants: [
          "We are going to the park",
          "We're going to the park",
          "We're going to the park.",
        ],
        hint: "Is 'we' singular or plural?",
        explanation:
          "'We' is plural and requires 'are', not 'is'. The correct sentence is 'We are going to the park.'",
        points: 15,
      },
    ],
  },
  {
    id: "a1-articles",
    title: "Articles: A, An, The",
    description: "Learn when to use a, an, and the — and when to use no article at all",
    category: "determiners",
    categoryLabel: "Determiners",
    cefrLevel: "A1",
    difficulty: "beginner",
    content: {
      explanation:
        "Articles are small but important words that come before nouns. English has three article choices: a, an, and the. Choosing the right one depends on whether you're talking about something general, specific, or mentioning it for the first time.",
      rules: [
        {
          title: "'A' vs 'An' — it's about the sound",
          text: "Use 'a' before consonant SOUNDS (a dog, a university — because 'university' starts with a 'yoo' sound). Use 'an' before vowel SOUNDS (an apple, an hour — because 'hour' starts with a vowel sound even though 'h' is a consonant).",
          highlight: true,
        },
        {
          title: "'The' for specific things",
          text: "Use 'the' when both the speaker and listener know which thing you mean. This could be because you mentioned it before ('I saw a dog. The dog was brown.') or because there's only one ('the sun,' 'the president').",
        },
        {
          title: "No article for general plurals and uncountable nouns",
          text: "When talking about things in general (not specific), use no article. 'Dogs are friendly' (all dogs in general) vs 'The dogs in my neighborhood are friendly' (specific dogs).",
        },
      ],
      examples: [
        {
          correct: "I saw a bird in the garden.",
          annotation: "'a bird' = first mention; 'the garden' = specific garden we know about",
        },
        {
          correct: "She is an honest person.",
          incorrect: "She is a honest person.",
          annotation: "'honest' starts with a vowel sound (silent h), so use 'an'",
        },
        {
          correct: "I love coffee.",
          annotation: "No article needed for general categories",
        },
      ],
      tips: [
        "Say the word aloud to check if it starts with a vowel SOUND, not just a vowel LETTER.",
        'If you can replace the article with "one" or "any," use "a/an." If you can replace it with "this" or "that," use "the."',
        "Collect examples of articles when you read English — notice patterns in your notebook.",
      ],
    },
    exercises: [
      {
        id: "a1-art-mc-1",
        type: "multiple_choice",
        question: "Choose the correct article:",
        context: "I need ___ new phone.",
        options: ["a", "an", "the", "(no article)"],
        correctAnswer: "a",
        explanation:
          "'New' starts with a consonant sound (/n/), so we use 'a'.",
        points: 10,
      },
      {
        id: "a1-art-mc-2",
        type: "multiple_choice",
        question: "Which sentence uses articles correctly?",
        options: [
          "I saw an elephant at the zoo.",
          "I saw a elephant at the zoo.",
          "I saw elephant at zoo.",
          "I saw an elephant at zoo.",
        ],
        correctAnswer: "I saw an elephant at the zoo.",
        explanation:
          "'Elephant' starts with a vowel sound (/e/), so use 'an'. 'The zoo' is a specific place.",
        points: 10,
      },
      {
        id: "a1-art-fb-1",
        type: "fill_blank",
        question: "Fill in the missing article (a, an, the, or leave blank):",
        context: "She is ___ university student.",
        correctAnswer: "a",
        answerVariants: ["a"],
        hint: "Think about the SOUND of 'university'.",
        explanation:
          "'University' starts with a consonant sound /juː/, so we use 'a' not 'an'.",
        points: 10,
      },
      {
        id: "a1-art-cor-1",
        type: "correction",
        question: "Fix the article mistake:",
        context: "He is an very tall man.",
        correctAnswer: "He is a very tall man.",
        answerVariants: ["He is a very tall man"],
        hint: "Look at the word after the article.",
        explanation:
          "'Very' starts with a consonant sound (/v/), so we need 'a', not 'an'.",
        points: 15,
      },
    ],
  },
  {
    id: "a1-plural-nouns",
    title: "Singular and Plural Nouns",
    description: "Learn how to make nouns plural and use them correctly",
    category: "nouns",
    categoryLabel: "Nouns",
    cefrLevel: "A1",
    difficulty: "beginner",
    content: {
      explanation:
        "Nouns can be singular (one) or plural (more than one). Regular plurals are formed by adding -s or -es, but English also has many irregular plurals that you need to memorize.",
      rules: [
        {
          title: "Regular plurals: add -s",
          text: "Most nouns form the plural by adding -s: cat → cats, book → books, tree → trees.",
          highlight: true,
        },
        {
          title: "Add -es after s, sh, ch, x, o",
          text: "When a noun ends in s, ss, sh, ch, x, or o, add -es: bus → buses, brush → brushes, watch → watches, box → boxes, potato → potatoes.",
        },
        {
          title: "Y changes to -ies",
          text: "If a noun ends in consonant + y, change y to i and add -es: baby → babies, city → cities. But if it ends in vowel + y, just add -s: boy → boys, day → days.",
        },
        {
          title: "Irregular plurals",
          text: "Some nouns change completely: child → children, man → men, woman → women, foot → feet, tooth → teeth, mouse → mice, person → people.",
        },
      ],
      examples: [
        {
          correct: "I have one cat and two dogs.",
          annotation: "Regular plurals: cat (singular), dogs (plural with -s)",
        },
        {
          correct: "She has three children.",
          incorrect: "She has three childs.",
          annotation: "'Children' is an irregular plural — never 'childs'",
        },
        {
          correct: "The baby has two teeth.",
          annotation: "'Tooth' → 'teeth' (irregular: oo → ee)",
        },
      ],
      tables: [
        {
          headers: ["Rule", "Singular", "Plural"],
          rows: [
            ["Most nouns: add -s", "book", "books"],
            ["Ending in -s, -sh, -ch, -x, -o: add -es", "box", "boxes"],
            ["Ending in consonant + y: change y to -ies", "city", "cities"],
            ["Ending in vowel + y: add -s", "boy", "boys"],
            ["Ending in -f/-fe: change to -ves (some)", "wolf", "wolves"],
          ],
          caption: "How to form regular plurals",
        },
      ],
      tips: [
        "Check the ending of the noun — the spelling rule depends on the last letter(s).",
        "Irregular plurals just need practice. Make flashcards for: child/children, man/men, woman/women, foot/feet, tooth/teeth, mouse/mice.",
        'Watch out for "sheep" and "fish" — they stay the same in plural form!',
      ],
    },
    exercises: [
      {
        id: "a1-pl-mc-1",
        type: "multiple_choice",
        question: "What is the correct plural form of 'baby'?",
        options: ["babys", "babies", "babyes", "babys'"],
        correctAnswer: "babies",
        explanation:
          "'Baby' ends in consonant (b) + y, so change y to i and add -es: babies.",
        points: 10,
      },
      {
        id: "a1-pl-fb-1",
        type: "fill_blank",
        question: "Write the plural form of this noun:",
        context: "one child → two ___",
        correctAnswer: "children",
        answerVariants: ["children"],
        hint: "This is an irregular plural — it doesn't follow the normal rules.",
        explanation: "'Child' has an irregular plural form: 'children.'",
        points: 10,
      },
      {
        id: "a1-pl-ord-1",
        type: "ordering",
        question: "Arrange the words to form a correct sentence:",
        correctAnswer: "The children are playing in the park",
        answerVariants: ["The children are playing in the park."],
        hint: "Remember that 'children' is already plural.",
        explanation:
          "Subject (The children) + Verb (are playing) + Place (in the park). 'Children' is the irregular plural of 'child'.",
        points: 15,
      },
      {
        id: "a1-pl-cor-1",
        type: "correction",
        question: "Fix the plural error in this sentence:",
        context: "I saw three wolfs in the forest.",
        correctAnswer: "I saw three wolves in the forest.",
        answerVariants: ["I saw three wolves in the forest"],
        hint: "'Wolf' has a special plural form.",
        explanation:
          "'Wolf' ends in -f, so it changes to -ves in the plural: wolves.",
        points: 15,
      },
    ],
  },

  // ===================== A2 (Elementary) =====================
  {
    id: "a2-past-simple",
    title: "Past Simple Tense",
    description: "Talk about completed actions in the past with regular and irregular verbs",
    category: "tenses",
    categoryLabel: "Verb Tenses",
    cefrLevel: "A2",
    difficulty: "beginner",
    content: {
      explanation:
        "The past simple tense is used for actions that started and finished in the past. You can form it by adding -ed to regular verbs, but many common verbs have irregular past forms you need to memorize.",
      rules: [
        {
          title: "Regular past: add -ed",
          text: "For most verbs, simply add -ed: walk → walked, play → played, start → started. If the verb already ends in -e, just add -d: like → liked, dance → danced.",
          highlight: true,
        },
        {
          title: "Irregular verbs change form",
          text: "Many common verbs change completely in the past: go → went, eat → ate, buy → bought, see → saw, take → took. These must be memorized individually.",
          highlight: true,
        },
        {
          title: "Negative: did not + base verb",
          text: "To make a negative sentence, use 'did not' (didn't) + the base form of the verb: 'I did not go' (not 'I did not went'). The main verb stays in base form.",
        },
        {
          title: "Questions: Did + subject + base verb",
          text: "Questions use 'did' before the subject: 'Did you see the movie?' (not 'Did you saw...?').",
        },
      ],
      examples: [
        {
          correct: "Yesterday, I walked to school.",
          annotation: "Regular verb: walk + -ed = walked",
        },
        {
          correct: "She bought a new car last week.",
          incorrect: "She buyed a new car last week.",
          annotation: "Irregular: buy → bought (not 'buyed')",
        },
        {
          correct: "We didn't go to the party.",
          incorrect: "We didn't went to the party.",
          annotation: "After 'didn't,' use the base form of the verb",
        },
      ],
      tables: [
        {
          headers: ["Base Form", "Past Simple", "Type"],
          rows: [
            ["play", "played", "regular"],
            ["study", "studied", "regular (y → ied)"],
            ["stop", "stopped", "regular (double consonant)"],
            ["go", "went", "irregular"],
            ["eat", "ate", "irregular"],
            ["buy", "bought", "irregular"],
            ["see", "saw", "irregular"],
            ["take", "took", "irregular"],
            ["write", "wrote", "irregular"],
          ],
          caption: "Common past simple forms",
        },
      ],
      tips: [
        "For irregular verbs, group them by pattern: sing/sang, ring/rang, drink/drank (i → a).",
        'When using "did" (questions or negatives), the main verb goes back to base form — always!',
        "Time words that signal past simple: yesterday, last week, last year, in 2010, ago.",
      ],
    },
    exercises: [
      {
        id: "a2-ps-mc-1",
        type: "multiple_choice",
        question: "Choose the correct past simple form:",
        context: "She ___ to the store yesterday.",
        options: ["go", "goes", "went", "gone"],
        correctAnswer: "went",
        explanation:
          "'Go' is irregular. The past simple form is 'went'.",
        points: 10,
      },
      {
        id: "a2-ps-fb-1",
        type: "fill_blank",
        question: "Complete with the past simple form:",
        context: "We ___ (watch) a great movie last night.",
        correctAnswer: "watched",
        answerVariants: ["watched"],
        hint: "This is a regular verb — just add -ed.",
        explanation: "'Watch' is regular, so past simple is 'watched'.",
        points: 10,
      },
      {
        id: "a2-ps-cor-1",
        type: "correction",
        question: "Fix the error in this past simple sentence:",
        context: "I didn't went to work yesterday.",
        correctAnswer: "I didn't go to work yesterday.",
        answerVariants: [
          "I didn't go to work yesterday",
          "I did not go to work yesterday.",
        ],
        hint: "What happens to the main verb after 'didn't'?",
        explanation:
          "After 'did not' or 'didn't', the main verb goes back to the base form. 'I didn't go' (not 'didn't went').",
        points: 15,
      },
      {
        id: "a2-ps-ord-1",
        type: "ordering",
        question: "Arrange these words to form a correct past simple sentence:",
        correctAnswer: "She bought a new dress last weekend",
        answerVariants: ["She bought a new dress last weekend."],
        hint: "Past simple irregular: buy → bought. Time expression goes at the end.",
        explanation:
          "'She bought a new dress last weekend' — subject + irregular past verb + object + time expression.",
        points: 15,
      },
    ],
  },
  {
    id: "a2-present-continuous",
    title: "Present Continuous vs Present Simple",
    description: "Know when to use 'I do' versus 'I am doing'",
    category: "tenses",
    categoryLabel: "Verb Tenses",
    cefrLevel: "A2",
    difficulty: "beginner",
    content: {
      explanation:
        "English has two present tenses that learners often confuse. The present simple describes habits, facts, and routines. The present continuous (am/is/are + -ing) describes actions happening right now or temporary situations.",
      rules: [
        {
          title: "Present simple for habits and facts",
          text: "Use the present simple for: routines (I drink coffee every morning), general truths (Water boils at 100°C), and permanent situations (She works at a hospital).",
          highlight: true,
        },
        {
          title: "Present continuous for now and temporary",
          text: "Use am/is/are + verb-ing for: actions happening now (I am reading a book), temporary situations (He is staying with friends this week), and trends (More people are learning languages online).",
          highlight: true,
        },
        {
          title: "State verbs — no continuous form",
          text: "Some verbs describe states, not actions, and are NOT used in continuous forms. Common examples: know, believe, understand, want, need, like, love, hate, prefer.",
        },
      ],
      examples: [
        {
          correct: "I usually drink tea in the morning. Right now, I am drinking coffee.",
          annotation: "Habit (simple) vs current action (continuous)",
        },
        {
          correct: "She works in London. This month, she is working in Paris.",
          annotation: "Permanent job (simple) vs temporary assignment (continuous)",
        },
        {
          correct: "I know the answer.",
          incorrect: "I am knowing the answer.",
          annotation: "'Know' is a state verb — no continuous form",
        },
      ],
      tips: [
        'Ask yourself: Is this a habit or happening right now? "Every day" = simple. "At the moment" = continuous.',
        "State verbs (know, like, believe) are almost never used with -ing. Don't say 'I am liking it.'",
        "Time words help: always/usually/often → simple. now/currently/today/this week → continuous.",
      ],
    },
    exercises: [
      {
        id: "a2-pc-mc-1",
        type: "multiple_choice",
        question: "Which tense should you use for a temporary situation?",
        context: "She normally works in New York, but this month she ___ in Chicago.",
        options: [
          "works",
          "is working",
          "work",
          "working",
        ],
        correctAnswer: "is working",
        explanation:
          "'This month' indicates a temporary situation, so we use the present continuous: 'is working.'",
        points: 10,
      },
      {
        id: "a2-pc-fb-1",
        type: "fill_blank",
        question: "Complete with the correct tense (simple or continuous):",
        context: "The sun ___ (rise) in the east every morning.",
        correctAnswer: "rises",
        answerVariants: ["rises"],
        hint: "Is this a general fact or an action happening now?",
        explanation:
          "This is a general truth/fact, so use present simple: 'rises.'",
        points: 10,
      },
      {
        id: "a2-pc-fb-2",
        type: "fill_blank",
        question: "Complete the sentence:",
        context: "Be quiet! The baby ___ (sleep).",
        correctAnswer: "is sleeping",
        answerVariants: ["is sleeping", "'s sleeping"],
        hint: "This is happening right now — use the continuous form.",
        explanation:
          "The action is happening at the moment of speaking, so present continuous: 'is sleeping.'",
        points: 10,
      },
      {
        id: "a2-pc-cor-1",
        type: "correction",
        question: "Fix the error in this sentence about a state verb:",
        context: "I am wanting a new phone.",
        correctAnswer: "I want a new phone.",
        answerVariants: ["I want a new phone"],
        hint: "'Want' is a state verb — it describes a feeling, not an action.",
        explanation:
          "'Want' is a stative verb and cannot be used in the continuous form. Use present simple: 'I want.'",
        points: 15,
      },
    ],
  },
  {
    id: "a2-comparatives",
    title: "Comparatives and Superlatives",
    description: "Compare people and things using adjectives",
    category: "adjectives",
    categoryLabel: "Adjectives",
    cefrLevel: "A2",
    difficulty: "beginner",
    content: {
      explanation:
        "Comparatives are used to compare TWO things (taller, more beautiful). Superlatives are used to compare THREE OR MORE things and show the highest degree (tallest, most beautiful). The rule depends on how many syllables the adjective has.",
      rules: [
        {
          title: "Short adjectives: add -er / -est",
          text: "One-syllable adjectives and two-syllable adjectives ending in -y: add -er for comparative and -est for superlative. Tall → taller → tallest. Happy → happier → happiest.",
          highlight: true,
        },
        {
          title: "Long adjectives: use more / most",
          text: "Adjectives with three or more syllables: use 'more' for comparative and 'most' for superlative. Beautiful → more beautiful → most beautiful.",
          highlight: true,
        },
        {
          title: "Irregular forms",
          text: "Some adjectives have special forms: good → better → best, bad → worse → worst, far → farther/further → farthest/furthest.",
        },
      ],
      examples: [
        {
          correct: "My house is bigger than yours. But Tom's house is the biggest.",
          annotation: "'Big' → bigger (comparative), biggest (superlative) — note double g",
        },
        {
          correct: "She is more intelligent than her brother. He is the most intelligent student.",
          annotation: "Long adjective: more/most intelligent",
        },
        {
          correct: "This is the best restaurant in town.",
          incorrect: "This is the goodest restaurant in town.",
          annotation: "Irregular: good → better (comparative) → best (superlative)",
        },
      ],
      tables: [
        {
          headers: ["Adjective", "Comparative", "Superlative", "Rule"],
          rows: [
            ["tall", "taller", "tallest", "add -er/-est"],
            ["big", "bigger", "biggest", "double consonant + -er/-est"],
            ["happy", "happier", "happiest", "y → i + -er/-est"],
            ["beautiful", "more beautiful", "most beautiful", "more/most"],
            ["good", "better", "best", "irregular"],
            ["bad", "worse", "worst", "irregular"],
          ],
          caption: "Common comparative and superlative forms",
        },
      ],
      tips: [
        "For comparatives, you almost always need 'than': taller THAN, better THAN, more expensive THAN.",
        "Superlatives usually use 'the': the tallest, the best, the most interesting.",
        "Don't mix patterns: NOT 'more bigger' or 'more better' — use one pattern or the other.",
      ],
    },
    exercises: [
      {
        id: "a2-comp-mc-1",
        type: "multiple_choice",
        question: "Choose the correct comparative form:",
        context: "This book is ___ than that one.",
        options: ["more interesting", "interestinger", "most interesting", "interesting"],
        correctAnswer: "more interesting",
        explanation:
          "'Interesting' has 3+ syllables, so we use 'more' for the comparative: 'more interesting than.'",
        points: 10,
      },
      {
        id: "a2-comp-fb-1",
        type: "fill_blank",
        question: "Complete with the correct superlative form:",
        context: "Mount Everest is the ___ (high) mountain in the world.",
        correctAnswer: "highest",
        answerVariants: ["highest"],
        hint: "'High' is a short adjective — use -est.",
        explanation: "'High' is one syllable, so superlative is 'highest'.",
        points: 10,
      },
      {
        id: "a2-comp-cor-1",
        type: "correction",
        question: "Fix the comparative/superlative error:",
        context: "She is the more beautiful girl in the class.",
        correctAnswer: "She is the most beautiful girl in the class.",
        answerVariants: ["She is the most beautiful girl in the class"],
        hint: "When comparing one to ALL others (3+), which form do you need?",
        explanation:
          "When comparing one person to a group (3+), use the superlative: 'the most beautiful.' 'More' is for comparing only two things.",
        points: 15,
      },
      {
        id: "a2-comp-ord-1",
        type: "ordering",
        question: "Arrange the words to form a correct comparative sentence:",
        correctAnswer: "My car is faster than your car",
        answerVariants: ["My car is faster than your car."],
        hint: "Comparative structure: A + is + adjective-er + than + B.",
        explanation:
          "Comparative structure: subject + 'is' + comparative adjective + 'than' + object. 'Fast' → 'faster.'",
        points: 15,
      },
    ],
  },

  // ===================== B1 (Intermediate) =====================
  {
    id: "b1-present-perfect",
    title: "Present Perfect Tense",
    description: "Connect the past to the present with have/has + past participle",
    category: "tenses",
    categoryLabel: "Verb Tenses",
    cefrLevel: "B1",
    difficulty: "intermediate",
    content: {
      explanation:
        "The present perfect tense connects past actions to the present moment. It's used for experiences, changes over time, unfinished actions, and recent events with present relevance. Form it with 'have' or 'has' + the past participle of the verb.",
      rules: [
        {
          title: "Form: have/has + past participle",
          text: "Use 'have' with I/you/we/they and 'has' with he/she/it. The past participle is -ed for regular verbs (play → played) but varies for irregular verbs (see → seen, go → gone, eat → eaten, write → written).",
          highlight: true,
        },
        {
          title: "Use 1: Life experiences",
          text: "Use present perfect to talk about experiences in your life, without saying exactly when they happened. 'I have visited Japan' (sometime in my life — not important when).",
        },
        {
          title: "Use 2: Past actions with present results",
          text: "Use it when a past action has a result in the present. 'I have lost my keys' (result: I can't find them now). Compare with past simple 'I lost my keys yesterday' (just a past event).",
        },
        {
          title: "Use 3: With 'ever,' 'never,' 'already,' 'yet,' 'just'",
          text: "These adverbs are commonly used with present perfect: 'Have you ever been to London?' 'I have never tried sushi.' 'She has already finished.' 'He hasn't arrived yet.' 'I have just eaten.'",
        },
      ],
      examples: [
        {
          correct: "I have lived in this city for ten years.",
          annotation: "Action started in the past and continues to now",
        },
        {
          correct: "She has never tried Italian food.",
          annotation: "Experience in her life (up to now)",
        },
        {
          correct: "Have you ever been to Paris? I went there last summer.",
          annotation: "Present perfect for experience question; past simple for specific time",
        },
      ],
      tables: [
        {
          headers: ["Subject", "Have/Has", "Past Participle", "Rest"],
          rows: [
            ["I / You / We / They", "have", "seen", "that movie"],
            ["He / She / It", "has", "eaten", "dinner"],
            ["I / You / We / They", "have not", "finished", "the report"],
            ["He / She / It", "has not", "arrived", "yet"],
          ],
          caption: "Present perfect affirmative and negative forms",
        },
      ],
      tips: [
        "If you give a SPECIFIC time (yesterday, last week, in 2010), use PAST SIMPLE, not present perfect.",
        'Signal words for present perfect: ever, never, already, yet, just, for, since, so far.',
        "Make irregular past participle flashcards: go/went/gone, eat/ate/eaten, see/saw/seen, write/wrote/written.",
      ],
    },
    exercises: [
      {
        id: "b1-pp-mc-1",
        type: "multiple_choice",
        question: "Choose the correct form:",
        context: "She ___ to France three times.",
        options: ["has been", "have been", "went", "was"],
        correctAnswer: "has been",
        explanation:
          "'She' is third-person singular, so use 'has been.' The sentence describes a life experience without a specific time.",
        points: 10,
      },
      {
        id: "b1-pp-fb-1",
        type: "fill_blank",
        question: "Complete with the present perfect:",
        context: "I ___ (never / eat) sushi before.",
        correctAnswer: "have never eaten",
        answerVariants: ["have never eaten", "I have never eaten", "I've never eaten"],
        hint: "Position 'never' between have/has and the past participle.",
        explanation:
          "Present perfect: have + never + past participle. 'Eat' → 'eaten' (irregular).",
        points: 10,
      },
      {
        id: "b1-pp-fb-2",
        type: "fill_blank",
        question: "Complete with present perfect or past simple:",
        context: "I ___ (visit) Paris last year.",
        correctAnswer: "visited",
        answerVariants: ["visited"],
        hint: "Does the sentence mention a specific past time?",
        explanation:
          "'Last year' is a specific time in the past, so we use past simple: 'visited.'",
        points: 10,
      },
      {
        id: "b1-pp-cor-1",
        type: "correction",
        question: "Fix the error:",
        context: "I have gone to the cinema yesterday.",
        correctAnswer: "I went to the cinema yesterday.",
        answerVariants: ["I went to the cinema yesterday", "I went to the cinema yesterday."],
        hint: "What happens when you mention a specific past time?",
        explanation:
          "'Yesterday' is a specific past time. We cannot use present perfect with specific time expressions — use past simple: 'I went.'",
        points: 15,
      },
    ],
  },
  {
    id: "b1-conditionals",
    title: "Zero and First Conditionals",
    description: "Express general truths and real future possibilities",
    category: "conditionals",
    categoryLabel: "Conditionals",
    cefrLevel: "B1",
    difficulty: "intermediate",
    content: {
      explanation:
        "Conditional sentences describe a condition and its result. The zero conditional expresses general truths (always true). The first conditional expresses real possibilities in the future (likely to happen).",
      rules: [
        {
          title: "Zero conditional: If + present simple, present simple",
          text: "Used for general truths, scientific facts, and habits that are always true. 'If you heat ice, it melts.' Both clauses use present simple.",
          highlight: true,
        },
        {
          title: "First conditional: If + present simple, will + base verb",
          text: "Used for real or likely situations in the future. 'If it rains, I will stay home.' The condition uses present simple, and the result uses 'will' + base verb.",
          highlight: true,
        },
        {
          title: "Word order: 'if' can start or be in the middle",
          text: "If the 'if' clause comes first, use a comma: 'If you study, you will pass.' If the result clause comes first, no comma: 'You will pass if you study.'",
        },
      ],
      examples: [
        {
          correct: "If you heat water to 100°C, it boils.",
          annotation: "Zero conditional — a scientific fact (always true)",
        },
        {
          correct: "If she studies hard, she will pass the exam.",
          annotation: "First conditional — a real future possibility",
        },
        {
          correct: "Plants die if they don't get enough water.",
          annotation: "Zero conditional in reverse order (result + if + condition)",
        },
      ],
      tables: [
        {
          headers: ["Type", "If Clause", "Result Clause", "Meaning"],
          rows: [
            ["Zero", "If + present simple", "present simple", "General truth"],
            ["First", "If + present simple", "will + base verb", "Likely future"],
          ],
          caption: "Zero vs first conditional structure",
        },
      ],
      tips: [
        "In first conditional, the 'if' clause uses present simple (NOT 'will'): not 'If it will rain.'",
        "'Unless' means 'if not': 'Unless you hurry, you will be late' = 'If you don't hurry, you will be late.'",
        "You can replace 'will' with 'might' or 'can' in first conditional results: 'If you study, you can pass.'",
      ],
    },
    exercises: [
      {
        id: "b1-con-mc-1",
        type: "multiple_choice",
        question: "Is this zero or first conditional?",
        context: "If you heat ice, it ___.",
        options: ["will melt", "melts", "melted", "would melt"],
        correctAnswer: "melts",
        explanation:
          "This is a scientific fact (always true). Zero conditional: if + present simple, present simple. 'It melts.'",
        points: 10,
      },
      {
        id: "b1-con-fb-1",
        type: "fill_blank",
        question: "Complete with the correct verb form:",
        context: "If she ___ (study) hard, she will pass the exam.",
        correctAnswer: "studies",
        answerVariants: ["studies"],
        hint: "In first conditional, the 'if' clause uses present simple.",
        explanation:
          "First conditional: if + present simple. 'She' → 'studies' (third person -s).",
        points: 10,
      },
      {
        id: "b1-con-cor-1",
        type: "correction",
        question: "Fix the common first conditional error:",
        context: "If it will rain tomorrow, I will stay home.",
        correctAnswer: "If it rains tomorrow, I will stay home.",
        answerVariants: ["If it rains tomorrow, I will stay home"],
        hint: "Never use 'will' in the 'if' clause of a first conditional.",
        explanation:
          "In first conditional, the 'if' clause uses present simple, not 'will'. 'If it rains' (not 'if it will rain').",
        points: 15,
      },
      {
        id: "b1-con-mc-2",
        type: "multiple_choice",
        question: "Choose the correct sentence:",
        context: "Which first conditional sentence is correct?",
        options: [
          "If I will see her, I tell her.",
          "If I see her, I will tell her.",
          "If I saw her, I will tell her.",
          "If I see her, I tell her.",
        ],
        correctAnswer: "If I see her, I will tell her.",
        explanation:
          "Correct first conditional: if + present simple (I see) → will + base verb (will tell).",
        points: 10,
      },
    ],
  },
  {
    id: "b1-passive",
    title: "Passive Voice (Present and Past Simple)",
    description: "Focus on the action, not who performs it",
    category: "passive",
    categoryLabel: "Passive Voice",
    cefrLevel: "B1",
    difficulty: "intermediate",
    content: {
      explanation:
        "The passive voice shifts focus from WHO does the action to WHAT receives the action. Use it when the doer is unknown, obvious, or less important than the action itself.",
      rules: [
        {
          title: "Form: be + past participle",
          text: "Passive voice uses the verb 'to be' (conjugated) + the past participle of the main verb. Present simple passive: am/is/are + past participle. Past simple passive: was/were + past participle.",
          highlight: true,
        },
        {
          title: "When to use passive voice",
          text: "Use passive when: the doer is unknown ('The window was broken'), the doer is obvious ('He was arrested' — by police), or the action is more important than the doer ('The building was completed in 2020').",
        },
        {
          title: "Including the doer with 'by'",
          text: "If you want to mention who performed the action, add 'by' + the doer at the end: 'The cake was baked by my mother.'",
        },
      ],
      examples: [
        {
          correct: "The report is written by the team every week.",
          annotation: "Present simple passive: is + past participle (written)",
        },
        {
          correct: "The building was built in 1990.",
          annotation: "Past simple passive: was + past participle (built) — doer not important",
        },
        {
          correct: "Coffee is grown in Colombia.",
          annotation: "General fact in passive — focus on coffee, not the farmers",
        },
      ],
      tables: [
        {
          headers: ["Tense", "Active Voice", "Passive Voice"],
          rows: [
            ["Present simple", "The chef cooks dinner", "Dinner is cooked (by the chef)"],
            ["Past simple", "Someone painted the house", "The house was painted"],
          ],
          caption: "Active vs passive voice comparison",
        },
      ],
      tips: [
        'The object of the active sentence becomes the subject of the passive sentence.',
        "If you can add 'by zombies' after the verb and it makes sense, it's probably passive!",
        "Use passive voice sparingly — active voice is usually stronger and more direct.",
      ],
    },
    exercises: [
      {
        id: "b1-pas-mc-1",
        type: "multiple_choice",
        question: "Choose the correct passive form:",
        context: "The homework ___ every day.",
        options: [
          "is checked",
          "is check",
          "checked",
          "is checking",
        ],
        correctAnswer: "is checked",
        explanation:
          "Present simple passive: is + past participle. 'Check' → 'checked.'",
        points: 10,
      },
      {
        id: "b1-pas-fb-1",
        type: "fill_blank",
        question: "Rewrite in passive voice:",
        context: "Someone wrote this book in 1920. → This book ___ in 1920.",
        correctAnswer: "was written",
        answerVariants: ["was written"],
        hint: "Past simple passive: was/were + past participle.",
        explanation:
          "'Wrote' → 'was written.' Past simple passive: was + past participle (written).",
        points: 10,
      },
      {
        id: "b1-pas-ord-1",
        type: "ordering",
        question: "Arrange to form a correct passive sentence:",
        correctAnswer: "The museum was opened by the mayor",
        answerVariants: ["The museum was opened by the mayor."],
        hint: "Passive: subject + be + past participle + (by + doer).",
        explanation:
          "Subject (The museum) + was + past participle (opened) + by + doer (the mayor).",
        points: 15,
      },
      {
        id: "b1-pas-cor-1",
        type: "correction",
        question: "Fix the passive voice error:",
        context: "The window was break by the storm.",
        correctAnswer: "The window was broken by the storm.",
        answerVariants: ["The window was broken by the storm"],
        hint: "Passive uses the past participle form, not base form.",
        explanation:
          "'Be' + past participle. 'Break' → past participle is 'broken,' not 'break.'",
        points: 15,
      },
    ],
  },
];

export function getLessonsByLevel(level: CefrLevel): GrammarLesson[] {
  return LESSONS.filter((l) => l.cefrLevel === level);
}

export function getLessonById(id: string): GrammarLesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getAllLessons(): GrammarLesson[] {
  return LESSONS;
}

export function getCategoriesByLevel(level: CefrLevel): string[] {
  const lessons = getLessonsByLevel(level);
  const cats = new Set(lessons.map((l) => l.categoryLabel));
  return Array.from(cats);
}

export function countLessonsByLevel(): Record<CefrLevel, number> {
  const counts: Record<string, number> = {};
  for (const l of LESSONS) {
    counts[l.cefrLevel] = (counts[l.cefrLevel] || 0) + 1;
  }
  return counts as Record<CefrLevel, number>;
}
