export default {
  fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/contact.vcf') {
      return new Response(contactCard, {
        headers: {
          'cache-control': 'public, max-age=3600',
          'content-disposition': 'inline; filename="tijptjik.vcf"',
          'content-type': 'text/vcard; charset=utf-8',
        },
      })
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>

const contactCard = `BEGIN:VCARD
VERSION:4.0
FN:Mart van de Ven
N:van de Ven;Mart;;;
NICKNAME:tijptjik
TITLE:Independent Technologist & Mapper
EMAIL;TYPE=work:m@hype.hk
EMAIL;TYPE=work:m@saanseoi.hk
EMAIL;TYPE=personal:m@type.hk
URL;TYPE=homepage:https://type.hk/
URL;TYPE=company:https://hype.hk/
URL;TYPE=company:https://saanseoi.hk/
URL;TYPE=telegram:https://telegram.type.hk
URL;TYPE=whatsapp:https://whatsapp.type.hk
URL;TYPE=signal:https://signal.type.hk
URL;TYPE=github:https://github.type.hk
URL;TYPE=linkedin:https://linkedin.type.hk
URL;TYPE=instagram:https://ig.type.hk/
END:VCARD
`
