// Test with Service Role Key (has admin privileges)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this to .env.local

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials');
  console.log('Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupBucketPolicies() {
  console.log('Setting up bucket policies with Service Role Key...\n');
  
  try {
    // Make bucket public
    const { data, error } = await supabase
      .storage
      .from('Intandokazi Products')
      .getPublicUrl('test.jpg');
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('✅ Bucket is accessible');
      console.log('Public URL format:', data.publicUrl);
    }
    
    // Test upload with service role
    console.log('\nTesting upload with Service Role...');
    const testContent = Buffer.from('test image content');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('Intandokazi Products')
      .upload('test-service.jpg', testContent, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
    } else {
      console.log('✅ Upload successful with Service Role!');
      
      // Clean up
      await supabase.storage
        .from('Intandokazi Products')
        .remove(['test-service.jpg']);
      console.log('✅ Test file cleaned up');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

setupBucketPolicies();
