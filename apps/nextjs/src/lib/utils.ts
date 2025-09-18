import type { ClassValue } from "clsx";
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { UploadRouter } from "~/app/api/uploadthing/core";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const UploadButton = generateUploadButton<UploadRouter>();
export const UploadDropzone = generateUploadDropzone<UploadRouter>();
