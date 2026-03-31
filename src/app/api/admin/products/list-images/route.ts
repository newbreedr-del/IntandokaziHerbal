import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List all images in the Intandokazi Products bucket
export async function GET(request: NextRequest) {
  try {
    // Check NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // List all files in the bucket
    const { data: files, error } = await supabase.storage
      .from('Intandokazi Products')
      .list();

    if (error) {
      console.error('Storage error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Generate public URLs for each file
    const imagesWithUrls = files?.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from('Intandokazi Products')
        .getPublicUrl(file.name);

      return {
        name: file.name,
        url: publicUrl,
        size: file.metadata?.size,
        contentType: file.metadata?.mimetype,
        lastModified: file.metadata?.lastModified,
      };
    }) || [];

    return NextResponse.json({ 
      success: true,
      count: imagesWithUrls.length,
      images: imagesWithUrls 
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
