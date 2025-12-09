import { View, Text, Platform, Dimensions } from "react-native";
import * as colors from "@/constants/Colors";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { useLocalSearchParams } from "expo-router";
import useSio from "@/hooks/useSio";
import { useEffect, useRef, useState } from "react";

function preserveAndResize(canvas: HTMLCanvasElement, newW: number, newH: number, dpr: number) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const off = document.createElement("canvas");
    off.width = canvas.width;
    off.height = canvas.height;
    off.getContext("2d")!.drawImage(canvas, 0, 0);
    canvas.style.width = newW + "px";
    canvas.style.height = newH + "px";

    canvas.width = newW * dpr;
    canvas.height = newH * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.drawImage(off, 0, 0, off.width / dpr, off.height / dpr, 0, 0, newW, newH);
}

export default function Scrsh() {
    const statusBarHeight = getStatusBarHeight();
    const { socket, isConnected: isSocketConnected } = useSio();
    const { t: targetID } = useLocalSearchParams();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lastFullFrameRef = useRef<{ data: ArrayBuffer, fw: number, fh: number } | null>(null);

    function draw(data: ArrayBuffer, x = 0, y = 0, fw: number, fh: number, w?: number, h?: number) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        // console.log(data)

        let binary = '';
        const bytes = new Uint8Array(data);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);

        img.src = "data:image/webp;base64," + base64Data;

        img.onload = () => {
            const cssWidth = canvas.clientWidth;
            const cssHeight = canvas.clientHeight;

            const scale = Math.min(cssWidth / fw, cssHeight / fh);

            const dx = x * scale;
            const dy = y * scale;

            const sourceW = w ?? img.width;
            const sourceH = h ?? img.height;

            const dw = sourceW * scale;
            const dh = sourceH * scale;

            ctx.drawImage(img, dx, dy, dw, dh);
        };
    }

    useEffect(() => {
        if (!socket) return;

        const frame = ({ data, fw, fh }: { data: ArrayBuffer, fw: number, fh: number }) => {
            lastFullFrameRef.current = { data, fw, fh };
            draw(data, 0, 0, fw, fh);
        };

        const diff = ({ data, x, y, w, h, fw, fh }: { data: ArrayBuffer, x: number, y: number, w: number, h: number, fw: number, fh: number }) => draw(data, x, y, fw, fh, w, h);

        socket.on("scrsh_frame", frame);
        socket.on("scrsh_framediff", diff);

        return () => {
            socket.off("scrsh_frame", frame);
            socket.off("scrsh_framediff", diff);
        };
    }, [socket]);


    useEffect(() => {
        function resizeCanvas() {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const { width, height } = Dimensions.get("window");
            const dpr = window.devicePixelRatio || 1;

            preserveAndResize(canvas, width, height, dpr);
        }

        resizeCanvas();

        const sub = Dimensions.addEventListener("change", resizeCanvas);
        return () => sub.remove();
    }, []);


    useEffect(() => {
        if (!targetID || !isSocketConnected) return;
        socket?.emit("scrsh_start", { targetID });
        console.log("sent scrsh start for ", targetID);
        return () => {socket?.emit("scrsh_stop", { targetID })};
    }, []);

    return (
        <View style={{
            flex: 1,
            paddingTop: statusBarHeight,
            backgroundColor: colors.BACKGROUND,
        }}>
            <canvas ref={canvasRef}></canvas>
        </View>
    );
};
