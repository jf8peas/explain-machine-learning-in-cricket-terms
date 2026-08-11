---
layout: ../../layouts/MatchLayout.astro
title: "Evaluation Metrics & Data Leakage"
subtitle: "The Scorer's Box"
innings: scoring-model-evaluation
chapter: scorers-box
meta: "7 min · metrics & leakage"
lede: "Raw accuracy on a scorecard can lie. To truly evaluate performance, you need to step into the scorer's box, break down the confusion matrix, master precision vs. recall, and eliminate illegal data leakage."
commentary: "'A strike rate of 200 looks brilliant until you realize every single run came off dropped catches.' — The Official Scorer"
codeFile: scoring/metrics_evaluation.py
codeOut: "confusion matrix generated · precision 0.88 · recall 0.82 · F1 0.85"
code: |
  from sklearn.metrics import classification_report, confusion_matrix
  # Evaluating match predictions vs actual outcomes
  print(classification_report(y_test, y_pred))
  print(confusion_matrix(y_test, y_pred))
stats:
  - { k: "Umpire Grid", v: "Confusion Matrix", s: "TP, FP, TN, FN calls" }
  - { k: "DRS Accuracy", v: "Precision", s: "valid review calls" }
  - { k: "Catch Rate", v: "Recall", s: "nabbing real chances" }
  - { k: "Cheating", v: "Data Leakage", s: "reading bowler signs" }
---

The scorer's box is the quietest room at any ground. No shouting, no appealing, no theatre — just two people with a ledger who know precisely what happened, ball by ball, in a way the crowd never quite does. The crowd sees a batter smash 80 off 40 and roars. The scorer sees that three of those boundaries came off outside edges through a vacant slip cordon, and that the same batter was dropped on 12.

Both are watching the same innings. Only one of them is measuring it properly.

This chapter is about getting into that box.

## The Flaw of Raw Accuracy

Accuracy is the first metric everyone learns and the first one that betrays them.

```
              correct predictions
Accuracy  =  ─────────────────────
               total predictions
```

The formula is honest. The problem is what happens when the classes are lopsided.

Consider a wicket-detection model. In a typical innings, 95 or more of every 100 deliveries produce no dismissal. So build the laziest possible model — one that ignores its inputs entirely and predicts **"Not Out"** on every single ball:

```python
class LazyUmpire:
    def predict(self, X):
        return np.zeros(len(X))   # never signals a wicket

lazy = LazyUmpire()
accuracy_score(y_test, lazy.predict(X_test))
# 0.945
```

**94.5% accuracy.** Put that on a slide and it looks like a triumph. It is, in fact, a model that has never once detected a wicket and never will. It is a standing umpire with his hands in his pockets who has decided that appeals are somebody else's problem.

This is **class imbalance**, and it wrecks accuracy as a metric any time the thing you care about is rare — wickets, fraud, machine failures, disease, edges behind. The rarer and more important the event, the more spectacularly accuracy misleads you, because the majority class does all the work and the minority class contributes almost nothing to the score.

The rule of thumb: **the moment your positive class drops below roughly 20% of the data, stop quoting accuracy as your headline number.** You need something that looks specifically at what happens on the deliveries that matter.

## The Confusion Matrix: The Umpire's Ledger

Every prediction a binary classifier makes is a decision an umpire makes: out, or not out. And every one of those decisions can be right or wrong, in two different ways each. Four outcomes, and the confusion matrix simply counts them.

```
                        PREDICTED
                   Not Out       Out
              +-------------+-------------+
   A  Not Out |     TN      |     FP      |
   C          |     939     |      6      |
   T          +-------------+-------------+
   U      Out |     FN      |     TP      |
   A          |      10     |     45      |
   L          +-------------+-------------+
```

Read each cell as an umpiring decision:

- **True Positive (TP) — 45.** The umpire raises the finger for LBW, and ball-tracking confirms it was crashing into middle stump. A correct dismissal. Everyone nods, the batter walks, nothing more is said.

