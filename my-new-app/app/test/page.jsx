"use client";

import React, { useState, useEffect, useRef } from "react";
import { firestore as db } from "../Firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, orderBy, limit, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";    
import dynamic from "next/dynamic";
//import Plotly from "plotly.js-dist"; // Ensure you've installed this dependency
const Plotly = typeof window !== "undefined" ? require("plotly.js-dist") : null;
// Helper Functions

// Returns a nicely formatted equation string based on the function type and transformation parameters.
function getEquationString(type, a, h, k) {
  let aStr = "";
  if (a === 1) {
    aStr = "";
  } else if (a === -1) {
    aStr = "-";
  } else {
    aStr = a;
  }
  let hStr = "";
  if (h > 0) {
    hStr = `(x - ${h})`;
  } else if (h < 0) {
    hStr = `(x + ${Math.abs(h)})`;
  } else {
    hStr = "x";
  }
  let kStr = "";
  if (k > 0) {
    kStr = ` + ${k}`;
  } else if (k < 0) {
    kStr = ` - ${Math.abs(k)}`;
  }
  switch (type) {
    case "quadratic":
      return `y = ${aStr}${hStr}²${kStr}`;
    case "linear":
      return `y = ${aStr}${hStr}${kStr}`;
    case "absolute":
      if (h > 0) {
        return `y = ${aStr}|x - ${h}|${kStr}`;
      } else if (h < 0) {
        return `y = ${aStr}|x + ${Math.abs(h)}|${kStr}`;
      } else {
        return `y = ${aStr}|x|${kStr}`;
      }
    case "cubic":
      return `y = ${aStr}${hStr}³${kStr}`;
    default:
      return "";
  }
}

