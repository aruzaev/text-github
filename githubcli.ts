#! /usr/bin/env node

import figlet from "figlet";
import axios from "axios";
import chalk from "chalk";
import fs from 'fs';
import { exec } from 'child_process';
import { Command } from "commander";
import dotenv from 'dotenv';
import inquirer from 'inquirer';

dotenv.config();

const program = new Command();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
    console.error(chalk.red("GitHub token not found. Please set it in the .env file."));
    process.exit(1);
}

interface GithubUser {
    login: string;
}

interface GithubRepo {
    name: string;
    description: string;
}

const getUser = async (username: string): Promise<GithubUser | null> => {
    const url = `https://api.github.com/users/${username}`;
    const headers = { Authorization: `token ${GITHUB_TOKEN}` };
    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
            return null;  // User not found
        }
        throw error;  // Re-throw other errors
    }
};

const getRepos = async (username: string): Promise<GithubRepo[]> => {
    const url = `https://api.github.com/users/${username}/repos`;
    const headers = { Authorization: `token ${GITHUB_TOKEN}` };
    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
            return [];  // No repositories found
        }
        throw error;  // Re-throw other errors
    }
};

const getReadme = async (username: string, repoName: string) => {
    const url = `https://api.github.com/repos/${username}/${repoName}/readme`;
    const headers = { Authorization: `token ${GITHUB_TOKEN}` };
    const response = await axios.get(url, { headers });
    const readmeData = response.data;
    const readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf8');
    return readmeContent;
};

const handleRepoActions = async (username: string, repoName: string) => {
    const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'Select an action:',
        choices: [
            { name: 'Read README', value: 'readme' },
            { name: 'Clone Repository', value: 'clone' },
            { name: 'Download as ZIP', value: 'zip' },
        ],
    }]);

    if (action === 'readme') {
        const readme = await getReadme(username, repoName);
        console.log(chalk.yellow(readme));
    } else if (action === 'clone') {
        exec(`git clone https://github.com/${username}/${repoName}.git`, (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error(chalk.red(`Error cloning repository: ${stderr}`));
            } else {
                console.log(chalk.green(`Repository cloned: ${stdout}`));
            }
        });
    } else if (action === 'zip') {
        const zipUrl = `https://github.com/${username}/${repoName}/archive/refs/heads/main.zip`;
        const writer = fs.createWriteStream(`${repoName}.zip`);
        const response = await axios({
            url: zipUrl,
            method: 'GET',
            responseType: 'stream',
        });
        response.data.pipe(writer);
        writer.on('finish', () => {
            console.log(chalk.green(`Repository downloaded as ZIP: ${repoName}.zip`));
        });
        writer.on('error', (error: any) => {
            console.error(chalk.red(`Error downloading ZIP: ${error.message}`));
        });
    }
};

program
    .name("Github CLI")
    .description("Text based github client!")
    .version("0.0.1");

program
    .command("search <username>")
    .description("Search for a GitHub user")
    .action(async (username: string) => {
        const user = await getUser(username);
        if (user) {
            console.log(chalk.green(`User ${user.login} Found!`));
            const repos = await getRepos(username);
            repos.forEach((repo, i) => {
                console.log(`${i + 1}. ${repo.name}`);
            });

            if (repos.length > 0) {
                const { repoIndex } = await promptForRepoIndex(repos.length);
                const repoName = repos[repoIndex - 1].name;
                await handleRepoActions(username, repoName);
            } else {
                console.log(chalk.yellow(`No repositories found for ${username}`));
            }
        } else {
            console.log(chalk.red(`User ${username} not found!`));
        }
    });

console.log(chalk.blue(figlet.textSync("GitHub CLI")));

program.parse(process.argv);

async function promptForRepoIndex(repoCount: number): Promise<{ repoIndex: number }> {
    return inquirer.prompt([{
        type: 'input',
        name: 'repoIndex',
        message: `Enter the repository number (1-${repoCount}):`,
        validate: (value: number) => {
            const valid = !isNaN(value) && value > 0 && value <= repoCount;
            return valid || 'Please enter a valid number.';
        },
        filter: Number
    }]);
}
