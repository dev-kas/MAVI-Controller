import { useRouter } from "expo-router";
import { BackHandler, Dimensions, Text, TextInput, View } from "react-native";

import * as colors from "@/constants/Colors";
import * as fonts from "@/constants/Fonts";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import ActionButton from "@/components/ActionButton";
import useSio from "@/hooks/useSio";

export default function Index() {
  const router = useRouter();
  const [targetID, setTargetID] = useState("2FbkxPI4hpA8ErEXAAA3");
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get("window"));
  const { socket, isConnected } = useSio();

  useEffect(() => {
    setWindowDimensions(Dimensions.get('window'));
    const onChange = (dimensions: any) => {
      setWindowDimensions(dimensions.window);
    };

    const subscription = Dimensions.addEventListener("change", onChange);

    // Cleanup the event listener on component unmount
    return () => subscription?.remove();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.BACKGROUND,
      }}
    >
      <StatusBar style="dark" backgroundColor={colors.PRIMARY} />
      <View style={{
        backgroundColor: colors.BACKGROUND,
        padding: 20,
        borderRadius: 5,
        borderColor: colors.SECONDARY,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 10,
        width: "100%",
        maxWidth: 350,
        // maxHeight: 50
      }}>
        <Text style={{ color: colors.TEXT, fontFamily: fonts.BOLD }}>Enter Target ID:</Text>
        <View style={{
          position: "relative",
          width: "100%",
          justifyContent: "center",
          alignItems: "flex-end",
          maxHeight: 40
        }}>
          <Text style={{
            position: "absolute",
            color: colors.SECONDARY,
            fontFamily: fonts.REGULAR,
            padding: 12,
            pointerEvents: "none",
            backgroundColor: colors.BACKGROUND,
            fontSize: 14,
            width: "100%",
            height: "100%",
            marginHorizontal: "auto",
            top: 0, bottom: 0,
            left: 0, right: 0,
          }}>
            {"*".repeat(20-targetID.length).padStart(20, " ")}
          </Text>
          <TextInput style={{
            color: colors.TEXT,
            fontFamily: fonts.REGULAR,
            padding: 10,
            borderRadius: 5,
            borderColor: colors.SECONDARY,
            borderWidth: 2,
            width: "100%",
            height: "100%",
            outlineColor: colors.PRIMARY,
            zIndex: 0,
            fontSize: 14
          }}
          placeholder=""
          placeholderTextColor={colors.SECONDARY}
          selectionColor={colors.PRIMARY}
          value={targetID}
          onChangeText={setTargetID}
          maxLength={20}
          />
        </View>
        <View style={{
          backgroundColor: colors.BACKGROUND,
          width: "100%",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 10,
          flexDirection: "row-reverse"
        }}>
          <ActionButton type="primary" click={()=>{
            if (!isConnected) {
              return;
            }
            socket?.emit("connectTarget", targetID);
            router.push(`/menu?t=${targetID}`);
          }}>Connect</ActionButton>
          <ActionButton type="secondary" click={()=>{
            BackHandler.exitApp();
          }}>Cancel</ActionButton>
        </View>
      </View>
    </View>
  );
}