- **True Negative (TN) — 939.** A confident appeal goes up, the umpire shakes his head, and the replay shows the ball sliding harmlessly down the leg side. Correctly not out. This is the overwhelming bulk of deliveries, and it is exactly why accuracy inflates.

- **False Positive (FP) — 6, a Type I error.** The finger goes up, and the replay shows the batter missed the ball by a distance — or that there was a thick inside edge onto the pad. A wrong decision *against* the batter. In ML terms: you cried wolf. You flagged a wicket that never existed.

- **False Negative (FN) — 10, a Type II error.** Not out is signalled, then the snickometer picks up a clean spike as the ball passes the bat. A feather edge, carried comfortably to the keeper, and nobody heard it. A genuine dismissal that got away.

```python
from sklearn.metrics import confusion_matrix, classification_report

print(confusion_matrix(y_test, y_pred))
# [[939   6]
#  [ 10  45]]

print(classification_report(y_test, y_pred))
```

Two notes on reading scikit-learn's output. First, its convention is `[actual][predicted]`, and rows go actual-negative then actual-positive — so the layout is `[[TN, FP], [FN, TP]]`. Second, it is worth unpacking explicitly the first few times, because getting FP and FN the wrong way round is a mistake that quietly survives all the way to a production decision:

```python
tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
```

Everything else in this chapter is arithmetic on these four numbers.

The critical insight the matrix gives you for free: **FP and FN are not equally bad, and which one hurts more depends entirely on the sport you are playing.** A wrong "out" ends a batter's innings and cannot be undone. A missed edge costs runs but the game continues. In a cancer screen, a false negative is a missed diagnosis and a false positive is an anxious fortnight and a follow-up scan. In a spam filter, a false positive is a lost job offer and a false negative is a mildly annoying email. Accuracy flattens all of this into a single number and tells you nothing about which mistake you made.

## Precision vs. Recall: DRS Reviews and Catch Efficiency

Two metrics, both derived from the ledger, each answering a different question.

### Precision — the DRS review rate

**Of all the times the captain went upstairs claiming a wicket, how often was he right?**

```
                 TP             45
Precision  =  ─────────  =  ────────  =  0.88
               TP + FP        45 + 6
```

Precision is a **quality** question, not a quantity one: of everything the model was willing to call "out," how much of it actually was? It lives entirely in the *predicted positive* column and ignores everything you didn't flag — a false negative doesn't touch this number at all. In plain terms, precision is whether you can **trust the model when it calls positive**. A captain with high precision is one whose reviews are trusted — when he twirls his hands in a T, the fielding side is already celebrating, because he doesn't burn reviews on hopeful appeals.

**Optimise precision when a false positive is expensive.** You have two reviews per innings and a wasted one may cost you the match. When you claim a wicket, you had better be right.

### Recall — the catch efficiency

**Of all the genuine chances that actually occurred, how many did the side take?**

```
              TP             45
Recall  =  ─────────  =  ─────────  =  0.82
            TP + FN        45 + 10
```

Recall is a **quantity** question: of every genuine dismissal that actually happened out there in the world, how many did you actually catch? It lives entirely in the *actual positive* row and ignores your false alarms — a false positive doesn't touch this number at all. In plain terms, recall is whether the model **missed anything that mattered**. A side with high recall drops nothing — every edge is snaffled at second slip, every half-chance in the deep is converted, every faint nick is heard and appealed.

**Optimise recall when a false negative is expensive.** Miss a dismissal and the batter goes on to make 150 and win the game from there. Miss a tumour, miss a fraudulent transaction, miss a failing turbine.

### The trade-off is real and unavoidable

Precision and recall are not two independent scores to chase — they're opposite ends of the same lever, and that lever is a fundamental fact of classification, not a cricket quirk. The lever itself is the **decision threshold**: most classifiers don't output "Out" or "Not Out" directly, they output a probability, and a threshold is what turns that probability into a verdict — typically 0.5:

```python
y_proba = model.predict_proba(X_test)[:, 1]
y_pred = (y_proba >= 0.5).astype(int)
```

Move that threshold and both numbers move with it, in opposite directions, every time:

