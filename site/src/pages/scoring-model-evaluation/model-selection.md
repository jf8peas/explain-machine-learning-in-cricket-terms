---
layout: ../../layouts/MatchLayout.astro
title: "Model Selection"
subtitle: "When You Can't Trial Everyone"
innings: scoring-model-evaluation
chapter: model-selection
meta: "14 min · sequential selection, AIC & PCA"
lede: "Feature Selection & Hyperparameter Optimisation assumed you could afford to check every combination and still have a warm-up fixture spare to judge the winner on. Sometimes you can't — too many candidate features to grid-search, or too little data to responsibly give any of it up. Model selection methods like sequential feature selection, the Akaike Information Criterion (AIC), and Principal Component Analysis (PCA) are what you reach for when a full trial match isn't an option."
commentary: "'We don't get a full trial match for every candidate this window. Give me a shortlist, and a reason attached to every name on it.' — Head of Recruitment"
codeFile: scoring/model_selection.py
codeOut: "forward: 3 features kept · AIC 214.6 (lower is better) · PCA: 12 features → 3 components"
code: |
  from sklearn.feature_selection import SequentialFeatureSelector
  from sklearn.linear_model import LinearRegression
  import numpy as np

  lm = LinearRegression()
  forward_lm = SequentialFeatureSelector(
      estimator=lm, n_features_to_select=3, direction="forward"
  )
  forward_lm.fit(X, y)

  def AIC(p, L):
      return 2 * p - 2 * np.log(L)
stats:
  - { k: "Forward", v: "Add Best", s: "start empty, build up" }
  - { k: "Backward", v: "Cut Worst", s: "start full, trim down" }
  - { k: "AIC", v: "2p − 2ln(L)", s: "no test set required" }
  - { k: "PCA", v: "Compress", s: "many features → few components" }
---

## Feature Selection & Hyperparameter Optimisation Assumed You Could Afford Every Trial

**Feature Selection & Hyperparameter Optimisation** solved feature and hyperparameter selection the expensive way, on purpose: try every combination, score each one honestly on a validation slice, keep the winner. That approach is only as good as two assumptions holding — that you have enough spare data to carve out a validation set without starving the model of training rows, and enough patience or compute to actually check every combination worth checking.

Both assumptions can fail. A dataset with forty rows can't spare 15% for validation without leaving almost nothing to train on. A dataset with forty candidate features has over a trillion possible subsets — nobody is grid-searching that. This chapter is what selectors reach for when a proper trial match, for every candidate, simply isn't on the table.

## Building a Team One Trial at a Time

Checking every possible subset of features is exponential — with $n$ candidate features, there are $2^n$ possible subsets to try, and that number gets unmanageable fast. **Sequential feature selection** avoids the explosion by never checking every subset at all. It builds toward a good one, one feature at a time, in one of two directions.

**Forward selection** starts from nothing — an empty side, an intercept-only model with no predictors at all — and adds, one at a time, whichever remaining feature improves the model the most. Stop once you've reached the number of features you asked for.

**Backward selection** starts from everything — every candidate predictor already in the model — and removes, one at a time, whichever feature costs the model the least to lose. Stop at the same target count, arrived at from the opposite direction.

```python
from sklearn.feature_selection import SequentialFeatureSelector
from sklearn.linear_model import LinearRegression

lm = LinearRegression()

forward_lm = SequentialFeatureSelector(
    estimator=lm, n_features_to_select=2, direction="forward"
)
forward_lm.fit(X, y)

backward_lm = SequentialFeatureSelector(
    estimator=lm, n_features_to_select=2, direction="backward"
)
backward_lm.fit(X, y)
```

Neither direction is strictly better, and the difference is about what each approach gets to *see*. Forward selection builds up from an empty side, so early on it can only ever judge a feature in isolation or alongside a small handful of others — it can miss a predictor that's mediocre alone but excellent in combination, the exact nightwatchman problem **Feature Selection & Hyperparameter Optimisation** already warned about. Backward selection starts with the full squad already on the page, so every removal decision is made with the complete picture in view — more thorough, and more expensive, since the first several rounds are trained on the largest, slowest version of the model. Forward selection is the cheaper habit; backward selection is the more careful one.

## Judging a Team Without a Fresh Match

Sequential selection still needs *something* to judge each candidate model by. Ordinarily that would be a validation score — but if there isn't enough data to responsibly spare a validation slice, you need a way to compare models using nothing but what they were trained on, in a way that doesn't just reward whichever model memorised the training set hardest.

The **AIC** (Akaike Information Criterion) does exactly that:

```python
import numpy as np

def AIC(p, L):
    return 2 * p - 2 * np.log(L)
```

