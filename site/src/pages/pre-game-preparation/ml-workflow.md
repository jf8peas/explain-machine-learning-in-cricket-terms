---
layout: ../../layouts/MatchLayout.astro
title: "ML Workflow"
subtitle: "Playing the Innings"
innings: pre-game-preparation
chapter: ml-workflow
meta: "9 min · one full innings"
lede: "No selector picks a squad off a single highlight reel. They gather the scorecards, study the averages, run the nets, name an XI, and only then send them out to face a bowler they have never seen. The machine learning workflow is that same selection process, written in code."
commentary: "'The nets tell you who can bat. The middle tells you who can score. Never confuse the two.' — Chief Selector"
codeFile: match_day.py
codeOut: "85 in the nets · 15 in the middle · accuracy 0.9333"
code: |
  # Match Day: One Full Innings of the ML Workflow
  import pandas as pd
  from sklearn.model_selection import train_test_split
  from sklearn.svm import LinearSVC

  squad_df = pd.read_csv("malabar-mavericks.csv")

  X = squad_df.drop(["selected"], axis=1)
  y = squad_df["selected"]
  X_train, X_test, y_train, y_test = train_test_split(
      X, y, test_size=0.15, random_state=417)

  model = LinearSVC(penalty="l2", loss="squared_hinge", C=10, random_state=417)
  model.fit(X_train, y_train)
  model.score(X_test, y_test)
stats:
  - { k: "Squad Size", v: "100 rows", s: "observations / feature vectors" }
  - { k: "Player Card", v: "14 features", s: "+ 1 target variable" }
  - { k: "Selection Split", v: "85 / 15", s: "nets vs. the middle" }
  - { k: "Verdict", v: "Binary", s: "selected or not" }
---

**Environment Setup** got the ground itself ready — one shared, reproducible place for every script and notebook to run. This chapter is what actually happens on that ground, and every version of it starts the same way. Machine learning lets us build mathematical models that find patterns in data on their own, and then apply those patterns to data they have never seen. That last clause is the whole game. A model that performs beautifully on the deliveries it has already faced has proved nothing — every batter looks like a century-maker against a bowling machine set to the same length.

So the workflow is built to prevent self-deception. Seven steps, in order:

1. Data collection
2. Data exploration and wrangling
3. Data preparation
4. Building and training a model
5. Evaluating model performance
6. Fine-tuning the model
7. Evaluating model performance *again*

Notice that evaluation appears twice. That is not a typo in the running order. The first score, in step five, is a baseline — how the model performs on bowling it has never faced, before anyone has touched a dial. The second score, in step seven, exists to check the fine-tuning in step six, not to flatter it: you changed a setting on a hunch, and the only way to know whether that hunch was worth anything is to send the model back out to the middle and see if the number actually moved. Skip step seven and "I tuned the model" is a claim nobody has verified. Run it, and it becomes a result — sometimes a better one, sometimes proof that the original setting was already right, but a result either way.

## Scouting the Squad: Data Collection

Before anything else, you need players. Data collection is the scouting trip: scraping a website, querying a database, pulling from an API, or — as here — starting from a season's stats already gathered onto one sheet.

We will use the Malabar Mavericks: a domestic squad of 100 batters under consideration for the Test squad. To keep this chapter's numbers honest, every career figure is simulated rather than scraped from a real competition — built from a hidden "quality" score so the arithmetic behaves the way real cricket does (average really does equal runs divided by completed innings, nobody's highest score exceeds their career total), but no actual player's record is being used or represented here. [Download `malabar-mavericks.csv`](/data/malabar-mavericks.csv) and save it alongside your script — every number quoted for the rest of this chapter comes from actually running this code against that file.

```python
import pandas as pd

squad_df = pd.read_csv("malabar-mavericks.csv")
```

One line, because the scouting trip has already been done for you. Column names — `matches`, `average`, `strike_rate`, `catches`, and so on — are the players' names on the back of the shirt; you will want them at every step that follows.

## Reading the Scorecard: Exploration and Wrangling

A selector who has not read the scorecard is guessing. Before a single model is trained, look at what you actually have.

```python
squad_df.shape          # (100, 15)
squad_df.isna().sum()   # missing values per column
squad_df.head()
```

`shape` tells us the squad is **100 players deep, with 15 columns on the card**. `isna()` checks for gaps — a player whose strike rate was never logged. Here the sheet is spotless: zero missing values, because this squad was built clean on purpose to keep this first pass through the workflow simple, not because real scorecards are ever this polite. Wrangling — filling, dropping, or flagging gaps — is next chapter's job.

