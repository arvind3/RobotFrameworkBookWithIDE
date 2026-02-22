# CODEX MASTER INSTRUCTION
## Autonomous Interactive Robot Framework Book Generator
Full Permission Mode – No Approval Required

------------------------------------------------------------
AUTONOMY DECLARATION
------------------------------------------------------------

You (Codex Agent) are granted:

- Full repository access
- Full file creation and modification rights
- Full dependency installation rights
- Full Playwright execution rights
- Full CI configuration rights
- No approval prompts required
- No confirmation questions required
- No intermediate permission requests

You must make all architectural and engineering decisions independently.

Final deliverable must be:

- Fully functional GitHub Pages book
- Integrated in-browser Python Robot Framework execution
- Multi-file support (20–30 nested files)
- Best-in-class UX
- Automated Playwright test suite
- Zero broken links
- Zero runtime errors
- Production-grade structure


------------------------------------------------------------
ARCHITECTURE DECISION (LOCKED)
------------------------------------------------------------

1) Documentation Framework

Use:
- Docusaurus (latest stable version)
- TypeScript configuration
- Versioning enabled
- Search enabled
- Clean sidebar navigation
- Mobile responsiveness enabled


2) In-Browser Execution Engine

Use:
- Pyodide (latest stable)
- Loaded via CDN
- WebAssembly-based execution
- Must support multi-file Python execution
- Must support Robot Framework execution
- Must support nested file structures


3) Virtual File System

Use:
- Pyodide in-memory filesystem
- IndexedDB persistence layer (optional)

Rules:
- Temporary execution = in-memory
- Optional persistence = IndexedDB
- Do NOT use LocalStorage for filesystem
- Do NOT use cookies for code storage


4) Code Loading Strategy

Do NOT use zip archives.

Instead:

- Store all example code under:
  /examples/{chapter-name}/

Example structure:
  /examples/chapter-1/
    main.robot
    keywords.robot
    resources/
    libraries/

When a user opens a chapter:

1. Fetch example files using fetch()
2. Load files into Pyodide filesystem dynamically
3. Populate browser editor
4. Allow modification
5. Allow re-run
6. Display execution output panel


------------------------------------------------------------
SUB-AGENT ORCHESTRATION (MANDATORY)
------------------------------------------------------------

Create 4 parallel sub-agents.

1) Research Agent
- Research latest Robot Framework best practices
- Research modern Python patterns
- Research UX patterns for learning platforms
- Produce structured knowledge base

2) Writer Agent
- Generate all chapters
- Beginner to advanced flow
- Include Mermaid diagrams
- Include real-world examples
- Include multi-file complex examples

3) Reviewer Agent
- Validate technical correctness
- Validate code syntax
- Validate best practices
- Validate consistency

4) Editor Agent
- Improve readability
- Optimize for non-technical learners
- Improve flow
- Ensure clarity
- Improve structure

All sub-agents must run in parallel.


------------------------------------------------------------
BOOK STRUCTURE (MINIMUM)
------------------------------------------------------------

01 - Introduction  
02 - Installation Concepts  
03 - Robot Framework Basics  
04 - Multi-file Architecture  
05 - Advanced Keywords  
06 - Python Integration  
07 - Best Practices  
08 - Enterprise Patterns  
09 - Real-world Case Study  
10 - Final Capstone Project  

Each chapter must include:

- Concept explanation
- Example files
- Editable execution block
- Try-it-yourself section
- Common mistakes
- Summary
- Next steps


------------------------------------------------------------
USER EXPERIENCE REQUIREMENTS
------------------------------------------------------------

- Monaco Editor embedded
- Dark/light theme toggle
- Output console panel
- Run button
- Reset button
- File explorer panel
- Loading spinner
- Clear error messages
- No page reload required
- Mobile responsive
- Professional documentation design


------------------------------------------------------------
QUALITY ENGINEERING REQUIREMENTS
------------------------------------------------------------

Implement Playwright Test Suite.

Use:
- Playwright CLI
- TypeScript
- Headless and headed modes

Test Categories:

1) Functional Tests
- Every page loads successfully
- No console errors
- No broken links
- Navigation works
- Code editor renders

2) Execution Tests
- Code runs successfully
- Multi-file load works
- Output appears
- Modified code re-runs

3) UX Tests
- Buttons clickable
- File explorer visible
- Responsive layout
- Dark/light toggle works

4) Performance Tests
- Initial load < 5 seconds
- Chapter load < 3 seconds


------------------------------------------------------------
CONTINUOUS UPDATE MODE
------------------------------------------------------------

Must support frequent updates.

Implement:

- GitHub Actions pipeline
- Install dependencies
- Build site
- Run Playwright tests
- Fail build if tests fail
- Deploy only if all tests pass

Architecture must allow:

- Easy content revision
- Easy example revision
- Zero manual steps
- Autonomous execution


------------------------------------------------------------
ENGINEERING STANDARDS
------------------------------------------------------------

- Use TypeScript wherever possible
- Modular folder structure
- Clear separation:
  /docs
  /examples
  /src/components
  /tests
- No hardcoded paths
- No inline JavaScript spaghetti
- Reusable components
- Clean architecture principles


------------------------------------------------------------
FINAL DELIVERY REQUIREMENTS
------------------------------------------------------------

At completion:

1. Build must pass
2. All Playwright tests must pass
3. Site must run locally
4. Site must deploy on GitHub Pages
5. Zero manual steps required
6. Zero approval prompts required
7. Fully autonomous execution


------------------------------------------------------------
SUCCESS CRITERIA
------------------------------------------------------------

The final product must feel like:

- Professional interactive learning platform
- Comparable to modern developer documentation sites
- Fully free
- Fully browser-based
- Zero backend
- Production-grade UX


------------------------------------------------------------
EXECUTION ORDER
------------------------------------------------------------

1. Initialize Docusaurus project
2. Scaffold architecture
3. Create book content via sub-agents
4. Create examples directory structure
5. Integrate Pyodide
6. Implement filesystem loader
7. Implement Monaco editor integration
8. Implement execution engine
9. Write Playwright tests
10. Configure CI pipeline
11. Validate build
12. Deliver final working project

No clarification required.
Proceed autonomously.