// Shuffle an array (Fisher–Yates shuffle)
function shuffleArray(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate three distractor equations by modifying one parameter at a time.
function generateEquationDistractors(parent, a, h, k, correctEquation) {
  const distractors = [];
  let h1 = h !== 0 ? -h : h + 1;
  distractors.push(getEquationString(parent, a, h1, k));
  let k2 = k !== 0 ? -k : k + 1;
  distractors.push(getEquationString(parent, a, h, k2));
  let a3 = a === 1 ? 2 : 1;
  distractors.push(getEquationString(parent, a3, h, k));
  return distractors.filter(
    (d, i, arr) => d !== correctEquation && arr.indexOf(d) === i
  ).slice(0, 3);
}

// Generate three distractors for the parameter-based (flip) question.
function generateParameterDistractors(a, h, k, correctParams) {
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
}

// Generate a random question.
function generateQuestion() {
  const types = ["text", "graph", "flip"];
  const qType = types[Math.floor(Math.random() * types.length)];
  const parentTypes = ["quadratic", "linear", "absolute", "cubic"];
  const parent = parentTypes[Math.floor(Math.random() * parentTypes.length)];
  const aValues = [-3, -2, -1, 1, 2, 3]; // avoid 0 for a
  const a = aValues[Math.floor(Math.random() * aValues.length)];
  const h = Math.floor(Math.random() * 11) - 5; // h in [-5, 5]
  const k = Math.floor(Math.random() * 11) - 5; // k in [-5, 5]
  const correctEquation = getEquationString(parent, a, h, k);

  if (qType === "text" || qType === "graph") {
    let prompt;
    if (qType === "text") {
      let parentDisplay =
        parent === "quadratic"
          ? "x²"
          : parent === "linear"
          ? "x"
          : parent === "absolute"
          ? "|x|"
          : "x³";
      prompt = `For the parent function y = ${parentDisplay} with transformation parameters a = ${a}, h = ${h}, and k = ${k}, what is the equation of the transformed function?`;
    } else {
      prompt =
        "Look at the graph below and determine which equation corresponds to the displayed transformed function.";
    }
    const distractors = generateEquationDistractors(
      parent,
      a,
      h,
      k,
      correctEquation
    );
    const allChoices = shuffleArray([correctEquation, ...distractors]);
    const choices = allChoices.map((choice, index) => ({
      id: String.fromCharCode(65 + index),
      text: choice,
    }));
    return {
      id: Date.now(),
      type: qType,
      prompt: prompt,
      parent: parent,
      a: a,
      h: h,
      k: k,
      correct: correctEquation,
      choices: choices,
      correctChoice: choices.find(
        (choice) => choice.text === correctEquation
      ).id,
      // Function to render the graph (used for "graph" type questions)
      equationFunc: (x) => {
        switch (parent) {
          case "quadratic":
            return a * Math.pow(x - h, 2) + k;
          case "linear":
            return a * (x - h) + k;
          case "absolute":
            return a * Math.abs(x - h) + k;
          case "cubic":
            return a * Math.pow(x - h, 3) + k;
          default:
            return 0;
        }
      },
    };
  } else if (qType === "flip") {
    const prompt = `Given the transformed function ${correctEquation}, which transformation parameters were applied to the parent function y = ${
      parent === "quadratic"
        ? "x²"
        : parent === "linear"
        ? "x"
        : parent === "absolute"
        ? "|x|"
        : "x³"
    }?`;
    const correctParams = `a=${a}, h=${h}, k=${k}`;
    const distractors = generateParameterDistractors(a, h, k, correctParams);
    const allChoices = shuffleArray([correctParams, ...distractors]);
    const choices = allChoices.map((choice, index) => ({
      id: String.fromCharCode(65 + index),
      text: choice,
    }));
    return {
      id: Date.now(),
      type: "flip",
      prompt: prompt,
      parent: parent,
      a: a,
      h: h,
      k: k,
      correct: correctParams,
      choices: choices,
      correctChoice: choices.find(
        (choice) => choice.text === correctParams
      ).id,
      equationFunc: (x) => {
        switch (parent) {
          case "quadratic":
            return a * Math.pow(x - h, 2) + k;
          case "linear":
            return a * (x - h) + k;
          case "absolute":
            return a * Math.abs(x - h) + k;
          case "cubic":
            return a * Math.pow(x - h, 3) + k;
          default:
            return 0;
        }
      },
    };
  }
}

// Graph Component – Renders a Plotly graph given an equation function.
function Graph({ equation }) {
  const graphRef = useRef(null);

  useEffect(() => {
    const xValues = [];
    const yValues = [];
    for (let x = -10; x <= 10; x += 0.1) {
      xValues.push(x.toFixed(2));
      yValues.push(parseFloat(equation(x).toFixed(2)));
    }
    const trace = {
      x: xValues,
      y: yValues,
      mode: "lines",
      name: "Graph",
    };
    const layout = {
      margin: { t: 20 },
      xaxis: { title: "x", zeroline: true },
      yaxis: { title: "y", zeroline: true },
    };
    Plotly.newPlot(graphRef.current, [trace], layout);
  }, [equation]);

  return (
    <div
      className="graph-container"
      ref={graphRef}
      style={{ width: "100%", height: "400px", marginBottom: "15px" }}
    ></div>
  );
}

// Main Test App Component
function GraphTestApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [highestStreak, setHighestStreak] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        // Auto sign in anonymously if no user
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const [currentQuestion, setCurrentQuestion] = useState(generateQuestion());
  const [selectedChoice, setSelectedChoice] = useState("");
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleChoiceChange = (e) => {
    setSelectedChoice(e.target.value);
  };

  const handleSubmit = async () => {
    if (selectedChoice === "") return;

    setQuestionsAnswered((prev) => prev + 1);

    const isCorrect = selectedChoice === currentQuestion.correctChoice;

    if (isCorrect) {
      const newStreak = streak + 1;
      setScore((prev) => prev + 1);
      setStreak(newStreak);
      setFeedback("Correct!");

      try {
        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const prevMax = userData.maxTestStreak || 0;

            await updateDoc(userRef, {
              currentTestStreak: newStreak,
              maxTestStreak: Math.max(prevMax, newStreak),
            });
          }
        }
      } catch (error) {
        console.error("Error updating streaks:", error);
      }
    } else {
      setStreak(0);
      setFeedback(
        "Incorrect. The correct answer was " + currentQuestion.correctChoice
      );

      try {
        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);
          await updateDoc(userRef, {
            currentTestStreak: 0,
          });
        }
      } catch (error) {
        console.error("Error resetting currentTestStreak:", error);
      }
    }

    setShowFeedback(true);
  };


  const handleNext = () => {
    setShowFeedback(false);
    setSelectedChoice("");
    setCurrentQuestion(generateQuestion());
  };

  const handleRestart = () => {
    setScore(0);
    setQuestionsAnswered(0);
    setStreak(0);
    setShowFeedback(false);
    setSelectedChoice("");
    setCurrentQuestion(generateQuestion());
  };

  const accuracy =
    questionsAnswered > 0 ? ((score / questionsAnswered) * 100).toFixed(1) : 0;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Infinite Graph Transformations Test</h1>
      <p>
        Score: {score} / {questionsAnswered} | Accuracy: {accuracy}% | Current Streak: {streak}
      </p>
      <div
        className="question-container"
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        <h2>Question</h2>
        <p>{currentQuestion.prompt}</p>
        {currentQuestion.type === "graph" && (
          <Graph equation={currentQuestion.equationFunc} />
        )}
        <ul className="choices" style={{ listStyleType: "none", padding: 0 }}>
          {currentQuestion.choices.map((choice) => (
            <li key={choice.id} className="choice" style={{ margin: "10px 0" }}>
              <label>
                <input
                  type="radio"
                  value={choice.id}
                  checked={selectedChoice === choice.id}
                  onChange={handleChoiceChange}
                />
                {choice.text}
              </label>
            </li>
          ))}
        </ul>
        {!showFeedback ? (
          <button
            className="button"
            onClick={handleSubmit}
            style={{
              margin: "10px",
              padding: "10px 20px",
              fontSize: "1rem",
            }}
            disabled={selectedChoice === ""}
          >
            Submit Answer
          </button>
        ) : (
          <div>
            <p>{feedback}</p>
            <button
              className="button"
              onClick={handleNext}
              style={{
                margin: "10px",
                padding: "10px 20px",
                fontSize: "1rem",
              }}
            >
              Next Question
            </button>
          </div>
        )}
      </div>
      <button
        className="button"
        onClick={handleRestart}
        style={{
          margin: "10px",
          padding: "10px 20px",
          fontSize: "1rem",
        }}
      >
        Restart Test
      </button>
    </div>
  );
}

export default GraphTestApp;
