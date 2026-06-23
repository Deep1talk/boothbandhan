"use client"

import axios from "axios"
import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { showErrorAlert, showSuccessAlert } from "@/lib/sweetAlert"
import { WEBSITE_LOGIN } from "@/routes/websiteRoutes"
import { useLanguage } from "@/components/shared/providers/LanguageProvider"
import { translateAuthMessage } from "@/lib/publicLanguage"

const EmailVerification = ({ params }) => {
    const { token } = use(params)
    const router = useRouter()
    const { language } = useLanguage()
    const copy = language === "hi" ? {
        successTitle: "ईमेल सत्यापित",
        successBody: "आपका ईमेल सफलतापूर्वक सत्यापित हो गया है।",
        errorTitle: "सत्यापन असफल",
        errorBody: "यह सत्यापन लिंक अमान्य है या इसकी समय-सीमा समाप्त हो चुकी है।",
    } : {
        successTitle: "Email verified",
        successBody: "Your email has been verified successfully.",
        errorTitle: "Verification failed",
        errorBody: "This verification link is invalid or has expired.",
    }

    useEffect(() => {
        const verify = async () => {
            try {
                const { data } = await axios.post("/api/auth/verify-email", { token })

                if (data?.success) {
                    await showSuccessAlert(
                        copy.successTitle,
                        translateAuthMessage(data.message || copy.successBody, language)
                    )
                    router.push(WEBSITE_LOGIN)
                } else {
                    await showErrorAlert(copy.errorTitle, translateAuthMessage(data?.message || copy.errorBody, language))
                }
            } catch (error) {
                await showErrorAlert(
                    copy.errorTitle,
                    translateAuthMessage(error.response?.data?.message || error.message || copy.errorBody, language)
                )
            }
        }

        verify()
    }, [copy.errorBody, copy.errorTitle, copy.successBody, copy.successTitle, language, router, token])

    return null
}

export default EmailVerification
