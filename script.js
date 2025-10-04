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

// **Make.com Webhook URL**
const makeWebhookURL = "https://hook.eu2.make.com/pishwlug5vswcnyz12133xck8taumums"; // <-- Replace with your webhook URL

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

// --- Make.com Integration Function ---
function sendResultsToMake(name, wpm, accuracy, difficulty) {
    const data = {
        name: name || "Anonymous",
        wpm: wpm,
        accuracy: accuracy,
        difficulty: difficulty || difficultySelect.value,
        date: new Date().toLocaleString()
    };

    fetch(makeWebhookURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
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

// Start Test
function startTest() {
    if (!isTyping) {
        resetTest();
        textInput.disabled = false;
        textInput.focus();
        isTyping = true;
        startTime = new Date().getTime();

        timer = setInterval(updateTimer, 1000);
    }
}

// Update Timer
function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
    } else {
        endTest();
    }
}

// End Test (Manually or Time Out)
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

    // **Send results to Make.com**
    sendResultsToMake("Anonymous", wpm, accuracy, difficultySelect.value);
}

// Check Typing
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
    const wordsTyped = correctChars / 5;
    const wpm = Math.round(wordsTyped / elapsedTime);
    wpmDisplay.textContent = wpm >= 0 ? wpm : 0;

    const accuracy = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 100;
    accuracyDisplay.textContent = accuracy.toFixed(2);
}

// Reset Test
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

    textDisplay.textContent = texts[difficultySelect.value][Math.floor(Math.random() * texts[difficultySelect.value].length)];
}

// Save Score to Leaderboard
function saveScore(wpm, accuracy) {
    let listItem = document.createElement("li");
    listItem.textContent = `WPM: ${wpm}, Accuracy: ${accuracy}%`;
    leaderboardList.appendChild(listItem);
}

// Event Listeners
startBtn.addEventListener("click", startTest);
endBtn.addEventListener("click", endTest);
resetBtn.addEventListener("click", resetTest);
textInput.addEventListener("input", checkTyping);
difficultySelect.addEventListener("change", resetTest);

// Load Initial Text
window.onload = resetTest;

// Smooth scrolling and ScrollSpy
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

// Smooth scroll on click
navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Highlight active nav on scroll
window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }
    });
    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
            link.classList.add("active");
        }
    });
});

// API Fetch Random Text
async function fetchRandomText() {
    try {
        const response = await fetch("https://baconipsum.com/api/?type=meat-and-filler&paras=1");
        const data = await response.json();
        return data[0]; // First paragraph
    } catch (error) {
        console.error("Error fetching random text:", error);
        return "Could not load text. Please try again.";
    }
}

// Start Button with Random Text
document.getElementById("start-btn").addEventListener("click", async () => {
    const text = await fetchRandomText();
    document.getElementById("text-display").innerText = text;

    textInput.disabled = false;
    textInput.value = "";
    textInput.focus();
});
