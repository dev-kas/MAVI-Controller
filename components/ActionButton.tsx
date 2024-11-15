import { View, Text, TouchableOpacity } from "react-native";
import * as colors from "@/constants/Colors";
import * as fonts from "@/constants/Fonts";

interface Props {
    children: React.ReactNode
    type?: "primary" | "secondary",
    click?: () => void
}

export default function ActionButton({ children, type = "primary", click = ()=>{} }: Props) {
    return (
        <TouchableOpacity style={[
        type === "primary" ? {
            backgroundColor: colors.PRIMARY,
        } : {
            backgroundColor: colors.BACKGROUND,
            borderColor: colors.PRIMARY,
            borderWidth: 1
        },
        {
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 5,
            cursor: "pointer"
        }]}
        activeOpacity={0.5}
        onPress={click}
        >
            <Text style={[
                type === "primary" ? {
                    color: colors.BACKGROUND
                } : {
                    color: colors.TEXT
                },
                {
                    fontFamily: fonts.REGULAR
                }
            ]}>{children}</Text>
        </TouchableOpacity>
    );
}
