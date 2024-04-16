import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { auth } from "@/firebase/firebase";
import { applyActionCode } from "firebase/auth";

const VerificationPage: React.FC = () => {
  const router = useRouter();
  const { actionCode } = router.query; // Retrieve the action code from the URL query parameter

  useEffect(() => {
    if (actionCode && typeof actionCode === "string") {
      applyActionCode(auth, actionCode)
        .then(() => {
          toast.success("Email verified successfully! You can now access the problem table.", {
            position: "top-center",
          });
          // Redirect to the problem table Page
          router.push("/problem-table");
        })
        .catch((error) => {
          console.error("Error verifying email:", error);
          toast.error("Failed to verify email. Please try again later.", {
            position: "top-center",
          });
        });
    }
  }, [actionCode, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold">Email Verification</h2>
      <p className="text-gray-700">Verifying your email...</p>
    </div>
  );
};

export default VerificationPage;
