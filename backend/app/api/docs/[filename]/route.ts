import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Security: Only allow specific markdown files
    const allowedFiles = [
      'installation-setup.md',
      'usage-guide.md', 
      'extensibility.md',
      'project.md'
    ];
    
    if (!allowedFiles.includes(filename)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Read the markdown file from assets/docs
    const filePath = join(process.cwd(), '..', 'assets', 'docs', filename);
    const content = readFileSync(filePath, 'utf-8');
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error reading documentation file:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
