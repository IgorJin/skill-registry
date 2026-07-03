Task create method.

Create a markdown task in the current project using the Task Manager format.

If the user provides an id, use it. If no id is provided, infer the next id from existing files in tasks/inbox, tasks/backlog, tasks/active, and tasks/done when possible; otherwise ask for the project prefix or use a clear placeholder.

Default location: tasks/inbox/.

The task must include:
- a clear title
- goal
- context
- scope
- acceptance criteria
- implementation notes
- empty sections for changed files, tests, manual verification, diff summary, and follow-up

Do not implement the task while creating it unless explicitly asked.
