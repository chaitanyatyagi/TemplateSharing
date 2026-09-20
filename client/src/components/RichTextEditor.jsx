import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// Toolbar: headings/subheadings, basic formatting, lists, quote/code, links, images.
// Inserted images are embedded into the HTML content (data URLs), so no extra
// upload endpoint is needed.
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link", "image"],
    ["clean"],
  ],
};

const RichTextEditor = ({ value, onChange, placeholder }) => {
  return (
    <div className="rich-editor bg-white rounded-md">
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || "Write your blog content…"}
      />
    </div>
  );
};

export default RichTextEditor;
