---
layout: ../../layouts/MatchLayout.astro
title: "K-Means Clustering"
subtitle: "How Many Piles Do You Want?"
innings: first-innings
chapter: k-means-clustering
meta: "13 min · sorting without a team sheet"
lede: "Hand K-Nearest Neighbours an unlabelled player and it's stuck — it has nothing to compare them against. Hand K-Means the same pile of stat sheets, tell it how many groups you want, and it will happily sort all of them for you. It just won't tell you what to call the groups."
commentary: "'Nobody told the algorithm who the finishers were. It just noticed that this lot all stood together.' — Head of Analytics"
codeFile: first_innings/kmeans.py
codeOut: "4 clusters · inertia 812.4 · converged in 6 iterations"
code: |
  from sklearn.preprocessing import StandardScaler
  from sklearn.cluster import KMeans

  scaler = StandardScaler()
  scaler.fit(squad_df)
  squad_scaled = scaler.transform(squad_df)

  model = KMeans(n_clusters=4, random_state=42)
  squad_df["cluster"] = model.fit_predict(squad_scaled)

  print(model.inertia_, model.n_iter_)
stats:
  - { k: "k", v: "4", s: "piles you asked for" }
  - { k: "Inertia", v: "812.4", s: "tightness of the piles" }
  - { k: "Iterations", v: "6", s: "reshuffles to settle down" }
  - { k: "Labels supplied", v: "0", s: "you name them afterwards" }
---

## No Team Sheet, No Problem

Every model so far in this innings needed a labelled column to learn from. Regression needed a runs total. Classification needed out-or-not-out. Even K-Nearest Neighbours, which doesn't build a model in advance, still needed an existing database of *labelled* players to compare the new one against.

**K-Means** doesn't get that luxury, and doesn't need it. Hand it two hundred domestic players' full stat lines with the role column deleted — no "finisher," no "anchor," no "death bowler," nothing — and tell it one thing: *make me four groups.* It will sort every player into one of four piles based purely on how close their numbers sit to each other. It will not tell you what the piles mean. That part is still your job, done afterwards, by looking at who ended up standing next to whom.

This is **unsupervised learning**: no target column, no right answer to check against, just structure the algorithm finds in the numbers because it's there.

## Standardising the Yardstick

Distance-based algorithms only work if every stat is measured on the same ruler, and you met this problem already with K-Nearest Neighbours: strike rate roams from 0 to 200-odd, economy rate barely leaves single digits, and left alone, the biggest numbers simply dominate the distance calculation regardless of what they actually mean.

K-Means typically reaches for a slightly different fix than the min-max scaling from the last chapter: **standardisation**. Instead of squeezing every stat into `[0, 1]`, it converts each value into a **z-score** — how many standard deviations a player sits from the squad average:

z = (x − μ) / σ

where *x* is the player's raw stat, *μ* is the squad's mean for that stat, and *σ* is the squad's standard deviation. A strike rate two standard deviations above average and an economy rate two standard deviations below average now both read as exactly `2` — genuinely comparable, regardless of which stat they started life as.

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
scaler.fit(squad_df)
squad_scaled = scaler.transform(squad_df)
```

Skip this step and K-Means will cheerfully build you four piles that are really just "high strike rate" and "low strike rate," because strike rate's raw numbers shouted the loudest.

## The Algorithm: Deal, Measure, Regroup, Repeat

Besides the data, K-Means asks for two things: **k**, the number of piles you want, and a **maximum number of iterations**, a safety cap so the whole process can't run forever. What happens between those two numbers is genuinely simple, and it's worth building once by hand before letting a library do it.

1. Drop **k** centroids ("captains") onto the pitch at random starting positions.
2. Measure every player's distance to every captain.
3. Each player joins whichever captain is closest — that's this round's piles.
4. Each captain relocates to the average position of everyone who just joined them.
5. Repeat from step 2, using the new captain positions.

```python
# distances to each of the k centroids, one column per centroid
distances = pd.DataFrame(index=squad_scaled.index)
for i, centroid in enumerate(centroids.values.tolist()):
    distances[f"centroid_{i}"] = ((squad_scaled - centroid) ** 2).sum(axis=1) ** 0.5

# whichever column is smallest wins — that's the pile this player joins
assignments = distances.idxmin(axis=1)

# each captain's new spot is just the average of everyone who joined them
centroids = squad_scaled.groupby(assignments).mean()
```

`centroids.values.tolist()` turns the captains' coordinates into a plain list so the loop can walk through them one at a time. `distances.idxmin(axis=1)` reads *across* each player's row of distances and returns whichever centroid column was smallest — the nearest captain. Careful with that `axis`: leave it at the pandas default of `axis=0` and you'd get the row-index of the smallest value in each *column* instead, which answers a completely different question ("which player is closest to this one captain") rather than the one you actually want ("which captain is closest to this one player").

**The stopping rule is what makes it an algorithm and not an endless muster.** Once a round produces captains standing exactly where they stood before, nobody is going to move again next round either, so the algorithm stops — continuing would just burn overs for no change. If the piles never quite settle, the `max_iter` cap steps in and calls stumps anyway, so a stubborn dataset can't run forever.

In practice you never write the loop yourself:

```python
from sklearn.cluster import KMeans

