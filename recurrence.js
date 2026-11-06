// ============================================================================
// Recurrence Relations module
// ============================================================================

var selectedRecurrenceLesson = 0;
var recurrenceExpansionStep = 0;
var recurrenceTreeLevel = 0;
var recurrencePracticeIndex = 0;
var recurrencePracticeScore = 0;
var recurrencePracticeSubmitted = false;

function recurrenceElement(selector) {
    return document.querySelector(selector)
}

function renderRecurrenceTopics() {
    var topicContainer = getElement('recurrenceTopics');
    topicContainer.innerHTML = recurrenceLessons.map(function(lesson, index) {
        return '<button class="recurrence-topic' + (index === selectedRecurrenceLesson ? ' active' : '') +
            '" data-recurrence-topic="' + index + '"><span>' + String(index + 1).padStart(2, '0') +
            '</span><b>' + escapeHtml(lesson.shortTitle) + '</b></button>'
    }).join('');
}

function renderRecurrenceLesson() {
    var lesson = recurrenceLessons[selectedRecurrenceLesson];
    getElement('recurrenceLesson').innerHTML =
        '<article class="recurrence-lesson-card"><div class="recurrence-kicker">Lesson ' +
        (selectedRecurrenceLesson + 1) + ' of ' + recurrenceLessons.length +
        '</div><h1>' + escapeHtml(lesson.title) + '</h1><div class="objective-row">' +
        lesson.objectives.map(function(objective) {
            return '<span>✓ ' + escapeHtml(objective) + '</span>'
        }).join('') + '</div>' + lesson.content +
        '<div class="exam-tip"><b>Exam perspective</b><span>' + escapeHtml(lesson.tip) + '</span></div></article>';
    getElement('recurrenceProgress').textContent = (selectedRecurrenceLesson + 1) + ' / ' + recurrenceLessons.length;
    getElement('recurrencePrevious').disabled = selectedRecurrenceLesson === 0;
    getElement('recurrenceNext').disabled = selectedRecurrenceLesson === recurrenceLessons.length - 1;
    renderRecurrenceTopics();
    bindExpansionVisualizer();
    bindTreeVisualizer();
    bindMasterAnalyzer();
    bindRecurrenceChecker();
    bindCheatSheet();
    bindPractice();
}

function selectRecurrenceLesson(index) {
    selectedRecurrenceLesson = Math.max(0, Math.min(recurrenceLessons.length - 1, index));
    recurrenceExpansionStep = 0;
    recurrenceTreeLevel = 0;
    renderRecurrenceLesson();
}

function expansionLines() {
    return [
        'T(n)     = T(n - 1) + n',
        'T(n - 1) = T(n - 2) + (n - 1)',
        'T(n)     = T(n - 2) + (n - 1) + n',
        'T(n)     = T(n - 3) + (n - 2) + (n - 1) + n',
        '...',
        'T(n)     = T(1) + 2 + 3 + ... + n',
        'T(n)     = 1 + 2 + 3 + ... + n',
        'T(n)     = n(n + 1) / 2 = O(n²)'
    ]
}

function renderExpansion() {
    var output = recurrenceElement('[data-expansion-output]');
    if (!output) return;
    var lines = expansionLines();
    var visibleLines = recurrenceExpansionStep === lines.length ? lines : lines.slice(0, recurrenceExpansionStep + 1);
    output.innerHTML = visibleLines.map(function(line, index) {
        var highlight = index === recurrenceExpansionStep - 1 && index < 4 ? ' class="expansion-new"' : '';
        return '<span' + highlight + '>' + escapeHtml(line) + '</span>'
    }).join('\n') || 'Press “Next step” to begin.';
    var progress = recurrenceElement('[data-expansion-progress]');
    progress.textContent = 'Step ' + recurrenceExpansionStep + ' / ' + lines.length;
}

function bindExpansionVisualizer() {
    var output = recurrenceElement('[data-expansion-output]');
    if (!output) return;
    recurrenceExpansionStep = 0;
    renderExpansion();
    recurrenceElement('[data-expansion-next]').onclick = function() {
        recurrenceExpansionStep = Math.min(expansionLines().length, recurrenceExpansionStep + 1);
        renderExpansion()
    };
    recurrenceElement('[data-expansion-prev]').onclick = function() {
        recurrenceExpansionStep = Math.max(0, recurrenceExpansionStep - 1);
        renderExpansion()
    };
    recurrenceElement('[data-expansion-all]').onclick = function() {
        recurrenceExpansionStep = expansionLines().length;
        renderExpansion()
    };
    recurrenceElement('[data-expansion-reset]').onclick = function() {
        recurrenceExpansionStep = 0;
        renderExpansion()
    };
}

