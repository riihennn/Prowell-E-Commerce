import { useState } from "react";
import Login from "./Login";
import Signup from "./Singup";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {isLogin ? (
          <Login onSwitch={toggleForm} />
        ) : (
          <Signup onSwitch={toggleForm} />
        )}
      </div>
    </div>
  );
}
