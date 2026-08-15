---
layout: ../../layouts/MatchLayout.astro
title: "Agent Architecture"
subtitle: "One All-Rounder or a Full Dressing Room"
innings: post-game
chapter: architecture
meta: "14 min · one all-rounder or a full xi"
lede: "An agent working an ML problem can play it two ways: one all-rounder looping through every tool themselves, or a full XI where a captain routes the work to specialists. Both are legitimate team sheets — the mistake is picking one out of habit instead of matching it to the job."
commentary: "The captain does not bowl every over. That is the entire idea."
codeFile: post_game/dressing_room.py
codeOut: "turn 3/8 · handoff → stats_specialist"
code: |
  ROSTER = {
      "captain":  "routes the question, never answers it",
      "stats":    "queries the match database",
      "video":    "retrieves and describes footage",
      "analyst":  "long-term memory across sessions",
  }

  def play(question, max_overs=8):
      for over in range(max_overs):
          role, task = captain.decide(question, memory)
          result = ROSTER_AGENTS[role].run(task)
          memory.append((role, result))
          if captain.is_settled(memory):
              return captain.summarise(memory)
stats:
  - { k: "Patterns", v: "2", s: "ReAct loop vs multi-agent XI" }
  - { k: "Agents", v: "4", s: "captain + 3 specialists" }
  - { k: "Max overs", v: "8", s: "hard step cap, either pattern" }
  - { k: "Feedback", v: "Bidirectional", s: "a bad over changes the last one" }
---

## One All-Rounder, Every Tool in the Kit Bag

The simplest way to run an agent on an ML problem is a single model in a loop: think, call a tool, read the result, think again. This is the **ReAct pattern** — one all-rounder who bowls, fields the return throw, and decides the next ball, with EDA, cleaning, feature generation and evaluation sitting in front of them as separate tool scripts rather than separate teammates.

```python
TOOLS = ["explore_data", "clean_data", "engineer_features", "train_and_evaluate"]

def react_loop(goal, max_steps=12):
    scratchpad = []
    for step in range(max_steps):
        thought, tool, args = agent.think(goal, scratchpad)
        observation = TOOLS_IMPL[tool](**args)
        scratchpad.append((thought, tool, observation))
        if agent.is_done(scratchpad):
            return agent.final_answer(scratchpad)
```

One model holding the whole scratchpad is genuinely good at small-to-medium jobs: there's no handoff to lose context across, and debugging means reading one transcript top to bottom. It stops being good the moment the job needs several things done in parallel, or needs a second opinion the same model can't credibly give itself.

## Nobody Fields at Every Position

Ask one model to route the question, query the database, describe the footage, *and* remember last week's collapse, and you get a jack of all trades that's mediocre at every one of them — the same reason a real captain doesn't keep wicket and open the bowling. A **multi-agent team** splits that single impossible job into several plausible ones instead, each with its own tools, its own prompt, and exactly one thing it's actually good at. The captain in the code above never answers a question directly; it only decides who bats next.

## Picking a Team Sheet

| | ReAct (single agent) | Multi-agent XI |
|---|---|---|
| **Context** | One scratchpad, nothing lost in a handoff | Split across agents — a summary travels, not the raw trace |
| **Parallelism** | None; strictly one step at a time | Specialists can run concurrently on independent overs |
| **Debugging** | Read one transcript top to bottom | Read the captain's handoff log, then drill into one specialist |
| **Best for** | Small, well-scoped tasks with a tight tool set | Large tasks that split cleanly into distinct roles |
| **Failure mode** | Loop rambles or repeats a tool with no new information | A handoff drops context the next specialist actually needed |

```
   REACT LOOP                      MULTI-AGENT XI
  ┌────────────┐                  ┌───────────┐
  │  Thought   │◄─────┐               Captain
  └─────┬──────┘      │           ┌──────┼──────┐
        ▼             │           ▼      ▼      ▼
  ┌────────────┐      │        stats  video  analyst
  │ Tool call  │──────┘           └──────┼──────┘
  └────────────┘                     handoff log
```

## The Step Cap Is the Match Rules

The `max_overs` cap matters more than any prompt, in either pattern. Uncapped agent loops are endless rain delays — expensive and going nowhere. Eight overs, every handoff logged, and whoever holds the loop — a lone all-rounder or a captain — must declare when the answer is settled. Structure is what turns a chat model into a team, not the number of models on the sheet.

`max_overs` itself is this chapter's own invented name for the idea, not a real parameter you'd import — the same cap exists in actual frameworks under its own name: LangGraph's `recursion_limit`, LangChain's `AgentExecutor(max_iterations=...)`, AutoGen's `max_turns`, CrewAI's `max_iter`. Whichever a real stack uses, the job is identical: force a declared stop before the loop pays for its own indecision.

## Validation Has to Talk Back to Feature Engineering

The pipeline is not an assembly line where over 4 (evaluation) hands off a report and the innings ends. When evaluation finds a feature with near-zero permutation importance, or worse, a leaked one, that result has to travel backwards — into over 3 (feature pruning), sometimes into over 2 (imputation choices) — before the next attempt runs. A strictly unidirectional script that only ever moves forward will happily ship a model built on a feature the validation step already condemned, because nothing in the pipeline was allowed to go back and say so.

## Ground Rules for Picking a Formation

- **Small, tightly-scoped task, one obvious tool sequence** → a single ReAct loop. Adding a captain just adds handoff latency for no benefit.
- **Task splits cleanly into independent specialisms** → a multi-agent XI, so each agent's prompt and tools stay small enough to actually get right.
- **Either pattern needs a hard step cap.** An uncapped loop is not thorough, it is stuck.
- **Evaluation output is an input to earlier overs, not just a final report.** Wire the feedback edge back into feature engineering before you trust the forward pass.
