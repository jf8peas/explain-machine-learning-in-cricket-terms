---
layout: ../../layouts/MatchLayout.astro
title: "Agent Architectures & Tools"
subtitle: "Two Architectures, and the Reviewer That Checks Both"
innings: post-game
chapter: agent-architectures-and-tools
meta: "20 min · two architectures, one quality gate"
lede: "An agent working an ML problem can produce an answer two ways: one all-rounder looping through every tool alone, or a full XI where a captain routes work to specialists. Neither is complete on its own — the DRS Reviewer Agent checks whichever one you used before the answer is allowed to ship. Two team sheets, one quality gate; skip the gate and you're shipping verdicts nobody checked."
commentary: "'The kit man doesn't set the batting order, and the third umpire doesn't bat. The reviewer's only job is checking the others' work.' — Data Analyst"
codeFile: post_game/agent_patterns.py
codeOut: "turn 4/8 · handoff → validator · verdict: upheld"
code: |
  ROSTER = {
      "captain":       "routes the question, never answers it",
      "data_engineer": "cleans data, engineers features",
      "ml_scientist":  "trains and tunes candidate models",
      "validator":     "checks metrics, flags leakage",
  }

  def play(question, max_overs=8):
      for over in range(max_overs):
          role, task = captain.decide(question, memory)
          result = ROSTER_AGENTS[role].run(task)
          memory.append((role, result))
          if captain.is_settled(memory):
              return captain.summarise(memory)
stats:
  - { k: "Architectures", v: "2", s: "ReAct loop · multi-agent XI" }
  - { k: "Agents", v: "4", s: "captain + data-eng + ml-sci + validator" }
  - { k: "Tool timeout", v: "5s", s: "hard limit per call" }
  - { k: "Reviewer verdicts", v: "3", s: "upheld · overturned · umpire's call" }
---

## Two Architectures, and a Quality Gate

Every agentic ML workflow you'll meet is built from **two architectures for producing an answer**, plus **one quality gate for checking it**. **One all-rounder** loops through every tool themselves. **A multi-agent XI** splits the work across a captain and specialists. Those are the two choices — pick whichever matches the job. What's not a third choice is the **DRS Reviewer Agent**: it doesn't produce an answer of its own, it sits downstream of whichever architecture you picked and checks the answer before it ships. Skip it, and either architecture can still confidently hand you something wrong.

## Architecture One: One All-Rounder, Every Tool in the Kit Bag

The simplest way to run an agent on an ML problem is a single model in a loop: think, call a tool, read the result, think again. This is the **ReAct pattern** — one all-rounder who bowls, fields the return throw, and decides the next ball, with a small set of well-defined tools sitting in front of them rather than separate teammates.

```python
TOOLS = ["match_stats", "eda_tool", "train_eval_tool"]

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

## The Schema Is the Job Description

None of the agent tools of `match_stats`, `eda_tool`, or `train_eval_tool` are safe to hand an agent as bare functions. A **tool definition** is three things: a name the model can call, a **description** written like instructions to a debutant, and a schema that makes bad calls unrepresentable.

```python
TOOLS_SCHEMA = [
    {
        "name": "match_stats",
        "description": "Return per-over runs and wickets for one match id. Read-only.",
        "input_schema": {
            "type": "object",
            "properties": {"match_id": {"type": "string"}},
            "required": ["match_id"],
        },
    },
]

def match_stats(match_id, timeout=5, limit=50):
    return db.readonly.query(OVER_SQL, match_id, timeout=timeout)[:limit]
