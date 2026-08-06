---
layout: ../../layouts/MatchLayout.astro
title: "The Machine Learning Workflow: Playing the Innings"
innings: pre-game-preparation
chapter: ml-workflow
meta: "9 min · one full innings"
lede: "No selector picks a squad off a single highlight reel. They gather the scorecards, study the averages, run the nets, name an XI, and only then send them out to face a bowler they have never seen. The machine learning workflow is that same selection process, written in code."
commentary: "'The nets tell you who can bat. The middle tells you who can score. Never confuse the two.' — Chief Selector"
codeFile: match_day.py
codeOut: "483 in the nets · 86 in the middle · accuracy 0.9651"
code: |
  # Match Day: One Full Innings of the ML Workflow
  from sklearn.datasets import load_breast_cancer
  from sklearn.model_selection import train_test_split
  from sklearn.svm import LinearSVC

  cancer_data = load_breast_cancer(as_frame=True)
  cancer_df = cancer_data.data
  cancer_df['target'] = cancer_data.target

  X = cancer_df.drop(["target"], axis=1)
  y = cancer_df["target"]
  X_train, X_test, y_train, y_test = train_test_split(
      X, y, test_size=0.15, random_state=417)

  model = LinearSVC(penalty="l2", loss="squared_hinge", C=10, random_state=417)
  model.fit(X_train, y_train)
  model.score(X_test, y_test)
stats:
  - { k: "Squad Size", v: "569 rows", s: "observations / feature vectors" }
  - { k: "Player Card", v: "30 features", s: "+ 1 target variable" }
  - { k: "Selection Split", v: "483 / 86", s: "nets vs. the middle" }
  - { k: "Verdict", v: "Binary", s: "malignant or benign" }
---

Machine learning lets us build mathematical models that find patterns in data on their own, and then apply those patterns to data they have never seen. That last clause is the whole game. A model that performs beautifully on the deliveries it has already faced has proved nothing — every batter looks like a century-maker against a bowling machine set to the same length.

So the workflow is built to prevent self-deception. Seven steps, in order:

1. Data collection
2. Data exploration and wrangling
3. Data preparation
4. Building and training a model
5. Evaluating model performance
6. Fine-tuning the model
7. Evaluating model performance *again*

Notice that evaluation appears twice. That is not a typo in the running order — it is the point of the exercise.

## Scouting the Squad: Data Collection

Before anything else, you need players. Data collection is the scouting trip: scraping a website, querying a database, pulling from an API, or — as here — reaching for a well-known dataset that ships with the library.

We will use the Breast Cancer Wisconsin (Diagnostic) dataset — call this squad the Malabar Mavericks — which scikit-learn keeps permanently on the books.

```python
from sklearn.datasets import load_breast_cancer

cancer_data = load_breast_cancer(as_frame=True)

cancer_df = cancer_data.data
cancer_df['target'] = cancer_data.target
```

The `as_frame=True` argument asks scikit-learn to hand the squad over as a pandas DataFrame rather than a bare NumPy array. Do this. Column names are the players' names on the back of the shirt — you will want them at every step that follows.

The second and third lines matter: `cancer_data.data` gives you the measurements, and `cancer_data.target` gives you the verdicts. They arrive separately, and we glue the verdict column on so the whole scorecard sits in one table while we explore.

## Reading the Scorecard: Exploration and Wrangling

A selector who has not read the scorecard is guessing. Before a single model is trained, look at what you actually have.

```python
cancer_df.shape          # (569, 31)
cancer_df.isna().sum()   # missing values per column
cancer_df.head()
```

`shape` tells us the squad is **569 players deep, with 31 columns on the card**. `isna()` checks for gaps — a player whose bowling average was never recorded. Here the sheet is spotless: zero missing values. Real-world data is rarely so obliging, and wrangling is where you fill, drop, or flag those gaps.

### The Vocabulary of the Scorecard

For tabular data, three words carry the entire conversation:

- A **feature** is a column. It describes a property of the data — the player's strike rate, average, or catches taken. We have 30 of them: radius, texture, perimeter, smoothness, and so on.
- The **target variable** is the one column we want the model to predict. On our card it is `target`: is this tumour malignant or benign?
- An **observation** — also called a **feature vector** — is a row. One player, one complete set of stats, one verdict.

Because every row carries a verdict, this is **supervised** machine learning. The model learns from data that is already labelled, the way a young bowler studies old footage where the outcome of every delivery is already known. Those labels can be continuous numbers (a regression task, predicting *how many* runs) or categories (a classification task, predicting *out* or *not out*).

Ours are categorical, so the model is a **classifier**. And because there are exactly two labels — malignant or benign — this is **binary classification**. Three or more labels and it becomes **multi-class classification**: not just *out*, but *bowled, caught, LBW, or run out*.

## Naming the XI and Sealing the Envelope: Data Preparation

Here is the step that separates honest work from wishful thinking.

You cannot judge a batter on the deliveries they practised against. So before training begins, we split the squad in two: most of them go to the nets, and a small group is sealed in an envelope and not opened until match day.

```python
from sklearn.model_selection import train_test_split

X = cancer_df.drop(["target"], axis=1)
y = cancer_df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.15, random_state=417
)
```

Read this in two beats.

