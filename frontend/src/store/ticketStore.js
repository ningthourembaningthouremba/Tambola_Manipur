import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_NODE_ENV == "development" 
? "http://localhost:5000" 
: import.meta.env.VITE_API_URL;


axios.defaults.withCredentials = true;

export const useTicketStore = create((set) => ({

	generatedTickets: [],
	ticketsDetails: [],
	error: null,
	isLoading: false,
	message: null, 
	success: false,
 
	generateTickets: async (numOfTickets) => {
		set({ isLoading: true, error: null, generatedTickets: [] });
		if (numOfTickets <= 0 || !numOfTickets || numOfTickets > 6) {
			set({ error: "Please enter between 1 to 6 only.", generatedTickets: [], isLoading: false });
			return;
		}
		try {
			const response = await axios.get(`${API_URL}/api/ticket/generate?numOfTickets=${numOfTickets}`);
			set({ message: response.data.message, generatedTickets: response.data.tickets, isLoading: false });
			
		} catch (error) {
			set({ error: error.response.data.message || "Error generate tickets", isLoading: false });
			throw error;
		}
	},


	bookingTickets: async (gameID, name, phone, email, tickets) => {
		set({ isLoading: true, error: null });
		if (!gameID || !name || !phone || !tickets) {
			set({ error: "Missing required fields", isLoading: false });
			return;
		}
		if (tickets.length <= 0 ) {
			set({ error: "Please generate tickets.", isLoading: false });
			return;
		}
		try {
			const emailInput = email || null;
			const response = await axios.post(`${API_URL}/api/ticket/booking`, { gameID, name, phone, tickets, email: emailInput });

			set({ isLoading: false, generatedTickets: [] });
			return response.data;
		} catch (error) {
			set({ error: error.response.data.message || "Error on booking tickets", isLoading: false });
			throw error;
		}
	},


	viewTickets: async (playerID) => {
		if (!playerID) {
			set({ error: "Enter your ID.", success: false });
			return;
		}
		set({ isLoading: true, error: null });

		try {
			const response = await axios.get(`${API_URL}/api/ticket/view?playerID=${playerID}`);

			set({ ticketsDetails: response.data.ticketsDetails, isLoading: false });
		} catch (error) {
			set({ error: error.response.data.message || "Viewing tickets error", isLoading: false });
			throw error;
		}
	},

	
	// Admin verification
	// isAdminCheck: async () => {
	// 	set({ isLoading: true, error: null });
	// 	try {
	// 		const response = await axios.get(`${API_URL}/api/ticket/isAdminCheck`);
      
	// 		set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
	// 	} catch (error) {
  //     set({ error: null, isCheckingAuth: false, isAuthenticated: false });
	// 	}
	// },


}));



