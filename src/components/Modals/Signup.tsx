// ./src/components/Signup.tsx

import React, { useEffect, useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { sendEmailVerification } from 'firebase/auth'; 

type SignupProps = {};

const Signup: React.FC<SignupProps> = () => {
    const router = useRouter();
    const [inputs, setInputs] = useState({ email: "", displayName: "", password: "" });
    const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth);

    const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputs.email || !inputs.password || !inputs.displayName) return alert("Please fill all fields");
        try {
            toast.loading("Creating your account", { position: "top-center", toastId: "loadingToast" });
            const newUserCredential = await createUserWithEmailAndPassword(inputs.email, inputs.password);
            if (!newUserCredential || !newUserCredential.user) throw new Error("Failed to create user");
            
            // Send email verification
            await sendEmailVerification(auth.currentUser!);
            toast.info("Email verification link sent! Please verify your email to complete registration.", { position: "top-center" });

            // Redirect user to a verification page
            router.push(`/verification?email=${inputs.email}`);
        } catch (error: any) {
            toast.error(error.message, { position: "top-center" });
        } finally {
            toast.dismiss("loadingToast");
        }
    };

    useEffect(() => {
        if (error) alert(error.message);
    }, [error]);

    return (
        <form className='space-y-6 px-6 pb-4' onSubmit={handleRegister}>
            <h3 className='text-xl font-medium text-white'>Register to codestop</h3>
            <div>
                <label htmlFor='email' className='text-sm font-medium block mb-2 text-gray-300'>Email</label>
                <input
                    onChange={handleChangeInput}
                    type='email'
                    name='email'
                    id='email'
                    className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
                    placeholder='name@company.com'
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
                    placeholder='name'
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
                    placeholder='*******'
                />
            </div>

            <button
                type='submit'
                className='w-full text-white focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s'
            >
                {loading ? "Registering..." : "Register"}
            </button>

            <div className='text-sm font-medium text-gray-300'>
                Already have an account?{" "}
                <a href='#' className='text-blue-700 hover:underline' onClick={() => router.push("/login")}>
                    Log In
                </a>
            </div>
        </form>
    );
};

export default Signup;
