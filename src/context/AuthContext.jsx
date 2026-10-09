import { createContext, useEffect, useState, useContext, Children} from "react";

const AuthContext = createContext()

export const AuthContextProvider = ({Children}) => {
    const [session, serSession] = useState(undefined)


    return (
        <AuthContext.Provider value={{session}}>
            {children}
        </AuthContext.Provider>
    )
}


export const UserAuth = () => {
    return useContext(AuthContext);
}