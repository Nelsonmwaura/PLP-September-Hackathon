const form = document.getElementById("flashcard-form");
const cardsContainer = document.getElementById("cards-container");
const clearAllBtn = document.getElementById("clear-all");

// Study mode elements
const prevBtn = document.getElementById("prev-card");
const nextBtn = document.getElementById("next-card");
const flipBtn = document.getElementById("flip-card");
const shuffleBtn = document.getElementById("shuffle");
const progressEl = document.getElementById("progress");
const activeCard = document.getElementById("active-card");
const flipInner = activeCard ? activeCard.querySelector(".flip-card-inner") : null;
const frontFace = activeCard ? activeCard.querySelector(".flip-card-front") : null;
const backFace = activeCard ? activeCard.querySelector(".flip-card-back") : null;
const themeToggle = document.getElementById("theme-toggle");
const subjectSelect = document.getElementById("subject");
const filterSelect = document.getElementById("filter-subject");

// Quiz mode elements
const quizFilterSelect = document.getElementById("quiz-filter-subject");
const startQuizBtn = document.getElementById("start-quiz");
const quizStage = document.getElementById("quiz-stage");
const quizCard = document.getElementById("quiz-card");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const submitAnswerBtn = document.getElementById("submit-answer");
const nextQuestionBtn = document.getElementById("next-question");
const quizFeedback = document.getElementById("quiz-feedback");
const quizResults = document.getElementById("quiz-results");
const finalScore = document.getElementById("final-score");
const totalQuestions = document.getElementById("total-questions");
const restartQuizBtn = document.getElementById("restart-quiz");
const quizProgress = document.getElementById("quiz-progress");

// Modal elements
const resourcesBtn = document.getElementById("resources-btn");
const resourcesModal = document.getElementById("resources-modal");
const closeModalBtn = document.getElementById("close-modal");

// Page sections
const studySection = document.getElementById('study');
const sections = document.querySelectorAll('.panel');
const navLinks = document.querySelectorAll('.nav-link');

// Topic elements
const topicNavContainer = document.getElementById('topic-nav-container');
const newTopicInput = document.getElementById('new-topic-input');
const addTopicBtn = document.getElementById('add-topic-btn');

// Navigation elements
const studyLink = document.querySelector('a[href="#study"]');
const startStudyingBtn = document.querySelector('a.btn[href="#study"]');

// Load saved data from localStorage
let flashcards = JSON.parse(localStorage.getItem("flashcards")) || [];
let topics = JSON.parse(localStorage.getItem("topics")) || ["General", "Math", "Science"];

// Study mode state
let currentIndex = 0;
let isFlipped = false;
let studyDeck = [];

// Quiz mode state
let quizDeck = [];
let currentQuizIndex = 0;
let score = 0;
let selectedAnswer = null;

function save() {
  localStorage.setItem("flashcards", JSON.stringify(flashcards));
}

function saveTopics() {
  localStorage.setItem("topics", JSON.stringify(topics));
}

function renderTopics() {
  topicNavContainer.innerHTML = '';
  topics.forEach(topic => {
    const topicBtn = document.createElement('button');
    topicBtn.className = 'btn';
    topicBtn.textContent = topic;
    topicBtn.addEventListener('click', () => renderCards(topic));
    topicNavContainer.appendChild(topicBtn);
  });
  // Also update the dropdowns
  const subjectSelects = [subject, filterSelect, quizFilterSelect];
  subjectSelects.forEach(select => {
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '';
    topics.forEach(topic => {
      const option = new Option(topic, topic);
      select.appendChild(option);
    });
    select.value = currentVal;
  });
}

function addTopic() {
  const newTopic = newTopicInput.value.trim();
  if (newTopic && !topics.includes(newTopic)) {
    topics.push(newTopic);
    saveTopics();
    renderTopics();
    newTopicInput.value = '';
  }
}

function renderCards(filter = 'All') {
  cardsContainer.innerHTML = "";
  flashcards.forEach((card, index) => {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    const textEl = document.createElement('div');
    textEl.textContent = card.question;
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = card.subject || 'General';
    cardEl.appendChild(textEl);
    cardEl.appendChild(badge);

    // toggle between question and answer
    let showingQuestion = true;
    cardEl.addEventListener("click", () => {
      textEl.textContent = showingQuestion ? card.answer : card.question;
      showingQuestion = !showingQuestion;
    });

    cardsContainer.appendChild(cardEl);
  });
}

