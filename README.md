<img src="public/logo-small.png" alt="Automaton Simulator logo" width="96">

# Automaton Simulator

A React web app for drawing Turing-machine-style automata as state diagrams and watching them run step by step on a tape. I built it in 2020, while learning React and taking a class on the theory of computation.

**Try it: [rodrigohpalmeirim.github.io/automaton-simulator](https://rodrigohpalmeirim.github.io/automaton-simulator/)**

## Features

- **Diagram editor**: right-click the canvas to add states, <kbd>Shift</kbd>-drag from a state to create a transition, drag arrow labels to curve them, and drag the background to pan. Self-loops are supported.
- **Transitions** hold three values: the character read, the character written, and a head move (`L`, `R` or `S` for stay).
- **State types**: mark any state as the start, accept or reject state from its context menu. The active state is highlighted while running (green for accept, red for reject).
- **Tape**: an unbounded, editable tape you can scroll by dragging.
- **Simulation**: start and stop with <kbd>Space</kbd> (or <kbd>Esc</kbd> to stop), at ×½, ×1, ×2, ×5 or ×∞ speed.
- **JSON pane** (<kbd>J</kbd>): the whole automaton and tape as editable JSON, kept in sync with the diagram. Invalid edits are ignored unless "free edit" mode is on; <kbd>Ctrl</kbd>+<kbd>S</kbd> applies and <kbd>Ctrl</kbd>+<kbd>C</kbd> copies it.
- **Files**: import/export automata as `.json`; the current automaton is autosaved to `localStorage`.
- **Help pane** (<kbd>H</kbd>) with two built-in examples: *Bouncer* and *Binary counter*.

The simulator is deterministic: a state can't have two transitions for the same character.

## Tech stack

React 16 (Create React App) with an SVG canvas, Font Awesome icons, and `gh-pages` for deployment to GitHub Pages.

## Run locally

```sh
git clone https://github.com/rodrigohpalmeirim/automaton-simulator.git
cd automaton-simulator
npm install
npm start        # dev server on http://localhost:3000
npm run build    # production build in build/
npm run deploy   # publish build/ to GitHub Pages
```

The project uses `react-scripts` 3 (webpack 4). On Node.js 17 or newer, prefix the commands with `NODE_OPTIONS=--openssl-legacy-provider`.
