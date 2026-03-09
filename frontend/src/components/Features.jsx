import { 
  ShieldCheck, 
  Truck, 
  Gift, 
  BadgeCheck 
} from 'lucide-react';

function Features () {
  const features = [
    {
      title: "100% Safe & Secure Payments",
      icon: <ShieldCheck className="w-10 h-10" />,
      color: "text-black",
    },
    {
      title: "Free Shipping",
      icon: <Truck className="w-10 h-10" />,
      color: "text-black",
    },
    {
      title: "Shop with us & earn MB Cash",
      icon: <Gift className="w-10 h-10" />,
      color: "text-black",
    },
    {
      title: "Authenticity Guaranteed",
      icon: <BadgeCheck className="w-10 h-10" />,
      color: "text-black",
    },
  ];

  return (
    <section className="bg-[#f8f8f8] py-8 px-4 border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-0 divide-x-0 lg:divide-x divide-gray-300">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col items-center text-center p-4 ${index % 2 === 0 ? 'border-r lg:border-r-0' : ''} ${index < 2 ? 'border-b lg:border-b-0' : ''} border-gray-300`}
            >
              <div className={`mb-3 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-sm font-medium text-gray-900">
                {feature.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;