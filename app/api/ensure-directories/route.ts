import { NextResponse } from 'next/server';
import { ensureDirectoriesExist } from '@/lib/ensureDirectories';

// This endpoint can be called during app initialization
export async function GET() {
  try {
    ensureDirectoriesExist();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ensuring directories exist:', error);
    return NextResponse.json({ success: false, error: 'Failed to ensure directories exist' }, { status: 500 });
  }
}
