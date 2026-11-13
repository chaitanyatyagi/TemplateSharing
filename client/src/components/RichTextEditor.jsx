import { useRef, useMemo, useCallback, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import BlogService from "../api/blog";
import { getServerAssetUrl } from "../utils/assetUrl";

// Toolbar: headings/subheadings, basic formatting, lists, quote/code, links, images.
// Images are uploaded to the server and embedded as a served URL (never a bulky
// base64 data-URL), so the saved document stays small and images persist reliably.
const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  ["link", "image"],
  ["clean"],
];

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const quillRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const editor = quillRef.current?.getEditor();
      if (!editor) return;
      const range = editor.getSelection(true);
      try {
        setUploading(true);
        const res = await BlogService.uploadContentImage(file);
        if (res?.status === "Success" && res.url) {
          editor.insertEmbed(range.index, "image", getServerAssetUrl(res.url), "user");
          editor.setSelection(range.index + 1, 0, "user");
        } else {
          throw new Error(res?.message || "Upload failed");
        }
      } catch (err) {
        console.error("Inline image upload failed:", err);
        editor.insertText(range.index, "", "user"); // no-op keeps selection valid
        window.alert("Image upload failed — please try again with a smaller image.");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }, []);

  const modules = useMemo(
    () => ({ toolbar: { container: TOOLBAR, handlers: { image: imageHandler } } }),
    [imageHandler]
  );

  return (
    <div className="rich-editor bg-white rounded-md relative">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || "Write your blog content…"}
      />
      {uploading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-sm font-medium text-ink rounded-md">
          Uploading image…
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
