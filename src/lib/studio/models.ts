// Re-export Studio model registry for convenient import inside Studio modules.
export {
  STUDIO_MODELS,
  IMAGE_TYPE_SIZES,
  computeStudioEnergyCost,
  getPinnedSize,
  megapixelsForSize,
} from "@/lib/energy-config";

export type {
  StudioModel,
  StudioModelKey,
  StudioCostUnit,
  ImageType,
  PinnedSize,
} from "@/lib/energy-config";
