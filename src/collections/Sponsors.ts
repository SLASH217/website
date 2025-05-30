import { CollectionConfig } from "payload"

export const Sponsors: CollectionConfig = {
  slug: "sponsors",
  upload: {
    mimeTypes: ["image/*"],
    adminThumbnail: "thumbnail",
    imageSizes: [
      {
        name: "thumbnail",
        width: 480,
        height: 320,
        position: "centre",
      },
    ],
  },
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "site",
      type: "text",
      admin: {
        description: "The URL to the sponsor's website",
      },
    },
  ],
}