function setProgress() {
  if (!progressEl) return;
  const total = studyDeck.length;
  const pos = total === 0 ? 0 : currentIndex + 1;
  progressEl.textContent = `${pos} / ${total}`;
}

function updateStudyCard() {
  if (!frontFace || !backFace) return;
  if (studyDeck.length === 0) {
    frontFace.innerHTML = '<span class="placeholder">Add cards to begin</span>';
    backFace.textContent = '';
    isFlipped = false;
    if (flipInner) flipInner.classList.remove("flipped");
    setProgress();
    return;
  }
  const card = studyDeck[currentIndex];
  frontFace.textContent = card.question;
  backFace.textContent = card.answer;
  isFlipped = false;
  if (flipInner) flipInner.classList.remove("flipped");
  setProgress();
}

function prevCard() {
  if (studyDeck.length === 0) return;
  currentIndex = (currentIndex - 1 + studyDeck.length) % studyDeck.length;
  updateStudyCard();
}

function nextCard() {
  if (studyDeck.length === 0) return;
  currentIndex = (currentIndex + 1) % studyDeck.length;
  updateStudyCard();
}

function flipCard() {
  if (!flipInner) return;
  isFlipped = !isFlipped;
  flipInner.classList.toggle("flipped", isFlipped);
}

function shuffleCards() {
  for (let i = studyDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [studyDeck[i], studyDeck[j]] = [studyDeck[j], studyDeck[i]];
  }
  currentIndex = 0;
  updateStudyCard();
}

function rebuildStudyDeck() {
  const chosen = filterSelect ? filterSelect.value : 'All';
  studyDeck = flashcards.filter(c => chosen === 'All' ? true : (c.subject || 'General') === chosen);
  currentIndex = 0;
  isFlipped = false;
  updateStudyCard();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const question = document.getElementById("question").value.trim();
  const answer = document.getElementById("answer").value.trim();
  const subject = subjectSelect ? (subjectSelect.value || 'General') : 'General';

  if (question && answer) {
    flashcards.push({ question, answer, subject });
    save();
    renderCards();
    rebuildStudyDeck();
    form.reset();
  }
});

if (clearAllBtn) {
  clearAllBtn.addEventListener("click", () => {
    if (confirm("Clear all flashcards?")) {
      flashcards = [];
      save();
      currentIndex = 0;
      renderCards();
      rebuildStudyDeck();
    }
  });
}

if (prevBtn) prevBtn.addEventListener("click", prevCard);
if (nextBtn) nextBtn.addEventListener("click", nextCard);
if (flipBtn) flipBtn.addEventListener("click", flipCard);
if (shuffleBtn) shuffleBtn.addEventListener("click", shuffleCards);
if (activeCard) activeCard.addEventListener("click", flipCard);
if (filterSelect) filterSelect.addEventListener('change', () => { rebuildStudyDeck(); });

document.addEventListener("keydown", (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (e.code === "Space") { e.preventDefault(); flipCard(); }
  if (e.key === "ArrowLeft") { e.preventDefault(); prevCard(); }
  if (e.key === "ArrowRight") { e.preventDefault(); nextCard(); }
});

// Theme handling
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });
}

// Initial render
function seedIfEmpty() {
  if (flashcards.length > 0) return;
  flashcards = [
    { question: '2 + 2 = ?', answer: '4', subject: 'Math' },
    { question: 'H2O is called?', answer: 'Water', subject: 'Science' },
    { question: 'JS: const creates?', answer: 'A block-scoped read-only binding', subject: 'Programming' },
    { question: 'Hola means?', answer: 'Hello (Spanish)', subject: 'Language' },
    { question: 'Largest planet?', answer: 'Jupiter', subject: 'Science' },
    { question: '5 x 6 = ?', answer: '30', subject: 'Math' },
    { question: 'HTTP stands for?', answer: 'HyperText Transfer Protocol', subject: 'Programming' },
    { question: 'Capital of Kenya?', answer: 'Nairobi', subject: 'General' }
  ];
  save();
}

seedIfEmpty();
renderCards();
rebuildStudyDeck();
initTheme();

