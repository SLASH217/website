import type { CollectionConfig } from "payload"

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    // TODO: finalize on imageSizes
    // imageSizes: [
    //   { name: "thumbnail", width: 480, height: 320, position: "centre" },
    //   { name: "card", width: 768, height: 1024, position: "centre" },
    // ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
}
