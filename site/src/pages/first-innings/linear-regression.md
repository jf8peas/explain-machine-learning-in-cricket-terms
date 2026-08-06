---
layout: ../../layouts/MatchLayout.astro
title: "Linear Regression: The Arithmetic Behind the Projected Score"
innings: first-innings
chapter: linear-regression
meta: "16 min · the arithmetic behind the projected score"
lede: "The broadcast's projected score looks like a single confident number appearing out of nowhere. Underneath it is a straight line drawn through every match in the archive, a handful of weighted reasons added together, and rather more arithmetic than the commentator lets on."
commentary: "'The number isn't a guess. It's a hundred old matches, weighted and added up, wearing a very confident jacket.' — Data Analyst"
codeFile: first_innings/linear_regression.py
codeOut: "intercept 4.2 · overs +14.8 · wickets −9.1 · run_rate +11.3 · RMSE 11.4 · R² 0.78"
code: |
  from sklearn.linear_model import LinearRegression
  from sklearn.metrics import mean_squared_error, r2_score

  model = LinearRegression()
  model.fit(X_train, y_train)

  print("intercept", round(model.intercept_, 2))
  print("coefficients", dict(zip(X_train.columns, model.coef_.round(2))))

  preds = model.predict(X_val)
  rmse = mean_squared_error(y_val, preds, squared=False)
  print("RMSE", round(rmse, 1), "· R²", round(r2_score(y_val, preds), 3))
stats:
  - { k: "Predictors", v: "3", s: "overs, wickets, rate" }
  - { k: "Cost function", v: "SSE", s: "sum of squared error" }
  - { k: "R²", v: "0.78", s: "variance explained" }
  - { k: "Solved via", v: "Normal Eqn", s: "(XᵀX)⁻¹XᵀY" }
---

## Opening the Hood on the Projected Score

Back in **Classification vs Regression**, the projected score was the running example of a continuous target — a number the broadcast produces without ever explaining how. Time to explain how.

**Regression**, formally, is a relationship between some predictors — call them *X* — and a numerical outcome, *Y*. **Linear regression** is the specific, unglamorous version of that relationship: it describes the outcome as a straight-line combination of the predictors. Overs faced, wickets in hand, and current run rate each get a weight, those weighted contributions get added together with a starting baseline, and whatever's left over — the part the predictors couldn't explain — is the error.

That's the whole model. Three numbers, three weights, one baseline, one number out.

## Two Kinds of Reasons

Every predictor going into that sum is one of two types.

**Numerical predictors** — overs faced, run rate — plug straight into the arithmetic as-is. **Categorical predictors** — format, venue, home or away — can't. "T20" minus "Test" isn't a number, so before either can enter a linear combination, a categorical column has to be split into binary **dummy variables**, one flag per category:

```python
df_with_dummies = pd.get_dummies(df, columns=["format"])
```

Here's the part worth being careful about. If a `format` column has three categories — ODI, T20, Test — the correct number of dummy columns to feed the model is **two**, not three. `pd.get_dummies` on its own will happily hand you all three, and that third column is silently redundant: once you know a match wasn't ODI and wasn't T20, you already know it was a Test, whether or not there's a column saying so. Feeding the model all three creates exact multicollinearity — the columns are perfectly, uselessly correlated with each other — and the fix is `drop_first=True`:

```python
df_with_dummies = pd.get_dummies(df, columns=["format"], drop_first=True)
```

The dropped category doesn't vanish. It becomes the **reference group**, silently baked into the intercept, which is exactly the thread to pull on next.

## The Cost Function: Naming What "Wrong" Means

Before the model can find good weights, it needs a precise definition of *bad*. That's the **cost function** — a single number summarising, across every match in the training data, how far the model's predictions land from what actually happened.

Linear regression's standard choice is the **sum of squared error**: take each match's miss, square it, add every squared miss together. Squaring does two jobs at once — it makes every miss positive, so overshooting and undershooting don't cancel out, and it punishes large misses far more severely than small ones. A model that's off by 40 runs once is judged far more harshly than one that's off by 10 runs four separate times, even though the raw total error is the same either way. Fitting the model is nothing more than searching for the weights that make this one number as small as possible.

## Solving for the Weights, in One Shot

Some models get to their answer through trial and error — a coach in the nets, tweaking, watching, adjusting. Ordinary linear regression doesn't need to. Given the cost function above, there's a **closed-form solution** — an exact formula that produces the best possible weights directly, no iteration required:

β̂ = (XᵀX)⁻¹XᵀY

In matrix arithmetic, this is three lines:

```python
XX_inv = np.linalg.inv(np.matmul(np.transpose(X), X))
XY = np.matmul(np.transpose(X), y)
beta_hat = np.matmul(XX_inv, XY)
```

