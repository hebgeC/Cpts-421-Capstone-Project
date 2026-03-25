import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarView from "../components/CalendarView";

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flex: 1 }}>
          <CalendarView />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
