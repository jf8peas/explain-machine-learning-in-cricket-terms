---
layout: ../../layouts/MatchLayout.astro
title: "About the Author"
innings: about
chapter: author
meta: "5 min · the scorer"
lede: "Every scorecard has a scorer sitting quietly in the box, recording every ball. This chapter introduces the person keeping score for this course — who they are, and why machine learning made more sense once it was explained in cricket terms."
commentary: "The scorer never faces a ball, but nothing counts until they write it down."
codeFile: about/author.py
codeOut: "author registered · 1 scorer on duty"
code: |
  AUTHOR = {
      "role": "scorer / course author",
      "format": "ML explained in cricket terms",
      "prior_ml_required": False,
  }

  print("author registered · 1 scorer on duty")
stats:
  - { k: "Role", v: "Scorer", s: "keeping the book" }
  - { k: "Format", v: "4 innings", s: "plus this card" }
  - { k: "Chapters", v: "12", s: "across the season" }
  - { k: "Umpire", v: "You", s: "the final call" }
---

## 1. The Person in the Scorer's Box

This course was written by someone who learned machine learning the hard way — through dense textbooks, notation-heavy lectures, and blog posts that assumed you already knew the answer — and then discovered that every single concept clicked instantly once it was compared to cricket.

* **Background:** A software engineer and lifelong cricket follower who spent years scoring junior matches on Saturday mornings before ever writing a line of Python.
* **Day job:** Building and operating data systems — the kind that need a clear architecture, a disciplined workflow, and the occasional 2am review of what went wrong.

---

## 2. Why Cricket?

Machine learning education has a framing problem. The ideas themselves — regression, classification, overfitting, backpropagation — are not exotic. They are judgment calls under uncertainty, made repeatedly, with feedback. Which is, not coincidentally, an exact description of a cricket match.

* **Overs are iterations.** Each one gives you new information and forces a small adjustment.
* **The DRS is a review agent.** A second opinion, grounded in evidence, with a well-defined escalation path.
* **The batting order is a model architecture.** Openers take the new ball; the finisher converts the platform into a result.

Once you see it, you cannot unsee it. This site exists so you don't have to.

---

## 3. What to Expect

* **No prior ML required.** Every chapter starts from a situation any cricket watcher already understands.
* **Working code.** Each concept ships with a short, runnable snippet — small enough to read on the boundary rope between overs.
* **Honest scorekeeping.** Where a metaphor stretches too far, the text says so. Umpire's call.

---

## 4. Get in Touch

Found a misfield? A wrong'un in the code? The scorebook is public — raise an issue or open a pull request on the GitHub repository, and it will be reviewed with the seriousness of a last-over DRS referral.
