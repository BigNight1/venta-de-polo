import React, { createContext, useContext } from 'react';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Podríamos añadir aquí una instancia de Axios o funciones fetch pre-configuradas en el futuro.
    const api = {
        backendUrl,
    };

    return (
        <ApiContext.Provider value={api}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => {
    const context = useContext(ApiContext);
    if (context === undefined) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
}; 