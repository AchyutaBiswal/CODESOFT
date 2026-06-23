const MAX_HISTORY = 12;
const MAX_FACTORIAL = 170;

const state = {
  displayValue: "0",
  firstOperand: null,
  operator: null,
  waitingForSecondOperand: false,
  expression: "Ready",
  memory: 0,
  history: [],
  soundEnabled: true,
};

const elements = {
  expression: document.getElementById("expressionDisplay"),
  result: document.getElementById("resultDisplay"),
  status: document.getElementById("statusLine"),
  keypad: document.querySelector(".keypad"),
  historyList: document.getElementById("historyList"),
  emptyHistory: document.getElementById("emptyHistory"),
  clearHistory: document.getElementById("clearHistory"),
  themeToggle: document.getElementById("themeToggle"),
  soundToggle: document.getElementById("soundToggle"),
  copyResult: document.getElementById("copyResult"),
};

const formatOperator = {
  "+": "+",
  "-": "−",
  "×": "×",
  "÷": "÷",
  "^": "^",
  mod: "mod",
};

function updateDisplay(animate = true) {
  if (animate) {
    elements.result.classList.add("updating");
    window.setTimeout(() => elements.result.classList.remove("updating"), 160);
  }

  elements.result.textContent = state.displayValue;
  elements.expression.textContent = state.expression;
  elements.status.textContent = `Memory: ${formatNumber(state.memory)}${state.soundEnabled ? " | Sound on" : " | Sound off"}`;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  const absolute = Math.abs(value);
  if ((absolute !== 0 && absolute < 0.000001) || absolute >= 1000000000000) {
    return value.toExponential(8).replace(/\.?0+e/, "e");
  }

  return Number.parseFloat(value.toFixed(10)).toString();
}

function currentNumber() {
  return Number.parseFloat(state.displayValue);
}

function setError(message) {
  state.displayValue = "Error";
  state.expression = message;
  state.firstOperand = null;
  state.operator = null;
  state.waitingForSecondOperand = true;
  updateDisplay();
}

function inputDigit(digit) {
  if (state.displayValue === "Error" || state.waitingForSecondOperand) {
    state.displayValue = digit;
    state.waitingForSecondOperand = false;
  } else {
    state.displayValue = state.displayValue === "0" ? digit : state.displayValue + digit;
  }

  state.expression = state.operator
    ? `${formatNumber(state.firstOperand)} ${formatOperator[state.operator]} ${state.displayValue}`
    : "Typing";
  updateDisplay();
}

function inputDecimal() {
  if (state.waitingForSecondOperand || state.displayValue === "Error") {
    state.displayValue = "0.";
    state.waitingForSecondOperand = false;
  } else if (!state.displayValue.includes(".")) {
    state.displayValue += ".";
  }

  state.expression = "Decimal input";
  updateDisplay();
}

function chooseOperator(nextOperator) {
  const inputValue = currentNumber();

  if (state.displayValue === "Error") {
    return;
  }

  if (state.operator && state.waitingForSecondOperand) {
    state.operator = nextOperator;
    state.expression = `${formatNumber(state.firstOperand)} ${formatOperator[nextOperator]}`;
    updateDisplay();
    return;
  }

  if (state.firstOperand === null) {
    state.firstOperand = inputValue;
  } else if (state.operator) {
    const result = performCalculation(state.firstOperand, inputValue, state.operator);
    if (result.error) {
      setError(result.error);
      return;
    }

    addHistory(`${formatNumber(state.firstOperand)} ${formatOperator[state.operator]} ${formatNumber(inputValue)}`, result.value);
    state.displayValue = formatNumber(result.value);
    state.firstOperand = result.value;
  }

  state.operator = nextOperator;
  state.waitingForSecondOperand = true;
  state.expression = `${formatNumber(state.firstOperand)} ${formatOperator[nextOperator]}`;
  updateDisplay();
}

function performCalculation(first, second, operator) {
  switch (operator) {
    case "+":
      return validateResult(first + second);
    case "-":
      return validateResult(first - second);
    case "×":
      return validateResult(first * second);
    case "÷":
      return second === 0 ? { error: "Division by zero" } : validateResult(first / second);
    case "^":
      return validateResult(first ** second);
    case "mod":
      return second === 0 ? { error: "Modulus by zero" } : validateResult(first % second);
    default:
      return { error: "Invalid operator" };
  }
}

function validateResult(value) {
  if (!Number.isFinite(value)) {
    return { error: "Overflow or invalid result" };
  }

  return { value };
}

