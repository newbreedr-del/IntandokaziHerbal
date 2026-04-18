"use client";



import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

export const dynamic = 'force-dynamic';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setLoading(true);



    try {

      const result = await signIn("credentials", {

        email,

        password,

        redirect: false,

      });



      if (result?.error) {

        toast.error("Invalid email or password");

        setLoading(false);

      } else {

        toast.success("Welcome back!");

        router.push("/admin/dashboard");

      }

    } catch (error) {

      toast.error("An error occurred. Please try again.");

      setLoading(false);

    }

  };



  return (

    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 flex items-center justify-center p-4">

      <motion.div

        initial={{ opacity: 0, y: 20 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: 0.5 }}

        className="w-full max-w-md"

      >

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-xl p-2"
          >
            <Image 
              src="/icon.png" 
              alt="Intandokazi Herbal" 
              width={64}
              height={64}
              className="object-contain"
            />
          </motion.div>
          <p className="text-brand-300">Admin Portal</p>
        </div>



        {/* Login Form */}

        <motion.div

          initial={{ opacity: 0, scale: 0.95 }}

          animate={{ opacity: 1, scale: 1 }}

          transition={{ delay: 0.3 }}

          className="bg-white rounded-2xl shadow-2xl p-8"

        >

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-brand-900 mb-2">Welcome Back</h2>

            <p className="text-brand-600 text-sm">Sign in to access your dashboard</p>

          </div>



          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email Field */}

            <div>

              <label className="block text-sm font-medium text-brand-900 mb-2">

                Email Address

              </label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />

                <input

                  type="email"

                  value={email}

                  onChange={(e) => setEmail(e.target.value)}

                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"

                  placeholder="admin@nthandokazi.co.za"

                  required

                />

              </div>

            </div>



            {/* Password Field */}

            <div>

              <label className="block text-sm font-medium text-brand-900 mb-2">

                Password

              </label>

              <div className="relative">

                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />

                <input

                  type={showPassword ? "text" : "password"}

                  value={password}

                  onChange={(e) => setPassword(e.target.value)}

                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"

                  placeholder="Enter your password"

                  required

                />

                <button

                  type="button"

                  onClick={() => setShowPassword(!showPassword)}

                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600 transition-colors"

                >

                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}

                </button>

              </div>

            </div>



            {/* Submit Button */}

            <Button

              type="submit"

              loading={loading}

              className="w-full py-3 text-base"

              size="lg"

            >

              Sign In

            </Button>

          </form>
        </motion.div>



        {/* Footer */}
        <p className="text-center text-brand-300 text-sm mt-6">
          © {new Date().getFullYear()} Intandokazi Herbal Products. All rights reserved.
        </p>

      </motion.div>

    </div>

  );

}

