import { pushFileToGitHub } from '@/lib/github';

export interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export async function handleImageUploadWithGitHubSync(
  uploadFunction: () => Promise<UploadResult>
): Promise<UploadResult> {
  try {
    // Execute the upload function
    const result = await uploadFunction();
    
    // If upload was successful and we have a file path, try to push to GitHub
    if (result.success && result.filePath) {
      try {
        console.log(`Attempting to sync ${result.filePath} with GitHub...`);
        const pushed = await pushFileToGitHub(result.filePath);
        
        if (!pushed) {
          console.warn(`File uploaded successfully but failed to push to GitHub: ${result.filePath}`);
          // Continue anyway since the file was uploaded locally
        } else {
          console.log(`Successfully synced ${result.filePath} with GitHub`);
        }
      } catch (githubError) {
        console.error('GitHub sync error:', githubError);
        // Continue anyway since the file was uploaded locally
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error in image upload middleware:', error);
    return {
      success: false,
      error: 'Error processing image upload'
    };
  }
}