function renderRecursionTree() {
    var tree = recurrenceElement('[data-recursion-tree]');
    if (!tree) return;
    var rows = [];
    for (var level = 0; level <= recurrenceTreeLevel; level++) {
        var nodes = Math.pow(2, level);
        rows.push('<div class="tree-level"><b>L' + level + '</b><span>' +
            Array(nodes).fill(0).map(function() {
                return '<i>' + (level === 0 ? 'n' : 'n/' + Math.pow(2, level)) + '</i>'
            }).join('') + '</span></div>')
    }
    tree.innerHTML = rows.join('');
    recurrenceElement('[data-tree-level]').textContent = recurrenceTreeLevel;
    recurrenceElement('[data-tree-nodes]').textContent = Math.pow(2, recurrenceTreeLevel);
    recurrenceElement('[data-tree-work]').textContent = 'n';
    recurrenceElement('[data-tree-status]').textContent = 'Showing levels 0–' + recurrenceTreeLevel;
}

function bindTreeVisualizer() {
    if (!recurrenceElement('[data-recursion-tree]')) return;
    recurrenceTreeLevel = 0;
    renderRecursionTree();
    recurrenceElement('[data-tree-next]').onclick = function() {
        recurrenceTreeLevel = Math.min(4, recurrenceTreeLevel + 1);
        renderRecursionTree()
    };
    recurrenceElement('[data-tree-prev]').onclick = function() {
        recurrenceTreeLevel = Math.max(0, recurrenceTreeLevel - 1);
        renderRecursionTree()
    };
    recurrenceElement('[data-tree-all]').onclick = function() {
        recurrenceTreeLevel = 4;
        renderRecursionTree()
    };
    recurrenceElement('[data-tree-reset]').onclick = function() {
        recurrenceTreeLevel = 0;
        renderRecursionTree()
    };
}

function parseGrowthFunction(expression) {
    var normalized = expression.toLowerCase().replace(/\s/g, '');
    var matches = {
        '1': { degree: 0, logPower: 0, label: '1' },
        'logn': { degree: 0, logPower: 1, label: 'log n' },
        'n': { degree: 1, logPower: 0, label: 'n' },
        'nlogn': { degree: 1, logPower: 1, label: 'n log n' },
        'n^2': { degree: 2, logPower: 0, label: 'n²' },
        'n^3': { degree: 3, logPower: 0, label: 'n³' }
    };
    return matches[normalized] || null
}

function analyzeMasterTheorem() {
    var a = Number(recurrenceElement('[data-master-a]').value);
    var b = Number(recurrenceElement('[data-master-b]').value);
    var expression = recurrenceElement('[data-master-f]').value;
    var result = recurrenceElement('[data-master-result]');
    var growth = parseGrowthFunction(expression);
    if (!Number.isFinite(a) || a < 1 || !Number.isFinite(b) || b <= 1) {
        result.innerHTML = '<strong>Check the inputs.</strong> Use <code>a ≥ 1</code> and <code>b &gt; 1</code>.';
        return
    }
    if (!growth) {
        result.innerHTML = '<strong>Unsupported f(n).</strong> Choose one of the supported growth forms.';
        return
    }
    var criticalExponent = Math.log(a) / Math.log(b);
    var criticalLabel = 'n^(' + criticalExponent.toFixed(2) + ')';
    var complexity;
    var caseName;
    if (growth.degree < criticalExponent - 0.0001) {
        caseName = 'Case 1';
        complexity = 'O(' + criticalLabel + ')'
    } else if (Math.abs(growth.degree - criticalExponent) < 0.0001) {
        caseName = 'Case 2';
        complexity = 'O(' + criticalLabel + (growth.logPower ? ' log^' + (growth.logPower + 1) + ' n' : ' log n') + ')'
    } else {
        caseName = 'Case 3';
        complexity = 'O(' + growth.label + ')'
    }
    var formattedComplexity = complexity.replace(/\^\(([^)]+)\)/g, '<sup>$1</sup>');
    result.innerHTML = '<b>Step 1 · Critical term</b><div class="math-display small">n<sup>log<sub>' + b + '</sub>(' + a + ')</sup> ≈ n<sup>' + criticalExponent.toFixed(2) +
        '</sup></div><b>Step 2 · Compare</b><div class="math-display small">f(n) = ' + growth.label + '</div><b>Step 3 · Result</b><div class="analyzer-answer">' +
        caseName + ' <span>→</span> <strong>' + formattedComplexity + '</strong></div>' +
        (caseName === 'Case 3' ? '<br><small>For this supported polynomial form, the regularity condition is satisfied.</small>' : '')
}

function bindMasterAnalyzer() {
    if (recurrenceElement('[data-master-analyze]')) {
        recurrenceElement('[data-master-analyze]').onclick = analyzeMasterTheorem;
        analyzeMasterTheorem()
    }
}

