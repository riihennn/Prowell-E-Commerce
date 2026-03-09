import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import banner1 from '../assets/banner1.jpg';
import banner2 from '../assets/banner2.jpg';
import banner3 from '../assets/banner3.jpg';
import banner4 from '../assets/banner4.jpg';

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  let Navigate = useNavigate()

  const slides = [
    {
      id: 1,
      title: "Premium Whey Protein",
      image: banner1
    },
    {
      id: 2,
      title: "Plant-Based Power",
      image: banner2
    },
    {
      id: 3,
      title: "Flash Sale",
      image: banner3
    },
    {
      id: 4,
      title: "Fuel Your Fitness",
      image: banner4
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000); 

    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <div className="relative w-full  mx-auto overflow-hidden  shadow-2xl">
      {/* Slides Container */}
      <div className="relative h-48 xs:h-56 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] 2xl:h-[600px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image */}
            <img 
              src={slide.image} 
              alt={slide.title}
              className="w-full h-full object-cover object-center"
            />

            {/* Content */}
            <div className="absolute inset-0 h-full flex items-end md:items-center justify-center text-center px-4 sm:px-6 z-10 pb-10 sm:pb-24 md:pb-0">
              <div className="max-w-3xl w-full mt-90">
                <button 
                  onClick={()=>Navigate("/products")}
                  className="px-6 sm:px-8 md: md:px-10 py-1 sm:py-3 md:py-3 text-sm sm:text-base md:text-lg font-semibold text-white rounded-3xl hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
                  style={{backgroundColor: '#ffbe00'}}
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Previous Button */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-50 hover:bg-opacity-75 p-1.5 sm:p-2 md:p-3 rounded-full transition-all"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-gray-800" />
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-50 hover:bg-opacity-75 p-1.5 sm:p-2 md:p-3 rounded-full transition-all"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-gray-800" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2 md:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 sm:h-2 md:h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'w-6 sm:w-8 md:w-10' 
                : 'w-1.5 sm:w-2 md:w-3 bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            style={index === currentSlide ? {backgroundColor: '#ffbe00'} : {}}
          />
        ))}
      </div>
    </div>
  );
}