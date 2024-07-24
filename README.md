# Text Github

Do you **hate** using github on a boring old browser cloning the same repos over and over again? With Text Github you dont have to!!

You need a Github API Token for this to work:
[text](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) (classic tokens are best)

Then copy your new token and make a new ***environment variable***

### Windows

Open Environment Variables:

1.   Press Win + X and select "System".
2.   Click on "Advanced system settings".
3.   Click on "Environment Variables".

Add a New System Variable:

1. Click "New" under "System variables".
2. Set Variable name to GITHUB_TOKEN.
3. Set Variable value to your GitHub token.

### macOS/Linux

Do this to set environment variables"
https://phoenixnap.com/kb/set-environment-variable-mac

1. Open Terminal.
2. Edit your shell configuration file (e.g., .bashrc, .zshrc, or .bash_profile):

```
export GITHUB_TOKEN=your_personal_access_token
```

```
source ~/.bashrc  # or ~/.zshrc, ~/.bash_profile depending on your shell
```

### Install the Package Globally

After making these changes, install your package globally:

Build the package:

`npm run build`

Install globally:


`npm install -g `

Step 4: Run the CLI

Now you should be able to run your CLI globally with the GitHub token accessible:

thub -- search <username>
