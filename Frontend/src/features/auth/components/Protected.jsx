import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React, { useContext } from 'react'
import { AuthContext } from "../auth.context";

const Protected = ({ children }) => {

    const context = useContext(AuthContext)
    const { loading, user } = context


    if (loading) {
        return (<main><h1>Loading...</h1></main>)
    }

    if (!user) {
        return <Navigate to={'/login'} />
    }

    return children


}

export default Protected