function bindRecurrenceChecker() {
    var button = recurrenceElement('[data-check-recurrence]');
    if (!button) return;
    button.onclick = function() {
        var values = {};
        ['a', 'b', 'f'].forEach(function(key) {
            values[key] = recurrenceElement('[data-recurrence-check="' + key + '"]').value
        });
        recurrenceElement('[data-check-result]').textContent =
            values.a === '3' && values.b === '2' && values.f === 'n' ? ' Correct: a = 3, b = 2, f(n) = n.' : ' Not quite. The answer is a = 3, b = 2, f(n) = n.';
    }
}

var recurrenceCheatSheet = [
    ['T(n) = T(n - 1) + 1', 'O(n)'], ['T(n) = T(n - 1) + n', 'O(n²)'],
    ['T(n) = T(n - 1) + n²', 'O(n³)'], ['T(n) = T(n/2) + 1', 'O(log n)'],
    ['T(n) = T(n/2) + n', 'O(n)'], ['T(n) = 2T(n/2) + 1', 'O(n)'],
    ['T(n) = 2T(n/2) + n', 'O(n log n)'], ['T(n) = 2T(n/2) + n²', 'O(n²)'],
    ['T(n) = 4T(n/2) + n', 'O(n²)'], ['T(n) = 3T(n/2) + n', 'O(n^(log₂3))'],
    ['T(n) = 2T(n - 1) + 1', 'O(2^n)']
];

function renderCheatSheet(filter) {
    recurrenceElement('[data-cheat-table]').innerHTML = recurrenceCheatSheet.filter(function(row) {
        return row.join(' ').toLowerCase().includes(filter.toLowerCase())
    }).map(function(row) {
        return '<div><code>' + escapeHtml(row[0]) + '</code><strong>' + escapeHtml(row[1]) + '</strong></div>'
    }).join('') || '<p class="muted">No matching recurrence found.</p>';
}

function bindCheatSheet() {
    var input = recurrenceElement('[data-cheat-search]');
    if (!input) return;
    renderCheatSheet('');
    input.oninput = function() {
        renderCheatSheet(input.value)
    }
}

function renderPracticeQuestion() {
    var question = recurrencePracticeQuestions[recurrencePracticeIndex];
    recurrenceElement('[data-practice-progress]').textContent =
        'Question ' + (recurrencePracticeIndex + 1) + ' / ' + recurrencePracticeQuestions.length;
    recurrenceElement('[data-practice-score]').textContent = recurrencePracticeScore;
    recurrenceElement('[data-recurrence-question]').innerHTML =
        '<h3>' + escapeHtml(question.q) + '</h3><div class="answer-options">' +
        question.options.map(function(option, index) {
            return '<label><input type="radio" name="recurrenceAnswer" value="' + index + '"> ' + escapeHtml(option) + '</label>'
        }).join('') + '</div><div class="practice-explanation" data-practice-explanation hidden></div>';
    recurrenceElement('[data-practice-feedback]').textContent = '';
    recurrenceElement('[data-practice-submit]').disabled = false;
    recurrencePracticeSubmitted = false;
}

function bindPractice() {
    if (!recurrenceElement('[data-recurrence-question]')) return;
    renderPracticeQuestion();
    recurrenceElement('[data-practice-submit]').onclick = function() {
        if (recurrencePracticeSubmitted) return;
        var selected = recurrenceElement('input[name="recurrenceAnswer"]:checked');
        var feedback = recurrenceElement('[data-practice-feedback]');
        var explanation = recurrenceElement('[data-practice-explanation]');
        if (!selected) {
            feedback.textContent = 'Choose an answer first.';
            return
        }
        recurrencePracticeSubmitted = true;
        var question = recurrencePracticeQuestions[recurrencePracticeIndex];
        var correct = Number(selected.value) === question.answer;
        if (correct) recurrencePracticeScore++;
        feedback.textContent = correct ? 'Correct!' : 'Not quite.';
        feedback.className = correct ? 'feedback correct' : 'feedback incorrect';
        explanation.textContent = question.explanation;
        explanation.hidden = false;
        recurrenceElement('[data-practice-submit]').disabled = true;
        recurrenceElement('[data-practice-score]').textContent = recurrencePracticeScore;
    };
    recurrenceElement('[data-practice-next]').onclick = function() {
        recurrencePracticeIndex = (recurrencePracticeIndex + 1) % recurrencePracticeQuestions.length;
        renderPracticeQuestion()
    };
}

function openRecurrenceModule() {
    switchTab('r');
    renderRecurrenceLesson()
}

getElement('tr').onclick = openRecurrenceModule;
getElement('recurrencePrevious').onclick = function() {
    selectRecurrenceLesson(selectedRecurrenceLesson - 1)
};
getElement('recurrenceNext').onclick = function() {
    selectRecurrenceLesson(selectedRecurrenceLesson + 1)
};
getElement('recurrenceTopics').onclick = function(event) {
    var topic = event.target.closest('[data-recurrence-topic]');
    if (topic) selectRecurrenceLesson(Number(topic.getAttribute('data-recurrence-topic')))
};
renderRecurrenceLesson();
