import {
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    Linking,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { useWindowDimensions } from "react-native";
import { FontAwesome5 } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

export default function DetailModal({ visible, onClose, title, time, location, openSlots, description, id }) {
    const { width } = useWindowDimensions();
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={onClose}
            >
                <View
                    style={styles.card}
                    onStartShouldSetResponder={() => true}
                >
                    {/* Accent bar */}
                    <View style={styles.accentBar} />

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <Text style={styles.title}>{title}</Text>

                        <View style={styles.divider} />

                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldIcon}>
                                <FontAwesome5
                                    name="clock"       // the icon name
                                    size={24}          // size in pixels
                                    color="gray"       // color
                                    solid={false}      // regular style (not solid)
                                />
                            </Text>
                            <View style={styles.fieldContent}>
                                <Text style={styles.fieldLabel}>Time</Text>
                                <Text style={styles.fieldText}>{time}</Text>
                            </View>
                        </View>

                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldIcon}>
                                <FontAwesome5
                                    name="map-marker-alt"
                                    size={20}
                                    color="#555"
                                />
                            </Text>
                            <View style={styles.fieldContent}>
                                <Text style={styles.fieldLabel}>Location</Text>
                                <Text style={styles.fieldText}>{location}</Text>
                            </View>
                        </View>

                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldIcon}>
                                <FontAwesome5
                                    name="user"
                                    size={20}
                                    color="#555"
                                />
                            </Text>
                            <View style={styles.fieldContent}>
                                <Text style={styles.fieldLabel}>Open Slots</Text>
                                <Text style={styles.fieldText}>{openSlots}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <Text style={styles.descriptionLabel}>Details</Text>
                        <ScrollView style={styles.descriptionBox}>
                            <RenderHTML
                                contentWidth={width * 0.75}
                                source={{ html: description }}
                                baseStyle={styles.descriptionBase}
                            />
                        </ScrollView>
                    </ScrollView>

                    <View style={styles.row}>
                        <TouchableOpacity 
                            onPress={() => Linking.openURL(`https://rescue-mission.volunteerhub.com/vv2/event/${id}`)}
                            style={styles.closeBtn}
                        >
                            <Text style={styles.closeBtnText}>Sign Up</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        width: "88%",
        maxHeight: "80%",
        backgroundColor: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
    },
    accentBar: {
        height: 5,
        backgroundColor: "#C0392B",
    },
    scrollContent: {
        padding: 24,
        paddingTop: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: "#2C1810",
        textAlign: "center",
        lineHeight: 28,
    },
    divider: {
        height: 1,
        backgroundColor: "#EBEBEB",
        marginVertical: 16,
    },
    fieldRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 14,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    fieldIcon: {
        fontSize: 18,
        marginRight: 12,
        marginTop: 2,
    },
    fieldContent: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#AAAAAA",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    fieldText: {
        fontSize: 15,
        color: "#2C1810",
        lineHeight: 22,
    },
    descriptionLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#AAAAAA",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    descriptionBox: {
        backgroundColor: "#FDF6F0",
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "#EBEBEB",
    },
    descriptionBase: {
        fontSize: 14,
        color: "#2C1810",
        lineHeight: 22,
    },
    closeBtn: {
        margin: 16,
        marginTop: 16,
        alignSelf: "center",
        backgroundColor: "#C0392B",
        paddingVertical: 12,
        paddingHorizontal: 36,
        borderRadius: 10,
    },
    closeBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
});