model = KMeans(n_clusters=4, random_state=42)
cluster = model.fit_predict(squad_scaled)
```

`fit_predict` does exactly what's above, at speed, and hands back the final pile number for every player.

## Reading the Scorecard Afterwards

The fitted model carries its own summary of how the sort went:

| Attribute | What it tells you |
|---|---|
| `model.inertia_` | How tight the piles ended up — total squared distance from every player to their own captain |
| `model.cluster_centers_` | The final captains' coordinates — a "prototype player" for each pile, who may not exist in real life |
| `model.n_iter_` | How many rounds of reshuffling it took to stop moving |
| `model.n_features_in_` | How many stats went in |
| `model.feature_names_in_` | Which stats those were, by name |

`cluster_centers_` is worth sitting with. The centroid of your "aggressive finisher" pile is not any actual player — it's the average of everyone who ended up in that pile, a statistical composite that might have a strike rate no real batter has ever quite matched.

## How Many Piles Should You Even Ask For?

Nothing stops you asking for `n_clusters=1` (everyone in one giant, meaningless pile) or `n_clusters=200` (every player gets their own personal pile of one — perfectly tight, and utterly useless, the clustering equivalent of the net hero from **Form and Class** who's memorised the training data and generalises to nothing). The right number sits somewhere in between, and **inertia** is how you find it.

Inertia is the sum of squared distances from every player to their own pile's captain:

inertia = Σᵢ (xᵢ − c_k)²

Low inertia means tight, well-defined piles. More piles always drives inertia down — split any group into two smaller groups and the total distance to the (now closer) centroids can only shrink or stay the same. So you can't just chase the lowest inertia, or you'll walk straight to "everyone is their own cluster" and learn nothing.

Instead, plot inertia against k and look for the **elbow**:

```
inertia
  │
  │●
  │ ╲
  │  ●
  │   ╲
  │    ●___
  │        ╲●____●____●
  └──────────────────────── k
    1  2  3  4   5    6    7
              ↑
         the elbow
```

Early on, each extra pile buys you a big drop in inertia — real structure in the data is getting captured. Past a certain point, extra piles buy almost nothing — you're just slicing existing groups thinner, not finding anything new. That bend is the elbow, and the k sitting at it is the fewest piles that still does honest work: the point where diminishing returns set in and paying for one more cluster stops being worth what it costs you in interpretability.

## Naming the Piles

K-Means will hand you back a column of cluster numbers — `0`, `1`, `2`, `3` — and not one of them means anything on its own. Working out what each pile actually *is* means going back to whatever descriptive information you already had and checking how it lines up with the clusters. `pd.crosstab` is the standard tool for that comparison:

```python
pd.crosstab(
    index=squad_df["cluster"],
    columns=squad_df["primary_role"],
    normalize="index",
)
```

- **`index`** — what goes down the rows; here, the cluster number K-Means invented.
- **`columns`** — what goes across the columns; here, a role label you already had lying around, even if it wasn't fed to the model.
- **`values`** and **`aggfunc`** — optionally, some other numeric column and how to summarise it per cell (mean strike rate per cluster, say), instead of just counting rows.
- **`normalize`** — whether to report raw counts or proportions; `"index"` converts each row into percentages, so you can read off "84% of Cluster 2 were already-known finishers" at a glance.

That reading is the whole payoff. If Cluster 2 turns out to be four-fifths finishers, you're not being told anything you have to take on faith — you're watching a label the algorithm never saw emerge naturally from players who happened to hit at similar speeds in similar overs. Cluster 2 gets to be called "Finishers" from here on, and the name was earned, not assumed.

## Ground Rules for the Dressing-Room Wall

- **No labels go in.** K-Means never sees a target column — it only ever sees how close things are to each other.
- **Standardise before you cluster.** Unscaled features let whichever stat has the biggest numbers quietly decide the whole shape of the groups.
- **More clusters always lowers inertia.** That's not a virtue on its own — chase it to the end and you get one player per pile.
- **Find the elbow, don't chase the minimum.** The right k is where extra piles stop paying for themselves, not where inertia is lowest.
- **Mind your `axis`.** `idxmin(axis=1)` reads across a row; the pandas default reads down a column. Getting this backwards silently answers the wrong question.
- **The algorithm sorts. You name.** Cross-tabulate the resulting clusters against whatever descriptive data you already have, and let the labels earn themselves.

---

Regression and classification needed someone to already know the answer. K-Nearest Neighbours needed a labelled database to lean on. K-Means needed neither — just a pile of numbers and a headcount of how many groups to make, and it still found something true about the squad that nobody had written down yet.
