import { created, fail, serverError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { isCloudinaryConfigured, uploadImage } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await requireUserId();

  if (!userId) {
    return fail("Unauthorized.", { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return fail("Cloudinary is not configured.", { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return fail("An image file is required.", { status: 422 });
    }

    const result = await uploadImage(file);
    return created(result);
  } catch (error) {
    return serverError(error);
  }
}
