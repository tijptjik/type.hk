import { contactCardData } from './lib/content/contact-card'
import { needsMoreRobotsContactCardData } from './lib/content/needs-more-robots'
import { vCardResponse } from './lib/vcard'
import { assetKey, assetResponse } from './lib/r2-assets'

export default {
  fetch(request, env) {
    const url = new URL(request.url)
    const key = assetKey(url.pathname)
    if (key) return assetResponse(request, env.MEDIA, key)

    if (url.pathname === '/ben/contact.vcf') {
      return vCardResponse(needsMoreRobotsContactCardData, 'benjamin-hall.vcf')
    }

    if (url.pathname === '/contact.vcf') {
      return vCardResponse(contactCardData, 'contact.vcf')
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
