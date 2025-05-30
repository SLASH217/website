import { CollectionConfig, Option } from "payload"

const memberRoles: Option[] = [
  {
    label: "Lead",
    value: "lead",
  },
  {
    label: "Vice Lead",
    value: "vice-lead",
  },
  {
    label: "Executive",
    value: "executive",
  },
  {
    label: "Tech Lead",
    value: "tech-lead",
  },
  {
    label: "Domain Lead",
    value: "domain-lead",
  },
  {
    label: "Member",
    value: "member",
  },
]

const Members: CollectionConfig = {
  slug: "members",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role", "domain"],
    description: "Manage all MLSA club members and their roles",
  },
  access: {
    read: () => true,
    // TODO: change to admin access
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "Full name of the member",
      },
    },
    {
      name: "email",
      type: "email",
      required: true,
    },
    {
      name: "rollNumber",
      type: "text",
      required: true,
      admin: {
        description: "University roll number of the member",
      },
    },
    {
      name: "phoneNumbers",
      type: "array",
      admin: {
        description: "Contact phone numbers of the member",
      },
      fields: [
        {
          name: "number",
          type: "text",
          admin: {
            description: "Include country code if necessary",
          },
        },
      ],
    },
    {
      name: "linkedin",
      type: "text",
    },
    {
      name: "github",
      type: "text",
    },
    {
      name: "instagram",
      type: "text",
    },
    {
      name: "profilePic",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Profile picture of the member",
        position: "sidebar",
      },
    },
    {
      name: "role",
      type: "select",
      options: memberRoles,
      required: true,
      defaultValue: "member",
      admin: {
        description: "Member's role in the MLSA organization",
      },
    },
    {
      name: "domainLed",
      label: "Leads Domain",
      type: "relationship",
      relationTo: "domains",
      hasMany: false,
      admin: {
        description: "If this person is a designated lead of a specific domain, select it here.",
        condition: (_, siblingData) => siblingData?.role !== "member",
      },
      validate: (value, { data }) => {
        // @ts-expect-error
        if (data?.role === "domain-lead" && !value) {
          return "If Role is `Domain Lead`, a specific domain must be selected."
        }
        return true
      },
    },
    {
      name: "domain",
      label: "Member of Domains",
      type: "relationship",
      relationTo: "domains",
      hasMany: true,
      admin: {
        description: "Domains this member is part of.",
      },
    },
  ],
}

export default Members
