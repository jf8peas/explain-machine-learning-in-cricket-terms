---
layout: ../../layouts/MatchLayout.astro
title: "Classification vs Regression"
subtitle: "How Many, or Which One?"
innings: first-innings
chapter: classification-vs-regression
meta: "8 min · how many, or which one"
lede: "Every number on the broadcast graphic is answering one of exactly two questions: classification or regression. Get the question wrong and the cleverest model in the ground will hand you a beautifully confident answer to something nobody asked."
commentary: "'Is that a projected total or a review verdict? Because you've built a magnificent model for the wrong scoreboard.' — Match Analyst"
codeFile: first_innings/task_type.py
codeOut: "regression → 9.3 runs this over · classification → 'No Wicket' (p=0.82)"
code: |
  # Same over, two different questions to a model

  # Regression: how many runs will this over cost?
  reg.predict(this_over)            # array([9.3])

  # Classification: will this over produce a wicket?
  clf.predict(this_over)            # array(['No Wicket'])
  clf.predict_proba(this_over)      # array([[0.82, 0.18]])
stats:
  - { k: "Regression", v: "How Many?", s: "a continuous target" }
  - { k: "Classification", v: "Which One?", s: "a fixed set of labels" }
  - { k: "Same Pitch", v: "Different Question", s: "the target column decides" }
  - { k: "Wrong Question", v: "Wrong Everything", s: "model, metric, meaning" }
---

## Two Boards, Two Questions

Watch any broadcast during a run chase and there are two entirely different kinds of number competing for space on the screen. One is a projected total — 187, give or take a handful. The other is a verdict — OUT, delivered after a review. Both are produced from data. Both, these days, are probably produced by a model. And they are not remotely the same job.

Every supervised model you'll meet in this innings is doing one of those two jobs, and the job is decided the instant you pick what column you're asking it to predict. Everything downstream — which algorithm fits, which score to trust, what the output even means — falls out of that one choice.

## Regression: How Many?

Twelve overs gone, two down, and the graphic on screen updates its projected score. That number is a **regression**: a continuous prediction, drawn from everything the match has told us so far, that can land anywhere on a sliding scale — 142, 187.6, 201.

A simple linear model does this by fitting a straight line through old matches: given overs faced, wickets in hand and the current run rate, what total is this innings heading for?

```python
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

model = LinearRegression()
model.fit(X_train[["overs", "wickets", "run_rate"]], y_train)

pred = model.predict(X_val[["overs", "wickets", "run_rate"]])
print("MAE", round(mean_absolute_error(y_val, pred), 1), "runs")
```

You judge a regression in the same units as the thing it's predicting. Mean absolute error tells you, in plain runs, how far off the projection typically lands. Eleven runs either way might win you the pub argument; it will not win you a betting licence — but it is at least an honest, countable number, because the target itself was a countable number.

## Classification: Which One?

Now the other kind of question. Regression asks *how many*. **Classification** asks *which one* — and cricket is full of which-one questions with a short, fixed menu of answers.

The DRS review is the cleanest example: out, or not out. The model outputs a probability, and the third umpire — or a threshold you set in advance — decides where the finger goes.

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

clf = LogisticRegression(max_iter=1000, class_weight="balanced")
clf.fit(X_train, y_train)

proba = clf.predict_proba(X_val)[:, 1]
appeal_upheld = proba > 0.60          # your threshold, your call

print(classification_report(y_val, appeal_upheld, digits=2))
```

Classification isn't limited to two answers, either. What will the next ball be called — dot, single, four, six, wicket, wide? Five or six labels instead of two, but the shape of the question hasn't changed: pick one from a fixed shortlist. That's still classification, just with a longer team sheet.

You judge classification completely differently from regression — not in runs, but in how often the label was right, and what kind of wrong it was. Precision, recall and accuracy all measure *label correctness*, and none of them mean anything applied to a projected score.

## The Tell Is in the Target Column

You don't need to know anything about the algorithm to know which question you're asking. Look at the column you're trying to predict, before you look at anything else.

| Question | Target looks like | Cricket example | Typical judge |
|---|---|---|---|
| **How many?** | A number you could average | Projected score, strike rate, overs remaining | MAE, RMSE, R² |
| **Which one?** | One of a fixed set of labels | Out / Not Out, Four / Six / Dot / Wicket | Accuracy, Precision, Recall, F1 |

If it makes sense to say "the average target was 143.6", you're looking at regression. If averaging the target would produce nonsense — the average of Out, Not Out and Four is not a meaningful cricket shot — you're looking at classification.

## Same Data, Different Question

Here's the part that trips people up: the exact same ball-by-ball dataset can support both questions at once, depending only on which column you point the model at.

"How many runs will this over cost?" — regression, target is a run count. "Will this over produce a wicket?" — classification, target is a yes/no label. "What will the next ball be called?" — classification again, target is now a five-way label instead of two. Same overs, same features, same pitch. The data never told you which question to ask — you decided that, and the model just answered the question you actually posed.

## Why Getting This Wrong Is Expensive

The task type isn't a footnote you fill in after picking an algorithm — it comes first, and it decides almost everything else:

- **The algorithm.** `LinearRegression` produces a number on a continuous scale. Asking it to output "Out" or "Not Out" doesn't make sense; asking `LogisticRegression` for a projected score doesn't either. Some algorithms — K-Nearest Neighbours among them, met later in this innings — can do either job, but only once you've told them which one you want.
- **The metric.** Reporting "accuracy" on a projected score, or "mean absolute error" on a label, are both category errors. You'll get a number back. It will mean nothing.
- **The output itself.** A regressor asked a which-one question will cheerfully hand you 0.7340912, and you'll have to remember that this is a probability of the positive class, not a score, not a count, not anything you can put straight on the scoreboard.

An optimiser doesn't know or care which question you meant to ask. It will optimise exactly the one you gave it, and report back with total confidence, whether or not that confidence means anything.

## Selection Checklist

- **Look at the target column first.** Everything else — algorithm, metric, how you read the output — follows from what kind of thing you're predicting.
- **Countable and averageable → regression.** Runs, overs, strike rate, run rate.
- **A fixed shortlist of outcomes → classification.** Out/Not Out, and multi-class menus like ball-by-ball outcomes.
- **The same features can serve either question.** The target column decides, not the data.
- **Pick the task type before the algorithm, and the algorithm before the metric.** Doing it backwards is how you end up reporting a beautifully precise number that answers nothing anyone asked.

---

Two questions, and now you can tell them apart on sight. The next chapter meets the first player capable of answering both — the same idea, the same arithmetic, just pointed at a different kind of target column.
