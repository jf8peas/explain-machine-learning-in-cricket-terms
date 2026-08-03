/**
 * Content model for The Playing XI — machine learning explained in cricket terms.
 * Mirrors the structure of the v001 Claude Design mockup.
 */

export interface Stat {
  k: string;
  v: string;
  s: string;
}

export interface Chapter {
  /** URL slug within the innings section */
  slug: string;
  /** Short name used in navigation lists */
  nav: string;
  /** e.g. "9 min · ground plan" */
  meta: string;
  /** Full chapter title shown in the hero */
  title: string;
  lede: string;
  commentary: string;
  codeFile: string;
  codeOut: string;
  code: string;
  stats: Stat[];
}

export interface Innings {
  /** URL slug of the section */
  slug: string;
  /** Zero-based innings index */
  index: number;
  /** Scorebug number, e.g. "01" */
  number: string;
  title: string;
  short: string;
  subtitle: string;
  chapters: Chapter[];
}

export const innings: Innings[] = [
  {
    slug: "about",
    index: 0,
    number: "01",
    title: "About This Site",
    short: "About",
    subtitle: "Overview · Author · Engineering",
    chapters: [
      {
        slug: "author-john-fong",
        nav: "The Author",
        meta: "5 min · the scorer",
        title: "About the Author",
        lede: "Every scorecard has a scorer sitting quietly in the box, recording every ball. This chapter introduces the person keeping score for this course — who they are, and why machine learning made more sense once it was explained in cricket terms.",
        commentary:
          "The scorer never faces a ball, but nothing counts until they write it down.",
        codeFile: "about/author.py",
        codeOut: "author registered · 1 scorer on duty",
        code: `AUTHOR = {
    "role": "scorer / course author",
    "format": "ML explained in cricket terms",
    "prior_ml_required": False,
}

print("author registered · 1 scorer on duty")`,
        stats: [
          { k: "Role", v: "Scorer", s: "keeping the book" },
          { k: "Format", v: "4 innings", s: "plus this card" },
          { k: "Chapters", v: "12", s: "across the season" },
          { k: "Umpire", v: "You", s: "the final call" },
        ],
      },
      {
        slug: "preface",
        nav: "Preface",
        meta: "6 min · ground regulations",
        title: "Preface: The Whimsical Game of ML & Cricket",
        lede: "Machine learning can feel like a game governed by obscure laws, arbitrary decisions, and unpredictable weather. As it turns out, so is cricket. Welcome to a practical, whimsical approach to mastering AI.",
        commentary:
          "'In cricket, as in statistical modelling, you can do everything right for five days and still get rained out.' — The Scorer",
        codeFile: "about/preface.py",
        codeOut: "preface initialized · toss won · electing to bat",
        code: `def play_the_game():
          return {
              "metaphor": "Cricket",
              "subject": "Machine Learning",
              "approach": "Whimsical & Intuitive",
              "math_prelims_required": False,
              "joy_of_learning": 1.0,
          }
      
      print("preface initialized · toss won · electing to bat")`,
        stats: [
          { k: "Premise", v: "100% Fun", s: "zero pretension" },
          { k: "Maths", v: "Visual", s: "intuitive concepts" },
          { k: "Code", v: "Python", s: "runnable in the nets" },
          { k: "Target", v: "Anyone", s: "curious about ML" },
        ],
      },
      {
        slug: "how-this-site-was-built",
        nav: "How This Site Was Built",
        meta: "8 min · meta-architecture",
        title: "How This Site Was Built: The Broadcast Tech Stack",
        lede: "Behind every seamless cricket broadcast sits a truck full of cables, telemetry tools, and director monitors. Here is the exact stack, local agent setup, and CI/CD pipeline used to engineer this course.",
        commentary:
          "'We aren't paying for the fancy commentary box when we have a perfectly good open-source terminal in the truck.' — Lead Systems Engineer",
        codeFile: "deploy.yml",
        codeOut: "build success · 12 static routes generated in 4.2s",
        code: `# The OpenRouter + Cline + GitHub Actions Loop
1. Local Dev: Cursor IDE + Cline Extension
2. Intelligence: Moonshot Kimi K3 via OpenRouter API
3. Static Engine: Astro 5.0 + Tailwind CSS v4 (Vite)
4. Pipeline: Automated GitHub Actions CI/CD to Pages`,
        stats: [
          { k: "Orchestration", v: "Cline", s: "local open-source agent" },
          { k: "LLM Engine", v: "Kimi K3", s: "via OpenRouter API" },
          { k: "Framework", v: "Astro", s: "zero-JS static output" },
          { k: "Hosting", v: "GH Pages", s: "automated action deployment" },
        ],
      },
    ],
  },
  {
    slug: "pre-game-preparation",
    index: 1,
    number: "02",
    title: "Pre-Game Preparation",
    short: "Pre-Game",
    subtitle: "Workflow · Setup",
    chapters: [
      {
        slug: "environment-setup",
        nav: "Environment Setup",
        meta: "7 min · kit bag",
        title: "Environment Setup: The Kit Bag Check",
        lede: "Nobody borrows a bat at the toss. Pin your versions, isolate your environment, and make the whole thing reproducible on someone else's machine before you write a line of modelling code.",
        commentary:
          "'It works on my machine' is the batting equivalent of 'I was in, actually'.",
        codeFile: "setup.sh",
        codeOut: "env ready · 14 packages pinned",
        code: `python -m venv .venv
source .venv/bin/activate

pip install "numpy==2.1.3" "pandas==2.2.3" \\
            "scikit-learn==1.5.2" "tensorflow==2.18.0"

pip freeze > requirements.lock
python -c "import sklearn; print(sklearn.__version__)"`,
        stats: [
          { k: "Python", v: "3.11", s: "pinned interpreter" },
          { k: "Packages", v: "14", s: "exact versions" },
          { k: "Cold build", v: "92s", s: "CI from lockfile" },
          { k: "Drift", v: "0", s: "since lock committed" },
        ],
      },
      {
        slug: "ml-workflow",
        nav: "ML Workflow",
        meta: "11 min · match plan",
        title: "The ML Workflow: From Net Practice to Match Day",
        lede: "No side walks out without a plan for the first ten overs. The ML workflow is that plan — a fixed order of operations that turns a hunch into something you would bet a match on.",
        commentary:
          "Rotate the strike between exploration and evaluation. Batters who only play one shot get found out by tea.",
        codeFile: "workflow/plan.py",
        codeOut: "train 1600 · val 200 · test 200 (untouched)",
        code: `from sklearn.model_selection import train_test_split

# the match is played once — hold it back
X_rest, X_test, y_rest, y_test = train_test_split(
    X, y, test_size=0.10, random_state=7, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_rest, y_rest, test_size=0.11, random_state=7
)

print(len(X_train), len(X_val), len(X_test))`,
        stats: [
          { k: "Steps", v: "6", s: "frame to deploy" },
          { k: "Test touches", v: "1", s: "at the very end" },
          { k: "Seed", v: "7", s: "reproducible innings" },
          { k: "Cadence", v: "2 wks", s: "one experiment cycle" },
        ],
      },
      {
        slug: "the-coachs-settings",
        nav: "2.3 The Coach's Settings",
        meta: "6 min · technical tuning",
        title: "The Coach's Settings: Parameters & Hyperparameters",
        lede: "Before a team takes the field, the head coach dials in the bowling machine settings, boundary ropes, and tactical constraints. Understanding the difference between external configuration (hyperparameters) and internal player adaptation (parameters) is fundamental to training machine learning models.",
        commentary: "'You set the pitch dimensions and net drills in the morning. The bowler's wrist position and seam control adapt during the spell.' — Head Coach",
        codeFile: "setup/hyperparameters.py",
        codeOut: "model weights (parameters) initialized · max_depth=5, lr=0.01 (hyperparameters) set",
        code: `from sklearn.tree import DecisionTreeClassifier\n\n# Hyperparameters set before fit\nmodel = DecisionTreeClassifier(max_depth=5)\nmodel.fit(X_train, y_train)`,
        stats: [
          { k: "Dugout Setup", v: "Hyperparameters", s: "set before training" },
          { k: "Player Mechanics", v: "Parameters", s: "learned during training" },
          { k: "Net Tuning", v: "Grid Search", s: "finding optimal settings" },
          { k: "Goal", v: "Generalization", s: "balanced performance" }
        ]
      }
    ],
  },
  {
    slug: "scoring-model-evaluation",
    index: 2,
    number: "03",
    title: "Scoring: Model Evaluation",
    short: "Scoring",
    subtitle: "Evaluation · Architecture",
    chapters: [
      {
        slug: "practice-nets",
        nav: "3.1 Practice Nets",
        meta: "7 min · data splits & fit",
        title: "The Practice Nets: Train/Test Splits & Model Fit",
        lede: "You don't evaluate a batter's match readiness by how well they hit gentle throw-downs in the nets. To build an accurate model, you must split your data and learn the difference between practicing footwork and flat-track bullying.",
        commentary: "'In the nets, everyone looks like Bradman. Match day on a green wicket is where you find out who can actually bat.' — Head Coach",
        codeFile: "scoring/train_test_split.py",
        codeOut: "train: 80% (net practice) · val: 10% (center wicket) · test: 10% (match day)",
        code: `from sklearn.model_selection import train_test_split\n\n# Splitting the match data\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)`,
        stats: [
          { k: "Net Practice", v: "Train Set", s: "learning the strokes" },
          { k: "Match Day", v: "Test Set", s: "unseen bowling" },
          { k: "Net Hero", v: "Overfitting", s: "memorized throw-downs" },
          { k: "One-Trick", v: "Underfitting", s: "too simple technique" }
        ]
      },
      {
        slug: "selection-meeting",
        nav: "3.2 Selection Meeting",
        meta: "7 min · bias, variance & generalization",
        title: "The Selection Meeting: Underfitting, Overfitting & Finding the Sweet Spot",
        lede: "The ground is divided, the numbers are in, and now four people in a small room have to decide who can actually bat. One candidate has a single shot. One has memorised a bowling machine. Somewhere between them is the player you want.",
        commentary: "'Form is temporary. Class is permanent. Our job tonight is to work out which one we're looking at.' — Chair of Selectors",
        codeFile: "scoring/bias_variance.py",
        codeOut: "depth 1: 0.8912 · depth 5: 0.9401 ← sweet spot · depth None: 0.9138",
        code: `model.score(X_train, y_train)   # 0.998  net form\nmodel.score(X_val,   y_val)     # 0.712  match form\n\n# mind the gap`,
        stats: [
          { k: "One-Trick", v: "Underfitting", s: "high bias · both scores low" },
          { k: "Net Hero", v: "Overfitting", s: "high variance · mind the gap" },
          { k: "Travels Well", v: "Good Fit", s: "adaptable fundamentals" },
          { k: "The Verdict", v: "The Gap", s: "watch it, not the score" }
        ]
      },
      {
        slug: "scorers-box",
        nav: "3.3 Scorer's Box",
        meta: "8 min · metrics & leakage",
        title: "The Scorer's Box: Metrics, Bias & Umpire Errors",
        lede: "Raw accuracy on a scorecard can lie. To truly evaluate performance, you need to step into the scorer's box, break down the confusion matrix, master precision vs. recall, and eliminate illegal data leakage.",
        commentary: "'A strike rate of 200 looks brilliant until you realize every single run came off dropped catches.' — The Official Scorer",
        codeFile: "scoring/metrics_evaluation.py",
        codeOut: "confusion matrix generated · precision 0.88 · recall 0.82 · F1 0.85",
        code: `from sklearn.metrics import classification_report, confusion_matrix\n\n# Evaluate test set predictions against ground truth\nprint(classification_report(y_test, y_pred))\nprint(confusion_matrix(y_test, y_pred))`,
        stats: [
          { k: "Umpire Grid", v: "Confusion Matrix", s: "TP, FP, TN, FN calls" },
          { k: "DRS Accuracy", v: "Precision", s: "valid review calls" },
          { k: "Catch Rate", v: "Recall", s: "nabbing real chances" },
          { k: "Cheating", v: "Data Leakage", s: "reading bowler signs" }
        ]
      }
    ],
  },
  {
    slug: "first-innings",
    index: 3,
    number: "04",
    title: "First Innings: Classical ML",
    short: "Classical ML",
    subtitle: "Regression · Classification · Overfitting",
    chapters: [
      {
        slug: "regression",
        nav: "Regression",
        meta: "12 min · predicting the chase",
        title: "Regression: Predicting the Chase Total",
        lede: "Twelve overs gone, two down, and the broadcast puts a projected score on screen. That number is a regression — a continuous prediction drawn from everything the match has told us so far.",
        commentary:
          "A projected score is a confident guess wearing a suit. Always ask it for an error bar.",
        codeFile: "first_innings/regression.py",
        codeOut: "MAE 11.4 runs · R² 0.78",
        code: `from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

model = LinearRegression()
model.fit(X_train[["overs", "wickets", "run_rate"]], y_train)

pred = model.predict(X_val[["overs", "wickets", "run_rate"]])
print("MAE", round(mean_absolute_error(y_val, pred), 1), "runs")`,
        stats: [
          { k: "Target", v: "Runs", s: "continuous value" },
          { k: "MAE", v: "11.4", s: "runs off the projection" },
          { k: "R²", v: "0.78", s: "variance explained" },
          { k: "Features", v: "3", s: "overs, wickets, rate" },
        ],
      },
      {
        slug: "classification",
        nav: "Classification",
        meta: "10 min · out or not out",
        title: "Classification: Out or Not Out",
        lede: "Regression asks how many. Classification asks which one — and cricket is full of which-one questions with exactly two answers and a very loud crowd.",
        commentary:
          "Set the threshold before you see the replay. Otherwise you are just moving the stumps.",
        codeFile: "first_innings/classify.py",
        codeOut: "precision 0.88 · recall 0.74 · threshold 0.60",
        code: `from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

clf = LogisticRegression(max_iter=1000, class_weight="balanced")
clf.fit(X_train, y_train)

proba = clf.predict_proba(X_val)[:, 1]
appeal_upheld = proba > 0.60          # your threshold, your call

print(classification_report(y_val, appeal_upheld, digits=2))`,
        stats: [
          { k: "Classes", v: "2", s: "out / not out" },
          { k: "Precision", v: "0.88", s: "appeals that were right" },
          { k: "Recall", v: "0.74", s: "real dismissals caught" },
          { k: "Threshold", v: "0.60", s: "chosen, not learned" },
        ],
      },
      {
        slug: "overfitting",
        nav: "Overfitting",
        meta: "11 min · playing too many shots",
        title: "Overfitting: Playing Too Many Shots",
        lede: "A model that memorises the training set is a batter who has learned one bowler's every delivery and nothing about batting. It looks magnificent in the nets and lasts four balls in the middle.",
        commentary: "Anyone can score in the nets. Show me the away fixture.",
        codeFile: "first_innings/overfit.py",
        codeOut: "train 0.99 → cv 0.71 (±0.04) · overfit confirmed",
        code: `from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import cross_val_score

deep = DecisionTreeClassifier()                 # every shot, no discipline
deep.fit(X_train, y_train)
print("train", round(deep.score(X_train, y_train), 2))

cv = cross_val_score(deep, X_train, y_train, cv=5)
print("cv   ", round(cv.mean(), 2), "+/-", round(cv.std(), 2))

tidy = DecisionTreeClassifier(max_depth=4, min_samples_leaf=25)`,
        stats: [
          { k: "Train", v: "0.99", s: "nets score" },
          { k: "CV mean", v: "0.71", s: "five pitches" },
          { k: "Gap", v: "0.28", s: "the diagnosis" },
          { k: "Max depth", v: "4", s: "after regularising" },
        ],
      },
    ],
  },
  {
    slug: "second-innings",
    index: 4,
    number: "05",
    title: "Second Innings: Deep Learning",
    short: "Deep Learning",
    subtitle: "Tensors · Backpropagation · Build a Model",
    chapters: [
      {
        slug: "tensors",
        nav: "Tensors",
        meta: "9 min · the scorecard as a shape",
        title: "Tensors: The Scorecard as a Shape",
        lede: "A tensor is a scorecard with more dimensions. One ball is a scalar, an over is a vector, an innings is a matrix, and a whole tournament is the rank-3 array everyone keeps getting the axes wrong on.",
        commentary:
          "Nobody misreads a scorecard on purpose. They just forget which column is which.",
        codeFile: "second_innings/tensors.py",
        codeOut: "shape (32, 6, 8) · rank 3 · dtype float32",
        code: `import tensorflow as tf

ball    = tf.constant(4.0)                      # scalar  · rank 0
over    = tf.constant([1, 0, 4, 6, 0, 2])       # vector  · rank 1
innings = tf.random.normal((6, 8))              # matrix  · rank 2
season  = tf.random.normal((32, 6, 8))          # batch   · rank 3

print(season.shape, tf.rank(season).numpy(), season.dtype)`,
        stats: [
          { k: "Rank", v: "3", s: "matches × overs × feats" },
          { k: "Batch axis", v: "0", s: "never move it" },
          { k: "dtype", v: "f32", s: "default precision" },
          { k: "Elements", v: "1536", s: "32 × 6 × 8" },
        ],
      },
      {
        slug: "backpropagation",
        nav: "Backpropagation",
        meta: "13 min · the third umpire",
        title: "Backpropagation: The Third Umpire's Review",
        lede: "The network makes a call. The loss function says how wrong it was. Backpropagation is the review process that walks the decision back through every official who touched it and tells each one exactly how much to adjust.",
        commentary:
          "One review does not fix an umpire. Ten thousand small ones make a very good one.",
        codeFile: "second_innings/backprop.py",
        codeOut: "epoch 10 · loss 0.312 → 0.087",
        code: `import tensorflow as tf

opt = tf.keras.optimizers.Adam(learning_rate=1e-3)
loss_fn = tf.keras.losses.BinaryCrossentropy()

for epoch in range(10):
    with tf.GradientTape() as tape:          # record the decision
        pred = model(X_train, training=True)
        loss = loss_fn(y_train, pred)
    grads = tape.gradient(loss, model.trainable_weights)   # the review
    opt.apply_gradients(zip(grads, model.trainable_weights))
    print(epoch, float(loss))`,
        stats: [
          { k: "Epochs", v: "10", s: "review cycles" },
          { k: "LR", v: "1e-3", s: "trust in the review" },
          { k: "Loss", v: "0.087", s: "down from 0.312" },
          { k: "Optimiser", v: "Adam", s: "adaptive steps" },
        ],
      },
      {
        slug: "build-a-model",
        nav: "Build a Model",
        meta: "14 min · picking the order",
        title: "Build a Model: Picking the Batting Order",
        lede: "Layers are a batting order. Openers take the raw new ball, the middle order builds structure, and the finisher converts everything into one clean number the scoreboard can use.",
        commentary:
          "A finisher with a sigmoid on the end. Everything before it is just building a platform.",
        codeFile: "second_innings/model.py",
        codeOut: "val_accuracy 0.891 · params 4,417",
        code: `import tensorflow as tf
from tensorflow.keras import layers

model = tf.keras.Sequential([
    layers.Input(shape=(8,)),
    layers.Dense(64, activation="relu"),     # openers
    layers.Dropout(0.2),                      # rotate the strike
    layers.Dense(32, activation="relu"),     # middle order
    layers.Dense(1,  activation="sigmoid"),  # the finisher
])

model.compile(optimizer="adam", loss="binary_crossentropy",
              metrics=["accuracy"])`,
        stats: [
          { k: "Layers", v: "4", s: "the batting order" },
          { k: "Params", v: "4.4k", s: "trainable weights" },
          { k: "Dropout", v: "0.2", s: "strike rotation" },
          { k: "Val acc", v: "0.891", s: "held-out matches" },
        ],
      },
    ],
  },
  {
    slug: "post-game",
    index: 5,
    number: "06",
    title: "Post-Game: Agent Solutions",
    short: "Post-Game",
    subtitle: "Architecture · The DRS Agent · Agent Tools",
    chapters: [
      {
        slug: "architecture",
        nav: "Architecture",
        meta: "12 min · the dressing room",
        title: "Agent Architecture: The Dressing Room",
        lede: "A single model is one player. An agent system is a dressing room — a captain who decides, specialists who execute, and an analyst who remembers what happened in the last six matches.",
        commentary: "The captain does not bowl every over. That is the entire idea.",
        codeFile: "post_game/dressing_room.py",
        codeOut: "turn 3/8 · handoff → stats_specialist",
        code: `ROSTER = {
    "captain":  "routes the question, never answers it",
    "stats":    "queries the match database",
    "video":    "retrieves and describes footage",
    "analyst":  "long-term memory across sessions",
}

def play(question, max_overs=8):
    for over in range(max_overs):
        role, task = captain.decide(question, memory)
        result = ROSTER_AGENTS[role].run(task)
        memory.append((role, result))
        if captain.is_settled(memory):
            return captain.summarise(memory)`,
        stats: [
          { k: "Agents", v: "4", s: "captain + 3 specialists" },
          { k: "Max overs", v: "8", s: "hard step cap" },
          { k: "Handoffs", v: "3", s: "this session" },
          { k: "Logged", v: "100%", s: "every decision" },
        ],
      },
      {
        slug: "drs-agent",
        nav: "The 'DRS' Agent",
        meta: "11 min · referring the decision",
        title: "The 'DRS' Agent: Referring the Decision",
        lede: "DRS exists because confident officials are sometimes wrong. A review agent is the same institution in software: a second model whose only job is to check the first one's work against the evidence.",
        commentary:
          "Umpire's call is not indecision. It is a system that knows the limits of its own cameras.",
        codeFile: "post_game/drs_agent.py",
        codeOut: "verdict: umpire's call · escalated to human",
        code: `VERDICTS = ("upheld", "overturned", "umpires_call")

def review(question, answer, evidence):
    verdict = reviewer.judge(
        question=question,
        answer=answer,
        evidence=evidence,        # the footage, not the opinion
        allowed=VERDICTS,
    )
    if verdict == "overturned":
        return primary.retry(question, hint=reviewer.reason)
    if verdict == "umpires_call":
        return escalate_to_human(question, answer, evidence)
    return answer`,
        stats: [
          { k: "Verdicts", v: "3", s: "incl. umpire's call" },
          { k: "Overturned", v: "7%", s: "of primary answers" },
          { k: "Escalated", v: "2%", s: "to a human" },
          { k: "Latency", v: "+1.4s", s: "cost of the review" },
        ],
      },
      {
        slug: "agent-tools",
        nav: "Agent Tools",
        meta: "10 min · twelfth man duties",
        title: "Agent Tools: Twelfth Man Duties",
        lede: "Tools are the twelfth man: not in the XI, but the reason the XI can keep going. A retrieval call, a SQL query, a calculator — each one does the errand the model should never attempt from memory.",
        commentary:
          "Do not ask the batter to fetch their own drinks mid-over. That is what the tool call is for.",
        codeFile: "post_game/tools.py",
        codeOut: "match_stats(...) → 12 rows in 240ms",
        code: `TOOLS = [
    {
        "name": "match_stats",
        "description": "Return per-over runs and wickets for one match id.",
        "input_schema": {
            "type": "object",
            "properties": {"match_id": {"type": "string"}},
            "required": ["match_id"],
        },
    },
]

def match_stats(match_id, timeout=5, limit=50):
    return db.readonly.query(OVER_SQL, match_id, timeout=timeout)[:limit]`,
        stats: [
          { k: "Tools", v: "3", s: "stats, video, calc" },
          { k: "Timeout", v: "5s", s: "per call" },
          { k: "Row cap", v: "50", s: "hard limit" },
          { k: "Access", v: "Read", s: "no writes, ever" },
        ],
      },
    ],
  },
];

