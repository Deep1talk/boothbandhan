import { catchError, errorResponse, successResponse } from "@/lib/helper";
import { deleteGalleryImage } from "@/lib/gallery";
import { requireRequestUser } from "@/lib/server/requestUser";

export async function DELETE(req, { params }) {
  try {
    const auth = await requireRequestUser(req, ["Admin"]);

    if (!auth.ok) {
      return auth.response;
    }

    const { imageId } = await params;
    const image = await deleteGalleryImage(imageId);

    if (!image) {
      return errorResponse(404, "Gallery image not found.");
    }

    return successResponse(200, "Gallery image removed successfully", {
      image,
    });
  } catch (error) {
    return catchError(error);
  }
}
