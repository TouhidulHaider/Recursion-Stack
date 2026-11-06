// ============================================================================
// Recurrence Relations curriculum
// ============================================================================

var recurrenceLessons = [
    {
        title: 'Start Here: What is a recurrence?',
        shortTitle: 'Start Here',
        objectives: ['Translate recursive code into T(n)', 'Separate base work from recursive work', 'Distinguish time from space'],
        content: `
            <p class="lead">A recurrence relation describes the cost of a problem in terms of the cost of smaller problems.</p>
            <div class="recurrence-definition"><b>Think of it as a cost recipe:</b> solve smaller instances, then add the work done at the current call.</div>
            <div class="recurrence-columns">
                <section><h3>Recursion vs recurrence</h3><p><b>Recursion</b> is the program calling itself. A <b>recurrence</b> is the mathematical equation that counts the program's work.</p><pre>count(n):
    if n &lt;= 0: return
    count(n - 1)</pre></section>
                <section><h3>Translate the structure</h3><p><code>T(n)</code> is total time, <code>a</code> is the number of subproblems, <code>n / b</code> is the size of each, and <code>f(n)</code> is work outside recursive calls.</p><div class="equation">T(n) = aT(n / b) + f(n)</div></section>
            </div>
            <div class="recurrence-columns">
                <section><h3>Example: decrease by one</h3><pre>count(n):
    if n &lt;= 0: return
    count(n - 1)</pre><div class="equation">T(n) = T(n - 1) + c<br>T(0) = c</div><p>There is one smaller call and constant work, so the depth is <code>n</code> and time is <b>O(n)</b>.</p></section>
                <section><h3>Example: halve the input</h3><pre>binarySearch(n):
    if n &lt;= 1: return
    binarySearch(n / 2)</pre><div class="equation">T(n) = T(n / 2) + c<br>T(1) = c</div><p>Halving reaches 1 after about <code>log₂ n</code> steps, so time is <b>O(log n)</b>.</p></section>
            </div>
            <div class="concept-callout"><b>Base case:</b> the smallest input and its cost. <b>Recursive case:</b> smaller calls plus current work. <b>Space:</b> usually the deepest simultaneous stack, not the total number of calls.</div>
            <div class="mini-checker">
                <h3>Identify the recurrence parts</h3><p>For <code>T(n) = 3T(n / 2) + n</code>, choose the values.</p>
                <label>a <select data-recurrence-check="a"><option value="">Choose</option><option>2</option><option>3</option><option>n</option></select></label>
                <label>b <select data-recurrence-check="b"><option value="">Choose</option><option>1</option><option>2</option><option>3</option></select></label>
                <label>f(n) <select data-recurrence-check="f"><option value="">Choose</option><option>1</option><option>n</option><option>n²</option></select></label>
                <button data-check-recurrence class="p">Check</button><span data-check-result></span>
            </div>`,
        tip: 'Exam questions often hide the recurrence inside a short recursive function. Count calls and current work separately.'
    },
    {
        title: 'Iteration Method: Expand until the base case',
        shortTitle: 'Iteration Method',
        objectives: ['Expand one substitution at a time', 'Recognize summations', 'Convert a sum to O notation'],
        content: `
            <p class="lead">The iteration method repeatedly substitutes the recurrence into itself. At every line, we replace the remaining <span class="math-inline">T(…)</span> with its recurrence until the base case appears.</p>
            <div class="iteration-rule"><b>Write this beside your work:</b><span class="math-display small">T(n) = T(g(n)) + f(n)</span><span>Replace <span class="math-inline">T(n)</span> with <span class="math-inline">T(g(n)) + f(n)</span>, then repeat the same replacement on the smaller term.</span></div>
            <h3>Pattern 1 · Constant work at each level</h3>
            <div class="iteration-example">
                <div class="iteration-example-heading"><span>Recurrence</span><strong>Decrease by one</strong></div>
                <div class="math-display">T(n) = T(n − 1) + 1, &nbsp; T(1) = 1</div>
                <div class="iteration-step"><b>Start</b><div class="math-display small">T(n) = T(n − 1) + 1</div><p>There is one recursive call on an input that is one smaller, plus one unit of current work.</p></div>
                <div class="iteration-step"><b>Substitute once</b><div class="math-display small">T(n) = [T(n − 2) + 1] + 1</div><p>Replace <span class="math-inline">T(n − 1)</span> using the same rule. The new <span class="math-inline">+1</span> is the work from that second level.</p></div>
                <div class="iteration-step"><b>Substitute twice</b><div class="math-display small">T(n) = [[T(n − 3) + 1] + 1] + 1</div><p>One more substitution creates one more constant term.</p></div>
                <div class="iteration-step"><b>Continue until the base case</b><div class="math-display small">T(n) = T(1) + 1 + 1 + ··· + 1</div><p>Reducing from <span class="math-inline">n</span> to <span class="math-inline">1</span> takes <span class="math-inline">n − 1</span> substitutions.</p></div>
                <div class="iteration-step"><b>Count the terms</b><div class="math-display small">T(n) = 1 + (n − 1) = n</div><p>The base cost is constant and there are <span class="math-inline">n − 1</span> constant additions.</p></div>
                <div class="iteration-conclusion">Therefore, <strong>T(n) = O(n)</strong>.</div>
            </div>
            <h3>Pattern 2 · Linear work at each level</h3>
            <div class="iteration-example">
                <div class="iteration-example-heading"><span>Recurrence</span><strong>Sum of integers</strong></div>
                <div class="math-display">T(n) = T(n − 1) + n, &nbsp; T(1) = 1</div>
                <div class="iteration-step"><b>Start</b><div class="math-display small">T(n) = T(n − 1) + n</div><p>The current call contributes <span class="math-inline">n</span> units of work.</p></div>
                <div class="iteration-step"><b>Substitute once</b><div class="math-display small">T(n) = [T(n − 2) + (n − 1)] + n</div><p>At the next call, the input is <span class="math-inline">n − 1</span>, so its local work is <span class="math-inline">n − 1</span>.</p></div>
                <div class="iteration-step"><b>Substitute twice</b><div class="math-display small">T(n) = [[T(n − 3) + (n − 2)] + (n − 1)] + n</div><p>Each substitution exposes the work from one earlier level.</p></div>
                <div class="iteration-step"><b>Continue to the base case</b><div class="math-display small">T(n) = T(1) + 2 + 3 + ··· + (n − 1) + n</div><p>Now the recursive part is exactly the base case, so expansion stops.</p></div>
                <div class="iteration-step"><b>Use the sum formula</b><div class="math-display small">T(n) = 1 + (1 + 2 + ··· + n)</div><div class="math-display small">1 + 2 + ··· + n = <span class="fraction"><span>n(n + 1)</span><span>2</span></span></div><p>The added 1 is the base-case cost.</p></div>
                <div class="iteration-step"><b>Keep the dominant term</b><div class="math-display small">T(n) = 1 + <span class="fraction"><span>n(n + 1)</span><span>2</span></span> = O(n²)</div><p>After expansion, the highest-degree term is proportional to <span class="math-inline">n²</span>.</p></div>
                <div class="iteration-conclusion">Therefore, <strong>T(n) = O(n²)</strong>.</div>
            </div>
            <h3>Pattern 3 · Quadratic work at each level</h3>
            <div class="iteration-example">
                <div class="iteration-example-heading"><span>Recurrence</span><strong>Sum of squares</strong></div>
                <div class="math-display">T(n) = T(n − 1) + n², &nbsp; T(1) = 1</div>
                <div class="iteration-step"><b>First substitutions</b><div class="math-display small">T(n) = [T(n − 2) + (n − 1)²] + n²</div><div class="math-display small">T(n) = [[T(n − 3) + (n − 2)²] + (n − 1)²] + n²</div><p>The input drops by one each time, so the local costs are consecutive squares.</p></div>
                <div class="iteration-step"><b>Reach the base case</b><div class="math-display small">T(n) = T(1) + 2² + 3² + ··· + (n − 1)² + n²</div></div>
                <div class="iteration-step"><b>Use the sum-of-squares formula</b><div class="math-display small">1² + 2² + ··· + n² = <span class="fraction"><span>n(n + 1)(2n + 1)</span><span>6</span></span></div><p>This expression has highest-degree term <span class="math-inline">n³ / 3</span>.</p></div>
                <div class="iteration-step"><b>Read the growth rate</b><div class="math-display small">T(n) = O(n³)</div><p>Summing a quadratic amount of work over <span class="math-inline">n</span> levels produces cubic growth.</p></div>
                <div class="iteration-conclusion">Therefore, <strong>T(n) = O(n³)</strong>.</div>
            </div>
            <h3>Pattern 4 · The input is divided by two</h3>
            <div class="iteration-example">
                <div class="iteration-example-heading"><span>Recurrence</span><strong>Constant work after halving</strong></div>
                <div class="math-display">T(n) = T(n / 2) + 1, &nbsp; T(1) = 1</div>
                <div class="iteration-step"><b>Substitute once</b><div class="math-display small">T(n) = T(n / 2²) + 1 + 1</div><p>Applying the recurrence to <span class="math-inline">T(n / 2)</span> halves the input again.</p></div>
                <div class="iteration-step"><b>Substitute repeatedly</b><div class="math-display small">T(n) = T(n / 2ᵏ) + k</div><p>After <span class="math-inline">k</span> substitutions, there are <span class="math-inline">k</span> units of accumulated work.</p></div>
                <div class="iteration-step"><b>Stop at the base case</b><div class="math-display small">n / 2ᵏ = 1</div><div class="math-display small">2ᵏ = n &nbsp; → &nbsp; k = log₂ n</div><p>The number of halvings is the recursion depth.</p></div>
                <div class="iteration-conclusion">Therefore, <strong>T(n) = O(log n)</strong>.</div>
            </div>
            <h3>Pattern 5 · Halving with linear work</h3>
            <div class="iteration-example">
                <div class="iteration-example-heading"><span>Recurrence</span><strong>Geometric sum</strong></div>
                <div class="math-display">T(n) = T(n / 2) + n, &nbsp; T(1) = 1</div>
                <div class="iteration-step"><b>Substitute once</b><div class="math-display small">T(n) = [T(n / 4) + n / 2] + n</div><p>The next level works on half the input, so its local cost is <span class="math-inline">n / 2</span>.</p></div>
                <div class="iteration-step"><b>Substitute twice</b><div class="math-display small">T(n) = T(n / 8) + n / 4 + n / 2 + n</div><p>The work forms a geometric sequence: <span class="math-inline">n, n/2, n/4, …</span>.</p></div>
                <div class="iteration-step"><b>Continue to the base case</b><div class="math-display small">T(n) = T(1) + n + n/2 + n/4 + ··· + 1</div><p>There are <span class="math-inline">log₂ n</span> levels, but the terms shrink rapidly.</p></div>
                <div class="iteration-step"><b>Bound the geometric sum</b><div class="math-display small">n + n/2 + n/4 + ··· + 1 &lt; 2n</div><p>The entire geometric sum is less than twice its first term.</p></div>
                <div class="iteration-conclusion">Therefore, <strong>T(n) = O(n)</strong>.</div>
            </div>
            <div class="concept-callout"><b>Exam checklist:</b> expand until the base case, count how many substitutions occurred, identify the resulting sum, and only then simplify to O notation.</div>`,
        tip: 'Never jump from the recurrence to the final O bound. Show the substitution pattern first; it reveals whether you have a linear, polynomial, logarithmic, or geometric sum.'
    },
    {
        title: 'Recursion Tree Method',
        shortTitle: 'Recursion Tree',
        objectives: ['Read cost per level', 'Count nodes and leaves', 'Sum level costs'],
        content: `
            <p class="lead">A recursion tree turns every recursive call into a node. Add the work at each level, then add the levels.</p>
            <div class="equation">T(n) = 2T(n / 2) + n</div>
            <div class="tree-controls"><button data-tree-prev>← Collapse</button><button data-tree-next class="p">Expand level →</button><button data-tree-all>Complete tree</button><button data-tree-reset>Reset</button><span data-tree-status></span></div>
            <div class="recursion-tree" data-recursion-tree></div>
            <div class="level-summary"><b>Current level:</b> <span data-tree-level>0</span><b>Nodes:</b> <span data-tree-nodes>1</span><b>Work this level:</b> <span data-tree-work>n</span></div>
            <div class="tree-table"><div><b>Level</b><b>Nodes</b><b>Work/node</b><b>Total</b></div><div><span>0</span><code>1</code><code>n</code><strong>n</strong></div><div><span>1</span><code>2</code><code>n/2</code><strong>n</strong></div><div><span>2</span><code>4</code><code>n/4</code><strong>n</strong></div><div><span>k</span><code>2^k</code><code>n/2^k</code><strong>n</strong></div></div>
            <div class="solution-steps"><div><b>Height</b><code>log₂ n</code> levels</div><div><b>Each level</b><code>2^k · (n / 2^k) = n</code></div><div><b>Total</b><strong>n · log n = O(n log n)</strong></div></div>
            <h3>Compare common trees</h3><div class="example-grid"><div><code>2T(n/2) + 1</code><b>O(n)</b><small>constant work per node</small></div><div><code>2T(n/2) + n²</code><b>O(n²)</b><small>root dominates</small></div><div><code>4T(n/2) + n</code><b>O(n²)</b><small>leaves dominate</small></div><div><code>3T(n/2) + n</code><b>O(n^(log₂3))</b><small>leaf growth dominates</small></div></div>`,
        tip: 'Tree height is not automatically total time. Multiply nodes by cost per node at each level.'
    },
    {
        title: 'Master Theorem',
        shortTitle: 'Master Theorem',
        objectives: ['Find the critical exponent', 'Compare the two growth rates', 'Choose the correct case'],
        content: `
            <p class="lead">The Master Theorem solves divide-and-conquer recurrences by comparing the cost of recursive work with the work done outside the recursive calls.</p>
            <div class="master-formula" aria-label="Master theorem form">
                <span class="math-label">The standard form</span>
                <span class="math-display">T(n) = aT(n / b) + f(n)</span>
                <span class="math-note">with <strong>a ≥ 1</strong>, <strong>b &gt; 1</strong>, and <strong>f(n)</strong> as the non-recursive work.</span>
            </div>
            <div class="master-meaning">
                <h3>What each symbol means</h3>
                <div class="symbol-grid">
                    <div><strong>a</strong><span>number of subproblems</span></div>
                    <div><strong>b</strong><span>factor by which the input shrinks</span></div>
                    <div><strong>f(n)</strong><span>work done at the current level</span></div>
                    <div><strong>n<sup>log<sub>b</sub>a</sup></strong><span>the critical growth rate</span></div>
                </div>
            </div>
            <div class="master-method">
                <h3>The three-step method</h3>
                <ol>
                    <li><b>Find the critical exponent.</b><span>Calculate <span class="math-inline">p = log<sub>b</sub>a</span>, then write the critical term as <span class="math-inline">n<sup>p</sup></span>.</span></li>
                    <li><b>Compare growth rates.</b><span>Compare <span class="math-inline">f(n)</span> with <span class="math-inline">n<sup>p</sup></span>. “Smaller”, “same”, and “larger” determine Cases 1, 2, and 3.</span></li>
                    <li><b>Apply the matching result.</b><span>Do not compare coefficients; compare the powers of <span class="math-inline">n</span> and any logarithmic factor.</span></li>
                </ol>
            </div>
            <div class="master-cases">
                <article class="master-case case-one">
                    <div class="case-heading"><span class="case-number">1</span><div><b>Case 1: <em>f(n)</em> is smaller</b><small>Recursive branching dominates.</small></div></div>
                    <div class="math-display compact">f(n) = O(n<sup>p − ε</sup>)</div>
                    <div class="case-result"><span>Answer</span><strong>T(n) = O(n<sup>p</sup>)</strong></div>
                </article>
                <article class="master-case case-two">
                    <div class="case-heading"><span class="case-number">2</span><div><b>Case 2: same growth</b><small>Every level contributes comparable work.</small></div></div>
                    <div class="math-display compact">f(n) = O(n<sup>p</sup> log<sup>k</sup> n)</div>
                    <div class="case-result"><span>Answer</span><strong>T(n) = O(n<sup>p</sup> log<sup>k+1</sup> n)</strong></div>
                </article>
                <article class="master-case case-three">
                    <div class="case-heading"><span class="case-number">3</span><div><b>Case 3: <em>f(n)</em> is larger</b><small>Current-level work dominates.</small></div></div>
                    <div class="math-display compact">f(n) = Ω(n<sup>p + ε</sup>)</div>
                    <div class="case-result"><span>Answer</span><strong>T(n) = O(f(n))</strong></div>
                    <small class="regularity">Requires the regularity check: <span class="math-inline">a f(n / b) ≤ c f(n)</span> for a constant <span class="math-inline">c &lt; 1</span>.</small>
                </article>
            </div>
            <div class="worked-example master-worked-example">
                <div class="worked-heading"><span>Worked example</span><strong>Merge sort</strong></div>
                <div class="math-display">T(n) = 2T(n / 2) + n</div>
                <div class="worked-step"><b>1. Identify a and b</b><span>There are two subproblems, each of size <span class="math-inline">n / 2</span>.</span><div class="math-display small">a = 2, &nbsp; b = 2</div></div>
                <div class="worked-step"><b>2. Find the critical term</b><span>First calculate the exponent:</span><div class="math-display small">p = log<sub>2</sub>2 = 1 &nbsp; → &nbsp; n<sup>p</sup> = n</div></div>
                <div class="worked-step"><b>3. Compare with f(n)</b><span>The non-recursive work is <span class="math-inline">f(n) = n</span>, so it has the same growth as the critical term.</span><div class="math-display small">f(n) = O(n<sup>p</sup>)</div></div>
                <div class="worked-conclusion"><b>Therefore this is Case 2:</b><span class="math-display small">T(n) = O(n log n)</span></div>
            </div>
            <div class="master-analyzer"><div class="analyzer-heading"><div><h3>Try the decision process</h3><p>Enter <span class="math-inline">a</span>, <span class="math-inline">b</span>, and choose <span class="math-inline">f(n)</span>. The analyzer will show the comparison.</p></div></div><div class="analyzer-fields"><label><span>a</span><input data-master-a type="number" min="1" value="2"></label><label><span>b</span><input data-master-b type="number" min="2" value="2"></label><label><span>f(n)</span><select data-master-f><option value="1">1</option><option value="log n">log n</option><option value="n">n</option><option value="n log n">n log n</option><option value="n^2">n²</option><option value="n^3">n³</option></select></label><button data-master-analyze class="p">Analyze recurrence</button></div><div data-master-result class="analyzer-result"></div></div>
            <p class="muted">The analyzer supports common growth forms. For recurrences such as <span class="math-inline">T(n) = T(n − 1) + n</span>, use iteration or a recursion tree instead.</p>`,
        tip: 'The Master Theorem does not directly solve T(n) = T(n - 1) + n or arbitrary nested recurrences.'
    },
    {
        title: 'Common DSA Algorithm Recurrences',
        shortTitle: 'DSA Recurrences',
        objectives: ['Derive recurrences from pseudocode', 'Connect algorithms to complexity', 'Recognize balanced and unbalanced recursion'],
        content: `
            <p class="lead">The recurrence is the bridge between an algorithm's control flow and its asymptotic complexity.</p>
            <div class="algorithm-grid"><article><h3>Binary Search</h3><pre>search(half)
constant comparison</pre><code>T(n) = T(n/2) + 1</code><strong>O(log n)</strong></article><article><h3>Merge Sort</h3><pre>sort(left half)
sort(right half)
merge in linear time</pre><code>T(n) = 2T(n/2) + n</code><strong>O(n log n)</strong></article><article><h3>Quick Sort</h3><pre>balanced partitions
partition in linear time</pre><code>T(n) = 2T(n/2) + n</code><strong>O(n log n)</strong><small>Worst case: <code>T(n) = T(n - 1) + n = O(n²)</code>.</small></article><article><h3>Recursive Fibonacci</h3><pre>fib(n - 1)
fib(n - 2)
constant work</pre><code>T(n) = T(n-1) + T(n-2) + 1</code><strong>O(2^n)</strong><small>Its tight growth is exponential; memoization changes the story.</small></article></div>`,
        tip: 'First count recursive branches, then identify the size of each branch and the work outside calls.'
    },
    {
        title: 'Complexity Cheat Sheet',
        shortTitle: 'Cheat Sheet',
        objectives: ['Search common recurrence patterns', 'Compare growth rates', 'Avoid common exam mistakes'],
        content: `
            <p class="lead">Use this reference after you understand how the formulas are derived.</p>
            <input class="cheat-search" data-cheat-search placeholder="Filter by recurrence or complexity...">
            <div class="cheat-table" data-cheat-table></div>
            <h3>Growth-rate map</h3><div class="growth-chart"><div style="height:16%">O(1)</div><div style="height:25%">O(log n)</div><div style="height:38%">O(n)</div><div style="height:51%">O(n log n)</div><div style="height:67%">O(n²)</div><div style="height:82%">O(n³)</div><div style="height:96%">O(2^n)</div></div>
            <div class="trap-grid"><b>Exam traps</b><span><code>2T(n/2)</code> is <strong>O(n)</strong>, not O(n log n).</span><span><code>T(n/2) + n</code> is <strong>O(n)</strong>.</span><span><code>T(n - 1) + n</code> is <strong>O(n²)</strong>.</span><span>Tree height is not always total time.</span><span>Master Theorem does not solve every recurrence.</span></div>`,
        tip: 'Filter the table by a recurrence, a method, or an asymptotic answer.'
    },
    {
        title: 'Exam Practice',
        shortTitle: 'Exam Practice',
        objectives: ['Apply patterns under time pressure', 'Explain answers mathematically', 'Build confidence with mixed questions'],
        content: `
            <p class="lead">Try each question before revealing the explanation. Questions are kept in a separate bank so more can be added.</p>
            <div class="practice-header"><span data-practice-progress></span><span>Score: <b data-practice-score>0</b></span></div>
            <div data-recurrence-question class="exam-question"></div>
            <div class="practice-actions"><button data-practice-submit class="p">Submit answer</button><button data-practice-next>Next question →</button><span data-practice-feedback></span></div>`,
        tip: 'Write the recurrence before choosing an asymptotic answer.'
    }
];
