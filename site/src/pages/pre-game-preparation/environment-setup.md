---
layout: ../../layouts/MatchLayout.astro
title: "Environment Setup: Preparing the Pitch"
innings: pre-game-preparation
chapter: environment-setup
meta: "7 min · ground preparation"
lede: "Before a ball is bowled, the groundskeeper prepares the deck. Setting up your development environment is no different — whether you are commissioning a high-performance Grace Blackwell server or tuning your local laptop, you need a reliable pitch, crisp lines, and sharp spikes."
commentary: "'You don't start a Test match on an unploughed field. Get your pitch right, and the ball will carry straight.' — Head Groundskeeper"
codeFile: ground_prep.sh
codeOut: "pitch ready · 1 shared conda env · vectorized SIMD active"
code: |
  # Ground Prep: Registering the Global Pitch in Cursor
  mkdir -p .vscode && cat << 'EOF' > .vscode/settings.json
  {
    "python.defaultInterpreterPath": "/opt/miniconda/envs/gb_global/bin/python",
    "python.condaPath": "/opt/miniconda/condabin/conda",
    "python.venvPath": "/opt/miniconda/envs"
  }
  EOF
stats:
  - { k: "Server Pitch", v: "Grace Blackwell", s: "shared global env" }
  - { k: "Local Nets", v: "PC / Mac", s: "Jupyter + NumPy" }
  - { k: "Engine", v: "Vectorized", s: "SIMD/CUDA execution" }
  - { k: "IDE Wire", v: "Cursor", s: "Remote-SSH connected" }
---

A groundskeeper arrives long before the players. The roller comes out, the creases get painted, the stumps go in straight. By the time the first ball is bowled, nobody thinks about the pitch — and that is exactly the point. A well-prepared deck is invisible.

Your development environment works the same way. Spend an hour now rolling it flat, and you will never think about it again. Skip it, and every notebook you open will bounce unpredictably.

## Rolling the Pitch: The Shared Central Environment

For the experiments in this course, I worked on a Grace Blackwell server. Rather than let every project dig its own patch of turf, I rolled **one** central pitch that every notebook, script, and session shares.

The environment lives at `/opt/miniconda/envs/gb_global` — outside any home directory, so it belongs to the ground, not to a single player.

```bash
# Create the shared pitch
sudo /opt/miniconda/bin/conda create -p /opt/miniconda/envs/gb_global python=3.11 -y

# Hand the keys to the 'conda' group
sudo groupadd -f conda
sudo chgrp -R conda /opt/miniconda/envs/gb_global
sudo chmod -R 775 /opt/miniconda/envs/gb_global

# Add yourself to the groundstaff
sudo usermod -aG conda $USER
```

The `775` permission is the important stroke. Owner and group get read, write, and execute; everyone else gets to watch from the stands. Any member of the `conda` group can `pip install` a new package and the whole team sees it immediately — no duplicated environments, no "works on my machine."

```bash
# Activate and install the core kit
source /opt/miniconda/bin/activate /opt/miniconda/envs/gb_global
pip install numpy pandas jupyterlab ipykernel jupysql duckdb-engine
```

### Your Own Backyard

Here is the part that matters most to you: **you do not need a Grace Blackwell server.**

Grace Blackwell was my playing area — the ground I happened to have access to for experimentation and learning. Yours will look different, and that is entirely fine. A backyard with a tennis ball and a taped-up wall has produced more cricketers than any Test venue ever has.

What you need is a playing area that suits *your* hardware:

- **Windows PC** — Anaconda or Miniconda works cleanly. Install, open the Anaconda Prompt, and create a named environment.
- **macOS (Apple Silicon or Intel)** — Miniconda, or Homebrew's Python plus a virtual environment.
- **Linux desktop or laptop** — Miniconda, or the system Python with `venv`.

The simplest possible pitch, on any of the three:

```bash
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

pip install numpy pandas jupyterlab ipykernel
```

Installers and paths change often, and your machine has its own quirks. Search online for a setup guide matched to your exact operating system and chip — "Miniconda install Apple Silicon" or "Anaconda install Windows 11" — and follow a current one. The rest of this course only assumes you can activate an environment and open a notebook. Wherever that environment lives is your business.

## Laying the Cones & Crease Lines: Wiring Cursor via Remote-SSH

A pitch with no crease lines is just a strip of grass. The lines tell everyone where to stand.

If you are working on a remote machine, Cursor's **Remote-SSH** extension is what carries you out to the middle. But once connected, Cursor still needs to be told which interpreter counts. Left to guess, it will pick the system Python and none of your packages will resolve.

Drop a `.vscode/settings.json` into the project root, on the remote machine:

```json
{
  "python.defaultInterpreterPath": "/opt/miniconda/envs/gb_global/bin/python",
  "python.condaPath": "/opt/miniconda/condabin/conda",
  "python.venvPath": "/opt/miniconda/envs"
}
```

Three lines, three jobs:

- `python.defaultInterpreterPath` — the crease itself. Every new terminal and notebook starts here.
- `python.condaPath` — tells Cursor where the `conda` executable lives so activation commands actually fire.
- `python.venvPath` — the directory Cursor scans when you open the interpreter picker, so sibling environments show up in the list.

