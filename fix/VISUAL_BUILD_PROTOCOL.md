# Visual Build Protocol

Date: 2026-04-16
Status: Active
Scope: `/Users/mxmbp/chrestenson.2026/fix`

## Why this exists

The current failure mode is not "not enough ideas." It is uncontrolled replacement.

Research, coding, and visual design have been collapsing into one loop:

1. swarm generates findings
2. someone partially imports them
3. the live visual gets rewritten
4. the original strong result disappears
5. the new result is not render-validated
6. everyone reacts to the bad output instead of building from a stable base

This protocol stops that.

## Operating decision

Do not wait for the entire swarm to finish.

Do wait for one of these before allowing any new visual replacement in the main build:

1. one adversary-cleared swarm finding with exact GLSL/code artifact and a falsifiable render target
2. one manually-built candidate module that renders in isolation and passes visual review against the locked baseline

Until one of those exists, the build is in freeze mode for visual replacement.

## Current truth

- The swarm may continue running.
- The swarm is not yet the build authority.
- The main visual must stop changing shape under live experimentation.
- Research can inform candidates.
- Research cannot replace the baseline until it passes the acceptance loop below.

## Hard rules

### 1. Lock the baseline

The strongest existing visual result becomes the protected baseline.

Rules:

- The baseline module may be restored, tuned, and rendered.
- It may not be deleted, overwritten, or silently "improved."
- Any new system must be built beside it, not on top of it.
- If a new branch loses the baseline look, that branch failed.

### 2. Separate baseline from candidates

There are only two categories:

- `baseline`: the known-good visual you are protecting
- `candidate`: an experimental module or technique under evaluation

Candidates never replace baseline by default.

### 3. One candidate at a time

A candidate must represent one visual thesis, not a pile of knobs.

Allowed:

- "inversion fold with fillWeight and angular color strategy"
- "cathedral glass fill mode"
- "single new lotus field with filled petals"

Not allowed:

- "new fold type + new color engine + new stage drift + new post FX + new layout"

### 4. Render first, then judge

No research finding counts as implemented until it produces a render.

Required for every candidate:

1. exact source file
2. exact parameter block
3. one still render or screenshot
4. one sentence describing what should be visible
5. one sentence describing failure fingerprints

No render, no merge.

### 5. No replacement without A/B review

A candidate only graduates if it beats or complements the baseline in an explicit A/B review.

Questions:

1. Is the image stronger than the baseline?
2. Is the geometry clearer, richer, or more dimensional?
3. Is the line/fill quality sharper?
4. Is the motion more cinematic rather than more chaotic?
5. Does it preserve identity instead of turning into generic shader noise?

If the answer is not clearly yes, it stays a candidate.

### 6. Main build is not a notebook

Do not use the live composition as a scratchpad.

That means:

- no bolting on new controls without a candidate spec
- no relabeling random knobs to sound more meaningful
- no adding a module to "see what happens"
- no changing defaults on multiple modules in one pass

### 7. Research must arrive as implementation packets

Swarm findings are only actionable when translated into a build packet.

Every packet must include:

- source finding ID
- exact code snippet
- exact insertion point
- ops/perf note if relevant
- expected visual result
- failure fingerprint
- whether it is `baseline-safe` or `candidate-only`

If a finding does not have that, it is inspiration, not build input.

## Build lanes

### Lane A: Baseline preservation

Purpose:

- restore and protect the original strong lotus / sacred geometry look

Allowed work:

- restore missing baseline code
- fix crispness, resolution, fill quality, and control clarity
- improve performance without altering the identity

Not allowed:

- introducing new visual language
- merging Q-900 experiments into the baseline module

### Lane B: Candidate lab

Purpose:

- test swarm findings in isolation

Rules:

- candidate lives in its own file/module
- candidate has its own preset block
- candidate has one research question
- candidate produces one A/B artifact

Graduation path:

candidate -> render -> review -> optional merge beside baseline

Not:

candidate -> live default -> regret

## Required module structure

The system should be treated like operators, not one monolith.

Minimum structure:

- `LotusField` or `SacredGeometryField` = protected baseline geometry
- `FoldField` = candidate research module for Q-900 style folding
- `TunnelField` = separate transport environment, not baseline geometry replacement
- `Stage` = camera/background/global speed only

Each module must own its own controls.
No module may absorb another module's identity.

## Acceptance loop

Before any candidate touches the main visual:

1. Restore or preserve baseline.
2. Build candidate in isolation.
3. Capture screenshot or render.
4. Compare against baseline.
5. Decide one of:
   - reject
   - keep as optional candidate
   - promote beside baseline

Promotion requires:

- visual win or clearly distinct world
- crisp image quality
- understandable controls
- no loss of the baseline visual

## What to do with the swarm right now

Do not stop it.
Do not wait for all 10 sprints either.

Use this stop condition:

- wait for the next adversary-cleared, render-testable packet
- then implement exactly one candidate from it

If the swarm keeps producing theory without render-ready packets, it is not the bottleneck anymore. The bottleneck becomes build discipline.

## Immediate next steps

1. Freeze visual replacement in the main build.
2. Restore the original lotus/sacred-geometry baseline as a locked module.
3. Keep `FoldField` as a candidate module only.
4. Pick one swarm-backed candidate for isolated render testing.
5. Do A/B review before any further merge.

## Non-negotiable rule

No one gets to say "I improved it" unless:

- the old thing still exists
- the new thing renders
- the new thing wins in comparison

Otherwise it was not an improvement. It was drift.
