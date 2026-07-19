const HomeFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-bluePrimary flex flex-col justify-center items-center py-2 px-4 sm:px-6 md:px-12">
      {/* Heading */}
      <p className="font-inter text-sm text-white font-semibold text-center">
        {year} SmartTemp © All Rights Reserved
      </p>
    </footer>
  );
};

export default HomeFooter;