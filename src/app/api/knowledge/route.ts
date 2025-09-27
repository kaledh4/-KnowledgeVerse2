import { NextRequest, NextResponse } from 'next/server';
import { getKnowledgeEntries, createKnowledgeEntry } from '@/lib/knowledge-actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '9');

    const result = await getKnowledgeEntries(limit, cursor, session.user.id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching knowledge entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { source, tags } = body;

    if (!source || !tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Source and tags are required' },
        { status: 400 }
      );
    }

    // Determine if source is a URL or text content
    const isUrl = source.includes('youtube.com') || 
                  source.includes('youtu.be') ||
                  source.includes('x.com') ||
                  source.includes('twitter.com');

    const entry = await createKnowledgeEntry({
      title: isUrl ? 'Extracting...' : source.substring(0, 100),
      textForEmbedding: isUrl ? '' : source,
      originalSource: isUrl ? source : undefined,
      contentType: isUrl ? 
        (source.includes('youtube.com') || source.includes('youtu.be') ? 'YOUTUBE_LINK' : 'X_POST_LINK') : 
        'TEXT',
      tags: tags,
      userId: session.user.id,
    });
    
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error creating knowledge entry:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge entry' },
      { status: 500 }
    );
  }
}