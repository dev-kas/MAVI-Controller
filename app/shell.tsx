import { View, Text } from "react-native";
import * as colors from "@/constants/Colors";
import * as fonts from "@/constants/Fonts";

export default function Shell() {
    return (
        <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.BACKGROUND,
        }}>
            <Text style={{
                fontFamily: fonts.BOLD,
                color: colors.TEXT,
                fontSize: 20
            }}>Shell isn ot supported on this platform</Text>
        </View>
    );
}

