import { CollectionSlug, getPayload, RequiredDataFromCollectionSlug } from "payload"
import config from "@payload-config"
import { faker } from "@faker-js/faker"
import { Member } from "@/payload-types"

const collections: CollectionSlug[] = ["users", "members", "domains", "media"]

const domains = [
  // TECH
  { label: "Web Development", slug: "web", weight: 1 },
  { label: "App Development", slug: "app", weight: 2 },
  { label: "AI / Machine Learning", slug: "aiml", weight: 3 },
  { label: "Cloud", slug: "cloud", weight: 4 },
  { label: "Cybersecurity", slug: "cyber", weight: 5 },
  { label: "XR & Game Development", slug: "xr", weight: 6 },
  { label: "UI/UX", slug: "uiux", weight: 7 },
  // NON-TECH
  { label: "Broadcasting", slug: "broadcasting", weight: 20 },
  { label: "Content", slug: "content", weight: 21 },
  { label: "Corporate Relations", slug: "cr", weight: 22 },
  { label: "Creative", slug: "creative", weight: 23 },
  { label: "Graphic Design", slug: "gd", weight: 24 },
  { label: "Public Relations", slug: "pr", weight: 25 },
] as const

const REGULAR_MEMBERS = 15

const LOCAL_ADMIN = {
  email: "test@test.com",
  password: "test123",
}

async function main() {
  const payload = await getPayload({
    config: config,
  })

  payload.logger.info("Clearing collections...")

  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, where: {} })),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection].config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, where: {} })),
  )

  payload.logger.info("Seeding demo admin user...")
  await payload.delete({
    collection: "users",
    where: {
      email: {
        equals: "test@test.com",
      },
    },
  })

  await payload.create({
    collection: "users",
    data: LOCAL_ADMIN,
  })

  payload.logger.info("Seeding domains...")
  const seededDomains = await Promise.all(
    domains.map((domain) =>
      payload.create({
        collection: "domains",
        data: {
          name: domain.label,
          slug: domain.slug,
          weight: domain.weight,
        },
      }),
    ),
  )

  payload.logger.info("Seeding members...")
  const membersToCreate: Array<Partial<Member>> = []

  membersToCreate.push(createMember({ role: "lead" }))
  membersToCreate.push(createMember({ role: "vice-lead" }))
  membersToCreate.push(createMember({ role: "executive" }))
  membersToCreate.push(createMember({ role: "tech-lead" }))

  const domainsToGetLeads = seededDomains.slice(0, Math.min(3, seededDomains.length))
  for (const domainDoc of domainsToGetLeads) {
    membersToCreate.push(
      createMember({
        role: "domain-lead",
        domainLed: domainDoc.id,
        domains: [domainDoc.id],
      }),
    )
  }

  const webDomain = seededDomains.find((d) => d.slug === "web")
  if (webDomain) {
    const multipleRoles = createMember({
      role: "tech-lead",
      domainLed: webDomain.id,
      domains: [webDomain.id],
    })
    multipleRoles.email = faker.internet.email()
    membersToCreate.push(multipleRoles)
  }

  for (let i = 0; i < REGULAR_MEMBERS; i++) {
    const randomDomains: number[] = []
    const count = faker.number.int({ min: 1, max: Math.min(3, seededDomains.length) })
    const shuffledDomains = faker.helpers.shuffle(seededDomains)
    for (let j = 0; j < count; j++) {
      randomDomains.push(shuffledDomains[j].id)
    }
    membersToCreate.push(
      createMember({
        role: "member",
        domains: randomDomains.length > 0 ? randomDomains : undefined,
      }),
    )
  }

  await Promise.all(
    membersToCreate.map((member) =>
      payload.create({
        collection: "members",
        data: member as RequiredDataFromCollectionSlug<"members">,
      }),
    ),
  )

  payload.logger.info("Database seeded successfully")
  payload.logger.info("Admin Dashboard Account Details:")
  payload.logger.info(`Email: ${LOCAL_ADMIN.email}`)
  payload.logger.info(`Password: ${LOCAL_ADMIN.password}`)
}

const createMember = ({
  role,
  domainLed,
  domains,
}: {
  role: Member["role"]
  domainLed?: number
  domains?: number[]
}): RequiredDataFromCollectionSlug<"members"> => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  return {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    rollNumber: faker.number.int().toString(),
    phoneNumbers: [{ number: faker.phone.number() }],
    linkedin: `https://linkedin.com/in/${faker.internet.username({ firstName, lastName })}`,
    github: `https://github.com/${faker.internet.username({ firstName, lastName })}`,
    instagram: `https://instagram.com/${faker.internet.username({ firstName, lastName })}`,
    role: role,
    domainLed: domainLed,
    domain: domains,
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
