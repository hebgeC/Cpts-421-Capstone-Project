import { Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import axios from "axios";

function getHostPort() {
    const os = Platform.OS;
    console.log("platform: " + os);
    if (os === "ios")
    {
        return "localhost:3000";
    }
    else if (os === "android")
    {
        return "10.0.2.2:3000";
    }

    return "localhost:3000";
}

export default function PrintEvents(){
    const [events, setEvents] = useState([]);

    const fetchEvents = async () => {
        try {
            const hostPort = getHostPort();
            console.log("host port: " + hostPort);

            const response = await axios.get("http://" + hostPort + "/events");

            setEvents(response.data);

            console.log("success fetching data");
        }
        catch (err) {
            console.log("failed to fetch events");
            console.log(err.message);
        }
    }
    
    useEffect(() => {
	  fetchEvents();
	}, []);

    return (
        <SafeAreaView>
        <View
            style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            }}
        >
            <Text>{JSON.stringify(events)}</Text>
        </View>
        </SafeAreaView> 
    );
}