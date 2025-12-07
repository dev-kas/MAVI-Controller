import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { useLocalSearchParams } from "expo-router";
import * as colors from "@/constants/Colors";
import * as fonts from "@/constants/Fonts";
import { useEffect, useState } from "react";
import useSio from "@/hooks/useSio";
import { Buffer } from "buffer";
import { encode } from "base64-arraybuffer";
import * as FileSystem from 'expo-file-system';
import * as Progress from "react-native-progress";

export default function Explore() {
    const { t: targetID, m: mode } = useLocalSearchParams();
    const [ path, setPath ] = useState("");
    const [ pathType, setPathType ] = useState("dir");
    const { socket, isConnected: isSocketConnected } = useSio();
    const [ data, setData ] = useState<{
        name: string,
        fpath: string,
        type: "dir" | "file",
        size: number,
        perm: string
    }[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProg, setDownloadProg] = useState<number>(0);

    if (!mode || !targetID) {
        return;
    }

    if (!["lsla"].includes(mode as string)) {
        return (
            <View style={{
                paddingTop: getStatusBarHeight() + 20,
                padding: 20,
                backgroundColor: colors.BACKGROUND,
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}>
                <Text style={{
                    color: colors.TEXT,
                    fontFamily: fonts.BOLD,
                    fontSize: 20
                }}>Unsupported mode: {mode}</Text>
            </View>
        )
    }

    socket?.on("lsla_data", ({ data, path, pathType }: { data: { name: string, fpath: string, type: "dir" | "file", size: number, perm: string }[], path: string, pathType: "dir" | "file" }) => {
        console.log("lsla_data", data, path, pathType);
        if (pathType === "dir") {
            setData(data);
            setPath(path);
            setPathType(pathType);
        };
    });

    function open(p: string | null) {
        socket?.emit("lsla_get", {
            path: p,
            machineId: targetID
        });
    }

    function dwPrompt(p: string, fname: string) {
        if (Platform.OS === "web") {
            const accepted = window.confirm(`Do you want to download this file? (${p})`);
            if (accepted) { download(p, fname) };
        } else {
            Alert.alert("Download File", `Do you wanna download this file? (${p})`, [
                {
                    text: "Cancel",
                    onPress: () => {console.log("download cancelled")},
                    style: "cancel"
                },
                {
                    text: "Download",
                    onPress: () => {
                        // open(path);
                        console.log("download started")
                        download(p, fname)
                    }
                }
            ], { cancelable: false });
        }
    }
    
    function download(p: string, fname: string) {
        console.log("Downloading", p);
        let contents = Buffer.from("");
        let downloaded = false;
        socket?.emit("lsla_download", {
            path: p,
            machineId: targetID
        });
        setIsDownloading(true);
        socket?.on("lsla_dwdata", ({ path, data, chunk, total }: { path: string, data: Buffer, chunk: number, total: number }) => {
            data = Buffer.from(data);
            console.log("lsla_dwdata", data, path, chunk, total);
            contents = Buffer.concat([contents, data]);
            setDownloadProg((chunk / total) * 100);
            if (chunk === total) {
                downloaded = true;
                console.log("Download complete");
                console.log(contents.toString());
                if (Platform.OS === "web") saveWeb();
                else saveNative();
                setIsDownloading(false);
                setDownloadProg(0);
                contents = Buffer.from("");
                socket.removeAllListeners("lsla_dwdata");
            }
        });

        function saveWeb() {
            const blob = new Blob([contents], { type: 'application/octet-stream' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fname;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        async function saveNative() {
            try {
                // Convert buffer to a base64 string for mobile
                const base64String = encode(contents);
                const fileUri = FileSystem.documentDirectory + fname;
        
                // Write the file to the document directory as a binary file
                await FileSystem.writeAsStringAsync(fileUri, base64String, {
                  encoding: FileSystem.EncodingType.Base64,
                });
        
                // Optionally, use expo-sharing to share the file or show a success message
                // setDownloaded(true);
                console.log('File downloaded to:', fileUri);
              } catch (error) {
                console.error('Download failed', error);
              }
        }
    };

    function back() {
        console.log("Back called, ", socket, path, targetID);
        socket?.emit("lsla_back", {
            path,
            machineId: targetID
        });
    }

    useEffect(() => { open(null) }, []);

    return (<>
                {
                    isDownloading &&
                    <View style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: colors.BACKGROUND,
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1,
                    }}>
                        <Text style={{
                            color: colors.TEXT,
                            fontFamily: fonts.BOLD,
                            fontSize: 20
                        }}>Downloading ({downloadProg}%)</Text>
                        <Progress.Bar progress={downloadProg/100} color={colors.PRIMARY} />
                    </View>
                }
                <View style={{
                    paddingTop: getStatusBarHeight() + 20,
                    padding: 20,
                    backgroundColor: colors.BACKGROUND,
                    flex: 1,
                }}>
                    <Text style={{
                        color: colors.TEXT,
                        fontFamily: fonts.BOLD,
                        fontSize: 20
                    }}>Explore (Mode: {mode})</Text>
                    <Text style={{
                        color: colors.TEXT,
                        fontFamily: fonts.REGULAR
                    }}>({pathType}) {path}</Text>
                    <ScrollView>
                        <TouchableOpacity style={{
                            backgroundColor: colors.SECONDARY,
                            padding: 10,
                        }}
                            onPress={() => {
                                back();
                            }}
                        >
                            <Text style={{
                                fontFamily: fonts.REGULAR,
                                color: colors.TEXT
                            }}>..</Text>
                        </TouchableOpacity>
                        {
                            data.length > 0 ?
                            data.map((item, index) => (
                                <TouchableOpacity key={index} style={{
                                    backgroundColor: colors.SECONDARY,
                                    padding: 10,
                                    marginTop: 10,
                                }}
                                    onPress={()=>{
                                        if (item.type === "dir") {
                                            open(item.fpath);
                                        } else {
                                            dwPrompt(item.fpath, item.name);
                                        }
                                    }}
                                >
                                    <Text style={{
                                        fontFamily: fonts.REGULAR,
                                        color: colors.TEXT
                                    }}>({item.type}) {item.name.length > 35 ? `...${item.name.slice(-35)}` : item.name}</Text>
                                </TouchableOpacity>
                            )) : (
                                <Text style={{
                                    color: colors.TEXT,
                                    fontFamily: fonts.REGULAR,
                                    textAlign: "center",
                                    marginTop: 50
                                }}>No files found</Text>
                            )
                        }
                    </ScrollView>
                </View>
            </>
        );
}
