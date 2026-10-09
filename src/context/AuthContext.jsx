import { createContext, useEffect, useState, useContext, Children} from "react";
import { supabase } from "../supabaseClient";
import { __unstable__loadDesignSystem } from "tailwindcss";

const AuthContext = createContext()

export const AuthContextProvider = ({children}) => {
    const [session, setSession] = useState(undefined)

    //Sign up
    const signUpNewUser = async () => {
        const {data, error} = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if(error) {
            console.error("there was a problem signing up: ", error)
            return {success: false, error};
        }
        return {success: true, data};
    };

    //Sign in
    const signInUser = async () => {
        try {
            const {data, error} = await supabase.auth.signInWithPassward({
                email: email,
                password: password
            });
            if(error){
                console.error("Sign in error occured: ", error);
                return { success: false, error: error.message };
            }
            console.log("sign-in success: ", data);
            return { success: true, data };
        } catch(error){
            console.error("An error occured: ", error);
        }
    };
    
    useEffect(() => {
        supabase.auth.getSession().then(({ data: {session}}) => {
            serSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    },[]);

    //Sign out
    const SignOut = () => {
        const { error } = supabase.auth.signOut();
        if(error) {
            console.error("There was an error: ", error);
        }
    };

    return (
        <AuthContext.Provider value={{session, signUpNewUser, signInUser, SignOut}}>
            {children}
        </AuthContext.Provider>
    )
}


export const UserAuth = () => {
    return useContext(AuthContext);
}