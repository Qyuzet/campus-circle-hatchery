import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setupStorage() {
  console.log("Setting up Supabase Storage...");

  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();

  if (listError) {
    console.error("Error listing buckets:", listError);
    process.exit(1);
  }

  const bucketExists = buckets?.some(
    (bucket) => bucket.name === "study-materials"
  );

  if (bucketExists) {
    console.log('Bucket "study-materials" already exists');
    console.log("Updating bucket configuration...");

    const { data: updateData, error: updateError } =
      await supabase.storage.updateBucket("study-materials", {
        public: true,
        fileSizeLimit: 20971520,
        allowedMimeTypes: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/jpg",
          "image/png",
        ],
      });

    if (updateError) {
      console.error("Error updating bucket:", updateError);
    } else {
      console.log("Bucket updated successfully");
    }
  } else {
    console.log('Creating bucket "study-materials"...');
    const { data, error } = await supabase.storage.createBucket(
      "study-materials",
      {
        public: true,
        fileSizeLimit: 20971520,
        allowedMimeTypes: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/jpg",
          "image/png",
        ],
      }
    );

    if (error) {
      console.error("Error creating bucket:", error);
      process.exit(1);
    }

    console.log("Bucket created successfully:", data);
  }

  console.log("Supabase Storage setup complete!");
}

setupStorage();