Working locally instead? Same file, different path. Point `python.defaultInterpreterPath` at `.venv/bin/python` (or `.venv\Scripts\python.exe` on Windows) and you get identical behaviour without the SSH hop.

Reload the window after saving. The status bar should now show your environment name — that is your confirmation the lines are painted.

## Setting the Stumps: Auto-Starting Notebook Utilities

The stumps go in last, and they go in the same place every single match. No batter walks out and asks where the stumps are.

Two pieces of setup give you that consistency.

**First, register the kernel** so Jupyter and Cursor can see the environment by name:

```bash
source /opt/miniconda/bin/activate /opt/miniconda/envs/gb_global
python -m ipykernel install --prefix=/opt/miniconda/envs/gb_global \
  --name gb_global --display-name "Python (gb_global)"
```

**Second, automate the boilerplate.** IPython runs any `.py` file it finds in its startup directory before your first cell executes. Use that to load SQL support automatically:

```bash
mkdir -p /opt/miniconda/envs/gb_global/etc/ipython/startup
```

Create `/opt/miniconda/envs/gb_global/etc/ipython/startup/00-start-sql.py`:

```python
# 00-start-sql.py — stumps in the ground before the first ball
try:
    ip = get_ipython()
    ip.run_line_magic("load_ext", "sql")

    # Silence the JupySQL style deprecation warning
    from sql.magic import SqlMagic
    SqlMagic.style = "_DEPRECATED_DEFAULT"

except Exception as e:
    print(f"[startup] SQL magic not loaded: {e}")
```

The `00-` prefix controls ordering — files run alphabetically, so numbered prefixes let you sequence multiple startup scripts later. The `try/except` matters too: if `jupysql` is not installed yet, you get a one-line note instead of a broken kernel.

From now on, `%%sql` works in the first cell of any notebook. No `%load_ext` incantation, no deprecation noise.

## Painting the Bowling Markers: Fast Vectorized Execution

Everything above is convenience. This section is not.

**The single most important rule for any playing area — Grace Blackwell, a Windows desktop, a MacBook Air — is that your NumPy must be vectorized.**

NumPy is only fast when it is compiled against an optimised linear algebra backend: BLAS and LAPACK implementations such as OpenBLAS or Intel MKL, or Apple's Accelerate framework on macOS. These backends hand your array operations to SIMD instructions that process multiple numbers per CPU cycle, across multiple cores. A NumPy built without them falls back to a naive reference implementation and can be an order of magnitude slower — sometimes worse — on exactly the matrix work this course depends on.

Check what you have:

```bash
python -c "import numpy as np; np.show_config()"
```

You want to see `openblas`, `mkl`, or `accelerate` in the output. If the backend section is empty or reports a generic fallback, reinstall NumPy from `conda-forge` or from a proper wheel rather than building from source.

### Why the Loop Loses

The difference is not stylistic. Consider summing a million values:

```python
import numpy as np

data = np.random.rand(1_000_000)

# The slow single — Python interprets every iteration
total = 0.0
for x in data:
    total += x

# The vectorized drive — one call into compiled C
total = data.sum()
```

The loop pays the Python interpreter's overhead a million times: box the value, dispatch the operator, unbox, repeat. The vectorized call crosses into compiled code **once**, then runs a tight machine-code loop over contiguous memory with SIMD registers doing several additions at a time.

Matrix multiplication makes the gap wider still:

```python
A = np.random.rand(1000, 1000)
B = np.random.rand(1000, 1000)

C = A @ B   # dispatched straight to BLAS
```

That single `@` operator triggers a cache-blocked, multithreaded, SIMD-optimised routine that decades of numerical computing have refined. Hand-writing the equivalent triple `for` loop in Python is not a hundred times slower — it is thousands.

The habit to build, from your very first notebook: **if you are writing a `for` loop over a NumPy array, stop and look for the array operation that replaces it.** Slicing, broadcasting, `np.where`, masked assignment, and the `@` operator cover the overwhelming majority of cases.

Learning this on a laptop is fine. The techniques transfer upward without modification — the same vectorized code that runs well on your MacBook is the code that scales onto CUDA-backed hardware later.

## The Final Match-Day Workflow

Ground prepared, lines painted, stumps set. Match day is three steps.

**1. Walk out to the middle.**

Remote setup — open Cursor, run `Remote-SSH: Connect to Host`, and open your project folder. Local setup — open the project in Cursor or launch JupyterLab directly:

```bash
source .venv/bin/activate   # or: conda activate your_env
jupyter lab
```

**2. Take guard — pick the kernel.**

Open your notebook, click the kernel selector in the top right, and choose **Python (gb_global)** or your local environment. This is the one step that catches people out. Wrong kernel means wrong packages, and the error message rarely says so.

**3. Face the first ball.**

Run your cells. Because the startup script has already fired, `%%sql` is live immediately:

```python
%sql duckdb://

%%sql
SELECT 'pitch ready' AS status, version() AS engine;
```

If that returns a row, the ground is prepared and the match can begin.

---

**Quick check before you move on:**

- `np.show_config()` names a real BLAS backend
- Your kernel appears in the Jupyter kernel list by name
- `%%sql` runs in a fresh notebook with no `%load_ext` line
- Your interpreter path shows in the Cursor status bar

Four green ticks and the deck is rolled. Next innings, we bat.