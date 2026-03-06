import { Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

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

const fetchEvents = async () => {
    // setIsLoading(true);
    try {
        const hostPort = getHostPort();
        console.log("host port: " + hostPort);
        const response = await fetch("http://" + hostPort + "/events");
        const data = await response.json();
        setEvents(data); // currently not cleaning data. just want to see if i am using api correct first
        console.log("success fetching data");
    }
    catch {
        console.log("fialed to fetch events");
    }
    finally {
        // setIsLoading(false);
    }
}

export default function printEvents(){
    const [events, setEvents] = useState([]);
    // const [isLoading, setIsLoading] = useState(true);
    
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
            <Text>{JSON.stringify(events, null, 2)}</Text>
        </View>
        </SafeAreaView> 
    );
}