Transpose *X*, multiply it by itself, invert that, multiply by *X* transposed and *y* — and out comes every weight simultaneously, guaranteed optimal for that cost function. It's the run-chase equivalent of knowing the required rate the instant the target's announced, rather than working it out ball by ball. Nobody writes this out by hand day to day — `sklearn` does it in one line:

```python
from sklearn.linear_model import LinearRegression

model = LinearRegression()
model.fit(X_train, y_train)
```

Same arithmetic, no scratchpad.

## The Other Road: Walked Instead of Solved

The normal equation isn't the only way to arrive at these weights — it's just the fastest one available, and only because linear regression's particular cost function happens to have a clean, closed-form answer. **Gradient Descent** covered the general-purpose alternative: start with a guess for every weight, measure how wrong the resulting projected score is, work out which direction each weight should nudge to shrink that error, take a step, repeat.

```python
from sklearn.linear_model import SGDRegressor

model = SGDRegressor(
    loss="squared_error",
    learning_rate="constant",
    eta0=0.01,
    tol=1e-3,
    max_iter=1000,
)
model.fit(X_train, y_train)

print("intercept", round(model.intercept_[0], 2))
print("coefficients", dict(zip(X_train.columns, model.coef_.round(2))))
# intercept 4.1 · overs +14.6 · wickets −9.0 · run_rate +11.2
```

Set that next to the normal equation's `4.2 · +14.8 · −9.1 · +11.3` from a moment ago. Not identical — gradient descent stopped the instant its tolerance said "close enough," rather than solving exactly — but close enough that either model hands the broadcast the same projected score to within a fraction of a run. Two completely different processes, one solving in a single shot of matrix algebra, one walking downhill in small steps, landing in the same valley.

For plain linear regression, reach for the normal equation — `sklearn`'s ordinary `LinearRegression` already does, and there's no learning rate to get wrong. The reason to know the walking route at all is that it's the *only* route once you leave this chapter. Logistic regression, and every layer of a network waiting in Second Innings, has no equivalent one-shot formula. All of them get tuned exactly the way `SGDRegressor` just tuned this one.

## Reading the Weights Back

A fitted model is willing to show its working:

```python
model.intercept_
model.coef_
```

**The intercept** is the model's answer when every single predictor equals zero — or, if categorical dummies are involved, the average outcome for whichever category (or combination of categories) got dropped as the reference group. In the projected-score model, "zero overs faced, zero wickets down, zero run rate" is actually a coherent, meaningful moment — the first ball of the innings — so an intercept of `4.2` reads sensibly as a baseline score before anything has happened. That won't always be true. A model predicting career strike rate from `matches_played` has an intercept describing a player with zero career matches, which is not a batter, it's a vacancy. Always check whether "all predictors at zero" describes something real before trusting the intercept's story.

**Each coefficient** is the change in the average outcome for a one-unit change in that predictor, with every other predictor held fixed. `run_rate: +11.3` means: for two otherwise-identical situations, one over's worth of extra run rate is associated with 11.3 more runs in the final projection. For a categorical dummy, "one unit" means switching from the reference category to that one — the T20 coefficient, if Test was dropped as reference, is the gap between a Test-match baseline and a T20 one, all else held equal.

That "all else held equal" clause is doing a lot of work, and it's the reason coefficient interpretation is dangerous to do casually. A predictor's coefficient can flip sign entirely depending on what else shares the model with it — the same trap **Trial Matches** described for two identical left-arm seamers splitting credit for a wicket neither fully earned alone. Read a coefficient in isolation and you're reading a number whose meaning depends entirely on company you haven't checked.

## Checking Whether You Can Trust It: Residuals

Fitting is not the same as fitting *well*. `model.predict(data)` gets you predictions; what you do next is look hard at how wrong they were.

```python
import matplotlib.pyplot as plt

predictions = model.predict(X_val)
residuals = y_val - predictions
plt.scatter(predictions, residuals)
plt.axhline(0, linestyle="--")
```

A **residuals plot** — predicted score along the bottom, the size of the miss up the side — is the model's version of a spray chart. What you want to see is scattered rain: misses bouncing randomly above and below zero, roughly the same spread whether the projected score was 90 or 190. That's the textbook assumption behind linear regression's residuals — **zero mean and constant variance** across the range of predictions.

![Two residuals plots side by side. The left, labelled Healthy, shows points scattered randomly above and below a dashed zero line with roughly constant spread across the full range of predicted scores. The right, labelled Unhealthy, shows the same kind of scatter but fanning out into a widening funnel — tight near low predictions, wildly spread near high ones.](/explain-machine-learning-in-cricket-terms/images/residuals-plot.png)

