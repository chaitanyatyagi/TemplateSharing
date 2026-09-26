// Renders rich HTML blog content (produced by the editor) with editorial
// typography. Content is authored by admins only, so rendering as HTML is fine.
const BlogContent = ({ html, className = "" }) => {
  return (
    <div
      className={`blog-content w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
};

export default BlogContent;
