// src/socket.js
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_NODE_ENV == "development" 
? "http://localhost:5000" 
: import.meta.env.VITE_API_URL;

const socket = io(API_URL, { withCredentials: true, transports: ["websocket"] }); // your backend URL

export default socket;