Left plot, nobody would look twice — that's what a trustworthy model's misses look like: no shape, no drift, just noise. Right plot is the same model on a bad day: the spread visibly widens as the predicted score climbs, which is exactly the **funnel** pattern worth watching for.

What you don't want is a shape. A widening funnel — tight misses on low projections, wild misses on high ones — says the model's confidence should shrink as scores climb, but the model doesn't know that. A curve — residuals consistently positive in the middle of the range and negative at both ends — says there's a bend in the real relationship that a straight line is structurally unable to draw. Either pattern means the model isn't just imprecise, it's wrong in a *specific, fixable* direction, and a residuals plot is how you catch that before someone else does.

## Grading the Model: MSE, RMSE, and R²

Three numbers, each answering a slightly different question:

```python
from sklearn.metrics import mean_squared_error, r2_score

mse = mean_squared_error(y_val, preds)
rmse = mean_squared_error(y_val, preds, squared=False)
r2 = r2_score(y_val, preds)
```

**Mean squared error** is the same sum-of-squares logic from the cost function, averaged per match instead of totalled — the average amount of squared error, which punishes the same large misses the training process was already trying hardest to avoid. It's an honest number and an unreadable one, because it's measured in *runs squared*, a unit nobody has ever used to describe a cricket score.

**Root mean squared error** fixes that by taking the square root, landing back in plain runs — an RMSE of `11.4` means "off by about eleven runs," directly comparable to the scores on the board. One note for anyone typing this into a recent `sklearn`: the `squared=False` argument shown above has been deprecated in favour of a separate `root_mean_squared_error()` function in newer releases — same arithmetic, tidier name.

**R², the coefficient of determination**, answers a different question entirely: not "how many runs off," but "what share of the match-to-match variation did the model actually explain, versus how much is chaos it never had a chance at?" `R² = 0.78` means the model accounts for 78% of the variance in final scores; the remaining 22% is pitch conditions, umpiring calls, and moments of pure madness that overs-wickets-and-run-rate was never going to see coming.

## Choosing Which Reasons Belong in the Model

**Trial Matches** already covered `corr()` as a general scouting report for feature selection. Linear regression adds one move of its own, on top of that.

**The outcome itself sometimes needs reshaping first.** A handful of freak overs — thirty-two off six balls, once a season — can drag a model's entire attention toward fitting the extremes at the expense of getting the ordinary case right, because the sum-of-squared-error cost function punishes big misses so heavily. A **logarithmic transform** —

```python
import numpy as np
y_transformed = np.log2(y)
```

— compresses the long tail so extreme values stop dominating. The **Box-Cox transformation** generalises the idea across a whole family of reshapings, with a log transform sitting inside it as one special case:

```python
from scipy.stats import boxcox
y_transformed, lam = boxcox(y)
# lmbda=0 is equivalent to a log transform
```

Both exist for the same reason: a wildly skewed outcome makes for a model that's excellent at freak overs and mediocre at ordinary ones, and neither is what you actually wanted.

That reshapes the outcome. The next chapter, **Going Beyond Linear**, does the equivalent for the predictors — teaching this same straight-line method to trace an actual curve, because a batting innings doesn't accumulate runs at one constant rate from over one to over fifty.

## Ground Rules for the Dressing-Room Wall

- **The outcome is a weighted sum, plus error.** Every predictor gets a coefficient; the error is whatever those predictors couldn't explain.
- **The normal equation and gradient descent solve the same problem two different ways.** One solves exactly in a single shot; the other walks downhill and stops when it's close enough. Reach for the normal equation here — reach for gradient descent everywhere the closed form doesn't exist.
- **Categorical predictors need K−1 dummy columns, not K.** `pd.get_dummies(..., drop_first=True)` — skip this and you've handed the model a perfectly redundant column and called it a feature.
- **The intercept is a real prediction, for a real (if sometimes silly) situation.** Check that "all predictors at zero" describes something meaningful before quoting it.
- **A coefficient's meaning depends on the company it keeps.** Never read one in isolation from what else is in the model.
- **Check the residuals before you trust the R².** A model can post a respectable score and still be systematically wrong in a way a scatter plot would have shown you immediately.
- **MSE punishes big misses; RMSE puts that back into runs; R² tells you what fraction of the story the model actually captured.** Three different questions, not three names for the same number.
- **Skewed outcomes may need reshaping before you fit anything.** A log or Box-Cox transform stops a handful of freak overs from steering the entire model.

---

The projected score was never a guess. It was always this — a straight line, a handful of weighted reasons, and a cost function quietly working out the arithmetic in the background, long before the number ever reached the screen.
