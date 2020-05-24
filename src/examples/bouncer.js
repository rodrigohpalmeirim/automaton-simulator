export const bouncer = `{
  "startState": "q0",
  "nodes": {
      "q0": {
      "x": 500,
      "y": 350,
      "connections": {
          "": {
          "node": "q0",
          "newChar": "",
          "move": "L",
          "arrowCurve": 0
          },
          "|": {
          "node": "q1",
          "newChar": "|",
          "move": "R",
          "arrowCurve": 25
          }
      }
      },
      "q1": {
      "x": 750,
      "y": 350,
      "connections": {
          "|": {
          "node": "q0",
          "newChar": "|",
          "move": "L",
          "arrowCurve": 25
          },
          "": {
          "node": "q1",
          "newChar": "",
          "move": "R",
          "arrowCurve": 0
          }
      }
      }
  },
  "tape": {
      "string": "|     |",
      "startPos": 3
  }
}`