import React, { useState, useEffect } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { sendEmailVerification, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider } from "firebase/auth";
import { authModalState } from "@/atoms/authModalAtom";
import { useSetRecoilState } from "recoil";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import OtpInput from './otp-input-react';

type SignupProps = {};

const Signup: React.FC<SignupProps> = () => {
    const setAuthModalState = useSetRecoilState(authModalState);
    const router = useRouter();w
    
    const [inputs, setInputs] = useState({ email: "", displayName: "", password: "", phoneNumber: "" });
    const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth);
    const [otp, setOtp] = useState(""); // State for OTP
    const [verificationId, setVerificationId] = useState<string | null>(null); // State for storing verification ID
    const [otpSent, setOtpSent] = useState(false); // State for OTP sent status

    useEffect(() => {
        if (error) alert(error.message);
    }, [error]);

    const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const setupRecaptcha = () => {
        window.recaptchaVerifier = new RecaptchaVerifier(
            'recaptcha-container',
            {
                size: 'invisible',
                callback: (response) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                },
                expiredCallback: () => {
                    // Response expired. Ask user to solve reCAPTCHA again.
                },
            },
            auth
        );
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validation
        if (!inputs.email || !inputs.password || !inputs.displayName || !inputs.phoneNumber) {
            toast.error("Please fill all fields.");
            return;
        }

        try {
            toast.loading("Creating your account", { position: "top-center", toastId: "loadingToast" });
            
            // If OTP is entered, verify and create the user account
            if (otp && verificationId) {
                const credential = PhoneAuthProvider.credential(verificationId, otp);
                const result = await auth.currentUser?.linkWithCredential(credential);
                if (result) {
                    // Save additional user data to Firestore
                    const userData = {
                        uid: result.user.uid,
                        email: inputs.email,
                        displayName: inputs.displayName,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        likedProblems: [],
                        dislikedProblems: [],
                        solvedProblems: [],
                        starredProblems: [],
                    };
                    await setDoc(doc(firestore, "users", result.user.uid), userData);
                    
                    // Redirect user to a verification page or dashboard
                    router.push(`/verification?email=${inputs.email}`);
                }
            } else {
                // If OTP is not entered, start the phone number verification process
                setupRecaptcha();

                const phoneNumber = +inputs.phoneNumber.replace(/\+/g, '');
 // Format phone number properly
                const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);

                // Set the confirmation result to state
                setVerificationId(confirmationResult.verificationId);
                toast.info("OTP sent to your phone. Please enter the OTP to complete registration.", { position: "top-center" });
                setOtpSent(true);
            }
        } catch (error: any) {
            toast.error(error.message, { position: "top-center" });
        } finally {
            toast.dismiss("loadingToast");
        }
    };

    // Handle sending OTP
    // const handleSendOtp = async () => {
    //     if (!inputs.phoneNumber) {
    //         toast.error("Please enter a phone number.");
    //         return;
    //     }

    //     // Initialize reCAPTCHA verifier
    //     const appVerifier = new RecaptchaVerifier(
    //         "recaptcha-container",
    //         {
    //             size: "normal",
    //             callback: (response) => {
    //                 // reCAPTCHA solved, allow signInWithPhoneNumber.
    //             },
    //             expiredCallback: () => {
    //                 // Response expired. Ask user to solve reCAPTCHA again.
    //             },
    //         },
    //         auth
    //     );

    //     // Send OTP
    //     try {
    //         const confirmationResult = await signInWithPhoneNumber(auth, inputs.phoneNumber, appVerifier);
    //         setVerificationId(confirmationResult.verificationId);
    //         toast.success("OTP sent to your phone number.");
    //         setOtpSent(true);
    //     } catch (error: any) {
    //         toast.error(`Error sending OTP: ${error.message}`);
    //     }
    // };

    // Inside handleSendOtp function:
    const handleSendOtp = async () => {
        if (!inputs.phoneNumber) {
            toast.error("Please enter a phone number.");
            return;
        }
    
        try {
            // Remove any non-digit characters from the phone number
            const formattedPhoneNumber = inputs.phoneNumber.replace(/\D/g, '');
    
            // Initialize reCAPTCHA verifier
            const appVerifier = new RecaptchaVerifier(
                "recaptcha-container",
                {
                    size: "invisible",
                    callback: (response) => {
                        // reCAPTCHA solved, allow signInWithPhoneNumber.
                    },
                    expiredCallback: () => {
                        // Response expired. Ask user to solve reCAPTCHA again.
                    },
                },
                auth
            );
    
            // Send OTP
            const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
            setVerificationId(confirmationResult.verificationId);
            toast.success("OTP sent to your phone number.");
            setOtpSent(true);
        } catch (error: any) {
            toast.error(`Error sending OTP: ${error.message}`);
        }
    };
    


    // Handle verifying OTP
    const handleVerifyOtp = async () => {
        if (!otp || !verificationId) {
            toast.error("Please enter the OTP.");
            return;
        }

        try {
            const credential = PhoneAuthProvider.credential(verificationId, otp);
            await auth.currentUser?.linkWithCredential(credential);
            toast.success("Phone number verified successfully.");
            setOtpSent(false);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleClick = () => {
        setAuthModalState((prev) => ({ ...prev, type: "login" }));
    };

    return (
        <form className='space-y-6 px-6 pb-4' onSubmit={handleRegister}>
            <h3 className='text-xl font-medium text-white'>Register to codestop</h3>

            {/* Existing inputs */}
            <div>
                <label htmlFor='email' className='text-sm font-medium block mb-2 text-gray-300'>Email</label>
                <input
                    onChange={handleChangeInput}
                    type='email'
                    name='email'
                    id='email'
                    className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
                    placeholder='Enter your email'
                    value={inputs.email}
                />
            </div>

            <div>
                <label htmlFor='displayName' className='text-sm font-medium block mb-2 text-gray-300'>Display Name</label>
                <input
                    onChange={handleChangeInput}
                    type='text'
                    name='displayName'
                    id='displayName'
                    className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
                    placeholder='Enter your display name'
                    value={inputs.displayName}
                />
            </div>

            <div>
                <label htmlFor='password' className='text-sm font-medium block mb-2 text-gray-300'>Password</label>
                <input
                    onChange={handleChangeInput}
                    type='password'
                    name='password'
                    id='password'
                    className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
                    placeholder='Enter your password'
                    value={inputs.password}
                />
            </div>

            {/* Phone Number Input */}
            <div>
                <label htmlFor='phoneNumber' className='text-sm font-medium block mb-2 text-gray-300'>Phone Number</label>
                <PhoneInput
                    country={"us"} // Set the default country code as desired
                    value={inputs.phoneNumber}
                    onChange={(phone) => {
                        // Remove dashes from the phone number
                        const formattedPhoneNumber = phone.replace(/-/g, '');
                        // Remove any non-digit characters from the phone number
                        const cleanPhoneNumber = formattedPhoneNumber.replace(/\D/g, '');
                        // Update the state with the formatted phone number
                        setInputs((prev) => ({ ...prev, phoneNumber: cleanPhoneNumber }));
                    }}
                    inputStyle={{ width: "100%" }}
                />

                <button
                    type='button'
                    className='mt-2 text-white focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s'
                    onClick={handleSendOtp}
                >
                    Send OTP
                </button>
            </div>

            {/* OTP Input */}
            {otpSent && (
                <div>
                    <label htmlFor='otp' className='text-sm font-medium block mb-2 text-gray-300'>OTP</label>
                    <OtpInput
                        value={otp}
                        onChange={(value) => setOtp(value)}
                        numInputs={6}
                        separator={<span>-</span>}
                        inputStyle='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
                        shouldAutoFocus
                        isInputNum
                    />
                    <button
                        type='button'
                        className='mt-2 text-white focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s'
                        onClick={handleVerifyOtp}
                    >
                        Verify OTP
                    </button>
                </div>
            )}

            <button
                type='submit'
                className='w-full text-white focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s'
                disabled={(otpSent && !otp) || loading || !inputs.email || !inputs.displayName || !inputs.password}
            >
                {loading ? "Registering..." : "Register"}
            </button>

            <div className='flex justify-end text-sm'>
                <p className='text-white'>Already have an account?{" "}
                    <span
                        onClick={handleClick}
                        className='text-blue-500 hover:underline cursor-pointer'
                    >
                        Login
                    </span>
                </p>
            </div>

            {/* reCAPTCHA container for OTP */}
            <div id="recaptcha-container"></div>
        </form>
    );
};

export default Signup;