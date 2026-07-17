import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "content");
const headerHtml = fs.readFileSync(path.join(dir, "header.html"), "utf8");
const footerHtml = fs.readFileSync(path.join(dir, "footer.html"), "utf8");

// Assemble header + page content + footer as ONE combined string for a SINGLE
// dangerouslySetInnerHTML. This must stay one string, not multiple sibling
// dangerouslySetInnerHTML divs — each one is parsed as its own standalone HTML
// fragment, so a segment that deliberately ends mid-tag (e.g. splicing generated
// content into a still-open .framer-m8tdel grid container) gets auto-closed by
// the browser's parser at that div's boundary, and the next segment's leading
// closing tags become orphaned, corrupting the layout. Concatenating into one
// string preserves Framer's original DOM instead.
//
// Pass `name` for scraped pages (reads content/pages/{name}.html), `html` for
// generated content (e.g. mock product detail pages with no scraped source), or
// `segments` — an array of HTML strings — to interleave raw scraped HTML with
// generated content (e.g. a data-driven product grid) at multiple points.
//
// `children` renders real React between the content and the footer, for pages
// whose body is JSX rather than scraped markup (Track). That splits the output
// into three sibling dangerouslySetInnerHTML blocks, which is only safe because
// header/content/footer are each independently balanced there — do NOT combine
// `children` with a `segments` array that deliberately ends mid-tag.
export default function PageShell({
  name,
  html,
  segments,
  children,
}: {
  name?: string;
  html?: string;
  segments?: string[];
  children?: React.ReactNode;
}) {
  const shellProps = {
    className: "framer-AvLPC framer-1bk0vel",
    "data-layout-template": "true",
    style: { minHeight: "100vh", width: "auto" },
  } as const;

  // With `children` and no markup source, the body is pure JSX and there is
  // nothing to read — without the `name` check that lands on
  // content/pages/undefined.html and dies with an unrelated ENOENT.
  const content = segments
    ? segments.join("")
    : html ?? (name ? fs.readFileSync(path.join(dir, "pages", `${name}.html`), "utf8") : "");

  if (children) {
    // The shell is `display:flex; flex-direction:column` with align-items:stretch,
    // so on a normal page the header, page-root and footer are DIRECT flex items
    // and stretch to full width. React can't put dangerouslySetInnerHTML beside
    // {children} in one element, so these have to be wrapped — but a plain wrapper
    // adds a block layer that stops the banner/footer stretching (they collapse to
    // content width). `display:contents` removes the wrapper from the box tree, so
    // its children become direct flex items again. This is the same trick Framer's
    // own page-root uses (`data-framer-root` is display:contents).
    const passthrough = { display: "contents" } as const;
    return (
      <div id="main">
        <div {...shellProps}>
          <div style={passthrough} dangerouslySetInnerHTML={{ __html: headerHtml + content }} />
          {children}
          <div style={passthrough} dangerouslySetInnerHTML={{ __html: footerHtml }} />
        </div>
      </div>
    );
  }

  return (
    <div id="main">
      <div {...shellProps} dangerouslySetInnerHTML={{ __html: headerHtml + content + footerHtml }} />
    </div>
  );
}
