// Renders rich HTML blog content (produced by the editor) with consistent
// typography. Content is authored by admins only, so rendering it as HTML is
// acceptable here.
const BlogContent = ({ html }) => {
  return (
    <div
      className="blog-content w-full"
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
};

export default BlogContent;
