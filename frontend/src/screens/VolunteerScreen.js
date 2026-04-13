import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Linking, TextInput, Image, ActivityIndicator,
  RefreshControl,
} from 'react-native';
import CalendarView from '../components/CalendarView';

export default function VolunteerScreen() {
    return (
        <View style={styles.container}>
            <CalendarView />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});