Two terms pulling in opposite directions. `L` is the model's likelihood — loosely, how well it fits the data it was trained on — and `-2·ln(L)` shrinks as that fit improves, pulling AIC down. `2p` is a straight penalty for `p`, the number of parameters in the model, with no regard for whether they helped. Add a feature that barely moves the fit, and the `2p` penalty outweighs whatever tiny improvement `L` bought, and AIC gets *worse*, not better. **Lower AIC wins**, and reaching it means a model earned every parameter it's carrying.

That should sound familiar. It's the same argument **Gradient Descent**'s regularisation section made about individual weights inside one model's loss function — a large weight has to earn its keep against a penalty, or it gets shrunk away. AIC runs that identical fight one level up, between whole competing models instead of between individual weights, and it does it without ever touching a held-out row.

**BIC** (Bayesian Information Criterion) is AIC's stricter sibling — same shape, but its penalty for extra parameters grows with the size of the dataset, so it punishes complexity even harder once there's plenty of data around to have been more selective with. And **R²** — which you'll meet properly in **Linear Regression**, later in this series — can act as a third comparison criterion too, with one serious catch worth stating plainly: **R² never goes down when you add a feature**, useful or not. A predictor that's pure noise will still nudge R² up by some vanishingly small amount, purely by giving the model one more thing to fit around. AIC and BIC exist precisely because R² alone can't be trusted to notice when a feature isn't earning its place.

## Too Many Stats, Not Enough Players

A different problem entirely: some datasets have more features than observations — hundreds of biomechanical measurements taken off fifty bowlers, say. Push that through the **normal equation** — the closed-form fitting method you'll meet properly in **Linear Regression**, later in this series — and the matrix inversion at its heart simply breaks; there aren't enough rows for the arithmetic to work, let alone enough to trust the result if it somehow did.

**Principal Component Analysis (PCA)** takes a different route out of that problem than feature *selection* does. Rather than choosing a subset of the original columns to keep, it builds an entirely new, smaller set of features — **components** — each one a blend of the originals, chosen so the first component captures as much of the data's total variation as possible, the second captures as much of whatever's left over, and so on.

```python
from sklearn.decomposition import PCA

pca = PCA(n_components=3)
pca.fit(X)
```

Two hundred granular measurements per bowler might genuinely only be describing three or four real underlying qualities — something like raw pace, repeatability of action, and release height — with the other 196 numbers mostly just noisy restatements of those same few things, measured from slightly different angles. PCA doesn't know to call its components "pace" or "repeatability"; it just finds the handful of blended directions that account for almost all of the original spread, and lets you train a model on those three or four components instead of the original two hundred correlated columns.

The cost is exactly what you'd expect from trading two hundred named stats for three unnamed ones: **you lose clean interpretability.** A `DecisionTreeClassifier`'s split on `impact_line_cm` — you'll meet exactly this idea in **Decision Trees**, later in this series — means something a non-technical stakeholder can follow instantly. A split on "component 2" means some specific blend of pace, seam position, and run-up length, in proportions nobody chose by hand and nobody can read off the coefficient sheet at a glance. And one practical note worth flagging now, since you'll meet it properly in **K-Means Clustering**, later in this series: PCA is sensitive to scale the same way distance-based methods are, so features should be standardised before PCA sees them, or whichever column happens to have the largest raw numbers will quietly dominate the first component regardless of how informative it actually is.

## Ground Rules for the Dressing-Room Wall

- **Sequential selection avoids checking every subset**, which stops being possible well before you reach a few dozen candidate features. Forward builds up from nothing; backward trims down from everything.
- **Forward selection is cheaper and can miss features that only shine in combination.** Backward selection sees the full picture from the start, at a higher computational cost.
- **AIC and BIC score a model on training data alone**, penalising every extra parameter directly rather than relying on a held-out score you may not be able to afford.
- **R² alone can't be trusted to compare models with different feature counts.** It never penalises a useless addition — that's exactly the gap AIC and BIC close.
- **PCA solves "more features than rows" by building new blended components**, not by selecting a subset of the old ones.
- **PCA trades interpretability for feasibility.** A model built on components can't be read off the way a model built on named features can.
- **Scale before PCA**, the same discipline min-max scaling and standardisation already earned in K-Nearest Neighbours and K-Means Clustering.

---

Feature Selection & Hyperparameter Optimisation worked because there was enough data and enough patience to check everything and still hold a fair trial for the winner. This chapter was for the seasons without that luxury — building a side one name at a time, judging it without a spare fixture to test it on, or compressing two hundred stats down to the three that actually mattered. Different constraints, same job: naming a side you can defend.
