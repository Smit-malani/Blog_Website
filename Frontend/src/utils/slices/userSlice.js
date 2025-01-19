import {createSlice} from '@reduxjs/toolkit'


const getUserFromLocalStorage = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'))
        return user || { token: null }
    } catch (error) {
        console.error("Error parsing user from localStorage:", error)
        return { token: null }
    }
}

const userSlice = createSlice({
    name: "userSlice",
    initialState: getUserFromLocalStorage(),
    reducers: {
        login(state, action){
            localStorage.setItem("user",JSON.stringify(action.payload))
            return action.payload
        },
        logout(state, action){
            localStorage.removeItem("user")
            return {
                token: null
            }
        }
    }
})

export const {login, logout} = userSlice.actions
export default userSlice.reducer