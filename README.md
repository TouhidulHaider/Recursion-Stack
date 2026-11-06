# Recursion Insight

An interactive learning platform for understanding recursion through visual execution traces, stack behavior, recurrence relations, and worked examples.

## What it includes

- Step-by-step recursion tracing with call stacks and return values
- Interactive lessons for pre-order, in-order, and post-order execution
- Multiple recursive calls, loops, globals, statics, pointers, arrays, and increments
- Digit and binary conversion examples
- A custom C-like recursion tracer
- A Previous Year MCQ tab with 100 JSON-backed questions, scoring, explanations, and random-question practice
- Recurrence Relations lessons covering iteration, recursion trees, the Master Theorem, common DSA recurrences, complexity references, and exam practice
- Responsive layout for desktop and mobile screens

## Run locally

This is a dependency-free static web application. Open [`index.html`](./index.html) in a browser, or serve the folder with any static web server:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Deploy with GitHub Pages

The repository includes a GitHub Actions workflow that publishes the project to GitHub Pages whenever changes are pushed to `main`.

To enable it:

1. Open the repository's **Settings** tab.
2. Select **Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Push changes to `main` and wait for the Pages workflow to finish.

The site will be available at:

<https://touhidulhaider.github.io/Recursion-Stack/>

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Application shell and lesson markup |
| `styles.css` | Shared application and recursion lesson styles |
| `recurrence.css` | Recurrence Relations module styles |
| `app.js` | Trace engine, custom interpreter, and shared UI behavior |
| `lessons.js` | Built-in recursion practice definitions |
| `recurrence.js` | Recurrence module runtime and interactive controls |
| `recurrence-lessons.js` | Recurrence curriculum content |
| `recurrence-practice.js` | Recurrence practice question bank |
| `pyq.js` | Previous Year MCQ loading, navigation, scoring, and feedback |
| `pyq.css` | Previous Year MCQ styles |
| `recursion_100_mcqs.json` | Previous Year MCQ question bank |

## Technology

- HTML
- CSS
- Vanilla JavaScript
- No build step
- No external runtime dependencies

## License

This project is available for learning and educational use.
