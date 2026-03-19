import React from 'react';

const OurBrandsSection = () => {
  const brands = [
    {
      id: 1,
      name: "MuscleBlaze",
      logo: "./MB-brand.png",
      bgColor: "bg-black"
    },
    {
      id: 2,
      name: "bGreen",
      logo: "./muscletech-brand.jpg",
      bgColor: "bg-black"
    },
    {
      id: 3,
      name: "Fit Foods",
      logo: "./wellversed-brand.jpeg",
      bgColor: "bg-[#2eb4ac]"
    },
    {
      id: 4,
      name: "Verse",
      logo: "./on-brand.jpg",
      bgColor: "bg-black"
    }
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto my-12 sm:my-16 md:my-20 px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 flex items-center gap-3">
          <span className="w-1.5 h-8 sm:h-10 md:h-12 bg-[#ffbe00] inline-block flex-shrink-0"></span>
          Our Brands
        </h2>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className={`${brand.bgColor} overflow-hidden cursor-pointer 
              transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group
              h-28 xs:h-36 sm:h-48 md:h-56 lg:h-64`}
          >
            <div className="w-full h-full flex items-center justify-center p-3 sm:p-4 md:p-6">
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurBrandsSection;