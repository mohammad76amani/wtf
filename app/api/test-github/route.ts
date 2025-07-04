import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function GET() {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'mohammad76amani';
    const REPO_NAME = 'salonets';
    
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: 'GitHub token not found in environment variables' 
      }, { status: 500 });
    }
    
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    
    // Test authentication
    const { data: user } = await octokit.users.getAuthenticated();
    
    // Test repository access
    let repoData;
    try {
      const response = await octokit.repos.get({
        owner: REPO_OWNER,
        repo: REPO_NAME,
      });
      repoData = response.data;
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        error: `Repository not found: ${REPO_OWNER}/${REPO_NAME} : ${error}`,
        user: user
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: user,
      repository: repoData
    });
  } catch (error) {
    console.error('Error testing GitHub API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error testing GitHub API' 
    }, { status: 500 });
  }
}
