import { NextRequest, NextResponse } from 'next/server';
import { getKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry } from '@/lib/knowledge-actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const entry = await getKnowledgeEntry(params.id, session.user.id);
    
    if (!entry) {
      return NextResponse.json(
        { error: 'Knowledge entry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error fetching knowledge entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge entry' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const entry = await updateKnowledgeEntry(params.id, {
      title: isUrl ? 'Extracting...' : source.substring(0, 100),
      textForEmbedding: isUrl ? '' : source,
      originalSource: isUrl ? source : undefined,
      contentType: isUrl ? 
        (source.includes('youtube.com') || source.includes('youtu.be') ? 'YOUTUBE_LINK' : 'X_POST_LINK') : 
        'TEXT',
      tags: tags,
    }, session.user.id);
    
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error updating knowledge entry:', error);
    return NextResponse.json(
      { error: 'Failed to update knowledge entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await deleteKnowledgeEntry(params.id, session.user.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting knowledge entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete knowledge entry' },
      { status: 500 }
    );
  }
}