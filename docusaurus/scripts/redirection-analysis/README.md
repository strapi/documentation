# Redirect Analysis and Generator

The `redirect-analyzer.js` script analyzes the content of two different branches to automatically generate Vercel redirections.

## Prerequisites

- Node.js installed on your machine
- Both branches already cloned locally

## Installation

1. Clone both branches in separate folders:
```bash
# For the old structure
git clone [your-repo] old-structure
cd old-structure
git checkout [branch-name-with-the-old-structure]
cd ..

# For the new structure
git clone [your-repo] new-structure
cd new-structure
git checkout [branch-name-with-the-new-structure]
cd ..
```

2. Install dependencies:
```bash
yarn add gray-matter string-similarity cli-progress
```

## Usage

1. Run the script:
```bash
node redirect-analyzer.js
```

2. The script will:
   - Archive previous analysis reports
   - Scan files in both structures
   - Analyze content similarities
   - Generate redirections

3. Generated files will be in the `results/` folder:
   - `vercel.json`: redirections to use with Vercel
   - `redirect-analysis-report.md`: detailed redirections report
   - `redirect-analysis-detailed.log`: complete technical log

Previous reports are automatically archived in `results/archives/` with a timestamp.

## Configuration

If needed, you can adjust in the script:
- `IGNORED_DIRECTORIES`: directories to ignore
- `IGNORED_FILES`: files to ignore
- `SIMILARITY_THRESHOLD`: similarity threshold (0 to 1)
- `MANUAL_REDIRECTS`: manual redirections to force

## Understanding the Report

The generated report contains:
- Redirections identified by directory
- Files without matches
- Redirection statistics
- Required actions if any

## Output Example

The script provides real-time progress in the terminal:
```
Starting redirections analysis...
[████████████] 100% | Scanning files
[██████████░░] 80%  | Analyzing matches
[████████░░░░] 70%  | Generating redirections

Process completed successfully!
- Detailed log: results/redirect-analysis-detailed.log
- Final report: results/redirect-analysis-report.md
- Redirections: results/vercel.json
```