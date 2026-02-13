This is an Angular application designed to read data from the websports.co.za API, and display the data in a user-friendly format. The application is set up to be hosted on GitHub Pages.
It includes features such as viewing sports scores, fixtures, and league standings. The project is structured using Angular best practices and is configured for easy deployment to GitHub Pages.

## Code Standards

### Required Before Each Commit
- Ensure all code is formatted using Prettier.
- Run all unit tests and ensure they pass.
- Keep console.log messages to a minimum, using them only for debugging purposes.

### Repository Structure
- Follow Angular's recommended project structure.
- Keep components, services, and modules organized in their respective directories.

### Angular Best Practices
- Use standalone components where appropriate.
- Use separate files for component styles and templates.

## AI Agents Instructions

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.
- If the user asks a question, answer it before coding. Don't assume you know the intent.
- If you don't have write access, say so. Don't just write instructions for someone else to implement.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.