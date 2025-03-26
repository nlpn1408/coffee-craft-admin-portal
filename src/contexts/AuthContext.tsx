// import React, { useContext, useState } from "react";
// import { useQuery } from "react-query";
// import * as apiClient from "../api-client";
// import { loadStripe, Stripe } from "@stripe/stripe-js";


// type ToastMessage = {
//   message: string;
//   type: "SUCCESS" | "ERROR";
// };

// type AppContext = {
//   showToast: (toastMessage: ToastMessage) => void;
//   isLoggedIn: boolean;
// };

// const AppContext = React.createContext<AppContext | undefined>(undefined);


// export const AppContextProvider = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const [toast, setToast] = useState<ToastMessage | undefined>(undefined);

//   const { isError } = useQuery("validateToken", apiClient.validateToken, {
//     retry: false,
//   });

//   return (
//     <AppContext.Provider
//       value={{
//         showToast: (toastMessage) => {
//           setToast(toastMessage);
//         },
//         isLoggedIn: !isError,
//       }}
//     >
//       {toast && (
        
//       )}
//       {children}
//     </AppContext.Provider>
//   );
// };

// export const useAppContext = () => {
//   const context = useContext(AppContext);
//   return context as AppContext;
// };
