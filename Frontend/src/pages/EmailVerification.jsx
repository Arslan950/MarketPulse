import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from "framer-motion";
import { CheckCheckIcon, X, Loader2 } from 'lucide-react';

const EmailVerification = () => {
    const { emailVerificationToken } = useParams();
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("loading");
    const navigate = useNavigate();

    useEffect(() => {
        async function verifyToken() {
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/auth/verify-email/${emailVerificationToken}`);
                setMessage(response.data?.message || "Email verified successfully!");
                setStatus("success");
            } catch (error) {
                setMessage(error.response?.data?.message || "Link is expired");
                setStatus("error");
            }
        };

        if (emailVerificationToken) {
            verifyToken();
        } else {
            setStatus("error");
            setMessage("Invalid verification link");
        }
    }, [emailVerificationToken]);

    return (
        <div className="flex items-center justify-center h-screen px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className=" border-black dark:border-white/35 flex flex-col items-center justify-center w-full max-w-md min-h-[400px] p-16 transition-colors duration-300 border bg-card backdrop-blur border-border rounded-3xl"
            >
                <div className={`p-4 mb-8 rounded-2xl ${
                    status === 'error' ? 'bg-red-500/15' : 
                    status === 'loading' ? 'bg-blue-500/15' : 'bg-emerald-500/15'
                }`}>
                    {status === 'loading' && <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />}
                    {status === 'success' && <CheckCheckIcon className="w-12 h-12 text-emerald-500" />}
                    {status === 'error' && <X className="w-12 h-12 text-red-500" />}
                </div>

                <h2 className="mb-4 text-2xl font-semibold text-center text-foreground">
                    {status === 'loading' ? "Verifying..." : message}
                </h2>

                {status !== 'loading' && (
                    <div className={`flex items-center justify-center gap-3 w-full px-4 py-3 mt-4 border rounded-xl transition-colors hover:bg-opacity-80 cursor-pointer ${
                        status === 'error' ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                    }`}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate("/login");
                    }}>
                        <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                            status === 'error' ? 'bg-red-500' : 'bg-emerald-500'
                        }`} />
                        <button 
                            className={`text-sm font-medium ${
                                status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`} 
                        >
                            Go back to Login
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

export default EmailVerification;