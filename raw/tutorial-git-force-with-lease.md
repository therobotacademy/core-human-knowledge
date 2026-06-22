
## Tutorial: `git push --force-with-lease`

How to rewrite already-pushed history **safely** — without clobbering a teammate's (or a parallel session's) work.

This guide is grounded in a real case from this repo: the **one-commit-per-day** prompt-log hook (`push-prompt-log.ps1`), which amends the same daily commit all day long and therefore must force-push — but must never overwrite a commit someone else pushed in the meantime.

---

### TL;DR

* `git push` (plain) **refuses** to overwrite remote history. Good — it protects you.
* `git push --force` **overwrites it blindly**. Dangerous — it can erase commits you never saw.
* `git push --force-with-lease` overwrites **only if the remote is still where you last saw it**. If someone moved it, the push is **rejected** instead of destroying their work.

> Rule of thumb: **never type `--force`. Type `--force-with-lease`.**

---

### The problem it solves

A normal push only works as a **fast-forward** — the remote branch tip must be an *ancestor* of what you're pushing (you're only *adding* commits on top). If you **rewrote** history — `git commit --amend`, `git rebase`, `git reset` — your new commit is **not** a descendant of the remote tip, so:

```
$ git push
 ! [rejected]        master -> master (non-fast-forward)
error: failed to push some refs
hint: Updates were rejected because the tip of your current branch is behind...
```

Git is saying: *"accepting this would lose commits that are on the remote but not in your history."* To proceed you must force. The question is **which** force.

---

### Why plain `--force` is dangerous

`--force` means *"make the remote branch point at my commit, no matter what."* It does **zero** safety checks.

The classic disaster, with two people (or two Claude sessions) on one branch:

```
You:        fetched master at commit A, amended -> A'
Meanwhile:  a parallel session pushed a new commit B on top of A
You:        git push --force      # remote was A->B, now it's A'
                                  # commit B is GONE. Silently.
```

You never even saw `B`. `--force` deleted it. On a shared `master` this is how work vanishes.

---

### How `--force-with-lease` works (the "lease")

A **lease** is a promise: *"I believe the remote branch is still at commit X."* When you ran `git fetch`, Git recorded where the remote was — that's your **remote-tracking ref** (`origin/master`). `--force-with-lease` checks that promise *at push time*:

* **Remote still at X** (what you last fetched) → the push **succeeds**, overwriting as intended.
* **Remote moved to Y** (someone pushed) → your lease is **broken**, the push is **rejected**, nothing is destroyed.

```
$ git push --force-with-lease
 ! [rejected]   master -> master (stale info)
error: failed to push some refs
```

`stale info` is the lease firing. It just **saved you** from deleting someone's commit. You then `git fetch`, integrate their work (merge/rebase), and push again.

---

### When you actually need it

You need a force push **whenever you rewrite a commit that's already on the remote**:

* `git commit --amend` on a pushed commit (our daily-log hook does exactly this)
* `git rebase` of a pushed branch (squash, reword, reorder, drop)
* `git reset --hard <older>` then re-pushing

You do **not** need force for ordinary work — adding new commits and pushing is a plain fast-forward.

---

### The real example in this repo

`push-prompt-log.ps1` keeps **one commit per day** (`c1 daily <date>`). The first prompt of the day creates it; every later prompt **amends** it (rewriting an already-pushed commit) and re-pushes:

```powershell
if ($head -eq $msg) {
    # Today's commit is at HEAD: fold the new prompts into it.
    git commit --amend --no-edit *>$null
    # --force-with-lease aborts safely if a parallel session or the
    # cloud evaluator moved origin since our last fetch (never clobbers).
    git push --force-with-lease *>$null
} else {
    git commit -m $msg *>$null      # first commit of the day
    git push *>$null                # plain push: just a fast-forward
}
```

Why the lease is essential here:

* **Parallel sessions.** Several Claude sessions share this one repo and the same `master`. Two amend-and-push races are inevitable. The lease means the **loser of the race is rejected** (and retries later) rather than **erasing the winner**.
* **The cloud evaluator.** The nightly routine commits `eval: ...` and pushes to `master`. If it lands between our amend and our push, the lease catches it.

The hook's failure mode is intentionally gentle: on a rejected lease it simply **bails** (the commit stays local); the next `Stop` retries once the local copy has caught up.

---

### Step-by-step recipe (manual)

You amended a pushed commit and now need to update the remote:

```bash
# 1. Make sure your remote-tracking ref reflects reality.
git fetch origin

# 2. Confirm you're not about to stomp anything new:
git log --oneline origin/master..HEAD     # your commits not on remote
git log --oneline HEAD..origin/master     # remote commits not in yours  <-- want EMPTY

# 3. If line 2's second command is empty, push safely:
git push --force-with-lease

# 4. If it was NOT empty, integrate first, then push:
git pull --rebase        # or merge
git push --force-with-lease
```

---

### Gotchas

* **Don't `git fetch` immediately before a bare `--force-with-lease`.** Fetching *refreshes the lease* to the remote's newest value — so the lease can no longer detect the change it was meant to catch. Either inspect after fetching (recipe above) or pin the lease explicitly:
  ```bash
  git push --force-with-lease=master:<sha-you-expect>
  ```
* **It guards the *ref*, not the *working tree*.** `--force-with-lease` knows nothing about uncommitted local changes; it only compares the branch tip.
* **A newer, stronger option exists:** `git push --force-if-includes` (with `--force-with-lease`) also verifies your local history actually *contains* the remote commits you're about to overwrite — closing the "fetched-but-not-merged" hole. Use it where available.
* **Automated/background pushes** (hooks, CI) should *always* use `--force-with-lease`, never `--force` — there is no human watching to notice a silent overwrite.

---

### Cheat sheet

| Situation | Command |
|---|---|
| Add commits on top (normal) | `git push` |
| Amended/rebased a **pushed** commit | `git push --force-with-lease` |
| Lease rejected (`stale info`) | `git fetch` → `git rebase`/`merge` → `git push --force-with-lease` |
| Pin the expected remote tip | `git push --force-with-lease=<branch>:<sha>` |
| Strongest safety (modern git) | `git push --force-with-lease --force-if-includes` |
| **Never** | `git push --force` |

---

*Companion to `tutorial-git-worktree.md`. Real usage lives in `artifacts/Daily-Prompt-Evaluator/push-prompt-log.ps1`.*
