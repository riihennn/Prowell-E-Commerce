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
    <div className="w-full max-w-[1200px] mx-auto my-20 px-4 sm:px-6 md:px-0">
      <div className="max-w-7xl mx-auto">
        {/* Header with Yellow Bar */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-5xl font-semibold text-gray-900 flex items-center gap-3">
            <span className="w-1.5 h-12 bg-[#ffbe00]"></span>
            Our Brands
          </h2>
        </div>

        {/* Brand Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className={`${brand.bgColor} overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group h-32 sm:h-48 md:h-64`}
            >
              <div className="w-full h-full flex items-center justify-center">
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
    </div>
  );
};

export default OurBrandsSection;