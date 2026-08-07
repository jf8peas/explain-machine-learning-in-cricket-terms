---
layout: ../../layouts/MatchLayout.astro
title: "Polynomial & Spline Features"
subtitle: "Going Beyond Linear"
innings: first-innings
chapter: beyond-linear-models
meta: "14 min · polynomials, interactions & splines"
lede: "Linear Regression assumed every extra over faced was worth the same number of runs, no matter which over it was. Nobody who has ever watched an innings actually believes that — the powerplay, the middle overs, and the death all score at different rates, and a single straight line can only ever describe one of them. Polynomial and spline features are how you let the line bend."
commentary: "'You can't use the powerplay rate to explain the death overs. It's not one line. It's three.' — Batting Analyst"
codeFile: first_innings/beyond_linear.py
codeOut: "degree 3 → 4 columns per feature · 2 knots → 3 stitched phases"
code: |
  from sklearn.preprocessing import PolynomialFeatures, SplineTransformer

  poly = PolynomialFeatures(degree=3)
  poly_X = poly.fit_transform(X)

  spline = SplineTransformer(degree=1, n_knots=2, knots="uniform")
  spline_X = spline.fit_transform(X)
stats:
  - { k: "Polynomial", v: "Powers", s: "one curve, whole range" }
  - { k: "Interaction", v: "A × B", s: "effect depends on context" }
  - { k: "Knots", v: "Breakpoints", s: "where the shape changes" }
  - { k: "Still Linear", v: "In Coefficients", s: "just cleverer columns" }
---

## One Rate Doesn't Describe a Whole Innings

**Linear Regression** built a projected score out of a weighted sum: so many runs per over faced, so many per wicket in hand, so many per point of run rate — each weight constant, applied identically whether it's over 3 or over 43. That's a convenient fiction. Overs one through six score at one rate, entirely shaped by field restrictions and a hard new ball. The middle overs settle into something calmer. The last five overs bend the whole shape upward as batters accept the risk of getting out to maximise every remaining ball. Three phases, three different relationships between "overs gone" and "runs added" — and one straight line can only ever commit to describing one of them.

This chapter is three ways of letting a model that's still, underneath, doing nothing but a weighted sum, describe a relationship that actually bends.

## Polynomial Features: One Curve for the Whole Range

The trick lives in a detail from **Linear Regression** worth restating plainly: the model only has to be linear in its *coefficients*. The predictors themselves can be transformed however you like before they ever reach the weighted sum. Add `overs_faced ** 2` as its own column, alongside `overs_faced` itself, and the fitted model can now trace a curve in overs — while every piece of machinery underneath, the normal equation included, is still just fitting a straight line, through a feature set that's no longer straight.

```python
from sklearn.preprocessing import PolynomialFeatures

poly = PolynomialFeatures(degree=3)
poly_X = poly.fit_transform(X)
```

`degree=3` doesn't just add `overs_faced ** 2` and `overs_faced ** 3`. Fed more than one column, `PolynomialFeatures` also generates every **interaction** between them up to that degree — `overs_faced * wickets_lost`, and so on — automatically, whether you asked for it or not. Worth knowing going in, because it's the single most common surprise the first time someone checks how many columns came out the other end.

## Interaction Terms: When One Feature's Effect Depends on Another

Sometimes you want exactly that cross-term, deliberately, without the rest of a full polynomial expansion. Multiply two predictors together — `wickets_in_hand * required_run_rate` — and you've told the model something a plain weighted sum can't say on its own: that the effect of the required run rate on the final score depends on how many wickets are left, rather than assuming run rate matters the same fixed amount regardless of context. A required rate of twelve with eight wickets standing is a comfortable chase. The same rate with two wickets standing is nearly a lost cause. One number, two entirely different meanings, and an interaction term is how a model that only knows how to add things together gets to represent "it depends."

## Splines: A Different Curve for Every Phase

The obvious next move — just keep raising the polynomial's degree until the curve bends however it needs to — has a real cost. A single polynomial forced to describe the powerplay, the middle overs, *and* the death all at once tends to overcorrect: pushed higher in degree to capture the death-overs surge, it starts wiggling wildly in the middle overs where nothing dramatic was happening at all. That's **Form and Class**'s overfitting argument again, wearing a curve-fitting jersey — a model expressive enough to chase every bend in the training data, including bends that were never really there.

**Splines** fix this by refusing to use one polynomial for the whole range at all. Instead, the range gets cut into pieces — say, overs 1–6, overs 7–40, overs 41–50 — with a separate, low-degree polynomial fitted to each piece. The cut points are called **knots**, and a spline's defining rule is that the pieces have to meet at each knot smoothly: no visible seam, no jump, no kink, just one curve quietly changing its personality as it crosses from the powerplay's polynomial into the middle-overs' polynomial into the death-overs' polynomial.

```python
from sklearn.preprocessing import SplineTransformer

spline = SplineTransformer(degree=1, n_knots=2, knots="uniform")
spline_X = spline.fit_transform(X)
```

`degree=1` here means each individual piece is a straight line — three connected line segments rather than one global curve, joined smoothly at two knots. `n_knots=2` sets how many breakpoints to place; `knots="uniform"` spaces them evenly across the range rather than at overs 6 and 40 specifically, though scikit-learn will happily take knot positions chosen by hand instead.

Here's the part that ties a spline back to everything else in this innings: **a spline can be written as a linear combination of a fixed set of basis functions** — meaning fitting one is still, underneath, ordinary linear regression, just against a cleverer set of columns than raw overs and its powers. To fully describe a spline of degree `d` with `k` knots takes `d + k − 1` such basis functions, and the genuinely good news is that you never have to derive what those functions look like by hand. `SplineTransformer` builds them for you; all that's left is fitting a straight-line model on top, exactly as before.

## Choosing Between the Three

- **Polynomial terms** are the simplest reach when a relationship curves gently across its whole range — but pushed to a high degree to capture something local, they tend to wiggle everywhere else instead.
- **Interaction terms** aren't about curvature in one feature at all — they're for when two features' effects genuinely depend on each other, and a plain weighted sum can't represent "it depends."
- **Splines** are the right tool when the relationship doesn't just curve, it changes *shape* — different behaviour in different regions, like the three distinct phases of an innings — without needing one increasingly wild global polynomial to fake it.

All three do the same underlying trick as **Linear Regression**'s dummy variables: transform the columns first, and let the same weighted-sum machinery handle the rest.

## Ground Rules for the Dressing-Room Wall

- **A linear model only needs to be linear in its coefficients**, not in the raw features. Polynomial terms, interaction terms, and splines are all just cleverer columns feeding the same weighted sum.
- **`PolynomialFeatures` adds interactions automatically**, not just pure powers — check the column count if that surprises you.
- **An interaction term says "it depends."** Reach for one when a feature's effect genuinely changes depending on another feature's value.
- **A single high-degree polynomial can overfit by wiggling everywhere to fit a bend that only exists in one region.** That's Form and Class's overfitting problem, applied to curve-fitting.
- **Splines fit a different low-degree polynomial per region, stitched smoothly at knots**, rather than forcing one global curve to describe every phase at once.
- **Fitting a spline is still linear regression** — against `d + k − 1` basis functions instead of the raw feature, courtesy of `SplineTransformer` building them for you.

---

An innings was never one constant rate from the first ball to the last. Powerplay, middle overs, death — three different shapes, stitched into one scorecard. This chapter was about giving a straight-line method the vocabulary to say so.
