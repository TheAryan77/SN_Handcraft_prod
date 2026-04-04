import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import ImageKit from "@imagekit/nodejs";
import { config } from "../config";
import { createError } from "../middlewares/errorHandler";

const sanitizeFolderSegment = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "uncategorized";

const getImageKitClient = () => {
    const { privateKey } = config.imagekit;

    if (!privateKey) {
        throw createError(
            "ImageKit is not configured. Set IMAGEKIT_PRIVATE_KEY.",
            500
        );
    }

    return new ImageKit({
        privateKey,
    });
};

export const uploadProductImages = async (
    files: Express.Multer.File[],
    categoryFolder: string
) => {
    if (!files.length) {
        return [] as string[];
    }

    const imagekit = getImageKitClient();
    const baseFolder = config.imagekit.baseFolder || "sn-handcrafts";
    const targetFolder = `/${baseFolder}/${sanitizeFolderSegment(categoryFolder)}`;

    try {
        const uploads = await Promise.all(
            files.map(async (file) => {
                const extension = path.extname(file.originalname || "");
                const safeFileName = `${path.basename(file.filename, path.extname(file.filename))}${extension}`;

                return imagekit.files.upload({
                    file: fsSync.createReadStream(file.path),
                    fileName: safeFileName,
                    folder: targetFolder,
                    useUniqueFileName: true,
                });
            })
        );

        const urls = uploads.map((asset) => asset.url).filter((url): url is string => Boolean(url));
        if (urls.length !== uploads.length) {
            throw createError("ImageKit upload failed to return URL for one or more images.", 500);
        }
        return urls;
    } finally {
        await Promise.all(
            files.map(async (file) => {
                try {
                    await fs.unlink(file.path);
                } catch {
                    // Ignore temp file cleanup failure.
                }
            })
        );
    }
};
