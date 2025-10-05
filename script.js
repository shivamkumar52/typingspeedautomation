
 // Selecting elements
const textDisplay = document.getElementById("text-display");
const textInput = document.getElementById("text-input");
const timerDisplay = document.getElementById("timer");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const startBtn = document.getElementById("start-btn");
const endBtn = document.getElementById("end-btn");
const resetBtn = document.getElementById("reset-btn");
const difficultySelect = document.getElementById("difficulty");
const leaderboardList = document.getElementById("leaderboard");

// Make.com Webhook URL
const makeWebhookURL = "https://hook.eu2.make.com/pishwlug5vswcnyz12133xck8taumums";

// Typing Test Texts
const texts = {
  easy: ["The sun is shining today.", "Hello world, welcome to typing."],
  medium: ["Typing fast is a skill.", "JavaScript is a programming language."],
  hard: ["Practice improves typing speed significantly.", "Efficient typists focus on accuracy and rhythm."]
};

let timeLeft = 60;
let timer;
let isTyping = false;
let correctChars = 0;
let totalTyped = 0;
let startTime;
let userName = "Anonymous";
let userEmail = "";

// --- Make.com Integration Function ---
function sendResultsToMake(name, email, wpm, accuracy, difficulty) {
  const data = {
    name: name || "Anonymous",
    email: email || "",
    wpm: wpm,
    accuracy: accuracy,
    difficulty: difficulty || difficultySelect.value,
    date: new Date().toLocaleString()
  };

  fetch(makeWebhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(response => {
      if(response.ok){
        console.log("Results sent to Make.com successfully!");
      } else {
        console.error("Failed to send results:", response.statusText);
      }
    })
    .catch(err => console.error("Error sending results:", err));
}

// --- Start Test ---
function startTest() {
  if (!isTyping) {
    // Prompt for user name
    const namePrompt = prompt("Please enter your name to start the test:");
    if (!namePrompt || namePrompt.trim() === "") {
      alert("Name is required to start the test!");
      return;
    }
    userName = namePrompt.trim();

    // Prompt for user email
    const emailPrompt = prompt("Please enter your email to receive your results:");
    if (!emailPrompt || emailPrompt.trim() === "") {
      alert("Email is required!");
      return;
    }
    userEmail = emailPrompt.trim();

    resetTest();
    textInput.disabled = false;
    textInput.focus();
    isTyping = true;
    startTime = new Date().getTime();

    timer = setInterval(updateTimer, 1000);
  }
}

// --- Update Timer ---
function updateTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
  } else {
    endTest();
  }
}

// --- End Test ---
function endTest() {
  clearInterval(timer);
  textInput.disabled = true;
  isTyping = false;

  const elapsedTime = (new Date().getTime() - startTime) / 1000 / 60; // minutes
  const wordsTyped = correctChars / 5;
  const wpm = Math.round(wordsTyped / elapsedTime);
  wpmDisplay.textContent = wpm >= 0 ? wpm : 0;

  const accuracy = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 100;
  accuracyDisplay.textContent = accuracy.toFixed(2);

  saveScore(wpm, accuracy);

  // Send results to Make.com (admin + user)
  sendResultsToMake(userName, userEmail, wpm, accuracy, difficultySelect.value);
}

// --- Check Typing ---
function checkTyping() {
  const enteredText = textInput.value;
  const originalWords = textDisplay.textContent.split(" ");
  const userWords = enteredText.split(" ");

  textDisplay.innerHTML = "";
  let correctCount = 0;
  totalTyped = enteredText.length;

  originalWords.forEach((word, index) => {
    let span = document.createElement("span");
    if (userWords[index] === word) {
      span.classList.add("correct");
      correctCount++;
    } else if (userWords[index]) {
      span.classList.add("incorrect");
    } else {
      span.style.color = "black";
    }
    span.textContent = word + " ";
    textDisplay.appendChild(span);
  });

  correctChars = correctCount * 5;

  // Live WPM & Accuracy
  const elapsedTime = (new Date().getTime() - startTime) / 1000 / 60;
  const wpm = Math.round((correctChars / 5) / elapsedTime);
  wpmDisplay.textContent = wpm >= 0 ? wpm : 0;

  const accuracy = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 100;
  accuracyDisplay.textContent = accuracy.toFixed(2);
}

// --- Reset Test ---
function resetTest() {
  clearInterval(timer);
  timeLeft = 60;
  timerDisplay.textContent = timeLeft;
  textInput.value = "";
  textInput.disabled = true;
  isTyping = false;
  correctChars = 0;
  totalTyped = 0;
  wpmDisplay.textContent = "0";
  accuracyDisplay.textContent = "100";

  // Fetch random text
  fetchRandomText().then(text => textDisplay.textContent = text);
}

// --- Save Score to Leaderboard ---
function saveScore(wpm, accuracy) {
  let listItem = document.createElement("li");
  listItem.textContent = `${userName} - WPM: ${wpm}, Accuracy: ${accuracy}%`;
  leaderboardList.appendChild(listItem);
}

// --- Event Listeners ---
startBtn.addEventListener("click", startTest);
endBtn.addEventListener("click", endTest);
resetBtn.addEventListener("click", resetTest);
textInput.addEventListener("input", checkTyping);
difficultySelect.addEventListener("change", resetTest);

// --- Smooth Scroll & ScrollSpy ---
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if(target) target.scrollIntoView({ behavior: "smooth" });
  });
});

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(section => {
    if(scrollY >= section.offsetTop - 100) current = section.getAttribute("id");
  });
  navLinks.forEach(link => {
    link.classList.remove("active");
    if(link.getAttribute("href") === `#${current}`) link.classList.add("active");
  });
});

// --- Fetch Random Text from API ---
async function fetchRandomText() {
  try {
    const response = await fetch("https://baconipsum.com/api/?type=meat-and-filler&paras=1");
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Error fetching random text:", error);
    return "Could not load text. Please try again.";
  }
}

// --- Start Button (Random Text) ---
document.getElementById("start-btn").addEventListener("click", async () => {
  if(!isTyping){
    const text = await fetchRandomText();
    textDisplay.innerText = text;
  }
});