**First, separate the stats from the verdicts.** `X` holds the 30 features — everything the model is allowed to see. `y` holds the target. Dropping `target` from `X` is not housekeeping; if you leave the answer in the question paper, the model will simply read it off and report perfect accuracy. This is the single most common way beginners fool themselves.

**Second, split.** `test_size=0.15` seals 15% of the squad in the envelope. The convention is **15% to 20%** — enough players in the envelope for the result to mean something, but not so many that the nets go empty. With 569 rows that gives us **483 for training and 86 for testing**.

`random_state=417` fixes the shuffle. Any integer will do; what matters is that you use the *same* one every time, so your split is reproducible and your results are comparable across runs. Without it, every execution reshuffles the squad and your accuracy wanders for reasons that have nothing to do with your model.

The data used to train is the **training set**. The data in the envelope is the **test set**. From this moment until step five, the test set does not exist.

## Net Sessions: Building and Training the Model

Now we pick a technique and put it to work. Our bowler for this innings is a Linear Support Vector Classifier.

```python
from sklearn.svm import LinearSVC

model = LinearSVC(penalty="l2", loss="squared_hinge", C=10, random_state=417)
model.fit(X_train, y_train)
```

Two lines, two distinct actions — and the distinction is worth holding onto.

The first line **builds** the model. Nothing has been learned yet; this is a bowler with a run-up and an action, marking out their steps. The arguments are the settings you chose *before* any ball was bowled:

- `penalty="l2"` and `loss="squared_hinge"` describe how the model is punished for getting things wrong — the coach's standard for what counts as a bad ball.
- `C=10` controls how hard it tries to fit every last training point. High `C` means a bowler obsessed with never conceding a run in the nets; low `C` means one willing to leak a few in exchange for a repeatable action.
- `random_state=417` again pins down internal randomness so the run is reproducible.

The second line, `.fit()`, is the net session itself. The model works through all 483 training observations, adjusting its internal parameters until it finds the boundary that best separates malignant from benign.

One practical note: `LinearSVC` on raw, unscaled features will often print a convergence warning — the features here range from fractions of a unit to the thousands, and the optimiser struggles to settle. The model still trains and still scores well, but if you want to silence it properly, `StandardScaler` is the tool, and it is a topic for its own chapter.

## Match Day: Evaluating the Performance

Open the envelope.

```python
model.score(X_test, y_test)
# 0.9651
```

`score()` does two things in one call: it asks the model to predict a label for each of the 86 unseen observations, then compares those predictions against the actual labels. The fraction it gets right is the **accuracy**.

**0.9651.** Roughly 83 of 86 correct on players it has never faced.

This number means something precisely because the test set was sealed. The model had no opportunity to memorise these rows. What we are measuring is not recall — it is judgement.

Accuracy is the natural first metric and the right one to learn on, though it is not the last word. When one class vastly outnumbers the other, a lazy model that always predicts the majority can post an impressive accuracy while being useless. Precision, recall, and the confusion matrix are the follow-up questions, and they come later in the series.

## Changing the Field: Fine-Tuning, Then Evaluating Again

Every model comes with dials. Fine-tuning is the captain walking down the pitch mid-over and shifting the field — same bowler, same batter, different setting.

For `LinearSVC`, `C` is the obvious dial to turn:

```python
for C in [10, 1, 0.1, 0.01]:
    model = LinearSVC(penalty="l2", loss="squared_hinge",
                      C=C, random_state=417)
    model.fit(X_train, y_train)
    print(C, model.score(X_test, y_test))

# 10    0.9651
# 1     0.9651
# 0.1   0.9651
# 0.01  0.9535
```

A useful and slightly deflating result: loosening `C` all the way down to 0.01 makes things *worse*, and everything above that is flat. This dataset is comfortably linearly separable, so the model is not especially sensitive to the setting.

That is a real finding, not a failed experiment. Tuning does not always buy you anything, and reporting "the default was fine" is a perfectly respectable outcome. The alternative — turning dials until a number goes up and then claiming credit — is how people end up with models that shine in a notebook and fold in production.

Which brings up the honest caveat. Tune against the test set often enough and you have quietly let the envelope leak: you are now choosing settings *because* they flatter those 86 rows. The professional fix is a third split — a validation set — or cross-validation, which rotates the held-out portion through the training data. For now, know that it exists and that this is the problem it solves.

## The Final Match-Day Workflow

Seven steps collapse into three habits.

**1. Read before you build.**

Load the data, then `shape`, `isna`, `head`. Know your feature count, your target column, and where the gaps are before you type the word `model`.

**2. Split before you train.**

`train_test_split` with 15–20% held out and a fixed `random_state`, and drop the target out of `X`. The split comes *before* the fit, every time, without exception.

**3. Fit, score, tune, score again.**

`.fit()` on the training set. `.score()` on the test set. Adjust the dials, refit, rescore — and be willing to conclude that the first setting was already the right one.

---

**Quick check before you move on:**

- You can say out loud what a feature, an observation, and a target variable are
- Your `X` does not contain the target column
- Your test set is 15–20% of the data, and you never fit on it
- You know whether your task is binary or multi-class, and why that follows from the labels
- Your `random_state` is fixed, so tomorrow's run matches today's

Squad picked, innings played, scorecard signed. That clean `isna()` result won't always be so obliging — next chapter deals with what happens when it isn't.