// ./src/pages/verification.tsx

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { auth, } from "@/firebase/firebase";

const VerificationPage: React.FC = () => {
    const router = useRouter();
    const { email } = router.query;

    useEffect(() => {
        if (email && typeof email === "string") {
            try {
                auth.applyActionCode(email);
                toast.success("Email verified successfully! You can now complete the registration process.", { position: "top-center" });
            } catch (error) {
                toast.error("Failed to verify email. Please try again later.", { position: "top-center" });
            }
        }
    }, [email]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-white">Email Verification</h2>
            <p className="text-gray-300">Verifying your email...</p>
        </div>
    );
};

export default VerificationPage;
