import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BlogCarousel = () => {
  // Sample blog data — replace with your actual data or backend response
  const blogs = [
    {
      image:
        "https://images.unsplash.com/photo-1584697964403-275f6600c27c?auto=format&fit=crop&w=1200&q=80",
      title: "How to Build a Second Brain with Notion",
      description:
        "Learn how to organize your ideas and boost productivity using AI-powered Notion templates.",
      category: "Business",
      likes: 23,
      views: "1.3k",
    },
    {
      image:
        "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1200&q=80",
      title: "Design Thinking in Everyday Life",
      description:
        "Explore how design thinking can help you solve problems creatively in both personal and professional settings.",
      category: "Creativity",
      likes: 18,
      views: "1.1k",
    },
    {
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      title: "AI Tools You Should Be Using in 2025",
      description:
        "Discover the top AI tools that can transform how you work, learn, and create in 2025.",
      category: "Technology",
      likes: 42,
      views: "2.4k",
    },
  ];

  const [index, setIndex] = useState(0);

  const nextSlide = () => setIndex((prev) => (prev + 1) % blogs.length);
  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + blogs.length) % blogs.length);

  // Optional auto-slide (every 5 seconds)
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[50vh] bg-white flex items-center justify-center overflow-hidden rounded-2xl mt-4">
      {/* Main Blog */}
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: -100 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute w-[90%] sm:w-[80%] h-full rounded-2xl overflow-hidden shadow-lg"
        >
          <img
            src={blogs[index].image}
            alt={blogs[index].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-6 flex flex-col justify-end">
            <h2 className="text-2xl font-bold text-white">
              {blogs[index].title}
            </h2>
            <p className="text-sm text-gray-200 mt-2 line-clamp-2">
              {blogs[index].description}
            </p>
            <div className="flex items-center gap-4 mt-3 text-white/80 text-sm">
              <span className="bg-bluePrimary text-white px-3 py-1 rounded-md text-xs">
                {blogs[index].category}
              </span>
              <span>❤️ {blogs[index].likes}</span>
              <span>👁️ {blogs[index].views}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Next Preview (small blog on right side) */}
      <motion.div
        key={index + "_preview"}
        initial={{ opacity: 0, scale: 0.8, x: 200 }}
        animate={{ opacity: 1, scale: 0.8, x: 220 }}
        exit={{ opacity: 0, x: 200 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute hidden sm:block w-[25%] h-[60%] right-6 rounded-xl overflow-hidden shadow-lg cursor-pointer"
        onClick={nextSlide}
      >
        <img
          src={blogs[(index + 1) % blogs.length].image}
          alt="next"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold">
          Next
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-6 text-white bg-black/40 hover:bg-black/60 rounded-full p-2"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-6 text-white bg-black/40 hover:bg-black/60 rounded-full p-2"
      >
        ❯
      </button>
    </div>
  );
};

export default BlogCarousel;
