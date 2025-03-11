"use client";

import React, { useState, useRef, useEffect } from "react";
import Plotly from "plotly.js-dist";

// Create an array of x-values for plotting (from -10 to 10, step 0.1)
const xValues = Array.from({ length: 201 }, (_, i) => -10 + i * 0.1);

// Function types along with their formulas and parent representations
const functionTypes = [
  { type: "quadratic", formula: "a(x - h)² + k", parent: "y = x²" },
  { type: "linear", formula: "a(x - h) + k", parent: "y = x" },
  { type: "absolute", formula: "a|x - h| + k", parent: "y = |x|" },
  { type: "cubic", formula: "a(x - h)³ + k", parent: "y = x³" }
];

function GraphPracticeApp() {
  // State for question type, question details, answer inputs, and feedback
  const [currentQuestionType, setCurrentQuestionType] = useState("graph");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [aAnswer, setAAnswer] = useState("");
  const [hAnswer, setHAnswer] = useState("");
  const [kAnswer, setKAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);

  const graphRef = useRef(null);

  // --- Helper Functions ---
  const getEquationString = (type, a, h, k) => {
    let aStr = a === 1 ? "" : a === -1 ? "-" : a;
    let hStr = h > 0 ? `(x - ${h})` : h < 0 ? `(x + ${Math.abs(h)})` : "x";
    let kStr = k > 0 ? ` + ${k}` : k < 0 ? ` - ${Math.abs(k)}` : "";
    switch (type) {
      case "quadratic":
        return `y = ${aStr}${hStr}²${kStr}`;
      case "linear":
        return `y = ${aStr}${hStr}${kStr}`;
      case "absolute":
        if (h > 0) return `y = ${aStr}|x - ${h}|${kStr}`;
        else if (h < 0) return `y = ${aStr}|x + ${Math.abs(h)}|${kStr}`;
        else return `y = ${aStr}|x|${kStr}`;
      case "cubic":
        return `y = ${aStr}${hStr}³${kStr}`;
      default:
        return "";
    }
  };

  const shuffleArray = (array) => {
    let arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const generateEquationDistractors = (parent, a, h, k, correctEquation) => {
    const distractors = [];
    // Flip sign of h (or adjust if zero)
    let h1 = h !== 0 ? -h : h + 1;
    distractors.push(getEquationString(parent, a, h1, k));
    // Flip sign of k (or adjust)
    let k2 = k !== 0 ? -k : k + 1;
    distractors.push(getEquationString(parent, a, h, k2));
    // Change a slightly
    let a3 = a === 1 ? 2 : 1;
    distractors.push(getEquationString(parent, a3, h, k));
    return distractors.filter(
      (d, i, arr) => d !== correctEquation && arr.indexOf(d) === i
    ).slice(0, 3);
  };

  const generateParameterDistractors = (a, h, k, correctParams) => {
    const distractors = [];
    let a1 = a === 1 ? 2 : 1;
    distractors.push(`a=${a1}, h=${h}, k=${k}`);
    let h1 = h === 5 ? h - 1 : h + 1;
    distractors.push(`a=${a}, h=${h1}, k=${k}`);
    let k1 = k === 5 ? k - 1 : k + 1;
    distractors.push(`a=${a}, h=${h}, k=${k1}`);
    return distractors.filter(
      (d, i, arr) => d !== correctParams && arr.indexOf(d) === i
    ).slice(0, 3);
  };

  // --- Question Generation Functions ---
  const generateGraphQuestion = () => {
    // Randomly select a function type from the array
    const functionIndex = Math.floor(Math.random() * functionTypes.length);
    const selectedFunction = functionTypes[functionIndex];
    // Generate random transformation parameters
    const a = Math.floor(Math.random() * 3) + 1; // 1 to 3
    const h = Math.floor(Math.random() * 9) - 4;   // -4 to 4
    const k = Math.floor(Math.random() * 9) - 4;   // -4 to 4
    const question = {
      type: "graph",
      functionType: selectedFunction.type,
      parent: selectedFunction.parent,
      parameters: { a, h, k }
    };
    setCurrentQuestion(question);
    setQuestionTitle("Question: Graph to Equation");
    const qText = `Given the transformed graph of ${selectedFunction.parent}, find the values of a, h, and k in the formula y = ${selectedFunction.formula}.`;
    setQuestionText(qText);
    // Reset answer inputs and hide previous feedback
    setAAnswer("");
    setHAnswer("");
    setKAnswer("");
    setShowFeedback(false);
    // Plot the transformed graph (without showing the parent function)
    plotTransformedGraph(a, h, k, false);
  };

  const generateEquationQuestion = () => {
    const functionIndex = Math.floor(Math.random() * functionTypes.length);
    const selectedFunction = functionTypes[functionIndex];
    const a = Math.floor(Math.random() * 3) + 1;
    const h = Math.floor(Math.random() * 9) - 4;
    const k = Math.floor(Math.random() * 9) - 4;
    const question = {
      type: "equation",
      functionType: selectedFunction.type,
      parent: selectedFunction.parent,
      parameters: { a, h, k }
    };
    setCurrentQuestion(question);
    setQuestionTitle("Question: Equation to Graph");
    let eq = "";
    switch (selectedFunction.type) {
      case "quadratic":
        eq = `y = ${a}(x - ${h})² + ${k}`;
        break;
      case "linear":
        eq = `y = ${a}(x - ${h}) + ${k}`;
        break;
      case "absolute":
        eq = `y = ${a}|x - ${h}| + ${k}`;
        break;
      case "cubic":
        eq = `y = ${a}(x - ${h})³ + ${k}`;
        break;
      default:
        break;
    }
    const qText = `Given the equation ${eq}, sketch this graph by plotting key points.
      <br /><br />
      Key points to plot:
      <br />
      For quadratic/absolute: vertex, y-intercept, and one other point
      <br />
      For linear: y-intercept, x-intercept (if any), and one other point
      <br />
      For cubic: y-intercept, x-intercept(s), and inflection point`;
    setQuestionText(qText);
    setShowFeedback(false);
    // Plot an empty interactive graph for visualization
    plotEmptyGraph();
  };

  const newQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionType === "graph") {
      generateGraphQuestion();
    } else {
      generateEquationQuestion();
    }
  };

  // --- Graph Plotting Functions ---
  const plotTransformedGraph = (a, h, k, showParent = true) => {
    // Calculate transformed y-values based on the current function type
    const calculateTransformedYValues = () => {
      const funcType = currentQuestion ? currentQuestion.functionType : "quadratic";
      switch (funcType) {
        case "quadratic":
          return xValues.map(x => a * ((x - h) ** 2) + k);
        case "linear":
          return xValues.map(x => a * (x - h) + k);
        case "absolute":
          return xValues.map(x => a * Math.abs(x - h) + k);
        case "cubic":
          return xValues.map(x => a * ((x - h) ** 3) + k);
        default:
          return [];
      }
    };

    const calculateParentYValues = () => {
      const funcType = currentQuestion ? currentQuestion.functionType : "quadratic";
      switch (funcType) {
        case "quadratic":
          return xValues.map(x => x ** 2);
        case "linear":
          return xValues.map(x => x);
        case "absolute":
          return xValues.map(x => Math.abs(x));
        case "cubic":
          return xValues.map(x => x ** 3);
        default:
          return [];
      }
    };

    const transformedYValues = calculateTransformedYValues();
    const traces = [];
    if (showParent) {
      const parentYValues = calculateParentYValues();
      traces.push({
        x: xValues.map(x => x.toFixed(2)),
        y: parentYValues,
        mode: "lines",
        name: "Parent function",
        line: { color: "blue", dash: "dash" }
      });
    }
    traces.push({
      x: xValues.map(x => x.toFixed(2)),
      y: transformedYValues.map(y => parseFloat(y.toFixed(2))),
      mode: "lines",
      name: "Transformed function",
      line: { color: "red" }
    });
    const layout = {
      title: "Graph",
      xaxis: { title: "x", range: [-10, 10], zeroline: true, dtick: 1 },
      yaxis: { title: "y", range: [-10, 10], zeroline: true, dtick: 1 }
    };
    if (graphRef.current) {
      Plotly.newPlot(graphRef.current, traces, layout);
    }
  };

  const plotEmptyGraph = () => {
    const layout = {
      title: "Interactive Graph",
      xaxis: { title: "x", range: [-10, 10], zeroline: true, dtick: 1 },
      yaxis: { title: "y", range: [-10, 10], zeroline: true, dtick: 1 }
    };
    if (graphRef.current) {
      Plotly.newPlot(graphRef.current, [], layout);
    }
  };

  // --- Additional Helper ---
  const getFunctionFormula = (a, h, k) => {
    if (!currentQuestion) return "";
    switch (currentQuestion.functionType) {
      case "quadratic":
        return `${a}(x - ${h})² + ${k}`;
      case "linear":
        return `${a}(x - ${h}) + ${k}`;
      case "absolute":
        return `${a}|x - ${h}| + ${k}`;
      case "cubic":
        return `${a}(x - ${h})³ + ${k}`;
      default:
        return "";
    }
  };

  // --- Check Answer Function ---
  const checkAnswer = () => {
    setShowFeedback(true);
    if (currentQuestionType === "graph") {
      const aInput = parseFloat(aAnswer);
      const hInput = parseFloat(hAnswer);
      const kInput = parseFloat(kAnswer);
      if (isNaN(aInput) || isNaN(hInput) || isNaN(kInput)) {
        setFeedback("Please enter valid numbers for all parameters.");
        setFeedbackCorrect(false);
        return;
      }
      const { a: correctA, h: correctH, k: correctK } = currentQuestion.parameters;
      const isCorrect =
        Math.abs(aInput - correctA) < 0.1 &&
        Math.abs(hInput - correctH) < 0.1 &&
        Math.abs(kInput - correctK) < 0.1;
      if (isCorrect) {
        setFeedback("Correct! Your values match the transformed function.");
        setFeedbackCorrect(true);
      } else {
        setFeedback(
          `Incorrect. The correct values are: a = ${correctA}, h = ${correctH}, k = ${correctK}.<br>
          Formula: y = ${getFunctionFormula(correctA, correctH, correctK)}`
        );
        setFeedbackCorrect(false);
      }
      // Show parent function for comparison
      plotTransformedGraph(correctA, correctH, correctK, true);
    } else {
      const { a, h, k } = currentQuestion.parameters;
      plotTransformedGraph(a, h, k, true);
      let keyPoints = "";
      switch (currentQuestion.functionType) {
        case "quadratic":
          keyPoints = `
            <strong>Key points:</strong><br>
            Vertex: (${h}, ${k})<br>
            y-intercept: y = ${a * (h ** 2) + k} when x = 0<br>
            x-intercepts: x = ${h} ± ${Math.sqrt(-k / a).toFixed(2)} (if applicable)
          `;
          break;
        case "linear":
          keyPoints = `
            <strong>Key points:</strong><br>
            y-intercept: y = ${a * (-h) + k} when x = 0<br>
            x-intercept: x = ${h + k / a} (if applicable)
          `;
          break;
        case "absolute":
          keyPoints = `
            <strong>Key points:</strong><br>
            Vertex: (${h}, ${k})<br>
            y-intercept: y = ${a * Math.abs(-h) + k} when x = 0
          `;
          break;
        case "cubic":
          keyPoints = `
            <strong>Key points:</strong><br>
            y-intercept: y = ${a * ((-h) ** 3) + k} when x = 0<br>
            Inflection point: (${h}, ${k})
          `;
          break;
        default:
          break;
      }
      setFeedback(
        `<div>Check your graph against the correct one shown in red. The parent function is shown as a blue dashed line.</div>
         ${keyPoints}`
      );
      // For equation questions, we assume the user is comparing graphs so we mark feedback as correct (or neutral)
      setFeedbackCorrect(true);
    }
  };

  // On mount or when the question type changes, generate a new question.
  useEffect(() => {
    newQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionType]);

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h1>Graph Transformations: Practice Mode</h1>
      <div className="controls" style={{ margin: "10px 0" }}>
        <button
          onClick={() => {
            setCurrentQuestionType("graph");
            newQuestion();
          }}
          style={{ padding: "8px 12px", margin: "5px", cursor: "pointer" }}
        >
          Graph Problems
        </button>
        <button
          onClick={() => {
            setCurrentQuestionType("equation");
            newQuestion();
          }}
          style={{ padding: "8px 12px", margin: "5px", cursor: "pointer" }}
        >
          Equation Problems
        </button>
        <button
          onClick={newQuestion}
          style={{ padding: "8px 12px", margin: "5px", cursor: "pointer" }}
        >
          New Question
        </button>
      </div>
      <div
        className="question-container"
        style={{
          marginTop: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "5px",
          backgroundColor: "#f9f9f9"
        }}
      >
        <h3>{questionTitle}</h3>
        <p dangerouslySetInnerHTML={{ __html: questionText }}></p>
      </div>
      <div id="graph" ref={graphRef} style={{ marginTop: "20px" }}></div>
      <div className="answer-container" style={{ marginTop: "10px" }}>
        {currentQuestionType === "graph" ? (
          <div>
            <div
              className="parameter-input"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px"
              }}
            >
              <label htmlFor="a_answer" style={{ width: "30px", marginRight: "10px" }}>
                a:
              </label>
              <input
                type="number"
                id="a_answer"
                step="0.1"
                value={aAnswer}
                onChange={(e) => setAAnswer(e.target.value)}
                style={{ width: "60px" }}
              />
            </div>
            <div
              className="parameter-input"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px"
              }}
            >
              <label htmlFor="h_answer" style={{ width: "30px", marginRight: "10px" }}>
                h:
              </label>
              <input
                type="number"
                id="h_answer"
                step="0.1"
                value={hAnswer}
                onChange={(e) => setHAnswer(e.target.value)}
                style={{ width: "60px" }}
              />
            </div>
            <div
              className="parameter-input"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px"
              }}
            >
              <label htmlFor="k_answer" style={{ width: "30px", marginRight: "10px" }}>
                k:
              </label>
              <input
                type="number"
                id="k_answer"
                step="0.1"
                value={kAnswer}
                onChange={(e) => setKAnswer(e.target.value)}
                style={{ width: "60px" }}
              />
            </div>
          </div>
        ) : (
          <p>
            Use the graph below to visualize. When you're ready, check your answer to see the correct graph.
          </p>
        )}
      </div>
      <button
        onClick={checkAnswer}
        style={{ padding: "8px 12px", margin: "5px", cursor: "pointer" }}
      >
        Check Answer
      </button>
      {showFeedback && (
        <div
          className={`feedback ${feedbackCorrect ? "correct" : "incorrect"}`}
          style={{
            marginTop: "10px",
            padding: "10px",
            borderRadius: "5px",
            backgroundColor: feedbackCorrect ? "#d4edda" : "#f8d7da",
            color: feedbackCorrect ? "#155724" : "#721c24"
          }}
          dangerouslySetInnerHTML={{ __html: feedback }}
        ></div>
      )}
    </div>
  );
}

export default GraphPracticeApp;
