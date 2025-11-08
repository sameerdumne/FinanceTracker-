export default function Head() {
  return (
    <>
      {/* Explicit favicon link to ensure browsers load it */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />
      {/* Optional Apple touch icon if you add one to /public */}
      <link rel="apple-touch-icon" href="/apple-icon.png" />
    </>
  )
}
