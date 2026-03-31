import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Test bucket access and return sample image URLs
export async function GET(request: NextRequest) {
  try {
    // Check NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Test 1: List files in bucket
    const { data: files, error: listError } = await supabase.storage
      .from('Intandokazi Products')
      .list('', {
        limit: 10,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      return NextResponse.json({ 
        success: false,
        error: 'Cannot list files in bucket',
        details: listError.message,
        suggestion: 'Make sure the bucket "Intandokazi Products" exists and is accessible'
      }, { status: 500 });
    }

    // Test 2: Generate public URLs for sample files
    const sampleUrls = files?.slice(0, 5).map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from('Intandokazi Products')
        .getPublicUrl(file.name);

      return {
        filename: file.name,
        publicUrl: publicUrl,
        expectedFormat: `https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/${file.name}`
      };
    }) || [];

    // Test 3: Check if bucket is public
    const bucketInfo = {
      name: 'Intandokazi Products',
      totalFiles: files?.length || 0,
      sampleFiles: files?.slice(0, 10).map(f => f.name) || [],
    };

    return NextResponse.json({ 
      success: true,
      message: 'Bucket access successful',
      bucketInfo,
      sampleUrls,
      instructions: {
        imageNaming: 'Images should be named using product slug (e.g., traditional-healing-tea.jpg)',
        uploadLocation: 'Upload images to Supabase Storage bucket: "Intandokazi Products"',
        publicAccess: 'Make sure bucket has public read access enabled',
        supportedFormats: ['.jpg', '.jpeg', '.png', '.webp']
      }
    });
  } catch (error) {
    console.error('Bucket test error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
