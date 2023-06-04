# README

This repository contains code that fetches and summarizes data related to releases and commits in a GitHub repository. The code assumes that tags are assigned to each release. The code processes a CSV file containing information about different repositories and teams and outputs the summarized data in a CSV format.

## Installation

1. Clone this repository to your local machine.
2. Navigate to the repository's directory.
3. Install the required dependencies by running the following command:

   ```
   npm install
   ```

## Configuration

1. Set up a personal access token on GitHub:

   - Go to [GitHub Settings](https://github.com/settings/tokens) and generate a new personal access token with the necessary permissions.
   - Make sure to enable the `repo` scope for accessing repositories.
   - Copy the generated personal access token to your clipboard.

2. Set the `GITHUB_TOKEN` environment variable:
   - Create a new file named `.env` in the root of the repository.
   - Open the `.env` file and add the following line:
     ```
     GITHUB_TOKEN=YOUR_PERSONAL_ACCESS_TOKEN
     ```
   - Replace `YOUR_PERSONAL_ACCESS_TOKEN` with the personal access token you generated.

## Usage

1. Prepare a CSV file with the following format:

   ```
   owner1,team1,repository1
   owner2,team2,repository2
   owner3,team3,repository3
   ...
   ```

   Each row represents a repository to fetch data for, with the owner, team, and repository name separated by commas.

2. Run the code by executing the following command:

   ```
   npm start <csv_file_path>
   ```

   Replace `<csv_file_path>` with the path to your CSV file.

3. The code will fetch data for each repository specified in the CSV file and output the summarized information in the console.

## Output

The code outputs the following information for each release:

- Repository owner
- Team
- Repository name
- Tag name
- Release date
- Release interval time
- Number of pull requests
- Commit lead time average
- Number of hotfix pull requests

To determine the number of hotfix pull requests, the code relies on the presence of a "hotfix" label assigned to the respective pull requests.

The output is displayed in the console as comma-separated values (CSV) for each release.

## Example

Here is an example of how to use the code:

1. Create a CSV file named `repositories.csv` with the following content:

   ```
   john,team1,repo1
   jane,team2,repo2
   ```

2. Execute the following command:

   ```
   npm start /pathToYourCsvFile/repositories.csv
   ```

   The code will fetch and summarize data for `repo1` and `repo2` and display the results in the console.

## License

This project is licensed under the [MIT License](LICENSE).