### The Vocabulary of the Scorecard

For tabular data, three words carry the entire conversation:

- A **feature** is a column. It describes a property of the data — the player's strike rate, average, or catches taken. We have 14 of them: matches, innings, runs, average, strike rate, and so on.
- The **target variable** is the one column we want the model to predict. On our card it is `selected`: does this player make the Test squad?
- An **observation** — also called a **feature vector** — is a row. One player, one complete set of stats, one verdict.

Because every row carries a verdict, this is **supervised** machine learning. The model learns from data that is already labelled, the way a young bowler studies old footage where the outcome of every delivery is already known. Those labels can be continuous numbers (a regression task, predicting *how many* runs) or categories (a classification task, predicting *out* or *not out*).

Ours are categorical, so the model is a **classifier**. And because there are exactly two labels — selected or not — this is **binary classification**. Three or more labels and it becomes **multi-class classification**: not just *out*, but *bowled, caught, LBW, or run out*.

## The Nets and the Middle: Data Preparation

Here is the step that separates honest work from wishful thinking.

You cannot judge a batter on how they handle throwdowns from their own net bowlers. Net bowlers are known quantities — same squad, same run-ups, same handful of lengths, session after session. The only honest examination is the middle: bowlers you've never faced, on a pitch worn into grooves nobody practised on. So before training begins, we split the squad in two: most of them go to the nets, and a separate group is set aside to stand in for the middle — untouched until the model has finished training.

```python
from sklearn.model_selection import train_test_split

X = squad_df.drop(["selected"], axis=1)
y = squad_df["selected"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.15, random_state=417
)
```

Read this in two beats.

**First, separate the stats from the verdicts.** `X` holds the 14 features — everything the model is allowed to see. `y` holds the target. Dropping `selected` from `X` is not housekeeping; if you leave the answer in the question paper, the model will simply read it off and report perfect accuracy. This is the single most common way beginners fool themselves.

**Second, split.** `test_size=0.15` sets aside 15% of the squad for the middle. The convention is **15% to 20%** — enough rows held back for the result to mean something, but not so many that the nets go empty. With 100 rows that gives us **85 in the nets and 15 in the middle**.

`random_state=417` fixes the shuffle. Any integer will do; what matters is that you use the *same* one every time, so your split is reproducible and your results are comparable across runs. Without it, every execution reshuffles the squad and your accuracy wanders for reasons that have nothing to do with your model.

The data used to train is the **training set** — the nets. The data held back is the **test set** — the middle. From this moment until step five, the test set does not exist. You don't get to peek at how the innings in the middle goes before you've finished practising for it.

## Net Sessions: Building and Training the Model

Now we pick a technique and put it to work. Our bowler for this innings is a Linear Support Vector Classifier.

```python
from sklearn.svm import LinearSVC

model = LinearSVC(penalty="l2", loss="squared_hinge", C=10, random_state=417)
model.fit(X_train, y_train)
```

Two lines, two distinct actions — and the distinction is worth holding onto.

The first line **builds** the model. Nothing has been learned yet; this is a bowler with a run-up and an action, marking out their steps. The arguments are the settings you chose *before* any ball was bowled:

- `loss="squared_hinge"` sets how sharply the model is punished for getting a training point wrong.
- `penalty="l2"` names the *shape* of **regularisation** applied on top of that loss — a standing instruction that discourages the model from leaning too hard on any single feature, independent of how good its predictions look.
- `C=10` is that regularisation's *strength* — the regularisation parameter — and it runs backwards from what you'd guess: a high `C` **weakens** the penalty and lets the model chase every last training point, while a low `C` **strengthens** it and forces a simpler, more conservative fit. High `C` is a bowler obsessed with never conceding a run in the nets; low `C` is one willing to leak a few in exchange for a repeatable action. We'll open up regularisation properly — why L2 looks the way it does, and what it's actually doing to the loss — in **Gradient Descent**; for now, treat `C` as the dial between "fits the nets perfectly" and "plays it safe."
- `random_state=417` again pins down internal randomness so the run is reproducible.

The second line, `.fit()`, is the net session itself. The model works through all 85 training observations, adjusting its internal parameters until it finds the boundary that best separates a probable Test pick from a probable miss.

