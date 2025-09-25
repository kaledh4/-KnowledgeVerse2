import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledgeEntries } from '@/lib/knowledge-actions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const results = await searchKnowledgeEntries(query);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching knowledge entries:', error);
    return NextResponse.json(
      { error: 'Failed to search knowledge entries' },
      { status: 500 }
    );
  }
}