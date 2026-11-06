// ============================================================================
// Recurrence Relations exam question bank
// ============================================================================

var recurrencePracticeQuestions = [
    { q: 'What is the complexity of T(n) = T(n - 1) + 1?', options: ['O(log n)', 'O(n)', 'O(n²)', 'O(2^n)'], answer: 1, explanation: 'There are n layers and constant work at each layer, so the total is O(n).' },
    { q: 'Which recurrence describes merge sort?', options: ['T(n) = T(n/2) + 1', 'T(n) = T(n - 1) + n', 'T(n) = 2T(n/2) + n', 'T(n) = 2T(n - 1) + 1'], answer: 2, explanation: 'Merge sort recursively sorts two halves and merges them in linear time.' },
    { q: 'For T(n) = 2T(n/2) + n, what is the cost of each tree level?', options: ['1', 'n/2', 'n', 'n²'], answer: 2, explanation: 'At level k there are 2^k nodes, each costing n/2^k, so the total is n.' },
    { q: 'For T(n) = 2T(n/2) + n², which Master Theorem case applies?', options: ['Case 1', 'Case 2', 'Case 3', 'No recurrence'], answer: 2, explanation: 'The critical term is n. The n² non-recursive work is polynomially larger, and the regularity condition holds.' },
    { q: 'What is the complexity of T(n) = T(n/2) + n?', options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'], answer: 1, explanation: 'The level costs are n + n/2 + n/4 + ..., a geometric sum bounded by 2n.' },
    { q: 'A function makes two calls with n - 1 and does constant work. What is its call-count order?', options: ['O(n)', 'O(n log n)', 'O(2^n)', 'O(n²)'], answer: 2, explanation: 'The recurrence is C(n) = 2C(n - 1) + 1, which doubles along the recursion.' },
    { q: 'Which statement is correct?', options: ['Master Theorem solves every recurrence.', 'Tree height always equals time.', 'T(n)=2T(n/2) is O(n).', 'T(n/2)+n is O(n log n).'], answer: 2, explanation: 'There are 2^log₂n = n leaves, with constant work per leaf.' },
    { q: 'What is the worst-case recurrence for quicksort?', options: ['T(n)=T(n/2)+n', 'T(n)=2T(n/2)+n', 'T(n)=T(n-1)+n', 'T(n)=T(n-1)+1'], answer: 2, explanation: 'A pivot that repeatedly creates a size n-1 subproblem leaves linear partition work at every level.' },
    { q: 'What is the result of 1 + 2 + ... + n?', options: ['O(log n)', 'O(n)', 'O(n²)', 'O(n³)'], answer: 2, explanation: 'The closed form is n(n+1)/2, which grows quadratically.' },
    { q: 'For 3T(n/2)+n, which result is expected?', options: ['O(n)', 'O(n log n)', 'O(n^(log₂3))', 'O(n²)'], answer: 2, explanation: 'Here a=3, b=2, and n is smaller than n^(log₂3), so the leaf term dominates.' }
];
