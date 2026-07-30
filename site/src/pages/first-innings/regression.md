---
layout: ../../layouts/MatchLayout.astro
title: "Regression: Predicting the Chase Total"
innings: first-innings
chapter: regression
meta: "12 min · predicting the chase"
lede: "Twelve overs gone, two down, and the broadcast puts a projected score on screen. That number is a regression — a continuous prediction drawn from everything the match has told us so far."
commentary: "A projected score is a confident guess wearing a suit. Always ask it for an error bar."
codeFile: first_innings/regression.py
codeOut: "MAE 11.4 runs · R² 0.78"
code: |
  from sklearn.linear_model import LinearRegression
  from sklearn.metrics import mean_absolute_error

  model = LinearRegression()
  model.fit(X_train[["overs", "wickets", "run_rate"]], y_train)

  pred = model.predict(X_val[["overs", "wickets", "run_rate"]])
  print("MAE", round(mean_absolute_error(y_val, pred), 1), "runs")
stats:
  - { k: "Target", v: "Runs", s: "continuous value" }
  - { k: "MAE", v: "11.4", s: "runs off the projection" }
  - { k: "R²", v: "0.78", s: "variance explained" }
  - { k: "Features", v: "3", s: "overs, wickets, rate" }
---

## The projected score problem

Regression predicts a **continuous number** — how many, how much, how long. The broadcast's projected score is the friendliest example in sport: given overs faced, wickets in hand and the current run rate, what total is this innings heading for?

A linear model fits a straight line through past matches. It is not clever, and that is the point — it is the opening partnership of machine learning. Solid, readable, and the benchmark everything flashier has to beat.

## Judge it in runs, not vibes

Mean absolute error tells you, in plain runs, how far off the projection typically is. Eleven runs either way might win you the pub argument; it will not win you a betting licence. Always report the error next to the prediction — a forecast without an error bar is just sledging.
