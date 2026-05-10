import { v2 as cloudinary } from "cloudinary";

export type UploadResult = {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
};

export function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_URL);
}

export async function uploadImage(file: File): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "traveloop",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
        });
      },
    );

    stream.end(buffer);
  });
}
