export function createCVAddedTemplate(
  cvId: string,
  userId: string,
  eventType: string,
  metadata: any
) {
  return `
    <html>
      <head>
        <title>CV Added</title>
      </head>
      <body>
        <h1>CV Added</h1>
        <p>CV ID: ${cvId}</p>
        <p>User ID: ${userId}</p>
        <p>Event Type: ${eventType}</p>
        <p>Metadata: ${JSON.stringify(metadata)}</p>
      </body>
    </html>
  `;
}