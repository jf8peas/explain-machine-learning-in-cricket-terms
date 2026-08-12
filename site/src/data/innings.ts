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
  /** Full chapter title shown in the hero — the ML term, kept search-friendly */
  title: string;
  /** Cricket-flavoured tagline shown under the title in the hero */
  subtitle?: string;
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
    number: "1",
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
    number: "2",
    title: "Pre-Game: ML Fundamentals",
    short: "Pre-Game",
    subtitle: "Workflow · Setup · Feature Engineering",
    chapters: [
      {
        slug: "environment-setup",
        nav: "Environment Setup",
        meta: "7 min · kit bag",
        title: "Environment Setup",
        subtitle: "Preparing the Pitch",
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
        title: "ML Workflow",
        subtitle: "Playing the Innings",
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
        slug: "classification-vs-regression",
        nav: "Classification vs Regression",
        meta: "8 min · how many, or which one",
        title: "Classification vs Regression",
        subtitle: "How Many, or Which One?",
        lede: "Every number on the broadcast graphic is answering one of exactly two questions: classification or regression. Get the question wrong and the cleverest model in the ground will hand you a beautifully confident answer to something nobody asked.",
        commentary:
          "'Is that a projected total or a review verdict? Because you've built a magnificent model for the wrong scoreboard.' — Match Analyst",
        codeFile: "pre_game/task_type.py",
        codeOut: "regression → 9.3 runs this over · classification → 'No Wicket' (p=0.82)",
        code: `# Same over, two different questions to a model

# Regression: how many runs will this over cost?
reg.predict(this_over)            # array([9.3])

# Classification: will this over produce a wicket?
clf.predict(this_over)            # array(['No Wicket'])
clf.predict_proba(this_over)      # array([[0.82, 0.18]])`,
        stats: [
          { k: "Regression", v: "How Many?", s: "a continuous target" },
          { k: "Classification", v: "Which One?", s: "a fixed set of labels" },
          { k: "Same Pitch", v: "Different Question", s: "the target column decides" },
          { k: "Wrong Question", v: "Wrong Everything", s: "model, metric, meaning" },
        ],
      },
      {
        slug: "feature-engineering",
        nav: "Feature Engineering",
        meta: "13 min · gaps, freaks & lopsided squads",
        title: "Feature Engineering",
        subtitle: "Cleaning Up the Scorecard",
        lede: "The Malabar Mavericks squad from the last chapter was spotless — zero missing values, no freak entries, no lopsided classes. Real scorecards are never that polite. Before a model sees a single row, someone has to fill the gaps, flag the freak innings, and decide what to do about a squad that's 995 dot balls to 5 wickets.",
        commentary:
          "'The sheet's got a blank next to his strike rate from the away leg. Doesn't mean he didn't play — means nobody wrote it down. Big difference.' — Scorer",
        codeFile: "pre_game/feature_engineering.py",
        codeOut: "14 gaps filled (KNN) · 3 outliers flagged (|z| > 3) · minority upweighted 1:1",
        code: `import numpy as np
from sklearn.impute import SimpleImputer, KNNImputer

# Fill gaps with the squad's own average...
imp = SimpleImputer(missing_values=np.nan, strategy="mean")
X_filled = imp.fit_transform(X)

# ...or borrow from the 3 most similar players instead
knn_imp = KNNImputer(missing_values=np.nan, n_neighbors=3)
X_filled = knn_imp.fit_transform(X)

# Flag freak values more than 3 standard deviations out
zscores = (X["strike_rate"] - X["strike_rate"].mean()) / X["strike_rate"].std()
outliers = X[zscores.abs() > 3]`,
        stats: [
          { k: "Imputation", v: "Mean / KNN", s: "fill the gap, don't drop the row" },
          { k: "Outlier Rule", v: "|z| > 3", s: "~99% of a normal squad sits within 3σ" },
          { k: "Downsampling", v: "Trim Majority", s: "fewer rows, balanced mix" },
          { k: "Upweighting", v: "Clone Minority", s: "more copies, same signal" },
        ],
      },
      {
        slug: "the-coachs-settings",
        nav: "Parameters & Hyperparameters",
        meta: "6 min · technical tuning",
        title: "Parameters & Hyperparameters",
        subtitle: "The Coach's Settings",
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
    number: "3",
    title: "Scoring: Model Evaluation",
    short: "Scoring",
    subtitle: "Evaluation · Architecture · Gradient Descent · Model Selection",
    chapters: [
      {
        slug: "practice-nets",
        nav: "Train/Val/Test Splits",
        meta: "7 min · train, validation & test splits",
        title: "Train/Validation/Test Splits",
        subtitle: "The Practice Nets",
        lede: "You don't evaluate a batter's match readiness by how well they hit gentle throw-downs in the nets. To build an accurate model, you need a proper train/validation/test split — three areas of the ground, each with its own rules, so you never mistake practicing footwork for flat-track bullying.",
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
        slug: "form-and-class",
        nav: "Underfitting & Overfitting",
        meta: "7 min · bias, variance & generalization",
        title: "Underfitting, Overfitting & Finding the Sweet Spot",
        subtitle: "Form and Class",
        lede: "The ground is divided, the numbers are in, and now four people in a small room have to decide who can actually bat. One candidate has a single shot — underfitting. One has memorised a bowling machine — overfitting. Somewhere between them is the player you want.",
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
        nav: "Evaluation Metrics",
        meta: "8 min · metrics & leakage",
        title: "Evaluation Metrics & Data Leakage",
        subtitle: "The Scorer's Box",
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
      },
      {
        slug: "trial-matches",
        nav: "Feature Selection & Tuning",
        meta: "9 min · feature selection & grid search",
        title: "Feature Selection & Hyperparameter Optimisation",
        subtitle: "Trial Matches",
        lede: "Forty names on the whiteboard and eleven places in the side. Feature selection and hyperparameter optimisation are the unglamorous work of finding the best combination — which players make the sheet, and what conditions you set for them — and then, finally, opening the vault to see whether you got it right.",
        commentary: "'Everyone has an opinion on the XI. Only one of us has to write eleven names down and sign it.' — Chairman of Selectors",
        codeFile: "scoring/grid_search.py",
        codeOut: "90 fits · best: n_neighbors=7, metric='manhattan' · cv f1 0.847 · test f1 0.831",
        code: `from sklearn.model_selection import GridSearchCV\n\ngrid_params = {"n_neighbors": range(1, 10),\n               "metric": ["minkowski", "manhattan"]}\n\nknn_grid = GridSearchCV(knn, grid_params, scoring="f1", cv=5)\nknn_grid.fit(X_train, y_train)\nprint(knn_grid.best_params_, knn_grid.best_score_)`,
        stats: [
          { k: "The Squad Sheet", v: "Feature Selection", s: "who makes the side" },
          { k: "The Scouting Report", v: "Correlation", s: "corr() against the target" },
          { k: "Trial Matches", v: "Grid Search", s: "every combination, tested" },
          { k: "The Vault", v: "One Final Score", s: "best_estimator_.score()" }
        ]
      },
      {
        slug: "gradient-descent",
        nav: "Gradient Descent",
        meta: "15 min · loss landscapes & learning rates",
        title: "Gradient Descent",
        subtitle: "Finding the Perfect Length",
        lede: "Trial Matches searched for good settings by trying combinations and keeping the winner. Most models don't get that luxury — their real dials aren't a short list you can grid-search, they're numbers that could be anything. Gradient Descent is how a model finds good settings anyway: not by trying everything, but by feeling which way is downhill and taking a step.",
        commentary:
          "'You don't need the pitch report. You need to know: did that miss short, or did it miss full? Adjust, and bowl again.' — Bowling Coach",
        codeFile: "scoring/gradient_descent.py",
        codeOut: "same destination, different road: intercept 4.1 · overs +14.6 · wickets −9.0 · run_rate +11.2",
        code: `from sklearn.linear_model import SGDRegressor

model = SGDRegressor(
    loss="squared_error",
    learning_rate="constant",
    eta0=0.01,
    tol=1e-3,
    max_iter=1000,
)
model.fit(X_train, y_train)

print("intercept", round(model.intercept_[0], 2))
print("coefficients", dict(zip(X_train.columns, model.coef_.round(2))))`,
        stats: [
          { k: "Global Min", v: "One", s: "the actual best length" },
          { k: "Local Min", v: "Many", s: "false floors nearby" },
          { k: "Learning Rate", v: "Step Size", s: "too big overshoots, too small crawls" },
          { k: "Stop When", v: "Barely Moving", s: "or out of overs — max_iter" }
        ]
      },
      {
        slug: "model-selection",
        nav: "Model Selection",
        meta: "14 min · sequential selection, AIC & PCA",
        title: "Model Selection",
        subtitle: "When You Can't Trial Everyone",
        lede: "Feature Selection & Hyperparameter Optimisation assumed you could afford to check every combination and still have a warm-up fixture spare to judge the winner on. Sometimes you can't — too many candidate features to grid-search, or too little data to responsibly give any of it up. Model selection methods like sequential feature selection, the Akaike Information Criterion (AIC), and Principal Component Analysis (PCA) are what you reach for when a full trial match isn't an option.",
        commentary:
          "'We don't get a full trial match for every candidate this window. Give me a shortlist, and a reason attached to every name on it.' — Head of Recruitment",
        codeFile: "scoring/model_selection.py",
        codeOut: "forward: 3 features kept · AIC 214.6 (lower is better) · PCA: 12 features → 3 components",
        code: `from sklearn.feature_selection import SequentialFeatureSelector
from sklearn.linear_model import LinearRegression
import numpy as np

lm = LinearRegression()
forward_lm = SequentialFeatureSelector(
    estimator=lm, n_features_to_select=3, direction="forward"
)
forward_lm.fit(X, y)

def AIC(p, L):
    return 2 * p - 2 * np.log(L)`,
        stats: [
          { k: "Forward", v: "Add Best", s: "start empty, build up" },
          { k: "Backward", v: "Cut Worst", s: "start full, trim down" },
          { k: "AIC", v: "2p − 2ln(L)", s: "no test set required" },
          { k: "PCA", v: "Compress", s: "many features → few components" }
        ]
      },
    ],
  },
  {
    slug: "first-innings",
    index: 3,
    number: "4",
    title: "First Innings: Classical ML",
    short: "Classical ML",
    subtitle: "Regression · Classification · Clustering · Decision Trees & Ensembles",
    chapters: [
      {
        slug: "linear-regression",
        nav: "Linear Regression",
        meta: "16 min · the arithmetic behind the projected score",
        title: "Linear Regression",
        subtitle: "The Arithmetic Behind the Projected Score",
        lede: "The broadcast's projected score looks like a single confident number appearing out of nowhere. Underneath it is linear regression: a straight line drawn through every match in the archive, a handful of weighted reasons added together, and rather more arithmetic than the commentator lets on.",
        commentary:
          "'The number isn't a guess. It's a hundred old matches, weighted and added up, wearing a very confident jacket.' — Data Analyst",
        codeFile: "first_innings/linear_regression.py",
        codeOut: "intercept 4.2 · overs +14.8 · wickets −9.1 · run_rate +11.3 · RMSE 11.4 · R² 0.78",
        code: `from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

model = LinearRegression()
model.fit(X_train, y_train)

print("intercept", round(model.intercept_, 2))
print("coefficients", dict(zip(X_train.columns, model.coef_.round(2))))

preds = model.predict(X_val)
rmse = mean_squared_error(y_val, preds, squared=False)
print("RMSE", round(rmse, 1), "· R²", round(r2_score(y_val, preds), 3))`,
        stats: [
          { k: "Predictors", v: "3", s: "overs, wickets, rate" },
          { k: "Cost function", v: "SSE", s: "sum of squared error" },
          { k: "R²", v: "0.78", s: "variance explained" },
          { k: "Solved via", v: "Normal Eqn", s: "(XᵀX)⁻¹XᵀY" },
        ],
      },
      {
        slug: "beyond-linear-models",
        nav: "Polynomial & Spline Features",
        meta: "14 min · polynomials, interactions & splines",
        title: "Polynomial & Spline Features",
        subtitle: "Going Beyond Linear",
        lede: "Linear Regression assumed every extra over faced was worth the same number of runs, no matter which over it was. Nobody who has ever watched an innings actually believes that — the powerplay, the middle overs, and the death all score at different rates, and a single straight line can only ever describe one of them. Polynomial and spline features are how you let the line bend.",
        commentary:
          "'You can't use the powerplay rate to explain the death overs. It's not one line. It's three.' — Batting Analyst",
        codeFile: "first_innings/beyond_linear.py",
        codeOut: "degree 3 → 4 columns per feature · 2 knots → 3 stitched phases",
        code: `from sklearn.preprocessing import PolynomialFeatures, SplineTransformer

poly = PolynomialFeatures(degree=3)
poly_X = poly.fit_transform(X)

spline = SplineTransformer(degree=1, n_knots=2, knots="uniform")
spline_X = spline.fit_transform(X)`,
        stats: [
          { k: "Polynomial", v: "Powers", s: "one curve, whole range" },
          { k: "Interaction", v: "A × B", s: "effect depends on context" },
          { k: "Knots", v: "Breakpoints", s: "where the shape changes" },
          { k: "Still Linear", v: "In Coefficients", s: "just cleverer columns" },
        ],
      },
      {
        slug: "logistic-regression",
        nav: "Logistic Regression",
        meta: "16 min · turning an appeal into a probability",
        title: "Logistic Regression",
        subtitle: "How Plumb Was It?",
        lede: "No umpire actually thinks in yes or no. There's a sliding scale in their head running from 'stone dead plumb' to 'not a hope in the world,' and the finger only goes up once that internal reading crosses a line. Logistic Regression is that sliding scale, written down.",
        commentary:
          "'Nobody's ever 100% certain out there. Some of us are just a lot more certain than others.' — Umpire",
        codeFile: "first_innings/logistic_regression.py",
        codeOut: "P(out) 0.73 · odds ≈ 2.7 to 1 · call: OUT",
        code: `from sklearn.linear_model import LogisticRegression

model = LogisticRegression()
model.fit(X_train, y_train)

print("intercept", round(model.intercept_[0], 2))
print("coefficients", dict(zip(X_train.columns, model.coef_[0].round(2))))

proba = model.predict_proba(X_val)[:, 1]
print("P(out) for first delivery:", round(proba[0], 2))`,
        stats: [
          { k: "Output", v: "Probability", s: "squeezed through the sigmoid" },
          { k: "Linear In", v: "Log-Odds", s: "not in probability itself" },
          { k: "Loss", v: "Log-Loss", s: "punishes confident wrongness hard" },
          { k: "Coefficient", v: "Odds Ratio", s: "eᵝ, not runs" },
        ],
      },
      {
        slug: "k-nearest-neighbours",
        nav: "K-Nearest Neighbours",
        meta: "12 min · the scouting comparison",
        title: "K-Nearest Neighbours",
        subtitle: "Who Does He Remind You Of?",
        lede: "Every scout has said it about an uncapped kid: 'he reminds me of a young someone.' K-Nearest Neighbours is that exact instinct, minus the vagueness — find the players who look most like this one, on the numbers, and let them vote.",
        commentary:
          "'I don't have a report on him yet. But put his numbers next to the last five who played that way, and you'll know exactly who he's going to be.' — Chief Scout",
        codeFile: "first_innings/knn.py",
        codeOut: "K=5 → 4×Finisher, 1×Anchor → call: Finisher",
        code: `features = ["batting_avg", "strike_rate", "boundary_pct"]

# Distance from the uncapped player to every player on file
distance = 0
for feature in features:
    distance += (train_df[feature] - scout_target[feature]) ** 2
train_df["distance"] = distance ** 0.5

# The five closest comparisons, and what the majority says
panel = train_df.nsmallest(5, "distance")
call = panel["role"].mode()[0]
print(call)`,
        stats: [
          { k: "K", v: "5", s: "size of the panel" },
          { k: "Distance", v: "Euclidean", s: "√Σ(x − y)²" },
          { k: "Training phase", v: "None", s: "it's a lazy learner" },
          { k: "Verdict", v: "Majority", s: "panel votes, label wins" },
        ],
      },
      {
        slug: "k-means-clustering",
        nav: "K-Means Clustering",
        meta: "13 min · sorting without a team sheet",
        title: "K-Means Clustering",
        subtitle: "How Many Piles Do You Want?",
        lede: "Hand K-Nearest Neighbours an unlabelled player and it's stuck — it has nothing to compare them against. Hand K-Means the same pile of stat sheets, tell it how many groups you want, and it will happily sort all of them for you. It just won't tell you what to call the groups.",
        commentary:
          "'Nobody told the algorithm who the finishers were. It just noticed that this lot all stood together.' — Head of Analytics",
        codeFile: "first_innings/kmeans.py",
        codeOut: "4 clusters · inertia 812.4 · converged in 6 iterations",
        code: `from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

scaler = StandardScaler()
scaler.fit(squad_df)
squad_scaled = scaler.transform(squad_df)

model = KMeans(n_clusters=4, random_state=42)
squad_df["cluster"] = model.fit_predict(squad_scaled)

print(model.inertia_, model.n_iter_)`,
        stats: [
          { k: "k", v: "4", s: "piles you asked for" },
          { k: "Inertia", v: "812.4", s: "tightness of the piles" },
          { k: "Iterations", v: "6", s: "reshuffles to settle down" },
          { k: "Labels supplied", v: "0", s: "you name them afterwards" },
        ],
      },
      {
        slug: "decision-trees",
        nav: "Decision Trees",
        meta: "18 min · splits, thresholds & impurity",
        title: "Decision Trees",
        subtitle: "One Question at a Time",
        lede: "A DRS review never asks one big question. It asks a sequence of small, precise ones — front-foot no-ball first, then pitching, then impact, then the stumps — and only moves to the next question once the last one has an answer. A decision tree is that protocol, built from data instead of a rulebook.",
        commentary:
          "'I don't decide in one look. I check the front foot. Then the line. Then the impact. By the time I get to the stumps, the answer's already obvious.' — Third Umpire",
        codeFile: "first_innings/decision_tree.py",
        codeOut: "depth 3 · 7 leaves · test accuracy 0.81",
        code: `from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, shuffle=True, random_state=24
)

tree = DecisionTreeClassifier(criterion="gini", max_depth=3, random_state=24)
tree.fit(X_train, y_train)

tree.score(X_test, y_test)
tree.predict(X_test)`,
        stats: [
          { k: "Root Split", v: "impact_line", s: "the single best question" },
          { k: "Criterion", v: "Gini / MSE", s: "classification vs regression" },
          { k: "Leaves", v: "7", s: "verdicts delivered" },
          { k: "Weakness", v: "Instability", s: "one new row, new tree" },
        ],
      },
      {
        slug: "random-forest",
        nav: "Random Forest",
        meta: "16 min · bootstrapping, bagging & the wisdom of the panel",
        title: "Random Forest",
        subtitle: "Ask the Whole Panel",
        lede: "One umpire's read of a review can wobble. Show a panel of umpires slightly different footage each and ask for a show of hands, and the wobble mostly cancels out. A random forest is that panel — dozens of trees, each grown from a different slice of the same season, voting.",
        commentary:
          "'Any one of us could be wrong about this delivery. All of us being wrong, in the same direction, at the same time — that's a lot rarer.' — Panel Umpire",
        codeFile: "first_innings/random_forest.py",
        codeOut: "100 trees · oob_score 0.83 · test accuracy 0.85",
        code: `from sklearn.ensemble import RandomForestClassifier

forest = RandomForestClassifier(bootstrap=True, oob_score=True, random_state=24)
forest.fit(X, y)   # no train_test_split needed — the OOB rows are the test set

forest.oob_score_
forest.oob_decision_function_`,
        stats: [
          { k: "n_estimators", v: "100", s: "trees on the panel (default)" },
          { k: "Sample Seen", v: "~63%", s: "unique rows per tree, on average" },
          { k: "Out-of-Bag", v: "~37%", s: "free validation, per tree" },
          { k: "Verdict", v: "Majority Vote", s: "or the average, for regression" },
        ],
      },
      {
        slug: "extra-trees",
        nav: "Extra Trees",
        meta: "12 min · extremely randomized trees",
        title: "Extra Trees",
        subtitle: "Turning Up the Randomness",
        lede: "Random Forest already gave every umpire on the panel a different set of replays. Extra Trees goes one step further: show them all the same replays, but stop letting any of them study a decision carefully. Hand each one a shortlist of plausible calls, chosen at random, and make them pick the best of that shortlist and move on.",
        commentary:
          "'We don't have time to check every possible line. Give me three plausible ones and I'll tell you which of those three looks worst.' — Panel Umpire, running late",
        codeFile: "first_innings/extra_trees.py",
        codeOut: "100 trees · whole dataset per tree · test accuracy 0.84 · faster to train",
        code: `from sklearn.model_selection import train_test_split
from sklearn.ensemble import ExtraTreesClassifier

X_train, X_test, y_train, y_test = train_test_split(X, y)

extra_clf = ExtraTreesClassifier(random_state=24)
extra_clf.fit(X_train, y_train)

extra_clf.score(X_test, y_test)
extra_clf.predict(X_test)`,
        stats: [
          { k: "Bootstrap", v: "Off", s: "every tree sees the whole dataset" },
          { k: "Thresholds", v: "Random", s: "best of a random few, not all" },
          { k: "Speed", v: "Faster", s: "skips the exhaustive threshold search" },
          { k: "Watch The Name", v: "Trees ≠ Tree", s: "ensemble vs a single randomised tree" },
        ],
      },
    ],
  },
  {
    slug: "second-innings",
    index: 4,
    number: "5",
    title: "Second Innings: Deep Learning",
    short: "Deep Learning",
    subtitle: "Tensors · Backpropagation · Build a Model",
    chapters: [
      {
        slug: "tensors",
        nav: "Tensors",
        meta: "9 min · the scorecard as a shape",
        title: "Tensors",
        subtitle: "The Scorecard as a Shape",
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
        title: "Backpropagation",
        subtitle: "The Third Umpire's Review",
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
        title: "Build a Model",
        subtitle: "Picking the Batting Order",
        lede: "Building a neural network is picking a batting order. Layers are the lineup: openers take the raw new ball, the middle order builds structure, and the finisher converts everything into one clean number the scoreboard can use.",
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
    number: "6",
    title: "Post-Game: Agent Solutions",
    short: "Post-Game",
    subtitle: "Architecture · Reviewer Agent · Agent Tools",
    chapters: [
      {
        slug: "architecture",
        nav: "Agent Architecture",
        meta: "12 min · the dressing room",
        title: "Agent Architecture",
        subtitle: "The Dressing Room",
        lede: "A single model is one player. Agent architecture is the dressing room around them — a captain who decides, specialists who execute, and an analyst who remembers what happened in the last six matches.",
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
        nav: "Reviewer Agent",
        meta: "11 min · referring the decision",
        title: "Reviewer Agent (LLM-as-Judge)",
        subtitle: "The 'DRS' Agent",
        lede: "DRS exists because confident officials are sometimes wrong. An LLM-as-judge reviewer agent is the same institution in software: a second model whose only job is to check the first one's work against the evidence.",
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
        title: "Agent Tools",
        subtitle: "Twelfth Man Duties",
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
