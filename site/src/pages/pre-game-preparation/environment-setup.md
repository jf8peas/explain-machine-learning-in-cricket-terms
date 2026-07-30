---
layout: ../../layouts/MatchLayout.astro
title: "Environment Setup: The Kit Bag Check"
innings: pre-game-preparation
chapter: environment-setup
meta: "7 min · kit bag"
lede: "Nobody borrows a bat at the toss. Pin your versions, isolate your environment, and make the whole thing reproducible on someone else's machine before you write a line of modelling code."
commentary: "'It works on my machine' is the batting equivalent of 'I was in, actually'."
codeFile: setup.sh
codeOut: "env ready · 14 packages pinned"
code: |
  python -m venv .venv
  source .venv/bin/activate

  pip install "numpy==2.1.3" "pandas==2.2.3" \
              "scikit-learn==1.5.2" "tensorflow==2.18.0"

  pip freeze > requirements.lock
  python -c "import sklearn; print(sklearn.__version__)"
stats:
  - { k: "Python", v: "3.11", s: "pinned interpreter" }
  - { k: "Packages", v: "14", s: "exact versions" }
  - { k: "Cold build", v: "92s", s: "CI from lockfile" }
  - { k: "Drift", v: "0", s: "since lock committed" }
---

## Check the bag before you leave

A virtual environment is your kit bag: everything you need, nothing you don't, and nobody else's gear rattling around inside it. Pin every package to an exact version and commit the lockfile — that is the difference between a professional setup and hoping the pavilion has spare pads.

## Prove it on a cold machine

The test of a setup is not your laptop. It is CI building from the lockfile in ninety seconds flat with zero drift. If a teammate cannot reproduce your environment before lunch, your results are anecdotes, not evidence.