```python
for t in [0.3, 0.5, 0.7]:
    pred = (y_proba >= t).astype(int)
    print(t, precision_score(y_test, pred), recall_score(y_test, pred))

# 0.3   0.71   0.93
# 0.5   0.88   0.82
# 0.7   0.96   0.64
```

**Lower the threshold to 0.3 — the trigger-happy umpire.** *"If there's even a 30% chance it's out, the finger goes up."* Recall jumps to 0.93: almost every genuine wicket in the data gets caught, because the bar for raising the finger is so low. Precision pays for it, falling to 0.71 — an umpire that eager also gives out batters who were never out, and nearly three in ten "Out" calls turn out to be wrong.

**Raise the threshold to 0.7 — the cautious umpire.** *"Only if I'm at least 70% certain."* Precision climbs to 0.96: almost every time this umpire raises the finger, he's right. Recall pays for it, dropping to 0.64 — hesitation lets real wickets through unpunished, and more than a third of the genuine dismissals in the data go unclaimed.

**There is no threshold that gives you both.** Push it one way and you buy recall by spending precision; push it the other way and you buy precision by spending recall — every single time, no exceptions. The threshold is a *decision*, not a default, and the right one depends entirely on what a false positive costs you versus what a false negative costs you, in your particular game:

| Application | The costlier mistake | What that means for the threshold |
| :--- | :--- | :--- |
| Cancer screening | A false negative — missing a sick patient | Lower it. A false alarm sending someone for a re-test is cheap; a missed diagnosis isn't. |
| Spam filter | A false positive — burying a real email in spam | Raise it. A spam message reaching the inbox is a nuisance; a client's email vanishing into it is a disaster. |

Same lever, same trade-off, every time — only the cost of being wrong changes, and that cost is what should set the threshold, not the default of 0.5.

### F1-Score — the all-rounder

When you need one number, the F1-score is the harmonic mean of the two:

```
            Precision × Recall           0.88 × 0.82
F1  =  2 · ────────────────────  =  2 · ─────────────  =  0.85
            Precision + Recall           0.88 + 0.82
```

The harmonic mean, rather than the plain average, is deliberate: it **punishes a low rate in either direction**, rather than letting a strong one paper over a weak one. A model with precision 1.0 and recall 0.1 averages a respectable 0.55 but scores an F1 of just 0.18. That is correct behaviour — F1 only rewards a captain who is both trustworthy *and* thorough, and a model can't back into a high F1 by being excellent at one and careless about the other. A captain who reviews once a match, is always right, and lets nine other dismissals go unappealed is not a good captain — he is a cautious one, and F1 says so.

F1 is the sensible default for imbalanced binary problems. If precision and recall genuinely matter unequally in your context, `fbeta_score` lets you weight them (β > 1 favours recall, β < 1 favours precision).

### PR-AUC — the whole trade-off curve, not just one point on it

Every number so far — precision, recall, F1 — is a snapshot at one specific threshold. Move the threshold and the umpire's whole temperament changes, which is exactly the problem the previous section walked through. **PR-AUC** answers a different question: instead of picking one threshold and reporting precision and recall there, it looks at precision and recall across *every* possible threshold at once, and boils that entire trade-off curve down to a single number.

Plot recall along the bottom and precision up the side, one point per threshold, and you get a **precision-recall curve**. A model that stays precise even as it's pushed toward higher recall — the umpire who can afford to get more trigger-happy without handing out many bad decisions — traces a curve that hugs the top-right corner. A model with no real skill for telling the two classes apart can't hold precision up as recall climbs, and its curve sags toward the bottom instead. **PR-AUC is the area under that curve**: the closer to 1.0, the more of that top-right corner the model genuinely reaches, whichever threshold you eventually settle on.

```python
from sklearn.metrics import average_precision_score, precision_recall_curve

pr_auc = average_precision_score(y_test, y_proba)
# 0.91

precisions, recalls, thresholds = precision_recall_curve(y_test, y_proba)
```

