import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ibbtrqseoraqamcyigdb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliYnRycXNlb3JhcWFtY3lpZ2RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NjI1MzcsImV4cCI6MjA2MzAzODUzN30.UhvcOPRvtlz_ZLfAeT2PFsmkceKjjFDui-Mf4I-HfdY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function uploadImage(
  file: Blob,
  filename: string
): Promise<string | null> {
  const path = `public/${filename}`;
  console.log("Uploading to path:", path);
  console.log("Bucket name:", "public-photos");
  console.log("Supabase project:", SUPABASE_URL);

  const { error } = await supabase.storage
    .from("public-photos")
    .upload(`${filename}`, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: "image/png",
    });

  if (error) {
    console.error("Upload error:", JSON.stringify(error, null, 2));
    return null;
  }

  return `${SUPABASE_URL}/storage/v1/object/public/public-photos/public/${filename}`;
}
