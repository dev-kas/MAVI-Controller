import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ExternalPathString, Link, RelativePathString, useLocalSearchParams } from 'expo-router';

import * as colors from "@/constants/Colors";
import * as fonts from "@/constants/Fonts";
import { getStatusBarHeight } from 'react-native-status-bar-height';

export default function Menu() {
    const { t : targetID } = useLocalSearchParams();

    if (!targetID) {
        return;
    }

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
                fontSize: 20
            }}>Select a process to spawn:</Text>
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

