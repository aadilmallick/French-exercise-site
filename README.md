# French Learning Hub

A comprehensive French learning platform built with [Docusaurus](https://docusaurus.io/), featuring interactive grammar lessons, vocabulary exercises, and cultural content.

## Features

- **Interactive Grammar Lessons**: Step-by-step French grammar tutorials
- **Practice Exercises**: Quizzes and activities to reinforce learning
- **Vocabulary Building**: Themed vocabulary lessons with pronunciation guides
- **Cultural Content**: Insights into French culture and traditions
- **Progress Tracking**: Monitor your learning journey

## Learning Path

### Beginner Level (A1-A2)

- Basic greetings and introductions
- Present tense verb conjugations
- Articles (le, la, les, un, une, des)
- Numbers and counting
- Days of the week and months

### Intermediate Level (B1-B2)

- Past and future tenses
- Complex sentence structures
- Idiomatic expressions
- Business and travel vocabulary
- Advanced grammar concepts

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
