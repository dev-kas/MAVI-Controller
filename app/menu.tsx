import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ExternalPathString, Link, RelativePathString, useLocalSearchParams } from 'expo-router';

import * as colors from "@/constants/Colors";
import * as fonts from "@/constants/Fonts";
import { getStatusBarHeight } from 'react-native-status-bar-height';
import useSio from "@/hooks/useSio";

export default function Menu() {
    const { t: targetID } = useLocalSearchParams();
    const [ ping, setPing ] = React.useState(0);
    const [ rtt, setRtt ] = React.useState(0);
    const { socket, isConnected } = useSio();

    if (!targetID) return;

    // PING
    React.useEffect(() => {
        if (!socket || !isConnected) return;

        const interval = setInterval(() => {
            const start = Date.now();

            socket.emit("ping", () => {
                const duration = Date.now() - start;
                setPing(duration);
            });
        }, 1000);

        return () => { clearInterval(interval) };
    }, [socket]);

    // RTT
    React.useEffect(() => {
        if (!socket || !isConnected) return;

        const interval = setInterval(() => {
            const start = Date.now();

            socket.emit("rtt", () => {
                const duration = Date.now() - start;
                setRtt(duration);
            });
        }, 1000);

        return () => { clearInterval(interval) };
    }, [socket]);


    const data: { name: string, link: RelativePathString | ExternalPathString }[] = [
        {
            name: "/bin/sh",
            link: `/shell?t=${targetID}&s=/bin/sh` as RelativePathString,
        },
        {
            name: "/bin/bash",
            link: `/shell?t=${targetID}&s=/bin/bash` as RelativePathString,
        },
        {
            name: "/bin/zsh",
            link: `/shell?t=${targetID}&s=/bin/zsh` as RelativePathString,
        },
        {
            name: "/bin/python3" as RelativePathString,
            link: `/shell?t=${targetID}&s=/bin/python3` as RelativePathString,
        },
        {
            name: "C:\\Windows\\System32\\cmd.exe",
            link: `/shell?t=${targetID}&s=C:\\Windows\\System32\\cmd.exe` as RelativePathString,
        },
        {
            name: "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
            link: `/shell?t=${targetID}&s=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe` as RelativePathString,
        },
        {
            name: "lsla",
            link: `/explore?t=${targetID}&m=lsla` as RelativePathString,
        },
        {
            name: "scrsh",
            link: `/scrsh?t=${targetID}&m=scrsh` as RelativePathString,
        }
    ];

    return (
        <View style={{
            flex: 1,
            padding: 20,
            paddingTop: getStatusBarHeight() + 20,
            backgroundColor: colors.BACKGROUND,
        }}>
            <Text style={{
                fontFamily: fonts.BOLD,
                color: colors.TEXT,
                fontSize: 20,
                paddingBottom: 15
            }}>Select a process to spawn:</Text>

            <View style={{
                backgroundColor: colors.SECONDARY,
                padding: 10,
                marginTop: 10,
                position: "fixed",
                bottom: 10,
                right: 10,
                borderColor: colors.PRIMARY,
                borderWidth: 1,
                zIndex: 2
            }}>
                {
                    [
                        ["ping", ping + "ms"],
                        ["rtt", rtt + "ms"],
                        ["target", targetID],
                    ].map((item, index)=>{
                        return (
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text
                                    key={index}
                                    style={{
                                        fontFamily: fonts.REGULAR,
                                        color: colors.TEXT,
                                        paddingRight: 15
                                    }}
                                >{item[0]}:</Text>
                                <Text
                                    key={index+20}
                                    style={{
                                        fontFamily: fonts.BOLD,
                                        color: colors.PRIMARY
                                    }}
                                >{item[1]}</Text>
                            </View>
                        )
                    })
                }
            </View>

            <ScrollView>
                {
                    data.map((item, index) => (
                        <Link key={index} style={{
                            fontFamily: fonts.REGULAR,
                            color: colors.TEXT,
                            backgroundColor: colors.SECONDARY,
                            padding: 10,
                            marginTop: index === 0 ? 0 : 10
                        }} href={item.link}>{item.name.length > 35 ? `...${item.name.slice(-35)}` : item.name}</Link>
                    ))
                }
            </ScrollView>
        </View>
    );
};

