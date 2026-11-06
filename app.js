// ============================================================================
// Shared UI icons and small DOM helpers
// ============================================================================

var iconPathData = {
    book: '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
    sum: '<text x="12" y="17" text-anchor="middle" font-size="18" font-family="Georgia, serif">∑</text>',
    flask: '<path d="M10 2v7.3L4.5 19a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9.3V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    skip: '<path d="M19 20 9 12l10-8z"/><path d="M5 19V5"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    play: '<path d="M6 4l14 8-14 8z"/>',
    pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.2 3.2"/><path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.5 8 10 8c1.8 0 3.4-.5 4.8-1.2"/><path d="m2 2 20 20"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    warn: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    down: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    up: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    swap: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>'
};

function createIcon(n, c) {
    return '<svg class="ic' + (c ? ' ' + c : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + iconPathData[n] + '</svg>'
}

// ============================================================================
// Built-in lesson tracing engine
//
// Each lesson receives recordCall and recordOutput callbacks. recordCall records a recursive
// call, while recordOutput records printed output. Together they produce the step-by-step trace
// shown by the stack, output, and call-tree panels.
// ============================================================================

var sharedStaticCounter = 0,
    getElement = function(x) {
        return document.getElementById(x)
    },
    escapeHtml = function(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    };

function buildTrace(lesson) {
    var callStack = [{
            id: -1,
            callLabel: 'main()'
        }],
        callTreePath = [{
            k: []
        }],
        outputValues = [],
        traceSteps = [],
        activeCallIds = [],
        returnedValues = {},
        callCount = 0,
        outputSeparator = lesson.sep === undefined ? ' ' : lesson.sep;

    function recordTraceStep(m, ln) {
        if (traceSteps.length > 2500 && !hasError) throw Error('Trace too long (over 2500 steps). Try a smaller input.');
        traceSteps.push({
            callStack: callStack.slice(),
            outputValues: outputValues.slice(),
            m: m,
            ln: ln,
            activeCallIds: activeCallIds.slice(),
            returnedValues: Object.assign({}, returnedValues),
            w: lesson.w ? lesson.w() : ''
        })
    }

    function recordCall(callLabel, ln, executeFrame) {
        var callNode = {
            id: callCount++,
            callLabel: callLabel,
            k: []
        };
        callTreePath[callTreePath.length - 1].k.push(callNode);
        callTreePath.push(callNode);
        callStack.push({
            id: callNode.id,
            callLabel: callLabel
        });
        activeCallIds.push(callNode.id);
        recordTraceStep('<b>' + escapeHtml(callLabel) + '</b> is called, so a new frame is pushed on the stack.', ln);
        var returnValue = executeFrame();
        callTreePath.pop();
        callStack.pop();
        returnedValues[callNode.id] = returnValue;
        recordTraceStep('<b>' + escapeHtml(callLabel) + '</b> ' + (returnValue === undefined ? 'finishes (void).' : 'returns <b>' + escapeHtml(returnValue) + '</b>.') +
            ' Frame popped, back to the caller.', ln);
        return returnValue
    }

    function recordOutput(outputValue, ln) {
        outputValues.push(String(outputValue));
        recordTraceStep('Print <b>' + escapeHtml(outputValue) + '</b>', ln)
    }
    if (lesson.init) lesson.init();
    var hasError = 0;
    recordTraceStep('Program starts in <code>main()</code>.', 0);
    try {
        lesson.run(recordCall, recordOutput)
    } catch (e) {
        hasError = 1;
        callStack.length = 1;
        callTreePath.length = 1;
        recordTraceStep(createIcon('warn') + escapeHtml(e.message), 0)
    }
    if (!hasError) recordTraceStep('Program ends. Output: <b>' + escapeHtml(outputValues.join(outputSeparator)) + '</b> · total calls: <b>' + callCount + '</b>', 0);
    return {
        traceSteps: traceSteps,
        root: callTreePath[0],
        calls: callCount,
        output: outputValues.join(outputSeparator)
    }
}

// ============================================================================
// Trace navigation and visualization rendering
// ============================================================================

var selectedLessonIndex = 0,
    currentTrace, currentStepIndex = 0,
    timer = null;

function renderCallTreeNode(n, s, cur) {
    var isFinished = n.id in s.returnedValues,
        nodeState = isFinished ? 'd' : n.id == cur ? 'a' : s.activeCallIds.indexOf(n.id) > -1 ? 'c' : '';
    return '<li><span class="nd ' + nodeState + '">' + escapeHtml(n.l) + (isFinished && s.returnedValues[n.id] !== undefined ? ' → ' + escapeHtml(s.returnedValues[n.id]) :
        '') + '</span>' + (n.k.length ? '<ul>' + n.k.map(function(k) {
            return renderCallTreeNode(k, s, cur)
        }).join('') + '</ul>' : '') + '</li>'
}

function renderTrace() {
    var s = currentTrace.traceSteps[currentStepIndex],
        p = practiceLessons[selectedLessonIndex],
        top = s.callStack[s.callStack.length - 1];
    getElement('cnt').textContent = 'Step ' + (currentStepIndex + 1) + ' / ' + currentTrace.traceSteps.length;
    getElement('msg').innerHTML = s.m;
    var L = document.querySelectorAll('.ln');
    for (var j = 0; j < L.length; j++) L[j].className = 'ln' + (j + 1 == s.ln ? ' on' : '');
    getElement('stack').innerHTML = s.callStack.map(function(f, j) {
        return '<div class="fr' + (j == s.callStack.length - 1 ? ' t' : '') + (f.id < 0 ? ' m' : '') + '">' + escapeHtml(f
            .l) + '</div>'
    }).join('');
    getElement('out').innerHTML = s.outputValues.map(function(o, j) {
        var k = /^(Pre|In|Post)/.exec(o);
        return '<div class="' + (k ? k[1] : '') + (j == s.outputValues.length - 1 && currentStepIndex > 0 && currentTrace.traceSteps[currentStepIndex - 1].outputValues.length <
            s.outputValues.length ? ' new' : '') + '">' + escapeHtml(o) + '</div>'
    }).join('') || '<span style="color:var(--mu)">(nothing yet)</span>';
    getElement('w').innerHTML = p.w && s.w ? '<div class="w">' + escapeHtml(s.w) + '</div>' : '';
    getElement('tree').innerHTML = '<ul>' + currentTrace.root.k.map(function(k) {
        return renderCallTreeNode(k, s, top.id)
    }).join('') + '</ul>';
    getElement('prev').disabled = currentStepIndex == 0;
    getElement('next').disabled = currentStepIndex == currentTrace.traceSteps.length - 1
}

function stopAutoPlay() {
    clearInterval(timer);
    timer = null;
    getElement('play').innerHTML = createIcon('play') + 'Auto-play'
}

function moveTraceStep(d) {
    currentStepIndex = Math.max(0, Math.min(currentTrace.traceSteps.length - 1, currentStepIndex + d));
    renderTrace();
    if (currentStepIndex == currentTrace.traceSteps.length - 1) stopAutoPlay()
}

function selectLesson(n) {
    stopAutoPlay();
    selectedLessonIndex = n;
    currentStepIndex = 0;
    var p = practiceLessons[n];
    currentTrace = buildTrace(p);
    getElement('ed').hidden = n != customLessonIndex;
    getElement('ttl').textContent = (n + 1) + '. ' + p.t;
    getElement('pat').textContent = p.pat;
    getElement('q').innerHTML = '<b>Question:</b> What is the output, and how many times is the function called?';
    getElement('code').innerHTML = p.code.split('\n').map(function(t, j) {
        return '<span class="ln"><i>' + (j + 1) + '</i>' + escapeHtml(t) + '</span>'
    }).join('');
    getElement('ans').hidden = true;
    getElement('rev').innerHTML = createIcon('eye') + 'Show answer';
    getElement('ans').innerHTML = '<b>Output:</b> <code>' + escapeHtml(currentTrace.output) + '</code><br><b>Total calls:</b> ' + currentTrace.calls +
        ' <small>(not counting main)</small><br><b>Exam tip:</b> ' + escapeHtml(p.tip);
    var b = document.querySelectorAll('#side button');
    for (var j = 0; j < b.length; j++) b[j].className = j == n ? 'on' : '';
    renderTrace()
}

// ============================================================================
// Mini C compiler/interpreter
//
// Pipeline:
//   1. tokenizeSource() converts source text into tokens.
//   2. parseProgram() converts tokens into a small abstract syntax tree (AST).
//   3. executeProgram() evaluates the AST with scopes, pointers, arrays, functions,
//      recursion, and the supported C control-flow statements.
// ============================================================================

var typeKeywords = {
        int: 1,
        long: 1,
        short: 1,
        char: 1,
        void: 1,
        unsigned: 1,
        signed: 1,
        float: 1,
        double: 1,
        static: 1,
        const: 1
    },
    globalScope = null,
    staticStorage = [];

function tokenizeSource(src) {
    var tokens = [],
        i = 0,
        l = 1,
        m, t, re =
        /\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*|(0x[0-9a-fA-F]+|\d+)|([A-Za-z_]\w*)|"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])+)'|(<<=|>>=|\+\+|--|<=|>=|==|!=|&&|\|\||[-+*\/%&|^]=|<<|>>|[-+*\/%=<>!&|^~?:;,(){}\[\].])/y,
        UN = function(s) {
            return s.replace(/\\(.)/g, function(_, c) {
                return {
                    n: '\n',
                    t: '\t',
                    r: '\r',
                    '0': '\0'
                } [c] || c
            })
        };
    while (i < src.length) {
        re.lastIndex = i;
        m = re.exec(src);
        if (!m) throw Error('Unexpected character "' + src[i] + '" on line ' + l);
        i = re.lastIndex;
        t = m[0];
        if (m[1]) tokens.push({
            t: 'n',
            v: +m[1],
            l: l
        });
        else if (m[2]) tokens.push({
            t: 'i',
            v: t,
            l: l
        });
        else if (m[3] !== undefined) tokens.push({
            t: 's',
            v: UN(m[3]),
            l: l
        });
        else if (m[4] !== undefined) tokens.push({
            t: 'n',
            v: UN(m[4]).charCodeAt(0),
            l: l
        });
        else if (m[5]) tokens.push({
            t: 'o',
            v: t,
            l: l
        });
        l += (t.match(/\n/g) || []).length
    }
    return tokens
}

// Parse declarations, statements, expressions, and function definitions into
// the AST consumed by executeProgram().

function parseProgram(src) {
    var tokens = tokenizeSource(src),
        p = 0,
        F = {},
        G = [],
        AS = {
            '=': 1,
            '+=': 1,
            '-=': 1,
            '*=': 1,
            '/=': 1,
            '%=': 1
        },
        LV = [
            ['||'],
            ['&&'],
            ['|'],
            ['^'],
            ['&'],
            ['==', '!='],
            ['<', '>', '<=', '>='],
            ['<<', '>>'],
            ['+', '-'],
            ['*', '/', '%']
        ];

    function isNextToken(o) {
        return tokens[p] && tokens[p].t != 's' && tokens[p].v === o
    }

    function consumeToken(o) {
        if (!isNextToken(o)) throw Error('Expected "' + o + '" on line ' + (tokens[p] ? tokens[p].l + ' near "' + tokens[p].v + '"' :
            'end of program'));
        return tokens[p++]
    }

    function isTypeToken(k) {
        var t = tokens[p + (k || 0)];
        return t && t.t == 'i' && typeKeywords[t.v]
    }

    function parseType() {
        var d = {
            st: 0
        };
        while (isTypeToken()) {
            if (tokens[p].v == 'static') d.st = 1;
            p++
        }
        while (isNextToken('*')) p++;
        return d
    }

    function parseIdentifier() {
        var t = tokens[p];
        if (!t || t.t != 'i') throw Error('Expected a name on line ' + (t ? t.l : 'end of program'));
        p++;
        return t.v
    }

    function parseInitializerList() {
        consumeToken('{');
        var e = [];
        while (!isNextToken('}')) {
            e.push(parseAssignment());
            if (isNextToken(',')) p++
        }
        consumeToken('}');
        return {
            k: 'list',
            e: e
        }
    }

    function parseDeclaration(d, l) {
        var L = [];
        for (;;) {
            var nm = parseIdentifier(),
                a = 0,
                sz = null,
                init = null;
            if (isNextToken('[')) {
                p++;
                a = 1;
                if (!isNextToken(']')) sz = parseAssignment();
                consumeToken(']')
            }
            if (isNextToken('=')) {
                p++;
                init = isNextToken('{') ? parseInitializerList() : parseAssignment()
            }
            L.push({
                n: nm,
                a: a,
                sz: sz,
                i: init
            });
            if (isNextToken(',')) {
                p++;
                while (isNextToken('*')) p++;
                continue
            }
            break
        }
        consumeToken(';');
        return {
            k: 'decl',
            d: L,
            st: d.st,
            l: l
        }
    }

    function parseBlock() {
        consumeToken('{');
        var b = [];
        while (!isNextToken('}')) {
            if (!tokens[p]) throw Error('Missing } at end of program');
            b.push(parseStatement())
        }
        consumeToken('}');
        return {
            k: 'blk',
            b: b
        }
    }

    function parseStatement() {
        var t = tokens[p],
            l = t.l,
            c;
        if (isNextToken('{')) return parseBlock();
        if (isTypeToken()) return parseDeclaration(parseType(), l);
        if (t.t == 'i') {
            switch (t.v) {
                case 'if': {
                    p++;
                    consumeToken('(');
                    c = parseAssignment();
                    consumeToken(')');
                    var a = parseStatement(),
                        b = null;
                    if (isNextToken('else')) {
                        p++;
                        b = parseStatement()
                    }
                    return {
                        k: 'if',
                        c: c,
                        a: a,
                        b: b
                    }
                }
                case 'while': {
                    p++;
                    consumeToken('(');
                    c = parseAssignment();
                    consumeToken(')');
                    return {
                        k: 'wh',
                        c: c,
                        b: parseStatement()
                    }
                }
                case 'do': {
                    p++;
                    var b2 = parseStatement();
                    consumeToken('while');
                    consumeToken('(');
                    c = parseAssignment();
                    consumeToken(')');
                    consumeToken(';');
                    return {
                        k: 'dw',
                        c: c,
                        b: b2
                    }
                }
                case 'for': {
                    p++;
                    consumeToken('(');
                    var i = null,
                        s = null;
                    c = null;
                    if (isNextToken(';')) p++;
                    else if (isTypeToken()) i = parseDeclaration(parseType(), l);
                    else {
                        i = {
                            k: 'consumeToken',
                            e: parseAssignment()
                        };
                        consumeToken(';')
                    }
                    if (!isNextToken(';')) c = parseAssignment();
                    consumeToken(';');
                    if (!isNextToken(')')) s = parseAssignment();
                    consumeToken(')');
                    return {
                        k: 'for',
                        i: i,
                        c: c,
                        s: s,
                        b: parseStatement()
                    }
                }
                case 'return': {
                    p++;
                    var e = null;
                    if (!isNextToken(';')) e = parseAssignment();
                    consumeToken(';');
                    return {
                        k: 'ret',
                        e: e,
                        l: l
                    }
                }
                case 'break':
                case 'continue':
                    p++;
                    consumeToken(';');
                    return {
                        k: t.v == 'break' ? 'brk' : 'cnt'
                    }
            }
        }
        if (isNextToken(';')) {
            p++;
            return {
                k: 'blk',
                b: []
            }
        }
        var x = parseAssignment();
        consumeToken(';');
        return {
            k: 'consumeToken',
            e: x
        }
    }

    function parseAssignment() {
        var a = parseTernary(),
            t = tokens[p];
        if (t && t.t == 'o' && AS[t.v]) {
            p++;
            return {
                k: 'as',
                o: t.v,
                a: a,
                b: parseAssignment(),
                l: t.l
            }
        }
        return a
    }

    function parseTernary() {
        var c = parseBinaryExpression(0);
        if (isNextToken('?')) {
            p++;
            var a = parseAssignment();
            consumeToken(':');
            return {
                k: 'tn',
                c: c,
                a: a,
                b: parseTernary()
            }
        }
        return c
    }

    function parseBinaryExpression(v) {
        if (v == LV.length) return parseUnaryExpression();
        var a = parseBinaryExpression(v + 1);
        for (;;) {
            var t = tokens[p];
            if (t && t.t == 'o' && LV[v].indexOf(t.v) > -1) {
                p++;
                a = {
                    k: 'b',
                    o: t.v,
                    a: a,
                    b: parseBinaryExpression(v + 1),
                    l: t.l
                }
            } else return a
        }
    }

    function parseUnaryExpression() {
        var t = tokens[p];
        if (!t) throw Error('Unexpected end of program');
        if (t.t == 'o') {
            if (t.v.length == 1 && '-+!~*'.indexOf(t.v) > -1) {
                p++;
                return {
                    k: 'u',
                    o: t.v,
                    a: parseUnaryExpression(),
                    l: t.l
                }
            }
            if (t.v == '++' || t.v == '--') {
                p++;
                return {
                    k: 'inc',
                    o: t.v,
                    pre: 1,
                    a: parseUnaryExpression(),
                    l: t.l
                }
            }
            if (t.v == '(' && isTypeToken(1)) {
                p++;
                while (!isNextToken(')')) p++;
                p++;
                return parseUnaryExpression()
            }
        }
        return parsePostfixExpression()
    }

    function parsePostfixExpression() {
        var a = parsePrimaryExpression();
        for (;;) {
            var t = tokens[p];
            if (!t || t.t != 'o') return a;
            if (t.v == '(') {
                if (a.k != 'id') throw Error('Only direct function calls are supported (line ' + t.l + ')');
                p++;
                var g = [];
                while (!isNextToken(')')) {
                    g.push(parseAssignment());
                    if (isNextToken(',')) p++
                }
                consumeToken(')');
                a = {
                    k: 'call',
                    n: a.n,
                    g: g,
                    l: t.l
                }
            } else if (t.v == '[') {
                p++;
                var i = parseAssignment();
                consumeToken(']');
                a = {
                    k: 'ix',
                    a: a,
                    i: i,
                    l: t.l
                }
            } else if (t.v == '++' || t.v == '--') {
                p++;
                a = {
                    k: 'inc',
                    o: t.v,
                    pre: 0,
                    a: a,
                    l: t.l
                }
            } else return a
        }
    }

    function parsePrimaryExpression() {
        var t = tokens[p++];
        if (!t) throw Error('Unexpected end of program');
        if (t.t == 'n') return {
            k: 'num',
            v: t.v
        };
        if (t.t == 's') return {
            k: 'str',
            v: t.v
        };
        if (t.t == 'i') return {
            k: 'id',
            n: t.v,
            l: t.l
        };
        if (t.v == '(') {
            var e = parseAssignment();
            consumeToken(')');
            return e
        }
        throw Error('Unexpected "' + t.v + '" on line ' + t.l)
    }
    while (p < tokens.length) {
        var l = tokens[p].l;
        if (!isTypeToken()) throw Error('Expected a type on line ' + l);
        var d = parseType(),
            q = p,
            nm = parseIdentifier();
        if (isNextToken('(')) {
            p++;
            var ps = [];
            while (!isNextToken(')')) {
                parseType();
                if (isNextToken(')') && tokens[p - 1].v == 'void') break;
                ps.push(parseIdentifier());
                if (isNextToken('[')) {
                    p++;
                    consumeToken(']')
                }
                if (isNextToken(',')) p++
            }
            consumeToken(')');
            if (isNextToken(';')) {
                p++;
                continue
            }
            F[nm] = {
                ps: ps,
                b: parseBlock()
            }
        } else {
            p = q;
            G.push(parseDeclaration(d, l))
        }
    }
    return {
        F: F,
        G: G
    }
}

// Execute the parsed AST. This is intentionally a small interpreter rather
// than a native C compiler; it supports the subset documented in the editor.

function executeProgram(programAst, recordCall, recordOutput) {
    // Runtime state: global scope, static storage, call callDepth, and operation count.
    var totalCalls = 0,
        callDepth = 0,
        operationCount = 0,
        globalEnvironment = {
            v: {},
            u: null
        },
        staticVariables = {};
    globalScope = globalEnvironment;
    staticStorage = [];

    // Resolve a variable by walking from the current scope toward global scope.
    function resolveVariable(s, n, l) {
        for (; s; s = s.u)
            if (n in s.v) return s.v[n];
        throw Error('Undefined variable "' + n + '" on line ' + l)
    }

    // Convert the interpreter's pointer representation into display text.
    function readPointerString(p) {
        var s = '',
            a = p.a,
            i = p.o;
        while (i < a.length && a[i]) {
            s += String.fromCharCode(a[i]);
            i++
        }
        return s
    }

    function formatRuntimeValue(v) {
        if (v === undefined) return '?';
        if (typeof v == 'number') return String(v);
        if (v.a.s) return '"' + readPointerString(v) + '"';
        return '[' + v.a.slice(v.o, v.o + 6).join(',') + (v.a.length - v.o > 6 ? ',…' : '') + ']'
    }

    // Pointer and array helpers used by expression evaluation.
    function requirePointer(v, l) {
        if (typeof v != 'object') throw Error('Pointer or array expected on line ' + l);
        return v
    }

    function getArrayIndex(q, i, l) {
        var k = q.o + i;
        if (k < 0 || k >= q.a.length) throw Error('Array index ' + i + ' out of range on line ' + l);
        return k
    }

    function createStringPointer(s) {
        var a = [];
        for (var i = 0; i < s.length; i++) a.push(s.charCodeAt(i));
        a.push(0);
        a.s = 1;
        return {
            a: a,
            o: 0
        }
    }

    // Arithmetic and comparison operators, including pointer arithmetic.
    function evaluateArithmetcreateIcon(o, a, b, l) {
        if (typeof a != 'number' || typeof b != 'number') {
            if (o == '+') return typeof a != 'number' ? {
                a: a.a,
                o: a.o + b
            } : {
                a: b.a,
                o: b.o + a
            };
            if (o == '-') return typeof b != 'number' ? a.o - b.o : {
                a: a.a,
                o: a.o - b
            };
            throw Error('Unsupported pointer operation on line ' + l)
        }
        switch (o) {
            case '+':
                return (a + b) | 0;
            case '-':
                return (a - b) | 0;
            case '*':
                return Math.imul(a, b);
            case '/':
                if (!b) throw Error('Division by zero on line ' + l);
                return Math.trunc(a / b);
            case '%':
                if (!b) throw Error('Division by zero on line ' + l);
                return a % b
        }
    }

    function evaluateBinaryOperator(n, s) {
        var o = n.o;
        if (o == '&&') return evaluateExpression(n.a, s) && evaluateExpression(n.b, s) ? 1 : 0;
        if (o == '||') return evaluateExpression(n.a, s) || evaluateExpression(n.b, s) ? 1 : 0;
        var a = evaluateExpression(n.a, s),
            b = evaluateExpression(n.b, s);
        switch (o) {
            case '==':
                return a == b ? 1 : 0;
            case '!=':
                return a != b ? 1 : 0;
            case '<':
                return a < b ? 1 : 0;
            case '>':
                return a > b ? 1 : 0;
            case '<=':
                return a <= b ? 1 : 0;
            case '>=':
                return a >= b ? 1 : 0;
            case '&':
                return a & b;
            case '|':
                return a | b;
            case '^':
                return a ^ b;
            case '<<':
                return a << b;
            case '>>':
                return a >> b
        }
        return evaluateArithmetcreateIcon(o, a, b, n.l)
    }

    // Assign a computed value to a variable, array element, or dereferenced pointer.
    function assignValue(n, v, s) {
        var q;
        if (n.k == 'id') resolveVariable(s, n.n, n.l).v = v;
        else if (n.k == 'ix') {
            q = requirePointer(evaluateExpression(n.a, s), n.l);
            q.a[getArrayIndex(q, evaluateExpression(n.i, s), n.l)] = v
        } else if (n.k == 'u' && n.o == '*') {
            q = requirePointer(evaluateExpression(n.a, s), n.l);
            q.a[getArrayIndex(q, 0, n.l)] = v
        } else throw Error('Cannot assign on line ' + n.l)
    }

    // Evaluate AST expressions. This handles literals, variables, operators,
    // increments, ternaries, array access, and function calls.
    function evaluateExpression(n, s) {
        if (++operationCount > 300000) throw Error('Program runs too long (possible infinite loop)');
        var q, v, r;
        switch (n.k) {
            case 'num':
                return n.v;
            case 'str':
                return createStringPointer(n.v);
            case 'id':
                return resolveVariable(s, n.n, n.l).v;
            case 'u':
                v = evaluateExpression(n.a, s);
                if (n.o == '-') return -v;
                if (n.o == '+') return v;
                if (n.o == '!') return v ? 0 : 1;
                if (n.o == '~') return ~v;
                q = requirePointer(v, n.l);
                return q.a[getArrayIndex(q, 0, n.l)];
            case 'b':
                return evaluateBinaryOperator(n, s);
            case 'tn':
                return evaluateExpression(n.c, s) ? evaluateExpression(n.a, s) : evaluateExpression(n.b, s);
            case 'ix':
                q = requirePointer(evaluateExpression(n.a, s), n.l);
                return q.a[getArrayIndex(q, evaluateExpression(n.i, s), n.l)];
            case 'as':
                r = evaluateExpression(n.b, s);
                if (n.o != '=') r = evaluateArithmetcreateIcon(n.o[0], evaluateExpression(n.a, s), r, n.l);
                assignValue(n.a, r, s);
                return r;
            case 'inc':
                v = evaluateExpression(n.a, s);
                r = typeof v == 'number' ? v + (n.o == '++' ? 1 : -1) : {
                    a: v.a,
                    o: v.o + (n.o == '++' ? 1 : -1)
                };
                assignValue(n.a, r, s);
                return n.pre ? r : v;
            case 'call':
                return executeFunctionCall(n, s)
        }
    }

    // Execute a user-defined or built-in function call.
    function executeFunctionCall(n, s) {
        var g = [],
            i;
        for (i = 0; i < n.g.length; i++) g.push(i == 0 && n.n == 'printf' && n.g[0].k == 'str' ? n.g[0].v : evaluateExpression(n.g[i],
            s));
        if (n.n == 'printf') {
            if (typeof g[0] != 'string') g[0] = readPointerString(g[0]);
            var j = 1,
                t = g[0].replace(/%(-?)(\d*)l*([dicsuxX%])/g, function(_, m, w, c) {
                    if (c == '%') return '%';
                    var v = g[j++],
                        r;
                    if (v === undefined) throw Error('printf: missing argument on line ' + n.l);
                    r = c == 'c' ? String.fromCharCode(v) : c == 's' ? readPointerString(v) : c == 'x' ? (v >>> 0).toString(16) :
                        c == 'X' ? (v >>> 0).toString(16).toUpperCase() : c == 'u' ? String(v >>> 0) : String(v);
                    while (r.length < +w) r = m ? r + ' ' : ' ' + r;
                    return r
                });
            recordOutput(t, n.l);
            return t.length
        }
        if (n.n == 'putchar') {
            recordOutput(String.fromCharCode(g[0]), n.l);
            return g[0]
        }
        if (n.n == 'puts') {
            recordOutput(readPointerString(g[0]) + String.fromCharCode(10), n.l);
            return 0
        }
        if (n.n == 'abs') return Math.abs(g[0]);
        var f = programAst.F[n.n];
        if (!f) throw Error('Unknown function "' + n.n + '" on line ' + n.l);
        if (g.length != f.ps.length) throw Error(n.n + ' expects ' + f.ps.length + ' argument(s) on line ' + n.l);
        if (++totalCalls > 600) throw Error('More than 600 total calls: probably infinite recursion');
        if (callDepth >= 150) throw Error('Stack overflow: recursion deeper than 150 calls');
        var sc = {
            v: {},
            u: globalEnvironment,
            f: n.n
        };
        f.ps.forEach(function(a, k) {
            sc.v[a] = {
                v: g[k]
            }
        });
        callDepth++;
        try {
            return recordCall(n.n + '(' + g.map(formatRuntimeValue).join(',') + ')', n.l, function() {
                var r = executeStatement(f.b, sc);
                return r && r.t == 'r' ? r.v : undefined
            })
        } finally {
            callDepth--
        }
    }

    // Execute AST statements and maintain the current lexical scope.
    function executeStatement(n, s) {
        if (++operationCount > 300000) throw Error('Program runs too long (possible infinite loop)');
        var r, sc;
        switch (n.k) {
            case 'blk':
                sc = {
                    v: {},
                    u: s,
                    f: s.f
                };
                for (var i = 0; i < n.b.length; i++) {
                    r = executeStatement(n.b[i], sc);
                    if (r) return r
                }
                return;
            case 'decl':
                n.d.forEach(function(d) {
                    var b, key = s.f + '.' + d.n;
                    if (n.st && staticVariables[key]) {
                        s.v[d.n] = staticVariables[key];
                        return
                    }
                    b = {
                        v: 0
                    };
                    if (d.a) {
                        var a, N, k;
                        if (d.i && d.i.k == 'str') a = createStringPointer(d.i.v).a;
                        else {
                            N = d.sz ? evaluateExpression(d.sz, s) : (d.i ? d.i.e.length : 0);
                            a = [];
                            for (k = 0; k < N; k++) a.push(d.i && d.i.e && k < d.i.e.length ? evaluateExpression(d.i.e[k], s) :
                                0)
                        }
                        b.v = {
                            a: a,
                            o: 0
                        }
                    } else if (d.i) b.v = evaluateExpression(d.i, s);
                    s.v[d.n] = b;
                    if (n.st) {
                        staticVariables[key] = b;
                        staticStorage.push({
                            n: d.n,
                            b: b
                        })
                    }
                });
                return;
            case 'if':
                if (evaluateExpression(n.c, s)) return executeStatement(n.a, s);
                if (n.b) return executeStatement(n.b, s);
                return;
            case 'wh':
                while (evaluateExpression(n.c, s)) {
                    r = executeStatement(n.b, s);
                    if (r) {
                        if (r.t == 'b') break;
                        if (r.t == 'r') return r
                    }
                }
                return;
            case 'dw':
                do {
                    r = executeStatement(n.b, s);
                    if (r) {
                        if (r.t == 'b') break;
                        if (r.t == 'r') return r
                    }
                } while (evaluateExpression(n.c, s));
                return;
            case 'for':
                sc = {
                    v: {},
                    u: s,
                    f: s.f
                };
                if (n.i) executeStatement(n.i, sc);
                while (!n.c || evaluateExpression(n.c, sc)) {
                    r = executeStatement(n.b, sc);
                    if (r) {
                        if (r.t == 'b') break;
                        if (r.t == 'r') return r
                    }
                    if (n.s) evaluateExpression(n.s, sc)
                }
                return;
            case 'ret':
                return {
                    t: 'r', v: n.e ? evaluateExpression(n.e, s) : undefined
                };
            case 'brk':
                return {
                    t: 'b'
                };
            case 'cnt':
                return {
                    t: 'c'
                };
            case 'consumeToken':
                evaluateExpression(n.e, s);
                return
        }
    }
    programAst.G.forEach(function(d) {
        executeStatement(d, globalEnvironment)
    });
    var m = programAst.F.main;
    if (!m) throw Error('No main() function found');
    executeStatement(m.b, {
        v: {},
        u: globalEnvironment,
        f: 'main'
    })
}

// ============================================================================
// Custom-code editor integration
// ============================================================================

var customLessonIndex = practiceLessons.length,
    customProgramAst = null,
    customCodeExamples = [{
        n: 'sum with down/up prints',
        c: `#include <stdio.h>
int sum(int n){
    if(n == 0) return 0;
    printf("down %d ", n);
    int r = n + sum(n - 1);
    printf("up %d ", n);
    return r;
}
int main(){
    printf("result %d", sum(3));
    return 0;
}`
    }, {
        n: 'Pre / In / Post',
        c: `void f(int n){
    if(n == 0) return;
    printf("Pre %d ", n);
    f(n - 1);
    printf("In %d ", n);
    f(n - 1);
    printf("Post %d ", n);
}
int main(){ f(2); }`
    }, {
        n: 'sum of an array',
        c: `int sum(int a[], int n){
    if(n == 0) return 0;
    return a[n-1] + sum(a, n-1);
}
int main(){
    int a[4] = {2, 4, 6, 8};
    printf("%d", sum(a, 4));
}`
    }, {
        n: 'reverse a string (char *)',
        c: `void rev(char *s){
    if(*s == 0) return;
    rev(s + 1);
    putchar(*s);
}
int main(){ rev("BANK"); }`
    }, {
        n: 'static counter',
        c: `int f(int n){
    static int x = 0;
    x++;
    if(n > 0) f(n - 1);
    printf("%d ", x);
    return x;
}
int main(){ f(2); }`
    }];
practiceLessons.push({
    t: 'Your own C code',
    pat: 'Paste any program',
    code: '',
    tip: 'Compare the trace with the output you predicted.',
    init: function() {
        globalScope = null;
        staticStorage = []
    },
    w: function() {
        var r = [];
        if (globalScope)
            for (var k in globalScope.v) {
                var v = globalScope.v[k].v;
                if (typeof v == 'number') r.push(k + ' = ' + v)
            }
        staticStorage.forEach(function(c) {
            if (typeof c.b.v == 'number') r.push('static ' + c.n + ' = ' + c.b.v)
        });
        return r.length ? 'globals/statics: ' + r.join(' · ') : ''
    },
    run: function(recordCall, recordOutput) {
        executeProgram(customProgramAst, recordCall, recordOutput)
    }
});

function setCustom(src) {
    try {
        customProgramAst = parseProgram(src)
    } catch (e) {
        getElement('err').innerHTML = createIcon('warn') + escapeHtml(e.message);
        getElement('err').hidden = false;
        return
    }
    getElement('err').hidden = true;
    practiceLessons[customLessonIndex].code = src;
    selectLesson(customLessonIndex)
}

// ============================================================================
// Application startup and event wiring
// ============================================================================

customProgramAst = parseProgram(customCodeExamples[0].c);
practiceLessons[customLessonIndex].code = customCodeExamples[0].c;
getElement('src').value = customCodeExamples[0].c;
getElement('exs').innerHTML = customCodeExamples.map(function(e, j) {
    return '<option value=' + j + '>Example: ' + e.n + '</option>'
}).join('');
getElement('exs').onchange = function() {
    getElement('src').value = customCodeExamples[this.value].c;
    setCustom(customCodeExamples[this.value].c)
};
getElement('run').onclick = function() {
    setCustom(getElement('src').value)
};
getElement('tc').onclick = function() {
    switchTab('p');
    selectLesson(customLessonIndex)
};
getElement('side').innerHTML = practiceLessons.map(function(p, j) {
    return '<button>' + (j + 1) + '. ' + p.t + '<small>' + p.pat + '</small></button>'
}).join('');
Array.prototype.forEach.call(document.querySelectorAll('#side button'), function(b, j) {
    b.onclick = function() {
        selectLesson(j)
    }
});
getElement('next').onclick = function() {
    moveTraceStep(1)
};
getElement('prev').onclick = function() {
    moveTraceStep(-1)
};
getElement('reset').onclick = function() {
    stopAutoPlay();
    currentStepIndex = 0;
    renderTrace()
};
getElement('rev').onclick = function() {
    var h = getElement('ans').hidden;
    getElement('ans').hidden = !h;
    getElement('rev').innerHTML = h ? createIcon('eyeoff') + 'Hide answer' : createIcon('eye') + 'Show answer'
};
getElement('play').onclick = function() {
    if (timer) {
        stopAutoPlay();
        return
    }
    if (currentStepIndex == currentTrace.traceSteps.length - 1) currentStepIndex = 0;
    getElement('play').innerHTML = createIcon('pause') + 'Pause';
    timer = setInterval(function() {
        moveTraceStep(1)
    }, 1000)
};
Array.prototype.forEach.call(document.querySelectorAll('[data-ic]'), function(e) {
    e.outerHTML = createIcon(e.getAttribute('data-ic'), e.getAttribute('data-r') ? 'r' : '')
});
document.addEventListener('keydown', function(e) {
    if (e.key == 'ArrowRight') moveTraceStep(1);
    if (e.key == 'ArrowLeft') moveTraceStep(-1)
});

function switchTab(w) {
    getElement('lesson').hidden = w != 'l';
    getElement('practice').hidden = w != 'p';
    if (getElement('recurrence')) getElement('recurrence').hidden = w != 'r';
    getElement('tl').className = w == 'l' ? 'p' : '';
    getElement('tp').className = w == 'p' ? 'p' : '';
    if (getElement('tr')) getElement('tr').className = w == 'r' ? 'p' : '';
    if (w == 'l') stopAutoPlay();
    window.scrollTo(0, 0)
}
getElement('tl').onclick = function() {
    switchTab('l')
};
getElement('tp').onclick = function() {
    switchTab('p')
};
document.addEventListener('click', function(e) {
    var b = e.target.closest('[data-try]');
    if (b) {
        switchTab('p');
        selectLesson(+b.getAttribute('data-try'))
    }
});
selectLesson(0);
