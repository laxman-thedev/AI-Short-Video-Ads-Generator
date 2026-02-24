#  Contributing to AI-Short-Video-Ads-Generator

Thank you for considering contributing to **AI-Short-Video-Ads-Generator**!   
We welcome all contributions, whether it's bug fixes, new features, documentation improvements, or ideas.

---

##  How to Contribute

1. **Fork the Repository**
    - Click the **Fork** button on the top right of the original repository.
    - Clone **your fork** locally:
      ```bash
      git clone https://github.com/<your-username>/AI-Short-Video-Ads-Generator.git
      cd AI-Short-Video-Ads-Generator
      ```

2. **Create a New Branch**
    - For a new feature:
      ```bash
      git checkout -b feature/your-feature-name
      ```
    - For a bug fix (referencing issue number if available):
      ```bash
      git checkout -b fix/issue-123-short-title
      ```

3. **Make Your Changes**
    - Follow the project’s coding style.
    - Add comments where necessary.
    - Update documentation if needed.

4. **Commit Your Changes**
    ```bash
    git commit -m "Add: your feature description"
    ```

5. **Push to Your Branch**
    ```bash
    git push origin feature/your-feature-name
    ```

6. **Open a Pull Request**
    - Go to your forked repo on GitHub.
    - Click "New Pull Request".
    - Describe your changes clearly.

## 🧑‍💻 Development Guidelines

### Branching Strategy

- Always create a new branch for your feature/fix:
  ```bash
  git checkout -b feature/your-feature-name
  git checkout -b fix/your-fix-name
  ```
- Don’t commit directly to `main`.

### Code Style

- Use `camelCase` for variables and functions.
- Use `PascalCase` for components.
- Keep components small and reusable.

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat:` → new feature
- `fix:` → bug fix
- `docs:` → documentation changes
- `style:` → formatting (no code changes)
- `refactor:` → code restructuring

### Testing & Validation

- Run the app locally before pushing:
  ```bash
  npm run dev
  ```
- Make sure no console errors or warnings appear.

### Dependencies

- Avoid adding unnecessary npm packages.
- If a new dependency is required, mention it in the PR description.

### Pull Requests (PRs)

- Keep PRs small and focused.
- Add screenshots or descriptions if UI changes are made.

##  Reporting Issues

If you find a bug or have a feature request:

- Open an Issue
- Provide clear steps to reproduce (for bugs)
- Suggest a possible solution if you have one

##  Code of Conduct

Please be respectful, constructive, and inclusive in all interactions.