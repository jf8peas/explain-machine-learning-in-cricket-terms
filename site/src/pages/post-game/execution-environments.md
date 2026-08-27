---
layout: ../../layouts/MatchLayout.astro
title: "Execution Environments"
subtitle: "Keeping the Agent from Burning Down the Pavilion"
innings: post-game
chapter: execution-environments
meta: "16 min · where the agent actually runs"
lede: "A human exploring a dataset in a notebook is doing careful, improvised net practice — running cells out of order on purpose, keeping useful state around, backtracking freely. Point an agent at the same notebook and every one of those habits becomes a way to quietly corrupt the innings."
commentary: "'Nets are for the players. The agent gets a clean pitch, a fresh scorecard, and a timer.' — Lead Systems Engineer"
codeFile: post_game/sandbox_runner.py
codeOut: "attempt 1: NameError → patched import → attempt 2: exit 0 (1.8s)"
code: |
  import subprocess

  def run_in_sandbox(script_path, timeout=120):
      result = subprocess.run(
          ["python", script_path],
          capture_output=True, text=True, timeout=timeout,
          cwd="/sandbox", env={"PYTHONDONTWRITEBYTECODE": "1"},
      )
      return result.returncode, result.stdout, result.stderr

  code, out, err = run_in_sandbox("attempt.py")
  for _ in range(max_attempts - 1):
      if code == 0:
          break
      fixed = agent.patch(script="attempt.py", traceback=err)
      code, out, err = run_in_sandbox(fixed)
stats:
  - { k: "State", v: "Fresh", s: "every run, no hidden globals" }
  - { k: "Isolation", v: "Container", s: "docker / e2b sandbox" }
  - { k: "Timeout", v: "120s", s: "per script execution" }
  - { k: "Notebook access", v: "Human only", s: "agents write .py" }
---

## The Notebook Paradox

The last chapter covered what an agent concretely does differently for a tabular model versus a deep learning one. None of that matters if the code itself isn't running somewhere safe — which is the last piece: where any of this actually executes.

A notebook is a superb tool for a human and a trap for an agent, and it's the same feature that makes it both: cells can run out of order, and state quietly outlives the cell that created it. A human remembers they redefined `df` in cell 47 and re-ran cell 12 afterwards; an agent replaying "the notebook" top to bottom gets a different `df` than the one the human was actually looking at when they drew their conclusion. The bug isn't in the code. It's in an execution order that only ever existed in one person's head.

```
  HUMAN IN THE NOTEBOOK              AGENT REPLAYING TOP-TO-BOTTOM
  cell 3  →  load df                 cell 3  →  load df
  cell 47 →  df = df.dropna()        cell 12 →  df.describe()   ← different df!
  cell 12 →  df.describe()  (re-run) cell 47 →  df = df.dropna()
  "looks clean" ✓                    "looks clean" ✓  (for the wrong reason)
```

## Headless Sandboxes

The fix isn't a smarter notebook — it's not using one for agent execution at all. An agent's code runs as a plain `.py` script inside an isolated container (Docker, e2b, or similar): fresh state on every invocation, stdout and stderr captured as the actual result, and a hard timeout so a runaway loop gets killed instead of billed. When a script fails, the traceback goes straight back to the agent as its next input — the sandbox above shows exactly that loop, patch-and-retry, with no hidden variable surviving from the failed attempt into the fixed one.

That loop isn't unbounded, either. Patch-and-retry with no cap on the number of attempts is the exact same stuck-loop risk **Agent Architectures & Tools** already covered with `max_overs`: `max_attempts` stops the retries cold once it's spent, win or lose, rather than letting a bad patch chase its own tail indefinitely.

Three boundaries, not two — the model that decides *what* to run should never be the process that runs it:

```
          AGENT BRAIN
    (reasons, never executes)
               │
               │  writes code — never touches disk directly
               ▼
        SANDBOX CONTAINER
     (the only place code runs)
   python script.py · timeout · no network
               │
               │  stdout / stderr only — no shared memory
               ▼
           LOGS / VCS
   (the only place a run persists)
    experiments.csv · git diff / commit
```

The brain plans and reads results; the container is the only place a line of Python ever actually runs; the logs and version control are the only place a run is allowed to leave a permanent trace. Collapse any one of those three into another — let the agent's reasoning process execute code directly, or let a run mutate state with no log of what changed — and the whole point of sandboxing quietly disappears.

No network belongs on that boundary list for the same reason as the timeout, not as a formality: without it, a sandboxed script could just as easily phone the dataset out to an external endpoint, or quietly pull down a different package than the one that got tested, and stdout would show nothing wrong either way.

None of `timeout`, `no network`, or `max_attempts` is the agent's to set, either. They're the same kind of Director's rule as `leakage_cutoff` or `outlier_rule` from **Director and Executor** — fixed infrastructure the Executor calls, not a setting it's ever trusted to loosen the day a run keeps timing out. And a clean exit code isn't the same as a result that ships: the same **DRS Reviewer Agent** from **Agent Architectures & Tools** still checks the answer against evidence before that happens, and now that evidence can include how the answer was produced — whether the run stayed inside the sandbox, and how many patched retries it took to get there.

## The Hybrid IDE Workflow

None of this makes notebooks useless — it relocates them. A human still explores interactively in Jupyter or an IDE's interactive window, forming the hypothesis. Once the approach is decided, the agent's job is to write it as a clean script the sandbox can run deterministically, and the human reviews *that script's diff* in VS Code or Cursor, not a wall of cell-by-cell chat transcript. The notebook is where the idea gets found. The container is where it gets proven.

## Dressing Room Ground Rules

- **Keep the brain, the container, and the logs as three separate boundaries.** The model that decides what to run should never be the process that runs it, and a run's only permanent trace should be in logs or version control, not in memory the agent quietly carries forward.
- **Agents execute `.py` scripts in isolated containers, never a live notebook kernel.** No hidden globals, no out-of-order cell state to misread.
- **Every run gets a hard timeout.** A stuck loop should fail loudly and fast, not sit consuming compute until someone notices.
- **stdout and stderr are the ground truth, not the agent's summary of them.** Capture the raw output and let a human — or a reviewer agent — read it directly.
- **A failed run's traceback feeds the next attempt — up to a cap.** That's what makes patch-and-retry work without a human relaying the error by hand, and `max_attempts` is what stops a bad patch from chasing its own tail forever.
- **The sandbox's boundaries are the Director's to set, not the agent's to loosen.** `timeout`, `no network`, and `max_attempts` are fixed infrastructure, the same kind of rule as `leakage_cutoff` — an Executor that's free to widen them under pressure is exactly the trust problem sandboxing exists to solve.
- **A clean exit code isn't the same as a result that ships.** The DRS Reviewer Agent still checks the answer against evidence afterwards, and that evidence can include how it was produced, not just what it says.
- **The notebook is for finding the idea; the sandbox is for proving it.** Keep humans in the first, agents in the second, and review the script diff, not the chat log.