```

Three boundaries matter on every tool, regardless of which pattern calls it:

- **A timeout.** Models are enthusiastic and occasionally wrong in expensive ways; five seconds is the boundary rope that keeps a stuck query from becoming a stuck agent.
- **A row cap.** `[:limit]` stops a reasonable question ("show me the over-by-over breakdown") from becoming an unreasonable answer (every ball this decade).
- **Read-only, always.** A tool an agent calls to *understand* the data should never be a tool that can *change* it. If the model keeps misusing a tool, the description is vague — fix the words before you fix the model.

## Architecture Two: Nobody Fields at Every Position

Ask one model to route the question, clean the data, train the model, *and* validate the metrics, and you get a jack of all trades that's mediocre at every one of them — the same reason a real captain doesn't keep wicket and open the bowling. A **multi-agent team** splits that single impossible job into several plausible ones instead, each with its own tools, its own prompt, and exactly one thing it's actually good at.

The roster in this chapter's frontmatter names four: a **captain** who never answers directly, only routes and judges when the group's answer is settled; a **data engineer agent** who owns cleaning and feature generation; an **ML scientist agent** who owns training and tuning candidate models; and a **validator agent** whose only job is checking the other two's work before anything ships.

## Why Assembly Lines Fail

The pipeline above is not an assembly line where the validator hands back a report and the innings ends. When the validator finds a feature with near-zero permutation importance, or worse, a leaked one, that result has to travel **backwards** — into the data engineer's feature pruning, sometimes into imputation choices — before the ML scientist's next attempt runs. A strictly unidirectional handoff chain that only ever moves forward will happily ship a model built on a feature the validator already condemned, because nothing in the pipeline was allowed to go back and say so.

## Getting Better, Not Just Getting Corrected

The validator catching a leaked feature and sending it back to the data engineer fixes *this* run. It doesn't make the data engineer agent any sharper on the next one — nothing about that exchange persists once the innings ends, unless something is deliberately built to carry it forward.

An agent in this roster actually gets better at its role through a handful of levers, none of which involve retraining the underlying model mid-season:

- **Sharper instructions.** A human — or a captain reviewing a string of failures — tightens the agent's system prompt. This is the lever pulled most often in production: not a smarter model, a better job description.
- **Better tools.** A more precisely-scoped tool, per the schema rules above, often improves an agent's effective performance more than any prompt rewrite would.
- **Few-shot examples.** Worked examples of a good feature-pruning call versus a bad one, added straight into the prompt, teach the pattern in-context without touching a single weight. These live in a small, version-controlled file next to the agent's own prompt — curated once by a human, not regenerated per run.
- **Persistent memory.** A running log of past decisions and their outcomes that the agent can retrieve on its next task — closer to real learning, since it accumulates on its own rather than needing a human to keep rewriting the prompt.
- **Fine-tuning.** The heaviest lever, and the rarest in practice: with enough labelled examples of good decisions for one specific role, that role's model can be fine-tuned directly.

Neither of the first two lives inside the agent's own context window, because nothing there survives past the task it was created for. Few-shot examples sit in that version-controlled file, loaded fresh at startup. A memory log belongs in a durable store outside the conversation entirely — a flat file or database table while it's small, a vector store once it's large enough that the agent needs to retrieve only the handful of entries most relevant to the task in front of it, not replay its whole history. That's the same discipline **Classical vs Deep Learning Agents**' Context Window Hygiene section teaches for training logs, applied to a different kind of history: write everything durably, read back only the relevant slice.

None of this happens by default. A multi-agent team that never revisits its agents' prompts, tools, or memory is running the same XI, unchanged, all season — however many times the validator sends a feature back.

## Picking a Team Sheet

| | ReAct (single agent) | Multi-agent XI |
|---|---|---|
| **Context** | One scratchpad, nothing lost in a handoff | Split across agents — a summary travels, not the raw trace |
| **Handoffs** | None; strictly one step at a time | Captain → specialist → validator, logged at every step |
| **Debugging** | Read one transcript top to bottom | Read the captain's handoff log, then drill into one specialist |
| **Best for** | Small, well-scoped tasks with a tight tool set | Large tasks that split cleanly into distinct roles |
| **Failure mode** | Loop rambles or repeats a tool with no new information | A handoff drops context the next specialist actually needed |

## The Step Cap Is the Match Rules

`max_overs` in this chapter's frontmatter code matters more than any prompt, in either pattern. Uncapped agent loops are endless rain delays — expensive and going nowhere. Eight overs, every handoff logged, and whoever holds the loop — a lone all-rounder or a captain — must declare when the answer is settled. Structure is what turns a chat model into a team, not the number of models on the sheet.

## The Quality Gate: The DRS Reviewer Agent

This isn't a third architecture sitting next to the other two — it doesn't compete with them for the job of producing an answer, and it isn't running while they run. The **DRS Reviewer Agent** only switches on once the ReAct loop or the multi-agent XI has already finished and handed over a result. Its entire job is to check that one finished answer against the evidence, not to help make it.

DRS exists because confident officials are sometimes wrong. An **LLM-as-judge reviewer agent** is the same institution in software: a second model whose only job is to check the first one's — or the whole XI's — work against the evidence, not against how confident it sounds.

```python
VERDICTS = ("upheld", "overturned", "umpires_call")

def review(question, answer, evidence):
    verdict = reviewer.judge(
        question=question,
        answer=answer,
        evidence=evidence,        # the footage, not the opinion
        allowed=VERDICTS,
    )
    if verdict == "overturned":
        return primary.retry(question, hint=reviewer.reason)
    if verdict == "umpires_call":
        return escalate_to_human(question, answer, evidence)
    return answer
```

The reviewer never sees the primary agent's confidence or chain of thought — only the question, the answer, and the retrieved evidence. Like the third umpire, it rules on the footage, not the appeal. Confining the verdicts to a fixed list keeps the review inside the laws of the game.

The most important verdict is the honest shrug. When the evidence cannot settle it, **umpire's call escalates to a human** rather than guessing with extra steps. A review layer that is not allowed to say "insufficient evidence" will eventually invent some, and that is how confident nonsense gets into production.

## The Whole Workflow, Ball by Ball

```
      EITHER PRODUCTION PATTERN
   (ReAct loop, or Captain + specialists)
                    │
                    ▼
           answer + evidence
                    │
                    ▼
     [ DRS REVIEWER: reviewer.judge(...) ]
                    │
                    ▼
   upheld       →  ship the answer
   overturned   →  retry, with the reviewer's reason as a hint
   umpire's call → escalate to a human
```

Either production pattern — one all-rounder or a full XI — feeds the same gate on the way out. The gate is what turns "an agent produced an answer" into "an answer somebody actually checked."

## Ground Rules for Picking a Formation

- **Small, tightly-scoped task, one obvious tool sequence** → a single ReAct loop. Adding a captain just adds handoff latency for no benefit.
- **Task splits cleanly into independent specialisms** → a multi-agent XI, so each agent's prompt and tools stay small enough to actually get right.
- **Every tool gets a timeout, a row cap, and read-only access.** The model decides *when* to call a tool. The tool decides what calling it is allowed to mean.
- **Either pattern needs a hard step cap.** An uncapped loop is not thorough, it is stuck.
- **Validator output is an input to earlier steps, not just a final report.** Wire the feedback edge back into feature engineering before you trust the forward pass.
- **A correction fixes one run; it doesn't upskill the agent.** Sharper prompts, better tools, few-shot examples, memory, or fine-tuning are what actually make an agent better next time — not the validator sending something back this time.
- **The DRS Reviewer Agent isn't a third architecture — it's quality control for whichever one you used.** It never produces an answer itself; it only checks one, after the fact, against the evidence.
- **A reviewer judges evidence, not confidence**, and is allowed to say "insufficient evidence" — that's what turns umpire's call into a feature instead of a crash.