export const totalChapters = innings.reduce((n, g) => n + g.chapters.length, 0);

export function getInnings(slug: string): Innings | undefined {
  return innings.find((g) => g.slug === slug);
}

export interface ChapterContext {
  innings: Innings;
  chapter: Chapter;
  /** index of the chapter within its innings */
  chIdx: number;
  /** index of the chapter across the whole course */
  flatIdx: number;
  prev?: { innings: Innings; chapter: Chapter };
  next?: { innings: Innings; chapter: Chapter };
}

/**
 * Resolve an innings + chapter slug pair to full context, including
 * previous / next chapters (wrapping around the whole course, like the mockup).
 */
export function getChapter(inningsSlug: string, chapterSlug: string): ChapterContext | undefined {
  const g = getInnings(inningsSlug);
  if (!g) return undefined;
  const chIdx = g.chapters.findIndex((c) => c.slug === chapterSlug);
  if (chIdx === -1) return undefined;

  const flat = innings.flatMap((inn) => inn.chapters.map((chapter) => ({ innings: inn, chapter })));
  const flatIdx =
    innings.slice(0, g.index).reduce((n, x) => n + x.chapters.length, 0) + chIdx;

  return {
    innings: g,
    chapter: g.chapters[chIdx],
    chIdx,
    flatIdx,
    prev: flatIdx > 0 ? flat[flatIdx - 1] : undefined,
    next: flatIdx < flat.length - 1 ? flat[flatIdx + 1] : undefined
  };
}
