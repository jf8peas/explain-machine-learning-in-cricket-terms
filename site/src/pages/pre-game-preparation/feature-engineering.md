---
layout: ../../layouts/MatchLayout.astro
title: "Feature Engineering: Cleaning Up the Scorecard"
innings: pre-game-preparation
chapter: feature-engineering
meta: "13 min · gaps, freaks & lopsided squads"
lede: "The Breast Cancer squad from the last chapter was spotless — zero missing values, no freak entries, no lopsided classes. Real scorecards are never that polite. Before a model sees a single row, someone has to fill the gaps, flag the freak innings, and decide what to do about a squad that's 995 dot balls to 5 wickets."
commentary: "'The sheet's got a blank next to his strike rate from the away leg. Doesn't mean he didn't play — means nobody wrote it down. Big difference.' — Scorer"
codeFile: pre_game/feature_engineering.py
codeOut: "14 gaps filled (KNN) · 3 outliers flagged (|z| > 3) · minority upweighted 1:1"
code: |
  import numpy as np
  from sklearn.impute import SimpleImputer, KNNImputer

  # Fill gaps with the squad's own average...
  imp = SimpleImputer(missing_values=np.nan, strategy="mean")
  X_filled = imp.fit_transform(X)

  # ...or borrow from the 3 most similar players instead
  knn_imp = KNNImputer(missing_values=np.nan, n_neighbors=3)
  X_filled = knn_imp.fit_transform(X)

  # Flag freak values more than 3 standard deviations out
  zscores = (X["strike_rate"] - X["strike_rate"].mean()) / X["strike_rate"].std()
  outliers = X[zscores.abs() > 3]
stats:
  - { k: "Imputation", v: "Mean / KNN", s: "fill the gap, don't drop the row" }
  - { k: "Outlier Rule", v: "|z| > 3", s: "~99% of a normal squad sits within 3σ" }
  - { k: "Downsampling", v: "Trim Majority", s: "fewer rows, balanced mix" }
  - { k: "Upweighting", v: "Clone Minority", s: "more copies, same signal" }
---

## Before the Model Sees Anything

**Feature engineering** is the umbrella term for everything that happens to a scorecard before it's fit for a model to read — extracting and transforming raw data into a shape the model can actually use. You'll meet plenty more of it under other names as this series goes on: dummy variables in **Linear Regression**, ordinal and binary encoding in **Decision Trees**, min-max scaling in **K-Nearest Neighbours**. Those chapters solve the problem of getting the *right kind* of numbers into a model.

This chapter solves three problems that come earlier than that, and matter regardless of which algorithm eventually gets used: **what do you do when a value is simply missing, what do you do when a value is real but absurd, and what do you do when one class dominates the sheet so completely that the rare one barely gets a vote?**

## The Gaps in the Scorecard: Imputation

The Breast Cancer dataset's `isna().sum()` came back clean last chapter — a rare and slightly misleading stroke of luck. Most real scorecards have gaps: a strike rate never logged for an away leg, a bowling average missing from a rain-shortened match. **Imputation** is the process of filling those gaps with a value chosen by some deliberate strategy, rather than either leaving a blank a model can't process or throwing away an otherwise perfectly good row.

**`SimpleImputer`** is the univariate option — it looks at nothing but the gappy column itself, and fills every blank in it with one summary statistic:

```python
from sklearn.impute import SimpleImputer
import numpy as np

imp = SimpleImputer(missing_values=np.nan, strategy="mean")
X_filled = imp.fit_transform(X)
```

`strategy="mean"` hands a missing strike rate the squad's average strike rate. `"median"` is the sturdier option when that same column already has freak values dragging its mean around — the same mean-versus-median tension you'll meet again, in more detail, in **Decision Trees**' MSE-versus-MAE section. `"most_frequent"` covers categorical gaps, filling with whichever category shows up most often.

**`KNNImputer`** does something more considered. Instead of reaching for one number that gets stamped into every gap regardless of context, it looks at the *whole* player — every other stat on their card — finds the **K most similar players** by those other stats, and fills the gap with an average drawn from just that neighbourhood. It's the same instinct **K-Nearest Neighbours**, later in this series, builds an entire scouting panel around: instead of asking "which players does this one resemble, so I can guess his role," it asks "which players does this one resemble, so I can guess the one number missing from his card."

```python
from sklearn.impute import KNNImputer

imp = KNNImputer(missing_values=np.nan, n_neighbors=3)
imputed_X = imp.fit_transform(X)
```

The trade-off between the two is the same trade-off you'd expect: `SimpleImputer` is fast and asks nothing of the rest of the data, but it fills every gap in a column with the identical number regardless of who the player actually is. `KNNImputer` fills a more plausible, context-aware guess, at the cost of scanning the whole dataset for every single gap.

## The Freak Innings: Detecting Outliers

An **outlier** is a data point sitting far from the rest of the observations — the club match where someone hit 180 not out against schoolboy bowling, sitting in the same column as a season of entirely ordinary 30s and 40s. Left alone, that single freak innings can drag a mean, blow out a standard deviation, and — as **Linear Regression**'s discussion of the sum-of-squared-error cost function will warn later in this series — pull an entire model's attention toward accommodating one delivery nobody will ever see again.

