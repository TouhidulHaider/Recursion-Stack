// ============================================================================
// Built-in recursion lessons
//
// Each lesson supplies:
//   - code: the C-like example shown to the learner
//   - run(C, P): the executable trace model
//   - tip: the explanation shown with the answer
// ============================================================================

var globalRecursionTotal = 0;

var practiceLessons = [
    // Basic ordering, return values, and divide-and-conquer recursion.
    {
            t: 'Pre-In-Post, two calls',
            pat: 'Binary tree order',
            code: 'void f(int n){\n  if(n==0) return;\n  printf("Pre %d ",n);\n  f(n-1);\n  printf("In %d ",n);\n  f(n-1);\n  printf("Post %d ",n);\n}\nint main(){ f(2); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (!n) return;
                        recordOutput('Pre ' + n, 3);
                        g(n - 1, 4);
                        recordOutput('In ' + n, 5);
                        g(n - 1, 6);
                        recordOutput('Post ' + n, 7)
                    })
                }
                g(2, 9)
            },
            tip: 'Pre = before both calls, In = between them, Post = after both. For depth n the number of calls is 2^(n+1) − 1.'
    }, {
            t: 'Print before and after',
            pat: 'Head vs tail work',
            code: 'void f(int n){\n  if(n>0){\n    printf("%d ",n);\n    f(n-1);\n    printf("%d ",n);\n  }\n}\nint main(){ f(3); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n > 0) {
                            recordOutput(n, 3);
                            g(n - 1, 4);
                            recordOutput(n, 5)
                        }
                    })
                }
                g(3, 8)
            },
            tip: 'Code before the recursive call runs on the way down (3 2 1). Code after it runs on the way back up, in reverse order (1 2 3).'
    }, {
            t: 'Factorial',
            pat: 'Linear recursion, return value',
            code: 'int fact(int n){\n  if(n<=1) return 1;\n  return n*fact(n-1);\n}\nint main(){ printf("%d",fact(4)); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('fact(' + n + ')', l, function() {
                        if (n <= 1) return 1;
                        return n * g(n - 1, 3)
                    })
                }
                recordOutput(g(4, 5), 5)
            },
            tip: 'Nothing is multiplied on the way down. Results are combined on the way back up: 4 × (3 × (2 × 1)). n calls make n frames.'
    }, {
            t: 'Fibonacci call count',
            pat: 'Tree recursion, counting calls',
            code: 'int fib(int n){\n  if(n<=1) return n;\n  return fib(n-1)+fib(n-2);\n}\nint main(){ printf("%d",fib(4)); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('fib(' + n + ')', l, function() {
                        if (n <= 1) return n;
                        return g(n - 1, 3) + g(n - 2, 3)
                    })
                }
                recordOutput(g(4, 5), 5)
            },
            tip: 'Calls for fib(n) = 2·fib(n+1) − 1. So fib(4) → 9, fib(5) → 15, fib(6) → 25. Same subproblems repeat, hence exponential time.'
    }, {
            t: 'Digits of a number',
            pat: 'Digit extraction',
            code: 'void f(int n){\n  if(n==0) return;\n  f(n/10);\n  printf("%d ",n%10);\n}\nint main(){ f(123); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n == 0) return;
                        g(Math.floor(n / 10), 3);
                        recordOutput(n % 10, 4)
                    })
                }
                g(123, 6)
            },
            tip: 'Print after the call: digits come out left to right (1 2 3). If the printf were before the call you would get 3 2 1.'
    }, {
            t: 'Decimal to binary',
            pat: 'Base conversion',
            sep: '',
            code: 'void parseBinaryExpression(int n){\n  if(n>0){\n    parseBinaryExpression(n/2);\n    printf("%d",n%2);\n  }\n}\nint main(){ parseBinaryExpression(10); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('parseBinaryExpression(' + n + ')', l, function() {
                        if (n > 0) {
                            g(Math.floor(n / 2), 3);
                            recordOutput(n % 2, 4)
                        }
                    })
                }
                g(10, 7)
            },
            tip: 'Remainders are produced last digit first, but printing after the recursive call reverses them into the correct order: 1010.'
    }, {
            t: 'GCD (Euclid)',
            pat: 'Tail recursion',
            code: 'int gcd(int a,int b){\n  if(b==0) return a;\n  return gcd(b,a%b);\n}\nint main(){ printf("%d",gcd(48,18)); }',
            run: function(recordCall, recordOutput) {
                function g(a, b, l) {
                    return recordCall('gcd(' + a + ',' + b + ')', l, function() {
                        if (b == 0) return a;
                        return g(b, a % b, 3)
                    })
                }
                recordOutput(g(48, 18, 5), 5)
            },
            tip: 'A chain with no work after the call (tail recursion). The answer is passed straight back up unchanged.'
    }, {
            t: 'Fast power',
            pat: 'Divide and conquer',
            code: 'int pw(int x,int n){\n  if(n==0) return 1;\n  int t=pw(x,n/2);\n  if(n%2==0) return t*t;\n  return x*t*t;\n}\nint main(){ printf("%d",pw(2,5)); }',
            run: function(recordCall, recordOutput) {
                function g(x, n, l) {
                    return recordCall('pw(' + x + ',' + n + ')', l, function() {
                        if (n == 0) return 1;
                        var t = g(x, Math.floor(n / 2), 3);
                        if (n % 2 == 0) return t * t;
                        return x * t * t
                    })
                }
                recordOutput(g(2, 5, 7), 7)
            },
            tip: 'Halving n gives about log₂(n) + 1 calls, not n. Odd n multiplies one extra x.'
    }, {
            t: 'Ackermann A(1,2)',
            pat: 'Nested recursion',
            code: 'int A(int m,int n){\n  if(m==0) return n+1;\n  if(n==0) return A(m-1,1);\n  return A(m-1, A(m,n-1));\n}\nint main(){ printf("%d",A(1,2)); }',
            run: function(recordCall, recordOutput) {
                function g(m, n, l) {
                    return recordCall('A(' + m + ',' + n + ')', l, function() {
                        if (m == 0) return n + 1;
                        if (n == 0) return g(m - 1, 1, 3);
                        return g(m - 1, g(m, n - 1, 4), 4)
                    })
                }
                recordOutput(g(1, 2, 6), 6)
            },
            tip: 'The inner call (an argument) is evaluated first. Only then is the outer call made with that result, so the outer call appears after its sibling in the tree.'
    }, {
            t: 'isEven / isOdd',
            pat: 'Mutual recursion',
            code: 'int isEven(int n){ if(n==0) return 1; return isOdd(n-1); }\nint isOdd(int n){ if(n==0) return 0; return isEven(n-1); }\nint main(){ printf("%d",isEven(3)); }',
            run: function(recordCall, recordOutput) {
                function e(n, l) {
                    return recordCall('isEven(' + n + ')', l, function() {
                        if (n == 0) return 1;
                        return o(n - 1, 1)
                    })
                }

                function o(n, l) {
                    return recordCall('isOdd(' + n + ')', l, function() {
                        if (n == 0) return 0;
                        return e(n - 1, 2)
                    })
                }
                recordOutput(e(3, 3), 3)
            },
            tip: 'Two functions call each other, so the stack alternates between them. isEven(3) ends at isOdd(0) = 0, so the answer is 0 (false).'
    }, {
            // Shared state and stack-sensitive recursion.
            t: 'Static variable',
            pat: 'Shared state',
            w: function() {
                return 'static x = ' + sharedStaticCounter
            },
            code: 'void f(int n){\n  static int x=0;\n  if(n<=0) return;\n  x++;\n  f(n-1);\n  printf("%d ",x);\n}\nint main(){ f(3); }',
            run: function(recordCall, recordOutput) {
                sharedStaticCounter = 0;

                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n <= 0) return;
                        sharedStaticCounter++;
                        g(n - 1, 5);
                        recordOutput(sharedStaticCounter, 6)
                    })
                }
                g(3, 8)
            },
            tip: 'A static variable exists once and is shared by every call. By the time the prints start x is already 3, so the output is 3 3 3, not 1 2 3.'
    }, {
            t: 'Global variable',
            pat: 'Shared global state',
            w: function() {
                return 'global total = ' + globalRecursionTotal
            },
            code: 'int total=0;\nvoid f(int n){\n  if(n<=0) return;\n  total += n;\n  f(n-1);\n  printf("%d ",total);\n}\nint main(){ f(3); }',
            run: function(recordCall, recordOutput) {
                globalRecursionTotal = 0;

                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n <= 0) return;
                        globalRecursionTotal += n;
                        g(n - 1, 5);
                        recordOutput(globalRecursionTotal, 6)
                    })
                }
                g(3, 8)
            },
            tip: 'A global variable is shared by every frame, just like a shared static variable. The updates happen on the way down: total becomes 3, then 5, then 6; every return prints the same final value 6.'
    }, {
            t: 'Pre-increment and post-increment',
            pat: 'Mutation order',
            code: 'void f(int n){\n  if(n<=0) return;\n  printf("%d ",++n);\n  f(n-2);\n  printf("%d ",n++);\n}\nint main(){ f(2); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n <= 0) return;
                        n++;
                        recordOutput(n, 3);
                        g(n - 2, 4);
                        recordOutput(n, 5);
                        n++
                    })
                }
                g(2, 8)
            },
            tip: 'Pre-increment changes n before it is printed: ++n prints the new value. The post-increment after recursion prints the current value first, then changes the local frame value after printing.'
    }, {
            t: 'Recursive array sum',
            pat: 'Array and pointer recursion',
            code: 'int sum(int *a,int n){\n  if(n==0) return 0;\n  return *a + sum(a+1,n-1);\n}\nint main(){\n  int a[]={4,7,2};\n  printf("%d",sum(a,3));\n}',
            run: function(recordCall, recordOutput) {
                var values = [4, 7, 2];

                function g(index, remaining, l) {
                    return recordCall('sum(a+' + index + ',' + remaining + ')', l, function() {
                        if (remaining == 0) return 0;
                        return values[index] + g(index + 1, remaining - 1, 4)
                    })
                }
                recordOutput(g(0, 3, 7), 7)
            },
            tip: 'The pointer a points to the current element. Each recursive call advances it with a+1 while reducing n by one. The return values combine on the way back: 2, then 7+2, then 4+7+2 = 13.'
    }, {
            t: 'Print then add',
            pat: 'Print and return mixed',
            code: 'int f(int n){\n  if(n<=1) return 1;\n  printf("%d ",n);\n  return f(n-1)+f(n-2);\n}\nint main(){ printf("%d",f(4)); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n <= 1) return 1;
                        recordOutput(n, 3);
                        return g(n - 1, 4) + g(n - 2, 4)
                    })
                }
                recordOutput(g(4, 6), 6)
            },
            tip: 'The print inside f runs before its calls (4 3 2 2). main prints the returned value (5) only after everything has finished.'
    }, {
            // Recursion with pointers and output produced while returning.
            t: 'Reverse a string',
            pat: 'String recursion',
            sep: '',
            code: 'void rev(char *s){\n  if(*s==\'\\0\') return;\n  rev(s+1);\n  putchar(*s);\n}\nint main(){ rev("BANK"); }',
            run: function(recordCall, recordOutput) {
                var s = 'BANK';

                function g(i, l) {
                    return recordCall('rev("' + s.slice(i) + '")', l, function() {
                        if (i >= s.length) return;
                        g(i + 1, 3);
                        recordOutput(s[i], 4)
                    })
                }
                g(0, 6)
            },
            tip: 'Each frame keeps its own pointer. The base case is the end of the string, and characters print as the frames pop: KNAB.'
    }, {
            t: 'Tower of Hanoi, 3 discs',
            pat: 'Classic: move counting',
            code: 'void hanoi(int n,char a,char b,char c){\n  if(n==0) return;\n  hanoi(n-1,a,c,b);\n  printf("%d:%c->%c ",n,a,c);\n  hanoi(n-1,b,a,c);\n}\nint main(){ hanoi(3,\'A\',\'B\',\'C\'); }',
            run: function(recordCall, recordOutput) {
                function g(n, a, b, c, l) {
                    return recordCall('H(' + n + ',' + a + b + c + ')', l, function() {
                        if (!n) return;
                        g(n - 1, a, c, b, 3);
                        recordOutput(n + ':' + a + '→' + c, 4);
                        g(n - 1, b, a, c, 5)
                    })
                }
                g(3, 'A', 'B', 'C', 7)
            },
            tip: 'Moves = 2ⁿ − 1 (7 here) and calls = 2^(n+1) − 1 (15). It is an in-order traversal: disc n moves between the two sub-calls.'
    }, {
            t: 'Recursion inside a loop',
            pat: 'Loop + recursion',
            code: 'void f(int n){\n  if(n==0) return;\n  for(int i=0;i<n;i++)\n    f(i);\n  printf("%d ",n);\n}\nint main(){ f(3); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n == 0) return;
                        for (var i = 0; i < n; i++) g(i, 4);
                        recordOutput(n, 5)
                    })
                }
                g(3, 7)
            },
            tip: 'f(n) calls f(0), f(1), …, f(n−1). Total calls = 2ⁿ (8 here). Trace the loop one iteration at a time.'
    }, {
            // Explicit between-case and traversal-order examples.
            t: 'Print between, one-sided',
            pat: 'In-order, both calls n-1',
            code: 'void f(int n){\n  if(n>0){\n    f(n-1);\n    printf("%d ",n);\n    f(n-1);\n  }\n}\nint main(){ f(3); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n > 0) {
                            g(n - 1, 3);
                            recordOutput(n, 4);
                            g(n - 1, 5)
                        }
                    })
                }
                g(3, 8)
            },
            tip: 'Output of f(n) = output of f(n-1), then n, then output of f(n-1) again: 1 2 1 3 1 2 1. Calls = 2^(n+1) - 1 = 15.'
    }, {
            t: 'Print before two calls',
            pat: 'Pre-order, n = 3',
            code: 'void f(int n){\n  if(n>0){\n    printf("%d ",n);\n    f(n-1);\n    f(n-1);\n  }\n}\nint main(){ f(3); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n > 0) {
                            recordOutput(n, 3);
                            g(n - 1, 4);
                            g(n - 1, 5)
                        }
                    })
                }
                g(3, 8)
            },
            tip: 'Each frame prints once, before it makes its two calls. So: 3, then everything f(2) prints, twice: 3 2 1 1 2 1 1.'
    }, {
            t: 'Print after two calls',
            pat: 'Post-order, n = 3',
            code: 'void f(int n){\n  if(n>0){\n    f(n-1);\n    f(n-1);\n    printf("%d ",n);\n  }\n}\nint main(){ f(3); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n > 0) {
                            g(n - 1, 3);
                            g(n - 1, 4);
                            recordOutput(n, 5)
                        }
                    })
                }
                g(3, 8)
            },
            tip: 'The print waits until both calls finish, so the biggest number comes last: 1 1 2 1 1 2 3.'
    }, {
            t: 'Calls n-1 and n-2, print around',
            pat: 'Uneven branching',
            code: 'void f(int n){\n  if(n<=0) return;\n  printf("%d ",n);\n  f(n-1);\n  f(n-2);\n  printf("%d ",n);\n}\nint main(){ f(3); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n <= 0) return;
                        recordOutput(n, 3);
                        g(n - 1, 4);
                        g(n - 2, 5);
                        recordOutput(n, 6)
                    })
                }
                g(3, 8)
            },
            tip: 'Calls with n <= 0 return at once (f(-1) too). Output: 3 2 1 1 2 1 1 3, with 9 calls, the same count as fib(3)-style trees.'
    }, {
            t: 'Print between n-1 and n-2',
            pat: 'Uneven branching, in-order',
            code: 'void f(int n){\n  if(n>0){\n    f(n-1);\n    printf("%d ",n);\n    f(n-2);\n  }\n}\nint main(){ f(4); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n > 0) {
                            g(n - 1, 3);
                            recordOutput(n, 4);
                            g(n - 2, 5)
                        }
                    })
                }
                g(4, 8)
            },
            tip: 'Left part first (f(3) prints 1 2 3 1), then 4, then f(2) prints 1 2. Output 1 2 3 1 4 1 2 with 15 calls.'
    }, {
            t: 'Odds down, evens up',
            pat: 'Conditional prints',
            code: 'void f(int n){\n  if(n==0) return;\n  if(n%2==1) printf("%d ",n);\n  f(n-1);\n  if(n%2==0) printf("%d ",n);\n}\nint main(){ f(5); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n == 0) return;
                        if (n % 2 == 1) recordOutput(n, 3);
                        g(n - 1, 4);
                        if (n % 2 == 0) recordOutput(n, 5)
                    })
                }
                g(5, 7)
            },
            tip: 'Odd numbers print on the way down (5 3 1). Even numbers print on the way up, after the call returns (2 4).'
    }, {
            t: 'Halving with two calls',
            pat: 'n/2 branching',
            code: 'void f(int n){\n  if(n<=0) return;\n  f(n/2);\n  printf("%d ",n);\n  f(n/2);\n}\nint main(){ f(5); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n <= 0) return;
                        g(Math.floor(n / 2), 3);
                        recordOutput(n, 4);
                        g(Math.floor(n / 2), 5)
                    })
                }
                g(5, 7)
            },
            tip: 'With integer division 5/2 = 2, 2/2 = 1, 1/2 = 0, so the depth is 3 and the calls are 1 + 2 + 4 + 8 = 15. Output 1 2 1 5 1 2 1.'
    }, {
            t: 'Three calls, two prints',
            pat: 'Multiple recursion',
            code: 'void f(int n){\n  if(n==0) return;\n  f(n-1);\n  printf("A%d ",n);\n  f(n-1);\n  printf("B%d ",n);\n  f(n-1);\n}\nint main(){ f(2); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n == 0) return;
                        g(n - 1, 3);
                        recordOutput('A' + n, 4);
                        g(n - 1, 5);
                        recordOutput('B' + n, 6);
                        g(n - 1, 7)
                    })
                }
                g(2, 9)
            },
            tip: 'Every call makes three child calls, so f(2) has 1 + 3 + 9 = 13 calls. Each f(1) contributes A1 B1.'
    }, {
            // Base cases, side effects, nested calls, and return timing.
            t: 'Print outside the if',
            pat: 'Base case prints too',
            code: 'void f(int n){\n  if(n>0){\n    f(n-1);\n    f(n-1);\n  }\n  printf("%d ",n);\n}\nint main(){ f(2); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n > 0) {
                            g(n - 1, 3);
                            g(n - 1, 4)
                        }
                        recordOutput(n, 6)
                    })
                }
                g(2, 8)
            },
            tip: 'The printf is outside the if, so the base-case calls f(0) print as well. There are 7 calls, so exactly 7 numbers are printed.'
    }, {
            // Advanced call-stack patterns and shared execution state.
            t: 'Mutual recursion with prints',
            pat: 'Two functions, prints before and after',
            code: 'void a(int n){\n  if(n<=0) return;\n  printf("a%d ",n);\n  b(n-1);\n  printf("a%d ",n);\n}\nvoid b(int n){\n  if(n<=0) return;\n  printf("b%d ",n);\n  a(n-1);\n  printf("b%d ",n);\n}\nint main(){ a(4); }',
            run: function(recordCall, recordOutput) {
                function a(n, l) {
                    return recordCall('a(' + n + ')', l, function() {
                        if (n <= 0) return;
                        recordOutput('a' + n, 3);
                        b(n - 1, 4);
                        recordOutput('a' + n, 5)
                    })
                }

                function b(n, l) {
                    return recordCall('b(' + n + ')', l, function() {
                        if (n <= 0) return;
                        recordOutput('b' + n, 9);
                        a(n - 1, 10);
                        recordOutput('b' + n, 11)
                    })
                }
                a(4, 13)
            },
            tip: 'The stack alternates a, b, a, b. Everything printed on the way down is printed again in reverse on the way up: a4 b3 a2 b1 b1 a2 b3 a4.'
    }, {
            // Return-value composition and expressions around recursive calls.
            t: 'Print the partial sums',
            pat: 'Print inside, return accumulates',
            code: 'int f(int n){\n  if(n==0) return 0;\n  int x=f(n-1);\n  printf("%d ",x);\n  return x+n;\n}\nint main(){ printf("%d",f(4)); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n == 0) return 0;
                        var x = g(n - 1, 3);
                        recordOutput(x, 4);
                        return x + n
                    })
                }
                recordOutput(g(4, 7), 7)
            },
            tip: 'The print runs after each inner call returns, so it shows the result of the smaller problem: 0 1 3 6. main prints the final 10 last.'
    }, {
            t: 'Print inside, then main prints',
            pat: 'Print vs return order',
            code: 'int f(int n){\n  if(n==0) return 0;\n  printf("%d ",n);\n  return n+f(n-1);\n}\nint main(){ printf("%d",f(3)); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n == 0) return 0;
                        recordOutput(n, 3);
                        return n + g(n - 1, 4)
                    })
                }
                recordOutput(g(3, 6), 6)
            },
            tip: 'Prints inside f happen during the calls (3 2 1). main prints the returned value only after f(3) has completely finished, so 6 comes last.'
    }, {
            // Nested recursion, where an inner call becomes an outer argument.
            t: 'Nested call: McCarthy 91',
            pat: 'Recursive call inside a call',
            code: 'int f(int n){\n  if(n>100) return n-10;\n  return f(f(n+11));\n}\nint main(){ printf("%d",f(99)); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n > 100) return n - 10;
                        return g(g(n + 11, 3), 3)
                    })
                }
                recordOutput(g(99, 5), 5)
            },
            tip: 'The inner f(n+11) must finish first, and its result becomes the argument of the outer call. For every n <= 100 the answer is 91.'
    }, {
            t: 'Nested call: f(f(n+5))',
            pat: 'Recursive call inside a call',
            code: 'int f(int n){\n  if(n>=10) return n-2;\n  return f(f(n+5));\n}\nint main(){ printf("%d",f(2)); }',
            run: function(recordCall, recordOutput) {
                function g(n, l) {
                    return recordCall('f(' + n + ')', l, function() {
                        if (n >= 10) return n - 2;
                        return g(g(n + 5, 3), 3)
                    })
                }
                recordOutput(g(2, 5), 5)
            },
            tip: 'f(2) first needs f(7): that needs f(12) = 10, then f(10) = 8. Then the outer call f(8) needs f(13) = 11, then f(11) = 9.'
    }, {
            // Multi-parameter recursion and Pascal-triangle branching.
            t: 'Combinations C(4,2)',
            pat: 'Two-parameter recursion',
            code: 'int C(int n,int r){\n  if(r==0||r==n) return 1;\n  return C(n-1,r-1)+C(n-1,r);\n}\nint main(){ printf("%d",C(4,2)); }',
            run: function(recordCall, recordOutput) {
                function g(n, r, l) {
                    return recordCall('C(' + n + ',' + r + ')', l, function() {
                        if (r == 0 || r == n) return 1;
                        return g(n - 1, r - 1, 3) + g(n - 1, r, 3)
                    })
                }
                recordOutput(g(4, 2, 5), 5)
            },
            tip: 'This is the Pascal triangle rule. Every leaf call returns 1, so the answer 6 equals the number of leaves. Total calls: 11.'
    }
];
