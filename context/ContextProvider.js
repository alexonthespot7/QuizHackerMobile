import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import AuthContext from "./AuthContext";

function ContextProvider(props) {
    const [loginData, setLoginData] = useState(null);
    const [unverifiedId, setUnverifiedId] = useState(null);
    const [processStarted, setProcessStarted] = useState(false);
    const [avatarURL, setAvatarURL] = useState(null);

    const fetchAvatarURL = (id, token) => {
        fetch('https://quiz-hacker-back.herokuapp.com/getavatar/' + id,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            })
            .then(response => response.text())
            .then(data => {
                setAvatarURL(data);
            })
            .catch(err => console.error(err));
    }

    async function fetchData() {
        const token = await AsyncStorage.getItem('jwt');
        const id = await AsyncStorage.getItem('id');
        const role = await AsyncStorage.getItem('role');
        if (token && id && role) {
            fetchAvatarURL(id, token);
            setLoginData({ jwt: token, id: id, role: role });
        } else {
            setLoginData(null);
            const unverId = await AsyncStorage.getItem('unverifiedId');
            if (unverId) {
                setUnverifiedId(unverId);
            } else {
                setUnverifiedId(null);
            }
        }
    }

    async function receiveUnverifiedId(unverId) {
        await AsyncStorage.setItem('unverifiedId', unverId);
        fetchData();
    }

    async function logOutData() {
        await AsyncStorage.removeItem('jwt');
        await AsyncStorage.removeItem('id');
        await AsyncStorage.removeItem('role');
        await AsyncStorage.removeItem('unverifiedId');
        setAvatarURL(null);
        fetchData();
    }

    async function loginMake(token, id, role) {
        await AsyncStorage.setItem('jwt', token);
        await AsyncStorage.setItem('id', id);
        await AsyncStorage.setItem('role', role);
        await AsyncStorage.removeItem('unverifiedId');
        fetchData();
    }

    async function removeUnverifiedId() {
        await AsyncStorage.removeItem('unverifiedId');
        fetchData();
    }



    useEffect(() => {
        fetchData();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                unverifiedId, logOutData, loginData, loginMake, receiveUnverifiedId,
                removeUnverifiedId, processStarted, setProcessStarted, avatarURL, setAvatarURL
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export default ContextProvider;