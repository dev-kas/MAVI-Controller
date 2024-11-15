import { View, Text } from "react-native";
import * as colors from "@/constants/Colors";
import * as fonts from "@/constants/Fonts";

import { Terminal } from "@xterm/xterm";
import { FitAddon } from "xterm-addon-fit";
import "@xterm/xterm/css/xterm.css";
import { forwardRef, useEffect, useImperativeHandle } from "react";

export interface TermRefHandle {
    write: (data: string) => void
    getDims : () => { rows: number, cols: number }
}

interface Props {
    onData: (data: string) => void
}

// export default function WTerm({ onData }: Props) {
const WTerm = forwardRef(({ onData }: Props, ref) => {
    let term: Terminal | null = null;
    useEffect(()=>{
        term = new Terminal();
    
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(document.getElementById("wb-xterm-256color") as HTMLDivElement);
        fitAddon.fit();

        term.onData((data) => {
            // term.write(data);
            onData(data);
        });
    }, [term]);

    useImperativeHandle(ref, () => ({
        write: (data: string) => {
            // console.log("writing", data)
            term?.write(data);
        },

        getDims: () => {
            return {
                rows: term?.rows || 24,
                cols: term?.cols || 80,
            }
        }
    }));

    return (
        <View id="wb-xterm-256color" style={{
            flex: 1,
            height: "100%",
            width: "100%",
        }}></View>
    );
});

export default WTerm;
