import React, { Component } from 'react';
import './App.css';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      shift: false,
    }
    this.move = this.move.bind(this);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);

    this.nodes = {
      q0: {
        x: 50,
        y: 50,
        connections: {
          "a": {
            node: "q1",
            newValue: "b",
            move: "right"
          }
        }
      },
      q1: {
        x: 200,
        y: 100,
        connections: {
          "a": {
            node: "q2",
          }
        }
      },
      q2: {
        x: 100,
        y: 200,
        connections: {
        }
      }
    }
  }

  connection(key, startNodeId, endNodeId) {
    const dx = this.nodes[endNodeId].x - this.nodes[startNodeId].x;
    const dy = this.nodes[endNodeId].y - this.nodes[startNodeId].y;
    const d = Math.sqrt(dx ** 2 + dy ** 2);
    return (
      <g>
        <line
          key={key}
          x1={this.nodes[startNodeId].x + dx * 30 / d}  // TODO remove hardcoded values
          y1={this.nodes[startNodeId].y + dy * 30 / d}
          x2={this.nodes[endNodeId].x - dx * 45 / d}
          y2={this.nodes[endNodeId].y - dy * 45 / d}
          style={{ stroke: "#88C0D0", strokeWidth: 5 }}
        />
        <polygon
          points={
            (this.nodes[endNodeId].x - dx * 30 / d) + "," + (this.nodes[endNodeId].y - dy * 30 / d) + " " +
            (this.nodes[endNodeId].x - dx * 50 / d - 10 * dy / d) + "," + (this.nodes[endNodeId].y - dy * 50 / d + 10 * dx / d) + " " +
            (this.nodes[endNodeId].x - dx * 50 / d + 10 * dy / d) + "," + (this.nodes[endNodeId].y - dy * 50 / d - 10 * dx / d)
          }
          fill="#88C0D0"
        />
      </g>
    );
  }

  node(id) {
    return (
      <circle id={id} key={id} cx={this.nodes[id].x} cy={this.nodes[id].y} r="25" fill="#88C0D0"
        onMouseDown={this.mouseDownHandler}
        onMouseUp={this.mouseUpHandler}
      />
    );
  }

  componentDidMount() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Shift") this.setState({ shift: true });
    });
    document.addEventListener("keyup", (event) => {
      if (event.key === "Shift") this.setState({ shift: false });
    });
  }

  move(event) {
    const id = this.selected.getAttribute("id");
    this.nodes[id].x = event.pageX - this.offset.x;
    this.nodes[id].y = event.pageY - this.offset.y;
    this.forceUpdate();
  }

  mouseDownHandler(event) {
    this.selected = event.target;
    this.offset = {
      x: event.pageX - this.selected.getAttribute("cx"),
      y: event.pageY - this.selected.getAttribute("cy")
    };
    document.addEventListener("mousemove", this.move);
  }

  mouseUpHandler() {
    document.removeEventListener("mousemove", this.move);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <svg style={{ height: "100%", width: "100%", position: "absolute" }}>
            {Object.keys(this.nodes).map((id) => {
              return Object.keys(this.nodes[id].connections).map((char, key) => {
                return this.connection(key, id, this.nodes[id].connections[char].node);
              });
            })}
            {Object.keys(this.nodes).map((id) => this.node(id))}
          </svg>
        </header>
      </div>
    );
  }
}