// Quiz Logic
function startQuiz() {
  // Disable study mode
  studyLink.style.pointerEvents = 'none';
  studyLink.style.opacity = '0.5';
  studySection.style.display = 'none';

  const subject = quizFilterSelect.value;
  quizDeck = flashcards.filter(c => subject === 'All' ? true : (c.subject || 'General') === subject);
  
  if (quizDeck.length < 2) {
    alert("You need at least 2 cards in this subject to start a quiz.");
    return;
  }

  shuffle(quizDeck);
  currentQuizIndex = 0;
  score = 0;
  document.querySelector("#quiz .controls").style.display = 'none';
  quizResults.style.display = 'none';
  quizStage.style.display = 'block';
  loadQuestion();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function loadQuestion() {
  selectedAnswer = null;
  const card = quizDeck[currentQuizIndex];
  quizQuestion.textContent = card.question;
  quizOptions.innerHTML = '';

  const options = generateOptions(card.answer);
  options.forEach(option => {
    const button = document.createElement('button');
    button.className = 'btn';
    button.textContent = option;
    button.addEventListener('click', () => selectAnswer(button, option));
    quizOptions.appendChild(button);
  });

  quizFeedback.textContent = '';
  quizFeedback.className = '';
  submitAnswerBtn.style.display = 'inline-flex';
  nextQuestionBtn.style.display = 'none';
  updateQuizProgress();
}

function generateOptions(correctAnswer) {
  const options = [correctAnswer];
  const incorrectAnswers = flashcards
    .map(c => c.answer)
    .filter(a => a !== correctAnswer);

  shuffle(incorrectAnswers);

  for (let i = 0; i < Math.min(3, incorrectAnswers.length); i++) {
    options.push(incorrectAnswers[i]);
  }

  shuffle(options);
  return options;
}

function selectAnswer(button, answer) {
  Array.from(quizOptions.children).forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
  selectedAnswer = answer;
}

function submitAnswer() {
  if (selectedAnswer === null) {
    alert("Please select an answer.");
    return;
  }

  const correctAnswer = quizDeck[currentQuizIndex].answer;
  if (selectedAnswer === correctAnswer) {
    score++;
    quizFeedback.textContent = "Correct!";
    quizFeedback.className = 'correct';
  } else {
    quizFeedback.textContent = `Incorrect. The correct answer is: ${correctAnswer}`;
    quizFeedback.className = 'incorrect';
  }

  submitAnswerBtn.style.display = 'none';
  nextQuestionBtn.style.display = 'inline-flex';
}

function nextQuestion() {
  currentQuizIndex++;
  if (currentQuizIndex < quizDeck.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  quizStage.style.display = 'none';
  quizResults.style.display = 'block';
  finalScore.textContent = score;
  totalQuestions.textContent = quizDeck.length;

  // Re-enable study mode
  studyLink.style.pointerEvents = 'auto';
  studyLink.style.opacity = '1';
}

function restartQuiz() {
  showSection('study');

  quizResults.style.display = 'none';
  document.querySelector("#quiz .controls").style.display = 'flex';
  quizProgress.textContent = '';
}

function updateQuizProgress() {
  quizProgress.textContent = `Question ${currentQuizIndex + 1} of ${quizDeck.length}`;
}

if (startQuizBtn) startQuizBtn.addEventListener('click', startQuiz);
if (submitAnswerBtn) submitAnswerBtn.addEventListener('click', submitAnswer);
if (nextQuestionBtn) nextQuestionBtn.addEventListener('click', nextQuestion);
if (restartQuizBtn) restartQuizBtn.addEventListener('click', restartQuiz);
if (addTopicBtn) addTopicBtn.addEventListener('click', addTopic);

// SPA Navigation
function showSection(id) {
  sections.forEach(section => {
    section.style.display = section.id === id ? 'block' : 'none';
  });
  navLinks.forEach(link => {
    if (link.href.includes(id)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const sectionId = e.target.hash.substring(1);
    showSection(sectionId);
  });
});

// Initial setup
showSection('all-cards'); // Show library by default
renderTopics();

// Modal logic
if (resourcesBtn) {
  resourcesBtn.addEventListener('click', () => {
    resourcesModal.style.display = 'flex';
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    resourcesModal.style.display = 'none';
  });
}

window.addEventListener('click', (event) => {
  if (event.target === resourcesModal) {
    resourcesModal.style.display = 'none';
  }
});