function calculateEquals() {
  if (!state.operator || state.firstOperand === null || state.waitingForSecondOperand) {
    return;
  }

  const secondOperand = currentNumber();
  const result = performCalculation(state.firstOperand, secondOperand, state.operator);

  if (result.error) {
    setError(result.error);
    return;
  }

  addHistory(`${formatNumber(state.firstOperand)} ${formatOperator[state.operator]} ${formatNumber(secondOperand)}`, result.value);
  state.displayValue = formatNumber(result.value);
  state.expression = "Result";
  state.firstOperand = null;
  state.operator = null;
  state.waitingForSecondOperand = true;
  updateDisplay();
}

function clearAll() {
  state.displayValue = "0";
  state.firstOperand = null;
  state.operator = null;
  state.waitingForSecondOperand = false;
  state.expression = "Ready";
  updateDisplay();
}

function clearEntry() {
  state.displayValue = "0";
  state.expression = state.operator ? `${formatNumber(state.firstOperand)} ${formatOperator[state.operator]}` : "Entry cleared";
  updateDisplay();
}

function backspace() {
  if (state.waitingForSecondOperand || state.displayValue === "Error") {
    return;
  }

  state.displayValue = state.displayValue.length > 1 ? state.displayValue.slice(0, -1) : "0";
  state.expression = "Backspace";
  updateDisplay();
}

function toggleSign() {
  if (state.displayValue === "0" || state.displayValue === "Error") {
    return;
  }

  state.displayValue = state.displayValue.startsWith("-")
    ? state.displayValue.slice(1)
    : `-${state.displayValue}`;
  state.expression = "Sign toggled";
  updateDisplay();
}

function runUnaryOperation(action) {
  const value = currentNumber();
  let expression = "";
  let result;

  if (state.displayValue === "Error") {
    return;
  }

  switch (action) {
    case "sqrt":
      if (value < 0) {
        setError("Square root of negative number");
        return;
      }
      result = Math.sqrt(value);
      expression = `√(${formatNumber(value)})`;
      break;
    case "square":
      result = value ** 2;
      expression = `(${formatNumber(value)})²`;
      break;
    case "reciprocal":
      if (value === 0) {
        setError("Cannot divide by zero");
        return;
      }
      result = 1 / value;
      expression = `1 / ${formatNumber(value)}`;
      break;
    case "factorial":
      if (!Number.isInteger(value) || value < 0) {
        setError("Factorial needs a non-negative integer");
        return;
      }
      if (value > MAX_FACTORIAL) {
        setError("Factorial overflow");
        return;
      }
      result = factorial(value);
      expression = `${formatNumber(value)}!`;
      break;
    case "percent":
      result = value / 100;
      expression = `${formatNumber(value)}%`;
      break;
    case "absolute":
      result = Math.abs(value);
      expression = `abs(${formatNumber(value)})`;
      break;
    default:
      setError("Invalid operation");
      return;
  }

  const checked = validateResult(result);
  if (checked.error) {
    setError(checked.error);
    return;
  }

  addHistory(expression, checked.value);
  state.displayValue = formatNumber(checked.value);
  state.expression = expression;
  state.waitingForSecondOperand = true;
  updateDisplay();
}

function factorial(number) {
  let total = 1;
  for (let index = 2; index <= number; index += 1) {
    total *= index;
  }
  return total;
}

function handleMemory(action) {
  const value = currentNumber();

  if (state.displayValue === "Error") {
    return;
  }

  if (action === "memory-clear") {
    state.memory = 0;
    state.expression = "Memory cleared";
  }

  if (action === "memory-recall") {
    state.displayValue = formatNumber(state.memory);
    state.expression = "Memory recalled";
    state.waitingForSecondOperand = false;
  }

  if (action === "memory-add") {
    state.memory += value;
    state.expression = "Added to memory";
  }

  if (action === "memory-subtract") {
    state.memory -= value;
    state.expression = "Subtracted from memory";
  }

  updateDisplay();
}

function addHistory(expression, result) {
  state.history.unshift({
    expression,
    result: formatNumber(result),
    id: Date.now(),
  });

  state.history = state.history.slice(0, MAX_HISTORY);
  renderHistory();
}

