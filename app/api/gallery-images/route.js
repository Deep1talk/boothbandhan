import { catchError, errorResponse, successResponse } from "@/lib/helper";
import { createGalleryImages, listGalleryImages } from "@/lib/gallery";
import { requireRequestUser } from "@/lib/server/requestUser";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const data = await listGalleryImages({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      limit: searchParams.get("limit"),
    });

    return successResponse(200, "Gallery images fetched successfully", data);
  } catch (error) {
    return catchError(error);
  }
}

export async function POST(req) {
  try {
    const auth = await requireRequestUser(req, ["Admin"]);

    if (!auth.ok) {
      return auth.response;
    }

    const formData = await req.formData();
    const files = formData
      .getAll("images")
      .filter((file) => file instanceof File && file.size > 0);

    if (!files.length) {
      return errorResponse(400, "Please choose at least one gallery image.");
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return errorResponse(400, "Gallery uploads must be image files.");
      }

      if (file.size > 1024 * 1024) {
        return errorResponse(
          400,
          "Each gallery image must be 1MB or smaller after optimization."
        );
      }
    }

    const images = await createGalleryImages(auth.user.id, files);

    return successResponse(201, "Gallery images uploaded successfully", {
      images,
    });
  } catch (error) {
    return catchError(error);
  }
}
