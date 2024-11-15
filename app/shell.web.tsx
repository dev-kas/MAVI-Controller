import { View, Text, Platform } from "react-native";
import * as colors from "@/constants/Colors";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { useLocalSearchParams } from "expo-router";
import WTerm, { TermRefHandle } from "@/components/Term.web";
import useSio from "@/hooks/useSio";
import { useEffect, useRef } from "react";

export default function Shell() {
    const statusBarHeight = getStatusBarHeight();
    const { socket, isConnected: isSocketConnected } = useSio();
    const { t: targetID, s: shell } = useLocalSearchParams();
    const termRef = useRef<TermRefHandle>(null);
    
    function reshell() {
        console.log("load with 200", targetID, shell, isSocketConnected);
        if (!targetID || !shell || !isSocketConnected) return;
        socket?.emit("ReqPTYSpawn", {
            shell, targetID,
            rows: termRef.current?.getDims().rows || 24,
            cols: termRef.current?.getDims().cols || 80
        });
    }

    socket?.on("outputPTY", ({ data, ptyID }: { data: Buffer, ptyID: string }) => {
        console.log("==>", data, "<==")
        termRef.current?.write(data.toString());
    });

    useEffect(reshell,[]);
    useEffect(reshell,[shell, isSocketConnected, targetID]);

    return (
        <View style={{
            flex: 1,
            // padding: 20,
            paddingTop: statusBarHeight,
            backgroundColor: colors.BACKGROUND,
        }}>
            {/* <Text>Terminal for {targetID} using {shell}</Text> */}
            {
                <WTerm 
                    onData={(data)=>{
                        if (!isSocketConnected) return;
                        socket?.emit("ptySendWrite", {
                            ptyID: targetID,
                            data
                        })
                    }} ref={termRef}
                />
            }
        </View>
    );
};