function renderHistory() {
  elements.historyList.innerHTML = "";
  elements.emptyHistory.hidden = state.history.length > 0;

  state.history.forEach((item) => {
    const entry = document.createElement("li");
    const expression = document.createElement("div");
    const result = document.createElement("div");

    expression.className = "history-expression";
    result.className = "history-result";
    expression.textContent = item.expression;
    result.textContent = `= ${item.result}`;

    entry.append(expression, result);
    entry.addEventListener("click", () => {
      state.displayValue = item.result;
      state.expression = item.expression;
      state.waitingForSecondOperand = true;
      updateDisplay();
    });

    elements.historyList.appendChild(entry);
  });
}

function playSound() {
  if (!state.soundEnabled || !window.AudioContext) {
    return;
  }

  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 520;
  gain.gain.setValueAtTime(0.025, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.08);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.08);
}

function createRipple(button, event) {
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;
  button.appendChild(ripple);
  window.setTimeout(() => ripple.remove(), 560);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 1800);
}

function handleAction(action) {
  if (action.startsWith("memory")) {
    handleMemory(action);
    return;
  }

  const unaryActions = ["sqrt", "square", "reciprocal", "factorial", "percent", "absolute"];
  if (unaryActions.includes(action)) {
    runUnaryOperation(action);
    return;
  }

  const actions = {
    decimal: inputDecimal,
    equals: calculateEquals,
    clear: clearAll,
    "clear-entry": clearEntry,
    backspace,
    "toggle-sign": toggleSign,
  };

  actions[action]?.();
}

function handleButtonClick(event) {
  const button = event.target.closest("button");
  if (!button || !elements.keypad.contains(button)) {
    return;
  }

  playSound();
  createRipple(button, event);

  if (button.dataset.number) {
    inputDigit(button.dataset.number);
  } else if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
  } else if (button.dataset.action) {
    handleAction(button.dataset.action);
  }
}

function flashKey(selector) {
  const button = document.querySelector(selector);
  if (!button) {
    return;
  }

  button.classList.add("is-pressed");
  window.setTimeout(() => button.classList.remove("is-pressed"), 130);
}

function handleKeyboard(event) {
  const key = event.key;
  const operatorKeys = {
    "+": "+",
    "-": "-",
    "*": "×",
    "/": "÷",
    "^": "^",
    "%": "mod",
  };

  if (/^\d$/.test(key)) {
    event.preventDefault();
    inputDigit(key);
    flashKey(`[data-number="${key}"]`);
    playSound();
    return;
  }

  if (key === ".") {
    event.preventDefault();
    inputDecimal();
    flashKey("[data-action='decimal']");
    playSound();
    return;
  }

  if (operatorKeys[key]) {
    event.preventDefault();
    chooseOperator(operatorKeys[key]);
    flashKey(`[data-operator="${operatorKeys[key]}"]`);
    playSound();
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculateEquals();
    flashKey("[data-action='equals']");
    playSound();
    return;
  }

  if (key === "Backspace") {
    event.preventDefault();
    backspace();
    flashKey("[data-action='backspace']");
    playSound();
    return;
  }

  if (key === "Delete" || key.toLowerCase() === "c") {
    event.preventDefault();
    clearAll();
    flashKey("[data-action='clear']");
    playSound();
  }
}

function copyResult() {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(state.displayValue)
      .then(() => showToast("Result copied"))
      .catch(copyWithFallback);
    return;
  }

  copyWithFallback();
}

function copyWithFallback() {
  const temporaryInput = document.createElement("textarea");
  temporaryInput.value = state.displayValue;
  temporaryInput.setAttribute("readonly", "");
  temporaryInput.style.position = "fixed";
  temporaryInput.style.opacity = "0";
  document.body.appendChild(temporaryInput);
  temporaryInput.select();

  try {
    document.execCommand("copy");
    showToast("Result copied");
  } catch {
    showToast("Copy failed");
  } finally {
    temporaryInput.remove();
  }
}

elements.keypad.addEventListener("click", handleButtonClick);
elements.clearHistory.addEventListener("click", () => {
  state.history = [];
  renderHistory();
  showToast("History cleared");
});

elements.themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  elements.themeToggle.querySelector("span").textContent = document.body.classList.contains("light-mode") ? "☀" : "☾";
});

elements.soundToggle.addEventListener("click", () => {
  state.soundEnabled = !state.soundEnabled;
  elements.soundToggle.querySelector("span").textContent = state.soundEnabled ? "♪" : "×";
  updateDisplay(false);
});

elements.copyResult.addEventListener("click", copyResult);
document.addEventListener("keydown", handleKeyboard);

renderHistory();
updateDisplay(false);
