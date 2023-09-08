# README

This repository contains code designed to fetch and summarize data associated with releases and commits within a GitHub repository. It's built on the assumption that each release has corresponding tags. The primary function of this code is to process a CSV file detailing information on various repositories and their associated teams, subsequently outputting the summarized data in CSV format.

## Installation

1. Clone this repository onto your local machine.
2. Navigate to the cloned directory.
3. Install the necessary dependencies with the command:
   ```bash
   npm install
   ```

## Configuration

1. Set up a personal access token on GitHub:

   - Visit [GitHub Settings](https://github.com/settings/tokens) and generate a new personal access token with the appropriate permissions.
   - Ensure you enable the `repo` scope for repository access.
   - Copy the generated token.

2. Configure the `GITHUB_TOKEN` environment variable:

   - Create a `.env` file in the repository's root directory.
   - Within the `.env` file, insert:
     ```bash
     GITHUB_TOKEN=YOUR_PERSONAL_ACCESS_TOKEN
     ```
   - Substitute `YOUR_PERSONAL_ACCESS_TOKEN` with the token you generated earlier.

3. To exclude commits made by specific users:
   - Copy `.env.sample` to `.env` and adjust the `BOT_NAMES` accordingly.

## Usage

1. Prepare a CSV file formatted as follows:

   ```csv
   owner1,team1,repository1
   owner2,team2,repository2
   ...
   ```

   Here, each line represents a repository, indicating its owner, the team, and the repository name.

2. To execute the code, use:

   ```bash
   npm start <path_to_your_CSV_file> <start_date_for_tags>
   ```

   Replace `<path_to_your_CSV_file>` with your CSV file's path and `<start_date_for_tags>` with the desired starting date for fetching release tags.

3. The program will gather data for every repository specified in the CSV file. It will then generate a summary in both `./out/output.csv` and the console.

## Output

For each release, the output will display:

- Repository owner
- Team
- Repository name
- Tag name
- Release date
- Total pull requests
- Hotfix pull requests
- Commits within pull requests
- Cumulative time until commits' release

To identify hotfix pull requests, the software checks for the "hotfix" label on the respective pull requests.

Results appear in the console in CSV format.

## Example

To illustrate its usage:

1. Craft a CSV file named `repositories.csv` with:

   ```csv
   john,team1,repo1
   jane,team2,repo2
   ```

2. Run:
   ```bash
   npm start /path_to_your_file/repositories.csv 2023-09-01T00:00:00+09:00
   ```

The code will then extract and condense data for both `repo1` and `repo2`, presenting the summary in the console.

## License

This software is under the [MIT License](LICENSE).
