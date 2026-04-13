import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import CalendarView from '../components/CalendarView';

export default function VolunteerScreen() {
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Volunteer Shifts</Text>
                <Text style={styles.pageSubtitle}>Browse and sign up for open volunteer shifts</Text>
            </View>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <CalendarView />
                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    pageHeader: {
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#EBEBEB',
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#2C1810',
        letterSpacing: -0.5,
    },
    pageSubtitle: {
        fontSize: 13,
        color: '#888888',
        marginTop: 4,
    },
    content: {
        padding: 16,
    },
});