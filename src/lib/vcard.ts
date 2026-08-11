const vCardHeaders = (filename: string) => ({
  'cache-control': 'public, max-age=3600',
  'content-disposition': `attachment; filename="${filename}"`,
  // Android Contacts commonly registers this legacy, but widely used,
  // vCard MIME type rather than the newer `text/vcard` type.
  'content-type': 'text/x-vcard; charset=utf-8',
})

export const vCardResponse = (data: string, filename: string) =>
  new Response(data, {
    headers: vCardHeaders(filename),
  })
