import CardFlip from "../assets/CardFlip.png"
import React from "react"

const FlipCard = ({ title, frontImage, backImage, description }) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  
  return (
    <div 
      className="w-full md:w-64 h-64 [perspective:1000px]"
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseEnter={() => window.innerWidth >= 768 && setIsFlipped(true)}
      onMouseLeave={() => window.innerWidth >= 768 && setIsFlipped(false)}
    >
      {/* Inner rotating container */}
      <div 
        className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]"
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        
        {/* Front Side */}
        <div
          className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold  backface-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${frontImage})` }}
        >
          {title}
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 flex items-center justify-center text-center text-white px-4 text-sm  bg-cover bg-center [transform:rotateY(180deg)] backface-hidden"
          style={{ backgroundImage: `url(${backImage})` }}
        >
          <div className="">{description}</div>
        </div>
      </div>
    </div>
  );
};

const FlipCardGrid = () => {

   
  const cards = [
    {
      title: "Beginner",
      frontImage: CardFlip,
      backImage: CardFlip,
      description: "For all budding health buffs who are starting out on their fitness journey.",
    },
    {
      title: "Intermediate",
      frontImage: CardFlip,
      backImage: CardFlip,
      description: "For those who have a steady workout routine and are ready to take it up a notch.",
    },
    {
      title: "Advanced",
      frontImage: CardFlip,
      backImage: CardFlip,
      description: "For experienced lifters aiming to push limits and achieve peak performance.",
    },
  ];

  return (
    <section className="py-12  ml-4 md:ml-50 bg-white">
      <h1 className="text-3xl md:text-5xl font-semibold mb-10 md:mb-20 "><span className="text-[#ffbe00]">|</span> Shop By Level</h1>
      <div className="grid grid-cols-2 md:flex  gap-4 md:gap-20 mr-4 md:mr-0">
        {cards.map((card, index) => (
          <div key={index} className={index === 2 ? "col-span-2 max-w-full" : ""}>
            <FlipCard {...card} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default FlipCardGrid;