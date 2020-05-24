export const binaryCounter = `{
  "startState": "q0",
  "nodes": {
    "q0": {
      "x": 500,
      "y": 350,
      "connections": {
        "0": {
          "node": "q1",
          "newChar": "1",
          "move": "R",
          "arrowCurve": 50
        },
        "1": {
          "node": "q0",
          "newChar": "0",
          "move": "L",
          "arrowCurve": 0
        },
        "": {
          "node": "q1",
          "newChar": "1",
          "move": "R",
          "arrowCurve": 25
        }
      }
    },
    "q1": {
      "x": 800,
      "y": 350,
      "connections": {
        "0": {
          "node": "q1",
          "newChar": "0",
          "move": "R",
          "arrowCurve": 125
        },
        "1": {
          "node": "q1",
          "newChar": "1",
          "move": "R",
          "arrowCurve": 0
        },
        "": {
          "node": "q0",
          "newChar": "",
          "move": "L",
          "arrowCurve": 25
        }
      }
    }
  },
  "tape": {
    "string": "   ",
    "startPos": 0
  }
}`