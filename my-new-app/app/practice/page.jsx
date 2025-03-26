"use client";

import React, { useState, useRef, useEffect } from "react";

const xValues = Array.from({ length: 201 }, (_, i) => -10 + i * 0.1);

const functionTypes = [
  { type: "quadratic", formula: "a(x - h)² + k", parent: "y = x²" },
  { type: "linear", formula: "a(x - h) + k", parent: "y = x" },
  { type: "absolute", formula: "a|x - h| + k", parent: "y = |x|" },
  { type: "cubic", formula: "a(x - h)³ + k", parent: "y = x³" }
];

function GraphPracticeApp() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [aAnswer, setAAnswer] = useState("");
  const [hAnswer, setHAnswer] = useState("");
  const [kAnswer, setKAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const graphRef = useRef(null);

  useEffect(() => {
    generateGraphQuestion();
  }, []);

  useEffect(() => {
    if (currentQuestion) {
      const { a, h, k } = currentQuestion.parameters;
      plotTransformedGraph(a, h, k);
    }
  }, [currentQuestion]);

  const generateGraphQuestion = () => {
    const functionIndex = Math.floor(Math.random() * functionTypes.length);
    const selectedFunction = functionTypes[functionIndex];
    const a = Math.floor(Math.random() * 3) + 1;
    const h = Math.floor(Math.random() * 9) - 4;
    const k = Math.floor(Math.random() * 9) - 4;

    const newQuestion = {
      functionType: selectedFunction.type,
      parent: selectedFunction.parent,
      parameters: { a, h, k }
    };

    setCurrentQuestion(newQuestion);
    setQuestionTitle("Question: Graph to Equation");
    setQuestionText(`Given the transformed graph of ${selectedFunction.parent}, find the values of a, h, and k in the formula y = ${selectedFunction.formula}.`);
    setAAnswer("");
    setHAnswer("");
    setKAnswer("");
    setShowFeedback(false);
  };

  const plotTransformedGraph = async (a, h, k) => {
    if (!graphRef.current || !currentQuestion) return;

    const Plotly = (await import("plotly.js-dist")).default;
    const funcType = currentQuestion.functionType;

    let transformedYValues;
    switch (funcType) {
      case "quadratic":
        transformedYValues = xValues.map(x => a * ((x - h) ** 2) + k);
        break;
      case "linear":
        transformedYValues = xValues.map(x => a * (x - h) + k);
        break;
      case "absolute":
        transformedYValues = xValues.map(x => a * Math.abs(x - h) + k);
        break;
      case "cubic":
        transformedYValues = xValues.map(x => a * ((x - h) ** 3) + k);
        break;
      default:
        return;
    }

    const parentYValues = xValues.map(x => {
      switch (funcType) {
        case "quadratic": return x ** 2;
        case "linear": return x;
        case "absolute": return Math.abs(x);
        case "cubic": return x ** 3;
        default: return 0;
      }
    });

    const traces = [
      {
        x: xValues,
        y: parentYValues,
        mode: "lines",
        name: "Parent function",
        line: { color: "blue", dash: "dash" }
      },
      {
        x: xValues,
        y: transformedYValues,
        mode: "lines",
        name: "Transformed function",
        line: { color: "red" }
      }
    ];

    Plotly.newPlot(graphRef.current, traces, {
      title: "Graph",
      xaxis: { title: "x", range: [-10, 10], zeroline: true, dtick: 1 },
      yaxis: { title: "y", range: [-10, 10], zeroline: true, dtick: 1 }
    });
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;
    const { a, h, k } = currentQuestion.parameters;
    if (parseFloat(aAnswer) === a && parseFloat(hAnswer) === h && parseFloat(kAnswer) === k) {
      setFeedback("✅ Correct! The values are accurate.");
    } else {
      setFeedback(`❌ Incorrect. The correct values are: a=${a}, h=${h}, k=${k}`);
    }
    setShowFeedback(true);
  };

  return (
    <div>
      <h1>Graph Transformations: Practice Mode</h1>
      <button onClick={generateGraphQuestion}>New Question</button>
      <h3>{questionTitle}</h3>
      <p>{questionText}</p>
      <div ref={graphRef} style={{ width: "600px", height: "400px" }} />
      <div>
        <label>a: <input type="number" value={aAnswer} onChange={(e) => setAAnswer(e.target.value)} /></label>
        <label>h: <input type="number" value={hAnswer} onChange={(e) => setHAnswer(e.target.value)} /></label>
        <label>k: <input type="number" value={kAnswer} onChange={(e) => setKAnswer(e.target.value)} /></label>
      </div>
      <button onClick={checkAnswer}>Check Answer</button>
      {showFeedback && <p>{feedback}</p>}
    </div>
  );
}

export default GraphPracticeApp;