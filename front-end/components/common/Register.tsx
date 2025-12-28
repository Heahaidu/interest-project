"use client";

import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { emailRegex, UserRegisterFormData } from "@/lib/types";
import { authApi } from "@/lib/api/auth";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/navigation";

type RegisterProps = {
  onSuccess?: () => void;
  openLogin: () => void;
};

interface FormErrors {
  [key: string]: string;
}

export default function Register({ onSuccess, openLogin }: RegisterProps) {
  const [userForm, setUserForm] = useState<UserRegisterFormData>({
    email: "",
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    passwordConfirm: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [shakingField, setShakingField] = useState<boolean>(false);
  const router = useRouter();

  const otpContentRef = useRef<HTMLDivElement>(null);
  const [otpHeight, setOtpHeight] = useState(0);

  useEffect(() => {
    if (showOtpModal && otpContentRef.current) {
      setTimeout(() => {
        if (otpContentRef.current) {
          setOtpHeight(otpContentRef.current.offsetHeight);
        }
      }, 50);
    }
  }, [showOtpModal]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!userForm.email) newErrors.email = "Email not valid";
    else if (!emailRegex.test(userForm.email))
      newErrors.email = "Email not valid";

    if (!userForm.username) newErrors.username = "Username not valid";
    if (!userForm.firstName) newErrors.firstName = "First name not valid";
    if (!userForm.lastName) newErrors.lastName = "Last name not valid";

    if (!userForm.password) newErrors.password = "Password not valid";
    else if (userForm.password.length < 6)
      newErrors.password = "Password too short";

    if (userForm.password !== userForm.passwordConfirm) {
      newErrors.passwordConfirm = "Passwords not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      setShakingField(true);
      setTimeout(() => setShakingField(false), 500);
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.register(userForm);

      toast.success("The OTP has been sent to your email.");
      setShowOtpModal(true);
    } catch (err: any) {
      console.error("register error", err);
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error("Vui lòng nhập mã OTP");
    try {
      setLoading(true);
      // call backend verifyEmail endpoint which expects email and otp as request params
      const res = await authApi.verify(userForm.email, otp);

      toast.success("Verification successful");
      setShowOtpModal(false);
      // notify parent (if Register is rendered inside a modal) to close it
      onSuccess?.();
      // then redirect to landing/login page
      router.replace("/app/discover");
    } catch (err: any) {
      console.error("otp verify error", err);
      toast.error("Verification successful");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    name: keyof UserRegisterFormData,
    label: string,
    type: string = "text"
  ) => {
    const hasError = !!errors[name];
    const isShake = hasError && shakingField;
    return (
      <div>
        <div className="flex gap-3">
          <label className="block text-sm font-medium mb-1">{label}</label>
          {hasError && (
            <label className="text-xs mb-1 flex items-center text-red-500 italic font-medium">
              {`${label} not valid`}
            </label>
          )}
        </div>
        <input
          name={name}
          value={userForm[name]}
          onChange={handleInputChange}
          placeholder={`Enter your ${label.toLowerCase()}`}
          type={type}
          className={`${
            isShake ? "animate-shake" : ""
          } w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
        />
      </div>
    );
  };

  return (
    <div
      className="relative p-8 text-zinc-900 dark:text-white overflow-hidden"
      style={{
        height: showOtpModal && otpHeight ? `${otpHeight + 60}px` : "auto",
        transition: "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Signup form */}
      <div
        className="transition-all duration-600 ease-out"
        style={{
          opacity: showOtpModal ? 0 : 1,
          transform: showOtpModal
            ? "translateX(-50px) scale(0.95)"
            : "translateX(0) scale(1)",
          filter: showOtpModal ? "blur(10px)" : "blur(0px)",
          pointerEvents: showOtpModal ? "none" : "auto",
          position: showOtpModal ? "absolute" : "relative",
          width: "100%",
        }}
      >
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">interest.</h2>
          <h3 className="text-2xl font-bold">Sign up your account.</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {renderInput("email", "Email", "text")}
          {renderInput("username", "Username", "text")}
          {renderInput("firstName", "First name", "text")}
          {renderInput("lastName", "Last Name", "text")}
          {renderInput("password", "Password", "password")}
          {renderInput("passwordConfirm", "Confirm password", "password")}

          <Button
            disabled={loading}
            type="submit"
            className="text-md rounded-lg w-full py-[22px] mt-4 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-transparent transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-1">
                <Spinner />
                Pending
              </div>
            ) : (
              "Sign up"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <span
            className="text-indigo-500 cursor-pointer font-medium hover:text-indigo-600 transition-colors"
            onClick={openLogin}
          >
            Sign in
          </span>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div
          ref={otpContentRef}
          className="transition-all duration-600 ease-out"
          style={{
            opacity: showOtpModal ? 1 : 0,
            transform: showOtpModal
              ? "translateX(0) scale(1)"
              : "translateX(50px) scale(0.95)",
            filter: showOtpModal ? "blur(0px)" : "blur(10px)",
          }}
        >
          <div className="max-w-md mx-auto">
            {/* Back button với animation */}
            <button
              onClick={() => setShowOtpModal(false)}
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-3 transition-all hover:gap-3 group"
              style={{
                animation: "slideDown 0.3s ease-out 0.1s both",
              }}
            >
              <svg
                className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to sign up
            </button>

            {/* Title với stagger animation */}
            <h3
              className="text-2xl font-bold mb-2"
              style={{
                animation: "slideDown 0.3s ease-out 0.1s both",
              }}
            >
              Enter OTP code
            </h3>

            <p
              className="text-sm text-zinc-500 mb-6"
              style={{
                animation: "slideDown 0.3s ease-out 0.2s both",
              }}
            >
              We have sent the OTP code to{" "}
              <strong className="text-zinc-900 dark:text-white">
                {userForm.email}
              </strong>
              . Please check your email and enter the code.
            </p>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div
                style={{
                  animation: "slideDown 0.3s ease-out 0.3s both",
                }}
              >
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  autoFocus
                  maxLength={6}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black outline-none"
                />
              </div>

              <div
                className="flex gap-3"
                style={{
                  animation: "slideDown 0.3s ease-out 0.4s both",
                }}
              >
                <Button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 dark:bg-black dark:text-white bg-white text-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Spinner />
                      Verifying...
                    </div>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>

              {/* Resend link */}
              <div
                className="text-center text-sm text-zinc-500 pt-2"
                style={{
                  animation: "slideDown 0.3s ease-out 0.5s both",
                }}
              >
                Didn't receive code?{" "}
                <button
                  type="button"
                  className="cursor-pointer text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
                >
                  Resend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// "use client";

// import { Button } from "../ui/button";
// import { useEffect, useRef, useState } from "react";
// import { toast } from "sonner";
// import { emailRegex, UserRegisterFormData } from "@/lib/types";
// import { authApi } from "@/lib/api/auth";
// import { Spinner } from "../ui/spinner";

// type RegisterProps = {
//   onSuccess?: () => void;
//   openLogin: () => void;
// };

// interface FormErrors {
//   [key: string]: string;
// }

// export default function Register({ onSuccess, openLogin }: RegisterProps) {
//   const [userForm, setUserForm] = useState<UserRegisterFormData>({
//     email: "",
//     firstName: "",
//     lastName: "",
//     username: "",
//     password: "",
//     passwordConfirm: "",
//   });

//   const [errors, setErrors] = useState<FormErrors>({});
//   const [loading, setLoading] = useState(false);
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [shakingField, setShakingField] = useState<boolean>(false);

//   const divOTP = useRef<HTMLDivElement>(null);
//   const [height, setHeight] = useState(0);

//   useEffect(() => {
//     const updateHeight = () => {
//       if (divOTP.current) {
//         setHeight(divOTP.current.clientHeight);
//       }
//     };

//     updateHeight();
//     window.addEventListener("resize", updateHeight);
//     return () => window.removeEventListener("resize", updateHeight);
//   }, []);

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setUserForm((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     setShowOtpModal(true);

//     // const newErrors: FormErrors = {};

//     // if (!userForm.email) newErrors.email = "Email not valid";
//     // else if (!emailRegex.test(userForm.email))
//     //   newErrors.email = "Email not valid";

//     // if (!userForm.username) newErrors.username = "Username not valid";
//     // if (!userForm.firstName) newErrors.firstName = "First name not valid";
//     // if (!userForm.lastName) newErrors.lastName = "Last name not valid";

//     // if (!userForm.password) newErrors.password = "Password not valid";
//     // else if (userForm.password.length < 6)
//     //   newErrors.password = "Password too short";

//     // if (userForm.password !== userForm.passwordConfirm) {
//     //   newErrors.passwordConfirm = "Passwords not match";
//     // }

//     // setErrors(newErrors);
//     // if (Object.keys(newErrors).length) {
//     //   setShakingField(true);
//     //   setTimeout(() => setShakingField(false), 500);
//     //   return;
//     // }

//     // try {
//     //   setLoading(true);

//     //   const res = await authApi.register(userForm);

//     //   toast.success("The OTP has been sent to your email.");
//     //   setShowOtpModal(true);
//     // } catch (err: any) {
//     //   console.error("register error", err);
//     //   toast.error(
//     //     err.response?.data?.message || err.message || "Đăng ký thất bại"
//     //   );
//     // } finally {
//     //   setLoading(false);
//     // }
//   };

//   const handleOtpSubmit = async (e: React.FormEvent) => {
//     // e.preventDefault();
//     // if (!otp) return toast.error("Vui lòng nhập mã OTP");
//     // try {
//     //   setLoading(true);
//     //   // call backend verifyEmail endpoint which expects email and otp as request params
//     //   const res = await api.post("/user/verify-email", null, {
//     //     params: { email, otp },
//     //   });
//     //   toast.success(res.data?.message || "Xác thực thành công");
//     //   setShowOtpModal(false);
//     //   // notify parent (if Register is rendered inside a modal) to close it
//     //   onSuccess?.();
//     //   // then redirect to landing/login page
//     //   router.push("/");
//     // } catch (err: any) {
//     //   console.error("otp verify error", err);
//     //   toast.error(
//     //     err.response?.data?.message ||
//     //       err.message ||
//     //       "Xác thực không thành công"
//     //   );
//     // } finally {
//     //   setLoading(false);
//     // }
//   };

//   const renderInput = (
//     name: keyof UserRegisterFormData,
//     label: string,
//     type: string = "text"
//   ) => {
//     const hasError = !!errors[name];
//     const isShake = hasError && shakingField;
//     return (
//       <div>
//         <div className="flex gap-3">
//           <label className="block text-sm font-medium mb-1">{label}</label>
//           {hasError && (
//             <label className="text-xs mb-1 flex items-center text-red-500 italic font-medium">
//               {`${label} not valid`}
//             </label>
//           )}
//         </div>
//         <input
//           name={name}
//           value={userForm[name]}
//           onChange={handleInputChange}
//           placeholder={`Enter your ${label.toLowerCase()}`}
//           type={type}
//           className={`${
//             isShake ? "animate-shake" : ""
//           } w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black focus:ring-2 focus:ring-indigo-500 outline-none`}
//         />
//       </div>
//     );
//   };

//   return (
//     <div className={`p-8 text-zinc-900 dark:text-white`}>
//       <div className="">
//         <div className="mb-6">
//           <h2 className="text-3xl font-bold mb-2">interest.</h2>
//           <h3 className="text-2xl font-bold">Sign up your account.</h3>
//         </div>

//         <form onSubmit={handleSubmit} className={`space-y-4`}>
//           {renderInput("email", "Email", "text")}
//           {renderInput("username", "Username", "text")}
//           {renderInput("firstName", "First name", "text")}
//           {renderInput("lastName", "Last Name", "text")}
//           {renderInput("password", "Password", "password")}
//           {renderInput("passwordConfirm", "Confirm password", "password")}

//           <Button
//             disabled={loading}
//             type="submit"
//             className="text-md rounded-lg w-full py-[22px] mt-4 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-transparent"
//           >
//             {loading ? (
//               <div className="flex dark:bg-white text-white dark:text-black items-center gap-1">
//                 <Spinner />
//                 Pending
//               </div>
//             ) : (
//               "Sign up"
//             )}
//           </Button>
//         </form>

//         {/* <div className="relative my-6">
//         <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div></div>
//         <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">Or</span></div>
//       </div>

//       <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors bg-white dark:bg-transparent">
//         <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
//         Sign up with Google
//       </button> */}

//         <div className="mt-6 text-center text-sm">
//           Already have an account?{" "}
//           <span
//             className="text-indigo-500 cursor-pointer font-medium"
//             onClick={openLogin}
//           >
//             Log in
//           </span>
//         </div>
//       </div>
//       <div
//         className={`p-8 md:p-12 transition-all duration-500 ease-in-out ${
//           !showOtpModal
//             ? "opacity-0 scale-95 pointer-events-none absolute inset-0 translate-y-10 invisible"
//             : "opacity-100 scale-100 translate-y-0 relative visible"
//         }`}
//       >
//         <div
//           className="absolute inset-0 bg-black/50"
//           onClick={() => setShowOtpModal(false)}
//         />
//         <div className="relative bg-white dark:bg-[#0b0b0b] rounded-lg p-6 w-full max-w-md z-10">
//           <h3 className="text-lg font-semibold mb-2">Enter OTP code</h3>
//           <p className="text-sm text-zinc-500 mb-4">
//             We have sent the OTP code to <strong>{userForm.email}</strong>.
//             Please check your email and enter the code.
//           </p>
//           <form onSubmit={handleOtpSubmit} className="space-y-3">
//             <input
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               placeholder="Enter OTP"
//               className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black outline-none"
//             />
//             <div className="flex justify-end gap-2">
//               <Button
//                 type="button"
//                 onClick={() => setShowOtpModal(false)}
//                 className="px-4 py-2 rounded-md border dark:bg-black dark:text-white bg-white text-black"
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={loading}>
//                 {loading ? (
//                   <div className="flex dark:bg-white text-white dark:text-black items-center gap-1">
//                     <Spinner />
//                     Pending
//                   </div>
//                 ) : (
//                   "Continue"
//                 )}
//               </Button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