**Box plots** are the standard way to see this at a glance, and they're built entirely from **quartiles** — the 25th, 50th, and 75th percentile of a column:

```python
percentiles = [0.25, 0.5, 0.75]
data_quartiles = np.percentile(data, percentiles)
```

The box itself spans the middle 50% of the data — a batter's bread-and-butter range of scores. The whiskers reach out to cover the normal spread beyond that. Anything plotted past the whiskers is flagged as a candidate outlier — not automatically deleted, just marked as worth a second look.

**Z-scores** offer the same diagnosis a different way. You'll meet this exact formula again in **K-Means Clustering**, later in this series, where it stands in for standardising features before clustering — a related but distinct job to the one it's doing here, which isn't scaling a feature but flagging how far any single value sits from its column's own average:

```python
mhv_mean = housing["median_house_value"].mean()
mhv_std = housing["median_house_value"].std()
zscores = (housing["median_house_value"] - mhv_mean) / mhv_std
```

The rule of thumb leans on the normal distribution's own shape: roughly 99% of a normally distributed column sits within three standard deviations of the mean. A value with `|z| > 3` is rare enough, in a genuinely normal squad, to be worth investigating — either it's a real, legitimate freak performance, or it's a typo that entered a strike rate of `9000` instead of `90.0`.

Finding an outlier is a question, not an automatic instruction to delete. A genuine 180 not out is signal — real information about what this player is capable of — and stripping it out just because it's rare can throw away exactly the case a model most needed to see. A strike rate of `9000` is noise, and keeping it will actively mislead whatever gets trained on it. Box plots and z-scores only find the candidates; deciding which kind you're looking at is still a judgement call.

## The Lopsided Squad: Class Imbalance

Here's a problem covered in full later, in **The Scorer's Box**: a wicket-detection model facing 995 "no wicket" deliveries for every 5 genuine wickets can hit 94.5% accuracy by never once predicting a wicket. `class_weight="balanced"` — which you'll see doing quiet work in later chapters like **Classification vs Regression** and **Gradient Descent** — is one fix, and it works *inside* the model: it tells the loss function to penalise a mistake on the rare class more heavily than a mistake on the common one, without touching the training data itself.

The two techniques below fix the same problem a different way — by rebalancing the *data*, before any model ever sees it.

**Downsampling** trims the majority class down, randomly discarding "no wicket" deliveries until the two classes sit in a less lopsided ratio. The training set gets smaller, but what's left is a fairer fight — the model can no longer post a good score just by ignoring the minority class, because the minority class isn't buried under nine hundred near-identical dot balls anymore. The cost is exactly what it sounds like: you're throwing away real, valid data, and if the dataset wasn't large to begin with, that can hurt.

**Upweighting** goes the other direction — instead of discarding majority rows, it makes copies of the minority class until the balance improves. Five real wickets becomes fifty, each one a duplicate of an actual delivery, so the model encounters "what a wicket looks like" often enough during training to actually learn the pattern rather than treat it as noise to be ignored. The cost here is different: those fifty examples are still only five deliveries' worth of genuine information, copied ten times each. Lean on upweighting too hard and you're not really teaching the model more about wickets — you're teaching it to memorise five specific deliveries extremely well. **Form and Class**, later in this series, has a name for exactly this failure mode: the net hero, wearing a different jersey.

A more considered version of the same idea, worth knowing the name of even without a full deep-dive here, is **SMOTE** — you'll see it again in **The Scorer's Box** as a resampler needing the same fit-after-split discipline as any scaler. Rather than duplicating existing minority examples exactly, SMOTE generates new synthetic ones by interpolating between real minority neighbours — the same nearest-neighbours instinct as `KNNImputer`, aimed at manufacturing plausible new data rather than filling a gap in old data.

## Ground Rules for the Dressing-Room Wall

- **A gap isn't a reason to drop a row.** `SimpleImputer` fills it with a column-wide summary statistic; `KNNImputer` fills it with a guess drawn from the most similar players instead.
- **Median beats mean wherever outliers are already present.** The same tension MSE versus MAE raises again in Decision Trees, now applied to filling gaps rather than judging splits.
- **Box plots and z-scores both flag outliers — they don't decide what to do about them.** A genuine freak performance is signal worth keeping; a data-entry error is noise worth fixing.
- **`|z| > 3` is the standard flag**, leaning on the normal distribution's own shape: about 99% of a well-behaved column sits within three standard deviations of the mean.
- **`class_weight` rebalances inside the model; downsampling and upweighting rebalance the data itself.** Different levers, same underlying problem.
- **Downsampling spends data; upweighting spends originality.** Trimming the majority throws away real rows. Cloning the minority risks memorising a handful of examples rather than learning the pattern behind them.

---

The squad sheet is clean now — gaps filled, freaks flagged, the lopsided classes accounted for. Next chapter, before a single ball is bowled in training, the coach sets the dials that decide how the whole session is going to run.
