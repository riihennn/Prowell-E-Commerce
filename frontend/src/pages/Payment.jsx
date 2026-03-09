import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  MapPin,
  User,
  Phone,
  Home,
  Package
} from "lucide-react";
import { UserContext } from "../Context/UserContext";
import { placeOrder } from "../services/orderService";

const Payment = () => {
  const { user, cart, setCart, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);

  // Address form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");

  React.useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  // Determine payment items
  const paymentItems = location.state?.product
    ? [{ ...location.state.product, quantity: 1 }]
    : cart;

  // Calculate totals
  const subtotal = paymentItems.reduce(
    (acc, item) => acc + (item.currentPrice || item.price || 0) * item.quantity,
    0
  );
  const shipping = subtotal > 500 ? 0 : 40;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const orderData = {
      orderItems: paymentItems,
      shippingAddress: {
        fullName,
        phone,
        addressLine1,
        addressLine2,
        landmark,
        city,
        state,
        pincode
      },
      paymentMethod: "Cash on Delivery",
      subtotal,
      shippingPrice: shipping,
      taxPrice: tax,
      totalPrice: total
    };

    try {
      const newOrder = await placeOrder(orderData);
      
      setIsProcessing(false);
      setOrderId(newOrder._id);
      setOrderTotal(total);

      // Clear cart locally if it's a cart purchase
      if (!location.state?.product) {
        setCart([]);
      }

      setPaymentSuccess(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setIsProcessing(false);
      console.error("Failed to save order:", err);
      alert(err.response?.data?.message || "Failed to place order. Please try again.");
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-amber-50">
        <div className="text-center p-10 bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-2">Your order will be delivered soon.</p>
          <p className="text-sm text-gray-500 mb-4">Order ID: #{orderId}</p>
          <div className="bg-amber-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-amber-700 font-semibold mb-1">Cash on Delivery</p>
            <p className="text-2xl font-bold text-[#ffbe00]">
              ₹{orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <p className="text-sm text-gray-600">Please keep the exact amount ready for delivery.</p>
        </div>
      </div>
    );
  }

  if (paymentItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-amber-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Items to Purchase</h2>
          <p className="text-gray-600 mb-6">Add items to cart before placing an order.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(location.state?.product ? -1 : "/cart")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          {location.state?.product ? "Back to Product" : "Back to Cart"}
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#ffbe00] rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
                  <p className="text-sm text-gray-600">Enter your delivery details</p>
                </div>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {[
                  { label: "Full Name", value: fullName, setValue: setFullName, Icon: User },
                  { label: "Phone Number", value: phone, setValue: setPhone, Icon: Phone, type: "text", max: 10 },
                  { label: "Address Line 1", value: addressLine1, setValue: setAddressLine1, Icon: Home },
                  { label: "Address Line 2", value: addressLine2, setValue: setAddressLine2 },
                  { label: "Landmark (Optional)", value: landmark, setValue: setLandmark }
                ].map(({ label, value, setValue, Icon, type, max }, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {Icon && <Icon className="inline w-4 h-4 mr-1" />}
                      {label}
                    </label>
                    <input
                      type={type || "text"}
                      value={value || ""}
                      onChange={(e) =>
                        setValue(
                          type === "text" && max
                            ? e.target.value.replace(/\D/g, "").substring(0, max)
                            : e.target.value
                        )
                      }
                      placeholder={label}
                      maxLength={max || undefined}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe00] focus:border-transparent"
                      required={label !== "Landmark (Optional)"}
                    />
                  </div>
                ))}

                {/* City, State, Pincode */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: "City", value: city, setValue: setCity },
                    { label: "State", value: state, setValue: setState },
                    { label: "Pincode", value: pincode, setValue: setPincode, max: 6 }
                  ].map(({ label, value, setValue, max }, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                      <input
                        type="text"
                        value={value || ""}
                        onChange={(e) =>
                          setValue(max ? e.target.value.replace(/\D/g, "").substring(0, max) : e.target.value)
                        }
                        placeholder={label}
                        maxLength={max || undefined}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe00] focus:border-transparent"
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#ffbe00] rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Cash on Delivery</h3>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 mt-4 flex justify-between">
                    <span className="text-sm text-gray-600">Amount to be paid:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                      ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                  <p className="text-sm text-yellow-700 font-medium">
                    ⚠️ Online payment is not available now. Only Cash on Delivery is supported.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full mt-6 flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all shadow-lg ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 transform hover:scale-105"
                  } text-white text-lg shadow-lg font-bold`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Package size={20} />
                      Place Order - ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              paymentItems={paymentItems}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderSummary = ({ paymentItems, subtotal, shipping, tax, total }) => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
    <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
      {paymentItems.map((item, idx) => (
        <div key={item.id || idx} className="flex gap-3">
          <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title || item.name}</p>
            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
            <p className="text-sm font-semibold text-gray-900">
              ₹{((item.currentPrice || item.price || 0) * item.quantity).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      ))}
    </div>

    <div className="border-t border-gray-200 pt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-900">₹{subtotal.toLocaleString("en-IN")}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Shipping</span>
        <span className="font-medium text-gray-900">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Tax (18% GST)</span>
        <span className="font-medium text-gray-900">
          ₹{tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
        <span className="text-base font-semibold text-gray-900">Total (COD)</span>
        <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
          ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>

    {shipping === 0 && (
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <p className="text-xs text-green-700 font-medium">🎉 You're eligible for FREE shipping!</p>
      </div>
    )}
  </div>
);

export default Payment;
