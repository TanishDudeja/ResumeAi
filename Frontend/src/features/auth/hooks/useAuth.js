import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login,register,logout } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context
    console.log(user)
    console.log(loading)

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            if (data && data.user) {
                setUser(data.user)
                return { success: true }
            }
            return { success: false, error: "Login failed" }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data?.message || "Login failed" }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            if (data && data.user) {
                setUser(data.user)
                return { success: true }
            }
            return { success: false }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data?.message || "Registration failed" }
        } finally {
            setLoading(false)
        }
    }
    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }


   

    return { user, loading, handleRegister, handleLogin, handleLogout }
}