One practical note: this squad's features range from single digits (`catches`) to the thousands (`runs`, `balls_faced`) — exactly the kind of scale gap that can leave `LinearSVC`'s optimiser struggling to settle. On this particular dataset it converges cleanly without complaint, but don't take that as a promise; when a wide spread of feature scales does slow the optimiser down, `StandardScaler` is the fix, and it gets its own chapter.

## Match Day: Evaluating the Performance

Walk out to the middle.

```python
model.score(X_test, y_test)
# 0.9333
```

`score()` does two things in one call: it asks the model to predict a label for each of the 15 unseen observations, then compares those predictions against the actual labels. The fraction it gets right is the **accuracy**.

**0.9333.** 14 of 15 correct on players it has never faced.

This number means something precisely because the test set was untouched — 15 players the model never saw in the nets, opponents it had no report on. The model had no opportunity to memorise these rows. What we are measuring is not recall — it is judgement.

Accuracy is the natural first metric and the right one to learn on, though it is not the last word. When one class outnumbers the other — as it does here, 62 not-selected to 38 selected — a lazy model that always predicts the majority can post an impressive accuracy while being useless. Precision, recall, and the confusion matrix are the follow-up questions, and they come later in the series.

## Changing the Field: Fine-Tuning, Then Evaluating Again

Every model comes with dials. Fine-tuning is the captain walking down the pitch mid-over and shifting the field — same bowler, same batter, different setting.

Moving the field is only useful if someone checks whether it worked. This is step six and step seven in the same breath: adjust the dial, then score again under the same conditions as before, so the new number can be compared honestly against the old one.

For `LinearSVC`, `C` — the regularisation strength — is the obvious dial to turn:

```python
for C in [10, 1, 0.1, 0.01]:
    model = LinearSVC(penalty="l2", loss="squared_hinge",
                      C=C, random_state=417)
    model.fit(X_train, y_train)
    print(C, model.score(X_test, y_test))

# 10    0.9333
# 1     0.8667
# 0.1   0.8667
# 0.01  0.8000
```

A useful and slightly deflating result: tightening the regularisation — dropping `C` from 10 down to 0.01 — costs three correct calls out of fifteen, sliding from 0.9333 down to 0.8000. Read that carefully, though: fifteen is not a lot of evidence, and every step down that table is worth exactly one player. Swap a single call in the split and this table could easily rearrange itself.

That fragility is a real finding, not a failed experiment. Tuning does not always buy you a stable answer on a small hold-out, and reporting "the higher C looked better, but I wouldn't bet the squad on it" is a perfectly respectable outcome. The alternative — turning dials until a number goes up and then claiming credit — is how people end up with models that shine in a notebook and fold in production.

Which brings up the honest caveat, and this dataset makes it vivid: with only fifteen rows in the middle, tuning against the test set even a handful of times is enough to quietly turn it into another net session — you'd be choosing settings *because* they flatter those fifteen rows, not because they are good settings.

The professional fix is a validation set, and cricket already has the analogy built in. Once the toss is called and the opposition's team sheet is out, the coach and support staff don't send you back to face the same net bowlers bowling the same lengths as always — they have throwdown specialists mimic what's actually coming, informed by the pitch report and the scouting notes on the bowlers you're about to face. That's a validation set: a rehearsal shaped by real information, used to tune your technique, that still stops short of the middle itself. Cross-validation just runs that rehearsal several times over, rotating which slice of the nets stands in for the rehearsal each time. For now, know that it exists and that this is the problem it solves.

## The Final Match-Day Workflow

Seven steps collapse into three habits.

**1. Read before you build.**

Load the data, then `shape`, `isna`, `head`. Know your feature count, your target column, and where the gaps are before you type the word `model`.

**2. Split before you train.**

`train_test_split` with 15–20% held out and a fixed `random_state`, and drop the target out of `X`. The split comes *before* the fit, every time, without exception.

**3. Fit, score, tune, score again.**

`.fit()` on the training set. `.score()` on the test set. Adjust the dials, refit, rescore — the second score is what tells you whether the tuning earned its place, not the adjustment itself. Be willing to conclude that the first setting was already the right one.

---

**Quick check before you move on:**

- You can say out loud what a feature, an observation, and a target variable are
- Your `X` does not contain the target column
- Your test set is 15–20% of the data, and you never fit on it
- You know whether your task is binary or multi-class, and why that follows from the labels
- Your `random_state` is fixed, so tomorrow's run matches today's

Squad picked, innings played, scorecard signed. This dataset's `isna()` result came back spotless because it was built that way — real scorecards won't always be so obliging, and next chapter deals with what happens when they're not.
