import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET(
  request: Request,
  { params }: { params: { type: string; slug: string } }
) {
  try {
    const { type, slug } = params;
    
    // Validate type
    const validTypes = ['spells', 'creatures', 'rules', 'tools'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }
    
    // Construct file path
    const filePath = path.join(process.cwd(), 'content', type, `${slug}.mdx`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    return NextResponse.json({
      metadata: data,
      content: content,
      slug: slug,
      type: type
    });
  } catch (error) {
    console.error('Error loading content:', error);
    return NextResponse.json(
      { error: 'Failed to load content' },
      { status: 500 }
    );
  }
}