// ============================================================================
// Previous Year MCQ practice
// ============================================================================

var pyqQuestions = [],
    pyqIndex = 0,
    pyqScore = 0,
    pyqAnswered = false;

function pyqElement(selector) {
    return document.querySelector(selector)
}

function renderPyqQuestion() {
    var question = pyqQuestions[pyqIndex];
    if (!question) return;
    pyqElement('[data-pyq-progress]').textContent = 'Question ' + (pyqIndex + 1) + ' / ' + pyqQuestions.length;
    pyqElement('[data-pyq-id]').textContent = question.id;
    pyqElement('[data-pyq-score]').textContent = pyqScore;
    pyqElement('[data-pyq-question]').textContent = question.question;
    pyqElement('[data-pyq-options]').innerHTML = question.options.map(function(option, index) {
        return '<label><input type="radio" name="pyq-answer" value="' + index + '"> <span>' +
            escapeHtml(option) + '</span></label>'
    }).join('');
    pyqElement('[data-pyq-feedback]').textContent = '';
    pyqElement('[data-pyq-feedback]').className = '';
    pyqElement('[data-pyq-solution]').hidden = true;
    pyqElement('[data-pyq-solution]').textContent = '';
    pyqElement('[data-pyq-submit]').disabled = false;
    pyqElement('[data-pyq-previous]').disabled = pyqIndex === 0;
    pyqElement('[data-pyq-next]').disabled = pyqIndex === pyqQuestions.length - 1;
    pyqAnswered = false
}

function showPyqLoadError(message) {
    pyqElement('[data-pyq-progress]').textContent = 'Questions unavailable';
    pyqElement('[data-pyq-question]').textContent = 'The MCQ bank could not be loaded.';
    pyqElement('[data-pyq-feedback]').textContent = message;
    pyqElement('[data-pyq-feedback]').className = 'pyq-error'
}

function getPyqCorrectAnswer(question) {
    var answer = question.answer || question.correct_answer;
    if (typeof answer === 'string') {
        var letter = answer.trim().toUpperCase();
        if (/^[A-Z]$/.test(letter)) return letter.charCodeAt(0) - 65;
        var optionIndex = question.options.indexOf(answer);
        if (optionIndex !== -1) return optionIndex;
    }
    return Number(answer);
}

function loadPyqQuestions() {
    fetch('recursion_100_mcqs.json')
        .then(function(response) {
            if (!response.ok) throw Error('HTTP ' + response.status);
            return response.json()
        })
        .then(function(bank) {
            if (!bank || !Array.isArray(bank.questions) || !bank.questions.length) {
                throw Error('The question bank is empty or has an invalid format.')
            }
            pyqQuestions = bank.questions;
            pyqElement('[data-pyq-total]').textContent = pyqQuestions.length;
            pyqElement('[data-pyq-notice]').textContent = bank.notice || '';
            renderPyqQuestion()
        })
        .catch(function(error) {
            showPyqLoadError('Unable to load the question bank: ' + error.message +
                '. Serve the project with a local web server instead of opening the file directly.')
        })
}

function submitPyqAnswer() {
    if (pyqAnswered) return;
    var selectedOption = pyqElement('input[name="pyq-answer"]:checked'),
        feedback = pyqElement('[data-pyq-feedback]'),
        solution = pyqElement('[data-pyq-solution]'),
        question = pyqQuestions[pyqIndex];
    if (!selectedOption) {
        feedback.textContent = 'Choose an answer first.';
        feedback.className = 'pyq-warning';
        return
    }
    pyqAnswered = true;
    var selectedAnswer = Number(selectedOption.value),
        correctAnswer = getPyqCorrectAnswer(question),
        answerLabel = question.answer || question.correct_answer,
        explanation = question.explanation || question.solution || 'No explanation is available for this question.',
        isCorrect = selectedAnswer === correctAnswer;
    if (isCorrect) pyqScore++;
    feedback.textContent = isCorrect ? 'Correct!' : 'Not quite.';
    feedback.className = isCorrect ? 'pyq-correct' : 'pyq-incorrect';
    solution.innerHTML = '<b>Solution</b><p>' + escapeHtml(explanation) + '</p><small>Correct answer: ' +
        escapeHtml(String(answerLabel)) + '</small>';
    solution.hidden = false;
    pyqElement('[data-pyq-submit]').disabled = true;
    pyqElement('[data-pyq-score]').textContent = pyqScore
}

function openPyqTab() {
    switchTab('q');
    if (!pyqQuestions.length && pyqElement('[data-pyq-question]').textContent === 'Loading questions…') {
        loadPyqQuestions()
    }
}

pyqElement('[data-pyq-submit]').onclick = submitPyqAnswer;
pyqElement('[data-pyq-previous]').onclick = function() {
    if (pyqIndex > 0) {
        pyqIndex--;
        renderPyqQuestion()
    }
};
pyqElement('[data-pyq-next]').onclick = function() {
    if (pyqIndex < pyqQuestions.length - 1) {
        pyqIndex++;
        renderPyqQuestion()
    }
};
pyqElement('[data-pyq-random]').onclick = function() {
    if (pyqQuestions.length < 2) return;
    var nextIndex = pyqIndex;
    while (nextIndex === pyqIndex) nextIndex = Math.floor(Math.random() * pyqQuestions.length);
    pyqIndex = nextIndex;
    renderPyqQuestion()
};
getElement('tq').onclick = openPyqTab;
loadPyqQuestions();