Why not just reach for its better-known cousin, **ROC-AUC**? ROC-AUC plots recall against the *false positive rate* — `FP / (FP + TN)` — and on this chapter's wicket-detection data that denominator is 945, almost all of it the enormous true-negative pile. Six false positives barely dent a denominator that size, so ROC-AUC can report a model as excellent even while it's making a real mess of its rare, valuable positive calls. Precision's denominator, `TP + FP`, only ever contains the deliveries the model actually flagged as wickets — there's nowhere for a huge negative class to hide behind, which is exactly why PR-AUC is the honest choice once the positive class gets rare.

### Choosing Your Headline Metric

Every metric in this chapter answers a slightly different question, and which one deserves top billing depends on a single number: how rare is the thing you're actually trying to catch?

| Positive Class % | Primary Headline Metric | Secondary Metrics |
| :--- | :--- | :--- |
| 40–50% (Balanced) | Accuracy or ROC-AUC | Precision, Recall |
| 20–40% (Mild Imbalance) | F1-Score | Accuracy, ROC-AUC |
| Under 20% (Severe Imbalance) | PR-AUC, or Precision & Recall directly | F1-Score (never Accuracy!) |

The wicket-detection data running through this entire chapter sits at roughly 5.5% positive — deep in the bottom row. That's not a coincidence; it's the entire reason this chapter opens by putting a lazy umpire's 94.5% "accuracy" on trial in the first place.

### A brief note on regression: MAE and RMSE

Not every model classifies. When you are predicting a *quantity* — a final score, a run chase margin, a projected total — the umpire's ledger doesn't apply. You are no longer asking "right or wrong" but "off by how much".

**Mean Absolute Error** is the plain-English answer — average the size of each miss, ignoring which side of the true value it fell on:

```
MAE  =  mean( | actual − predicted | )
```

"Our projected-score model is off by 12 runs on average." Everyone in the room understands that sentence, and it is in the same units as the thing being predicted.

**Root Mean Squared Error** squares the errors before averaging, then takes the square root to get back into runs:

```
RMSE  =  sqrt( mean( (actual − predicted)² ) )
```

Squaring means a single catastrophic miss dominates the score. Being off by 12 runs contributes 144; being off by 50 contributes 2,500 — seventeen times the penalty for roughly four times the error.

Choose accordingly. If a projection that is 50 runs wrong at the innings break is a disaster that discredits the whole broadcast, use RMSE — it will hunt those blowups down. If all errors are equally inconvenient and you want a number that survives the odd freak result, use MAE. A large gap between the two is itself diagnostic: it means your errors are wildly uneven, and a handful of deliveries are doing all the damage.

## Data Leakage: Reading the Opposition's Sign Sheet

Now the one that ruins careers.

Imagine a batter who, somehow, obtains the opposition's bowling signals before the match. He knows the slower ball is coming. He knows the bouncer is set for the fourth delivery of the over. He walks out and makes a double century off 90 balls, and it is the most fluent innings anyone has seen.

Then the signals change — or he plays a side whose sheet he never had — and he makes 4 off 20, poking nervously outside off stump. The double century was never batting. It was foreknowledge.

**Data leakage** is exactly this: information from outside the training set — most often from the future, or from the test set — sneaking into the model during training. The symptom is a validation score that looks too good to be true, because it is.

### The classic offence: transforming before splitting

```python
# WRONG — the scaler has seen the entire dataset, test set included
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y)
```

`fit_transform` on the full `X` computes a mean and standard deviation using every row — including the ones you are about to seal in the vault. Those statistics are now baked into your training features. The model has been handed a whisper about match-day conditions.

```python
# RIGHT — split first, fit on train only, apply to test
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)   # fit AND transform
X_test  = scaler.transform(X_test)        # transform ONLY
```

`fit_transform` on training data, `transform` on everything else. Every time. The same rule applies to imputers, encoders, PCA, feature selection, and resamplers such as SMOTE.

The robust fix is to stop relying on discipline and let a `Pipeline` enforce it:

```python
from sklearn.pipeline import Pipeline

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("model", LogisticRegression()),
])

cross_val_score(pipe, X_train, y_train, cv=5)
```

