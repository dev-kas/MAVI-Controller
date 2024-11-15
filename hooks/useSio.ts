import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

import * as misc from "@/constants/Misc";

let socket: Socket | null = null;

export default function useSio() {
    const [isConnected, setIsConnected] = useState(socket?.connected);
    // const socket = getSocket();

    if (!socket) {
        socket = io(misc.SERVER_URL, {
            transports: ["websocket"],
            query: { type: "client" },
            extraHeaders: { type: "client" },
        });
    }

    useEffect(() => {
        const handleConnect = () => {
            console.log("Connected to MAVI-Server");
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            console.log("Disconnected from MAVI-Server");
            setIsConnected(false);
        };

        const handleError = (error: any) => {
            console.log("Socket error:", error);
        };

        socket?.on("connect", handleConnect);
        socket?.on("disconnect", handleDisconnect);
        socket?.on("error", handleError);

        return () => {
            // socket?.removeAllListeners()
        };
    }, [ socket ]);

    return { socket, isConnected };
}
