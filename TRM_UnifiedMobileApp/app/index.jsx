import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EventList from "../components/EventList"

export default function Index() {
  return (
    <SafeAreaView>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Edit app/index.tsx to edit this screen.</Text>
        <EventList/>
      </View>
    </SafeAreaView> 
  );
}