Inside cross-validation, the pipeline refits the scaler on each fold's training portion only. The leak becomes structurally impossible rather than merely discouraged.

### The subtler offence: features from the future

Harder to spot and more common in real projects. A feature that could not possibly have been known at prediction time:

- Predicting whether a batter gets out this over, using a `runs_scored_in_the_over` column
- Predicting match outcome from a `final_run_rate` field
- Predicting customer churn from `cancellation_reason` — which only exists for customers who already churned
- Any timestamped feature recorded *after* the moment you claim to be predicting

These produce eerily perfect models. If your first attempt scores 0.99 on a hard problem, do not celebrate — go hunting. Something on that sign sheet should not be there.

### Leakage warning signs

- **Validation accuracy far above anything reported for similar problems.** A genuine breakthrough is rare; a model quietly being handed information it shouldn't have is far more likely.
- **One feature with overwhelming importance that you cannot clearly justify.** A single column solving a hard problem almost single-handedly is usually a proxy for the target itself, not a real predictor of it.
- **A big drop between validation and production performance.** Something the model leaned on during evaluation — leaked or otherwise — simply isn't available once it's running live.
- **Duplicate or near-duplicate rows split across train and test.** The model isn't being scored on unseen data at all; part of its "test" is really just recognising rows it already memorised in training.
- **Time-series data split randomly instead of chronologically.** The model has quietly been allowed to train on the future and predict the past, an advantage no live deployment will ever get to use.

That last one deserves emphasis. For anything with a time dimension, `train_test_split` with a random shuffle lets the model train on Thursday and predict Tuesday. Use `TimeSeriesSplit` and always split forward in time.

## The Scorer's Summary

- **Never report accuracy alone on imbalanced data.** A 94.5% score can belong to a model that has never detected a single positive case.
- **Unpack the confusion matrix first.** TP, TN, FP, FN — everything else is arithmetic on those four numbers, and reading them tells you *which* mistake you are making.
- **Decide which error costs more before you tune.** False positives and false negatives are rarely equal, and only domain context can say which one you can afford.
- **Precision = trust your reviews.** `TP / (TP + FP)`. Use it when a false alarm is expensive.
- **Recall = drop no chances.** `TP / (TP + FN)`. Use it when a miss is expensive.
- **F1 when you need one number.** The harmonic mean punishes lopsided models, which is the behaviour you want.
- **The 0.5 threshold is a choice, not a law.** Move it deliberately to slide along the precision/recall trade-off.
- **PR-AUC judges the whole trade-off curve, not one threshold.** It ignores true negatives entirely, which is exactly why it holds up when ROC-AUC gets flattered by a huge negative class.
- **Let the positive class's rarity choose your headline metric.** Roughly balanced, reach for accuracy or ROC-AUC; mildly imbalanced, F1; severely imbalanced (under 20%), PR-AUC or precision and recall directly — and never accuracy.
- **For regression: MAE for interpretability, RMSE when catastrophic misses matter most.** A wide gap between them means a few deliveries are doing all the damage.
- **Split before you transform.** `fit_transform` on train, `transform` on test. Wrap it in a `Pipeline` so the rule is enforced by structure rather than memory.
- **Audit every feature for time travel.** If it could not have been known at prediction time, it is a leak.
- **Suspicious perfection is a bug report.** A 0.99 on a hard problem means go looking, not go celebrating.

---

The scorer's box exists because the scoreboard does not tell the whole story. Runs, wickets, overs — accurate, and still not the truth of the match. The ledger is where you find out who was dropped on 12, which bowler beat the bat eleven times without reward, and whether that strike rate of 200 was command or luck.

Build the habit of opening the ledger. The headline number is for the crowd.

You now have an honest way to score a side. Which raises the question the whole innings has been circling: given that you can measure a model properly, how do you go and find a *better* one?

Next chapter: **Feature Selection & Hyperparameter Optimisation** — feature selection, hyperparameter search, and the one moment the vault is allowed to open.
