// Test script to verify Supabase bucket upload
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'found' : 'missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? 'found' : 'missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testBucketAccess() {
  console.log('Testing Supabase bucket access...\n');
  
  // Test 1: List buckets
  console.log('1. Listing all buckets:');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError);
  } else {
    console.log('✅ Available buckets:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (public: ${bucket.public})`);
    });
  }
  
  // Test 2: List files in "Intandokazi Products" bucket
  console.log('\n2. Listing files in "Intandokazi Products" bucket:');
  const { data: files, error: listError } = await supabase.storage
    .from('Intandokazi Products')
    .list();
  
  if (listError) {
    console.error('❌ Error listing files:', listError);
    console.log('\nPossible issues:');
    console.log('- Bucket name might be incorrect');
    console.log('- Bucket might not exist');
    console.log('- Bucket might not be public');
  } else {
    console.log(`✅ Found ${files.length} files`);
    files.slice(0, 5).forEach(file => {
      console.log(`   - ${file.name}`);
    });
  }
  
  // Test 3: Try to upload a test file
  console.log('\n3. Testing file upload:');
  const testContent = Buffer.from('test image content');
  const testFilename = 'test-upload.jpg';
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('Intandokazi Products')
    .upload(testFilename, testContent, {
      contentType: 'image/jpeg',
      upsert: true,
    });
  
  if (uploadError) {
    console.error('❌ Upload failed:', uploadError);
    console.log('\nError details:');
    console.log('Message:', uploadError.message);
    console.log('Status:', uploadError.statusCode);
    
    if (uploadError.message.includes('new row violates row-level security')) {
      console.log('\n⚠️  ISSUE: Row Level Security (RLS) is blocking uploads');
      console.log('SOLUTION: You need to configure RLS policies in Supabase:');
      console.log('1. Go to Supabase Dashboard > Storage > Intandokazi Products');
      console.log('2. Click "Policies" tab');
      console.log('3. Add policy to allow INSERT for authenticated users');
      console.log('4. Or make the bucket public for uploads');
    }
  } else {
    console.log('✅ Upload successful!');
    console.log('Path:', uploadData.path);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('Intandokazi Products')
      .getPublicUrl(testFilename);
    console.log('Public URL:', publicUrl);
    
    // Clean up test file
    await supabase.storage
      .from('Intandokazi Products')
      .remove([testFilename]);
    console.log('✅ Test file cleaned up');
  }
  
  console.log('\n=== Test Complete ===\n');
}

testBucketAccess().catch(console.error);
