import { Octokit } from '@octokit/rest';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'mohammad76amani';
const REPO_NAME = 'salonets';
const DEFAULT_BRANCH = 'main';

export async function pushFileDirectlyToGitHub(
  filePath: string, 
  content: string, 
  isBase64: boolean = false
): Promise<boolean> {
  try {
    if (!GITHUB_TOKEN) {
      console.error('GitHub token not found in environment variables');
      return false;
    }

    console.log(`Attempting to push ${filePath} directly to GitHub repository ${REPO_OWNER}/${REPO_NAME}`);
    
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    
    // If content is not already base64 encoded, encode it
    const base64Content = isBase64 
      ? content.replace(/^data:image\/\w+;base64,/, '') // Remove the data URL prefix if it exists
      : Buffer.from(content).toString('base64');
    
    // Try to get repository info to determine the default branch
    let defaultBranch = DEFAULT_BRANCH;
    
    try {
      console.log(`Checking repository ${REPO_OWNER}/${REPO_NAME} for default branch...`);
      const { data: repoData } = await octokit.repos.get({
        owner: REPO_OWNER,
        repo: REPO_NAME,
      });
      defaultBranch = repoData.default_branch;
      console.log(`Repository exists. Default branch: ${defaultBranch}`);
    } catch (error) {
      console.error(`Could not get repository info: ${error}`);
      console.log(`Using default branch: ${defaultBranch}`);
      // Continue with the default branch
    }
    
    // Try different branch names if needed
    let refData;
    let branchExists = false;
    
    // Try with the detected/default branch
    try {
      console.log(`Checking if branch '${defaultBranch}' exists...`);
      const response = await octokit.git.getRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `heads/${defaultBranch}`,
      });
      refData = response.data;
      branchExists = true;
      console.log(`Branch '${defaultBranch}' exists.`);
    } catch (error) {
      console.warn(`Branch '${defaultBranch}' not found, trying 'master'... (error: ${error})`);
      
      // If that fails, try with 'master'
      try {
        const response = await octokit.git.getRef({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          ref: 'heads/master',
        });
        refData = response.data;
        defaultBranch = 'master';
        branchExists = true;
        console.log(`Branch 'master' exists.`);
      } catch (masterError) {
        console.error('Failed to find any branch.' + masterError);
        return false;
      }
    }
    
    if (!branchExists || !refData) {
      console.error('Could not find a valid branch');
      return false;
    }
    
    const baseCommitSha = refData.object.sha;
    
    // Get the current tree
    console.log(`Getting commit data for SHA: ${baseCommitSha}`);
    const { data: commitData } = await octokit.git.getCommit({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      commit_sha: baseCommitSha,
    });
    
    // GitHub path should be relative to repo root
    const githubPath = `public${filePath}`;
    console.log(`GitHub path: ${githubPath}`);
    
    // Create a blob for the file
    console.log('Creating blob for file content...');
    const { data: blobData } = await octokit.git.createBlob({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      content: base64Content,
      encoding: 'base64',
    });
    
    // Create a new tree with the new blob
    console.log('Creating new tree with the blob...');
    const { data: treeData } = await octokit.git.createTree({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      base_tree: commitData.tree.sha,
      tree: [
        {
          path: githubPath,
          mode: '100644', // File mode
          type: 'blob',
          sha: blobData.sha,
        },
      ],
    });
    
    // Create a new commit
    console.log('Creating new commit...');
    const { data: newCommitData } = await octokit.git.createCommit({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      message: `Update ${path.basename(filePath)}`,
      tree: treeData.sha,
      parents: [baseCommitSha],
    });
    
    // Update the reference
    console.log(`Updating reference to point to new commit...`);
    await octokit.git.updateRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `heads/${defaultBranch}`,
      sha: newCommitData.sha,
    });
    
    console.log(`Successfully pushed ${filePath} to GitHub`);
    return true;
  } catch (error) {
    console.error('Error pushing file directly to GitHub:', error);
    return false;
  }
}
