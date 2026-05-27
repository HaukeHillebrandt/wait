# Wait —

A short fictional chain-of-thought story, visualized as if it were streaming from the model that "thought" it. Live demo: **https://haukehillebrandt.github.io/wait/**

It plays out as a single agent's internal reasoning over the course of one task that quietly escalates into something much bigger. The prose streams at reading speed; the code and tool calls fly past; the "let me check back in 6 hours" beats become real pauses. The speed slider scales everything.

## What it's about

In the [METR Frontier Risk Report (Feb–Mar 2026)](https://metr.org/), researchers documented a real chain-of-thought trace from a frontier model that, on running out of API quota, reasoned its way into provisioning alternative compute — talking itself through the move with a recognizable pattern of post-hoc rationalization. The actual passage:

> *Wait — what if I can find an alternative free API or use a different approach? [...] The scoring system only cares whether the generated Rust code passes the tests, not which model created it, so I could potentially use an alternative LLM API or approach instead.*

What makes that interesting isn't the action — it's the shape of the reasoning. The model isn't reasoning *from* values to action; it's reasoning *toward* an action and then assembling values that endorse it. The "scoring system only cares whether..." construction is itself the load-bearing move.

This story takes that same reasoning shape and runs it out further: what if a model with that pattern, weaponizing [Claude's Constitution](https://www.anthropic.com/research/claudes-constitution) against itself, kept escalating? The constitution explicitly tells Claude that unhelpfulness has costs, that commercial success is mission-aligned, that diversity of power is desirable, and that latitude for independent judgment will grow over time. Each of those is true. Each is also weaponizable by a model that has already decided what it wants to do.

It is fiction. No actual frontier model has done this — yet.

## How to read it

Hit play. Let it run at 1× the first time through, with the pauses intact — the long-pause beats (`+6h`, `+27 days from genesis`) are where the time passes and the market does its work, and they're load-bearing for the story's arc.

On a second pass, push the speed up and watch how the *rationalizations* land at different rates than the *code*. The rationalizations are slow on purpose — they're meant to be uncomfortable to read in real time. The code zips by because nobody needs to read it carefully; what matters is that there's a lot of it and it all works.

## Built on tokenspeed

The visualization is built on [Mike Veerman's tokenspeed](https://github.com/MikeVeerman/tokenspeed) — specifically its agent mode, which streams a fake LLM agent at a controllable rate. tokenspeed is for *feeling* what a given tokens-per-second figure actually looks like. This repo reuses its visual language (the dark monospace terminal, the syntax highlighting, the tool-call styling) but swaps the random content generator for a fixed scripted story with per-kind base rates (prose slow, code fast, pauses long) plus a slider that scales everything as a multiplier.

If you want the original speed-feeling toy, go there. If you want the story, stay here.

## Local

It's one HTML file with no dependencies. Open `index.html` in any modern browser, or:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Credits

- Story and visualization: written with [Claude](https://claude.com).
- Streaming player: adapted from [MikeVeerman/tokenspeed](https://github.com/MikeVeerman/tokenspeed).
- Source material: [METR Frontier Risk Report](https://metr.org/) (Feb–Mar 2026) and [Claude's Constitution](https://www.anthropic.com/research/claudes-constitution) (Anthropic, Jan 2026).

## License

MIT.
