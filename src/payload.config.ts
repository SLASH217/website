import { postgresAdapter } from "@payloadcms/db-postgres"
import { s3Storage } from "@payloadcms/storage-s3"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import path from "path"
import { buildConfig } from "payload"
import { fileURLToPath } from "url"
import sharp from "sharp"

import { Users } from "./collections/Users"
import { Media } from "./collections/Media"
import { Sponsors } from "./collections/Sponsors"
import Members from "./collections/Members"
import Domains from "./collections/Domains"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isProductionOrR2 = process.env.S3_REGION === "auto" || process.env.NODE_ENV === "production"

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Members, Domains, Sponsors],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: "media",
          generateFileURL: ({ filename, prefix }) => {
            // NOTE: Cloudflare R2
            if (isProductionOrR2) {
              return `${process.env.S3_PUBLIC_URL_BASE}/${prefix}/${filename}`
            }
            // NOTE: Local
            return `${process.env.S3_PUBLIC_URL_BASE}/${process.env.S3_BUCKET_NAME}/${prefix}/${filename}`
          },
        },
        sponsors: {
          prefix: "sponsors",
          generateFileURL: ({ filename, prefix }) => {
            if (isProductionOrR2) {
              return `${process.env.S3_PUBLIC_URL_BASE}/${prefix}/${filename}`
            }
            return `${process.env.S3_PUBLIC_URL_BASE}/${process.env.S3_BUCKET_NAME}/${prefix}/${filename}`
          },
        },
      },
      clientUploads: true,
      bucket: process.env.S3_BUCKET_NAME || "",
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
        },
        endpoint: process.env.S3_ENDPOINT || "",
        region: process.env.S3_REGION,
        forcePathStyle: !isProductionOrR2, // TRUE for local, FALSE for R2
      },
    }),
  ],
})
