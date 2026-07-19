const Footer = () => {
  return (
    <footer className="w-full bg-bluePrimary flex flex-col justify-center items-center gap-4 py-8 px-4 sm:px-6 md:px-12">
      {/* Heading */}
      <p className="font-inter text-lg sm:text-xl md:text-2xl text-white font-semibold text-center">
        Get productivity tips in your inbox
      </p>

      {/* Email input + Button */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full max-w-md">
        <input
          type="email"
          placeholder="Enter your email"
          className="text-grayDark text-sm sm:text-base w-full sm:min-w-[250px] md:min-w-[300px] h-[40px] px-4 rounded-md outline-none focus:ring-2 focus:ring-white"
        />
        <button className="w-full sm:w-[120px] h-[40px] bg-white text-bluePrimary font-semibold rounded-md hover:bg-gray-100 transition-all">
          Subscribe
        </button>
      </div>

      {/* Subtext */}
      <p className="font-inter text-xs sm:text-sm text-white text-center max-w-md">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </footer>
  );
};

export default Footer;
